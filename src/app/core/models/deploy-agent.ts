import { Carrier, carrierRoutes } from './carrier';
import { Client } from './client';
import { NegotiationStyle } from './operation';

export type { NegotiationStyle };

export const MAX_DEPLOY_CARRIERS = 50;
export const SECONDS_PER_CARRIER = 45;
export const COST_PER_CARRIER = 0.12;

export type DeploymentStatus = 'waiting' | 'calling' | 'talking';

export type DeploymentCall =
  | { id: string; label: string; phone: string; status: 'waiting' | 'calling' }
  | { id: string; label: string; phone: string; status: 'talking'; talkSeconds: number };

export interface DeploySettings {
  style: NegotiationStyle;
  hook: string;
}

export const NEGOTIATION_STYLES: readonly NegotiationStyle[] = [
  'aggressive',
  'balanced',
  'flexible',
];

export const DEFAULT_MANDATE_BUDGET = 1500;
export const DEFAULT_MANDATE_DAYS = 7;

export function emptyDeploySettings(): DeploySettings {
  return {
    style: 'balanced',
    hook: '',
  };
}

export function defaultMandateDeadline(): string {
  const date = new Date();
  date.setDate(date.getDate() + DEFAULT_MANDATE_DAYS);
  return date.toISOString();
}

export function estimateCallDuration(count: number): string {
  const total = count * SECONDS_PER_CARRIER;
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `~${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

export function projectCallCost(count: number): string {
  return `$${(count * COST_PER_CARRIER).toFixed(2)}`;
}

export function formatTalkClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function styleLabel(style: NegotiationStyle): string {
  if (style === 'aggressive') {
    return 'Aggressive';
  }
  if (style === 'flexible') {
    return 'Flexible';
  }
  return 'Balanced';
}

export function waitingCallsFromCarriers(carriers: Carrier[]): DeploymentCall[] {
  return carriers.map((carrier) => ({
    id: carrier.id,
    label: carrier.name,
    phone: carrier.phone,
    status: 'waiting' as const,
  }));
}

export function carrierMatchesSearch(carrier: Carrier, needle: string): boolean {
  const haystack = [
    carrier.name,
    carrier.owner_name,
    carrier.phone,
    carrier.email,
    ...carrierRoutes(carrier),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle.toLowerCase());
}

export function clientMatchesSearch(client: Client, needle: string): boolean {
  const haystack = [
    client.name,
    client.contact_name,
    client.contact_phone,
    client.contact_email,
    client.direction,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle.toLowerCase());
}
