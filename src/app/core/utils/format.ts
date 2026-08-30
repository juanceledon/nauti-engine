export function formatMoney(value: number | null | undefined, currency = 'MXN'): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'MXN',
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString()} ${currency}`;
  }
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) {
    return '—';
  }
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}m ${rest}s`;
}

export function formatClock(seconds: number | null | undefined): string {
  if (seconds == null) {
    return '—';
  }
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export function shortId(value: string | null | undefined, max = 12): string {
  if (!value) {
    return '—';
  }
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, 8)}…`;
}
