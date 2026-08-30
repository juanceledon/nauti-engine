import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CarrierDialog } from '../../core/services/carrier-dialog';
import { CarrierForm } from '../../features/carriers/carrier-form';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-admin-shell',
  templateUrl: './admin-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Navbar, CarrierForm],
  host: { class: 'relative block h-screen overflow-hidden' },
})
export class AdminShell {
  protected readonly dialog = inject(CarrierDialog);
}
