import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ChartType, GoogleChartsModule} from "angular-google-charts";
import {graphModel} from "../../../../models/dashboard.model";

@Component({
  selector: 'app-piechart',
  standalone: true,
  imports: [
    GoogleChartsModule
  ],
  templateUrl: './piechart.component.html',
  styleUrl: './piechart.component.css'
})
export class PiechartComponent {
  @Input() graphModel: graphModel = {} as graphModel

  pieChartType = ChartType.PieChart;
  pieChartOptions = {
    backgroundColor: 'transparent',
    legend: {
      position: 'right-center',
      textStyle: { color: '#6c757d', fontSize: 14 }
    },
    chartArea: { width: '100%', height: '100%' },
    pieHole: 0,
    height: '80%',
    colors: [
      '#FFECB3',  // Amarillo claro
      '#B3C8FE',  // Azul claro
      '#FFCDD7',  // Rosa claro
      '#C8EBEB',  // Verde menta claro
      '#D9C5FF',  // Morado claro
      '#FFDFBF',  // Naranja claro
      '#BCDFF7'   // Azul celeste claro
    ],
    slices: {
      0: { 
        color: '#FFECB3',
        strokeWidth: 2,
        stroke: '#ffc107'
      },
      1: { 
        color: '#B3C8FE',
        strokeWidth: 2,
        stroke: '#0d6efd'
      },
      2: { 
        color: '#FFCDD7',
        strokeWidth: 2,
        stroke: '#ff6384'
      },
      3: { 
        color: '#C8EBEB',
        strokeWidth: 2,
        stroke: '#4bc0c0'
      },
      4: { 
        color: '#D9C5FF',
        strokeWidth: 2,
        stroke: '#9966ff'
      },
      5: { 
        color: '#FFDFBF',
        strokeWidth: 2,
        stroke: '#ff9f40'
      },
      6: { 
        color: '#BCDFF7',
        strokeWidth: 2,
        stroke: '#36a2eb'
      }
    },
    pieSliceTextStyle: {
      color: 'black',
      fontSize: 13
    }
  };
}