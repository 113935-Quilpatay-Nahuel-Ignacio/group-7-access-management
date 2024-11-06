export interface DashboardHourlyDTO {
  key: string;
  value: number;
}

export interface DashboardWeeklyDTO {
  key: string;
  value: number;
  secondaryValue: number;
}

export interface AccessData {
  key: string;
  value: number;
}

export interface ChartState {
  hasData: boolean;
  message: string;
}

export interface EntryReport {
  entryCount: number;
  exitCount: number;
}

