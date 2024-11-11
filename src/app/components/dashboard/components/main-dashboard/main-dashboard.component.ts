import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, output} from '@angular/core';
import {DashBoardFilters, graphModel, kpiModel} from "../../../../models/dashboard.model";
import {KpiComponent} from "../../commons/kpi/kpi.component";
import {DashboardService, dashResponse} from "../../../../services/dashboard.service";
import {BarchartComponent} from "../../commons/barchart/barchart.component";
import {PiechartComponent} from "../../commons/piechart/piechart.component";

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [
    KpiComponent,
    BarchartComponent,
    PiechartComponent
  ],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.css'
})
export class MainDashboardComponent implements AfterViewInit{
  //inputs
  @Input() filters: DashBoardFilters = {} as DashBoardFilters;
  @Output() notifyParent: EventEmitter<string> = new EventEmitter<string>();

  //vars
  kpi1: kpiModel = {} as kpiModel
  kpi2: kpiModel = {} as kpiModel
  kpi3: kpiModel = {} as kpiModel
  kpi4: kpiModel = {} as kpiModel

  graph1: graphModel = {} as graphModel
  graph2: graphModel = {} as graphModel
  graph3: graphModel = {} as graphModel
  graph4: graphModel = {} as graphModel

  //init
  constructor(private dashBoardService: DashboardService) {
    this.kpi1 = {title: " en el periodo", desc: " en el periodo", value: "0", icon: "", color: "bg-success"}
    this.kpi2 = {title: "Tendencia", desc: "Diferencias con respecto al periodo anterior", value: "0%", icon: "bi bi-graph-up", color: "bg-info"}
    this.kpi3 = {title: "Tipo de ", desc: " en el periodo anterior", value: "0", icon: "bi bi-person-circle", color: "bg-warning"}
    this.kpi4 = {title: "Totales de inconsistencias", desc: " en el periodo", value: "0", icon: "bi-exclamation-circle", color: "bg-danger"}

    this.graph1 = {title: "Ingresos/egresos", subtitle: "Totales por perdiodo seleccionado", data: [], options: null}
    this.graph2 = {title: "Trabajadores con egreso tardío", subtitle: "", data: [], options: null}
    this.graph3 = {title: "Tipos de ingresos/egresos", subtitle: "Distribucion de tipos de ingresos/egresos", data: [], options: null}
    this.graph4 = {title: "Inconsistencias en egresos", subtitle: "", data: [], options: null}
  }

  //getData
  getData() {
    console.log(this.filters)
    let action = this.filters.action == "ENTRY" ? "Ingresos" : "Egresos"
    this.kpi1.icon = this.filters.action == "ENTRY" ? "bi bi-arrow-up-circle" : "bi bi-arrow-down-circle"
    this.kpi1.color = this.filters.action == "ENTRY" ? "bg-success" : "bg-danger"
    this.kpi1.title = action + " en el periodo vs el periodo anterior"
    this.kpi1.desc ="Total de " + action.toLowerCase() + " en el periodo vs el periodo anterior"
    this.kpi4.title ="Total de " + action.toLowerCase() + " inconsistentes"
    this.kpi4.desc ="Total de " + action.toLowerCase() + " inconsistencias en el periodo"
    this.kpi3.desc ="Tipo de " + action.toLowerCase() + " más frecuente en el periodo"
    this.kpi3.title = "Tipo de " + action.toLowerCase() + " más recurrente"
    this.graph1.title = action + " totales"
    this.graph3.title = "Tipos de " + action.toLowerCase()
    this.graph3.subtitle = "Distribucion de tipos de " + action.toLowerCase()
    this.graph4.title = "Inconsistencias en " + action.toLowerCase()
    this.graph4.subtitle = action + " inconsistentes"

    //obtener filtro
    this.dashBoardService.getPeriod(this.filters).subscribe(data => {
      this.graph1.data = mapColumnData(data)
      this.graph1.options = {...this.columnChartOptions,
        colors: [this.filters.action == 'ENTRY' ? '#40916c' : '#9d0208']}
      this.graph1.options.height = 500
      let totalValue1 = 0;
      data.forEach(item => {
        totalValue1 += Number(item.value);
      });

      let previousFilter = createPreviousFilter(this.filters)
      this.dashBoardService.getPeriod(previousFilter).subscribe(data => {
        let totalValue = 0;
        data.forEach(item => {
          totalValue += Number(item.value);
        });

        this.kpi1.value = totalValue1.toString() + " vs " + totalValue.toString();
        let kpi2value = ((totalValue - totalValue1 )/ totalValue1)
        this.kpi2.value = kpi2value.toFixed(2) + "%";
        this.kpi2.icon = kpi2value > 0 ? "bi bi-graph-up" : "bi bi-graph-down"
      })
    })
    //obtener tipos
    this.dashBoardService.getTypes(this.filters).subscribe(data => {
      if (data.length === 0) {
        return undefined;
      }

      // Buscar el objeto con el valor más alto
      let maxValueResponse = data[0];

      if (this.filters.action == "EXIT"){
        for (let i = 1; i < data.length; i++) {
          data[i].value = data[i].secondary_value
        }
      }

      for (let i = 1; i < data.length; i++) {
        if (parseFloat(data[i].value) > parseFloat(maxValueResponse.value)) {
          maxValueResponse = data[i];
        }
      }

      this.kpi3.value = maxValueResponse.key;
      this.graph3.data = mapColumnData(data)
    })

    let inconsistenciesFilter = {...this.filters}
    inconsistenciesFilter.dataType= "INCONSISTENCIES"
    this.dashBoardService.getPeriod(this.filters).subscribe(data => {
      let totalValue1 = 0;
      data.forEach(item => {
        totalValue1 += Number(item.value);
      });
      this.kpi4.value = totalValue1.toString()
      this.graph2.data = mapColumnData(data)
    })

    inconsistenciesFilter.dataType= "LATE"
    inconsistenciesFilter.action= ""
    this.dashBoardService.getPeriod(this.filters).subscribe(data => {
      this.graph4.data = mapColumnData(data)
    })

  }

  //redirect
  sendNotification(mode: string) {
    this.notifyParent.emit(mode);
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

  ngAfterViewInit(): void {
    this.getData()
  }
}

function createPreviousFilter(filters: DashBoardFilters): DashBoardFilters {
  const dateFrom = new Date(filters.dateFrom);
  const dateTo = new Date(filters.dateTo);

  const diffInDays = (dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24);

  const newDateTo = dateFrom;
  const newDateFrom = new Date(dateFrom);
  newDateFrom.setDate(newDateFrom.getDate() - diffInDays);

  return {
    dateFrom: newDateFrom.toISOString(),
    dateTo: newDateTo.toISOString(),
    action: filters.action,
    group: filters.group,
    type: filters.type,
    dataType: "ALL"
  };
}

function mapColumnData(array:dashResponse[]) : any{
  return array.map(data => [
    data.key,
    data.value || 0
  ]);
}
