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

  getQuotes(
    clientId?: string
  ): Observable<QuoteHistoryItem[]> {

    let params =
      new HttpParams();

    if (clientId) {

      params =
        params.set(
          'client_id',
          clientId
        );
    }

    return this.http.get<QuoteHistoryItem[]>(
      `${this.baseUrl}/quotes`,
      {
        params
      }
    );
  }

  getQuotesByClient(
    clientId: string
  ): Observable<QuoteHistoryItem[]> {

    return this.getQuotes(
      clientId
    );
  }

}