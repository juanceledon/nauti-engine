import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideDynamicIcon,
  LucideExternalLink,
  LucideFilter,
  LucidePlus,
  LucideSearch,
} from '@lucide/angular';

import { Carrier, CarrierWrite, carrierRoutes } from '../../core/models/carrier';
import { PrimaryRoute } from '../../core/models/primary-route';
import { Quote } from '../../core/models/quote';
import { CarrierDialog } from '../../core/services/carrier-dialog';
import { LogisticsApi } from '../../core/services/logistics.api';
import { carrierInitials } from '../../core/utils/initials';
import { CarrierDetail } from './carrier-detail';

@Component({
  selector: 'app-carriers-directory',
  templateUrl: './carriers-directory.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 min-w-0 flex-1 overflow-hidden' },
  imports: [LucideDynamicIcon, CarrierDetail],
})
export class CarriersDirectory implements OnInit {
  private readonly api = inject(LogisticsApi);
  private readonly dialog = inject(CarrierDialog);
  private readonly destroyRef = inject(DestroyRef);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly icons = {
    search: LucideSearch,
    plus: LucidePlus,
    filter: LucideFilter,
    externalLink: LucideExternalLink,
    prev: LucideChevronLeft,
    next: LucideChevronRight,
  };
  protected readonly initials = carrierInitials;
  protected readonly routesOf = carrierRoutes;
  protected readonly pageSize = 10;

  protected readonly carriers = signal<Carrier[]>([]);
  protected readonly quotes = signal<Quote[]>([]);
  protected readonly routes = signal<PrimaryRoute[]>([]);
  protected readonly query = signal('');
  protected readonly routeFilter = signal('');
  protected readonly page = signal(1);
  protected readonly total = signal(0);
  protected readonly pages = signal(1);
  protected readonly withRouteCount = signal(0);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly filtersOpen = signal(false);

  protected readonly selected = computed(
    () => this.carriers().find((carrier) => carrier.id === this.selectedId()) ?? null,
  );

  protected readonly routeCoverage = computed(() => {
    const total = this.total();
    if (total === 0) {
      return 0;
    }
    return Math.round((this.withRouteCount() / total) * 100);
  });

  protected readonly rangeLabel = computed(() => {
    const total = this.total();
    if (total === 0) {
      return '0 of 0';
    }
    const start = (this.page() - 1) * this.pageSize + 1;
    const end = Math.min(this.page() * this.pageSize, total);
    return `${start}–${end} of ${total}`;
  });

  protected readonly selectedQuotes = computed(() => {
    const id = this.selectedId();
    if (!id) {
      return [];
    }
    return this.quotes().filter((quote) => quote.carrier_id === id);
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.clearSearchTimer());
  }

  ngOnInit(): void {
    this.refresh();
    this.api.listPrimaryRoutes().subscribe({
      next: (rows) => this.routes.set(rows),
      error: () => this.routes.set([]),
    });
    this.api.listQuotes().subscribe({
      next: (rows) => this.quotes.set(rows),
      error: () => this.quotes.set([]),
    });
  }

  protected refresh(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.api
      .listCarriers({
        q: this.query(),
        route: this.routeFilter(),
        page: this.page(),
        page_size: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          this.carriers.set(response.items);
          this.total.set(response.total);
          this.pages.set(response.pages);
          this.page.set(response.page);
          this.withRouteCount.set(response.with_route_count);
          this.loading.set(false);
          const selected = this.selectedId();
          if (selected && !response.items.some((carrier) => carrier.id === selected)) {
            this.selectedId.set(response.items[0]?.id ?? null);
          } else if (!selected && response.items[0]) {
            this.selectedId.set(response.items[0].id);
          }
        },
        error: () => {
          this.loadError.set('Could not load carriers.');
          this.loading.set(false);
        },
      });
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.clearSearchTimer();
    this.searchTimer = setTimeout(() => {
      this.page.set(1);
      this.refresh();
    }, 350);
  }

  protected onRouteFilter(event: Event): void {
    this.routeFilter.set((event.target as HTMLSelectElement).value);
    this.page.set(1);
    this.refresh();
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open) => !open);
  }

  protected goToPage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.pages() || nextPage === this.page()) {
      return;
    }
    this.page.set(nextPage);
    this.refresh();
  }

  protected select(carrier: Carrier): void {
    this.selectedId.set(carrier.id);
  }

  protected openCreate(): void {
    this.dialog.present(null, (body) => this.saveCarrier(body));
  }

  protected openEdit(): void {
    const current = this.selected();
    if (!current) {
      return;
    }
    this.dialog.present(current, (body) => this.saveCarrier(body));
  }

  private saveCarrier(body: CarrierWrite): void {
    this.dialog.saving.set(true);
    this.dialog.error.set(null);
    const current = this.dialog.carrier();
    const request = current
      ? this.api.updateCarrier(current.id, body)
      : this.api.createCarrier(body);

    request.subscribe({
      next: (saved) => {
        this.dialog.dismiss();
        this.selectedId.set(saved.id);
        this.refresh();
      },
      error: (err: unknown) => {
        this.dialog.saving.set(false);
        this.dialog.error.set(this.readError(err));
      },
    });
  }

  private clearSearchTimer(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
  }

  private readError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const detail = err.error?.detail;
      if (typeof detail === 'string') {
        return detail;
      }
    }
    return 'Could not save the carrier.';
  }
}
