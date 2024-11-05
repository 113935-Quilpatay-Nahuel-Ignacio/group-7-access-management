import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Auth} from "../models/authorize.model";
import {AccessModel} from "../models/access.model";
import {VisitorAuthorizationRequest} from "../models/authorizeRequest.model";
import {PaginatedResponse} from "../models/api-response";

@Injectable({
  providedIn: 'root'
})
export class AccessService {

  private apiUrl = 'http://localhost:8080/access';

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

  createAccess(data: any, userId: string): Observable<AccessModel> {
    const headers = new HttpHeaders({
      'x-user-id': userId
    });

    return this.http.post<AccessModel>(this.apiUrl + '/authorize', data, { headers });
  }
}
