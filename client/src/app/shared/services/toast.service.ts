import { Injectable, signal } from "@angular/core";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  duration?: number;
}

@Injectable({
  providedIn: "root",
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(
    message: string,
    type: "success" | "info" | "warning" | "error" = "info",
    duration: number = 3000
  ) {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type, duration };

    this.toasts.update((current) => [...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  remove(id: string) {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
