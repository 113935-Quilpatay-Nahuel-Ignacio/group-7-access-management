import { Component } from '@angular/core';
import { AccessHourlyDashboardComponent } from '../../accesses/access-hourly-dashboard/access-hourly-dashboard.component';
import { AccessWeeklyDashboardComponent } from '../../accesses/access-weekly-dashboard/access-weekly-dashboard.component';
import { AccessPieDashboardComponent } from '../../accesses/access-pie-dashboard/access-pie-dashboard.component';
import { AccessReportDashboardComponent } from "../../accesses/access-report-dashboard/access-report-dashboard.component";

@Component({
  selector: 'app-general-dashboards',
  standalone: true,
  imports: [AccessHourlyDashboardComponent, AccessWeeklyDashboardComponent, AccessPieDashboardComponent, AccessReportDashboardComponent],
  templateUrl: './general-dashboards.component.html',
  styleUrl: './general-dashboards.component.css'
})
export class GeneralDashboardsComponent {

}
