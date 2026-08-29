import { Carrier } from './carrier';
import { Client } from './client';
import { Commitment } from './commitment';
import { Operation } from './operation';
import { Quote } from './quote';

export type NegotiationStatus = 'verified' | 'pending';

export interface NegotiationRow {
  id: string;
  dealLabel: string;
  operationId: string;
  carrierId: string;
  carrierName: string;
  origin: string;
  destination: string;
  routeLabel: string;
  currency: string;
  initialPrice: number | null;
  negotiatedPrice: number;
  status: NegotiationStatus;
  agreedName: string;
  audioSeconds: number;
  recapSent: boolean;
  clientName: string;
  clientPhone: string;
  createdAt: string;
}

export function formatMoney(amount: number): string {
  return `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)}`;
}

export function formatAuditClock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function compactDealLabel(id: string, prefix: 'CMT' | 'QTE'): string {
  const compact = id.replace(/-/g, '').slice(0, 4).toUpperCase();
  return `${prefix}-${compact || '0000'}`;
}

export function negotiationMatchesSearch(row: NegotiationRow, needle: string): boolean {
  const haystack = [
    row.dealLabel,
    row.id,
    row.operationId,
    row.carrierName,
    row.origin,
    row.destination,
    row.routeLabel,
    row.status,
    row.clientName,
    row.clientPhone,
    row.agreedName,
    String(row.negotiatedPrice),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle.toLowerCase());
}

export function buildNegotiationRows(input: {
  operations: Operation[];
  quotes: Quote[];
  commitments: Commitment[];
  clients: Client[];
  carriers: Carrier[];
}): NegotiationRow[] {
  const operationsById = new Map(input.operations.map((row) => [row.id, row]));
  const clientsById = new Map(input.clients.map((row) => [row.id, row]));
  const carriersById = new Map(input.carriers.map((row) => [row.id, row]));
  const quotesByOp = groupQuotesByOperation(input.quotes);
  const committedOps = new Set(input.commitments.map((row) => row.operation_id));

  const rows = input.commitments.map((commitment) =>
    rowFromCommitment(commitment, operationsById, clientsById, carriersById, quotesByOp),
  );

  for (const operation of input.operations) {
    if (committedOps.has(operation.id)) {
      continue;
    }
    const quotes = quotesByOp.get(operation.id) ?? [];
    const latest = latestQuote(quotes);
    if (!latest) {
      continue;
    }
    rows.push(
      rowFromQuote(latest, operation, clientsById.get(operation.client_id), carriersById.get(latest.carrier_id)),
    );
  }

  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function groupQuotesByOperation(quotes: Quote[]): Map<string, Quote[]> {
  const grouped = new Map<string, Quote[]>();
  for (const quote of quotes) {
    const bucket = grouped.get(quote.operation_id) ?? [];
    bucket.push(quote);
    grouped.set(quote.operation_id, bucket);
  }
  return grouped;
}

function latestQuote(quotes: Quote[]): Quote | null {
  if (quotes.length === 0) {
    return null;
  }
  return [...quotes].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
}

function matchingQuote(quotes: Quote[], carrierId: string): Quote | null {
  const forCarrier = quotes.filter((quote) => quote.carrier_id === carrierId);
  return latestQuote(forCarrier) ?? latestQuote(quotes);
}

function rowFromCommitment(
  commitment: Commitment,
  operations: Map<string, Operation>,
  clients: Map<string, Client>,
  carriers: Map<string, Carrier>,
  quotesByOp: Map<string, Quote[]>,
): NegotiationRow {
  const operation = operations.get(commitment.operation_id);
  const quote = matchingQuote(quotesByOp.get(commitment.operation_id) ?? [], commitment.carrier_id);
  const client = operation ? clients.get(operation.client_id) : undefined;
  const carrier = carriers.get(commitment.carrier_id);
  const origin = operation?.origin ?? '';
  const destination = operation?.destination ?? '';
  return {
    id: commitment.id,
    dealLabel: compactDealLabel(commitment.id, 'CMT'),
    operationId: commitment.operation_id,
    carrierId: commitment.carrier_id,
    carrierName: carrier?.name ?? commitment.carrier_id,
    origin,
    destination,
    routeLabel: routeLabel(origin, destination, carrier?.name ?? ''),
    currency: quote?.currency || operation?.currency || 'MXN',
    initialPrice: quote?.initial_price ?? operation?.mandate_max_price ?? null,
    negotiatedPrice: commitment.agreed_price,
    status: commitment.recap_sent ? 'verified' : 'pending',
    agreedName: commitment.agreed_name,
    audioSeconds: commitment.audio_timestamp,
    recapSent: commitment.recap_sent,
    clientName: client?.name ?? '',
    clientPhone: client?.contact_phone ?? '',
    createdAt: commitment.created_at,
  };
}

function rowFromQuote(
  quote: Quote,
  operation: Operation,
  client: Client | undefined,
  carrier: Carrier | undefined,
): NegotiationRow {
  return {
    id: quote.id,
    dealLabel: compactDealLabel(quote.id, 'QTE'),
    operationId: operation.id,
    carrierId: quote.carrier_id,
    carrierName: carrier?.name ?? quote.carrier_id,
    origin: operation.origin,
    destination: operation.destination,
    routeLabel: routeLabel(operation.origin, operation.destination, carrier?.name ?? ''),
    currency: quote.currency || operation.currency || 'MXN',
    initialPrice: quote.initial_price,
    negotiatedPrice: quote.quoted_price,
    status: 'pending',
    agreedName: '',
    audioSeconds: 0,
    recapSent: false,
    clientName: client?.name ?? '',
    clientPhone: client?.contact_phone ?? '',
    createdAt: quote.created_at,
  };
}

function routeLabel(origin: string, destination: string, carrierName: string): string {
  const lane = [origin, destination].filter(Boolean).join(' → ');
  if (lane && carrierName) {
    return `${lane} (${carrierName})`;
  }
  return lane || carrierName;
}
