import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAlarmClock, LucideTarget } from '@lucide/angular';
import { CountdownEvent } from '../../core/models/mari.models';

@Component({
  selector: 'app-countdown-banner',
  imports: [RouterLink, LucideAlarmClock, LucideTarget],
  template: `
    <a
      routerLink="/settings"
      class="mari-gradient-card flex flex-wrap items-center gap-3 rounded-[14px] px-4 py-3"
    >
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-mari-primary text-white shadow-sm"
      >
        <svg lucideAlarmClock [size]="20"></svg>
      </div>
      <div class="min-w-0 flex-1">
        <div class="text-xs font-semibold uppercase tracking-wide text-mari-primary-dark">
          Upcoming exam
        </div>
        <div class="truncate text-sm font-semibold text-mari-text">{{ event().label }}</div>
      </div>
      <div class="flex min-w-[140px] flex-1 items-center gap-2 sm:max-w-xs">
        <div class="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-mari-primary-muted/50">
          <div
            class="h-full rounded-full bg-gradient-to-r from-mari-primary to-mari-primary-dark transition-all duration-500"
            [style.width.%]="event().progress"
          ></div>
        </div>
        <span class="flex shrink-0 items-center gap-1 text-sm font-bold text-mari-primary">
          <svg lucideTarget [size]="14"></svg>
          {{ event().progress }}%
        </span>
      </div>
      <div
        class="mari-chip shrink-0 bg-mari-bg/90 text-mari-primary-dark ring-1 ring-mari-primary-muted/40"
      >
        {{ event().daysLeft }} days left
      </div>
    </a>
  `,
})
export class CountdownBannerComponent {
  readonly event = input.required<CountdownEvent>();
  readonly compact = input(false);
}
