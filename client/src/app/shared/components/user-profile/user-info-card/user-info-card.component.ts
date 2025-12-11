import { Component } from "@angular/core";
import { ModalService } from "../../../services/modal.service";
import { CommonModule } from "@angular/common";
import { InputFieldComponent } from "../../form/input/input-field.component";
import { ButtonComponent } from "../../ui/button/button.component";
import { LabelComponent } from "../../form/label/label.component";
import { ModalComponent } from "../../ui/modal/modal.component";

@Component({
  selector: "app-user-info-card",
  imports: [
    CommonModule,
    InputFieldComponent,
    ButtonComponent,
    LabelComponent,
    ModalComponent,
  ],
  templateUrl: "./user-info-card.component.html",
  styles: ``,
})
export class UserInfoCardComponent {
  constructor(public modal: ModalService) {}

  isOpen = false;
  openModal() {
    this.isOpen = true;
  }
  closeModal() {
    this.isOpen = false;
  }

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
