import { Component, computed, inject, signal, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgApexchartsModule, ChartComponent, ApexOptions } from "ng-apexcharts";
import { DashboardStore } from "../../../core/store/dashboard.store";
import { VolumeMetric } from "../../../core/store/event.models";

@Component({
  selector: "app-workflow-volume-chart",
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: "./workflow-volume-chart.component.html",
})
export class WorkflowVolumeChartComponent {
  store = inject(DashboardStore);
  activeFilter = signal<string>("24h");

  // Filtered Data based on selection
  readonly filteredData = computed(() => {
    const history = this.store.volumeHistory();
    const filter = this.activeFilter();
    let count = 24;
    if (filter === "6h") count = 6;
    if (filter === "12h") count = 12;

    return history.slice(-count);
  });

  readonly chartOptions = computed<Partial<ApexOptions>>(() => {
    const data = this.filteredData();
    const categories = data.map((d: VolumeMetric) => d.hourDisplay);
    const volumes = data.map((d: VolumeMetric) => d.volume);
    const rates = data.map((d: VolumeMetric) => d.completionRate);

    return {
      series: [
        {
          name: "Workflow Volume",
          type: "column",
          data: volumes,
        },
        {
          name: "Completion Rate",
          type: "line",
          data: rates,
        },
      ],
      chart: {
        height: 350,
        type: "line",
        toolbar: { show: true },
        fontFamily: "Inter, sans-serif",
      },
      plotOptions: {
        bar: {
          columnWidth: "40%",
          borderRadius: 4,
        },
      },
      dataLabels: { enabled: false },
      stroke: {
        width: [0, 4],
        curve: "smooth",
      },
      xaxis: {
        categories: categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: "#64748b",
            fontSize: "12px",
          },
        },
      },
      yaxis: [
        {
          title: { text: "Volume" },
          labels: { style: { colors: "#64748b" } },
        },
        {
          opposite: true,
          title: { text: "Completion %" },
          max: 100,
          labels: { style: { colors: "#64748b" } },
        },
      ],
      legend: {
        position: "top",
        horizontalAlign: "left",
        fontFamily: "Inter",
        itemMargin: { horizontal: 10, vertical: 0 },
      },
      colors: ["#3C50E0", "#10B981"], // Primary Blue, Success Green
      grid: {
        borderColor: "#e2e8f0",
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
      },
      tooltip: {
        theme: "light",
      },
    };
  });
}
