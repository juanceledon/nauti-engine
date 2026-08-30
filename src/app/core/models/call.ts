export interface Call {
  id: string;
  duration: number | null;
  audio_timestamp: number | null;
  call_id: string;
  url: string | null;
  agent_id: string | null;
  summary: string | null;
}