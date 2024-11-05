import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QrService } from '../../services/qr.service';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-qr',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, RouterOutlet],
  templateUrl: './qr.component.html',
})
export class QrComponent {
  docNumber: number = 0;
  qrImageSrc: string = '';
  fromVisitorForm: boolean = false; // Variable para controlar la visibilidad del botón

  constructor(private qrService: QrService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['docNumber']) {
        this.docNumber = +params['docNumber'];
        this.generateQr();
      }

      if (params['fromVisitorForm']) {
        this.fromVisitorForm = params['fromVisitorForm'] === 'true';
      }
    });
  }

  generateQr() {
    this.qrService.getQr(this.docNumber).subscribe((response) => {
      const reader = new FileReader();
      reader.readAsDataURL(response);
      reader.onloadend = () => {
        this.qrImageSrc = reader.result as string;
      };
    });
  }
}
