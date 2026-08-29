import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Client as ClientModel
} from '../../core/models/client';

import {
  ClientService
} from '../../core/services/client.service';

import {
  AnalyticsKpis,
  emptyAnalyticsKpis
} from '../../core/models/analytics-kpis';

import {
  AnalyticsService
} from '../../core/services/analytics.service';

import {
  QuoteHistoryItem
} from '../../core/models/quote-history';

import {
  QuoteHistoryService
} from '../../core/services/quote-history.service';


interface PhoneCountryInfo {
  country: string;
  countryCode: string;
}


@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './client.html',
  styleUrls: [
    './client.css'
  ]
})
export class Client implements OnInit {

  client: ClientModel | null = null;

  kpis: AnalyticsKpis =
    emptyAnalyticsKpis();

  quotes: QuoteHistoryItem[] = [];

  clientId = '';

  loadingClient = true;
  loadingKpis = true;
  loadingQuotes = true;

  clientError = '';
  kpiError = '';
  quoteError = '';


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private analyticsService: AnalyticsService,
    private quoteHistoryService: QuoteHistoryService
  ) {}


  ngOnInit(): void {

    const clientId =
      this.route.snapshot.paramMap.get('id');

    if (!clientId) {

      this.router.navigate([
        '/client'
      ]);

      return;
    }

    this.clientId = clientId;

    this.loadClient(
      clientId
    );

    this.loadKpis(
      clientId
    );

    this.loadQuotes(
      clientId
    );
  }


  // =====================================
  // CLIENT
  // =====================================

  loadClient(
    clientId: string
  ): void {

    this.loadingClient = true;

    this.clientError = '';

    this.clientService
      .getClient(
        clientId
      )
      .subscribe({

        next: (client) => {

          console.log(
            'Client loaded:',
            client
          );

          this.client = client;

          this.loadingClient = false;
        },

        error: (error) => {

          console.error(
            'Error loading client:',
            error
          );

          this.client = null;

          this.clientError =
            'Could not load client information.';

          this.loadingClient = false;
        }

      });
  }


  // =====================================
  // KPIS
  // =====================================

  loadKpis(
    clientId: string
  ): void {

    this.loadingKpis = true;

    this.kpiError = '';

    this.kpis =
      emptyAnalyticsKpis();

    this.analyticsService
      .getKpis(
        clientId
      )
      .subscribe({

        next: (kpis) => {

          console.log(
            'Client KPIs loaded:',
            kpis
          );

          this.kpis = {

            total_active_operations:
              kpis.total_active_operations ?? 0,

            total_savings_mxn:
              kpis.total_savings_mxn ?? 0,

            total_negotiated_value_mxn:
              kpis.total_negotiated_value_mxn ?? 0,

            autonomous_resolution_rate:
              kpis.autonomous_resolution_rate ?? 0,

            mandate_compliance_rate:
              kpis.mandate_compliance_rate ?? 0,

            avg_negotiation_time_minutes:
              kpis.avg_negotiation_time_minutes ?? 0,

            verified_commitments_count:
              kpis.verified_commitments_count ?? 0
          };

          this.loadingKpis = false;
        },

        error: (error) => {

          console.error(
            'Error loading client KPIs:',
            error
          );

          this.kpis =
            emptyAnalyticsKpis();

          this.kpiError =
            'Analytics are temporarily unavailable.';

          this.loadingKpis = false;
        }

      });
  }


  // =====================================
  // QUOTE HISTORY
  // =====================================

  loadQuotes(
    clientId: string
  ): void {

    this.loadingQuotes = true;

    this.quoteError = '';

    this.quotes = [];

    this.quoteHistoryService
      .getQuotesByClient(
        clientId
      )
      .subscribe({

        next: (quotes) => {

          console.log(
            'Client quote history loaded:',
            quotes
          );

          this.quotes =
            Array.isArray(quotes)
              ? quotes
              : [];

          this.loadingQuotes = false;
        },

        error: (error) => {

          console.error(
            'Error loading quote history:',
            error
          );

          this.quotes = [];

          this.quoteError =
            'Quote history is temporarily unavailable.';

          this.loadingQuotes = false;
        }

      });
  }


  // =====================================
  // REFRESH
  // =====================================

  refreshDashboard(): void {

    if (!this.clientId) {
      return;
    }

    this.loadClient(
      this.clientId
    );

    this.loadKpis(
      this.clientId
    );

    this.loadQuotes(
      this.clientId
    );
  }


  // =====================================
  // NAVIGATION
  // =====================================

  goBack(): void {

    this.router.navigate([
      '/client'
    ]);
  }


  // =====================================
  // COUNTRY / PHONE
  // =====================================

  get clientCountry(): string {

    if (this.client?.country) {
      return this.client.country;
    }

    return (
      this.inferredPhoneInfo?.country
      ?? 'Country not available'
    );
  }


  get clientCountryCode(): string {

    if (this.client?.country_code) {
      return this.client.country_code;
    }

    return (
      this.inferredPhoneInfo?.countryCode
      ?? ''
    );
  }


  get clientPhone(): string {

    return (
      this.client?.contact_phone_e164
      ||
      this.client?.contact_phone
      ||
      '—'
    );
  }


  private get inferredPhoneInfo():
    PhoneCountryInfo | null {

    const rawPhone =
      this.client?.contact_phone;

    if (!rawPhone) {
      return null;
    }

    const phone =
      rawPhone.replace(
        /[\s()-]/g,
        ''
      );

    const prefixes:
      Array<{
        prefix: string;
        country: string;
      }> = [

        {
          prefix: '+593',
          country: 'Ecuador'
        },

        {
          prefix: '+58',
          country: 'Venezuela'
        },

        {
          prefix: '+57',
          country: 'Colombia'
        },

        {
          prefix: '+56',
          country: 'Chile'
        },

        {
          prefix: '+55',
          country: 'Brazil'
        },

        {
          prefix: '+54',
          country: 'Argentina'
        },

        {
          prefix: '+52',
          country: 'Mexico'
        },

        {
          prefix: '+51',
          country: 'Peru'
        },

        {
          prefix: '+34',
          country: 'Spain'
        },

        {
          prefix: '+1',
          country: 'USA / Canada'
        }

      ];

    const match =
      prefixes.find(
        item =>
          phone.startsWith(
            item.prefix
          )
      );

    if (!match) {
      return null;
    }

    return {
      country:
        match.country,

      countryCode:
        match.prefix
    };
  }


  // =====================================
  // KPI FORMATTERS
  // =====================================

  formatMxn(
    value: number
  ): string {

    const safeValue =
      Number.isFinite(value)
        ? value
        : 0;

    return new Intl.NumberFormat(
      'es-MX',
      {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0
      }
    ).format(
      safeValue
    );
  }


  formatPercentage(
    value: number
  ): string {

    const safeValue =
      Number.isFinite(value)
        ? value
        : 0;

    return `${safeValue.toFixed(1)}%`;
  }


  formatMinutes(
    value: number
  ): string {

    const safeValue =
      Number.isFinite(value)
        ? value
        : 0;

    if (safeValue === 1) {
      return '1 min';
    }

    return `${safeValue.toFixed(1)} min`;
  }


  // =====================================
  // QUOTE FORMATTERS
  // =====================================

  formatQuoteMoney(
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
      ).format(
        value
      );

    } catch {

      return `${value.toLocaleString()} ${currency}`;
    }
  }


  formatQuoteDate(
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
    ).format(
      date
    );
  }


  getPickupLabel(
    quote: QuoteHistoryItem
  ): string {

    const date =
      quote.pickup_date
        ? this.formatQuoteDate(
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

    if (value.length <= 12) {
      return value;
    }

    return `${value.slice(0, 8)}...`;
  }


  quoteStatusLabel(
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