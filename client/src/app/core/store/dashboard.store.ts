import { Injectable, signal, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import io from "socket.io-client";
import { ToastService } from "../../shared/services/toast.service";

export interface TimelineEvent {
  id: string;
  title: string;
  timestamp: Date;
  status: "completed" | "pending" | "anomaly";
  description?: string;
}

export interface Metrics {
  activeUsers: number;
  transactionsPerSecond: number;
  errorRate: number;
  systemHealth: number; // 0-100
  slaCompliance: number; // Percentage
  averageCycleTime: string; // e.g. "12m 30s"
  totalWorkflows: number;
}

export interface Anomaly {
  id: string;
  severity: "low" | "medium" | "high";
  message: string;
  timestamp: Date;
}

export interface VolumeMetric {
  timestamp: number;
  hourDisplay: string;
  volume: number;
  completionRate: number;
}

@Injectable({
  providedIn: "root",
})
export class DashboardStore {
  // Signals
  readonly events = signal<TimelineEvent[]>([]);
  readonly metrics = signal<Metrics>({
    activeUsers: 0,
    transactionsPerSecond: 0,
    errorRate: 0,
    systemHealth: 100,
    slaCompliance: 100,
    averageCycleTime: "0m 0s",
    totalWorkflows: 0,
  });
  readonly anomalies = signal<Anomaly[]>([]);
  readonly volumeHistory = signal<VolumeMetric[]>([]);
  readonly isPaused = signal<boolean>(false);
  readonly isLoading = signal<boolean>(true);

  // Computed
  readonly eventCount = computed(() => this.events().length);
  readonly hasCriticalAnomalies = computed(() =>
    this.anomalies().some((a) => a.severity === "high")
  );

  private socket: any;
  private toastService = inject(ToastService);

  constructor() {
    this.initData();
    this.connectWebSocket();
  }

  toggleSimulation() {
    this.isPaused.update((v) => !v);
  }

  private async initData() {
    // 0. Load from cache first
    this.loadFromCache();

    try {
      // 1. Fetch initial timeline events
      const timelineRes = await fetch("http://localhost:3000/stats/timeline");
      const timelineData = await timelineRes.json();

      const mappedEvents: TimelineEvent[] = timelineData.map((e: any) => ({
        id: e.id,
        title: e.type,
        timestamp: new Date(e.timestamp),
        status: this.mapStatus(e.type),
        description: `Event type: ${e.type}`,
      }));
      this.events.set(mappedEvents);
      this.saveToCache("rules_events", mappedEvents);

      // 2. Fetch initial anomalies
      const anomaliesRes = await fetch("http://localhost:3000/stats/anomalies");
      const anomaliesData = await anomaliesRes.json();

      const mappedAnomalies: Anomaly[] = anomaliesData.map((a: any) => ({
        id: a.id,
        severity: a.severity.toLowerCase(),
        message: `${a.type} detected`,
        timestamp: new Date(a.timestamp),
      }));
      this.anomalies.set(mappedAnomalies);
      this.saveToCache("rules_anomalies", mappedAnomalies);

      // 3. Fetch initial overview stats
      const statsRes = await fetch("http://localhost:3000/stats/overview");
      const statsData = await statsRes.json();

      this.updateMetrics({
        totalWorkflows: statsData.totalWorkflowsToday,
        averageCycleTime: `${statsData.averageCycleTime}m`,
        slaCompliance: statsData.slaCompliance,
        // Keep other metrics as calculated/defaults for now since server doesn't provide them
      });

      // 4. Fetch initial volume history
      const volumeRes = await fetch("http://localhost:3000/stats/volume");
      const volumeData: VolumeMetric[] = await volumeRes.json();
      this.volumeHistory.set(volumeData);
      this.saveToCache("rules_volume", volumeData);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private loadFromCache() {
    try {
      const cachedEvents = localStorage.getItem("rules_events");
      if (cachedEvents) {
        this.events.set(JSON.parse(cachedEvents));
      }

      const cachedAnomalies = localStorage.getItem("rules_anomalies");
      if (cachedAnomalies) {
        this.anomalies.set(JSON.parse(cachedAnomalies));
      }

      const cachedVolume = localStorage.getItem("rules_volume");
      if (cachedVolume) {
        this.volumeHistory.set(JSON.parse(cachedVolume));
      }
    } catch (error) {
      console.warn("Failed to load or parse data from cache:", error);
      // If cache is corrupt, we can either clear it or just ignore it.
      // For now, ignoring it ensures we just fetch fresh data.
    }
  }

  private saveToCache(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save to local storage", e);
    }
  }

  private connectWebSocket() {
    this.socket = io("http://localhost:3000");

    this.socket.on("connect", () => {
      console.log("Connected to server");
    });

    this.socket.on("new-event", (event: any) => {
      if (this.isPaused()) return;

      const newEvent: TimelineEvent = {
        id: event.id,
        title: event.type,
        timestamp: new Date(event.timestamp),
        status: this.mapStatus(event.type),
        description: `Real-time event: ${event.type}`,
      };

      this.addEvent(newEvent);

      // Toast notification for new event
      this.toastService.show(`New Event: ${event.type}`, "info");
    });

    this.socket.on("new-anomaly", (event: any) => {
      // Always show anomaly toasts even if paused? Or respect pause?
      // Requirement says "Real-time toast notifications", usually implies respecting stream flow.
      // But anomalies might be critical. Let's respect pause for consistency with other updates,
      // or maybe show them anyway? Let's respect pause for now to allow "silence".
      if (this.isPaused()) return;

      const anomaly: Anomaly = {
        id: event.id,
        severity: event.severity.toLowerCase(), // Server sends 'High', Client expects 'high'
        message: `${event.type} detected`,
        timestamp: new Date(event.timestamp),
      };

      this.addAnomaly(anomaly);

      // Also add to timeline as anomaly
      const newEvent: TimelineEvent = {
        id: event.id,
        title: event.type,
        timestamp: new Date(event.timestamp),
        status: "anomaly",
        description: `Anomaly detected: ${event.type}`,
      };
      this.addEvent(newEvent);

      // Toast notification for anomaly
      this.toastService.show(`Anomaly Detected: ${event.type}`, "error", 5000);
    });

    this.socket.on("simulated-error", (error: any) => {
      this.toastService.show(`Backend Error: ${error.message}`, "error", 5000);
    });

    this.socket.on("stats-update", (stats: any) => {
      if (this.isPaused()) return;
      this.updateMetrics({
        totalWorkflows: stats.totalWorkflowsToday,
        averageCycleTime: `${stats.averageCycleTime}m`,
        slaCompliance: stats.slaCompliance,
      });
    });

    this.socket.on("volume-update", (updatedVolume: VolumeMetric) => {
      if (this.isPaused()) return;

      this.volumeHistory.update((history) => {
        let newHistory;
        const index = history.findIndex(
          (h) => h.hourDisplay === updatedVolume.hourDisplay
        );
        if (index !== -1) {
          // Update existing hour
          newHistory = [...history];
          newHistory[index] = updatedVolume;
        } else {
          // Add new hour, maintain 24h window
          newHistory = [...history, updatedVolume];
          if (newHistory.length > 24) newHistory.shift();
        }
        this.saveToCache("rules_volume", newHistory);
        return newHistory;
      });
    });
  }

  private mapStatus(type: string): "completed" | "pending" | "anomaly" {
    const lower = type.toLowerCase();
    if (lower.includes("error") || lower.includes("breach")) return "anomaly";
    if (lower.includes("review") || lower.includes("intake")) return "pending";
    return "completed";
  }

  addEvent(event: TimelineEvent) {
    this.events.update((events) => {
      const newEvents = [event, ...events];
      this.saveToCache("rules_events", newEvents);
      return newEvents;
    }); // Prepend new events
  }

  addAnomaly(anomaly: Anomaly) {
    this.anomalies.update((anomalies) => {
      const newAnomalies = [anomaly, ...anomalies];
      this.saveToCache("rules_anomalies", newAnomalies);
      return newAnomalies;
    });
  }

  updateMetrics(newMetrics: Partial<Metrics>) {
    this.metrics.update((current) => ({ ...current, ...newMetrics }));
  }
}
