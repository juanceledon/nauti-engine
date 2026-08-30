import { DatePipe } from '@angular/common';
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

import { AuthService } from '../../core/auth/auth.service';
import { Call } from '../../core/models/call';
import { LogisticsApi } from '../../core/services/logistics.api';

@Component({
  selector: 'app-portal-calls',
  templateUrl: './portal-calls.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 min-w-0 flex-1 overflow-hidden' },
  imports: [DatePipe, LucideDynamicIcon],
})
export class PortalCalls implements OnInit {
  private readonly api = inject(LogisticsApi);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly icons = { search: LucideSearch };
  protected readonly calls = signal<Call[]>([]);
  protected readonly query = signal('');
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  protected readonly visible = computed(() => {
    const needle = this.query().trim().toLowerCase();
    const rows = this.calls();
    if (!needle) {
      return rows;
    }
    return rows.filter((call) => {
      const haystack = [
        call.id,
        call.call_id,
        call.summary ?? '',
        call.contact_name ?? '',
        call.contact_phone ?? '',
        call.status ?? '',
        call.agent_id ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  });

  ngOnInit(): void {
    this.api
      .listCalls(this.auth.clientId() || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rows) => {
          this.calls.set(rows);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set('Could not load call logs.');
          this.loading.set(false);
        },
      });
  }

  protected onSearch(event: Event): void {
    const field = event.target;
    if (field instanceof HTMLInputElement) {
      this.query.set(field.value);
    }
  }

  protected durationLabel(seconds: number | null | undefined): string {
    if (seconds == null) {
      return '—';
    }
    const total = Math.max(0, Math.round(seconds));
    const minutes = Math.floor(total / 60);
    const rest = total % 60;
    return `${minutes}m ${rest}s`;
  }
}
