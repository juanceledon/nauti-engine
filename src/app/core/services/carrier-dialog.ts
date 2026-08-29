import { Injectable, signal } from '@angular/core';

import { Carrier, CarrierWrite } from '../models/carrier';

@Injectable({ providedIn: 'root' })
export class CarrierDialog {
  readonly open = signal(false);
  readonly carrier = signal<Carrier | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  private onSave: ((body: CarrierWrite) => void) | null = null;

  present(carrier: Carrier | null, onSave: (body: CarrierWrite) => void): void {
    this.carrier.set(carrier);
    this.error.set(null);
    this.saving.set(false);
    this.onSave = onSave;
    this.open.set(true);
  }

  dismiss(): void {
    this.open.set(false);
    this.error.set(null);
    this.saving.set(false);
    this.onSave = null;
  }

  submit(body: CarrierWrite): void {
    this.onSave?.(body);
  }
}
