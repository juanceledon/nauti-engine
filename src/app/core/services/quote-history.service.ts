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
  QuoteHistoryItem
} from '../models/quote-history';

@Injectable({
  providedIn: 'root'
})
export class QuoteHistoryService {

  private readonly baseUrl =
    'https://nauti-backend-333078302263.us-central1.run.app';

  constructor(
    private http: HttpClient
  ) {}

  getQuotesByClient(
    clientId: string
  ): Observable<QuoteHistoryItem[]> {

    const params =
      new HttpParams()
        .set(
          'client_id',
          clientId
        );

    return this.http.get<QuoteHistoryItem[]>(
      `${this.baseUrl}/quotes`,
      {
        params
      }
    );
  }
}
