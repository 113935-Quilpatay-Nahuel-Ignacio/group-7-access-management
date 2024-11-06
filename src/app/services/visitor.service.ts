import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Auth } from '../models/authorize.model';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { SendVisitor, Visitor } from '../models/visitor.model';
import { PaginatedResponse } from '../models/PaginatedResponse';
import { CaseTransformerService } from './case-transformer.service';

export interface VisitorFilter {
  textFilter?: string;
  documentType?: string; // Usa el tipo adecuado si tienes un enum de DocumentType
  visitorType?: string; // Usa el tipo adecuado si tienes un enum de VisitorType
  active?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class VisitorService {
  /*private apiUrl = 'http://localhost:8001/visitors';

  private baseUrl = 'http://localhost:8001/';

  constructor(private http: HttpClient) {
  }

  getAll(page: number, size: number, filter?: boolean): Observable<{items: Visitor[]}> {
    return this.http.get<{items: Visitor[]}>(this.apiUrl);
  }

  getAllPaginated(page: number, size: number, filter?: VisitorFilter): Observable<PaginatedResponse<Visitor>> {

    let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

  // Agregar filtros opcionales si están presentes
  if (filter?.textFilter) {
    params = params.set('textFilter', filter.textFilter);
  }
  if (filter?.documentType) {
    params = params.set('documentType', filter.documentType);
  }
  if (filter?.visitorType) {
    params = params.set('visitorType', filter.visitorType);
  }
  if (filter?.active !== undefined) {
    params = params.set('active', filter.active.toString());
  }

  return this.http.get<PaginatedResponse<Visitor>>(this.apiUrl, { params });

  }

  getVisitor(docNumber: number): Observable<HttpResponse<Visitor>> {
    return this.http.get<Visitor>(`${this.apiUrl}/by-doc-number/${docNumber}`, {observe: 'response'});
  }

 getVisitorById(visitoirId : number){

 return this.http.get<Visitor>(`${this.apiUrl}/visitorId/${visitoirId}`, {observe: 'response'});
 }
  upsertVisitor(visitor: SendVisitor,userId: number , entityId?:number): Observable<HttpResponse<Visitor>> {
    const headers = new HttpHeaders({
      'x-user-id': userId
    });

    const params = new HttpParams();
    if(entityId){
      params.set('visitorId', entityId.toString());
    }

    return this.http.put<Visitor>(this.apiUrl, visitor, {observe: 'response', headers , params});
  }

  checkAccess(plate: string, action: string): Observable<Boolean> {
    const params = new HttpParams()
      .set('carPlate', plate)
      .set('action', action);

    return this.http.get<Boolean>(`${this.baseUrl}access/check-access`, { params });
  }*/

  private apiUrl = 'http://localhost:8001/visitors';
  private baseUrl = 'http://localhost:8001/';

  constructor(
    private http: HttpClient,
    private caseTransformer: CaseTransformerService
  ) {}

  getAll(
    page: number,
    size: number,
    filter?: boolean
  ): Observable<{ items: Visitor[] }> {
    const params = this.caseTransformer.toSnakeCase({
      page,
      size,
      filter,
    });

    return this.http
      .get<{ items: Visitor[] }>(this.apiUrl, {
        params: params as any,
      })
      .pipe(
        map((response) => ({
          items: response.items.map((item) =>
            this.caseTransformer.toCamelCase(item)
          ),
        }))
      );
  }

  getAllPaginated(
    page: number,
    size: number,
    filter?: VisitorFilter
  ): Observable<PaginatedResponse<Visitor>> {
    let snakeCaseParams = this.caseTransformer.toSnakeCase({
      page: page.toString(),
      size: size.toString(),
      textFilter: filter?.textFilter,
      documentType: filter?.documentType,
      visitorType: filter?.visitorType,
      active: filter?.active?.toString(),
    });

    return this.http
      .get<PaginatedResponse<Visitor>>(this.apiUrl, {
        params: snakeCaseParams as any,
      })
      .pipe(
        map((response) => ({
          items: response.items.map((item) =>
            this.caseTransformer.toCamelCase(item)
          ),
          totalElements: response.totalElements,
        }))
      );
  }

  getVisitor(docNumber: number): Observable<HttpResponse<Visitor>> {
    return this.http
      .get<Visitor>(`${this.apiUrl}/by-doc-number/${docNumber}`, {
        observe: 'response',
      })
      .pipe(
        map(
          (response) =>
            new HttpResponse({
              body: response.body
                ? this.caseTransformer.toCamelCase(response.body)
                : null,
              headers: response.headers,
              status: response.status,
              statusText: response.statusText,
              url: response.url || undefined,
            })
        )
      );
  }

  getVisitorById(visitorId: number): Observable<HttpResponse<Visitor>> {
    return this.http
      .get<Visitor>(`${this.apiUrl}/visitorId/${visitorId}`, {
        observe: 'response',
      })
      .pipe(
        map(
          (response) =>
            new HttpResponse({
              body: response.body
                ? this.caseTransformer.toCamelCase(response.body)
                : null,
              headers: response.headers,
              status: response.status,
              statusText: response.statusText,
              url: response.url || undefined,
            })
        )
      );
  }

  upsertVisitor(
    visitor: SendVisitor,
    userId: number,
    entityId?: number
  ): Observable<HttpResponse<Visitor>> {
    const headers = new HttpHeaders({
      'x-user-id': userId.toString(),
    });

    const snakeCaseVisitor = this.caseTransformer.toSnakeCase(visitor);
    let params = new HttpParams();

    if (entityId) {
      const snakeCaseParams = this.caseTransformer.toSnakeCase({
        visitorId: entityId.toString(),
      });
      params = new HttpParams({ fromObject: snakeCaseParams });
    }

    return this.http
      .put<Visitor>(this.apiUrl, snakeCaseVisitor, {
        observe: 'response',
        headers,
        params,
      })
      .pipe(
        map(
          (response) =>
            new HttpResponse({
              body: response.body
                ? this.caseTransformer.toCamelCase(response.body)
                : null,
              headers: response.headers,
              status: response.status,
              statusText: response.statusText,
              url: response.url || undefined,
            })
        )
      );
  }

  checkAccess(plate: string, action: string): Observable<Boolean> {
    const params = new HttpParams()
      .set('carPlate', plate)
      .set('action', action);

    return this.http.get<Boolean>(`${this.baseUrl}access/check-access`, {
      params,
    });
  }
}
