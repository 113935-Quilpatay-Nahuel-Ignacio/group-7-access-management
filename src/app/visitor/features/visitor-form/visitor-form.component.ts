import { Component, inject } from '@angular/core';
import { VisitorService } from '../../services/visitor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SendVisitor, Visitor } from '../../models/visitor.model';
import moment from 'moment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-visitor-form',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './visitor-form.component.html',
})
export class VisitorFormComponent {
  visitor: SendVisitor = {
    name: '',
    owner_id: 0,
    last_name: '',
    doc_number: '',
    birth_date: new Date(),
    is_active: true,
  };

  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly visitorService = inject(VisitorService)


  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.visitorService.getVisitor(+id).subscribe((data) => {
        this.visitor = {
          name: data.name,
          owner_id:data.owner_id,
          last_name : data.last_name,
          doc_number:data.doc_number,
          is_active: data.is_active,
          birth_date: moment(data.birth_date, 'DD-MM-YYYY').toDate(),
        };
      });
    }
  }

  saveVisitor(): void {
    const formattedVisitor = {
      ...this.visitor,
      birth_date: moment(this.visitor.birth_date).format('DD-MM-YYYY'),
    };
  
    console.log(formattedVisitor); 
    this.visitorService.upsertVisitor(formattedVisitor).subscribe(() => {
      this.router.navigate(['/visitors']);
    });
  }
  
}
