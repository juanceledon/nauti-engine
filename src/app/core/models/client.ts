export type ClientDirection = 'inbound' | 'outbound';

export interface Client {
  id: string;
  name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  direction: ClientDirection;
}

export interface ClientWrite {
  name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  direction: ClientDirection;
}

export function emptyClientWrite(): ClientWrite {
  return {
    name: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    direction: 'outbound',
  };
}

export function clientDirection(client: Client): ClientDirection {
  return client.direction === 'inbound' ? 'inbound' : 'outbound';
}
