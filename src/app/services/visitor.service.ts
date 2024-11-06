import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {Auth} from "../models/authorize.model";
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from "@angular/common/http";
import {SendVisitor, Visitor} from "../models/visitor.model";
import { PaginatedResponse } from '../models/PaginatedResponse';



export interface VisitorFilter {
  textFilter?: string;
  documentType?: string; // Usa el tipo adecuado si tienes un enum de DocumentType
  visitorType?: string;  // Usa el tipo adecuado si tienes un enum de VisitorType
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VisitorService {

  private apiUrl = 'http://localhost:8001/visitors';

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
  }

}
