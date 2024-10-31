import { QrService } from './../../../services/qr.service';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { AccessService } from '../../../services/access.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { LoginService } from '../../../services/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { VisitorService } from '../../../services/visitor.service';
import { QrComponent } from '../../qr/qr.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  NgxScannerQrcodeComponent,
  NgxScannerQrcodeModule,
  ScannerQRCodeConfig,
  ScannerQRCodeResult,
} from 'ngx-scanner-qrcode';

@Component({
  selector: 'app-access-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgClass,
    QrComponent,
    NgxScannerQrcodeModule,
  ],
  templateUrl: './access-form.component.html',
  styleUrl: './access-form.component.css',
})
export class AccessFormComponent implements OnInit {
  accessForm: FormGroup = {} as FormGroup;
  checkButtonDisabled = true;
  modalService = inject(NgbModal);
  private url = inject(ActivatedRoute);
  @ViewChild('scannerModal') scannerModal: any;
  @ViewChild('action') action!: NgxScannerQrcodeComponent;

  public qrValue: string | null = null;

  public config: ScannerQRCodeConfig = {
    constraints: {
      video: {
        width: window.innerWidth,
      },
    },
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private loginService: LoginService,
    private router: Router,
    private visitorService: VisitorService
  ) {}

  openScanner() {
    this.modalService.open(this.scannerModal, { size: 'xl' });
  }

