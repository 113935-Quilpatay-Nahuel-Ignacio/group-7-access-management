import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {Auth} from "../models/authorize.model";
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from "@angular/common/http";
import {SendVisitor, Visitor} from "../models/visitor.model";

export interface PaginatedResponse<T> {
  items: T[];
  total_elements: number;
}

export enum filterVisitor {
  NOTHING = 'NOTHING',
  DOCUMENT_NUMBER = 'DOCUMENT_NUMBER',
  DOCUMENT_TYPE = 'DOCUMENT_TYPE',
  VISITOR_TYPE = 'VISITOR_TYPE'
}

@Injectable({
  providedIn: 'root'
})
export class VisitorService {

  private apiUrl = 'http://localhost:8080/visitors';

  private baseUrl = 'http://localhost:8080/';

  constructor(private http: HttpClient) {
  }

  getAll(page: number = 0, size: number = 10 , filter?: string , isActive?: boolean): Observable<PaginatedResponse<Visitor>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())  
      .set('active', 'true');

      if(filter){
        params = params.set ('filter', filter) 
      }

    return this.http.get<PaginatedResponse<Visitor>>(this.apiUrl , { params });
  }

  getVisitor(visitorId: number): Observable<HttpResponse<Visitor>> {
    return this.http.get<Visitor>(`${this.apiUrl}/by-doc-number/${visitorId}`, {observe: 'response'});
  }


  upsertVisitor(visitor: SendVisitor , userId :number): Observable<HttpResponse<Visitor>> {
    
    const header = new HttpHeaders({
      'x-user-id': userId
    })
    return this.http.put<Visitor>(this.apiUrl, visitor, {observe: 'response' , headers: header});
  }

  checkAccess(plate: string, action: string): Observable<Boolean> {
    const params = new HttpParams()
      .set('carPlate', plate)
      .set('action', action);

    return this.http.get<Boolean>(`${this.baseUrl}access/check-access`, { params });
  }

}
