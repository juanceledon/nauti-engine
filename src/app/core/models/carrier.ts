export interface Carrier {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  email: string;
  supported_routes: string[];
  price_memory: Record<string, number>;
  info_link: string;
  agent_summary: string;
  primary_route?: string;
  historical_rates?: Record<string, number>;
}

export interface CarrierWrite {
  name: string;
  owner_name: string;
  phone: string;
  email: string;
  supported_routes: string[];
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
    supported_routes: [],
    info_link: '',
    agent_summary: '',
  };
}

export function carrierRoutes(carrier: Carrier): string[] {
  if (carrier.supported_routes?.length) {
    return carrier.supported_routes;
  }
  return carrier.primary_route ? [carrier.primary_route] : [];
}

export function carrierPriceMemory(carrier: Carrier): Record<string, number> {
  const memory = carrier.price_memory;
  if (memory && Object.keys(memory).length > 0) {
    return memory;
  }
  return carrier.historical_rates ?? {};
}

export function carrierToWrite(carrier: Carrier): CarrierWrite {
  return {
    name: carrier.name,
    owner_name: carrier.owner_name,
    phone: carrier.phone,
    email: carrier.email,
    supported_routes: carrierRoutes(carrier),
    info_link: carrier.info_link,
    agent_summary: carrier.agent_summary,
  };
}

export interface CarrierListResponse {
  items: Carrier[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
  with_route_count: number;
}

export interface CarrierListQuery {
  q?: string;
  route?: string;
  page?: number;
  page_size?: number;
}
