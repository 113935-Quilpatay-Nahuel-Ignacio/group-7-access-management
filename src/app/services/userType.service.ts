import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Subject} from 'rxjs';
import {Auth} from "../models/authorize.model";
import {AccessModel} from "../models/access.model";
import {VisitorAuthorizationRequest} from "../models/authorizeRequest.model";
import {PaginatedResponse} from "../models/api-response";

@Injectable({
  providedIn: 'root'
})
export class UserTypeService {

  private userType: UserType  = UserType.ADMIN
  private userSubject = new Subject<string>();
  userType$: Observable<string> =  this.userSubject.asObservable();


  isAdmin(): boolean {
    return this.userType === UserType.ADMIN;
  }

  isOwner(): boolean {
    return this.userType === UserType.OWNER;
  }

  isGuard(): boolean {
    return this.userType === UserType.GUARD;
  }


  setType(type :UserType){
    this.userType = type
    this.userSubject.next(type);
  }

  getType():UserType{
    return this.userType
  }


}

export enum UserType{
  "ADMIN"= "ADMIN",
  "OWNER" = "OWNER",
  "GUARD" = "GUARD"
}
