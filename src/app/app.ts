import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CarrierDialog } from './core/services/carrier-dialog';
import { CarrierForm } from './features/carriers/carrier-form';
import { Navbar } from './layout/navbar/navbar';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block h-screen overflow-hidden' },
  imports: [RouterOutlet, Navbar, CarrierForm],
})
export class App {
  protected readonly dialog = inject(CarrierDialog);
}
