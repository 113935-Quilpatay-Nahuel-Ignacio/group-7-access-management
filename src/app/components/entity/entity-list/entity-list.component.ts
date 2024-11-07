import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  TemplateRef,
  Type,
  ViewChild,
} from '@angular/core';
import { CadastrePlotFilterButtonsComponent } from '../../accesses/cadastre-access-filter-buttons/cadastre-plot-filter-buttons.component';
import {
  Filter,
  FilterConfigBuilder,
  MainContainerComponent,
  ToastService,
} from 'ngx-dabd-grupo01';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AccessActionDictionary,
  AccessFilters,
  AccessModel,
} from '../../../models/access.model';
import { Router, RouterLink } from '@angular/router';
import { AccessService } from '../../../services/access.service';
import { TransformResponseService } from '../../../services/transform-response.service';
import { AuthorizerCompleterService } from '../../../services/authorizer-completer.service';
import { VisitorTypeAccessDictionary } from '../../../models/authorize.model';
import { Visitor } from '../../../models/visitor.model';
import { VisitorFilter, VisitorService } from '../../../services/visitor.service';
import { UserTypeService } from '../../../services/userType.service';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-entity-list',
  standalone: true,
  imports: [
    CadastrePlotFilterButtonsComponent,
    MainContainerComponent,
    NgbPagination,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './entity-list.component.html',
  styleUrl: './entity-list.component.css',
})
export class EntityListComponent implements OnInit, AfterViewInit {
  @ViewChild('filterComponent')
  filterComponent!: CadastrePlotFilterButtonsComponent<Visitor>;
  @ViewChild('table', { static: true })
  tableName!: ElementRef<HTMLTableElement>;
  @ViewChild('infoModal') infoModal!: TemplateRef<any>;

  //#region SERVICIOS
  private router = inject(Router);
  private visitorService = inject(VisitorService);
  private transformResponseService = inject(TransformResponseService);
  private authorizerCompleterService = inject(AuthorizerCompleterService);
  private toastService = inject(ToastService);
  private modalService = inject(NgbModal);
  private userTypeService = inject(UserTypeService);
  private loginService = inject(LoginService);

  //#endregion

  //#region ATT de PAGINADO
  currentPage: number = 1;
  pageSize: number = 10;
  sizeOptions: number[] = [10, 25, 50];
  list: Visitor[] = [];
  completeList: [] = [];
  filteredList: Visitor[] = [];
  lastPage: boolean | undefined;
  totalItems: number = 0;
  visitorFilter : VisitorFilter ={
    active: true
  }
  //#endregion
  heads: string[] = ['Nombre', 'Documento', 'Tipos'];
  props: string[] = ['Nombre', 'Documento', 'Tipos'];

  //#region ATT de ACTIVE
  retrieveByActive: boolean | undefined = true;
  userType: string = 'ADMIN';
  //#endregion

  //#region ATT de FILTROS
  applyFilterWithNumber: boolean = false;
  applyFilterWithCombo: boolean = false;
  contentForFilterCombo: string[] = [];
  actualFilter: string | undefined = AccessFilters.NOTHING;
  filterTypes = AccessFilters;
  filterInput: string = '';
  //#endregion

  //#region ATT de DICCIONARIOS
  typeDictionary = VisitorTypeAccessDictionary;
  actionDictionary = AccessActionDictionary;
  dictionaries = [this.typeDictionary, this.actionDictionary];
  //#endregion

  //#region FILTRADO

  searchParams: { [key: string]: any } = {};

  // Filtro dinámico
  filterType: string = '';
  type: string = '';
  EntityFormComponent!: Type<any>;

  setFilterType(type: string): void {
    this.filterType = type;
  }

  applyFilters(): void {
    if (this.filterType === 'Tipo Visitante') {
      this.searchParams = { visitorTypes: [this.type] };
    }
  }

  clearFilters(): void {
    // Restablece todos los filtros a su valor inicial.
    this.filterType = '';
    this.type = '';
    this.searchParams = {};

    // Reinicia la página actual a la primera
    this.currentPage = 0;

    // Llama a getAll para cargar todos los registros sin filtros
    this.getAll();
  }

  filterConfig: Filter[] = new FilterConfigBuilder()
    .selectFilter(
      'Tipo Visitante',
      'visitorTypes',
      'Seleccione el tipo de visitante',
      [
        { value: 'VISITOR', label: 'Visitante' },
        { value: 'WORKER', label: 'Trabajador' },
        { value: 'OWNER', label: 'Propietario' },
        { value: 'PROVIDER', label: 'Proveedor' },
        { value: 'EMPLOYEE', label: 'Empleado' },
        { value: 'COHABITANT', label: 'Conviviente' },
        { value: 'EMERGENCY', label: 'Emergencia' },
        { value: 'PROVIDER_ORGANIZATION', label: 'Entidad' },
      ]
    )
    .build();


  onFilterValueChange(filters: Record<string, any>) {
    this.searchParams = {
      ...filters,
    };

    if (this.searchParams['visitorTypes']?.length > 0) {
      this.filterByVisitorType(this.searchParams['visitorTypes']);
    } else {
      this.getAll(); // Si no hay tipos seleccionados, mostrar todos
    }
  }
  //#endregion

  //#region NgOnInit | BUSCAR
  ngOnInit() {
    this.confirmFilter();
  }

  ngAfterViewInit(): void {
    this.filterComponent.filter$.subscribe((filter: string) => {
      this.getAllFiltered(filter);
    });
    this.userType = this.userTypeService.getType();
    this.userTypeService.userType$.subscribe((userType: string) => {
      this.userType = userType;
    });
  }

