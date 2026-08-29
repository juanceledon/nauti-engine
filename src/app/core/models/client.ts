export interface Client {
  id: string;
  name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;

  // Optional because the current backend
  // may not return these fields yet.
  country?: string | null;
  country_code?: string | null;
  contact_phone_e164?: string | null;
}

export interface ClientWrite {
  name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;

  country?: string;
  country_code?: string;
  contact_phone_e164?: string;
}

export function emptyClientWrite(): ClientWrite {
  return {
    name: '',
    contact_name: '',
    contact_phone: '',
    contact_email: ''
  };
}

export function clientToWrite(
  client: Client
): ClientWrite {
  return {
    name: client.name,
    contact_name: client.contact_name,
    contact_phone: client.contact_phone,
    contact_email: client.contact_email,

    country: client.country ?? undefined,
    country_code: client.country_code ?? undefined,
    contact_phone_e164:
      client.contact_phone_e164 ?? undefined
  };
}