  ngOnInit(): void {
    this.accessForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      plot_id: ['', Validators.required],
      doc_number: [null, Validators.required],
      action: ['ENTRY', Validators.required], // Nueva acción (ENTRY/SALIDA)
      vehicle_type: ['CAR', Validators.required], // Tipo de vehículo (CAR/MOTORBIKE/etc.)
      vehicle_reg: ['', Validators.required], // Matrícula del vehículo
      vehicle_description: [''], // Descripción detallada del vehículo
      comments: [''], // Comentarios adicionales
    });
    this.accessForm.get('last_name')?.disable();
    this.accessForm.get('first_name')?.disable();
    this.accessForm.get('plot_id')?.disable();

    const lote = this.url.snapshot.queryParamMap.get('lote');
    const doc_number = this.url.snapshot.queryParamMap.get('doc_number');

    if (lote && doc_number) {
      this.accessForm.get('doc_number')?.patchValue(doc_number);
      this.accessForm.get('plot_id')?.patchValue(lote);
      this.autocompleteFields(Number(doc_number), lote);
    }
  }

  ngAfterViewInit(): void {
    this.action.isReady.subscribe((res: any) => {
      this.handle(this.action, 'start');
    });
  }

  onSubmit() {
    if (this.accessForm.valid) {
      const formData = this.accessForm.value;
      let plate = this.accessForm.get('vehicle_reg')?.value;
      if (plate != null) {
        this.visitorService
          .checkAccess(plate, this.accessForm.get('action')?.value)
          .subscribe((data) => {
            if (!data) {
              let text =
                this.accessForm.get('action')?.value == 'ENTRY'
                  ? 'Entrada'
                  : 'Salida';

              Swal.fire({
                title: text + ' inconsistente',
                text:
                  'Con esa patente lo ultimo que se registró fue una ' +
                  text.toLowerCase() +
                  ' está seguro de querer registrar otra ' +
                  text.toLowerCase() +
                  '?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Cancelar',
                cancelButtonText: 'Continuar',
                customClass: {
                  confirmButton: 'btn btn-danger',
                  cancelButton: 'btn btn-primary',
                },
              }).then((result) => {
                if (result.isDismissed) {
                  this.authService
                    .createAccess(
                      formData,
                      this.loginService.getLogin().id.toString()
                    )
                    .subscribe((data) => {
                      Swal.fire(
                        'Registro exitoso...',
                        'Se registró correctamente',
                        'success'
                      );
                      this.ngOnInit();
                    });
                }
              });
            } else {
              this.authService
                .createAccess(
                  formData,
                  this.loginService.getLogin().id.toString()
                )
                .subscribe((data) => {
                  Swal.fire(
                    'Registro exitoso...',
                    'Se registró correctamente',
                    'success'
                  );
                  this.ngOnInit();
                });
            }
          });
      }
    } else {
      this.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/access/list']);
  }

  onDocNumberChange(event: any) {
    let document = this.accessForm.get('doc_number')?.value;
    if (document != null) {
      this.checkButtonDisabled = false;
    } else {
      this.checkButtonDisabled = true;
      return;
    }
    this.visitorService.getVisitor(document).subscribe((data) => {
      switch (data.body) {
        case null:
          this.accessForm.get('last_name')?.setValue('');
          this.accessForm.get('first_name')?.setValue('');
          this.accessForm.get('doc_number')?.setErrors({ unauthorized: true });
          break;
        default:
          this.accessForm.get('last_name')?.setValue(data.body.last_name);
          this.accessForm.get('first_name')?.setValue(data.body.name);
          this.accessForm.get('doc_number')?.setErrors(null);
          let plots = '';
          this.authService.getValid(document).subscribe((data) => {
            data.forEach((auth) => {
              plots += auth.plot_id?.toString() + ', ';
            });
            plots = plots.slice(0, plots.length - 2);
            this.accessForm.get('plot_id')?.setValue(plots);
          });
      }
    });
    this.autocompleteFields(document);
  }

  private markAllAsTouched(): void {
    Object.values(this.accessForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  isAuthorized() {
    let document = this.accessForm.get('doc_number')?.value;
    if (this.accessForm.get('doc_number')?.hasError('unauthorized')) {
      Swal.fire({
        title: 'No registrado',
        text: 'Consulte al propietario si autoriza su entrada',
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Cerrar',
        cancelButtonText: 'Ir a registrar',
        customClass: {
          confirmButton: 'btn btn-danger',
          cancelButton: 'btn btn-primary',
        },
      }).then((result) => {
        if (result.isDismissed) {
          this.router.navigate(['/auth/form'], {
            queryParams: { doc_number: document },
          });
        }
      });
      return;
    }
    this.authService.getValid(document).subscribe((data) => {
      if (data.length > 0) {
        Swal.fire('Autorizado', 'Tiene permitido el ingreso', 'success');
      } else {
        Swal.fire({
          title: 'No Autorizado',
          text: 'Consulte al propietario si autoriza su entrada',
          icon: 'error',
          showCancelButton: true,
          confirmButtonText: 'Cerrar',
          cancelButtonText: 'Ir a registrar',
          customClass: {
            confirmButton: 'btn btn-danger',
            cancelButton: 'btn btn-primary',
          },
        }).then((result) => {
          if (result.isDismissed) {
            this.router.navigate(['/auth/form']);
          }
        });
      }
    });
  }

  public onEvent(e: ScannerQRCodeResult[], action?: any): void {
    e && action && action.pause();
    if (e[0].value != null) {
      this.qrValue = e[0].value;
      this.modalService.dismissAll();
      console.log(Number(this.getDocumentNumberFromString(e[0].value)))
      this.accessForm.get('doc_number')?.patchValue(Number(this.getDocumentNumberFromString(e[0].value)));
      this.autocompleteFields(Number(this.getDocumentNumberFromString(e[0].value)));
    }
  }

  public handle(action: any, fn: string): void {
    const playDeviceFacingBack = (devices: any[]) => {
      const device = devices.find((f) =>
        /back|rear|environment/gi.test(f.label)
      );
      action.playDevice(device ? device.deviceId : devices[0].deviceId);
    };

    if (fn === 'start') {
      action[fn](playDeviceFacingBack).subscribe(
        (r: any) => console.log(fn, r),
        alert
      );
    } else {
      action[fn]().subscribe((r: any) => console.log(fn, r), alert);
    }
  }

  autocompleteFields(document: number, lote?: string) {
    if (document != null) {
      this.checkButtonDisabled = false;
    } else {
      this.checkButtonDisabled = true;
      return;
    }
    this.visitorService.getVisitor(document).subscribe((data) => {
      switch (data.body) {
        case null:
          this.accessForm.get('last_name')?.setValue('');
          this.accessForm.get('first_name')?.setValue('');
          this.accessForm.get('doc_number')?.setErrors({ unauthorized: true });
          break;
        default:
          this.accessForm.get('last_name')?.setValue(data.body.last_name);
          this.accessForm.get('first_name')?.setValue(data.body.name);
          this.accessForm.get('plot_id')?.setValue(lote);
          this.accessForm.get('doc_number')?.setErrors(null);
          let plots = '';
          this.authService.getValid(document).subscribe((data) => {
            data.forEach((auth) => {
              plots += auth.plot_id?.toString() + ', ';
            });
            plots = plots.slice(0, plots.length - 2);
            this.accessForm.get('plot_id')?.setValue(plots);
          });
      }
    });
  }

  getDocumentNumberFromString(inputString: string) {
    const regex = /Document:\s*(\d+)/;
    const match = inputString.match(regex);

    return match ? match[1] : null;
  }
}
