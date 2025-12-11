import { Component, inject, computed, signal } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { DashboardStore, Anomaly } from "../../../core/store/dashboard.store";

@Component({
  selector: "app-anomaly-heatmap",
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div
      class="w-full bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-theme-sm"
    >
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="font-bold text-gray-800 dark:text-white/90 text-lg">
            Anomaly Heatmap (Last 24h)
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Distribution of anomalies by hour and severity
          </p>
        </div>
      </div>

      <div class="grid grid-cols-[auto_1fr] gap-4">
        <!-- Y-Axis Labels (Severity) -->
        <div
          class="flex flex-col justify-around text-xs font-medium text-gray-500 dark:text-gray-400 h-48 py-2"
        >
          <button
            (click)="toggleSeverity('high')"
            class="flex items-center gap-2 transition-opacity hover:opacity-80"
            [class.opacity-40]="!isSeverityVisible('high')"
          >
            <span class="w-2 h-2 rounded-full bg-red-500"></span> High
          </button>

          <button
            (click)="toggleSeverity('medium')"
            class="flex items-center gap-2 transition-opacity hover:opacity-80"
            [class.opacity-40]="!isSeverityVisible('medium')"
          >
            <span class="w-2 h-2 rounded-full bg-yellow-500"></span> Medium
          </button>

          <button
            (click)="toggleSeverity('low')"
            class="flex items-center gap-2 transition-opacity hover:opacity-80"
            [class.opacity-40]="!isSeverityVisible('low')"
          >
            <span class="w-2 h-2 rounded-full bg-blue-400"></span> Low
          </button>
        </div>

        <!-- Heatmap Grid -->
        <div class="relative overflow-x-auto pb-2">
          <div class="min-w-[600px] h-48 grid grid-rows-3 gap-1">
            <!-- High Severity Row -->
            <div class="grid grid-cols-24 gap-1">
              <div
                *ngFor="let hour of hours"
                (click)="selectCell(hour, 'high')"
                class="rounded-sm cursor-pointer transition-all hover:scale-110 relative group"
                [ngClass]="getCellClass(hour, 'high')"
              >
                <!-- Tooltip (Simple Hover) -->
                <div
                  *ngIf="getCount(hour, 'high') > 0"
                  class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20 bg-black text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap"
                >
                  {{ getCount(hour, "high") }} Anomalies
                </div>
              </div>
            </div>

            <!-- Medium Severity Row -->
            <div class="grid grid-cols-24 gap-1">
              <div
                *ngFor="let hour of hours"
                (click)="selectCell(hour, 'medium')"
                class="rounded-sm cursor-pointer transition-all hover:scale-110 relative group"
                [ngClass]="getCellClass(hour, 'medium')"
              >
                <div
                  *ngIf="getCount(hour, 'medium') > 0"
                  class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20 bg-black text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap"
                >
                  {{ getCount(hour, "medium") }} Anomalies
                </div>
              </div>
            </div>

            <!-- Low Severity Row -->
            <div class="grid grid-cols-24 gap-1">
              <div
                *ngFor="let hour of hours"
                (click)="selectCell(hour, 'low')"
                class="rounded-sm cursor-pointer transition-all hover:scale-110 relative group"
                [ngClass]="getCellClass(hour, 'low')"
              >
                <div
                  *ngIf="getCount(hour, 'low') > 0"
                  class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20 bg-black text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap"
                >
                  {{ getCount(hour, "low") }} Anomalies
                </div>
              </div>
            </div>
          </div>

          <!-- X-Axis Labels (Hours) -->
          <div class="min-w-[600px] grid grid-cols-24 gap-1 mt-2">
            <span
              *ngFor="let hour of hours; let i = index"
              class="text-[10px] text-gray-400 text-center"
            >
              {{ i % 4 === 0 ? hour + "h" : "" }}
            </span>
          </div>
        </div>
      </div>

      <!-- Details Panel (Conditional) -->
      <div
        *ngIf="selectedAnomalies().length > 0"
        class="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4 animate-in fade-in slide-in-from-top-4"
      >
        <div class="flex justify-between items-center mb-3">
          <h4 class="text-sm font-semibold text-gray-800 dark:text-white">
            Details: {{ selectedLabel() }}
          </h4>
          <button
            (click)="clearSelection()"
            class="text-xs text-gray-500 hover:text-primary"
          >
            Close
          </button>
        </div>
        <div class="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
          <div
            *ngFor="let anomaly of selectedAnomalies()"
            class="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-white/[0.05]"
          >
            <span class="text-xs text-gray-600 dark:text-gray-300">{{
              anomaly.message
            }}</span>
            <span class="text-[10px] text-gray-400">{{
              anomaly.timestamp | date : "mediumTime"
            }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AnomalyHeatmapComponent {
  store = inject(DashboardStore);

  // 0-23 hours
  readonly hours = Array.from({ length: 24 }, (_, i) => i);

  // Selected state
  readonly selectedData = signal<{ hour: number; severity: string } | null>(
    null
  );

  readonly visibleSeverities = signal<string[]>(["high", "medium", "low"]);

  toggleSeverity(severity: string) {
    this.visibleSeverities.update((params) => {
      if (params.includes(severity)) {
        return params.filter((s) => s !== severity);
      }
      return [...params, severity];
    });
  }

  isSeverityVisible(severity: string): boolean {
    return this.visibleSeverities().includes(severity);
  }

  // Compute heatmap data: Map<"hour-severity", count>
  readonly heatmapData = computed(() => {
    const data = new Map<string, number>();
    const anomalies = this.store.anomalies();

    // We filter at the getCount level for visualization,
    // but we could also filter here if we wanted to remove them entirely from calculations
    anomalies.forEach((a) => {
      const hour = a.timestamp.getHours();
      const key = `${hour}-${a.severity}`;
      data.set(key, (data.get(key) || 0) + 1);
    });
    return data;
  });

  // Get count for a specific cell
  getCount(hour: number, severity: string): number {
    if (!this.isSeverityVisible(severity)) return 0;
    return this.heatmapData().get(`${hour}-${severity}`) || 0;
  }

  // Determine cell styling
  getCellClass(hour: number, severity: string): string {
    const count = this.getCount(hour, severity);
    const base =
      "h-full w-full rounded-sm transition-colors duration-200 border border-transparent";

    if (count === 0)
      return `${base} bg-gray-50 dark:bg-white/[0.02] hover:border-gray-200 dark:hover:border-gray-700`;

    // Intensity levels
    if (severity === "high") {
      return count > 2
        ? `${base} bg-red-600 dark:bg-red-600`
        : `${base} bg-red-500/50 dark:bg-red-500/40`;
    }
    if (severity === "medium") {
      return count > 2
        ? `${base} bg-yellow-500 dark:bg-yellow-500`
        : `${base} bg-yellow-500/50 dark:bg-yellow-500/40`;
    }
    // Low
    return count > 2
      ? `${base} bg-blue-500 dark:bg-blue-500`
      : `${base} bg-blue-500/50 dark:bg-blue-500/40`;
  }

  // Selection Logic
  selectCell(hour: number, severity: string) {
    if (this.getCount(hour, severity) > 0) {
      this.selectedData.set({ hour, severity });
    }
  }

  clearSelection() {
    this.selectedData.set(null);
  }

  // Filtered list based on selection
  readonly selectedAnomalies = computed(() => {
    const selection = this.selectedData();
    if (!selection) return [];

    return this.store
      .anomalies()
      .filter(
        (a) =>
          a.timestamp.getHours() === selection.hour &&
          a.severity === selection.severity
      );
  });

  readonly selectedLabel = computed(() => {
    const s = this.selectedData();
    if (!s) return "";
    return `${s.severity.toUpperCase()} Severity @ ${s.hour}:00`;
  });
}
