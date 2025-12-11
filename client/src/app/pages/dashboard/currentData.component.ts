import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DashboardStore } from "../../core/store/dashboard.store";
import { EventTimelineComponent } from "../../shared/components/event-timeline/event-timeline.component";
import { WorkflowStatusCardsComponent } from "../../shared/components/workflow-status-cards/workflow-status-cards.component";
import { AnomalyHeatmapComponent } from "../../shared/components/anomaly-heatmap/anomaly-heatmap.component";
import { WorkflowVolumeChartComponent } from "../../shared/components/workflow-volume-chart/workflow-volume-chart.component";

@Component({
  selector: "app-current-data",
  imports: [
    CommonModule,
    EventTimelineComponent,
    WorkflowStatusCardsComponent,
    AnomalyHeatmapComponent,
    WorkflowVolumeChartComponent,
  ],
  templateUrl: "./currentData.component.html",
})
export class CurrentDataComponent {
  store = inject(DashboardStore);
}
