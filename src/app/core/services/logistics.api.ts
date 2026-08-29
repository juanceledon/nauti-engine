import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE } from '../config';
import { AnalyticsKpis } from '../models/analytics';
import { Carrier, CarrierListQuery, CarrierListResponse, CarrierWrite } from '../models/carrier';
import { Client, ClientWrite } from '../models/client';
import { Commitment, CommitmentListQuery } from '../models/commitment';
import { CreateOperationRequest, Operation } from '../models/operation';
import { PrimaryRoute } from '../models/primary-route';
import { Quote, QuoteListQuery } from '../models/quote';

@Injectable({ providedIn: 'root' })
export class LogisticsApi {
  private readonly http = inject(HttpClient);

  listCarriers(query: CarrierListQuery = {}): Observable<CarrierListResponse> {
    const params: Record<string, string> = {};
    if (query.q?.trim()) {
      params['q'] = query.q.trim();
    }
    if (query.route?.trim()) {
      params['route'] = query.route.trim();
    }
    if (query.page) {
      params['page'] = String(query.page);
    }
    if (query.page_size) {
      params['page_size'] = String(query.page_size);
    }
    return this.http.get<CarrierListResponse>(`${API_BASE}/carriers`, { params });
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
      supported_routes: body.supported_routes,
      info_link: body.info_link,
      agent_summary: body.agent_summary,
    });
  }

  listQuotes(query: QuoteListQuery = {}): Observable<Quote[]> {
    const params: Record<string, string> = {};
    if (query.q?.trim()) {
      params['q'] = query.q.trim();
    }
    if (query.operation_id?.trim()) {
      params['operation_id'] = query.operation_id.trim();
    }
    if (query.carrier_id?.trim()) {
      params['carrier_id'] = query.carrier_id.trim();
    }
    if (query.status?.trim()) {
      params['status'] = query.status.trim();
    }
    if (query.client_id?.trim()) {
      params['client_id'] = query.client_id.trim();
    }
    if (query.client_email?.trim()) {
      params['client_email'] = query.client_email.trim();
    }
    if (query.client_phone?.trim()) {
      params['client_phone'] = query.client_phone.trim();
    }
    return this.http.get<Quote[]>(`${API_BASE}/quotes`, { params });
  }

  listPrimaryRoutes(): Observable<PrimaryRoute[]> {
    return this.http.get<PrimaryRoute[]>(`${API_BASE}/primary-routes`);
  }

  createPrimaryRoute(code: string, label = ''): Observable<PrimaryRoute> {
    return this.http.post<PrimaryRoute>(`${API_BASE}/primary-routes`, { code, label });
  }

  generateAgentSummary(infoLink: string, carrierName = ''): Observable<{ summary: string; info_link: string }> {
    return this.http.post<{ summary: string; info_link: string }>(`${API_BASE}/carriers/summarize`, {
      info_link: infoLink,
      carrier_name: carrierName,
    });
  }

  listClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${API_BASE}/clients`);
  }

  createClient(body: ClientWrite): Observable<Client> {
    return this.http.post<Client>(`${API_BASE}/clients`, body);
  }

  createOperation(body: CreateOperationRequest): Observable<Operation> {
    return this.http.post<Operation>(`${API_BASE}/operations`, body);
  }

  listOperations(): Observable<Operation[]> {
    return this.http.get<Operation[]>(`${API_BASE}/operations`);
  }

  listCommitments(query: CommitmentListQuery = {}): Observable<Commitment[]> {
    const params: Record<string, string> = {};
    if (query.q?.trim()) {
      params['q'] = query.q.trim();
    }
    if (query.operation_id?.trim()) {
      params['operation_id'] = query.operation_id.trim();
    }
    if (query.carrier_id?.trim()) {
      params['carrier_id'] = query.carrier_id.trim();
    }
    if (query.recap_sent !== undefined) {
      params['recap_sent'] = String(query.recap_sent);
    }
    if (query.client_id?.trim()) {
      params['client_id'] = query.client_id.trim();
    }
    if (query.client_email?.trim()) {
      params['client_email'] = query.client_email.trim();
    }
    if (query.client_phone?.trim()) {
      params['client_phone'] = query.client_phone.trim();
    }
    return this.http.get<Commitment[]>(`${API_BASE}/commitments`, { params });
  }

  getAnalyticsKpis(clientId?: string): Observable<AnalyticsKpis> {
    const params: Record<string, string> = {};
    if (clientId?.trim()) {
      params['client_id'] = clientId.trim();
    }
    return this.http.get<AnalyticsKpis>(`${API_BASE}/api/analytics/kpis`, { params });
  }
}
