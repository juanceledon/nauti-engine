import { Injectable, signal } from '@angular/core';

export type NautiTheme = 'nauti' | 'nauti-dark';

const STORAGE_KEY = 'nauti-theme';

function readStoredTheme(): NautiTheme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'nauti-dark' ? 'nauti-dark' : 'nauti';
  } catch {
    return 'nauti';
  }
}

function applyTheme(theme: NautiTheme): void {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme === 'nauti-dark' ? 'dark' : 'light';
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<NautiTheme>(readStoredTheme());

  constructor() {
    applyTheme(this.theme());
  }

  toggle(): void {
    const next: NautiTheme = this.theme() === 'nauti-dark' ? 'nauti' : 'nauti-dark';
    this.theme.set(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore quota / private mode */
    }
  }
}
