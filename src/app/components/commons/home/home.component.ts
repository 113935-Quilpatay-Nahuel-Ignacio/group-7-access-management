import { Component } from '@angular/core';
import { AccessHourlyDashboardComponent } from "../../accesses/access-hourly-dashboard/access-hourly-dashboard.component";
import { AccessWeeklyDashboardComponent } from "../../accesses/access-weekly-dashboard/access-weekly-dashboard.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AccessHourlyDashboardComponent, AccessWeeklyDashboardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
