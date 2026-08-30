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
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AnalyticsKpis, emptyAnalyticsKpis } from '../../core/models/analytics';
import { Client as ClientModel } from '../../core/models/client';
import { LogisticsApi } from '../../core/services/logistics.api';
import { inferPhoneCountry } from '../../core/utils/phone';

function normalizeKpis(kpis: AnalyticsKpis): AnalyticsKpis {
  return {
    total_active_operations: kpis.total_active_operations ?? 0,
    total_savings_mxn: kpis.total_savings_mxn ?? 0,
    total_negotiated_value_mxn: kpis.total_negotiated_value_mxn ?? 0,
    autonomous_resolution_rate: kpis.autonomous_resolution_rate ?? 0,
    mandate_compliance_rate: kpis.mandate_compliance_rate ?? 0,
    avg_negotiation_time_minutes: kpis.avg_negotiation_time_minutes ?? 0,
    verified_commitments_count: kpis.verified_commitments_count ?? 0,
  };
}

@Component({
  selector: 'app-client',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './client.html',
  styleUrls: ['./client.css'],
})
export class Client implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(LogisticsApi);
  private readonly destroyRef = inject(DestroyRef);

  private readonly clientId = signal('');
  protected readonly client = signal<ClientModel | null>(null);
  protected readonly kpis = signal<AnalyticsKpis>(emptyAnalyticsKpis());
  protected readonly loadingClient = signal(true);
  protected readonly loadingKpis = signal(true);
  protected readonly clientError = signal('');
  protected readonly kpiError = signal('');

  protected readonly clientCountry = computed(() => {
    const selected = this.client();
    if (selected?.country) {
      return selected.country;
    }
    return inferPhoneCountry(selected?.contact_phone)?.country ?? 'Country not available';
  });

  protected readonly clientCountryCode = computed(() => {
    const selected = this.client();
    if (selected?.country_code) {
      return selected.country_code;
    }
    return inferPhoneCountry(selected?.contact_phone)?.countryCode ?? '';
  });

  protected readonly clientPhone = computed(() => {
    const selected = this.client();
    return selected?.contact_phone_e164 || selected?.contact_phone || '—';
  });

  ngOnInit(): void {
    const clientId = this.route.snapshot.paramMap.get('id');
    if (!clientId) {
      void this.router.navigate(['/client']);
      return;
    }
    this.clientId.set(clientId);
    this.loadClient(clientId);
    this.loadKpis(clientId);
  }

  protected refreshDashboard(): void {
    const clientId = this.clientId();
    if (!clientId) {
      return;
    }
    this.loadClient(clientId);
    this.loadKpis(clientId);
  }

  protected goBack(): void {
    void this.router.navigate(['/client']);
  }

  protected formatMxn(value: number): string {
    const safeValue = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(safeValue);
  }

  protected formatPercentage(value: number): string {
    const safeValue = Number.isFinite(value) ? value : 0;
    return `${safeValue.toFixed(1)}%`;
  }

  protected formatMinutes(value: number): string {
    const safeValue = Number.isFinite(value) ? value : 0;
    if (safeValue === 1) {
      return '1 min';
    }
    return `${safeValue.toFixed(1)} min`;
  }

  private loadClient(clientId: string): void {
    this.loadingClient.set(true);
    this.clientError.set('');
    this.api
      .getClient(clientId)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loadingClient.set(false)))
      .subscribe({
        next: (client) => this.client.set(client),
        error: () => {
          this.client.set(null);
          this.clientError.set('Could not load client information.');
        },
      });
  }

  private loadKpis(clientId: string): void {
    this.loadingKpis.set(true);
    this.kpiError.set('');
    this.kpis.set(emptyAnalyticsKpis());
    this.api
      .getAnalyticsKpis(clientId)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loadingKpis.set(false)))
      .subscribe({
        next: (kpis) => this.kpis.set(normalizeKpis(kpis)),
        error: () => {
          this.kpis.set(emptyAnalyticsKpis());
          this.kpiError.set('Analytics are temporarily unavailable.');
        },
      });
  }
}
