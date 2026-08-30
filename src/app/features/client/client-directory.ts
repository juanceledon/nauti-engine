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

function normalizePhone(phone: string | null | undefined): string {
  return (phone ?? '').replace(/\D/g, '');
}

function normalizeEmail(email: string | null | undefined): string {
  const normalized = (email ?? '').trim().toLowerCase();
  if (!normalized || normalized === 'undefined' || normalized === 'null') {
    return '';
  }
  return normalized;
}

function sameClientIdentity(
  left: { contact_phone: string; contact_email: string },
  right: { contact_phone: string; contact_email: string },
): boolean {
  const phone = normalizePhone(left.contact_phone);
  const email = normalizeEmail(left.contact_email);
  const samePhone = Boolean(phone) && phone === normalizePhone(right.contact_phone);
  const sameEmail = Boolean(email) && email === normalizeEmail(right.contact_email);
  return samePhone || sameEmail;
}

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

  protected readonly uniqueClients = computed(() => {
    const rows = this.clients();
    return rows.filter((client, index) => {
      const first = rows.findIndex((item) => sameClientIdentity(client, item));
      return first === index;
    });
  });

  protected readonly filteredClients = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const rows = this.uniqueClients();
    if (!search) {
      return rows;
    }
    return rows.filter((client) => {
      const name = client.name ?? '';
      const contactName = client.contact_name ?? '';
      const email = client.contact_email ?? '';
      const phone = client.contact_phone ?? '';
      const id = client.id ?? '';
      return (
        name.toLowerCase().includes(search) ||
        contactName.toLowerCase().includes(search) ||
        email.toLowerCase().includes(search) ||
        phone.toLowerCase().includes(search) ||
        id.toLowerCase().includes(search)
      );
    });
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
        next: (clients) => this.clients.set(Array.isArray(clients) ? clients : []),
        error: () => {
          this.clients.set([]);
          this.errorMessage.set('Could not load clients.');
        },
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
    if (this.creating()) {
      return;
    }
    const draft = this.newClient();
    const payload: ClientWrite = {
      ...draft,
      name: draft.name.trim(),
      contact_name: draft.contact_name.trim(),
      contact_phone: draft.contact_phone.trim(),
      contact_email: draft.contact_email.trim(),
    };
    if (
      !payload.name ||
      !payload.contact_name ||
      !payload.contact_phone ||
      !payload.contact_email
    ) {
      this.errorMessage.set('Complete all client fields.');
      return;
    }
    if (this.clients().some((client) => sameClientIdentity(payload, client))) {
      this.errorMessage.set('A client with this phone or email already exists.');
      return;
    }

    this.creating.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.clientService
      .createClient(payload)
      .pipe(finalize(() => this.creating.set(false)))
      .subscribe({
        next: (createdClient) => {
          this.clients.update((rows) => [createdClient, ...rows]);
          this.showCreateClient.set(false);
          this.newClient.set(emptyClientWrite());
          this.successMessage.set('Client created successfully.');
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

  protected clientInitial(name: string | null | undefined): string {
    const trimmed = (name ?? '').trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
  }

  protected displayEmail(email: string | null | undefined): string {
    const normalized = normalizeEmail(email);
    return normalized || '—';
  }
}
