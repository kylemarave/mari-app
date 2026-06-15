import { Component, inject } from '@angular/core';
import {
  LucideCoffee,
  LucidePause,
  LucidePlay,
  LucideRotateCcw,
  LucideSkipForward,
  LucideTimer,
} from '@lucide/angular';
import { PomodoroService } from '../../core/services/pomodoro.service';

@Component({
  selector: 'app-pomodoro-page',
  imports: [
    LucideTimer,
    LucidePlay,
    LucidePause,
    LucideRotateCcw,
    LucideSkipForward,
    LucideCoffee,
  ],
  template: `
    <div class="mari-page mx-auto max-w-2xl">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-mari-text sm:text-3xl">Pomodoro</h1>
        <p class="mt-1 text-sm text-mari-text-secondary">
          Stay focused with timed work sessions and breaks
        </p>
      </div>

      <div class="mari-surface-elevated overflow-hidden">
        <div
          class="border-b border-mari-border px-6 py-4 text-center"
          [class]="phaseHeaderClass()"
        >
          <div class="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wide">
            @if (pomodoro.currentPhase() === 'focus') {
              <svg lucideTimer [size]="16"></svg>
            } @else {
              <svg lucideCoffee [size]="16"></svg>
            }
            {{ pomodoro.phaseLabel() }}
          </div>
        </div>

        <div class="flex flex-col items-center px-6 py-10 sm:py-12">
          <div class="relative flex size-64 items-center justify-center sm:size-72">
            <svg class="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="currentColor"
                stroke-width="6"
                class="text-mari-bg-secondary"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="currentColor"
                stroke-width="6"
                stroke-linecap="round"
                class="text-mari-primary transition-all duration-1000"
                [attr.stroke-dasharray]="339.292"
                [attr.stroke-dashoffset]="339.292 - (339.292 * pomodoro.progress()) / 100"
              />
            </svg>
            <div class="text-center">
              <div class="font-mono text-5xl font-bold tracking-tight text-mari-text sm:text-6xl">
                {{ pomodoro.timeLabel() }}
              </div>
              <div class="mt-2 text-sm text-mari-text-tertiary">
                @if (pomodoro.currentPhase() === 'focus') {
                  Session {{ pomodoro.sessionsInCycleCount() + 1 }} of {{ pomodoro.sessionsUntilLongBreak() }}
                } @else {
                  Rest before your next focus block
                }
              </div>
            </div>
          </div>

          <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button type="button" (click)="pomodoro.toggle()" class="mari-btn-primary min-w-[120px]">
              @if (pomodoro.isRunning()) {
                <svg lucidePause [size]="18"></svg>
                Pause
              } @else {
                <svg lucidePlay [size]="18"></svg>
                Start
              }
            </button>
            <button type="button" (click)="pomodoro.reset()" class="mari-btn-secondary">
              <svg lucideRotateCcw [size]="16"></svg>
              Reset
            </button>
            <button type="button" (click)="pomodoro.skipPhase()" class="mari-btn-secondary">
              <svg lucideSkipForward [size]="16"></svg>
              Skip
            </button>
          </div>
        </div>
      </div>

      <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div class="mari-stat py-4 text-center">
          <div class="mari-stat-label">Today</div>
          <div class="text-2xl font-bold text-mari-primary">{{ pomodoro.todaySessions() }}</div>
          <div class="mt-0.5 text-xs text-mari-text-tertiary">sessions done</div>
        </div>
        <div class="mari-stat py-4 text-center">
          <div class="mari-stat-label">Focus</div>
          <div class="text-2xl font-bold">{{ pomodoro.pomodoroSettings().focusMinutes }}m</div>
        </div>
        <div class="mari-stat col-span-2 py-4 text-center sm:col-span-1">
          <div class="mari-stat-label">Break</div>
          <div class="text-2xl font-bold">{{ pomodoro.pomodoroSettings().shortBreakMinutes }}m</div>
        </div>
      </div>

      <div class="mari-surface mt-5 p-5">
        <h2 class="mb-3 text-sm font-bold uppercase tracking-wide text-mari-text-tertiary">
          Focus length
        </h2>
        <div class="flex flex-wrap gap-2">
          @for (preset of focusPresets; track preset) {
            <button
              type="button"
              (click)="pomodoro.setFocusPreset(preset)"
              class="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              [class]="pomodoro.pomodoroSettings().focusMinutes === preset
                ? 'bg-mari-primary text-white shadow-sm'
                : 'bg-mari-bg-secondary text-mari-text-secondary ring-1 ring-mari-border hover:bg-mari-primary-light hover:text-mari-primary-dark'"
            >
              {{ preset }} min
            </button>
          }
        </div>
        <p class="mt-4 text-sm leading-relaxed text-mari-text-secondary">
          Classic Pomodoro: {{ pomodoro.pomodoroSettings().focusMinutes }}-minute focus blocks,
          {{ pomodoro.pomodoroSettings().shortBreakMinutes }}-minute breaks, and a
          {{ pomodoro.pomodoroSettings().longBreakMinutes }}-minute long break every
          {{ pomodoro.sessionsUntilLongBreak() }} sessions.
        </p>
      </div>
    </div>
  `,
})
export class PomodoroPage {
  protected readonly pomodoro = inject(PomodoroService);
  protected readonly focusPresets = [15, 25, 45, 50];

  phaseHeaderClass(): string {
    switch (this.pomodoro.currentPhase()) {
      case 'focus':
        return 'bg-mari-primary-light text-mari-primary-dark';
      case 'short-break':
        return 'bg-accent-teal-bg text-accent-teal-text';
      case 'long-break':
        return 'bg-accent-blue-bg text-accent-blue-text';
    }
  }
}
