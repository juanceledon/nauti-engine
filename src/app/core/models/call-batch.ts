import { NegotiationStyle } from './operation';
import { Quote } from './quote';

export type AgentCallStatus =
  | 'pending'
  | 'in_progress'
  | 'finished'
  | 'failed'
  | 'error'
  | 'cancelled'
  | string;

export interface AgentCallEvent {
  call_id: string;
  phone_number: string;
  status: AgentCallStatus;
  carrier_id: string;
  carrier_name: string;
  summary: string;
  call_successful: boolean | null;
  user_sentiment: string;
  in_voicemail: boolean;
  created_at: string;
  finished_at: string;
}

export interface CallBatch {
  operation_id: string;
  batch_id: string;
  status: string;
  total_calls: number;
  pending_calls: number;
  finished: boolean;
  calls: AgentCallEvent[];
  quotes: Quote[];
}

export interface DispatchCallsRequest {
  carrier_ids?: string[];
  initial_hook?: string;
  negotiation_style?: NegotiationStyle;
}

// Mirrors FINISHED_CALL_STATUSES in the backend dapta client.
const FINISHED_CALL_STATUSES: ReadonlySet<string> = new Set([
  'finished',
  'failed',
  'error',
  'cancelled',
  'canceled',
]);

export function isCallFinished(status: AgentCallStatus): boolean {
  return FINISHED_CALL_STATUSES.has(status);
}

export interface DaptaCallAnalysis {
  call_summary?: string;
  in_voicemail?: boolean;
  call_successful?: boolean;
  user_sentiment?: string;
}

export interface DaptaBatchCall {
  id?: number;
  created_at?: string;
  batch_id?: string;
  phone_number?: string;
  call_id?: string;
  status?: string;
  result?: string | DaptaCallAnalysis | null;
  finished_at?: string | null;
}

export interface DaptaBatchPoll {
  batch_id: string;
  calls?: DaptaBatchCall[];
}

export interface DaptaDispatchRequest {
  numbers: string[];
  variables: Record<string, string>;
  extra_variables?: Record<string, string>;
}

export interface DaptaDispatchResponse {
  batch_id: string;
  status?: string;
  total_calls?: number | string;
}

export function phoneDigits(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

export function uniquePhoneNumbers(numbers: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const raw of numbers) {
    const number = raw.trim();
    const digits = phoneDigits(number);
    if (!digits || seen.has(digits)) {
      continue;
    }
    seen.add(digits);
    unique.push(number);
  }
  return unique;
}

export function parseDaptaAnalysis(
  result: DaptaBatchCall['result']
): DaptaCallAnalysis {
  if (!result) {
    return {};
  }
  if (typeof result === 'object') {
    return result;
  }
  try {
    const parsed: unknown = JSON.parse(result);
    return parsed && typeof parsed === 'object' ? (parsed as DaptaCallAnalysis) : {};
  } catch {
    return {};
  }
}

export function agentCallFromDapta(
  row: DaptaBatchCall,
  carrier?: Pick<AgentCallEvent, 'carrier_id' | 'carrier_name'>
): AgentCallEvent {
  const analysis = parseDaptaAnalysis(row.result);
  return {
    call_id: row.call_id ?? '',
    phone_number: row.phone_number ?? '',
    status: (row.status ?? 'pending').toLowerCase(),
    carrier_id: carrier?.carrier_id ?? '',
    carrier_name: carrier?.carrier_name ?? '',
    summary: analysis.call_summary ?? '',
    call_successful:
      typeof analysis.call_successful === 'boolean' ? analysis.call_successful : null,
    user_sentiment: analysis.user_sentiment ?? '',
    in_voicemail: Boolean(analysis.in_voicemail),
    created_at: row.created_at ?? '',
    finished_at: row.finished_at ?? '',
  };
}
