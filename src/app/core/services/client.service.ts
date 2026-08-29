import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Client,
  ClientWrite
} from '../models/client';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private readonly baseUrl =
    'https://nauti-backend-333078302263.us-central1.run.app';

  constructor(
    private http: HttpClient
  ) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(
      `${this.baseUrl}/clients`
    );
  }

  getClient(
    clientId: string
  ): Observable<Client> {
    return this.http.get<Client>(
      `${this.baseUrl}/clients/${clientId}`
    );
  }

  createClient(
    payload: ClientWrite
  ): Observable<Client> {
    return this.http.post<Client>(
      `${this.baseUrl}/clients`,
      payload
    );
  }

  updateClient(
    clientId: string,
    payload: ClientWrite
  ): Observable<Client> {
    return this.http.put<Client>(
      `${this.baseUrl}/clients/${clientId}`,
      payload
    );
  }

  deleteClient(
    clientId: string
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/clients/${clientId}`
    );
  }
}