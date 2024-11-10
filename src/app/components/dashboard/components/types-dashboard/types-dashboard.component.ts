import {AfterViewInit, Component, EventEmitter, Input, Output} from '@angular/core';
import {DashBoardFilters, graphModel, kpiModel} from "../../../../models/dashboard.model";
import {DashboardService, dashResponse} from "../../../../services/dashboard.service";
import {BarchartComponent} from "../../commons/barchart/barchart.component";
import {KpiComponent} from "../../commons/kpi/kpi.component";
import {PiechartComponent} from "../../commons/piechart/piechart.component";

@Component({
  selector: 'app-types-dashboard',
  standalone: true,
  imports: [
    BarchartComponent,
    KpiComponent,
    PiechartComponent
  ],
  templateUrl: './types-dashboard.component.html',
  styleUrl: './types-dashboard.component.css'
})
export class TypesDashboardComponent implements AfterViewInit {
  @Input() filters: DashBoardFilters = {} as DashBoardFilters;
  @Output() notifyParent: EventEmitter<string> = new EventEmitter<string>();
  title: string = ""

  //vars
  kpi1: kpiModel = {} as kpiModel
  kpi2: kpiModel = {} as kpiModel
  kpi3: kpiModel = {} as kpiModel

  graph1: graphModel = {} as graphModel

  ngAfterViewInit(): void {
    this.getData()
  }

  constructor(private dashBoardService: DashboardService) {
    this.kpi1 = {title: " en el periodo", desc: "", value: "0", icon: "", color: ""}
    this.kpi2 = {title: "Más frecuente", desc: "", value: "0", icon: "", color: ""}
    this.kpi3 = {title: "Periodo más concurrido", desc: "", value: "0", icon: "", color: ""}

    this.graph1 = {title: "Tipos de ingresos", subtitle: "Totales por perdiodo seleccionado", data: [], options: null}
  }


  getData() {
    this.title = this.filters.action == "ENTRY" ? "ingresos" : "egresos"
    this.dashBoardService.getTypes(this.filters).subscribe(data => {
      if (data.length === 0) {
        return undefined;
      }

      // Buscar el objeto con el valor más alto
      let maxValueResponse = data[0];

      if (this.filters.action == "EXIT") {
        for (let i = 1; i < data.length; i++) {
          data[i].value = data[i].secondary_value
        }
      }

      for (let i = 1; i < data.length; i++) {
        if (parseFloat(data[i].value) > parseFloat(maxValueResponse.value)) {
          maxValueResponse = data[i];
        }
      }

      this.kpi2.value = maxValueResponse.key;
      this.graph1.data = mapColumnData(data)
    })
  }


  columnChartOptions = {
    backgroundColor: 'transparent',
    legend: {position: 'none'},
    chartArea: {width: '80%', height: '60%'},
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
    width: '100%',
    bar: {groupWidth: '70%'}
  };

  back() {
    this.notifyParent.emit("ALL");
  }


}

function mapColumnData(array: dashResponse[]): any {
  return array.map(data => [
    data.key,
    data.value || 0
  ]);
}
