import {Component, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { AccessHourlyDashboardComponent } from '../../accesses/access-hourly-dashboard/access-hourly-dashboard.component';
import { AccessWeeklyDashboardComponent } from '../../accesses/access-weekly-dashboard/access-weekly-dashboard.component';
import { AccessPieDashboardComponent } from '../../accesses/access-pie-dashboard/access-pie-dashboard.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MainContainerComponent} from "ngx-dabd-grupo01";
import {AccessService} from "../../../services/access.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-general-dashboards',
  standalone: true,
  imports: [AccessHourlyDashboardComponent, AccessWeeklyDashboardComponent, AccessPieDashboardComponent, ReactiveFormsModule, FormsModule, MainContainerComponent],
  templateUrl: './general-dashboards.component.html',
  styleUrl: './general-dashboards.component.css'
})
export class GeneralDashboardsComponent implements OnInit{
  dateFrom: Date = new Date();
  dateTo: Date = new Date();
  visitorType: string = "";
  exitCount: number = 0;
  entryCount: number = 0;
  modalService = inject(NgbModal);


  @ViewChild(AccessWeeklyDashboardComponent) weekly!: AccessWeeklyDashboardComponent;
  @ViewChild(AccessPieDashboardComponent) pie!: AccessPieDashboardComponent;
  @ViewChild(AccessHourlyDashboardComponent) hourly!: AccessHourlyDashboardComponent;
  @ViewChild('infoModal') infoModal!: TemplateRef<any>

  constructor(
    private accessService: AccessService) {
  }

  onInfoButtonClick() {
   this.modalService.open(this.infoModal, { size: 'lg' });
  }

  resetFilters(){
      this.weekly.ngAfterViewInit();
    this.pie.ngAfterViewInit();
    this.hourly.ngAfterViewInit();
    this.dateFrom = new Date(new Date().getDate() - 30);
    this.dateTo = new Date();
    this.visitorType = "";
    this.generateEntryAndExits();
  }

  filterData(){
    this.weekly.filterData();
    this.pie.filterData();
    this.hourly.filterData();
    this.generateEntryAndExits();
  }

  ngOnInit(): void {
    this.dateFrom = new Date(this.dateTo.getDate() - 30);
    this.generateEntryAndExits();
  }

  generateEntryAndExits(): void {
    this.accessService.getAccessByDate(new Date(this.dateFrom), new Date(this.dateTo)).subscribe({
      next: (data: any) => {
        console.log('Datos recibidos del servidor:', data);
        this.entryCount = data.entryCount;
        this.exitCount = data.exitCount;
      },
      error: (error) => {
        console.error('Error al obtener los datos:', error);
      }
    });
  }
}
