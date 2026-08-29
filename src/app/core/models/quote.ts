export interface Quote {
  id: string;
  operation_id: string;
  carrier_id: string;
  initial_price: number | null;
  quoted_price: number;
  currency: string;
  pickup_date: string;
  pickup_time: string;
  valid: boolean;
  status: string;
  created_at: string;
  quoted_date: string;
  call_brief: string;
}

export interface QuoteListQuery {
  q?: string;
  operation_id?: string;
  carrier_id?: string;
  status?: string;
  client_id?: string;
  client_email?: string;
  client_phone?: string;
}
