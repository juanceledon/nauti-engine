import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DASHBOARD_MOCK } from '../../core/mocks/dashboard.mock';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  data = DASHBOARD_MOCK;
}