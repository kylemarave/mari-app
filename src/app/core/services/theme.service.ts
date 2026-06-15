import { Injectable, signal, computed, effect } from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'mari-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly preference = signal<ThemePreference>(this.loadPreference());

  readonly effectiveTheme = computed((): 'light' | 'dark' => {
    const pref = this.preference();
    if (pref === 'dark') return 'dark';
    if (pref === 'light') return 'light';
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  constructor() {
    if (typeof window !== 'undefined') {
      effect(() => {
        this.applyTheme(this.effectiveTheme());
        this.persist(this.preference());
      });

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.preference() === 'system') {
          this.applyTheme(this.effectiveTheme());
        }
      });
    }
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }

  private persist(preference: ThemePreference): void {
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      /* storage unavailable */
    }
  }

  private loadPreference(): ThemePreference {
    if (typeof localStorage === 'undefined') return 'system';
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
    } catch {
      /* ignore */
    }
    return 'system';
  }
}

/** Apply theme before Angular boot (call from index.html inline script). */
export function initThemeFromStorage(): void {
  if (typeof document === 'undefined' || typeof localStorage === 'undefined') return;
  let pref: ThemePreference = 'system';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') pref = raw;
  } catch {
    /* ignore */
  }
  const dark =
    pref === 'dark' ||
    (pref === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}
