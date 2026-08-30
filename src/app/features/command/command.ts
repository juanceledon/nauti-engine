import {
  ChangeDetectorRef,
  Component,
  OnDestroy
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Client
} from '../../core/models/client';

import {
  ClientService
} from '../../core/services/client.service';

import {
  CreateOperationRequest,
  Operation,
  emptyCreateOperationRequest
} from '../../core/models/operation';

import {
  OperationService
} from '../../core/services/operation.service';


type Step =
  | 'client'
  | 'origin'
  | 'destination'
  | 'price'
  | 'currency'
  | 'date'
  | 'review'
  | 'created';


@Component({
  selector: 'app-command',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './command.html',

  styleUrls: [
    './command.css'
  ]
})
export class Command implements OnDestroy {

  clients: Client[] = [];

  operation: CreateOperationRequest =
    emptyCreateOperationRequest();

  createdOperation: Operation | null =
    null;

  selectedClient: Client | null =
    null;

  step: Step =
    'client';

  loadingClients =
    false;

  creatingOperation =
    false;

  isTyping =
    false;

  errorMessage =
    '';

  clientSearch =
    '';


  private typingTimer:
    ReturnType<typeof setTimeout> | null =
      null;


  readonly originSuggestions = [
    'Manzanillo',
    'Veracruz',
    'Lázaro Cárdenas'
  ];


  readonly destinationSuggestions = [
    'Guadalajara',
    'Monterrey',
    'Mexico City'
  ];


  readonly priceSuggestions = [
    8500,
    12000,
    15000
  ];


  readonly currencySuggestions = [
    'MXN',
    'USD'
  ];


  constructor(
    private clientService: ClientService,
    private operationService: OperationService,
    private cdr: ChangeDetectorRef
  ) {

    this.loadClients();

  }


  ngOnDestroy(): void {

    if (this.typingTimer) {

      clearTimeout(
        this.typingTimer
      );

    }

  }


  // ==========================================
  // CHAT / TYPING
  // ==========================================

  private moveToStep(
    nextStep: Step
  ): void {

    this.step =
      nextStep;

    this.isTyping =
      true;

    this.cdr.detectChanges();


    if (this.typingTimer) {

      clearTimeout(
        this.typingTimer
      );

    }


    this.typingTimer =
      setTimeout(
        () => {

          this.isTyping =
            false;

          this.cdr.detectChanges();

        },
        700
      );

  }


  // ==========================================
  // CLIENTS
  // ==========================================

  loadClients(): void {

    this.loadingClients =
      true;

    this.errorMessage =
      '';

    this.clientService
      .getClients()
      .subscribe({

        next: (
          clients
        ) => {

          this.clients =
            Array.isArray(clients)
              ? clients
              : [];

          this.loadingClients =
            false;

          this.cdr.detectChanges();

        },


        error: (
          error
        ) => {

          console.error(
            'Error loading clients:',
            error
          );

          this.clients =
            [];

          this.loadingClients =
            false;

          this.errorMessage =
            'Could not load clients.';

          this.cdr.detectChanges();

        }

      });

  }


  get filteredClients():
    Client[] {

    const search =
      this.clientSearch
        .trim()
        .toLowerCase();


    if (!search) {

      return this.clients;

    }


    return this.clients.filter(
      client =>

        (client.name ?? '')
          .toLowerCase()
          .includes(search)

        ||

        (client.contact_name ?? '')
          .toLowerCase()
          .includes(search)

        ||

        (client.contact_phone ?? '')
          .toLowerCase()
          .includes(search)

        ||

        (client.contact_email ?? '')
          .toLowerCase()
          .includes(search)

    );

  }


  selectClient(
    client: Client
  ): void {

    this.selectedClient =
      client;

    this.operation.client_id =
      client.id;

    this.errorMessage =
      '';

    this.moveToStep(
      'origin'
    );

  }


  // ==========================================
  // ORIGIN
  // ==========================================

  chooseOrigin(
    value: string
  ): void {

    this.operation.origin =
      value;

    this.submitOrigin();

  }


  submitOrigin(): void {

    const value =
      this.operation.origin
        .trim();


    if (!value) {

      this.errorMessage =
        'Please enter the shipment origin.';

      return;

    }


    this.operation.origin =
      value;

    this.errorMessage =
      '';

    this.moveToStep(
      'destination'
    );

  }


  // ==========================================
  // DESTINATION
  // ==========================================

  chooseDestination(
    value: string
  ): void {

    this.operation.destination =
      value;

    this.submitDestination();

  }


  submitDestination(): void {

    const value =
      this.operation.destination
        .trim();


    if (!value) {

      this.errorMessage =
        'Please enter the destination.';

      return;

    }


    this.operation.destination =
      value;

    this.errorMessage =
      '';

    this.moveToStep(
      'price'
    );

  }


  // ==========================================
  // PRICE
  // ==========================================

