import {AfterViewInit, Component, ElementRef, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NgIf} from "@angular/common";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Auth, VisitorTypeAccessDictionary} from "../../../models/authorize.model";
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router} from "@angular/router";
import {AccessActionDictionary, AccessFilters, AccessModel} from "../../../models/access.model";
import {AccessService} from "../../../services/access.service";
import {AuthorizerCompleterService} from "../../../services/authorizer-completer.service";
import {
  CadastrePlotFilterButtonsComponent
} from "../cadastre-access-filter-buttons/cadastre-plot-filter-buttons.component";
import {NgbModal, NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {MainContainerComponent, TableComponent, ToastService} from "ngx-dabd-grupo01";
import {PaginatedResponse} from "../../../models/api-response";
import {TransformResponseService} from "../../../services/transform-response.service";

@Component({
  selector: 'app-access-list',
  standalone: true,
  imports: [
    NgIf,
    CommonModule,
    ReactiveFormsModule,
    CadastrePlotFilterButtonsComponent,
    NgbPagination,
    MainContainerComponent,
    FormsModule,
    TableComponent
  ],
  templateUrl: './access-list.component.html',
  styleUrl: './access-list.component.css'
})
export class AccessListComponent implements OnInit, AfterViewInit {

  @ViewChild('filterComponent') filterComponent!: CadastrePlotFilterButtonsComponent<AccessModel>;
  @ViewChild('table', {static: true}) tableName!: ElementRef<HTMLTableElement>;
  @ViewChild('infoModal') infoModal!: TemplateRef<any>;

  //#region SERVICIOS
  private router = inject(Router)
  private accessService = inject(AccessService)
  private transformResponseService = inject(TransformResponseService)
  private authorizerCompleterService = inject(AuthorizerCompleterService)
  private toastService = inject(ToastService)
  private modalService = inject(NgbModal)
  //#endregion

  //#region ATT de PAGINADO
  currentPage: number = 0
  pageSize: number = 10
  sizeOptions: number[] = [10, 25, 50]
  list: AccessModel[] = [];
  completeList: AccessModel[] = [];
  filteredList: AccessModel[] = [];
  lastPage: boolean | undefined
  totalItems: number = 0;
  //#endregion

  heads: string[] =["Visitante", "Documento", "Tipo", "Accion", "Hora", "Vehículo", "Comentario", "Autorizador"]
  props: string[] =["Visitante", "Documento", "Tipo", "Accion", "Hora", "Vehículo", "Comentario", "Autorizador" ]

  //#region ATT de ACTIVE
  retrieveByActive: boolean | undefined = true;
  //#endregion

  //#region ATT de FILTROS
  applyFilterWithNumber: boolean = false;
  applyFilterWithCombo: boolean = false;
  contentForFilterCombo: string[] = []
  actualFilter: string | undefined = AccessFilters.NOTHING;
  filterTypes = AccessFilters;
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
  }

  ngAfterViewInit(): void {
    this.filterComponent.filter$.subscribe((filter: string) => {
      this.getAllFiltered(filter)
    });
  }

  //#endregion

  //#region GET_ALL
  getAll() {
    this.accessService.getAll(this.currentPage, this.pageSize, this.retrieveByActive).subscribe(data => {
      console.log(data)
        data.forEach(date => {
          date.authorizer = this.authorizerCompleterService.completeAuthorizer(date.authorizer_id)
        })
      this.completeList = this.transformListToTableData(data);
        let response = this.transformResponseService.transformResponse(data,this.currentPage, this.pageSize, this.retrieveByActive)


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
  //#region GET_ALL
  getAllFiltered(filter: string) {
    this.accessService.getAll(this.currentPage, this.pageSize, this.retrieveByActive).subscribe(data => {
      data = data.filter(x => (x.first_name.toLowerCase().includes(filter) || x.last_name.toLowerCase().includes(filter) || x.doc_number.toString().includes(filter) || x.vehicle_reg.toLowerCase().includes(filter)))
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

  //#region FILTROS
  filterByVisitorType(type: string) {
    this.accessService.getByType(this.currentPage, this.pageSize, type, this.retrieveByActive).subscribe(data => {
        let response = this.transformResponseService.transformType(data,this.currentPage, this.pageSize, type, this.retrieveByActive)
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

  filterByAction(action: string) {
    this.accessService.getByAction(this.currentPage, this.pageSize, action, this.retrieveByActive).subscribe(data => {
      let response = this.transformResponseService.transformAction(data,this.currentPage, this.pageSize, action, this.retrieveByActive)
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


  changeFilterMode(mode: AccessFilters) {
    switch (mode) {
      case AccessFilters.NOTHING:
        this.actualFilter = AccessFilters.NOTHING
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = false;
        this.filterComponent.clearFilter();
        this.confirmFilter();
        break;

      case AccessFilters.ACTION:
        this.actualFilter = AccessFilters.ACTION
        this.contentForFilterCombo = this.getKeys(this.actionDictionary)
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = true;
        break;

      case AccessFilters.VISITOR_TYPE:
        this.actualFilter = AccessFilters.VISITOR_TYPE
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
        this.filterByAction(this.translateCombo(this.filterInput, this.actionDictionary));
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

  transformDate(dateString: string): string{
    const date = new Date(dateString);

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${hours}:${minutes} ${day}-${month}-${year}`;
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

  filterChange(data: any){
    console.log(data)
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

  protected readonly oninput = oninput;

  transformListToTableData(list :any) {
    return list.map((item: { first_name: any; last_name: any; doc_type: any; doc_number: any; visitor_type: any; action: any; action_date: any; vehicle_reg: any; comments: any; authorizer: { name: any; last_name: any; }; }) => ({
      Visitante: `${item.first_name} ${item.last_name}`,
      Documento: `${(item.doc_type === "PASSPORT" ? "PASAPORTE" : item.doc_type)} ${item.doc_number}`,
      Tipo: this.translateTable(item.visitor_type, this.typeDictionary),
      Accion: this.translateTable(item.action, this.actionDictionary),
      Hora: this.transformDate(item.action_date),
      Vehículo: item.vehicle_reg || 'N/A',  // 'N/A' si no hay registro de vehículo
      Comentario: item.comments || 'N/A',
      Autorizador: `${item.authorizer?.name || ''} ${item.authorizer?.last_name || ''}`
    }));
  }

  onInfoButtonClick() {
    this.modalService.open(this.infoModal, { size: 'lg' });
    }
}
