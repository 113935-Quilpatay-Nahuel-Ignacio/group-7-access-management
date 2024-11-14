import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Auth } from '../models/authorize.model';
import { AccessModel } from '../models/access.model';
import { VisitorAuthorizationRequest } from '../models/authorizeRequest.model';
import {
  DashboardHourlyDTO,
  DashboardWeeklyDTO,
  EntryReport,
} from '../models/dashboard.model';
import { CaseTransformerService } from './case-transformer.service';
import { PaginatedResponse } from './visitor.service';

@Injectable({
  providedIn: 'root',
})
export class AccessService {
  private apiUrl = 'http://localhost:8001/access';

  constructor(
    private http: HttpClient,
    private caseTransformer: CaseTransformerService
  ) {}

  getAll(
    page?: number,
    size?: number,
    isActive?: boolean
  ): Observable<{ items: AccessModel[] }> {
    return this.http
      .get<{ items: AccessModel[] }>(this.apiUrl, {
        params: { size: 1000000 },
      })
      .pipe(
        map((response) => ({
          //items: this.caseTransformer.toCamelCase(response.items),
          items: response.items.map(item => this.caseTransformer.toCamelCase(item))
        }))
      );
  }

  createAccess(data: any, userId: string): Observable<AccessModel> {
    const headers = new HttpHeaders({
      'x-user-id': userId,
    });

    const snakeCaseData = this.caseTransformer.toSnakeCase(data);

    return this.http
      .post<AccessModel>(this.apiUrl + '/authorize', snakeCaseData, {
        headers,
      })
      .pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }

  getByAction(
    page: number,
    size: number,
    type: string,
    isActive?: boolean
  ): Observable<{ items: AccessModel[] }> {
    return this.http
      .get<{ items: AccessModel[] }>(this.apiUrl)
      .pipe(
        map((response) => ({
          items: response.items.map(item => this.caseTransformer.toCamelCase(item))
        }))
      );
      /*.pipe(
        map((response) =>
          this.caseTransformer.toCamelCase(response)
      ));*/
  }

  getByType( visitorType?: string): Observable<PaginatedResponse<AccessModel>> {
   
    let params = new HttpParams();
    if (visitorType) params = params.set('visitorType', visitorType);
  

    return this.http.get<{ items: AccessModel[], total_elements: number }>(this.apiUrl , { params })
      .pipe(
        map((response) => ({
          totalElements: response.total_elements,
          items: response.items.map(item => this.caseTransformer.toCamelCase(item)),
        }))
      );
  }

  getHourlyAccesses(
    from: string,
    to: string
  ): Observable<DashboardHourlyDTO[]> {
    return this.http
      .get<DashboardHourlyDTO[]>(`${this.apiUrl}/hourly`, {
        params: { from, to },
      })
      .pipe(map((response) => response.map(item => this.caseTransformer.toCamelCase(item))));
      //.pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }

  getWeeklyAccesses(
    from: string,
    to: string
  ): Observable<DashboardWeeklyDTO[]> {
    return this.http
      .get<DashboardWeeklyDTO[]>(`${this.apiUrl}/weekly`, {
        params: { from, to },
      })
      .pipe(map((response) => response.map(item => this.caseTransformer.toCamelCase(item))));
      //.pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }

  getVisitorTypeAccesses(
    from: string,
    to: string
  ): Observable<DashboardWeeklyDTO[]> {
    return this.http
      .get<DashboardWeeklyDTO[]>(`${this.apiUrl}/visitor/type`, {
        params: { from, to },
      })
      .pipe(map((response) => response.map(item => this.caseTransformer.toCamelCase(item))));
      //.pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }

  getAccessByDate(from: string, to: string): Observable<EntryReport> {
    const params = new HttpParams()
      .set('from', from)
      .set('to', to);

    return this.http
      .get<EntryReport>(`${this.apiUrl}/getAccessCounts`, {
        params,
      })
      .pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }
}
