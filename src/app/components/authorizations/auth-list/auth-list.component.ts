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
import {MainContainerComponent, ToastService} from "ngx-dabd-grupo01";
import {NgbModal, NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {AccessActionDictionary, AccessModel} from "../../../models/access.model";
import {AccessService} from "../../../services/access.service";
import {TransformResponseService} from "../../../services/transform-response.service";
import { CadastreExcelService } from '../../../services/cadastre-excel.service';

@Component({
  selector: 'app-auth-list',
  standalone: true,
  imports: [
    CadastrePlotFilterButtonsComponent,
    MainContainerComponent,
    NgbPagination,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './auth-list.component.html',
  styleUrl: './auth-list.component.css'
})
export class AuthListComponent  implements OnInit, AfterViewInit {

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
  //#endregion

  //#region ATT de PAGINADO
  currentPage: number = 0
  pageSize: number = 10
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
  }

  //#endregion

  //#region GET_ALL
  getAll() {
    this.authService.getAll(this.currentPage, this.pageSize, this.retrieveByActive).subscribe(data => {
        data.forEach(date => {
          date.authorizer = this.authorizerCompleterService.completeAuthorizer(date.authorizer_id)
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

       if(authRange.hour_from && authRange.hour_to != null){

        temp+= ' | ' +  authRange.hour_from.slice(0,5) + ' a ' + authRange.hour_to.slice(0,5)
      } 

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
    return list.map((item: { plot_id: any; visitor: { name: any; last_name: any; doc_type: any; doc_number: any; }; visitor_type: any; auth_ranges: AuthRange[]; authorizer: { name: any; last_name: any; }; }) => ({
      'Nro de Lote': item.plot_id || 'No aplica', // Manejo de 'No aplica' para plot_id
      Visitante: `${item.visitor.name} ${item.visitor.last_name || ''}`, // Combina el nombre y el apellido
      Documento: `${(item.visitor.doc_type === "PASSPORT" ? "PASAPORTE" : item.visitor.doc_type)} ${item.visitor.doc_number}`, // Combina el tipo de documento y el número
      Tipo: this.translateTable(item.visitor_type, this.typeDictionary), // Traduce el tipo de visitante
      Horarios: this.transformAuthRanges(item.auth_ranges), // Aplica la función para transformar los rangos de autorización
      Autorizador: `${item.authorizer.name} ${item.authorizer.last_name}` // Combina el nombre y apellido del autorizador
    }));
  }

  onInfoButtonClick() {
    this.modalService.open(this.infoModal, { size: 'lg' });
    }
}
