import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Auth} from "../models/authorize.model";
import {AccessModel} from "../models/access.model";
import {VisitorAuthorizationRequest} from "../models/authorizeRequest.model";
import {PaginatedResponse} from "../models/api-response";

@Injectable({
  providedIn: 'root'
})
export class TransformResponseService {

  constructor() {
  }

  transformResponse(model: any[], page: number, size: number, isActive?: boolean) : PaginatedResponse<any> {
    --page
    let totalElements = model.length

    let modelFiltered = model.slice(page*size,page*size+size)

    return {
      content: modelFiltered,
      totalElements: totalElements,
      totalPages: Math.ceil(modelFiltered.length/page),
      size: modelFiltered.length,
      number: page,
      first: page == 0,
      last: Math.ceil(modelFiltered.length/page) == page,
    }
  }

  transformAction(model: AccessModel[], page: number, size: number,action: string, isActive?: boolean): PaginatedResponse<AccessModel>{
    model = model.filter(x => x.action == action)
    return this.transformResponse(model,page,size,isActive)
  }

  transformType(model: AccessModel[], page: number, size: number, visitor: string,isActive?: boolean): PaginatedResponse<AccessModel>{
    model = model.filter(x => x.visitor_type == visitor)
    return this.transformResponse(model,page,size,isActive)
  }

}
