import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-skeleton-loader",
  imports: [CommonModule],
  templateUrl: "./skeleton-loader.component.html",
  styleUrl: "./skeleton-loader.component.css",
})
export class SkeletonLoaderComponent {
  @Input() width: string = "100%";
  @Input() height: string = "20px";
  @Input() borderRadius: string = "4px";

  get styles() {
    return {
      width: this.width,
      height: this.height,
      "border-radius": this.borderRadius,
    };
  }
}
