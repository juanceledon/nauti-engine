export interface Carrier {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  email: string;
  primary_route: string;
  info_link: string;
  agent_summary: string;
}

export interface CarrierWrite {
  name: string;
  owner_name: string;
  phone: string;
  email: string;
  primary_route: string;
  info_link: string;
  agent_summary: string;
  id?: string;
}

export function emptyCarrierWrite(): CarrierWrite {
  return {
    name: '',
    owner_name: '',
    phone: '',
    email: '',
    primary_route: '',
    info_link: '',
    agent_summary: ''
  };
}

export function carrierToWrite(carrier: Carrier): CarrierWrite {
  return {
    name: carrier.name,
    owner_name: carrier.owner_name,
    phone: carrier.phone,
    email: carrier.email,
    primary_route: carrier.primary_route,
    info_link: carrier.info_link,
    agent_summary: carrier.agent_summary
  };
}

export interface Operation {
  id: string;
  origin: string;
  destination: string;
  mandate_max_price: number;
  currency: string;
  mandate_target_date: string;
  mandate_start_time: string;
  mandate_end_time: string;
  status: string;
}

export interface Quote {
  id: string;
  operation_id: string;
  carrier_id: string;

  initial_price?: number | null;
  quoted_price: number;
  currency: string;

  pickup_date: string;
  pickup_time: string;

  reliability: number;
  valid: boolean;
  invalid_reason: string[];
  score: number;

  status: string;
  carrier_name?: string;
}

export interface Commitment {
  id: string;
  operation_id: string;
  carrier_id: string;

  agreed_price: number;
  currency: string;

  agreed_pickup_date: string;
  agreed_pickup_time: string;

  driver_name?: string | null;

  audio_timestamp?: string | null;

  recap_sent: boolean;
  verified: boolean;

  status: string;

  supersedes?: string | null;
  carrier_name?: string;
}

export interface CallBrief {
  id: string;
  operation_id: string;

  carrier_id?: string | null;

  direction: 'INBOUND' | 'OUTBOUND';

  actions: string[];
  prices_mentioned: string[];
  objections: string[];
  changed_facts: string[];

  result: string;

  carrier_name?: string;
}

export interface Escalation {
  id: string;
  operation_id: string;

  carrier_id?: string | null;

  reason: string;
  context: string;
  status: string;

  carrier_name?: string;
}

export interface AuditEvent {
  id: string;
  operation_id: string;

  event_type: string;
  message: string;
  timestamp: string;
}

export interface DashboardMetrics {
  quotes: number;
  valid_quotes: number;
  commitments: number;
  verified_commitments: number;
  calls: number;
  escalations: number;
}

export interface DashboardData {
  operation: Operation | null;

  carriers: Carrier[];

  quotes: Quote[];

  best_valid_quote: Quote | null;

  commitments: Commitment[];

  active_commitment?: Commitment | null;

  call_briefs: CallBrief[];

  escalations: Escalation[];

  audit_events: AuditEvent[];

  metrics: DashboardMetrics;
}

export interface ParsedOperationalInput {
  record_type:
    | 'OPERATION'
    | 'QUOTE'
    | 'COMMITMENT'
    | 'CALL_BRIEF'
    | 'ESCALATION'
    | 'UNKNOWN';

  origin?: string | null;
  destination?: string | null;

  mandate_max_price?: number | null;
  currency?: string | null;

  mandate_target_date?: string | null;
  mandate_start_time?: string | null;
  mandate_end_time?: string | null;

  carrier_name?: string | null;

  initial_price?: number | null;
  quoted_price?: number | null;

  pickup_date?: string | null;
  pickup_time?: string | null;

  driver_name?: string | null;

  actions?: string[];
  objections?: string[];
  changed_facts?: string[];

  escalation_reason?: string | null;

  confidence?: number;
}