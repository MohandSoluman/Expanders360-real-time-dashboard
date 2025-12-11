import { Component } from "@angular/core";
import { InputFieldComponent } from "./../../form/input/input-field.component";
import { ModalService } from "../../../services/modal.service";
import { CommonModule } from "@angular/common";
import { ModalComponent } from "../../ui/modal/modal.component";
import { ButtonComponent } from "../../ui/button/button.component";

@Component({
  selector: "app-user-meta-card",
  imports: [CommonModule, InputFieldComponent, ModalComponent, ButtonComponent],
  templateUrl: "./user-meta-card.component.html",
  styles: ``,
})
export class UserMetaCardComponent {
  constructor(public modal: ModalService) {}

  isOpen = false;
  openModal() {
    this.isOpen = true;
  }
  closeModal() {
    this.isOpen = false;
  }

  // Example user data (could be made dynamic)
  user = {
    firstName: "Mohand ",
    lastName: "Soluman",
    role: "Senior Software Engineer",
    location: "Cairo, Egypt",
    avatar: "/images/user/owner.jpg",
    social: {
      facebook: "https://www.linkedin.com/in/mohand-soluman-211162138/",
      x: "https://www.linkedin.com/in/mohand-soluman-211162138/",
      linkedin: "https://www.linkedin.com/in/mohand-soluman-211162138/",
      instagram: "https://www.linkedin.com/in/mohand-soluman-211162138/",
    },
    email: "mohandsoluman@gmail.com",
    phone: "+201010081302",
    bio: "Senior Software Engineer",
  };

  handleSave() {
    // Handle save logic here
    console.log("Saving changes...");
    this.modal.closeModal();
  }
}
