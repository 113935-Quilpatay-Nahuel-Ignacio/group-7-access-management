import {Component, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UserType, UserTypeService} from "../../../services/userType.service";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  type: UserType = UserType.ADMIN;

  constructor(private userTypeService:UserTypeService) {
  }

  changeType() {
       this.userTypeService.setType(this.type)
  }

  ngOnInit(): void {
  }
}
