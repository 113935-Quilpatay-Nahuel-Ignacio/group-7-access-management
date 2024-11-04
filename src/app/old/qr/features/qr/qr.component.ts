import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {Component, Input, OnInit} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { QrService, sendQRByEmailRequest } from '../../services/qr.service';
import { ConfirmAlertComponent } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-qr',
  standalone: true,
  imports: [FormsModule, CommonModule , ReactiveFormsModule , ConfirmAlertComponent],
  templateUrl: './qr.component.html',
})
export class QrComponent implements OnInit{

  alertComponent: ConfirmAlertComponent = new ConfirmAlertComponent();

  form: FormGroup = new FormGroup({
    email: new FormControl('' , [Validators.required, Validators.email]),
    invitorName: new FormControl('' , [Validators.required]),
  });


showAlert: boolean = false;


sendQRByEmail() {

  if(this.form.valid){
    const request: sendQRByEmailRequest = {
      email: this.form.value.email,
      invitor_name: this.form.value.invitorName,
      doc_number: this.docNumber
    }

    console.log(request)
    this.qrService.sendQRByEmail(request , 1).subscribe({
      next:(data)=>{
        console.log(data)
        this.alertComponent.alertType = 'success';
          this.alertComponent.alertTitle = 'QR enviado';
          this.alertComponent.alertMessage = 'Se ha enviado el QR al correo electrónico';
          this.showAlert = true;
       
      },
      error:(error)=>{
        console.log(error)
      }
    })
  }
}


  @Input() docNumber: number = 0;
  qrImageSrc: string = '';
 showEmailForm: boolean = false;

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

  handleConfirm() {
    this.showAlert = false; // Ocultar la alerta después de confirmar
  }
}
