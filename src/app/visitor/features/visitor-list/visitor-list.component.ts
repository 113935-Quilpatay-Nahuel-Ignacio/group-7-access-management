import { Component } from '@angular/core';
import { VisitorService } from '../../services/visitor.service';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Visitor } from '../../models/visitor.model';

@Component({
  selector: 'app-visitor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterOutlet],
  templateUrl: './visitor-list.component.html',
})
export class VisitorListComponent {
  visitors: Visitor[] = [];

  constructor(private visitorService: VisitorService) {}

  ngOnInit(): void {
    this.visitorService.getVisitors().subscribe((data) => {
      this.visitors = data;
    });
  }

  deleteVisitor(id: number): void {
    if (confirm('¿Está seguro que quiere eliminar este visitante?')) {
      this.visitorService.deleteVisitor(id).subscribe(() => {
        this.visitors = this.visitors.filter((v) => v.visitor_id !== id);
      });
    }
  }
}
