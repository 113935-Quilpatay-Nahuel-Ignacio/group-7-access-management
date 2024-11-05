import {AfterViewInit, Component, ElementRef, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {
    CadastrePlotFilterButtonsComponent
} from "../../accesses/cadastre-access-filter-buttons/cadastre-plot-filter-buttons.component";
import {MainContainerComponent, TableColumn, TableComponent, ToastService} from "ngx-dabd-grupo01";
import {NgbModal, NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AccessActionDictionary, AccessFilters, AccessModel} from "../../../models/access.model";
import {Router} from "@angular/router";
import {AccessService} from "../../../services/access.service";
import {TransformResponseService} from "../../../services/transform-response.service";
import {AuthorizerCompleterService} from "../../../services/authorizer-completer.service";
import {VisitorTypeAccessDictionary} from "../../../models/authorize.model";
import {Visitor} from "../../../models/visitor.model";
import {filterVisitor, VisitorService} from "../../../services/visitor.service";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { EntityFormComponent } from '../entity-form/entity-form.component';

@Component({
  selector: 'app-entity-list',
  standalone: true,
  imports: [
    CadastrePlotFilterButtonsComponent,
    MainContainerComponent,
    NgbPagination,
    ReactiveFormsModule,
    FormsModule,
    TableComponent
  ],
  templateUrl: './entity-list.component.html',
  styleUrl: './entity-list.component.css'
})
export class EntityListComponent  implements OnInit, AfterViewInit {
    private visitorService = inject(VisitorService);
    private router = inject(Router);
    private modalService = inject(NgbModal);

    visitors: Visitor[] = [];
  filteredVisitors: Visitor[] = [];
  isLoading = true;
  // Filtros por el buscador
  searchFilter: string = ''; 

    // Filtros
    applyFilterWithNumber: boolean = false;
    applyFilterWithCombo: boolean = false;
    contentForFilterCombo: string[] =[];
    filterTypes = filterVisitor ;
    actualFilter: string | undefined = filterVisitor.NOTHING;
    filterInput: string = "";


  @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>; // Accedemos al ng-template
  @ViewChild('table') tableComponent!: TableComponent;
  @ViewChild('tableElement') tableElement!: ElementRef;
  @ViewChild('infoModal') infoModal!: TemplateRef<any>;

  @ViewChild('nameTemplate') nameColumn!: TemplateRef<any>;
  @ViewChild('documentTemplate') documentColumn!: TemplateRef<any>;

  columns: TableColumn[] = [];
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      // Configuramos las columnas, incluyendo la de acciones
      this.columns = [
        { headerName: 'Nombre', accessorKey: 'name' , cellRenderer: this.nameColumn},
        { headerName: 'Documento', accessorKey: 'doc_type' , cellRenderer: this.documentColumn},
        { headerName: 'Tipo', accessorKey: 'visitor_types' },
      ];
    });
  }

  page: number = 1;
  size: number = 10;
  totalItems: number = 0;


  ngOnInit(): void {
    this.loadVisitors();
  }

  loadVisitors(filter?: string): void {
    this.isLoading = true;
    this.visitorService.getAll(this.page -1, this.size ,filter ,true).subscribe({
    next: (data) => {
      console.log(data)

      this.visitors = data.items.map(visitor => {
        if (visitor.doc_type === 'PASSPORT') {
          visitor.doc_type = 'PASS';
        }
        visitor.visitor_types = visitor.visitor_types.map(this.traslateVisitorTypes);
        return visitor;
      });

      this.filteredVisitors = this.visitors;
      this.totalItems = data.total_elements;
      this.isLoading = false;
    },
    error : (error) => {
      console.log(error);
    }
    });
  }

  onPageChange = (page: number): void => {
    this.page = page;
    this.loadVisitors();
  };

  onPageSizeChange = (size: number): void => {
    this.size = size;
    this.loadVisitors();
  };

 onFilterChange = (filter: string): void => {
    console.log(filter);
    
    if(filter === '') {
      this.loadVisitors();
    }else{
      this.loadVisitors(filter);
    }
  };

  
    getActualDayFormat() {
      const today = new Date();
      const formattedDate = today.getDate() + '-' +(today.getMonth() + 1 )+ '-' + today.getFullYear();
      return formattedDate;
    }
  
  async onPdfButtonClick() {
    console.log('Generando PDF...');
    
    const doc = new jsPDF();

    // Título del PDF
    doc.setFontSize(18);
    doc.text('Listado de visitantes', 14, 20);

    // Llamada al servicio para obtener todos los visitantes
    this.visitorService.getAll(0, this.totalItems) 
      .subscribe(visitors => {
        if (visitors.items.length === 0) {
          console.warn('No hay visitantes para exportar.');
          doc.text('No hay visitantes para exportar.', 14, 30);
          doc.save(this.getActualDayFormat() + '_visitantes.pdf');
          return;
        }

        // Usamos autoTable para agregar la tabla con los datos de los visitantes
        autoTable(doc, {
          startY: 30,
          head: [['Tipo de documento', 'Número de documento', 'Nombre', 'Apellido']],
          body: visitors.items.map(visitor => [
            visitor.doc_type === 'PASSPORT' ? 'PASAPORTE' : visitor.doc_type, // Ajustamos el tipo de documento
            visitor.doc_number,
            visitor.name,
            visitor.last_name,
          ]),
        });

        // Guardamos el PDF
        doc.save(this.getActualDayFormat() + '_visitantes.pdf');
        console.log('PDF generado y guardado con éxito.');
      });
  }


  onHeaderButtonClick() {
    this.modalService.open(EntityFormComponent, { centered: true });
  }

  onExcelButtonClick() {
    const worksheet = XLSX.utils.json_to_sheet(this.visitors);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitors');
    
    // Exporta el archivo Excel
    XLSX.writeFile(workbook, this.getActualDayFormat() + '_visitantes.xlsx');
 }
 
 traslateVisitorTypes(visitorType: string): string {
   switch (visitorType) {
     case 'VISITOR':
       return 'Visitante';
     case 'PROVIDER':
       return 'Proveedor';
     case 'EMERGENCY':
       return 'Emergencia';
     case 'PROVIDER_ORGANIZATION':
       return 'Entidad';
     case 'OWNER':
       return 'Propietario';
     case 'WORKER':
       return 'Trabajador';
      case 'EMPLOYEE':
       return 'Empleado';   
     default:
       return 'No definido';
   }
 }

  filterVisitorsByDocumentType(docType: string): void {
      // Verifica si el tipo de documento está vacío
      debugger;
      if (docType) {
        if(docType === 'PASAPORTE') {
          docType = 'PASS';
        }
        this.filteredVisitors = this.visitors.filter(visitor => visitor.doc_type === docType);
      } else {
        
        this.filteredVisitors = [];
      }
    }


    filterVisitorsByVisitorType(visitorType: string): void {
      // Verifica si el tipo de documento está vacío
      debugger;
    
      if (visitorType) {
        this.filteredVisitors = this.visitors.filter(visitor => 
          visitor.visitor_types.some(type => type === visitorType));
          
      } else {
        
        this.filteredVisitors = [];
      }
    }

    changeFilterMode(mode: filterVisitor) {
      switch (mode) {
        case filterVisitor.NOTHING:
          this.actualFilter = filterVisitor.NOTHING
          this.applyFilterWithNumber = false;
          this.applyFilterWithCombo = false;
          this.confirmFilter();
          break;
    
        case filterVisitor.DOCUMENT_NUMBER:
          this.actualFilter = filterVisitor.DOCUMENT_NUMBER
          this.applyFilterWithNumber = true;
          this.applyFilterWithCombo = false;
      
          break;
        case filterVisitor.VISITOR_TYPE:
          this.actualFilter = filterVisitor.VISITOR_TYPE;
          this.contentForFilterCombo = ['Propietario', 'Visitante', 'Trabajador', 'Proveedor' ,'Entidad' , 'Empleado' , 'Conviviente' , 'Emergencia'  ];	
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
          this.loadVisitors();
          break;
    
        case "DOCUMENT_NUMBER":
          this.loadVisitors(this.filterInput);
          break;
    
        case "VISITOR_TYPE":
          this.filterVisitorsByVisitorType(this.filterInput);
          break;
    
        default:
          break;
      }
    }

  onInfoButtonClick() {
    this.modalService.open(this.infoModal, {centered: true, size: 'lg'});
    }
}
