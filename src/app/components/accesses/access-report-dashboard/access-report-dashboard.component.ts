import { HttpClient } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { EntryReport } from '../../../models/dashboard.model';
import { AccessService } from '../../../services/access.service';
import { ChartConfiguration } from 'chart.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-access-report-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule , BaseChartDirective , CommonModule],
  templateUrl: './access-report-dashboard.component.html',
  styleUrl: './access-report-dashboard.component.css'
})
export class AccessReportDashboardComponent {

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  
  dateForm: FormGroup;
  loading = false;
  error: string | null = null;

  // Configuración unificada para ambos tipos de accesos
  chartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Accesos'],
    datasets: [
      {
        data: [0],
        label: 'Entradas',
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1
      },
      {
        data: [0],
        label: 'Salidas',
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1
      }
    ]
  };

  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        enabled: true
      },
      title: {
        display: true,
        text: 'Reporte de Accesos'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10
        }
      }
    }
  };

  constructor(
    private fb: FormBuilder,
    private accessService: AccessService
  ) {
    this.dateForm = this.fb.group({
      fromDate: [''],
      toDate: ['']
    });
  }

  ngOnInit(): void {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    this.dateForm.patchValue({
      fromDate: lastMonth.toISOString().split('T')[0],
      toDate: today.toISOString().split('T')[0]
    });

    this.generateReport();
  }

  generateReport(): void {
    this.loading = true;
    this.error = null;
    
    const fromDate = new Date(this.dateForm.get('fromDate')?.value);
    const toDate = new Date(this.dateForm.get('toDate')?.value);

    this.accessService.getAccessByDate(fromDate, toDate).subscribe({
      next: (data: any) => {
        console.log('Datos recibidos del servidor:', data);

        // Actualizar los datos del gráfico
        this.chartData.datasets[0].data = [data.entryCount];
        this.chartData.datasets[1].data = [data.exitCount];
        
        // Actualizar el título con el rango de fechas
        if (this.chartOptions && this.chartOptions.plugins && this.chartOptions.plugins.title) {
          this.chartOptions.plugins.title.text = 
            `Reporte de Accesos (${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()})`;
        }

        // Forzar actualización del gráfico
        if (this.chart) {
          this.chart.update();
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener los datos:', error);
        this.error = 'Error al cargar los datos. Por favor, intente nuevamente.';
        this.loading = false;
      }
    });
  }
}
