import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { LucideCheck, LucideDynamicIcon, LucideSearch, LucideTruck } from '@lucide/angular';

import { Carrier, carrierRoutes } from '../../core/models/carrier';
import { carrierMatchesSearch } from '../../core/models/deploy-agent';
import { carrierInitials } from '../../core/utils/initials';

@Component({
  selector: 'app-carrier-picker',
  templateUrl: './carrier-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  imports: [LucideDynamicIcon],
})
export class CarrierPicker {
  readonly carriers = input.required<Carrier[]>();
  readonly selectedIds = input.required<string[]>();
  readonly loadError = input<string | null>(null);
  readonly toggled = output<string>();
  readonly cleared = output<void>();

  protected readonly icons = {
    truck: LucideTruck,
    search: LucideSearch,
    check: LucideCheck,
  };
  protected readonly initials = carrierInitials;
  protected readonly routesOf = carrierRoutes;
  protected readonly query = signal('');

  protected readonly selectedSet = computed(() => new Set(this.selectedIds()));
  protected readonly visibleCarriers = computed(() => {
    const needle = this.query().trim();
    const rows = this.carriers();
    if (!needle) {
      return rows;
    }
    return rows.filter((carrier) => carrierMatchesSearch(carrier, needle));
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
