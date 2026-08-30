export interface Call {
  id: string;
  duration: number;
  audio_timestamp: number;
  call_id: string;
  url: string;
  agent_id: string;
  summary: string;
  status?: string;
  from_number?: string;
  to_number?: string;
  contact_name?: string;
  contact_phone?: string;
  client_id?: string;
  direction?: string;
  call_type?: string;
  created_at: string;
}
