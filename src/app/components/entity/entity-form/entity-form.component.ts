import {Component, Inject, inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {LoginService} from "../../../services/login.service";
import {ActivatedRoute, Route, Router} from "@angular/router";
import Swal from "sweetalert2";
import {NgClass, NgIf} from "@angular/common";
import moment from "moment";
import {SendVisitor} from "../../../old/visitor/models/visitor.model";
import {VisitorService} from "../../../services/visitor.service";
import { ToastsContainer, ToastService } from "ngx-dabd-grupo01";
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-entity-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    FormsModule,
    NgClass,
    ToastsContainer
  ],
  templateUrl: './entity-form.component.html',
  styleUrl: './entity-form.component.css'
})
export class EntityFormComponent implements OnInit {
  entityForm: FormGroup = {} as FormGroup;
  url = inject(ActivatedRoute);
  isEditMode = false;
  visitorId: string | null = null;
  private toastService = inject(ToastService);
  activeModal = inject(NgbActiveModal);
  isUpdate : boolean = false

  // Método para habilitar el modo edición
  activateEditMode() {
    this.isEditMode = true;
  }

  constructor(private fb: FormBuilder, private authService: AuthService, private loginService: LoginService, private router: Router, private visitorService: VisitorService, private route: ActivatedRoute) {
  }


  ngOnInit(): void {
    this.entityForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      docType: ['DNI', Validators.required],
      docNumber: [null, Validators.required],
      birthDate: [null]
    });

    /*this.route.paramMap.subscribe(params => {
      this.visitorId = params.get('visitorId');
      if (this.visitorId) {
        this.isEditMode = true;
        this.loadVisitorData(this.visitorId); // Carga los datos para editar
      }
    });*/
  }



  onCancel() {
    this.router.navigate(['/entity/list']);
    this.activeModal.dismiss(); // Cierra el modal
  }


  onSubmit(): void {
    if (this.entityForm.valid) {
      const formData = this.entityForm.value;
      if(formData.birthDate){
        formData.birthDate = formatFormDate(formData.birthDate);
      }
      this.visitorService.upsertVisitor(formData,this.loginService.getLogin().id).subscribe((response) => {
        console.log(response)
        this.toastService.sendSuccess("Registro exitoso!");
        this.ngOnInit();
      },
        (error) => {
          if (error.status === 400) {
            this.toastService.sendError("Error, Documento ya registrado.");
          } else {
            this.toastService.sendError("Ocurrió un error inesperado. Intente de nuevo más tarde.");
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
