export interface Commitment {
  id: string;
  operation_id: string;
  carrier_id: string;
  agreed_price: number;
  agreed_name: string;
  agreed_date: string;
  audio_timestamp: number;
  recap_sent: boolean;
  link_audio?: string;
  created_at: string;
}

export interface CommitmentListQuery {
  q?: string;
  operation_id?: string;
  carrier_id?: string;
  recap_sent?: boolean;
  client_id?: string;
  client_email?: string;
  client_phone?: string;
}
