import { MandateNormalizeField } from '../models/operation';

const CURRENCY_ALIASES: Record<string, string> = {
  mxn: 'MXN',
  peso: 'MXN',
  pesos: 'MXN',
  'peso mexicano': 'MXN',
  'pesos mexicanos': 'MXN',
  'mexican peso': 'MXN',
  'mexican pesos': 'MXN',
  usd: 'USD',
  dollar: 'USD',
  dollars: 'USD',
  dolar: 'USD',
  dolares: 'USD',
  'us dollar': 'USD',
  'us dollars': 'USD',
  cop: 'COP',
  'peso colombiano': 'COP',
  'pesos colombianos': 'COP',
  'colombian peso': 'COP',
  'colombian pesos': 'COP',
  clp: 'CLP',
  'peso chileno': 'CLP',
  'pesos chilenos': 'CLP',
  'chilean peso': 'CLP',
  'chilean pesos': 'CLP',
  krw: 'KRW',
  won: 'KRW',
  wons: 'KRW',
  'korean won': 'KRW',
  'south korean won': 'KRW',
  'won surcoreano': 'KRW',
  'won coreano': 'KRW',
  eur: 'EUR',
  euro: 'EUR',
  euros: 'EUR',
  brl: 'BRL',
  real: 'BRL',
  reais: 'BRL',
  'real brasileno': 'BRL',
  'brazilian real': 'BRL',
  pen: 'PEN',
  sol: 'PEN',
  soles: 'PEN',
  'nuevo sol': 'PEN',
  ars: 'ARS',
  'peso argentino': 'ARS',
  'pesos argentinos': 'ARS',
  jpy: 'JPY',
  yen: 'JPY',
  gbp: 'GBP',
  pound: 'GBP',
  pounds: 'GBP',
  libra: 'GBP',
  libras: 'GBP',
};

const PLACE_ALIASES: Record<string, string> = {
  medellin: 'Medellín',
  bogota: 'Bogotá',
  'mexico city': 'Mexico City',
  'ciudad de mexico': 'Mexico City',
  cdmx: 'Mexico City',
  manzanillo: 'Manzanillo',
  veracruz: 'Veracruz',
  'lazaro cardenas': 'Lázaro Cárdenas',
  guadalajara: 'Guadalajara',
  monterrey: 'Monterrey',
  'nuevo laredo': 'Nuevo Laredo',
  laredo: 'Laredo',
  altamira: 'Altamira',
  tampico: 'Tampico',
  queretaro: 'Querétaro',
  leon: 'León',
  'san luis potosi': 'San Luis Potosí',
  merida: 'Mérida',
  cancun: 'Cancún',
  cartagena: 'Cartagena',
  barranquilla: 'Barranquilla',
};

const COUNTRY_ONLY = new Set([
  'mexico',
  'mx',
  'colombia',
  'co',
  'united states',
  'united states of america',
  'usa',
  'us',
  'estados unidos',
  'eeuu',
  'canada',
  'ca',
  'guatemala',
  'brazil',
  'brasil',
  'argentina',
  'chile',
  'peru',
  'ecuador',
  'venezuela',
  'panama',
  'costa rica',
  'honduras',
  'el salvador',
  'nicaragua',
  'bolivia',
  'paraguay',
  'uruguay',
  'spain',
  'espana',
  'china',
  'japan',
  'japon',
  'korea',
  'corea',
  'south korea',
  'corea del sur',
  'germany',
  'alemania',
  'france',
  'francia',
]);

export function isCountryOnlyPlace(raw: string): boolean {
  return COUNTRY_ONLY.has(folded(raw));
}

export function isUnknownOrSkipAnswer(raw: string): boolean {
  const key = folded(raw).replace(/[^\p{L}\p{N}\s]/gu, '');
  if (!key) {
    return false;
  }
  if (
    key === 'skip'
    || key === 'idk'
    || key === 'na'
    || key === 'n a'
    || key === 'unknown'
    || key === 'omitir'
    || key === 'ninguno'
    || key === 'ninguna'
  ) {
    return true;
  }
  return (
    key.includes('dont know')
    || key.includes('do not know')
    || key.includes('not sure')
    || key.includes('no idea')
    || key.includes('no se')
    || key.includes('no lo se')
    || key.includes('no tengo')
    || key.includes('ahorita no')
  );
}

function folded(raw: string): string {
  return raw
    .trim()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function titlePlace(raw: string): string {
  return raw
    .trim()
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ''))
    .join(' ');
}

function localTodayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function localNormalizedValue(
  field: MandateNormalizeField,
  text: string,
): string | null {
  const raw = text.trim();
  if (!raw) {
    return null;
  }
  if (field === 'currency') {
    const aliased = CURRENCY_ALIASES[folded(raw)];
    if (aliased) {
      return aliased;
    }
    const code = raw.toUpperCase();
    return /^[A-Z]{3}$/.test(code) ? code : null;
  }
  if (field === 'origin' || field === 'destination') {
    if (isCountryOnlyPlace(raw)) {
      return null;
    }
    return PLACE_ALIASES[folded(raw)] || (raw.length >= 2 ? titlePlace(raw) : null);
  }
  if (field === 'cargo_category') {
    return CARGO_ALIASES[folded(raw)] || slugValue(raw, 2, 40);
  }
  if (field === 'weight_kg') {
    return localWeightKg(raw);
  }
  if (field === 'container_size') {
    return CONTAINER_SIZE_ALIASES[folded(raw)] || null;
  }
  if (field === 'container_type') {
    return CONTAINER_TYPE_ALIASES[folded(raw)] || slugValue(raw, 2, 20);
  }
  if (field === 'pickup_window') {
    return localPickupWindow(raw);
  }
  if (field === 'last_free_day' && NONE_DAY_ALIASES.has(folded(raw))) {
    return '';
  }
  if (field === 'date' || field === 'last_free_day') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return null;
    }
    return raw < localTodayIso() ? null : raw;
  }
  return null;
}

const NONE_DAY_ALIASES = new Set([
  'none',
  'no',
  'n/a',
  'na',
  'sin',
  'ninguno',
  'ninguna',
]);

const CARGO_ALIASES: Record<string, string> = {
  general: 'general',
  'general cargo': 'general',
  'carga general': 'general',
  electronics: 'electronics',
  electronic: 'electronics',
  electronica: 'electronics',
  electronicos: 'electronics',
  food: 'food',
  alimentos: 'food',
  perecederos: 'food',
  perecedero: 'food',
};

const CONTAINER_SIZE_ALIASES: Record<string, string> = {
  '20': '20ft',
  '20ft': '20ft',
  '20 ft': '20ft',
  "20'": '20ft',
  '20 pies': '20ft',
  '40': '40ft',
  '40ft': '40ft',
  '40 ft': '40ft',
  "40'": '40ft',
  '40 pies': '40ft',
  '40hc': '40HC',
  '40 hc': '40HC',
  '40hq': '40HC',
  '40 hq': '40HC',
  '40 high cube': '40HC',
  'high cube': '40HC',
};

const CONTAINER_TYPE_ALIASES: Record<string, string> = {
  dry: 'dry',
  seco: 'dry',
  'dry van': 'dry',
  reefer: 'reefer',
  refrigerado: 'reefer',
  refrigerated: 'reefer',
};

const WINDOW_ALIASES: Record<string, string> = {
  morning: '08:00-12:00',
  manana: '08:00-12:00',
  am: '08:00-12:00',
  '8-12': '08:00-12:00',
  '08-12': '08:00-12:00',
  afternoon: '12:00-17:00',
  tarde: '12:00-17:00',
  pm: '12:00-17:00',
  '12-17': '12:00-17:00',
  'all day': '08:00-17:00',
  'todo el dia': '08:00-17:00',
  fullday: '08:00-17:00',
  '08:00-12:00': '08:00-12:00',
  '12:00-17:00': '12:00-17:00',
  '08:00-17:00': '08:00-17:00',
};

function slugValue(raw: string, min: number, max: number): string | null {
  const slug = folded(raw).replace(/ /g, '_');
  return slug.length >= min && slug.length <= max ? slug : null;
}

function localWeightKg(raw: string): string | null {
  const tons = folded(raw).match(/^(\d+(?:[.,]\d+)?)\s*(t|ton|tons|tonelada|toneladas)$/);
  if (tons) {
    const amount = Number(tons[1].replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0) {
      return null;
    }
    const kilos = amount < 100 ? amount * 1000 : amount;
    return String(Math.round(kilos));
  }
  const amount = Number(raw.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return String(Math.round(amount));
}

function localPickupWindow(raw: string): string | null {
  const aliased = WINDOW_ALIASES[folded(raw)];
  if (aliased) {
    return aliased;
  }
  const match = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*-\s*(\d{1,2})(?::(\d{2}))?$/);
  if (!match) {
    return null;
  }
  const start = `${String(Number(match[1])).padStart(2, '0')}:${String(Number(match[2] || 0)).padStart(2, '0')}`;
  const end = `${String(Number(match[3])).padStart(2, '0')}:${String(Number(match[4] || 0)).padStart(2, '0')}`;
  return `${start}-${end}`;
}
