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
      auth_id: 1,
      auth_first_name: 'Ana',
      auth_last_name: 'García',
      doc_type: 'DNI',
      doc_number: 12345678
    },
    {
      auth_id: 2,
      auth_first_name: 'Javier',
      auth_last_name: 'Pérez',
      doc_type: 'CUIL',
      doc_number: 23456789
    },
    {
      auth_id: 3,
      auth_first_name: 'Sofía',
      auth_last_name: 'Rodríguez',
      doc_type: 'DNI',
      doc_number: 34567890
    },
    {
      auth_id: 4,
      auth_first_name: 'Diego',
      auth_last_name: 'Martínez',
      doc_type: 'CUIT',
      doc_number: 45678901
    },
    {
      auth_id: 5,
      auth_first_name: 'Lucía',
      auth_last_name: 'Fernández',
      doc_type: 'PASSPORT',
      doc_number: 56789012
    },
    {
      auth_id: 6,
      auth_first_name: 'Mateo',
      auth_last_name: 'López',
      doc_type: 'DNI',
      doc_number: 67890123
    },
    {
      auth_id: 7,
      auth_first_name: 'Valentina',
      auth_last_name: 'Gómez',
      doc_type: 'CUIT',
      doc_number: 78901234
    },
    {
      auth_id: 8,
      auth_first_name: 'Samuel',
      auth_last_name: 'Díaz',
      doc_type: 'DNI',
      doc_number: 89012345
    },
    {
      auth_id: 9,
      auth_first_name: 'Mariana',
      auth_last_name: 'Hernández',
      doc_type: 'PASSPORT',
      doc_number: 90123456
    },
    {
      auth_id: 10,
      auth_first_name: 'Fernando',
      auth_last_name: 'Torres',
      doc_type: 'CUIL',
      doc_number: 10234567
    }
  ];


  completeAuthorizer(id: number): Authorizer {
    return this.authorizers.find(x => x.auth_id == id)!;
  }
}
