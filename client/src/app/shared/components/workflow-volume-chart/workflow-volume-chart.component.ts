import { Component, computed, inject, signal, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgApexchartsModule, ChartComponent, ApexOptions } from "ng-apexcharts";
import {
  DashboardStore,
  VolumeMetric,
} from "../../../core/store/dashboard.store";

@Component({
  selector: "app-workflow-volume-chart",
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div
      class="col-span-12 rounded-2xl border border-gray-200 bg-white px-5 pt-7.5 pb-5 shadow-theme-sm dark:border-gray-800 dark:bg-white/[0.03] sm:px-7.5"
    >
      <div
        class="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap"
      >
        <div class="flex flex-wrap gap-3 sm:gap-5">
          <div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-white/90">
              Workflow Volume & Completion
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Total volume vs completion rate
            </p>
          </div>
        </div>
        <div class="flex w-full max-w-45 justify-end">
          <div
            class="inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-900 p-1.5"
          >
            <button
              *ngFor="let filter of ['6h', '12h', '24h']"
              (click)="activeFilter.set(filter)"
              class="rounded py-1 px-3 text-xs font-medium transition-all hover:bg-white hover:shadow-card dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-white"
              [ngClass]="{
                'bg-white shadow-card text-gray-800 dark:bg-gray-800 dark:text-white':
                  activeFilter() === filter,
                'text-gray-500': activeFilter() !== filter
              }"
            >
              {{ filter }}
            </button>
          </div>
        </div>
      </div>

      <div class="mb-2">
        <div id="volumeChart" class="-ml-5">
          <apx-chart
            [series]="chartOptions().series!"
            [chart]="chartOptions().chart!"
            [colors]="chartOptions().colors!"
            [plotOptions]="chartOptions().plotOptions!"
            [stroke]="chartOptions().stroke!"
            [xaxis]="chartOptions().xaxis!"
            [yaxis]="chartOptions().yaxis!"
            [fill]="chartOptions().fill!"
            [tooltip]="chartOptions().tooltip!"
            [grid]="chartOptions().grid!"
            [legend]="chartOptions().legend!"
            [dataLabels]="chartOptions().dataLabels!"
          ></apx-chart>
        </div>
      </div>
    </div>
  `,
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
        toolbar: { show: false },
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
        theme: "dark", // Force dark theme for tooltip or make it dynamic if needed
      },
    };
  });
}
