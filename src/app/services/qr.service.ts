import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QrService {

  qrValue: string | null = null;



  constructor() { }



  get qrCode(): string | null {
    return this.qrValue;
  }
}
