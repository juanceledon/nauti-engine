import {
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  AnalyticsKpis
} from '../models/analytics-kpis';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private readonly baseUrl =
    'https://nauti-backend-333078302263.us-central1.run.app';

  constructor(
    private http: HttpClient
  ) {}

  getKpis(
    clientId?: string
  ): Observable<AnalyticsKpis> {

    let params = new HttpParams();

    if (clientId) {
      params = params.set(
        'client_id',
        clientId
      );
    }

    return this.http.get<AnalyticsKpis>(
      `${this.baseUrl}/api/analytics/kpis`,
      {
        params
      }
    );
  }
}