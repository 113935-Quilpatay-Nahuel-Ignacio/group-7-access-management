export interface DashboardHourlyDTO {
  key: string;
  value: number;
}

export interface DashboardWeeklyDTO {
  key: string;
  value: number;
  secondary_value: number;
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
  entry_count: number;
  exit_count: number;
}

