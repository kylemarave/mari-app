import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideBookOpen,
  LucideCalendar,
  LucideCheckSquare,
  LucideTimer,
  LucideTrendingUp,
} from '@lucide/angular';
import { MariStoreService } from '../../core/services/mari-store.service';
import { PomodoroService } from '../../core/services/pomodoro.service';

@Component({
  selector: 'app-utility-glance-panel',
  template: `
    <div class="flex min-w-0 flex-col gap-5">
      <div class="mari-surface min-w-0 p-3.5">
        <div class="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-mari-text-tertiary">
          At a glance
        </div>
        <div class="space-y-2">
          <a
            routerLink="/tasks"
            class="flex min-w-0 items-center gap-2.5 rounded-[10px] bg-mari-bg-secondary p-2.5 transition-colors hover:bg-accent-coral-bg/50"
          >
            <div
              class="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-accent-coral-bg text-accent-coral-text"
            >
              <svg lucideCheckSquare [size]="16"></svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[11px] text-mari-text-tertiary">Tasks due</div>
              <div class="text-sm font-semibold text-mari-text">{{ store.dashboardStats().tasksDue }}</div>
            </div>
            @if (store.dashboardStats().urgent; as u) {
              @if (u > 0) {
                <span class="mari-chip shrink-0 bg-accent-coral-bg text-accent-coral-text">{{ u }} urgent</span>
              }
            }
          </a>

          <a
            routerLink="/schedule"
            class="flex min-w-0 items-center gap-2.5 rounded-[10px] bg-mari-bg-secondary p-2.5 transition-colors hover:bg-mari-primary-light/60"
          >
            <div
              class="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-mari-primary-light text-mari-primary-dark"
            >
              <svg lucideCalendar [size]="16"></svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[11px] text-mari-text-tertiary">Next class</div>
              <div class="truncate text-xs font-semibold text-mari-text">
                {{ store.dashboardStats().nextClass }}
              </div>
            </div>
          </a>

          <a
            routerLink="/study-sets"
            class="flex min-w-0 items-center gap-2.5 rounded-[10px] bg-mari-bg-secondary p-2.5 transition-colors hover:bg-accent-teal-bg/50"
          >
            <div
              class="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-accent-teal-bg text-accent-teal-text"
            >
              <svg lucideBookOpen [size]="16"></svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[11px] text-mari-text-tertiary">Study progress</div>
              <div class="text-sm font-semibold text-mari-text">{{ store.dashboardStats().studyProgress }}%</div>
            </div>
            <svg lucideTrendingUp [size]="14" class="shrink-0 text-accent-teal"></svg>
          </a>

          <a
            routerLink="/pomodoro"
            class="flex min-w-0 items-center gap-2.5 rounded-[10px] bg-mari-bg-secondary p-2.5 transition-colors hover:bg-accent-amber-bg/50"
          >
            <div
              class="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-accent-amber-bg text-accent-amber-text"
            >
              <svg lucideTimer [size]="16"></svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[11px] text-mari-text-tertiary">Pomodoro</div>
              <div class="text-sm font-semibold text-mari-text">{{ pomodoro.timeLabel() }}</div>
            </div>
            <span class="mari-chip shrink-0 bg-mari-bg text-mari-text-secondary">{{ pomodoro.phaseLabel() }}</span>
          </a>
        </div>
      </div>

      <div class="mari-surface min-w-0 p-3.5">
        <div class="mb-2 text-[10px] font-semibold uppercase tracking-wider text-mari-text-tertiary">
          Exam countdown
        </div>
        <div class="text-xs font-semibold text-mari-primary-dark">{{ store.countdown().label }}</div>
        <div class="mt-2.5 h-1.5 overflow-hidden rounded-full bg-mari-primary-muted/40">
          <div
            class="h-full rounded-full bg-gradient-to-r from-mari-primary to-mari-primary-dark transition-all"
            [style.width.%]="store.countdown().progress"
          ></div>
        </div>
        <div class="mt-1 text-right text-[11px] font-medium text-mari-primary">
          {{ store.countdown().progress }}% prepared
        </div>
      </div>
    </div>
  `,
  imports: [RouterLink, LucideCheckSquare, LucideCalendar, LucideBookOpen, LucideTrendingUp, LucideTimer],
})
export class UtilityGlancePanelComponent {
  protected readonly store = inject(MariStoreService);
  protected readonly pomodoro = inject(PomodoroService);
}
