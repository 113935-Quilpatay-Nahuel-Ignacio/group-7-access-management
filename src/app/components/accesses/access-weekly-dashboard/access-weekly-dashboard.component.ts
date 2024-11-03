import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccessService } from '../../../services/access.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { ChartState } from '../../../models/dashboard.model';

@Component({
  selector: 'app-access-weekly-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './access-weekly-dashboard.component.html',
  styleUrl: './access-weekly-dashboard.component.css',
})
export class AccessWeeklyDashboardComponent {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  dateFrom: string = '';
  dateUntil: string = '';
  chartState: ChartState = {
    hasData: false,
    message: 'No hay información para esas fechas.',
  };

  public chartType: ChartType = 'bar';

  chartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Accesos por Día',
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
    ],
    labels: [],
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  constructor(private dashboardService: AccessService) {}

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
    this.dateUntil = today.toISOString().split('T')[0];
    this.filterData();
  }

  filterData() {
    if (this.dateFrom && this.dateUntil) {
      this.dashboardService
        .getWeeklyAccesses(this.dateFrom, this.dateUntil)
        .subscribe((data) => {
          this.updateChartData(data);
        });
    }
  }

  resetFilters() {
    this.loadInitialData();
  }

  private updateChartData(data: any[]) {
    this.chartState.hasData =
      data.length > 0 && data.some((item) => item.value > 0);

    if (!this.chartState.hasData) {
      this.chartData.labels = [];
      if (this.chartData.datasets) {
        this.chartData.datasets[0].data = [];
      }
    } else {
      this.chartData.labels = data.map((item) => item.key);
      if (this.chartData.datasets) {
        this.chartData.datasets[0].data = data.map((item) => item.value);
      }
    }

    this.chart.update();
  }
}
