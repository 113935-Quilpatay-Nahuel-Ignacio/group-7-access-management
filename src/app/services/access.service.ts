import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Auth} from "../models/authorize.model";
import {AccessModel} from "../models/access.model";
import {VisitorAuthorizationRequest} from "../models/authorizeRequest.model";
import {PaginatedResponse} from "../models/api-response";
import { DashboardDTO } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class AccessService {

  private apiUrl = 'http://localhost:8001/access';

  constructor(private http: HttpClient) {
  }

  getAll(page: number, size: number, isActive?: boolean): Observable<AccessModel[]> {
    return this.http.get<AccessModel[]>(this.apiUrl);
  }


  getByAction(page: number, size: number, type: string, isActive?: boolean): Observable<AccessModel[]> {
    return this.http.get<AccessModel[]>(this.apiUrl);
  }

  getByType(page: number, size: number, type: string, isActive?: boolean): Observable<AccessModel[]> {
    return this.http.get<AccessModel[]>(this.apiUrl);
  }

  getHourlyAccesses(from: string, to: string): Observable<DashboardDTO[]> {
    return this.http.get<DashboardDTO[]>(`${this.apiUrl}/hourly`, {
      params: { from, to }
    });
  }

  getWeeklyAccesses(from: string, to: string): Observable<DashboardDTO[]> {
    return this.http.get<DashboardDTO[]>(`${this.apiUrl}/weekly`, {
      params: { from, to }
    });
  }
}
