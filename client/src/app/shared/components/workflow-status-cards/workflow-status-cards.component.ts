import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DashboardStore } from "../../../core/store/dashboard.store";
import { MetricCardComponent } from "../common/metric-card/metric-card.component";
import { METRIC_ICONS } from "../common/metric-card/constatns/metric-icons";

@Component({
  selector: "app-workflow-status-cards",
  standalone: true,
  imports: [CommonModule, MetricCardComponent],
  templateUrl: "./workflow-status-cards.component.html",
})
export class WorkflowStatusCardsComponent {
  store = inject(DashboardStore);
  icons = METRIC_ICONS;
}
