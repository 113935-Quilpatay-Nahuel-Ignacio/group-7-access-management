import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessRecordResponse } from '../models/access-record.model';

@Injectable({
  providedIn: 'root',
})
export class AccessService {
  private baseUrl = 'http://localhost:63478/visit-access';

  constructor(private http: HttpClient) {}

  getAccessRecords(
    accessType: string,
    paramsObj: any
  ): Observable<AccessRecordResponse[]> {
    let params = new HttpParams();

    Object.keys(paramsObj).forEach((key) => {
      if (paramsObj[key] !== undefined && paramsObj[key] !== '') {
        params = params.append(key, paramsObj[key]);
      }
    });

    return this.http.get<AccessRecordResponse[]>(`${this.baseUrl}`, { params });
  }
}
