import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {VisitorAuthorizationRequest} from "../models/authorizeRequest.model";
import {LoginModel} from "../models/login.model";

@Injectable({
  providedIn: 'root'
})
export class LoginService {


  constructor() { }

  getLogin():LoginModel{
    return {
      birth_date: "", doc_number: 0, doc_type: "", id: 2, last_name: "R.", name: "Juan"
    }
  }
}
