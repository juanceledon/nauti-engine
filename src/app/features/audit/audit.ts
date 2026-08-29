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
import { LucideDynamicIcon, LucideSearch } from '@lucide/angular';
import { forkJoin } from 'rxjs';

import { buildNegotiationRows, negotiationMatchesSearch, NegotiationRow } from '../../core/models/audit';
import { AnalyticsKpis, emptyAnalyticsKpis } from '../../core/models/analytics';
import { LogisticsApi } from '../../core/services/logistics.api';
import { AuditKpis } from './audit-kpis';
import { AuditReceipt } from './audit-receipt';
import { NegotiationsTable } from './negotiations-table';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 min-w-0 flex-1 overflow-hidden' },
  imports: [LucideDynamicIcon, AuditKpis, NegotiationsTable, AuditReceipt],
})
export class Audit implements OnInit {
  private readonly api = inject(LogisticsApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly icons = {
    search: LucideSearch,
  };

  protected readonly kpis = signal<AnalyticsKpis>(emptyAnalyticsKpis());
  protected readonly rows = signal<NegotiationRow[]>([]);
  protected readonly query = signal('');
  protected readonly selectedId = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  protected readonly carriersContacted = computed(
    () => new Set(this.rows().map((row) => row.carrierId).filter(Boolean)).size,
  );

  protected readonly complianceRate = computed(() =>
    Math.round(this.kpis().mandate_compliance_rate),
  );
  protected readonly verifiedDeals = computed(() => this.kpis().verified_commitments_count);

  protected readonly visibleRows = computed(() => {
    const needle = this.query().trim();
    const rows = this.rows();
    if (!needle) {
      return rows;
    }
    return rows.filter((row) => negotiationMatchesSearch(row, needle));
  });

  protected readonly selectedRow = computed(() => {
    const id = this.selectedId();
    return this.rows().find((row) => row.id === id) ?? null;
  });

  ngOnInit(): void {
    forkJoin({
      operations: this.api.listOperations(),
      quotes: this.api.listQuotes(),
      commitments: this.api.listCommitments(),
      clients: this.api.listClients(),
      carriers: this.api.listCarriers({ page: 1, page_size: 100 }),
      kpis: this.api.getAnalyticsKpis(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          const rows = buildNegotiationRows({
            operations: data.operations,
            quotes: data.quotes,
            commitments: data.commitments,
            clients: data.clients,
            carriers: data.carriers.items,
          });
          this.rows.set(rows);
          this.kpis.set(data.kpis);
          this.selectedId.set(rows[0]?.id ?? null);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.loadError.set('Could not load audit data.');
        },
      });
  }

  protected onSearch(event: Event): void {
    const field = event.target;
    if (!(field instanceof HTMLInputElement)) {
      return;
    }
    this.query.set(field.value);
  }

  protected selectRow(id: string): void {
    this.selectedId.set(id);
  }

  protected exportLog(): void {
    const rows = this.visibleRows();
    if (rows.length === 0) {
      return;
    }
    const header = [
      'deal_id',
      'operation_id',
      'origin',
      'destination',
      'carrier',
      'initial_price',
      'negotiated_price',
      'currency',
      'status',
      'recap_sent',
      'agreed_name',
      'client',
      'client_phone',
    ];
    const lines = [
      header.join(','),
      ...rows.map((row) =>
        [
          row.dealLabel,
          row.operationId,
          row.origin,
          row.destination,
          row.carrierName,
          row.initialPrice ?? '',
          row.negotiatedPrice,
          row.currency,
          row.status,
          row.recapSent,
          row.agreedName,
          row.clientName,
          row.clientPhone,
        ]
          .map(csvCell)
          .join(','),
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nauti-audit.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}

function csvCell(value: string | number | boolean): string {
  const raw = String(value);
  if (/[",\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}
