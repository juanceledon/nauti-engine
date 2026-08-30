export interface DialCode {
  code: string;
  label: string;
}

export const DIAL_CODES: DialCode[] = [
  { code: '+52', label: 'MX +52' },
  { code: '+57', label: 'CO +57' },
  { code: '+1', label: 'US +1' },
  { code: '+51', label: 'PE +51' },
  { code: '+56', label: 'CL +56' },
  { code: '+54', label: 'AR +54' },
  { code: '+58', label: 'VE +58' },
  { code: '+593', label: 'EC +593' },
];

const DEFAULT_DIAL = '+52';

export function normalizeDial(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits ? `+${digits}` : DEFAULT_DIAL;
}

export function splitPhone(phone: string): { dial: string; number: string } {
  const raw = phone.trim().replace(/\s+/g, '');
  if (!raw) {
    return { dial: DEFAULT_DIAL, number: '' };
  }
  const ranked = [...DIAL_CODES].sort((a, b) => b.code.length - a.code.length);
  const match = ranked.find(
    (option) => raw.startsWith(option.code) || raw.startsWith(option.code.slice(1)),
  );
  if (match) {
    const prefix = raw.startsWith(match.code) ? match.code : match.code.slice(1);
    return { dial: match.code, number: raw.slice(prefix.length) };
  }
  const custom = raw.replace(/^\+/, '').match(/^(\d{1,4})(.*)$/);
  if (custom) {
    return { dial: `+${custom[1]}`, number: custom[2] };
  }
  return { dial: DEFAULT_DIAL, number: raw.replace(/^\+/, '') };
}

export function joinPhone(dial: string, number: string): string {
  return `${normalizeDial(dial)}${number.replace(/\D/g, '')}`;
}

const PHONE_COUNTRIES: ReadonlyArray<{ prefix: string; country: string }> = [
  { prefix: '+593', country: 'Ecuador' },
  { prefix: '+58', country: 'Venezuela' },
  { prefix: '+57', country: 'Colombia' },
  { prefix: '+56', country: 'Chile' },
  { prefix: '+55', country: 'Brazil' },
  { prefix: '+54', country: 'Argentina' },
  { prefix: '+52', country: 'Mexico' },
  { prefix: '+51', country: 'Peru' },
  { prefix: '+34', country: 'Spain' },
  { prefix: '+1', country: 'USA / Canada' },
];

export function inferPhoneCountry(
  rawPhone: string | undefined,
): { country: string; countryCode: string } | null {
  if (!rawPhone) {
    return null;
  }
  const phone = rawPhone.replace(/[\s()-]/g, '');
  const match = PHONE_COUNTRIES.find((item) => phone.startsWith(item.prefix));
  if (!match) {
    return null;
  }
  return { country: match.country, countryCode: match.prefix };
}
