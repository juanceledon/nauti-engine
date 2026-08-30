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
  Call
} from '../models/call';


@Injectable({
  providedIn: 'root'
})
export class CallService {

  private readonly baseUrl =
    'https://nauti-backend-333078302263.us-central1.run.app';


  constructor(
    private http: HttpClient
  ) {}


  getCalls(): Observable<Call[]> {

    return this.http.get<Call[]>(
      `${this.baseUrl}/calls`
    );
  }


  getCall(
    callId: string
  ): Observable<Call> {

    return this.http.get<Call>(
      `${this.baseUrl}/calls/${callId}`
    );
  }

}