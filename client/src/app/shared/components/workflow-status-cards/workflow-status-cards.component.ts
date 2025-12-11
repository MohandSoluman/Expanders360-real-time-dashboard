import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DashboardStore } from "../../../core/store/dashboard.store";

@Component({
  selector: "app-workflow-status-cards",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5"
    >
      <!-- Card Item Start -->
      <div
        class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm"
      >
        <div
          class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900 text-primary"
        >
          <svg
            class="fill-current w-6 h-6 text-gray-800 dark:text-white/90"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
            />
          </svg>
        </div>
        <div class="mt-4 flex items-end justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">
              {{ store.metrics().slaCompliance }}%
            </h4>
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400"
              >SLA Compliance</span
            >
          </div>
          <span class="flex items-center gap-1 text-sm font-medium text-meta-3">
            <span class="text-green-500">99% target</span>
          </span>
        </div>
      </div>
      <!-- Card Item End -->

      <!-- Card Item Start -->
      <div
        class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm"
      >
        <div
          class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900"
        >
          <svg
            class="fill-current w-6 h-6 text-gray-800 dark:text-white/90"
            viewBox="0 0 24 24"
          >
            <path
              d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
            />
          </svg>
        </div>
        <div class="mt-4 flex items-end justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">
              {{ store.metrics().averageCycleTime }}
            </h4>
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400"
              >Cycle Time</span
            >
          </div>
        </div>
      </div>
      <!-- Card Item End -->

      <!-- Card Item Start -->
      <div
        class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm"
      >
        <div
          class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900"
        >
          <svg
            class="fill-current w-6 h-6 text-gray-800 dark:text-white/90"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            />
          </svg>
        </div>
        <div class="mt-4 flex items-end justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">
              {{ store.anomalies().length }}
            </h4>
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400"
              >Active Anomalies</span
            >
          </div>
          <span class="flex items-center gap-1 text-sm font-medium text-meta-3">
            <span class="text-red-500">Attention needed</span>
          </span>
        </div>
      </div>
      <!-- Card Item End -->

      <!-- Card Item Start -->
      <div
        class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm"
      >
        <div
          class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900"
        >
          <svg
            class="fill-current w-6 h-6 text-gray-800 dark:text-white/90"
            viewBox="0 0 24 24"
          >
            <path
              d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
            />
          </svg>
        </div>
        <div class="mt-4 flex items-end justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">
              {{ store.metrics().totalWorkflows }}
            </h4>
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400"
              >Total Workflows</span
            >
          </div>
        </div>
      </div>
      <!-- Card Item End -->
    </div>
  `,
})
export class WorkflowStatusCardsComponent {
  store = inject(DashboardStore);
}
