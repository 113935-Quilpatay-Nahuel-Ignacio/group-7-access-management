import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ChartType, GoogleChartsModule} from "angular-google-charts";
import {graphModel} from "../../../../models/dashboard.model";

@Component({
  selector: 'app-barchart',
  standalone: true,
  imports: [
    GoogleChartsModule
  ],
  templateUrl: './barchart.component.html',
  styleUrl: './barchart.component.css'
})
export class BarchartComponent {
  @Input() graphModel: graphModel = {} as graphModel

  columnChartOptions = {
    backgroundColor: 'transparent',
    colors: [
      '#FFF3D6',  // Amarillo más claro (ingresos)
      '#FFE4E9',  // Rosa más claro (egresos)
      '#D6E5FF',  // Azul más claro
      '#E4F5F5',  // Verde menta más claro
      '#EBE3FF',  // Morado más claro
      '#FFE9D6',  // Naranja más claro
      '#E3F2FB'   // Azul celeste más claro
    ],
    legend: {position: 'none'},
    chartArea: {width: '80%', height: '100%'},
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
    bar: {
      groupWidth: '70%',
      stroke: this.graphModel.options?.colors?.[0] === '#40916c' ? '#ffc107' : '#ff6384',  // Color del borde según sea ingreso o egreso
      strokeWidth: 2      // Ancho del borde
    }
  };
  columnChartType = ChartType.ColumnChart;
}