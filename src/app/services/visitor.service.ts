import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {Auth} from "../models/authorize.model";
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from "@angular/common/http";
import {SendVisitor, Visitor} from "../models/visitor.model";

@Injectable({
  providedIn: 'root'
})
export class VisitorService {

  private apiUrl = 'http://localhost:8001/visitors';

  private baseUrl = 'http://localhost:8001/';

  constructor(private http: HttpClient) {
  }

  getAll(page: number, size: number, isActive?: boolean): Observable<{items: Visitor[]}> {
    return this.http.get<{items: Visitor[]}>(this.apiUrl);
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
