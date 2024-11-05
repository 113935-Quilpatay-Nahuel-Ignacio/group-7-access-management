import { Injectable } from '@angular/core';
import {Authorizer} from "../models/authorize.model";

@Injectable({
  providedIn: 'root'
})
export class AuthorizerCompleterService {

  constructor() {
  }

  authorizers: Authorizer[] = [
    {
      id: 1,
      name: 'Ana',
      last_name: 'García',
      doc_type: 'DNI',
      doc_number: 12345678
    },
    {
      id: 2,
      name: 'Javier',
      last_name: 'Pérez',
      doc_type: 'CUIL',
      doc_number: 23456789
    },
    {
      id: 3,
      name: 'Sofía',
      last_name: 'Rodríguez',
      doc_type: 'DNI',
      doc_number: 34567890
    },
    {
      id: 4,
      name: 'Diego',
      last_name: 'Martínez',
      doc_type: 'CUIT',
      doc_number: 45678901
    },
    {
      id: 5,
      name: 'Lucía',
      last_name: 'Fernández',
      doc_type: 'PASSPORT',
      doc_number: 56789012
    },
    {
      id: 6,
      name: 'Mateo',
      last_name: 'López',
      doc_type: 'DNI',
      doc_number: 67890123
    },
    {
      id: 7,
      name: 'Valentina',
      last_name: 'Gómez',
      doc_type: 'CUIT',
      doc_number: 78901234
    },
    {
      id: 8,
      name: 'Samuel',
      last_name: 'Díaz',
      doc_type: 'DNI',
      doc_number: 89012345
    },
    {
      id: 9,
      name: 'Mariana',
      last_name: 'Hernández',
      doc_type: 'PASSPORT',
      doc_number: 90123456
    },
    {
      id: 10,
      name: 'Fernando',
      last_name: 'Torres',
      doc_type: 'CUIL',
      doc_number: 10234567
    }
  ];


  completeAuthorizer(id: number): Authorizer {
    return this.authorizers.find(x => x.id == id)!;
  }
}
