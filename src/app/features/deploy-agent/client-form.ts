import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

import { ClientWrite, emptyClientWrite, ClientDirection } from '../../core/models/client';
import { DIAL_CODES, joinPhone } from '../../core/utils/phone';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
})
export class ClientForm {
  readonly saving = input(false);
  readonly error = input<string | null>(null);
  readonly save = output<ClientWrite>();
  readonly cancelled = output<void>();

  protected readonly dialCodes = DIAL_CODES;
  protected readonly draft = signal(emptyClientWrite());
  protected readonly dialCode = signal('+52');
  protected readonly localNumber = signal('');

  protected patchField(key: keyof Omit<ClientWrite, 'contact_phone'>, event: Event): void {
    const field = event.target;
    if (!(field instanceof HTMLInputElement)) {
      return;
    }
    this.draft.update((current) => ({ ...current, [key]: field.value }));
  }

  protected setDirection(direction: ClientDirection): void {
    this.draft.update((current) => ({ ...current, direction }));
  }

  protected onDialInput(event: Event): void {
    const field = event.target;
    if (!(field instanceof HTMLInputElement)) {
      return;
    }
    this.dialCode.set(field.value);
  }

  protected onLocalNumber(event: Event): void {
    const field = event.target;
    if (!(field instanceof HTMLInputElement)) {
      return;
    }
    this.localNumber.set(field.value.replace(/\D/g, ''));
  }

  protected submit(event: Event): void {
    event.preventDefault();
    const draft = this.draft();
    this.save.emit({
      name: draft.name.trim(),
      contact_name: draft.contact_name.trim(),
      contact_email: draft.contact_email.trim(),
      contact_phone: joinPhone(this.dialCode(), this.localNumber()),
      direction: draft.direction,
    });
  }
}
