import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CarrierDialog } from './core/services/carrier-dialog';
import { CarrierForm } from './features/carriers/carrier-form';
import { Navbar } from './layout/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, CarrierForm],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block h-screen overflow-hidden' },
})
export class App {
  protected readonly dialog = inject(CarrierDialog);
}
