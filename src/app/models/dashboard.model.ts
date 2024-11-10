import {ChartType} from "chart.js";
import {dashResponse} from "../services/dashboard.service";

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

export interface kpiModel{
  title:string,
  value:string,
  desc:string,
}

export interface graphModel{
  title:string,
  subtitle:string,
  data:any[],
  options: any
}

export enum DashboardStatus {
  All = 'ALL',
  Entries = 'ENTRIES',
  Types = 'TYPES',
  Inconsistencies = 'INCONSISTENCIES',
  Late = 'LATE'
}

export interface DashBoardFilters{
 dateFrom: string;
  dateTo: string;
  action: string;
  group: string;
  type: string;
}
