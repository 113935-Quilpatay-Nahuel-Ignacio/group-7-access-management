import {Component, inject, OnInit,} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, FormArray} from '@angular/forms';
import {CommonModule, NgClass} from '@angular/common';
import {DaysOfWeek} from '../../../models/authorizeRequest.model'
import {AuthService} from "../../../services/auth.service";
import {LoginService} from "../../../services/login.service";
import Swal from 'sweetalert2';
import {NgIf} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import { MainContainerComponent } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgClass,
    MainContainerComponent,
],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.css'
})
export class AuthFormComponent implements OnInit {

  authForm: FormGroup = {} as FormGroup;
  plots: any[] = []
 paramRoutes = inject(ActivatedRoute);

  constructor(private fb: FormBuilder, private authService: AuthService, private loginService: LoginService, private router: Router) {
  }

  ngOnInit(): void {
    this.authForm = this.createForm();
    this.authForm.get('visitor_type')?.disable()
    this.initPlots()

    const documentParam = this.paramRoutes.snapshot.queryParamMap.get('doc_number');
    debugger
    if (documentParam) {
      this.authForm.get('visitor_request.doc_number')?.patchValue(documentParam);
    }
  }

  get authRangeRequests(): FormArray {
    return this.authForm.get('auth_range_request') as FormArray;
  }

  addAuthRange(): void {
    this.authRangeRequests.push(this.createAuthRange());
  }

  removeAuthRange(index: number): void {
    this.authRangeRequests.removeAt(index);
  }

  createForm(): FormGroup {
    return this.fb.group({
      visitor_type: ['VISITOR', Validators.required],
      plot_id: [null, Validators.required],
      visitor_request: this.fb.group({
        name: ['', Validators.required],
        last_name: ['', Validators.required],
        doc_type: ['DNI', Validators.required],
        doc_number: [null, Validators.required],
        birth_date: [null, Validators.required],
      }),
      auth_range_request: this.fb.array([])
    });
  }

  createAuthRange(): FormGroup {
    return this.fb.group({
      date_from: [null, Validators.required],
      date_to: [null, Validators.required],
      hour_from: ['00:00', Validators.required],
      hour_to: ['23:59', Validators.required],
      days_of_week: [[], Validators.required],
      comment: ['']
    });
  }

  onSubmit() {
    if (this.authForm.valid) {
      const formData = this.authForm.value;
      formData.visitor_type = 'VISITOR';
      formData.visitor_request.birth_date = formatFormDate(formData.visitor_request.birth_date);

      const now = new Date();

      const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const formatTime = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = '00';
        return `${hours}:${minutes}:${seconds}`;
      };

      const dateFrom = formatDate(now);
      const dateTo = new Date(now.getTime() + 15 * 60000);
      const isNewDay = dateTo.getDate() !== now.getDate();
      const finalDateFrom = isNewDay ? formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0)) : dateFrom;

      const authRange = {
        date_from: finalDateFrom,
        date_to: formatDate(dateTo),
        hour_from: isNewDay ? "00:00:00" : formatTime(now),
        hour_to: formatTime(dateTo),
        days_of_week: [this.getDayOfWeek(now)],
        comment: "Access for John Doe"
      };

      formData.auth_range_request = [authRange];

      this.authService.createAuth(formData, this.loginService.getLogin().id.toString()).subscribe(data => {
        Swal.fire({
          title: 'Registro exitoso!',
          text: 'Proceda a registrar el acceso',
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Cerrar',
          cancelButtonText: 'Ir a nuevo acceso',
          customClass: {
            confirmButton: 'btn btn-danger',
            cancelButton: 'btn btn-primary'
          }
        }).then((result) => {
          if (result.isDismissed) {
            this.router.navigate(['/access/form'] , {queryParams : {doc_number : formData.visitor_request.doc_number , lote : formData.plot_id}});
          }
        });
      });
    } else {
      this.markAllAsTouched();
    }
  }

  getDayOfWeek(date: Date): string {
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    return days[date.getDay()];
  }


  onCancel() {
    this.router.navigate(['/auth/list']);
  }

  initPlots() {
    this.plots = [
      { id: 1, desc: "Andrés Torres" },
      { id: 2, desc: "Ana María" },
      { id: 3, desc: "Carlos Pérez" },
      { id: 4, desc: "Luisa Fernández" },
      { id: 5, desc: "Miguel Ángel" },
      { id: 6, desc: "Sofía Martínez" },
      { id: 7, desc: "David Gómez" },
      { id: 8, desc: "Isabel García" },
      { id: 9, desc: "Fernando López" },
      { id: 10, desc: "María José" }
    ]
  }

  private markAllAsTouched(): void {
    // Marca todos los controles en el formulario principal
    Object.values(this.authForm.controls).forEach(control => {
      control.markAsTouched();
      // Si es un FormGroup, recorre sus controles
      if (control instanceof FormGroup) {
        this.markAllAsTouchedRecursive(control);
      }
      // Si es un FormArray, recorre sus controles
      if (control instanceof FormArray) {
        control.controls.forEach(innerControl => {
          innerControl.markAsTouched();
        });
      }
    });
  }

// Función recursiva para marcar todos los controles como tocados
  private markAllAsTouchedRecursive(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllAsTouchedRecursive(control); // Llamada recursiva
      }
      if (control instanceof FormArray) {
        control.controls.forEach(innerControl => {
          innerControl.markAsTouched();
        });
      }
    });
  }


}

function formatFormDate(inputDate: string): string {
  // Verificar que la entrada sea una fecha válida en el formato yyyy-MM-dd
  const dateParts = inputDate.split('-');
  if (dateParts.length !== 3) {
    throw new Error('Fecha no válida. Debe estar en formato yyyy-MM-dd');
  }

  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];

  // Devolver la fecha en el formato dd-MM-yyyy
  return `${day}-${month}-${year}`;
}
