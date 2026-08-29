import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  Client,
  ClientWrite,
  emptyClientWrite
} from '../../core/models/client';

import {
  ClientService
} from '../../core/services/client.service';

@Component({
  selector: 'app-client-directory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './client-directory.html',
  styleUrls: ['./client-directory.css']
})
export class ClientDirectory implements OnInit {

  clients: Client[] = [];

  searchTerm = '';

  loading = false;

  creating = false;

  errorMessage = '';

  successMessage = '';

  showCreateClient = false;

  newClient: ClientWrite =
    emptyClientWrite();


  constructor(
    private clientService: ClientService,
    private router: Router
  ) {}


  ngOnInit(): void {
    this.loadClients();
  }


  loadClients(): void {

    this.loading = true;

    this.errorMessage = '';

    this.clientService
      .getClients()
      .subscribe({

        next: (clients) => {

          console.log(
            'Clients loaded:',
            clients
          );

          this.clients = clients;

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Error loading clients:',
            error
          );

          this.errorMessage =
            'Could not load clients.';

          this.loading = false;

        }

      });
  }


  get filteredClients(): Client[] {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    if (!search) {
      return this.clients;
    }

    return this.clients.filter(
      client =>

        client.name
          .toLowerCase()
          .includes(search)

        ||

        client.contact_name
          .toLowerCase()
          .includes(search)

        ||

        client.contact_email
          .toLowerCase()
          .includes(search)

        ||

        client.contact_phone
          .toLowerCase()
          .includes(search)

        ||

        client.id
          .toLowerCase()
          .includes(search)

    );
  }


  openClient(
    client: Client
  ): void {

    this.router.navigate([
      '/client',
      client.id
    ]);
  }


  openCreateClient(): void {

    console.log(
      'Opening create client modal'
    );

    this.newClient =
      emptyClientWrite();

    this.errorMessage = '';

    this.successMessage = '';

    this.showCreateClient = true;
  }


  closeCreateClient(): void {

    if (this.creating) {
      return;
    }

    this.showCreateClient = false;

    this.errorMessage = '';
  }


  createClient(): void {

    console.log(
      'Create client clicked'
    );

    console.log(
      'Payload:',
      this.newClient
    );


    if (
      !this.newClient.name.trim() ||
      !this.newClient.contact_name.trim() ||
      !this.newClient.contact_phone.trim() ||
      !this.newClient.contact_email.trim()
    ) {

      this.errorMessage =
        'Complete all client fields.';

      return;
    }


    this.creating = true;

    this.errorMessage = '';

    this.successMessage = '';


    this.clientService
      .createClient(
        this.newClient
      )
      .subscribe({

        next: (createdClient) => {

          console.log(
            'Client created:',
            createdClient
          );

          this.creating = false;

          this.showCreateClient = false;

          this.newClient =
            emptyClientWrite();

          this.successMessage =
            'Client created successfully.';

          /*
           * Always reload from backend
           * so the directory reflects
           * the real API state.
           */
          this.loadClients();

        },

        error: (error) => {

          console.error(
            'Error creating client:',
            error
          );

          console.error(
            'Backend response:',
            error?.error
          );


          if (
            typeof error?.error?.detail === 'string'
          ) {

            this.errorMessage =
              error.error.detail;

          } else if (
            error?.error?.detail
          ) {

            this.errorMessage =
              JSON.stringify(
                error.error.detail
              );

          } else {

            this.errorMessage =
              'Could not create client.';

          }


          this.creating = false;

        }

      });
  }

}