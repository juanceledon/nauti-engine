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
    agent_summary: '',
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
    agent_summary: carrier.agent_summary,
  };
}
