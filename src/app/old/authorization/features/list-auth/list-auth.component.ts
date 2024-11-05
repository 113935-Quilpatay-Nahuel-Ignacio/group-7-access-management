import { Component, inject, OnInit } from '@angular/core';
import { AuthRangeService } from '../../services/auth-range.service';
import { AuthDTO } from '../../models/authorized-range.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-auth',
  standalone: true,
  imports: [FormsModule , CommonModule],
  templateUrl: './list-auth.component.html',
  styleUrl: './list-auth.component.css'
})
export class ListAuthComponent implements OnInit{
  
  private serviceAuhtRange = inject(AuthRangeService);

  authRecords: AuthDTO[] = [];
  docNumber: number | null = null ; 

  constructor() {}
  ngOnInit(): void {
    this.getAuthRecords(); 
  }

  getAuthRecords(): void {
  
    if (this.docNumber !== null) {
      this.serviceAuhtRange.getAuhtByDocNumber(this.docNumber).subscribe({
        next: (data) => {
          console.log(data);
          this.authRecords = data;
        },
        error: (err) => {
          console.error('Error fetching auth records:', err);
        },
        complete: () => {
          console.log('Fetch auth records complete.');
        }
      });
    } else {
      // Si docNumber es null obtiene todos los registros
      this.serviceAuhtRange.getAllAuths().subscribe({
        next: (data) => {
          console.log(data);
          this.authRecords = data;
        },
        error: (err) => {
          console.error('Error fetching all auth records:', err);
        },
        complete: () => {
          console.log('Fetch all auth records complete.');
        }
      });
    }
  }

  translateDays(daysString: string): string {

    if(!daysString){
      return "No especificado"
    }
    const daysArray = daysString.split('-').map(day => day.trim());
    const translatedDays = daysArray.map(day => this.translateDay(day));
    return translatedDays.join(', ');
  }

  translateDay(day: string): string {

    switch (day) {
      case 'SUNDAY':
        return 'Domingo';
      case 'MONDAY':
        return 'Lunes';
      case 'TUESDAY':
        return 'Martes';
      case 'WEDNESDAY':
        return 'Miércoles';
      case 'THURSDAY':
        return 'Jueves';
      case 'FRIDAY':
        return 'Viernes';
      case 'SATURDAY':
        return 'Sábado';
      default:
        return day; // Devuelve el día original si no hay coincidencia
    }
  }

  translateVisitorType(type : string){
    switch (type) {
      case 'VISITOR':
        return 'Visita';
      case 'OWNER':
        return 'Propietario';
      case 'WORKER':
        return 'Trabajador';
      case 'EMPLOYEE':
        return 'Empleado';
      case 'SUPPLIER':
        return 'Proveedor'
      default:
        return type;
    }
  }

}
