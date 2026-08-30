export interface Call {
  id: string;
  duration: number | null;
  audio_timestamp: number | null;
  call_id: string;
  url: string | null;
  agent_id: string | null;
  summary: string | null;
  status?: string;
  from_number?: string;
  to_number?: string;
  contact_name?: string;
  contact_phone?: string;
  client_id?: string;
  direction?: string;
  call_type?: string;
  created_at?: string;
}
