import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Quote } from '../../core/models/quote';
import { LogisticsApi } from '../../core/services/logistics.api';
import { formatMoney, formatShortDate, shortId } from '../../core/utils/format';

@Component({
  selector: 'app-quote-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quote-history.html',
  host: { class: 'flex min-h-0 min-w-0 flex-1 overflow-hidden' },
})
export class QuoteHistory implements OnInit {
  private readonly api = inject(LogisticsApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly quotes = signal<Quote[]>([]);
  protected readonly clientIdFilter = signal('');
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  protected readonly totalLabel = computed(() => (this.loading() ? '—' : String(this.quotes().length)));

  ngOnInit(): void {
    this.loadQuotes();
  }

  protected loadQuotes(): void {
    const clientId = this.clientIdFilter().trim();
    this.loading.set(true);
    this.loadError.set(null);
    this.api
      .listQuotes(clientId ? { client_id: clientId } : {})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rows) => {
          this.quotes.set(Array.isArray(rows) ? rows : []);
          this.loading.set(false);
        },
        error: () => {
          this.quotes.set([]);
          this.loadError.set('Could not load quote history.');
          this.loading.set(false);
        },
      });
  }

  protected onClientId(event: Event): void {
    const field = event.target;
    if (field instanceof HTMLInputElement) {
      this.clientIdFilter.set(field.value);
    }
  }

  protected clearFilter(): void {
    this.clientIdFilter.set('');
    this.loadQuotes();
  }

  protected money(value: number | null | undefined, currency: string): string {
    return formatMoney(value, currency);
  }

  protected dateLabel(value: string | null | undefined): string {
    return formatShortDate(value);
  }

  protected compactId(value: string): string {
    return shortId(value);
  }

  protected pickupLabel(quote: Quote): string {
    const date = quote.pickup_date ? formatShortDate(quote.pickup_date) : '';
    const time = quote.pickup_time ?? '';
    if (date && time) {
      return `${date} · ${time}`;
    }
    return date || time || '—';
  }

  protected statusLabel(quote: Quote): string {
    if (quote.valid || quote.status === 'within_mandate') {
      return 'Within budget';
    }
    if (quote.status === 'exceeds_mandate') {
      return 'Over budget';
    }
    return quote.status.replace(/_/g, ' ');
  }
}
