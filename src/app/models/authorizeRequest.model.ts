export interface VisitorRequest {
  name: string;
  last_name: string;
  doc_type: string;
  doc_number: number;
  birth_date: string;
}

export interface AuthRangeRequest {
  date_from: string;
  date_to: string;
  hour_from: string;
  hour_to: string;
  days_of_week: DaysOfWeek[];
  comment: string;
}

export interface VisitorAuthorizationRequest {
  visitor_type: VisitorType;
  plot_id: number;
  visitor_request: VisitorRequest;
  auth_range_request: AuthRangeRequest[];
}

export enum VisitorType {
  OWNER = 'OWNER',
  WORKER = 'WORKER',
  VISITOR = 'VISITOR',
  EMPLOYEE = 'EMPLOYEE',
  PROVIDER = 'PROVIDER',
  PROVIDER_ORGANIZATION = 'PROVIDER_ORGANIZATION',
  COHABITANT = 'COHABITANT',
  EMERGENCY = 'EMERGENCY',
}

export enum DaysOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}
