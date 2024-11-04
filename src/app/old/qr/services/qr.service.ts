import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface sendQRByEmailRequest {
  email : string;
  invitor_name: string;
  doc_number:number;
}

@Injectable({
  providedIn: 'root'
})
export class QrService {

  private apiUrl = 'http://localhost:8001/qr';

  constructor(private http: HttpClient) {}

  getQr(docNumber: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${docNumber}`, { responseType: 'blob' });
  }

  sendQRByEmail(request: sendQRByEmailRequest , userId: number): Observable<any> {

    const headers = new HttpHeaders({
      'x-user-id': userId
    });
    return this.http.post(`${this.apiUrl}/send` , request ,{ headers });
  }
}
