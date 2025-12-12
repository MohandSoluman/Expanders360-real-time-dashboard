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
import { DashboardStore } from "../../../core/store/dashboard.store";
import { SkeletonLoaderComponent } from "../skeleton-loader/skeleton-loader.component";
import { TimelineEvent } from "../../../core/store/event.models";

@Component({
  selector: "app-event-timeline",
  standalone: true,
  imports: [CommonModule, SkeletonLoaderComponent],
  providers: [DatePipe],
  templateUrl: "./event-timeline.component.html",
  styleUrl: "./event-timeline.component.css",
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
