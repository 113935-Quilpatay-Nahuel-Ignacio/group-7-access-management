// Define la interfaz para representar cada objeto de la lista
import {Authorizer} from "./authorize.model";

export interface AccessModel {
  first_name: string;              // Nombre de la persona
  last_name: string;               // Apellido de la persona
  visitor_type: string;                // Comentarios adicionales
  authorizer_id: number;
  doc_type: string;
  doc_number: number;              // Número de documento
  authorizer: Authorizer;
  auth_first_name: string;              // Nombre de la persona
  auth_last_name: string;               // Apellido de la persona
  auth_doc_type: string;
  auth_doc_number: number;              // Número de documento
  action: string;        // Tipo de acción (Entrada/Salida)
  vehicle_type: string; // Tipo de vehículo
  car_description: string | null;  // Descripción del vehículo (si es un auto)
  vehicle_reg: string;             // Matrícula del vehículo
  action_date: string;
  vehicle_description: string;     // Descripción completa del vehículo (marca, modelo, color, etc.)
  comments: string;                // Comentarios adicionales
}

export const AccessActionDictionary: { [key: string]: string } = {
  "Entrada": "ENTRY",
  "Salida": "EXIT",
};

export enum AccessFilters {
  NOTHING = 'NOTHING',
  ACTION = 'ACTION',
  VISITOR_TYPE = 'VISITOR_TYPE'
}
