import { Component, inject, computed, signal } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { DashboardStore } from "../../../core/store/dashboard.store";
import { SkeletonLoaderComponent } from "../skeleton-loader/skeleton-loader.component";

@Component({
  selector: "app-anomaly-heatmap",
  standalone: true,
  imports: [CommonModule, DatePipe, SkeletonLoaderComponent],
  templateUrl: "./anomaly-heatmap.component.html",
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
