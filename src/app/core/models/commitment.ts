import { Call } from './call';

export interface Commitment {
  id: string;
  operation_id: string;
  carrier_id: string;
  agreed_price: number;
  agreed_name: string;
  agreed_date: string;
  recap_sent: string;
  call_id?: string;
  call?: Call | null;
  created_at: string;
}

export interface CommitmentListQuery {
  q?: string;
  operation_id?: string;
  carrier_id?: string;
  call_id?: string;
  recap_sent?: string;
  client_id?: string;
  client_email?: string;
  client_phone?: string;
}
