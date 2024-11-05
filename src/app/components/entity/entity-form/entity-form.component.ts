import {Component, inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {LoginService} from "../../../services/login.service";
import {ActivatedRoute, Route, Router} from "@angular/router";
import Swal from "sweetalert2";
import {NgClass, NgIf} from "@angular/common";
import moment from "moment";
import {SendVisitor} from "../../../old/visitor/models/visitor.model";
import {VisitorService} from "../../../services/visitor.service";
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-entity-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    FormsModule,
    NgClass,
    MainContainerComponent,
  ],
  templateUrl: './entity-form.component.html',
  styleUrl: './entity-form.component.css'
})
export class EntityFormComponent implements OnInit {
  entityForm: FormGroup = {} as FormGroup;
  router = inject(Router);
  modal = inject(NgbModal);
  constructor(private fb: FormBuilder, private authService: AuthService, private loginService: LoginService, private visitorService: VisitorService, private route: ActivatedRoute) {
  }


  ngOnInit(): void {
    this.entityForm = this.fb.group({
      name: ['', Validators.required],
      last_name: ['', Validators.required],
      doc_type: ['DNI', Validators.required],
      doc_number: [null, Validators.required],
      birth_date: [null, Validators.required]
    });
  }



  onCancel() {
    this.modal.dismissAll();
  }


  onSubmit(): void {
    if (this.entityForm.valid) {
      const formData = this.entityForm.value;
      formData.birth_date = formatFormDate(formData.birth_date);
      this.visitorService.upsertVisitor(formData , this.loginService.getLogin().id).subscribe((response) => {
        console.log(response)
        Swal.fire('Registro exitoso...', "Se registró correctamente", 'success');
        this.ngOnInit();
        this.modal.dismissAll();
      },
        (error) => {
          if (error.status === 400) {
            Swal.fire('Error de registro', error.error, 'error');
          } else {
            Swal.fire('Error inesperado', 'Ocurrió un error inesperado. Intente de nuevo más tarde.', 'error');
          }
        }
      );
    } else {
      this.markAllAsTouched()
    }
  }


  private markAllAsTouched(): void {
    Object.values(this.entityForm.controls).forEach(control => {
      control.markAsTouched();
    })
  };

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
