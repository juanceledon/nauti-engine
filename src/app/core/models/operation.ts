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

export interface CallOutboundClient {
  id: string;
  name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

export interface CallOutboundRequest {
  operation_ids: string[];
  origin: string;
  destination: string;
  negotiation_style: NegotiationStyle;
  initial_hook: string;
  clients: CallOutboundClient[];
  carriers: string[];
}

export interface CallOutboundResponse {
  success: boolean;
  calls_started: number;
  message: string;
  calls: OutboundCallStatus[];
}

export interface OutboundCallStatus {
  call_id: string;
  call_status: string;
  contact_name: string;
  contact_phone: string;
  to_number: string;
  from_number: string;
  client_id: string;
}