  choosePrice(
    value: number
  ): void {

    this.operation.mandate_max_price =
      value;

    this.submitPrice();

  }


  submitPrice(): void {

    if (
      !this.operation.mandate_max_price
      ||
      this.operation.mandate_max_price <= 0
    ) {

      this.errorMessage =
        'Please enter a valid maximum price.';

      return;

    }


    this.errorMessage =
      '';

    this.moveToStep(
      'currency'
    );

  }


  // ==========================================
  // CURRENCY
  // ==========================================

  chooseCurrency(
    value: string
  ): void {

    this.operation.currency =
      value;

    this.submitCurrency();

  }


  submitCurrency(): void {

    const value =
      (
        this.operation.currency
        ?? ''
      )
        .trim();


    if (!value) {

      this.errorMessage =
        'Please select a currency.';

      return;

    }


    this.operation.currency =
      value;

    this.errorMessage =
      '';

    this.moveToStep(
      'date'
    );

  }


  // ==========================================
  // DATE
  // ==========================================

  chooseDateOffset(
    days: number
  ): void {

    const date =
      new Date();


    date.setDate(
      date.getDate()
      + days
    );


    this.operation.mandate_target_date =
      this.toDateInputValue(
        date
      );


    this.submitDate();

  }


  private toDateInputValue(
    date: Date
  ): string {

    const year =
      date.getFullYear();


    const month =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        '0'
      );


    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      );


    return (
      `${year}-${month}-${day}`
    );

  }


  submitDate(): void {

    if (
      !this.operation
        .mandate_target_date
    ) {

      this.errorMessage =
        'Please select a target date.';

      return;

    }


    this.errorMessage =
      '';

    this.moveToStep(
      'review'
    );

  }


  // ==========================================
  // REVIEW
  // ==========================================

  editMandate(): void {

    this.errorMessage =
      '';

    this.moveToStep(
      'origin'
    );

  }


  resetConversation(): void {

    this.operation =
      emptyCreateOperationRequest();

    this.createdOperation =
      null;

    this.selectedClient =
      null;

    this.clientSearch =
      '';

    this.errorMessage =
      '';

    this.isTyping =
      false;

    this.step =
      'client';

  }


  // ==========================================
  // CREATE OPERATION
  // ==========================================

  createOperation(): void {

    if (
      this.creatingOperation
    ) {

      return;

    }


    const currency =
      (
        this.operation.currency
        ?? ''
      )
        .trim();


    if (
      !this.operation.client_id
      ||
      !this.operation.origin
      ||
      !this.operation.destination
      ||
      !this.operation.mandate_max_price
      ||
      !currency
      ||
      !this.operation.mandate_target_date
    ) {

      this.errorMessage =
        'The mandate is incomplete.';

      return;

    }


    this.creatingOperation =
      true;

    this.errorMessage =
      '';


    /*
     * Command sends only the fields
     * required by the /operations endpoint.
     *
     * Deploy-specific fields such as:
     * carrier_ids
     * initial_hook
     * negotiation_style
     *
     * are intentionally not sent here.
     */
    const payload:
      CreateOperationRequest = {

      client_id:
        this.operation.client_id,

      origin:
        this.operation.origin,

      destination:
        this.operation.destination,

      mandate_max_price:
        this.operation.mandate_max_price,

      currency:
        currency,

      mandate_target_date:
        this.operation.mandate_target_date,

      status:
        'pending'

    };


    this.operationService
      .createOperation(
        payload
      )
      .subscribe({

        next: (
          operation
        ) => {

          console.log(
            'Operation created:',
            operation
          );


          this.createdOperation =
            operation;

          this.creatingOperation =
            false;

          this.step =
            'created';

          this.cdr.detectChanges();

        },


        error: (
          error
        ) => {

          console.error(
            'Error creating operation:',
            error
          );

          console.error(
            'Backend response:',
            error?.error
          );


          const detail =
            error?.error?.detail;


          if (
            typeof detail
            === 'string'
          ) {

            this.errorMessage =
              detail;

          }

          else if (
            Array.isArray(detail)
          ) {

            this.errorMessage =
              detail
                .map(
                  item =>
                    item?.msg
                    ??
                    'Validation error'
                )
                .join(
                  ' · '
                );

          }

          else if (
            detail
          ) {

            this.errorMessage =
              JSON.stringify(
                detail
              );

          }

          else {

            this.errorMessage =
              'Could not create operation.';

          }


          this.creatingOperation =
            false;

          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // FORMAT MONEY
  // ==========================================

  formatMoney(
    value: number
  ): string {

    if (!value) {

      return '—';

    }


    const currency =
      this.operation.currency
      ?? 'MXN';


    try {

      return new Intl
        .NumberFormat(
          'en-US',
          {
            style:
              'currency',

            currency:
              currency,

            maximumFractionDigits:
              0
          }
        )
        .format(
          value
        );

    }

    catch {

      return (
        `${value.toLocaleString()} `
        +
        `${currency}`
      );

    }

  }

}