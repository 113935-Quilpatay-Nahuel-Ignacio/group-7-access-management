import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthDTO } from '../models/authorized-range.model';
import { Observable } from 'rxjs';
import { AccessDTO } from '../../accesses/models/access-record.model';

@Injectable({
  providedIn: 'root',
})
export class AuthRangeService {
  private url = 'http://localhost:8080/auths';

  constructor(private http: HttpClient) {}

  getAuhtByDocNumber(docNumber: number): Observable<AuthDTO[]> {
    const params = new HttpParams().set('docNumber', docNumber.toString());
    // Realizamos una petición GET pasando el parámetro de consulta (query param)
    return this.http.get<AuthDTO[]>(this.url, { params });
  }

  getAllAuths() {
    return this.http.get<AuthDTO[]>(this.url);
  }

  authorizeAccess(accessDTO: AccessDTO, userId: number): Observable<AccessDTO> {
    const headers = { 'x-user-id': userId.toString() };
    return this.http.post<AccessDTO>(`${this.url}/authorize`, accessDTO, {
      headers,
    });
  }
}
