import { Carrier, carrierRoutes } from './carrier';
import { Client } from './client';
import {
  NegotiationStyle,
  OutboundCall,
  OutboundCallStatus
} from './operation';

export type { NegotiationStyle };

export const MAX_DEPLOY_CARRIERS = 50;
export const SECONDS_PER_CARRIER = 45;
export const COST_PER_CARRIER = 0.12;

export type DeploymentStatus =
  | 'waiting'
  | 'calling'
  | 'registered'
  | 'talking'
  | 'ended'
  | 'failed';

export interface DeploymentCall {
  id: string;
  label: string;
  phone: string;
  status: DeploymentStatus;
  talkSeconds?: number;
}

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

export function waitingCallsFromClients(
  clients: Client[],
): DeploymentCall[] {
  return clients.map((client) => ({
    id: client.id,
    label: client.name.trim() || client.contact_name.trim(),
    phone: client.contact_phone,
    status: 'waiting' as const,
  }));
}

export function callingCallsFromClients(
  clients: Client[],
): DeploymentCall[] {
  return clients.map((client) => ({
    id: client.id,
    label: client.name.trim() || client.contact_name.trim(),
    phone: client.contact_phone,
    status: 'calling' as const,
  }));
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

export function deploymentStatusFromProvider(
  status: string,
): DeploymentStatus {
  const normalized = status.trim().toLowerCase();

  if (
    normalized === 'ongoing' ||
    normalized === 'in_progress' ||
    normalized === 'talking'
  ) {
    return 'talking';
  }

  if (
    normalized === 'ended' ||
    normalized === 'completed'
  ) {
    return 'ended';
  }

  if (
    normalized === 'error' ||
    normalized === 'failed' ||
    normalized === 'not_connected'
  ) {
    return 'failed';
  }

  if (
    normalized === 'registered' ||
    normalized === 'queued' ||
    normalized === 'ringing'
  ) {
    return 'registered';
  }

  if (normalized === 'waiting') {
    return 'waiting';
  }

  return 'calling';
}

export function liveCallStatusLabel(
  status: DeploymentStatus,
  talkSeconds?: number,
): string {
  if (status === 'talking') {
    return talkSeconds != null
      ? `Talking [${formatTalkClock(talkSeconds)}]`
      : 'Talking';
  }

  if (status === 'waiting') {
    return 'Waiting';
  }

  if (status === 'registered') {
    return 'Registered';
  }

  if (status === 'ended') {
    return 'Ended';
  }

  if (status === 'failed') {
    return 'Failed';
  }

  return 'Calling...';
}

export function applyLiveCallStatus(
  rows: DeploymentCall[],
  live: OutboundCall[],
): DeploymentCall[] {
  return rows.map((row) => {
    const match = findMatchingLiveCall(
      live,
      row
    );

    if (!match?.call_status?.trim()) {
      return row;
    }

    const status =
      deploymentStatusFromProvider(
        match.call_status
      );

    return {
      ...row,
      phone:
        match.to_number ||
        match.contact_phone ||
        row.phone,
      status,
    };
  });
}

function findMatchingLiveCall(
  live: OutboundCall[],
  row: DeploymentCall,
): OutboundCall | undefined {
  const phone =
    normalizePhone(
      row.phone
    );

  return live.find((call) => {
    if (
      call.client_id &&
      call.client_id === row.id
    ) {
      return true;
    }

    const callPhone =
      normalizePhone(
        call.contact_phone ||
        call.to_number ||
        ''
      );

    return Boolean(
      phone &&
      callPhone &&
      callPhone === phone
    );
  });
}

export function carrierMatchesSearch(
  carrier: Carrier,
  needle: string,
): boolean {
  const haystack = [
    carrier.name,
    carrier.owner_name,
    carrier.phone,
    carrier.email,
    ...carrierRoutes(carrier),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(
    needle.toLowerCase()
  );
}

export function clientMatchesSearch(
  client: Client,
  needle: string,
): boolean {
  const haystack = [
    client.name,
    client.contact_name,
    client.contact_phone,
    client.contact_email,
    client.direction,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(
    needle.toLowerCase()
  );
}