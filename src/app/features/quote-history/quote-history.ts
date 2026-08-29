import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  QuoteHistoryItem
} from '../../core/models/quote-history';

import {
  QuoteHistoryService
} from '../../core/services/quote-history.service';

@Component({
  selector: 'app-quote-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './quote-history.html',
  styleUrls: [
    './quote-history.css'
  ]
})
export class QuoteHistory implements OnInit {

  quotes: QuoteHistoryItem[] = [];

  clientIdFilter = '';

  loading = false;

  errorMessage = '';

  constructor(
    private quoteHistoryService: QuoteHistoryService
  ) {}

  ngOnInit(): void {
    this.loadQuotes();
  }

  loadQuotes(): void {

    const clientId =
      this.clientIdFilter.trim();

    this.loading = true;
    this.errorMessage = '';

    this.quoteHistoryService
      .getQuotes(
        clientId || undefined
      )
      .subscribe({

        next: (quotes) => {

          console.log(
            'Quote history loaded:',
            quotes
          );

          this.quotes =
            Array.isArray(quotes)
              ? quotes
              : [];

          this.loading = false;
        },

        error: (error) => {

          console.error(
            'Error loading quote history:',
            error
          );

          this.quotes = [];

          this.errorMessage =
            'Could not load quote history.';

          this.loading = false;
        }

      });
  }

  applyFilter(): void {
    this.loadQuotes();
  }

  clearFilter(): void {

    this.clientIdFilter = '';

    this.loadQuotes();
  }

  formatMoney(
    value: number | null,
    currency: string
  ): string {

    if (
      value === null ||
      value === undefined ||
      !Number.isFinite(value)
    ) {
      return '—';
    }

    try {

      return new Intl.NumberFormat(
        'en-US',
        {
          style: 'currency',
          currency:
            currency || 'MXN',
          maximumFractionDigits: 0
        }
      ).format(value);

    } catch {

      return `${value.toLocaleString()} ${currency}`;
    }
  }

  formatDate(
    value: string | null
  ): string {

    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }
    ).format(date);
  }

  pickupLabel(
    quote: QuoteHistoryItem
  ): string {

    const date =
      quote.pickup_date
        ? this.formatDate(
            quote.pickup_date
          )
        : '';

    const time =
      quote.pickup_time
        ?? '';

    if (
      date &&
      time
    ) {
      return `${date} · ${time}`;
    }

    if (date) {
      return date;
    }

    if (time) {
      return time;
    }

    return '—';
  }

  shortId(
    value: string
  ): string {

    if (!value) {
      return '—';
    }

    if (
      value.length <= 12
    ) {
      return value;
    }

    return `${value.slice(0, 8)}...`;
  }

  statusLabel(
    quote: QuoteHistoryItem
  ): string {

    if (
      quote.valid ||
      quote.status === 'within_mandate'
    ) {
      return 'WITHIN MANDATE';
    }

    if (
      quote.status === 'exceeds_mandate'
    ) {
      return 'EXCEEDS MANDATE';
    }

    return quote.status
      .replace(
        /_/g,
        ' '
      )
      .toUpperCase();
  }

}