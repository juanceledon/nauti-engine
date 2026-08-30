import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Client, ClientWrite, emptyClientWrite } from '../../core/models/client';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-client-directory',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './client-directory.html',
  styleUrls: ['./client-directory.css'],
})
export class ClientDirectory implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly router = inject(Router);

  protected readonly clients = signal<Client[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly loading = signal(false);
  protected readonly creating = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly showCreateClient = signal(false);
  protected readonly newClient = signal<ClientWrite>(emptyClientWrite());

  protected readonly filteredClients = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const rows = this.clients();
    if (!search) {
      return rows;
    }
    return rows.filter(
      (client) =>
        client.name.toLowerCase().includes(search) ||
        client.contact_name.toLowerCase().includes(search) ||
        client.contact_email.toLowerCase().includes(search) ||
        client.contact_phone.toLowerCase().includes(search) ||
        client.id.toLowerCase().includes(search),
    );
  });

  ngOnInit(): void {
    this.loadClients();
  }

  protected loadClients(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.clientService
      .getClients()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (clients) => this.clients.set(clients),
        error: () => this.errorMessage.set('Could not load clients.'),
      });
  }

  protected openClient(client: Client): void {
    void this.router.navigate(['/client', client.id]);
  }

  protected openCreateClient(): void {
    this.newClient.set(emptyClientWrite());
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showCreateClient.set(true);
  }

  protected closeCreateClient(): void {
    if (this.creating()) {
      return;
    }
    this.showCreateClient.set(false);
    this.errorMessage.set('');
  }

  protected patchNewClient(
    key: 'name' | 'contact_name' | 'contact_phone' | 'contact_email',
    value: string,
  ): void {
    this.newClient.update((current) => ({ ...current, [key]: value }));
  }

  protected createClient(): void {
    const payload = this.newClient();
    if (
      !payload.name.trim() ||
      !payload.contact_name.trim() ||
      !payload.contact_phone.trim() ||
      !payload.contact_email.trim()
    ) {
      this.errorMessage.set('Complete all client fields.');
      return;
    }

    this.creating.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.clientService
      .createClient(payload)
      .pipe(finalize(() => this.creating.set(false)))
      .subscribe({
        next: () => {
          this.showCreateClient.set(false);
          this.newClient.set(emptyClientWrite());
          this.successMessage.set('Client created successfully.');
          this.loadClients();
        },
        error: (error: { error?: { detail?: string | unknown } }) => {
          const detail = error?.error?.detail;
          if (typeof detail === 'string') {
            this.errorMessage.set(detail);
            return;
          }
          if (detail) {
            this.errorMessage.set(JSON.stringify(detail));
            return;
          }
          this.errorMessage.set('Could not create client.');
        },
      });
  }
}
