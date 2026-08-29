import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE } from '../config';
import { Carrier, CarrierWrite } from '../models/carrier';
import { Quote } from '../models/quote';

@Injectable({ providedIn: 'root' })
export class LogisticsApi {
  private readonly http = inject(HttpClient);

  listCarriers(): Observable<Carrier[]> {
    return this.http.get<Carrier[]>(`${API_BASE}/carriers`);
  }

  createCarrier(body: CarrierWrite): Observable<Carrier> {
    return this.http.post<Carrier>(`${API_BASE}/carriers`, body);
  }

  updateCarrier(id: string, body: CarrierWrite): Observable<Carrier> {
    return this.http.put<Carrier>(`${API_BASE}/carriers/${id}`, {
      name: body.name,
      owner_name: body.owner_name,
      phone: body.phone,
      email: body.email,
      primary_route: body.primary_route,
      info_link: body.info_link,
      agent_summary: body.agent_summary,
    });
  }

  listQuotes(): Observable<Quote[]> {
    return this.http.get<Quote[]>(`${API_BASE}/quotes`);
  }
}
