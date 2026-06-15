import { Component, inject, input } from '@angular/core';
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
import { StudentProfile } from '../../core/models/mari.models';

@Component({
  selector: 'app-utility-sidebar',
  host: { class: 'block h-full min-h-0 shrink-0' },
  imports: [RouterLink, LucideCheckSquare, LucideCalendar, LucideBookOpen, LucideTrendingUp, LucideTimer],
  template: `
    <aside
      class="flex h-full w-full flex-col gap-4 border-l border-mari-border/80 bg-mari-bg/95 p-5 backdrop-blur-sm"
    >
      <div class="mari-surface p-4 text-center">
        <div
          class="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-blue-bg to-mari-primary-light text-base font-bold text-accent-blue-text ring-2 ring-white"
        >
          {{ profile().initials }}
        </div>
        <div class="text-base font-semibold text-mari-text">{{ profile().shortName }}</div>
        <div class="text-xs text-mari-text-tertiary">{{ profile().university }} · {{ profile().program }}</div>
        <div class="mt-3 inline-flex items-baseline gap-1 rounded-full bg-mari-primary-light px-3 py-1">
          <span class="text-xs text-mari-primary-dark">GPA</span>
          <span class="text-lg font-bold text-mari-primary">{{ profile().gpa }}</span>
        </div>
        <a routerLink="/settings" class="mari-btn-primary mt-4 w-full text-sm"> Manage ID </a>
      </div>

      <div class="mari-surface p-4">
        <div class="mb-3 text-[11px] font-semibold uppercase tracking-wider text-mari-text-tertiary">
          At a glance
        </div>
        <div class="space-y-3">
          <a
            routerLink="/tasks"
            class="flex items-center gap-3 rounded-[12px] bg-mari-bg-secondary p-3 transition-colors hover:bg-accent-coral-bg/50"
          >
            <div class="flex size-9 items-center justify-center rounded-[10px] bg-accent-coral-bg text-accent-coral-text">
              <svg lucideCheckSquare [size]="18"></svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs text-mari-text-tertiary">Tasks due</div>
              <div class="font-semibold text-mari-text">{{ store.dashboardStats().tasksDue }}</div>
            </div>
            @if (store.dashboardStats().urgent; as u) {
              @if (u > 0) {
                <span class="mari-chip bg-accent-coral-bg text-accent-coral-text">{{ u }} urgent</span>
              }
            }
          </a>

          <a
            routerLink="/schedule"
            class="flex items-center gap-3 rounded-[12px] bg-mari-bg-secondary p-3 transition-colors hover:bg-mari-primary-light/60"
          >
            <div class="flex size-9 items-center justify-center rounded-[10px] bg-mari-primary-light text-mari-primary-dark">
              <svg lucideCalendar [size]="18"></svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs text-mari-text-tertiary">Next class</div>
              <div class="truncate text-sm font-semibold text-mari-text">
                {{ store.dashboardStats().nextClass }}
              </div>
            </div>
          </a>

          <a
            routerLink="/study-sets"
            class="flex items-center gap-3 rounded-[12px] bg-mari-bg-secondary p-3 transition-colors hover:bg-accent-teal-bg/50"
          >
            <div class="flex size-9 items-center justify-center rounded-[10px] bg-accent-teal-bg text-accent-teal-text">
              <svg lucideBookOpen [size]="18"></svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs text-mari-text-tertiary">Study progress</div>
              <div class="font-semibold text-mari-text">{{ store.dashboardStats().studyProgress }}%</div>
            </div>
            <svg lucideTrendingUp [size]="16" class="text-accent-teal"></svg>
          </a>

          <a
            routerLink="/pomodoro"
            class="flex items-center gap-3 rounded-[12px] bg-mari-bg-secondary p-3 transition-colors hover:bg-accent-amber-bg/50"
          >
            <div class="flex size-9 items-center justify-center rounded-[10px] bg-accent-amber-bg text-accent-amber-text">
              <svg lucideTimer [size]="18"></svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs text-mari-text-tertiary">Pomodoro</div>
              <div class="font-semibold text-mari-text">{{ pomodoro.timeLabel() }}</div>
            </div>
            <span class="mari-chip bg-mari-bg text-mari-text-secondary">{{ pomodoro.phaseLabel() }}</span>
          </a>
        </div>
      </div>

      <div class="mari-surface p-4">
        <div class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-mari-text-tertiary">
          Exam countdown
        </div>
        <div class="text-sm font-semibold text-mari-primary-dark">{{ store.countdown().label }}</div>
        <div class="mt-3 h-2 overflow-hidden rounded-full bg-mari-primary-muted/40">
          <div
            class="h-full rounded-full bg-gradient-to-r from-mari-primary to-mari-primary-dark transition-all"
            [style.width.%]="store.countdown().progress"
          ></div>
        </div>
        <div class="mt-1 text-right text-xs font-medium text-mari-primary">
          {{ store.countdown().progress }}% prepared
        </div>
      </div>
    </aside>
  `,
})
export class UtilitySidebarComponent {
  readonly profile = input.required<StudentProfile>();
  protected readonly store = inject(MariStoreService);
  protected readonly pomodoro = inject(PomodoroService);
}
