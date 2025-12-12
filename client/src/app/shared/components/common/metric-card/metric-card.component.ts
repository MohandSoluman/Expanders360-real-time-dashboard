import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export interface MetricCardBadge {
  text: string;
  color?: "green" | "red" | "yellow" | "blue" | "gray";
}

@Component({
  selector: "app-metric-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./metric-card.component.html",
  styleUrls: ["./metric-card.component.css"],
})
export class MetricCardComponent {
  @Input({ required: true }) value!: string | number;
  @Input({ required: true }) label!: string;
  @Input({ required: true }) iconPath!: string;
  @Input() badge?: MetricCardBadge;
  @Input() loading: boolean = false;

  get badgeColorClass(): string {
    if (!this.badge?.color) return "text-gray-500";

    const colors: Record<string, string> = {
      green: "text-green-500",
      red: "text-red-500",
      yellow: "text-yellow-500",
      blue: "text-blue-500",
      gray: "text-gray-500",
    };

    return colors[this.badge.color];
  }
}
