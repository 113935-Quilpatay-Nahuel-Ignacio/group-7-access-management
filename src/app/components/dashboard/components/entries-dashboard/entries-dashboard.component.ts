import {AfterViewInit, Component, EventEmitter, Input, Output} from '@angular/core';
import {DashBoardFilters, graphModel, kpiModel} from "../../../../models/dashboard.model";
import {BarchartComponent} from "../../commons/barchart/barchart.component";
import {KpiComponent} from "../../commons/kpi/kpi.component";
import {DashboardService, dashResponse} from "../../../../services/dashboard.service";

@Component({
  selector: 'app-entries-dashboard',
  standalone: true,
  imports: [
    BarchartComponent,
    KpiComponent
  ],
  templateUrl: './entries-dashboard.component.html',
  styleUrl: './entries-dashboard.component.css'
})
export class EntriesDashboardComponent implements AfterViewInit{
  @Input() filters: DashBoardFilters = {} as DashBoardFilters;
  @Output() notifyParent: EventEmitter<string> = new EventEmitter<string>();

  //vars
  kpi1: kpiModel = {} as kpiModel
  kpi2: kpiModel = {} as kpiModel
  kpi3: kpiModel = {} as kpiModel

  graph1: graphModel = {} as graphModel

  ngAfterViewInit(): void {
    this.getData()
  }

  constructor(private dashBoardService: DashboardService) {
    this.kpi1 = {title: " en el periodo", desc: "", value: "0"}
    this.kpi2 = {title: "Promedio diario", desc: "", value: "0"}
    this.kpi3 = {title: "Periodo más concurrido", desc: "", value: "0"}

    this.graph1 = {title: "Ingresos/egresos", subtitle: "Totales por perdiodo seleccionado", data: [], options: null}
  }

  getData() {
    let action = this.filters.action == "ENTRY" ? "Ingresos" : "Egresos"
    this.graph1.title = action + " totales"
    this.kpi1.title = action + " totales"

    //obtener filtro
    this.dashBoardService.getPeriod(this.filters).subscribe(data => {
      this.graph1.data = mapColumnData(data)
      this.graph1.options = {...this.columnChartOptions,
        colors: [this.filters.action == 'ENTRY' ? '#40916c' : '#9d0208']}
      let totalValue1 = 0;
      data.forEach(item => {
        totalValue1 += Number(item.value);
      });
      this.kpi2.value = (totalValue1 / data.length).toFixed(2)
      this.kpi1.value = totalValue1.toString();

      let maxValueResponse = data[0];
      for (let i = 1; i < data.length; i++) {
        if (parseFloat(data[i].value) > parseFloat(maxValueResponse.value)) {
          maxValueResponse = data[i];
        }
      }
      this.kpi3.value = maxValueResponse.key


    })
  }


  columnChartOptions = {
    backgroundColor: 'transparent',
    legend: {position: 'none'},
    chartArea: {width: '100%', height: '90%'},
    vAxis: {
      textStyle: {
        color: '#6c757d',
        fontSize: 12  // Tamaño de fuente más pequeño
      },
      // Formato personalizado para mostrar los valores en miles
      format: '#',
    },
    hAxis: {
      textStyle: {color: '#6c757d'},
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    height: 400,
    width: 900,
    bar: {groupWidth: '70%'}
  };

  back() {
    this.notifyParent.emit("ALL");
  }


}

function mapColumnData(array:dashResponse[]) : any{
  return array.map(data => [
    data.key,
    data.value || 0
  ]);

}
