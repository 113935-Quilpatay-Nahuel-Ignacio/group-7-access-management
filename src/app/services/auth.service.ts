import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {VisitorAuthorizationRequest} from "../models/authorizeRequest.model";
import {Auth} from "../models/authorize.model";
import {AccessModel} from "../models/access.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/auths';

  constructor(private http: HttpClient) { }

  createAuth(ownerData: any, userId: string): Observable<VisitorAuthorizationRequest> {
    const headers = new HttpHeaders({
      'x-user-id': userId
    });

    return this.http.post<VisitorAuthorizationRequest>(this.apiUrl + '/authorization', ownerData, { headers });
  }

  getAll(page: number, size: number, isActive?: boolean): Observable<Auth[]> {
    return this.http.get<Auth[]>(this.apiUrl);
  }

  createAccess(data: any, userId: string): Observable<AccessModel> {
    const headers = new HttpHeaders({
      'x-user-id': userId
    });

    return this.http.post<AccessModel>(this.apiUrl + '/authorize', data, { headers });
  }

  getValid(document: number): Observable<Auth[]> {
    return this.http.get<Auth[]>(this.apiUrl + '/valids/' + document.toString());
  }
}