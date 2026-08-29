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

  clientId = '';

  loadingClient = true;

  loadingKpis = true;

  clientError = '';

  kpiError = '';


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private analyticsService: AnalyticsService
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

    this.clientId =
      clientId;

    this.loadClient(
      clientId
    );

    this.loadKpis(
      clientId
    );
  }


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

          this.client =
            client;

          this.loadingClient =
            false;
        },

        error: (error) => {

          console.error(
            'Error loading client:',
            error
          );

          this.client = null;

          this.clientError =
            'Could not load client information.';

          this.loadingClient =
            false;
        }

      });
  }


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

          this.kpis = {

            total_active_operations:
              kpis.total_active_operations
              ?? 0,

            total_savings_mxn:
              kpis.total_savings_mxn
              ?? 0,

            total_negotiated_value_mxn:
              kpis.total_negotiated_value_mxn
              ?? 0,

            autonomous_resolution_rate:
              kpis.autonomous_resolution_rate
              ?? 0,

            mandate_compliance_rate:
              kpis.mandate_compliance_rate
              ?? 0,

            avg_negotiation_time_minutes:
              kpis.avg_negotiation_time_minutes
              ?? 0,

            verified_commitments_count:
              kpis.verified_commitments_count
              ?? 0
          };

          this.loadingKpis =
            false;
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

          this.loadingKpis =
            false;
        }

      });
  }


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
  }


  goBack(): void {

    this.router.navigate([
      '/client'
    ]);
  }


  get clientCountry(): string {

    if (this.client?.country) {
      return this.client.country;
    }

    return (
      this.inferredPhoneInfo?.country
      ??
      'Country not available'
    );
  }


  get clientCountryCode(): string {

    if (
      this.client?.country_code
    ) {
      return this.client.country_code;
    }

    return (
      this.inferredPhoneInfo?.countryCode
      ??
      ''
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

    if (
      safeValue === 1
    ) {
      return '1 min';
    }

    return `${safeValue.toFixed(1)} min`;
  }

}