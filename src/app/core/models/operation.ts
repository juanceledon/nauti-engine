export type NegotiationStyle = 'aggressive' | 'balanced' | 'flexible';

export type OperationStatus = 'pending' | 'quoting' | 'committed' | 'delayed' | 'escalated';

export interface Operation {
  id: string;
  client_id: string;
  origin: string;
  destination: string;
  mandate_max_price: number;
  currency: string;
  mandate_target_date: string;
  status: OperationStatus;
  carrier_ids: string[];
  initial_hook: string;
  negotiation_style: NegotiationStyle;
  created_at: string;
}

export interface CreateOperationRequest {
  client_id: string;
  origin: string;
  destination: string;
  mandate_max_price: number;
  currency?: string;
  mandate_target_date: string;
  status?: OperationStatus;
  carrier_ids: string[];
  initial_hook: string;
  negotiation_style: NegotiationStyle;
}
