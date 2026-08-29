import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  LucideDynamicIcon,
  LucideExternalLink,
  LucideFilter,
  LucideMoreHorizontal,
  LucidePlus,
  LucideSearch,
} from '@lucide/angular';

import { Carrier, CarrierWrite } from '../../core/models/carrier';
import { Quote } from '../../core/models/quote';
import { LogisticsApi } from '../../core/services/logistics.api';
import { carrierInitials } from '../../core/utils/initials';
import { CarrierDetail } from './carrier-detail';
import { CarrierForm } from './carrier-form';

@Component({
  selector: 'app-carriers-directory',
  templateUrl: './carriers-directory.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 min-w-0 flex-1 overflow-hidden' },
  imports: [LucideDynamicIcon, CarrierDetail, CarrierForm],
})
export class CarriersDirectory implements OnInit {
  private readonly api = inject(LogisticsApi);

  protected readonly icons = {
    search: LucideSearch,
    plus: LucidePlus,
    filter: LucideFilter,
    more: LucideMoreHorizontal,
    externalLink: LucideExternalLink,
  };
  protected readonly initials = carrierInitials;

  protected readonly carriers = signal<Carrier[]>([]);
  protected readonly quotes = signal<Quote[]>([]);
  protected readonly query = signal('');
  protected readonly selectedId = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly formOpen = signal(false);
  protected readonly editing = signal<Carrier | null>(null);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly filtered = computed(() => {
    const needle = this.query().trim().toLowerCase();
    const rows = this.carriers();
    if (!needle) {
      return rows;
    }
    return rows.filter((carrier) =>
      [carrier.name, carrier.id, carrier.primary_route, carrier.owner_name]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  });

  protected readonly selected = computed(
    () => this.filtered().find((carrier) => carrier.id === this.selectedId()) ?? null,
  );

  protected readonly withRouteCount = computed(
    () => this.carriers().filter((carrier) => (carrier.primary_route ?? '').trim().length > 0).length,
  );

  protected readonly withContactCount = computed(
    () =>
      this.carriers().filter(
        (carrier) => (carrier.email ?? '').trim() || (carrier.phone ?? '').trim(),
      ).length,
  );

  protected readonly routeCoverage = computed(() => {
    const total = this.carriers().length;
    if (total === 0) {
      return 0;
    }
    return Math.round((this.withRouteCount() / total) * 100);
  });

  protected readonly selectedQuotes = computed(() => {
    const id = this.selectedId();
    if (!id) {
      return [];
    }
    return this.quotes().filter((quote) => quote.carrier_id === id);
  });

  ngOnInit(): void {
    this.refresh();
  }

  protected refresh(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.api.listCarriers().subscribe({
      next: (rows) => {
        this.carriers.set(rows);
        this.loading.set(false);
        if (!this.selectedId() && rows[0]) {
          this.selectedId.set(rows[0].id);
        }
      },
      error: () => {
        this.loadError.set('No se pudieron cargar los carriers.');
        this.loading.set(false);
      },
    });
    this.api.listQuotes().subscribe({
      next: (rows) => this.quotes.set(rows),
      error: () => this.quotes.set([]),
    });
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected select(carrier: Carrier): void {
    this.selectedId.set(carrier.id);
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(): void {
    const current = this.selected();
    if (!current) {
      return;
    }
    this.editing.set(current);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.formError.set(null);
  }

  protected saveCarrier(body: CarrierWrite): void {
    this.saving.set(true);
    this.formError.set(null);
    const current = this.editing();
    const request = current
      ? this.api.updateCarrier(current.id, body)
      : this.api.createCarrier(body);

    request.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.carriers.update((rows) => {
          const without = rows.filter((row) => row.id !== saved.id);
          return [...without, saved].sort((a, b) => a.name.localeCompare(b.name));
        });
        this.selectedId.set(saved.id);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.formError.set(this.readError(err));
      },
    });
  }

  private readError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const detail = err.error?.detail;
      if (typeof detail === 'string') {
        return detail;
      }
    }
    return 'No se pudo guardar el carrier.';
  }
}
