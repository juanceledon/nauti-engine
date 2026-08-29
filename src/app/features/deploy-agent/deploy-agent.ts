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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideDynamicIcon, LucidePlay } from '@lucide/angular';
import { catchError, forkJoin, map, of } from 'rxjs';

import { Carrier, carrierRoutes } from '../../core/models/carrier';
import { Client, ClientWrite } from '../../core/models/client';
import {
  DEFAULT_MANDATE_BUDGET,
  defaultMandateDeadline,
  DeploySettings,
  DeploymentCall,
  emptyDeploySettings,
  estimateCallDuration,
  MAX_DEPLOY_CARRIERS,
  projectCallCost,
  waitingCallsFromCarriers,
} from '../../core/models/deploy-agent';
import { LogisticsApi } from '../../core/services/logistics.api';
import { splitLane } from '../../core/utils/routes';
import { CallSettings } from './call-settings';
import { CarrierPicker } from './carrier-picker';
import { ClientForm } from './client-form';
import { ClientPicker } from './client-picker';
import { DeploymentFeed } from './deployment-feed';

@Component({
  selector: 'app-deploy-agent',
  templateUrl: './deploy-agent.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative flex min-h-0 min-w-0 flex-1 overflow-hidden' },
  imports: [ClientPicker, CarrierPicker, DeploymentFeed, CallSettings, ClientForm, LucideDynamicIcon],
})
export class DeployAgent implements OnInit {
  private readonly api = inject(LogisticsApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly icons = { play: LucidePlay };
  protected readonly maxCarriers = MAX_DEPLOY_CARRIERS;
  protected readonly carriers = signal<Carrier[]>([]);
  protected readonly clients = signal<Client[]>([]);
  protected readonly selectedCarrierIds = signal<string[]>([]);
  protected readonly selectedClientIds = signal<string[]>([]);
  protected readonly settings = signal<DeploySettings>(emptyDeploySettings());
  protected readonly feed = signal<DeploymentCall[]>([]);
  protected readonly starting = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly clientsError = signal<string | null>(null);
  protected readonly startError = signal<string | null>(null);
  protected readonly operationIds = signal<string[]>([]);
  protected readonly addingClient = signal(false);
  protected readonly savingClient = signal(false);
  protected readonly clientFormError = signal<string | null>(null);

  protected readonly selectedCarriers = computed(() => {
    const ids = new Set(this.selectedCarrierIds());
    return this.carriers().filter((carrier) => ids.has(carrier.id));
  });
  protected readonly canStart = computed(
    () => this.selectedCarriers().length > 0 && this.selectedClientIds().length > 0,
  );
  protected readonly numberCount = computed(() => this.selectedCarriers().length);
  protected readonly durationLabel = computed(() => estimateCallDuration(this.numberCount()));
  protected readonly costLabel = computed(() => projectCallCost(this.numberCount()));

  ngOnInit(): void {
    this.api
      .listCarriers({ page: 1, page_size: 100 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.carriers.set(response.items);
          this.selectedCarrierIds.set(
            response.items.slice(0, MAX_DEPLOY_CARRIERS).map((carrier) => carrier.id),
          );
        },
        error: () => this.loadError.set('Could not load carriers.'),
      });
    this.api
      .listClients()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rows) => this.clients.set(rows),
        error: () => {
          this.clients.set([]);
          this.clientsError.set('Could not load clients. Add one before deploying.');
        },
      });
  }

  protected toggleClient(id: string): void {
    this.selectedClientIds.update((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      return [...current, id];
    });
  }

  protected toggleCarrier(id: string): void {
    this.selectedCarrierIds.update((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= MAX_DEPLOY_CARRIERS) {
        return current;
      }
      return [...current, id];
    });
  }

  protected clearCarriers(): void {
    this.selectedCarrierIds.set([]);
  }

  protected patchSettings(partial: Partial<DeploySettings>): void {
    this.settings.set({ ...this.settings(), ...partial });
  }

  protected openClientForm(): void {
    this.clientFormError.set(null);
    this.addingClient.set(true);
  }

  protected closeClientForm(): void {
    this.addingClient.set(false);
    this.clientFormError.set(null);
  }

  protected saveClient(body: ClientWrite): void {
    if (this.savingClient()) {
      return;
    }
    this.savingClient.set(true);
    this.clientFormError.set(null);
    this.api
      .createClient(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (client) => {
          this.clients.update((rows) => [client, ...rows.filter((row) => row.id !== client.id)]);
          this.selectedClientIds.update((ids) =>
            ids.includes(client.id) ? ids : [client.id, ...ids],
          );
          this.savingClient.set(false);
          this.closeClientForm();
        },
        error: (err: unknown) => {
          this.savingClient.set(false);
          this.clientFormError.set(this.readApiError(err, 'Could not create the client.'));
        },
      });
  }

  protected startCalling(): void {
    if (this.starting()) {
      return;
    }
    const error = this.validateDeploy();
    if (error) {
      this.startError.set(error);
      return;
    }
    const selected = this.selectedCarriers();
    const lane = this.laneFromCarriers(selected);
    if (!lane) {
      this.startError.set('Selected carriers need a supported route.');
      return;
    }
    const draft = this.settings();
    const clientIds = this.selectedClientIds();
    this.starting.set(true);
    this.startError.set(null);
    forkJoin(
      clientIds.map((clientId) =>
        this.api
          .createOperation({
            client_id: clientId,
            origin: lane.origin,
            destination: lane.destination,
            mandate_max_price: DEFAULT_MANDATE_BUDGET,
            mandate_target_date: defaultMandateDeadline(),
            carrier_ids: selected.map((carrier) => carrier.id),
            initial_hook: draft.hook.trim(),
            negotiation_style: draft.style,
          })
          .pipe(
            map((operation) => ({ ok: true as const, operation })),
            catchError((err: unknown) => of({ ok: false as const, err })),
          ),
      ),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        this.starting.set(false);
        const created = results.filter((result) => result.ok).map((result) => result.operation);
        const failed = results.find((result) => !result.ok);
        if (created.length > 0) {
          this.operationIds.set(created.map((operation) => operation.id));
          this.feed.set(waitingCallsFromCarriers(selected));
        }
        if (failed) {
          this.startError.set(
            this.readApiError(
              failed.err,
              created.length > 0
                ? 'Created some operations, but one or more clients failed.'
                : 'Could not create the operation.',
            ),
          );
        }
      });
  }

  private validateDeploy(): string | null {
    if (this.selectedCarriers().length === 0) {
      return 'Select at least one carrier.';
    }
    if (this.selectedClientIds().length === 0) {
      return 'Select at least one client.';
    }
    return null;
  }

  private laneFromCarriers(
    carriers: Carrier[],
  ): { origin: string; destination: string } | null {
    for (const carrier of carriers) {
      const route = carrierRoutes(carrier)[0];
      if (!route) {
        continue;
      }
      const lane = splitLane(route);
      if (lane.origin && lane.destination) {
        return lane;
      }
    }
    return null;
  }

  private readApiError(err: unknown, fallback: string): string {
    if (!(err instanceof HttpErrorResponse)) {
      return fallback;
    }
    const detail = err.error?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail) && detail[0] && typeof detail[0].msg === 'string') {
      return detail[0].msg;
    }
    return fallback;
  }
}
