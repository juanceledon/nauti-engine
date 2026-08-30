/** Reads the FastAPI `detail` field out of an HttpErrorResponse. */
export function readErrorDetail(error: unknown, fallback: string): string {
  const detail = (error as { error?: { detail?: unknown } })?.error?.detail;

  if (typeof detail === 'string') {
    return detail.trim() || fallback;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (item as { msg?: string })?.msg ?? '')
      .filter((message) => message.trim());
    return messages.length ? messages.join(' · ') : fallback;
  }

  return fallback;
}
