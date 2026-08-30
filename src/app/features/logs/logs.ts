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
  Call
} from '../../core/models/call';

import {
  CallService
} from '../../core/services/call.service';


@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './logs.html',
  styleUrls: [
    './logs.css'
  ]
})
export class Logs implements OnInit {

  calls: Call[] = [];

  loading = false;

  errorMessage = '';

  searchTerm = '';


  constructor(
    private callService: CallService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.loadCalls();
  }


  loadCalls(): void {

    this.loading = true;

    this.errorMessage = '';

    this.cdr.detectChanges();


    this.callService
      .getCalls()
      .subscribe({

        next: (calls) => {

          console.log(
            'Calls loaded:',
            calls
          );

          this.calls =
            Array.isArray(calls)
              ? calls
              : [];

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error loading calls:',
            error
          );

          this.calls = [];

          this.errorMessage =
            'Could not load call logs.';

          this.loading = false;

          this.cdr.detectChanges();
        }

      });
  }


  get filteredCalls(): Call[] {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    if (!search) {
      return this.calls;
    }


    return this.calls.filter(
      call =>

        (call.id ?? '')
          .toLowerCase()
          .includes(search)

        ||

        (call.call_id ?? '')
          .toLowerCase()
          .includes(search)

        ||

        (call.agent_id ?? '')
          .toLowerCase()
          .includes(search)

        ||

        (call.summary ?? '')
          .toLowerCase()
          .includes(search)

    );
  }


  formatDuration(
    seconds: number | null
  ): string {

    if (
      seconds === null ||
      seconds === undefined
    ) {
      return '—';
    }


    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      Math.round(seconds % 60);


    return (
      `${minutes}m ${remainingSeconds}s`
    );
  }


  formatTimestamp(
    seconds: number | null
  ): string {

    if (
      seconds === null ||
      seconds === undefined
    ) {
      return '—';
    }


    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      Math.round(seconds % 60);


    return (
      `${minutes}:${remainingSeconds
        .toString()
        .padStart(2, '0')}`
    );
  }


  openRecording(
    call: Call
  ): void {

    if (!call.url) {
      return;
    }

    window.open(
      call.url,
      '_blank',
      'noopener,noreferrer'
    );
  }

}