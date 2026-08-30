import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  CreateOperationRequest,
  Operation
} from '../models/operation';


@Injectable({
  providedIn: 'root'
})
export class OperationService {

  private readonly baseUrl =
    'https://nauti-backend-333078302263.us-central1.run.app';


  constructor(
    private http: HttpClient
  ) {}


  getOperations():
    Observable<Operation[]> {

    return this.http.get<Operation[]>(
      `${this.baseUrl}/operations`
    );
  }


  getOperation(
    operationId: string
  ): Observable<Operation> {

    return this.http.get<Operation>(
      `${this.baseUrl}/operations/${operationId}`
    );
  }


  createOperation(
    payload: CreateOperationRequest
  ): Observable<Operation> {

    return this.http.post<Operation>(
      `${this.baseUrl}/operations`,
      payload
    );
  }

}