import {AfterViewInit, Component, ElementRef, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Auth, AuthFilters, AuthRange, VisitorTypeAccessDictionary} from "../../../models/authorize.model";
import {Router} from "@angular/router";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {AuthorizerCompleterService} from "../../../services/authorizer-completer.service";
import {ExcelService} from "../../../services/excel.service";
import {
    CadastrePlotFilterButtonsComponent
} from "../../accesses/cadastre-access-filter-buttons/cadastre-plot-filter-buttons.component";
import {Filter, FilterConfigBuilder, MainContainerComponent, ToastService} from "ngx-dabd-grupo01";
import {NgbModal, NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {AccessActionDictionary, AccessModel} from "../../../models/access.model";
import {AccessService} from "../../../services/access.service";
import {TransformResponseService} from "../../../services/transform-response.service";
import { CadastreExcelService } from '../../../services/cadastre-excel.service';
import {UserTypeService} from "../../../services/userType.service";
import {LoginService} from "../../../services/login.service";
import {RangeModalComponent} from "../range-modal/range-modal.component";
import {QrComponent} from "../../../old/qr/features/qr/qr.component";
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {NgClass} from "@angular/common";
import {DaysOfWeek} from "../../../models/authorizeRequest.model";

@Component({
  selector: 'app-auth-list',
  standalone: true,
  imports: [
    CommonModule,
    CadastrePlotFilterButtonsComponent,
    MainContainerComponent,
    NgbPagination,
    ReactiveFormsModule,
    FormsModule,
    NgClass
  ],
  templateUrl: './auth-list.component.html',
  styleUrl: './auth-list.component.css'
})
export class AuthListComponent  implements OnInit, AfterViewInit {
  
  
  //#region FILTRADO

   searchParams: { [key: string]: any } = {};

   // Filtro dinámico
   filterType: string = '';
   startDate: string = '';
   endDate: string = '';
   type: string = '';
 
   setFilterType(type: string): void {
     this.filterType = type;
   }
 
   applyFilters(): void {
     if (this.filterType === 'Tipo Visitante') {
       this.searchParams = { visitorTypes: [this.type] }
      }
  }
 
   clearFilters(): void {
  // Restablece todos los filtros a su valor inicial.
   this.filterType = '';
   this.startDate = '';
   this.endDate = '';
   this.type = '';
   this.searchParams = {};
 
   // Reinicia la página actual a la primera
   this.currentPage = 0;
   }

  filterConfig: Filter[] = new FilterConfigBuilder()
  .selectFilter('Tipo Visitante', 'visitorTypes', 'Seleccione el tipo de visitante', [
    { value: 'VISITOR', label: 'Visitante' },
    { value: 'WORKER', label: 'Trabajador' },
    { value: 'OWNER', label: 'Propietario' },
    { value: 'PROVIDER', label: 'Proveedor' },
    { value: 'EMPLOYEE', label: 'Empleado' },
    { value: 'COHABITANT', label: 'Conviviente' },
    { value: 'EMERGENCY', label: 'Emergencia' },
    { value: 'PROVIDER_ORGANIZATION', label: 'Entidad' },
  ])
  .numberFilter('Nro de lote' , 'plotNumber' , 'Seleccione un numero de lote')
  .build();


   onFilterValueChange(filters: Record<string,any>) {
    this.searchParams = {
      ...filters,
    };

    this.currentPage = 1;
    console.log(this.searchParams);

    if(this.searchParams['visitorTypes']){
      this.filterByVisitorType(this.searchParams['visitorTypes']);
    }else if(this.searchParams['plotNumber']){
    this.filterByPlot(this.searchParams['plotNumber']);
    }else{
     this.getAll();
    }
}

  @ViewChild('filterComponent') filterComponent!: CadastrePlotFilterButtonsComponent<AccessModel>;
  @ViewChild('table', {static: true}) tableName!: ElementRef<HTMLTableElement>;
  @ViewChild('infoModal') infoModal!: TemplateRef<any>;

  //#region SERVICIOS
  private router = inject(Router)
  private authService = inject(AuthService)
  private transformResponseService = inject(TransformResponseService)
  private authorizerCompleterService = inject(AuthorizerCompleterService)
  private toastService = inject(ToastService)
  private modalService = inject(NgbModal)
  private userTypeService = inject(UserTypeService)
  private loginService = inject(LoginService)
  //#endregion

  //#region ATT de PAGINADO
  currentPage: number = 0
  pageSize: number = 10
  userType: string = "ADMIN"
  sizeOptions: number[] = [10, 25, 50]
  list: Auth[] = [];
  completeList: [] = [];
  filteredList: Auth[] = [];
  lastPage: boolean | undefined
  totalItems: number = 0;
  //#endregion
  heads: string[] =["Nro de Lote",
    "Visitante",
    "Documento",
    "Tipo",
    "Horarios",
    "Autorizador"]
  props: string[] =["Nro de Lote",
    "Visitante",
    "Documento",
    "Tipo",
    "Horarios",
    "Autorizador"]

  //#region ATT de ACTIVE
  retrieveByActive: boolean | undefined = true;
  //#endregion

  //#region ATT de FILTROS
  applyFilterWithNumber: boolean = false;
  applyFilterWithCombo: boolean = false;
  contentForFilterCombo: string[] = []
  actualFilter: string | undefined = AuthFilters.NOTHING;
  filterTypes = AuthFilters;
  filterInput: string = "";
  //#endregion

  //#region ATT de DICCIONARIOS
  typeDictionary = VisitorTypeAccessDictionary;
  actionDictionary = AccessActionDictionary;
  dictionaries = [this.typeDictionary, this.actionDictionary]
  //#endregion

  //#region NgOnInit | BUSCAR
  ngOnInit() {
    this.confirmFilter();
    this.getAll();
  }

  ngAfterViewInit(): void {
   this.filterComponent.filter$.subscribe((filter: string) => {
     this.getAllFiltered(filter)
    });
    this.userType = this.userTypeService.getType()
    this.userTypeService.userType$.subscribe((userType: string) => {
      this.userType = userType
      this.confirmFilter();
    });
  }

  //#endregion

  //#region GET_ALL
  getAll() {
    this.authService.getAll(this.currentPage, this.pageSize, this.retrieveByActive).subscribe(data => {
            if(this.userType === "OWNER"){
                data = data.filter(x => x.plot_id == 2)
            }
            if(this.userType === "GUARD"){
                data = data.filter(x => x.is_active)
            }
        data.forEach(date => {
          date.authorizer = this.authorizerCompleterService.completeAuthorizer(date.authorizer_id)
          if (date.authorizer === undefined){
            date.authorizer = this.authorizerCompleterService.completeAuthorizer(1)
          }
        })
        this.completeList = this.transformLotListToTableData(data);
        let response = this.transformResponseService.transformResponse(data,this.currentPage, this.pageSize, this.retrieveByActive)


        this.list = response.content;
        this.filteredList = [...this.list]
        this.lastPage = response.last
        this.totalItems = response.totalElements;
        console.log(this.list);
      },
      error => {
        console.error('Error getting:', error);
      }
    );
  }

  getAllFiltered(filter: string) {
    this.authService.getAll(this.currentPage, this.pageSize, this.retrieveByActive).subscribe(data => {
        data = data.filter(x => (x.visitor.name.toLowerCase().includes(filter) || x.visitor.last_name?.toLowerCase().includes(filter) || x.visitor.doc_number.toString().includes(filter)))
        let response = this.transformResponseService.transformResponse(data,this.currentPage, this.pageSize, this.retrieveByActive)
        response.content.forEach(data => {
          data.authorizer = this.authorizerCompleterService.completeAuthorizer(data.authorizer_id)
        })

        this.list = response.content;
        this.filteredList = [...this.list]
        this.lastPage = response.last
        this.totalItems = response.totalElements;
        console.log(this.list);
      },
      error => {
        console.error('Error getting:', error);
      }
    );
  }

  //#endregion

  //#region FILTROS
  filterByVisitorType(type: string) {
    this.authService.getAll(this.currentPage, this.pageSize, this.retrieveByActive).subscribe(data => {
      data = data.filter(x => x.visitor_type == type)
        let response = this.transformResponseService.transformResponse(data,this.currentPage, this.pageSize, this.retrieveByActive)
        response.content.forEach(data => {
          data.authorizer = this.authorizerCompleterService.completeAuthorizer(data.authorizer_id)
        })

        this.list = response.content;
        this.filteredList = [...this.list]
        this.lastPage = response.last
        this.totalItems = response.totalElements;
      },
      error => {
        console.error('Error getting:', error);
      }
    );
  }

  filterByPlot(plot: number) {
    this.authService.getAll(this.currentPage, this.pageSize, this.retrieveByActive).subscribe(data => {
        data = data.filter(x => x.plot_id == plot)
        let response = this.transformResponseService.transformResponse(data,this.currentPage, this.pageSize, this.retrieveByActive)
        response.content.forEach(data => {
          data.authorizer = this.authorizerCompleterService.completeAuthorizer(data.authorizer_id)
        })

        this.list = response.content;
        this.filteredList = [...this.list]
        this.lastPage = response.last
        this.totalItems = response.totalElements;
      },
      error => {
        console.error('Error getting:', error);
      }
    );
  }

  //#endregion

  //#region APLICACION DE FILTROS
  changeActiveFilter(isActive?: boolean) {
    this.retrieveByActive = isActive
    this.confirmFilter();
  }


  changeFilterMode(mode: AuthFilters) {
    switch (mode) {
      case AuthFilters.NOTHING:
        this.actualFilter = AuthFilters.NOTHING
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = false;
        this.filterComponent.clearFilter();
        this.confirmFilter();
        break;

      case AuthFilters.PLOT_ID:
        this.actualFilter = AuthFilters.PLOT_ID
        this.applyFilterWithNumber = true;
        this.applyFilterWithCombo = false;
        break;

      case AuthFilters.VISITOR_TYPE:
        this.actualFilter = AuthFilters.VISITOR_TYPE
        this.contentForFilterCombo = this.getKeys(this.typeDictionary)
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = true;
        break;

      default:
        break;
    }
  }

  confirmFilter() {
    switch (this.actualFilter) {
      case "NOTHING":
        this.getAll()
        break;

      case "ACTION":
        this.filterByPlot(this.translateCombo(this.filterInput, this.actionDictionary));
        break;

      case "VISITOR_TYPE":
        this.filterByVisitorType(this.translateCombo(this.filterInput, this.typeDictionary));
        break;

      default:
        break;
    }
  }

  //#endregion

  //#region DELETE
  /*  assignPlotToDelete(plot: Plot) {
      //TODO: Este modal se va a modificar por otro mas especifico de Eliminar.
      const modalRef = this.modalService.open(ConfirmAlertComponent)
      modalRef.componentInstance.alertTitle = 'Confirmacion';
      modalRef.componentInstance.alertMessage = `Estas seguro que desea eliminar el lote nro ${plot.plotNumber} de la manzana ${plot.blockNumber}?`;

      modalRef.result.then((result) => {
        if (result) {

          this.plotService.deletePlot(plot.id, 1).subscribe(
            response => {
              this.toastService.sendSuccess('Lote eliminado correctamente.')
              this.confirmFilter();
            }, error => {
              this.toastService.sendError('Error al eliminar lote.')
            }
          );
        }
      })
    }*/

  //#endregion

  //#region RUTEO
  plotOwners(plotId: number) {
    this.router.navigate(["/owners/plot/" + plotId])
  }

  updatePlot(plotId: number) {
    this.router.navigate(["/plot/form/", plotId])
  }

  plotDetail(plotId: number) {
    this.router.navigate([`/plot/detail/${plotId}`])
  }

  //#endregion

  //#region USO DE DICCIONARIOS
  getKeys(dictionary: any) {
    return Object.keys(dictionary);
  }

  translateCombo(value: any, dictionary: any) {
    if (value !== undefined && value !== null) {
      return dictionary[value];
    }
    console.log("Algo salio mal.")
    return;
  }

  translateTable(value: any, dictionary: { [key: string]: any }) {
    if (value !== undefined && value !== null) {
      for (const key in dictionary) {
        if (dictionary[key] === value) {
          return key;
        }
      }
    }
    console.log("Algo salio mal.");
    return;
  }
  transformAuthRanges(ranges : AuthRange[]): string{
    let res = ""
    for (let authRange of ranges) {
      if (!authRange.is_active){
        continue
      }
      let temp = ""
      temp += authRange.date_from.replaceAll('-','/') + ' - ' + authRange.date_to.replaceAll('-','/') + ' | '
      for (let day of authRange.days_of_week) {
        switch (day) {
          case "MONDAY":
            temp += "L"; // Lunes
            break;
          case "TUESDAY":
            temp += "M"; // Martes
            break;
          case "WEDNESDAY":
            temp += "X"; // Miércoles
            break;
          case "THURSDAY":
            temp += "J"; // Jueves
            break;
          case "FRIDAY":
            temp += "V"; // Viernes
            break;
          case "SATURDAY":
            temp += "S"; // Sábado
            break;
          case "SUNDAY":
            temp += "D"; // Domingo
            break;
          default:
            temp += day.charAt(0); // En caso de un valor inesperado
        }
        temp += ','
      }
      temp = temp.slice(0,temp.length-1)

      temp+= ' | ' + authRange.hour_from.slice(0,5) + ' a ' + authRange.hour_to.slice(0,5)

      res += temp + ' y '
    }
    res = res.slice(0,res.length-3)
    return res
  }

  //#endregion

  //#region REACTIVAR
  /*  reactivatePlot(plotId: number) {
      this.plotService.reactivatePlot(plotId, 1).subscribe(
        response => {
          location.reload();
        }
      );
    }*/

  //#endregion

  //#region FUNCIONES PARA PAGINADO
  onItemsPerPageChange() {
    this.confirmFilter();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.confirmFilter();
  }

  //#endregion

  //#region SHOW INFO | TODO
  showInfo() {
    // TODO: En un futuro agregar un modal que mostrara informacion de cada componente
  }

  //#endregion
  transformLotListToTableData(list: any) {
    return list.map((item: { plot_id: any; visitor: { name: any; last_name: any; doc_type: any; doc_number: any; }; visitor_type: any; auth_ranges: AuthRange[]; auth_first_name: any; auth_last_name: any  }) => ({
      'Nro de Lote': item.plot_id || 'No aplica', // Manejo de 'No aplica' para plot_id
      Visitante: `${item.visitor.name} ${item.visitor.last_name || ''}`, // Combina el nombre y el apellido
      Documento: `${(item.visitor.doc_type === "PASSPORT" ? "PASAPORTE" : item.visitor.doc_type)} ${item.visitor.doc_number}`, // Combina el tipo de documento y el número
      Tipo: this.translateTable(item.visitor_type, this.typeDictionary), // Traduce el tipo de visitante
      Horarios: this.transformAuthRanges(item.auth_ranges), // Aplica la función para transformar los rangos de autorización
      Autorizador: `${item.auth_first_name} ${item.auth_last_name}` // Combina el nombre y apellido del autorizador
    }));
  }

  onInfoButtonClick() {
    this.modalService.open(this.infoModal, { size: 'lg' });
    }
  daysOfWeek = [
    DaysOfWeek.MONDAY,
    DaysOfWeek.TUESDAY,
    DaysOfWeek.WEDNESDAY,
    DaysOfWeek.THURSDAY,
    DaysOfWeek.FRIDAY,
    DaysOfWeek.SATURDAY,
    DaysOfWeek.SUNDAY
  ];

  isDayActive(authRange: AuthRange, day: DaysOfWeek): boolean {
    return authRange.days_of_week.includes(day) && authRange.is_active;
  }

  // Obtener inicial de cada día
  getDayInitial(day: DaysOfWeek): string {
    const dayInitials: { [key in DaysOfWeek]: string } = {
      [DaysOfWeek.MONDAY]: 'L',
      [DaysOfWeek.TUESDAY]: 'M',
      [DaysOfWeek.WEDNESDAY]: 'X',
      [DaysOfWeek.THURSDAY]: 'J',
      [DaysOfWeek.FRIDAY]: 'V',
      [DaysOfWeek.SATURDAY]: 'S',
      [DaysOfWeek.SUNDAY]: 'D'
    };
    return dayInitials[day];
  }

  getDocumentAbbreviation(docType: string): string {
    const abbreviations: { [key: string]: string } = {
      'DNI': 'D -',
      'PASSPORT': 'P -',
      'CUIL': 'CL -',
      'CUIT': 'CT -'
    };

    return abbreviations[docType] || docType; // Devuelve la abreviatura o el tipo original si no está en el mapeo
  }

  // Formatear el rango horario
  formatHour(hour: string): string {
    return hour.substring(0, 5); // Para obtener el formato HH:mm
  }

  edit(doc_number: number) {
    this.router.navigate(['/auth/form'], { queryParams: { auth_id: doc_number } });
  }

  disable(auth_id: number) {
  this.authService.delete(auth_id,this.loginService.getLogin().id).subscribe(data => {
    this.confirmFilter();
  })
  }
  qr(doc: number){
    const modalRef = this.modalService.open(QrComponent, {size: 's'});
    modalRef.componentInstance.docNumber = doc
  }
  enable(auth_id: number) {
    this.authService.enable(auth_id,this.loginService.getLogin().id).subscribe(data => {
      this.confirmFilter();
    })
  }
}
