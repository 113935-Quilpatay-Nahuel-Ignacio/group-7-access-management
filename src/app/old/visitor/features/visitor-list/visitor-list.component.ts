import { Component, ElementRef, inject, NgModule, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableColumn, TableComponent } from 'ngx-dabd-grupo01';

import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Visitor } from '../../models/visitor.model';
import { filterVisitor, VisitorService } from '../../services/visitor.service';
import { CadastreExcelService } from '../../../../services/cadastre-excel.service';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


@Component({
  selector: 'app-visitor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TableComponent , NgbModule],
  templateUrl: './visitor-list.component.html',
})
export class VisitorListComponent {

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
  contentForFilterCombo: string[] = []
  filterTypes = filterVisitor ;
  actualFilter: string | undefined = filterVisitor.NOTHING;
  filterInput: string = "";


  @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>; // Accedemos al ng-template
  @ViewChild('table') tableComponent!: TableComponent;
  @ViewChild('tableElement') tableElement!: ElementRef;
  @ViewChild('infoModal') infoModal!: TemplateRef<any>;

  columns: TableColumn[] = [];
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      // Configuramos las columnas, incluyendo la de acciones
      this.columns = [
        { headerName: 'Tipo de documento', accessorKey: 'doc_type' },
        { headerName: 'Numero de documento', accessorKey: 'doc_number' },
        { headerName: 'Nombre', accessorKey: 'name' },
        { headerName: 'Apellido', accessorKey: 'last_name' },
        {
          headerName: 'Acciones',
          accessorKey: 'actions',
          cellRenderer: this.actionsTemplate, // Renderizamos la plantilla de acciones
        },
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
    this.visitorService.getVisitors(this.page -1, this.size , filter).subscribe({
    next: (data) => {
      console.log(data)

      this.visitors = data.items.map(visitor => {
        if (visitor.doc_type === 'PASSPORT') {
          visitor.doc_type = 'PASAPORTE';
        }
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


  editVisitor(idVisitor: number): void {
   
    this.router.navigate(['visitor/edit/'+ idVisitor]);
  }

  deleteVisitor(id: number): void {
    if (confirm('¿Está seguro que quiere eliminar este visitante?')) {
      this.visitorService.deleteVisitor(id).subscribe(() => {
        this.visitors = this.visitors.filter((v) => v.visitor_id !== id);
      });
    }
  }
  
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
    this.visitorService.getVisitors(0, this.totalItems) 
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

  onExcelButtonClick() {
    const worksheet = XLSX.utils.json_to_sheet(this.visitors);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitors');
    
    // Exporta el archivo Excel
    XLSX.writeFile(workbook, 'Visitors.xlsx');
 }
 

  onInfoButtonClick() {
    this.modalService.open(this.infoModal, { size: 'lg' });
    }


  filterVisitorsByDocumentType(docType: string): void {
      // Verifica si el tipo de documento está vacío
      debugger;
      if (docType) {
        // Filtra los visitantes en memoria
        if(docType === "PASAPORTE" ){
          docType = 'PASSPORT'; 
        }
        this.filteredVisitors = this.visitors.filter(visitor => visitor.doc_type === docType);
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
        case filterVisitor.DOCUMENT_TYPE:
          this.actualFilter = filterVisitor.DOCUMENT_TYPE;
          this.contentForFilterCombo = ['DNI', 'PASAPORTE', 'CUIL', 'CUIT'];
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
    
        case "DOCUMENT_TYPE":
          this.filterVisitorsByDocumentType(this.filterInput);
          break;
    
        default:
          break;
      }
    }

}
