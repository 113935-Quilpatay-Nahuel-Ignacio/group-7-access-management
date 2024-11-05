import { Component } from '@angular/core';
import { VisitorService } from '../../services/visitor.service';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Visitor } from '../../models/visitor.model';
import { PaginatedResponse } from '../../../paginated-response.model';

@Component({
  selector: 'app-visitor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterOutlet],
  templateUrl: './visitor-list.component.html',
})
export class VisitorListComponent {
  visitors: Visitor[] = [];
  totalElements: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  nameFilter: string = '';
  lastNameFilter: string = '';
  searchFilter: string = '';

  pages: number[] = []; // Añadido para almacenar las páginas

  constructor(private visitorService: VisitorService) {}

  ngOnInit(): void {
    this.loadVisitors();
  }

  loadVisitors(): void {
    this.visitorService
      .getVisitors(
        this.currentPage,
        this.pageSize,
        this.nameFilter,
        this.lastNameFilter,
        this.searchFilter
      )
      .subscribe((response: PaginatedResponse<Visitor>) => {
        this.visitors = response.items;
        this.totalElements = response.total_elements;

        // Calculamos el número de páginas y las almacenamos en un array
        this.pages = Array.from(
          { length: Math.ceil(this.totalElements / this.pageSize) },
          (_, i) => i
        );
      });
  }

  deleteVisitor(id: number): void {
    if (confirm('¿Está seguro que quiere eliminar este visitante?')) {
      this.visitorService.deleteVisitor(id).subscribe(() => {
        this.visitors = this.visitors.filter((v) => v.visitor_id !== id);
      });
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadVisitors();
  }

  onSearch(): void {
    this.loadVisitors();
  }
}
