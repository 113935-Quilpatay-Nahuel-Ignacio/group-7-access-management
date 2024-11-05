import {Component, inject, Input} from '@angular/core';
import {Subject} from 'rxjs';
import {CadastreExcelService} from '../../../services/cadastre-excel.service';
import {Router} from '@angular/router';
import {AccessService} from "../../../services/access.service";
import {TransformResponseService} from "../../../services/transform-response.service";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-cadastre-plot-filter-buttons',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './cadastre-plot-filter-buttons.component.html',
  styleUrl: './cadastre-plot-filter-buttons.component.css'
})
export class CadastrePlotFilterButtonsComponent<T extends Record<string, any>> {
  private router = inject(Router);
  private transformResponseService = inject(TransformResponseService);
  private service = inject(AccessService);
  private excelService = inject(CadastreExcelService);

  filterText: string = "";
  selectedFilter: string | null = null;
  filterValue: string = "";
  filterDateStart: string = "";
  filterDateEnd: string = "";
  showFilterInput: boolean = false;
  filterInputType: 'text' | 'select' | 'date' = 'text';
  filterOptions: Array<{ value: string, label: string }> = [];

  readonly filterTypes: Record<string, string> = {
    'visitor': 'Tipo de visitante',
    'document': 'Documento',
    'date': 'Fecha',
    'status': 'Estado'
  };

  availableFilters = [
    { value: 'visitor', label: 'Tipo de visitante' },
    { value: 'document', label: 'Documento' },
    { value: 'date', label: 'Fecha' },
    { value: 'status', label: 'Estado' }
  ];

  @Input() tableName!: HTMLTableElement;
  @Input() itemsList!: T[];
  @Input() heads!: string[];
  @Input() props!: string[];
  @Input() formPath: string = "";
  @Input() objectName: string = "";
  @Input() dictionaries: Array<{ [key: string]: any }> = [];

  private filterSubject = new Subject<string>();
  filter$ = this.filterSubject.asObservable();

  // Select filter type
  selectFilter(filterType: string) {
    this.selectedFilter = filterType;
    this.showFilterInput = true;
    this.filterValue = '';
    this.filterDateStart = '';
    this.filterDateEnd = '';

    switch (filterType) {
      case 'visitor':
        this.filterInputType = 'select';
        this.filterOptions = [
          { value: 'propietario', label: 'Propietario' },
          { value: 'visitante', label: 'Visitante' },
          { value: 'trabajador', label: 'Trabajador' }
        ];
        break;
      case 'date':
        this.filterInputType = 'date';
        break;
      default:
        this.filterInputType = 'text';
        break;
    }
  }

  // Apply selected filter
  applyFilter() {
    let filterCriteria = '';

    switch (this.selectedFilter) {
      case 'date':
        if (this.filterDateStart && this.filterDateEnd) {
          filterCriteria = `date:${this.filterDateStart}:${this.filterDateEnd}`;
        }
        break;
      default:
        if (this.filterValue) {
          filterCriteria = `${this.selectedFilter}:${this.filterValue}`;
        }
        break;
    }

    this.filterSubject.next(filterCriteria);
  }

  // Clear all filters
  clearFilters() {
    this.selectedFilter = null;
    this.filterValue = '';
    this.filterDateStart = '';
    this.filterDateEnd = '';
    this.showFilterInput = false;
    this.filterSubject.next('');
  }

  onFilterTextBoxChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    this.filterSubject.next(target.value.toLowerCase());
  }

  // Export functions remain the same
  exportToPdf() {
    this.excelService.exportListToPdf(
      this.itemsList, 
      this.heads, 
      this.props, 
      `${this.getActualDayFormat()}_${this.objectName}`
    );
  }

  exportToExcel() {
    this.excelService.exportListToExcel(
      this.itemsList, 
      this.heads, 
      this.props, 
      `${this.getActualDayFormat()}_${this.objectName}`
    );
  }

  getActualDayFormat() {
    const today = new Date();
    return today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
  }

  redirectToForm() {
    this.router.navigate([this.formPath]);
  }

  clearFilter() {
    this.filterText = "";
    this.clearFilters();
  }
}
