const PLACE_NAMES: Record<string, string> = {
  NL: 'Nuevo León',
  MTY: 'Monterrey',
  CDMX: 'Ciudad de México',
  GDL: 'Guadalajara',
  QRO: 'Querétaro',
  PUE: 'Puebla',
  VER: 'Veracruz',
  TJN: 'Tijuana',
  TAM: 'Tamaulipas',
  SLP: 'San Luis Potosí',
  LAR: 'Laredo',
  MANZ: 'Manzanillo',
};

export function normalizeRouteCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function splitLane(code: string): { origin: string; destination: string } {
  const normalized = normalizeRouteCode(code);
  const dash = normalized.indexOf('-');
  if (dash <= 0 || dash === normalized.length - 1) {
    return { origin: normalized, destination: '' };
  }
  return {
    origin: normalized.slice(0, dash),
    destination: normalized.slice(dash + 1),
  };
}

export function routeOptionLabel(code: string): string {
  return code
    .split('-')
    .map((part) => {
      const name = PLACE_NAMES[part.toUpperCase()];
      return name ? `${part.toUpperCase()} (${name})` : part;
    })
    .join(' – ');
}
