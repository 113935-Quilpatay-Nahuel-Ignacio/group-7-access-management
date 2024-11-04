import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {Component, Input, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QrService } from '../../services/qr.service';

@Component({
  selector: 'app-qr',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './qr.component.html',
})
export class QrComponent implements OnInit{
  @Input() docNumber: number = 0;
  qrImageSrc: string = '';

  constructor(private qrService: QrService) {}

  generateQr() {
    this.qrService.getQr(this.docNumber).subscribe((response) => {
      const reader = new FileReader();
      reader.readAsDataURL(response);
      reader.onloadend = () => {
        this.qrImageSrc = reader.result as string;
      };
    });
  }

  ngOnInit(): void {
    this.generateQr()
  }
}
