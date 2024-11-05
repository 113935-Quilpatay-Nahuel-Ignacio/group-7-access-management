import {AfterViewInit, Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {UserType, UserTypeService} from "../../../services/userType.service";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements AfterViewInit{
  type: String = UserType.ADMIN;

  constructor(private userTypeService: UserTypeService ) {
  }

  ngAfterViewInit(): void {  {
    this.userTypeService.userType$.subscribe((filter: string) => {
      this.type = filter
    });
  }
  }


}
