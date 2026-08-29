import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideCheck, LucideChevronDown, LucideDynamicIcon, LucideLoaderCircle, LucideX } from '@lucide/angular';

import { Carrier, CarrierWrite, carrierToWrite, emptyCarrierWrite } from '../../core/models/carrier';
import { PrimaryRoute } from '../../core/models/primary-route';
import { LogisticsApi } from '../../core/services/logistics.api';
import { DIAL_CODES, joinPhone, splitPhone } from '../../core/utils/phone';
import { normalizeRouteCode, routeOptionLabel } from '../../core/utils/routes';

@Component({
  selector: 'app-carrier-form',
  templateUrl: './carrier-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  imports: [LucideDynamicIcon],
})
export class CarrierForm {
  private readonly api = inject(LogisticsApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly carrier = input<Carrier | null>(null);
  readonly saving = input(false);
  readonly error = input<string | null>(null);
  readonly save = output<CarrierWrite>();
  readonly cancelled = output<void>();

  protected readonly icons = {
    chevron: LucideChevronDown,
    loader: LucideLoaderCircle,
    close: LucideX,
    check: LucideCheck,
  };
  protected readonly dialCodes = DIAL_CODES;
  protected readonly draft = signal<CarrierWrite>(emptyCarrierWrite());
  protected readonly dialCode = signal('+52');
  protected readonly localNumber = signal('');
  protected readonly routeDraft = signal('');
  protected readonly routeMenuOpen = signal(false);
  protected readonly catalog = signal<PrimaryRoute[]>([]);
  protected readonly addingRoute = signal(false);
  protected readonly routeError = signal<string | null>(null);
  protected readonly summarizing = signal(false);
  protected readonly summaryReady = signal(false);
  protected readonly summaryError = signal<string | null>(null);
  private lastSummarizedLink = '';
  private summarySeq = 0;
  private summaryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const current = this.carrier();
      const next = current ? carrierToWrite(current) : emptyCarrierWrite();
      const parts = splitPhone(next.phone);
      this.draft.set(next);
      this.dialCode.set(parts.dial);
      this.localNumber.set(parts.number);
      this.routeDraft.set('');
      this.lastSummarizedLink = next.info_link.trim();
      this.summaryReady.set(next.agent_summary.trim().length > 0);
      this.summaryError.set(null);
      this.summarizing.set(false);
    });
    this.api.listPrimaryRoutes().pipe(takeUntilDestroyed()).subscribe({
      next: (rows) => this.catalog.set(rows),
      error: () => this.catalog.set([]),
    });
    this.destroyRef.onDestroy(() => this.clearSummaryTimer());
  }

  protected readonly isEdit = computed(() => this.carrier() !== null);

  protected readonly summaryVisible = computed(
    () => !this.summarizing() && (this.summaryReady() || this.draft().agent_summary.trim().length > 0),
  );

  protected readonly typedRouteCode = computed(() => normalizeRouteCode(this.routeDraft()));

  protected readonly routeOptions = computed(() => {
    const query = this.typedRouteCode();
    const rows = this.catalog();
    if (!query) {
      return rows;
    }
    return rows.filter((route) => {
      const haystack = `${route.code} ${route.label}`.toUpperCase();
      return haystack.includes(query);
    });
  });

  protected readonly canAddRoute = computed(() => {
    const code = this.typedRouteCode();
    if (!code) {
      return false;
    }
    return !this.catalog().some((route) => route.code === code);
  });

  protected displayLabel(route: PrimaryRoute): string {
    return route.label || routeOptionLabel(route.code);
  }

  protected onRouteDraft(event: Event): void {
    this.routeDraft.set((event.target as HTMLInputElement).value);
    this.routeMenuOpen.set(true);
    this.routeError.set(null);
  }

  protected patchField(key: keyof CarrierWrite, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.draft.update((current) => ({ ...current, [key]: value }));
  }

  protected toggleRouteMenu(): void {
    this.routeMenuOpen.update((open) => !open);
  }

  protected isRouteSelected(code: string): boolean {
    return this.draft().supported_routes.includes(code);
  }

  protected toggleRoute(route: PrimaryRoute): void {
    if (this.isRouteSelected(route.code)) {
      this.removeRoute(route.code);
      return;
    }
    this.addRoute(route.code);
  }

  protected removeRoute(code: string, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.draft.update((current) => ({
      ...current,
      supported_routes: current.supported_routes.filter((route) => route !== code),
    }));
  }

  protected openRouteMenu(): void {
    this.routeMenuOpen.set(true);
  }

  private addRoute(code: string): void {
    const normalized = normalizeRouteCode(code);
    if (!normalized) {
      return;
    }
    this.draft.update((current) => {
      if (current.supported_routes.includes(normalized)) {
        return current;
      }
      return { ...current, supported_routes: [...current.supported_routes, normalized] };
    });
    this.routeDraft.set('');
    this.routeError.set(null);
  }

  protected addTypedRoute(): void {
    const code = this.typedRouteCode();
    if (!code || this.addingRoute()) {
      return;
    }
    this.addingRoute.set(true);
    this.routeError.set(null);
    this.api.createPrimaryRoute(code).subscribe({
      next: (created) => {
        this.catalog.update((rows) =>
          [...rows.filter((row) => row.code !== created.code), created].sort((a, b) =>
            a.code.localeCompare(b.code),
          ),
        );
        this.addRoute(created.code);
        this.routeMenuOpen.set(true);
        this.addingRoute.set(false);
      },
      error: (err: unknown) => {
        this.addingRoute.set(false);
        this.routeError.set(this.readRouteError(err));
      },
    });
  }

  protected closeRouteMenu(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    const box = event.currentTarget as HTMLElement;
    if (!next || !box.contains(next)) {
      this.routeMenuOpen.set(false);
    }
  }

  protected onDialInput(event: Event): void {
    this.dialCode.set((event.target as HTMLInputElement).value);
  }

  protected onLocalNumber(event: Event): void {
    this.localNumber.set((event.target as HTMLInputElement).value.replace(/\D/g, ''));
  }

  protected onInfoLinkInput(event: Event): void {
    this.patchField('info_link', event);
    this.queueSummary();
  }

  protected onInfoLinkBlur(): void {
    this.generateSummary();
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (this.summarizing()) {
      return;
    }
    const typed = this.typedRouteCode();
    const inCatalog = this.catalog().some((route) => route.code === typed);
    if (typed && inCatalog) {
      this.addRoute(typed);
    }
    const routes = this.draft().supported_routes;
    if (routes.length === 0) {
      this.routeError.set('Add at least one route.');
      return;
    }
    this.save.emit({
      ...this.draft(),
      supported_routes: routes,
      phone: joinPhone(this.dialCode(), this.localNumber()),
    });
  }

  private readRouteError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const detail = err.error?.detail;
      if (typeof detail === 'string') {
        return detail;
      }
    }
    return 'Could not add the route.';
  }

  private queueSummary(): void {
    this.clearSummaryTimer();
    this.summaryTimer = setTimeout(() => this.generateSummary(), 900);
  }

  private clearSummaryTimer(): void {
    if (this.summaryTimer) {
      clearTimeout(this.summaryTimer);
      this.summaryTimer = null;
    }
  }

  private generateSummary(): void {
    this.clearSummaryTimer();
    const link = this.draft().info_link.trim();
    if (!link) {
      this.lastSummarizedLink = '';
      this.summaryReady.set(false);
      this.summaryError.set(null);
      this.summarizing.set(false);
      return;
    }
    if (!this.isHttpUrl(link) || link === this.lastSummarizedLink) {
      return;
    }
    const seq = ++this.summarySeq;
    this.lastSummarizedLink = link;
    this.summarizing.set(true);
    this.summaryError.set(null);
    this.summaryReady.set(false);
    this.api.generateAgentSummary(link, this.draft().name).subscribe({
      next: (response) => {
        if (seq !== this.summarySeq) {
          return;
        }
        this.draft.update((current) => ({ ...current, agent_summary: response.summary }));
        this.summarizing.set(false);
        this.summaryReady.set(true);
      },
      error: (err: unknown) => {
        if (seq !== this.summarySeq) {
          return;
        }
        this.summarizing.set(false);
        this.summaryReady.set(true);
        this.summaryError.set(this.readSummaryError(err));
      },
    });
  }

  private isHttpUrl(raw: string): boolean {
    try {
      const parsed = new URL(raw);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private readSummaryError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const detail = err.error?.detail;
      if (typeof detail === 'string') {
        return detail;
      }
    }
    return 'Could not generate the agent summary.';
  }
}
