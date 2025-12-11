import { Injectable, signal, computed } from "@angular/core";
import io from "socket.io-client";

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

  // Computed
  readonly eventCount = computed(() => this.events().length);
  readonly hasCriticalAnomalies = computed(() =>
    this.anomalies().some((a) => a.severity === "high")
  );

  private socket: any;

  constructor() {
    this.initData();
    this.connectWebSocket();
  }

  toggleSimulation() {
    this.isPaused.update((v) => !v);
  }

  private async initData() {
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
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
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
    });

    this.socket.on("new-anomaly", (event: any) => {
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
        const index = history.findIndex(
          (h) => h.hourDisplay === updatedVolume.hourDisplay
        );
        if (index !== -1) {
          // Update existing hour
          const newHistory = [...history];
          newHistory[index] = updatedVolume;
          return newHistory;
        } else {
          // Add new hour, maintain 24h window
          const newHistory = [...history, updatedVolume];
          if (newHistory.length > 24) newHistory.shift();
          return newHistory;
        }
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
    this.events.update((events) => [event, ...events]); // Prepend new events
  }

  addAnomaly(anomaly: Anomaly) {
    this.anomalies.update((anomalies) => [anomaly, ...anomalies]);
  }

  updateMetrics(newMetrics: Partial<Metrics>) {
    this.metrics.update((current) => ({ ...current, ...newMetrics }));
  }
}
