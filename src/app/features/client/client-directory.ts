import {
  ChangeDetectorRef,
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
  styleUrls: [
    './client-directory.css'
  ]
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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.loadClients();
  }


  // =====================================
  // LOAD CLIENTS
  // =====================================

  loadClients(): void {

    this.loading = true;

    this.errorMessage = '';

    this.cdr.detectChanges();


    this.clientService
      .getClients()
      .subscribe({

        next: (clients) => {

          console.log(
            'Clients loaded:',
            clients
          );

          this.clients =
            Array.isArray(clients)
              ? clients
              : [];

          this.loading = false;

          /*
           * Important:
           * forces UI refresh immediately
           * when HTTP response arrives.
           */
          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error loading clients:',
            error
          );

          this.clients = [];

          this.errorMessage =
            'Could not load clients.';

          this.loading = false;

          this.cdr.detectChanges();
        }

      });
  }


  // =====================================
  // DEDUPLICATED CLIENTS + SEARCH
  // =====================================

  get filteredClients(): Client[] {

    const uniqueClients =
      this.clients.filter(
        (
          client,
          index,
          array
        ) => {

          const phone =
            this.normalizePhone(
              client.contact_phone
            );

          const email =
            this.normalizeEmail(
              client.contact_email
            );

          const firstMatchingIndex =
            array.findIndex(
              item => {

                const itemPhone =
                  this.normalizePhone(
                    item.contact_phone
                  );

                const itemEmail =
                  this.normalizeEmail(
                    item.contact_email
                  );

                const samePhone =
                  Boolean(phone) &&
                  phone === itemPhone;

                const sameEmail =
                  Boolean(email) &&
                  email === itemEmail;

                return (
                  samePhone ||
                  sameEmail
                );
              }
            );

          return (
            firstMatchingIndex === index
          );
        }
      );


    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    if (!search) {
      return uniqueClients;
    }


    return uniqueClients.filter(
      client => {

        const name =
          client.name ?? '';

        const contactName =
          client.contact_name ?? '';

        const email =
          client.contact_email ?? '';

        const phone =
          client.contact_phone ?? '';

        const id =
          client.id ?? '';

        return (
          name
            .toLowerCase()
            .includes(search)
          ||
          contactName
            .toLowerCase()
            .includes(search)
          ||
          email
            .toLowerCase()
            .includes(search)
          ||
          phone
            .toLowerCase()
            .includes(search)
          ||
          id
            .toLowerCase()
            .includes(search)
        );
      }
    );
  }


  // =====================================
  // NAVIGATION
  // =====================================

  openClient(
    client: Client
  ): void {

    this.router.navigate([
      '/client',
      client.id
    ]);
  }


  // =====================================
  // CREATE MODAL
  // =====================================

  openCreateClient(): void {

    this.newClient =
      emptyClientWrite();

    this.errorMessage = '';

    this.successMessage = '';

    this.showCreateClient = true;

    this.cdr.detectChanges();
  }


  closeCreateClient(): void {

    if (this.creating) {
      return;
    }

    this.showCreateClient = false;

    this.errorMessage = '';

    this.cdr.detectChanges();
  }


  // =====================================
  // CREATE CLIENT
  // =====================================

  createClient(): void {

    /*
     * Prevent double POST.
     */
    if (this.creating) {
      return;
    }


    const payload: ClientWrite = {

      ...this.newClient,

      name:
        this.newClient.name.trim(),

      contact_name:
        this.newClient
          .contact_name
          .trim(),

      contact_phone:
        this.newClient
          .contact_phone
          .trim(),

      contact_email:
        this.newClient
          .contact_email
          .trim()
    };


    if (
      !payload.name ||
      !payload.contact_name ||
      !payload.contact_phone ||
      !payload.contact_email
    ) {

      this.errorMessage =
        'Complete all client fields.';

      this.cdr.detectChanges();

      return;
    }


    const duplicate =
      this.findDuplicateClient(
        payload
      );


    if (duplicate) {

      this.errorMessage =
        'A client with this phone or email already exists.';

      this.cdr.detectChanges();

      return;
    }


    this.creating = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.cdr.detectChanges();


    this.clientService
      .createClient(
        payload
      )
      .subscribe({

        next: (createdClient) => {

          console.log(
            'Client created:',
            createdClient
          );


          /*
           * Immediate local update.
           * No second blocking GET.
           */
          this.clients = [
            createdClient,
            ...this.clients
          ];


          this.creating = false;

          this.showCreateClient = false;

          this.newClient =
            emptyClientWrite();

          this.successMessage =
            'Client created successfully.';


          /*
           * Immediately paint new state.
           */
          this.cdr.detectChanges();
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
            typeof error?.error?.detail
            === 'string'
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

          this.cdr.detectChanges();
        }

      });
  }


  // =====================================
  // DUPLICATE CHECK
  // =====================================

  private findDuplicateClient(
    payload: ClientWrite
  ): Client | undefined {

    const newPhone =
      this.normalizePhone(
        payload.contact_phone
      );

    const newEmail =
      this.normalizeEmail(
        payload.contact_email
      );


    return this.clients.find(
      client => {

        const existingPhone =
          this.normalizePhone(
            client.contact_phone
          );

        const existingEmail =
          this.normalizeEmail(
            client.contact_email
          );


        const samePhone =
          Boolean(newPhone) &&
          newPhone === existingPhone;

        const sameEmail =
          Boolean(newEmail) &&
          newEmail === existingEmail;


        return (
          samePhone ||
          sameEmail
        );
      }
    );
  }


  // =====================================
  // NORMALIZERS
  // =====================================

  private normalizePhone(
    phone:
      string |
      null |
      undefined
  ): string {

    if (!phone) {
      return '';
    }

    return phone.replace(
      /\D/g,
      ''
    );
  }


  private normalizeEmail(
    email:
      string |
      null |
      undefined
  ): string {

    if (!email) {
      return '';
    }

    const normalized =
      email
        .trim()
        .toLowerCase();


    if (
      normalized === 'undefined' ||
      normalized === 'null'
    ) {
      return '';
    }


    return normalized;
  }

}