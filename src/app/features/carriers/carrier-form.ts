import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';

import { Carrier, CarrierWrite, carrierToWrite, emptyCarrierWrite } from '../../core/models/carrier';

@Component({
  selector: 'app-carrier-form',
  templateUrl: './carrier-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarrierForm {
  readonly carrier = input<Carrier | null>(null);
  readonly saving = input(false);
  readonly error = input<string | null>(null);
  readonly save = output<CarrierWrite>();
  readonly cancelled = output<void>();

  protected readonly draft = signal<CarrierWrite>(emptyCarrierWrite());

  constructor() {
    effect(() => {
      const current = this.carrier();
      this.draft.set(current ? carrierToWrite(current) : emptyCarrierWrite());
    });
  }

  protected readonly isEdit = computed(() => this.carrier() !== null);

  protected patchField(key: keyof CarrierWrite, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.draft.update((current) => ({ ...current, [key]: value }));
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.save.emit(this.draft());
  }
}
