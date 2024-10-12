import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs'; // Importamos 'of' para inicializar con un Observable vacío
import { VisitorService } from '../../services/visitor.service';
import { Visitor } from '../../models/visitor.model';

@Component({
  selector: 'app-visitor-list',
  standalone: true,  // Indica que este componente es independiente y no necesita estar dentro de un módulo específico
  imports: [CommonModule, FormsModule, RouterModule],  // Se importan los módulos necesarios
  templateUrl: './visitor-list.component.html',  // Se define el archivo de la plantilla
})
export class VisitorListComponent implements OnInit {
  visitors$: Observable<Visitor[]> = of([]);  // Inicializamos visitors$ con un Observable vacío para evitar errores de compilación

  constructor(private visitorService: VisitorService) {}  // Inyectamos el servicio VisitorService

  // En ngOnInit cargamos los datos reales desde el servicio
  ngOnInit(): void {
    this.visitors$ = this.visitorService.getVisitors();  // Se asigna el Observable de visitantes que viene del servicio
  }

  deleteVisitor(id: number): void {
    // Confirmación antes de eliminar un visitante
    if (confirm('¿Está seguro que quiere eliminar este visitante?')) {
      this.visitorService.deleteVisitor(id).subscribe(() => {
        // Después de eliminar, recargamos la lista de visitantes para reflejar los cambios
        this.visitors$ = this.visitorService.getVisitors();  // Refresca la lista de visitantes después de la eliminación
      });
    }
  }

  // Función trackBy para mejorar el rendimiento de la lista, ayudando a Angular a identificar los elementos únicos en el *ngFor
  trackByVisitorId(index: number, visitor: Visitor): number {
    return visitor.visitorId;
  }
}
