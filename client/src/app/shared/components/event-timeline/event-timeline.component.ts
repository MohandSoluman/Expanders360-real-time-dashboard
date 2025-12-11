import {
  Component,
  ElementRef,
  ViewChild,
  effect,
  inject,
  signal,
  computed,
} from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import {
  DashboardStore,
  TimelineEvent,
} from "../../../core/store/dashboard.store";
import { SkeletonLoaderComponent } from "../skeleton-loader/skeleton-loader.component";

@Component({
  selector: "app-event-timeline",
  standalone: true,
  imports: [CommonModule, SkeletonLoaderComponent],
  providers: [DatePipe],
  template: `
    <div
      class="w-full bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-theme-sm"
      role="region"
      aria-label="Event Timeline Visualization"
    >
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3"
      >
        <h3 class="font-bold text-gray-800 dark:text-white/90 text-lg">
          Real-Time Event Timeline
        </h3>
        <div
          class="flex gap-2 p-1 bg-gray-50 dark:bg-gray-900 rounded-lg"
          role="group"
          aria-label="Event Status Filters"
        >
          <button
            *ngFor="let filter of filters"
            (click)="currentFilter.set(filter.value)"
            class="px-3 py-1 text-xs font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary"
            [ngClass]="{
              'bg-white shadow-sm text-gray-900 dark:bg-gray-800 dark:text-white':
                currentFilter() === filter.value,
              'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300':
                currentFilter() !== filter.value
            }"
            [attr.aria-pressed]="currentFilter() === filter.value"
            [attr.aria-label]="'Filter events by ' + filter.label"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div
        *ngIf="store.isLoading()"
        class="flex gap-4 overflow-hidden pt-10 pb-4"
      >
        <div
          *ngFor="let i of [1, 2, 3, 4, 5]"
          class="flex flex-col items-center gap-2"
        >
          <app-skeleton-loader
            width="80px"
            height="20px"
            borderRadius="4px"
          ></app-skeleton-loader>
          <app-skeleton-loader
            width="24px"
            height="24px"
            borderRadius="50%"
          ></app-skeleton-loader>
          <app-skeleton-loader
            width="100px"
            height="16px"
            borderRadius="4px"
          ></app-skeleton-loader>
        </div>
      </div>

      <!-- Content State -->
      <div
        *ngIf="!store.isLoading()"
        #scrollContainer
        class="overflow-x-auto pb-4 custom-scrollbar"
        tabindex="0"
        aria-label="Scrollable timeline of events"
      >
        <div
          class="flex items-center min-w-full gap-4 px-2 pt-20 relative"
          style="min-height: 100px;"
          role="list"
        >
          <!-- Connecting Line -->
          <div
            class="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -z-1"
            aria-hidden="true"
          ></div>

          <div
            *ngFor="let event of filteredEvents()"
            class="flex flex-col items-center flex-shrink-0 w-32 relative group cursor-pointer transition-transform hover:scale-105 focus-within:scale-105"
            role="listitem"
            tabindex="0"
            (keydown.enter)="focusEvent(event)"
          >
            <!-- Timestamp -->
            <span
              class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2"
              >{{ event.timestamp | date : "HH:mm:ss" }}</span
            >

            <!-- Marker -->
            <div
              class="w-6 h-6 rounded-full border-2 bg-white dark:bg-gray-900 z-10 flex items-center justify-center shadow-sm transition-colors"
              [ngClass]="{
                'border-green-500': event.status === 'completed',
                'border-yellow-500': event.status === 'pending',
                'border-red-500': event.status === 'anomaly'
              }"
              aria-hidden="true"
            >
              <div
                class="w-2.5 h-2.5 rounded-full"
                [ngClass]="{
                  'bg-green-500': event.status === 'completed',
                  'bg-yellow-500': event.status === 'pending',
                  'bg-red-500': event.status === 'anomaly'
                }"
              ></div>
            </div>

            <!-- Title & Tooltip -->
            <span
              class="text-xs font-semibold mt-2 text-center truncate w-full px-1 text-gray-700 dark:text-gray-300"
              >{{ event.title }}</span
            >

            <!-- Tooltip -->
            <div
              class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 group-focus:-translate-y-1 pointer-events-none z-20 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-left rounded-lg p-3 shadow-xl drop-shadow-2xl"
              role="tooltip"
            >
              <p
                class="font-semibold text-sm text-gray-900 dark:text-white mb-1"
              >
                {{ event.title }}
              </p>
              <p
                class="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed"
              >
                {{ event.description }}
              </p>
              <div
                class="flex items-center gap-1 text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-3 h-3"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                {{ event.timestamp | date : "medium" }}
              </div>

              <!-- Arrow -->
              <div
                class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-900 border-b border-r border-gray-200 dark:border-gray-800 rotate-45"
              ></div>
            </div>
          </div>

          <!-- End Spacer -->
          <div class="w-4 flex-shrink-0"></div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .custom-scrollbar::-webkit-scrollbar {
        height: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #e2e8f0;
        border-radius: 20px;
      }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #3d4d60;
      }
    `,
  ],
})
export class EventTimelineComponent {
  store = inject(DashboardStore);
  @ViewChild("scrollContainer") scrollContainer!: ElementRef;

  currentFilter = signal<"all" | "completed" | "pending" | "anomaly">("all");

  filters = [
    { label: "All", value: "all" },
    { label: "Completed", value: "completed" },
    { label: "Pending", value: "pending" },
    { label: "Anomaly", value: "anomaly" },
  ] as const;

  readonly filteredEvents = computed(() => {
    const events = this.store.events();
    const filter = this.currentFilter();
    if (filter === "all") return events;
    return events.filter((e) => e.status === filter);
  });

  constructor() {
    // Auto-scroll effect
    effect(() => {
      const events = this.filteredEvents();
      if (events.length > 0 && !this.store.isLoading()) {
        setTimeout(() => {
          this.scrollToRight();
        }, 100);
      }
    });
  }

  scrollToRight() {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    }
  }

  focusEvent(event: TimelineEvent) {
    // Placeholder for keyboard interaction on event
    console.log("Event focused:", event);
  }
}
