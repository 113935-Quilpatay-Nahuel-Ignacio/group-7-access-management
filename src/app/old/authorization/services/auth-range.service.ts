import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthDTO } from '../models/authorized-range.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthRangeService {

   private url = 'http://localhost:8001/auths'


  constructor(private http : HttpClient) {}

  getAuhtByDocNumber(docNumber: number): Observable<AuthDTO[]> {

    const params = new HttpParams().set('docNumber', docNumber.toString());
    // Realizamos una petición GET pasando el parámetro de consulta (query param)
    return this.http.get<AuthDTO[]>(this.url, { params });
  }

  getAllAuths(){
    return this.http.get<AuthDTO[]>(this.url)
  }
}
