import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { LucideBuilding2, LucideCheck, LucideDynamicIcon, LucidePlus, LucideSearch } from '@lucide/angular';

import { Client, clientDirection } from '../../core/models/client';
import { clientMatchesSearch } from '../../core/models/deploy-agent';
import { carrierInitials } from '../../core/utils/initials';

@Component({
  selector: 'app-client-picker',
  templateUrl: './client-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  imports: [LucideDynamicIcon],
})
export class ClientPicker {
  readonly clients = input.required<Client[]>();
  readonly selectedIds = input.required<string[]>();
  readonly loadError = input<string | null>(null);
  readonly toggled = output<string>();
  readonly addRequested = output<void>();

  protected readonly icons = {
    building: LucideBuilding2,
    search: LucideSearch,
    check: LucideCheck,
    plus: LucidePlus,
  };
  protected readonly initials = carrierInitials;
  protected readonly clientDirection = clientDirection;
  protected readonly query = signal('');

  protected readonly selectedSet = computed(() => new Set(this.selectedIds()));
  protected readonly visibleClients = computed(() => {
    const needle = this.query().trim();
    const rows = this.clients();
    if (!needle) {
      return rows;
    }
    return rows.filter((client) => clientMatchesSearch(client, needle));
  });

  protected isSelected(id: string): boolean {
    return this.selectedSet().has(id);
  }

  protected onSearch(event: Event): void {
    const field = event.target;
    if (!(field instanceof HTMLInputElement)) {
      return;
    }
    this.query.set(field.value);
  }
}
