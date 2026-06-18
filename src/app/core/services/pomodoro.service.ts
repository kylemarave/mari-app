import { Injectable, computed, signal } from '@angular/core';

export type PomodoroPhase = 'focus' | 'short-break' | 'long-break';

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsUntilLongBreak: number;
}

interface PomodoroPersisted {
  completedToday: number;
  lastCompletedDate: string;
  settings: PomodoroSettings;
}

const STORAGE_PREFIX = 'mari-pomodoro-state';
const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4,
};

function storageKeyForUser(userId: string | null): string {
  return userId ? `${STORAGE_PREFIX}-${userId}` : STORAGE_PREFIX;
}

@Injectable({ providedIn: 'root' })
export class PomodoroService {
  private userId: string | null = null;
  private readonly settings = signal<PomodoroSettings>(DEFAULT_SETTINGS);
  private readonly phase = signal<PomodoroPhase>('focus');
  private readonly secondsRemaining = signal(DEFAULT_SETTINGS.focusMinutes * 60);
  private readonly running = signal(false);
  private readonly sessionsInCycle = signal(0);
  private readonly completedToday = signal(0);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly isRunning = computed(() => this.running());
  readonly currentPhase = computed(() => this.phase());
  readonly remainingSeconds = computed(() => this.secondsRemaining());
  readonly pomodoroSettings = computed(() => this.settings());
  readonly todaySessions = computed(() => this.completedToday());
  readonly sessionsUntilLongBreak = computed(() => this.settings().sessionsUntilLongBreak);

  readonly sessionsInCycleCount = computed(() => this.sessionsInCycle());

  readonly phaseLabel = computed(() => {
    switch (this.phase()) {
      case 'focus':
        return 'Focus';
      case 'short-break':
        return 'Short break';
      case 'long-break':
        return 'Long break';
    }
  });

  readonly totalSeconds = computed(() => {
    const s = this.settings();
    switch (this.phase()) {
      case 'focus':
        return s.focusMinutes * 60;
      case 'short-break':
        return s.shortBreakMinutes * 60;
      case 'long-break':
        return s.longBreakMinutes * 60;
    }
  });

  readonly progress = computed(() => {
    const total = this.totalSeconds();
    if (!total) return 0;
    return ((total - this.secondsRemaining()) / total) * 100;
  });

  readonly timeLabel = computed(() => {
    const seconds = this.secondsRemaining();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  bindUser(userId: string | null): void {
    this.pause();
    this.userId = userId;
    const persisted = this.loadPersisted();
    this.settings.set(persisted.settings);
    this.completedToday.set(persisted.completedToday);
    this.phase.set('focus');
    this.sessionsInCycle.set(0);
    this.secondsRemaining.set(persisted.settings.focusMinutes * 60);
  }

  start(): void {
    if (this.running()) return;
    this.running.set(true);
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  pause(): void {
    this.running.set(false);
    this.clearInterval();
  }

  toggle(): void {
    if (this.running()) this.pause();
    else this.start();
  }

  reset(): void {
    this.pause();
    this.secondsRemaining.set(this.totalSeconds());
  }

  skipPhase(): void {
    this.pause();
    this.advancePhase(false);
  }

  setFocusPreset(minutes: number): void {
    this.pause();
    this.settings.update((s) => ({ ...s, focusMinutes: minutes }));
    this.phase.set('focus');
    this.secondsRemaining.set(minutes * 60);
    this.persistSettings();
  }

  private tick(): void {
    const next = this.secondsRemaining() - 1;
    if (next <= 0) {
      this.advancePhase(true);
      return;
    }
    this.secondsRemaining.set(next);
  }

  private advancePhase(completed: boolean): void {
    const wasRunning = this.running();
    this.pause();
    const settings = this.settings();

    if (completed && this.phase() === 'focus') {
      const sessions = this.sessionsInCycle() + 1;
      this.sessionsInCycle.set(sessions);
      this.incrementTodaySessions();

      if (sessions >= settings.sessionsUntilLongBreak) {
        this.phase.set('long-break');
        this.sessionsInCycle.set(0);
        this.secondsRemaining.set(settings.longBreakMinutes * 60);
      } else {
        this.phase.set('short-break');
        this.secondsRemaining.set(settings.shortBreakMinutes * 60);
      }
    } else {
      this.phase.set('focus');
      this.secondsRemaining.set(settings.focusMinutes * 60);
    }

    if (wasRunning) this.start();
  }

  private incrementTodaySessions(): void {
    const today = this.todayKey();
    const persisted = this.loadPersisted();
    const count =
      persisted.lastCompletedDate === today ? persisted.completedToday + 1 : 1;
    this.completedToday.set(count);
    this.savePersisted({ ...persisted, completedToday: count, lastCompletedDate: today });
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private todayKey(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private loadPersisted(): PomodoroPersisted {
    const fallback: PomodoroPersisted = {
      completedToday: 0,
      lastCompletedDate: '',
      settings: DEFAULT_SETTINGS,
    };
    if (typeof localStorage === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(storageKeyForUser(this.userId));
      if (!raw) return fallback;
      const parsed = JSON.parse(raw) as Partial<PomodoroPersisted>;
      const settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
      const today = this.todayKey();
      const completedToday =
        parsed.lastCompletedDate === today ? (parsed.completedToday ?? 0) : 0;
      return {
        completedToday,
        lastCompletedDate: parsed.lastCompletedDate ?? '',
        settings,
      };
    } catch {
      return fallback;
    }
  }

  private persistSettings(): void {
    const persisted = this.loadPersisted();
    this.savePersisted({ ...persisted, settings: this.settings() });
  }

  private savePersisted(state: PomodoroPersisted): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(storageKeyForUser(this.userId), JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }
}
