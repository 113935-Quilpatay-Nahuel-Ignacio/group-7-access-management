import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SendVisitor, Visitor } from '../models/visitor.model';


interface PaginatedResponse<T> {
  items: T[];
  total_elements: number;
}


export enum filterVisitor {
  NOTHING = 'NOTHING',
  DOCUMENT_NUMBER = 'DOCUMENT_NUMBER',
  DOCUMENT_TYPE = 'DOCUMENT_TYPE'
}

@Injectable({
  providedIn: 'root',
})
export class VisitorService {
  private apiUrl = 'http://localhost:8080/visitors';

  constructor(private http: HttpClient) {}

  getVisitors(page: number = 0, size: number = 10 , filter?: string): Observable<PaginatedResponse<Visitor>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filter) {
      params = params.set('filter', filter);
    }

    return this.http.get<PaginatedResponse<Visitor>>(this.apiUrl, { params });
  }

  getVisitor(visitorId: number): Observable<Visitor> {
    return this.http.get<Visitor>(`${this.apiUrl}/${visitorId}`);
  }

  deleteVisitor(visitorId: number): Observable<Visitor> {
    return this.http.delete<Visitor>(`${this.apiUrl}/${visitorId}`);
  }

  upsertVisitor(visitor: SendVisitor): Observable<Visitor> {
    return this.http.put<Visitor>(this.apiUrl, visitor);
  }
}
