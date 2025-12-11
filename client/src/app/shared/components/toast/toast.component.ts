import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ToastService } from "../../services/toast.service";

@Component({
  selector: "app-toast",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
      <div
        class="toast"
        [ngClass]="toast.type"
        (click)="toastService.remove(toast.id)"
      >
        <div class="message">{{ toast.message }}</div>
        <div class="close-btn">&times;</div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none; /* Let clicks pass through container */
      }

      .toast {
        pointer-events: auto;
        min-width: 250px;
        padding: 12px 16px;
        border-radius: 6px;
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        justify-content: space-between;
        align-items: center;
        animation: slideIn 0.3s ease-out;
        cursor: pointer;
        color: #333;
        border-left: 4px solid #ccc;
      }

      .toast.success {
        border-left-color: #2ecc71;
      }
      .toast.info {
        border-left-color: #3498db;
      }
      .toast.warning {
        border-left-color: #f1c40f;
      }
      .toast.error {
        border-left-color: #e74c3c;
        color: #c0392b;
      }

      .message {
        font-size: 14px;
        font-weight: 500;
      }

      .close-btn {
        margin-left: 12px;
        font-size: 18px;
        line-height: 1;
        opacity: 0.6;
      }

      .toast:hover .close-btn {
        opacity: 1;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class ToastComponent {
  toastService = inject(ToastService);
}
