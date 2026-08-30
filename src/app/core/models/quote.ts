import { Call } from './call';
import { Carrier } from './carrier';
import { Operation } from './operation';

export interface Quote {
  id: string;
  operation_id: string;
  carrier_id: string;
  initial_price: number | null;
  quoted_price: number;
  currency: string;
  pickup_date: string | null;
  pickup_time: string | null;
  valid: boolean;
  status: string;
  created_at: string;
  quoted_date: string | null;
  call_brief?: string | null;
  call_id?: string;
  keys?: string[];
  call?: Call | null;
  operation?: Operation | null;
  carrier?: Carrier | null;
}

export interface QuoteListQuery {
  q?: string;
  operation_id?: string;
  carrier_id?: string;
  call_id?: string;
  status?: string;
  client_id?: string;
  client_email?: string;
  client_phone?: string;
}
