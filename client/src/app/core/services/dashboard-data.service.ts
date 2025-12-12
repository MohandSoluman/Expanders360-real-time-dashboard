import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiService } from "./api.service";
import { TimelineEvent, Anomaly, VolumeMetric } from "../store/event.models";

@Injectable({
  providedIn: "root",
})
export class DashboardDataService {
  private api = inject(ApiService);

  getTimelineEvents(): Observable<TimelineEvent[]> {
    return this.api.get<any[]>("stats/timeline").pipe(
      map((events) =>
        events
          .map((e) => ({
            id: e.id,
            title: e.type,
            timestamp: new Date(e.timestamp),
            status: this.mapStatus(e.type),
            description: `Event type: ${e.type}`,
          }))
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      )
    );
  }

  getAnomalies(): Observable<Anomaly[]> {
    return this.api.get<any[]>("stats/anomalies").pipe(
      map((anomalies) =>
        anomalies.map((a) => ({
          id: a.id,
          severity: a.severity.toLowerCase(),
          message: `${a.type} detected`,
          timestamp: new Date(a.timestamp),
        }))
      )
    );
  }

  getOverviewStats(): Observable<any> {
    return this.api.get<any>("stats/overview");
  }

  getVolumeHistory(): Observable<VolumeMetric[]> {
    return this.api.get<VolumeMetric[]>("stats/volume");
  }

  private mapStatus(type: string): "completed" | "pending" | "anomaly" {
    const lower = type.toLowerCase();
    if (lower.includes("error") || lower.includes("breach")) return "anomaly";
    if (lower.includes("review") || lower.includes("intake")) return "pending";
    return "completed";
  }
}
