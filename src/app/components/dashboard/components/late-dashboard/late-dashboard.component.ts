import {AfterViewInit, Component, EventEmitter, Input, Output} from '@angular/core';
import {DashBoardFilters, graphModel, kpiModel} from "../../../../models/dashboard.model";
import {KpiComponent} from "../../commons/kpi/kpi.component";
import {PiechartComponent} from "../../commons/piechart/piechart.component";
import {BarchartComponent} from "../../commons/barchart/barchart.component";
import {DashboardService, dashResponse} from "../../../../services/dashboard.service";

@Component({
  selector: 'app-late-dashboard',
  standalone: true,
  imports: [
    KpiComponent,
    PiechartComponent,
    BarchartComponent
  ],
  templateUrl: './late-dashboard.component.html',
  styleUrl: './late-dashboard.component.css'
})
export class LateDashboardComponent implements AfterViewInit {
  @Input() filters: DashBoardFilters = {} as DashBoardFilters;
  @Output() notifyParent: EventEmitter<string> = new EventEmitter<string>();
  title: string = "";

  //vars
  kpi1: kpiModel = {} as kpiModel
  kpi2: kpiModel = {} as kpiModel
  kpi3: kpiModel = {} as kpiModel

  graph1: graphModel = {} as graphModel


  back() {
    this.notifyParent.emit("ALL");
  }

  constructor(private dashBoardService: DashboardService) {}

  getData() {
    let action = this.filters.action == "ENTRY" ? "Ingresos" : "Egresos"
    this.title = " egresos tardíos de empleados"
    this.kpi1.icon = this.filters.action == "ENTRY" ? "bi bi-arrow-up-circle" : "bi bi-arrow-down-circle"
    this.kpi1.color = this.filters.action == "ENTRY" ? "bg-success" : "bg-danger"
    this.kpi1.title = action + " en el periodo vs el periodo anterior"
    this.kpi2.title = "Tendencias de " + action.toLowerCase()
    this.kpi1.desc ="Total de " + action.toLowerCase() + " en el periodo vs el periodo anterior"
    this.kpi3.desc ="Tipo de " + action.toLowerCase() + " más frecuente en el periodo"
    this.kpi3.title = "Tipo de " + action.toLowerCase() + " más recurrente"
    this.graph1.title = action + " totales"

    //obtener filtro
    let inconsistenciesFilter = {...this.filters}
    inconsistenciesFilter.dataType= "LATE"
    console.log(inconsistenciesFilter)
    this.dashBoardService.getPeriod(inconsistenciesFilter).subscribe(data => {
      this.graph1.data = mapColumnData(data)
      this.graph1.options = {...this.columnChartOptions,
        colors: [this.filters.action == 'ENTRY' ? '#40916c' : '#9d0208']}
      this.graph1.options.height = 500
      let totalValue1 = 0;
      data.forEach(item => {
        totalValue1 += Number(item.value);
      });
    })

  }


  columnChartOptions = {
    backgroundColor: 'transparent',
    legend: {position: 'none'},
    chartArea: {width: '95%', height: '80%'},
    vAxis: {
      textStyle: {
        color: '#6c757d',
        fontSize: 12
      },
      format: '#',
    },
    colors: ['#ffc107'],
    hAxis: {
      textStyle: {color: '#6c757d'},
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    height: 500,
    width: '925',
    bar: {groupWidth: '70%'}
  };

  ngAfterViewInit(): void {
    this.getData()
  }


}


function mapColumnData(array:dashResponse[]) : any{
  return array.map(data => [
    data.key,
    data.value || 0
  ]);
}