  //#endregion

  //#region GET_ALL
  getAll() {
    this.visitorService
      .getAllPaginated(this.currentPage-1, this.pageSize , this.visitorFilter)
      .subscribe({
        next: (data) => {
          this.completeList = this.transformListToTableData(data.items);
          let response = this.transformResponseService.transformResponse(
            data.items,
            this.currentPage,
            this.pageSize,
            this.retrieveByActive
          );
          console.log(data)
          this.list = response.content;
          this.filteredList = [...this.list];
          this.lastPage = response.last;
          this.totalItems = data.totalElements;
        },
        error: (error) => {
          console.error('Error getting visitors:', error);
        },
      });
  }

  getAllFiltered(filter: string) {
    this.visitorService
      .getAll(this.currentPage - 1, this.pageSize, this.retrieveByActive)
      .subscribe({
        next: (data) => {
          const filteredItems = data.items.filter(
            (x) =>
              x.name.toLowerCase().includes(filter.toLowerCase()) ||
              (x.lastName &&
                x.lastName.toLowerCase().includes(filter.toLowerCase())) ||
              x.docNumber.toString().includes(filter)
          );

          let response = this.transformResponseService.transformResponse(
            filteredItems,
            this.currentPage,
            this.pageSize,
            this.retrieveByActive
          );

          this.completeList = this.transformListToTableData(filteredItems);
          this.list = response.content;
          this.filteredList = [...this.list];
          this.lastPage = response.last;
          this.totalItems = filteredItems.length;
        },
        error: (error) => {
          console.error('Error getting visitors:', error);
        },
      });
  }

  getDocumentAbbreviation(docType: string): string {
    const abbreviations: { [key: string]: string } = {
      DNI: 'D -',
      PASSPORT: 'P -',
      CUIL: 'CL -',
      CUIT: 'CT -',
    };

    return abbreviations[docType] || docType; // Devuelve la abreviatura o el tipo original si no está en el mapeo
  }
  //#endregion

  //#region FILTROS
  filterByVisitorType(type: string[]) {
    this.visitorService
      .getAll(this.currentPage - 1, this.pageSize, this.retrieveByActive)
      .subscribe({
        next: (data) => {
          // Filtrar los items que contienen al menos uno de los tipos seleccionados
          const filteredItems = data.items.filter((x) =>
            x.visitorTypes.some((visitorType: string) =>
              type.includes(visitorType)
            )
          );

          let response = this.transformResponseService.transformResponse(
            filteredItems,
            this.currentPage,
            this.pageSize,
            this.retrieveByActive
          );

          this.completeList = this.transformListToTableData(filteredItems);
          this.list = response.content;
          this.filteredList = [...this.list];
          this.lastPage = response.last;
          this.totalItems = filteredItems.length;
        },
        error: (error) => {
          console.error('Error getting visitors:', error);
        },
      });
  }

  filterByAction(action: string) {
    /*this.visitorService.getByAction(this.currentPage, this.pageSize, action, this.retrieveByActive).subscribe(data => {
        let response = this.transformResponseService.transformAction(data,this.currentPage, this.pageSize, action, this.retrieveByActive)
        response.content.forEach(data => {
          data.authorizer = this.authorizerCompleterService.completeAuthorizer(data.authorizerId)
        })

        this.list = response.content;
        this.filteredList = [...this.list]
        this.lastPage = response.last
        this.totalItems = response.totalElements;
      },
      error => {
        console.error('Error getting:', error);
      }
    );*/
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
    this.router.navigate(['/owners/plot/' + plotId]);
  }

  updatePlot(plotId: number) {
    this.router.navigate(['/plot/form/', plotId]);
  }

  plotDetail(plotId: number) {
    this.router.navigate([`/plot/detail/${plotId}`]);
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
    console.log('Algo salio mal.');
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
    console.log('Algo salio mal.');
    return;
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

  confirmFilter(): void {
    this.visitorService.getAllPaginated(this.currentPage - 1, this.pageSize, { active: true }).subscribe(response => {
      this.filteredList = response.items;
      this.list = response.items
      this.totalItems = response.totalElements;
    });
  }

  onItemsPerPageChange() {
    this.confirmFilter();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.confirmFilter();
  }

  //#endregion

  editVisitor(id: number) {}
  deleteVisitor(id: number) {}
  transformListToTableData(list: any) {
    return list.map(
      (item: {
        name: any;
        lastName: any;
        docType: any;
        docNumber: any;
        visitorTypes: any[]; // Suponiendo que visitorTypes es un array
      }) => ({
        Nombre: `${item.name} ${item.lastName}`,
        Documento: `${
          item.docType === 'PASSPORT' ? 'PASAPORTE' : item.docType
        } ${item.docNumber}`,
        Tipos: item.visitorTypes
          ?.map((type) => this.translateTable(type, this.typeDictionary))
          .join(', '), // Traducir cada tipo y unirlos en una cadena
      })
    );
  }

  onInfoButtonClick() {
    this.modalService.open(this.infoModal, { centered: true, size: 'lg' });
  }

  edit(docNumber: any) {

  }

    disable(visitorId: number) {
    this.visitorService.delete(visitorId,this.loginService.getLogin().id).subscribe(data => {
      this.getAll();
    })
  }

  enable(visitorId: number) {
    this.visitorService.enable(visitorId,this.loginService.getLogin().id).subscribe(data => {
      this.getAll();
    })
  }

}
