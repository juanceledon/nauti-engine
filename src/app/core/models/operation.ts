export type NegotiationStyle =
  | 'aggressive'
  | 'balanced'
  | 'flexible'
  | 'conservative'
  | string;


export type OutboundCallStatus =
  | 'pending'
  | 'queued'
  | 'registered'
  | 'ringing'
  | 'calling'
  | 'ongoing'
  | 'in_progress'
  | 'talking'
  | 'completed'
  | 'ended'
  | 'failed'
  | 'error'
  | 'not_connected'
  | 'no_answer'
  | 'busy'
  | string;


export interface Operation {
  id: string;

  client_id: string;

  origin: string;

  destination: string;

  mandate_max_price: number;

  currency?: string;

  mandate_target_date: string;

  status?: string;

  carrier_ids?: string[];

  initial_hook?: string;

  negotiation_style?: NegotiationStyle;
}


export interface CreateOperationRequest {
  id?: string;

  client_id: string;

  origin: string;

  destination: string;

  mandate_max_price: number;

  currency?: string;

  mandate_target_date: string;

  status?: string;

  carrier_ids?: string[];

  initial_hook?: string;

  negotiation_style?: NegotiationStyle;
}


export interface OutboundCall {
  id?: string;

  call_id?: string;

  operation_id?: string;

  client_id?: string;

  carrier_id?: string;

  status?: OutboundCallStatus;

  call_status?: string;

  phone?: string;

  to_number?: string;

  contact_phone?: string;

  url?: string;

  summary?: string;

  duration?: number;

  audio_timestamp?: number;
}


export interface OutboundCallClient {
  id?: string;

  client_id?: string;

  name?: string;

  contact_name?: string;

  contact_phone?: string;

  phone?: string;
}


export interface CallOutboundRequest {
  operation_id?: string;

  operation_ids?: string[];

  carrier_id?: string;

  carrier_ids?: string[];

  client_id?: string;

  origin?: string;

  destination?: string;

  phone?: string;

  contact_phone?: string;

  initial_hook?: string;

  negotiation_style?: NegotiationStyle;

  clients?: OutboundCallClient[];

  carriers?: string[];
}


export interface CallOutboundResponse {
  operation_id?: string;

  operation_ids?: string[];

  carrier_id?: string;

  call_id?: string;

  status?: OutboundCallStatus;

  message?: string;

  calls?: OutboundCall[];
}


export function emptyCreateOperationRequest():
  CreateOperationRequest {

  return {
    client_id: '',
    origin: '',
    destination: '',
    mandate_max_price: 0,
    currency: 'MXN',
    mandate_target_date: '',
    status: 'pending'
  };
}