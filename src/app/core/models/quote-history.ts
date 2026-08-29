export interface QuoteHistoryItem {
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
  call_brief: string | null;
}