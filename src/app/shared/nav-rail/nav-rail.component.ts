import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideCalendar,
  LucideCheckSquare,
  LucideFolder,
  LucideLayoutDashboard,
  LucideLayers,
  LucideSettings,
  LucideTimer,
} from '@lucide/angular';
import { NAV_ITEMS } from '../../core/data/seed-data';
import { MariLogoComponent } from '../mari-logo/mari-logo.component';

@Component({
  selector: 'app-nav-rail',
  imports: [
    RouterLink,
    RouterLinkActive,
    MariLogoComponent,
    LucideLayoutDashboard,
    LucideFolder,
    LucideCalendar,
    LucideLayers,
    LucideSettings,
    LucideCheckSquare,
    LucideTimer,
  ],
  template: `
    <aside
      class="flex h-full w-[252px] shrink-0 flex-col overflow-y-auto border-r border-mari-border/80 bg-mari-bg/95 p-5 backdrop-blur-sm"
    >
      <div class="mb-8 flex items-center gap-3 px-1">
        <app-mari-logo size="md" />
        <div>
          <span class="block text-base font-semibold text-mari-text">Mari</span>
          <span class="text-[11px] text-mari-text-tertiary">Student workspace</span>
        </div>
      </div>

      <nav class="flex flex-col gap-1">
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-mari-primary-light text-mari-primary-dark shadow-sm"
            #rla="routerLinkActive"
            [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
            class="group relative flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-medium text-mari-text-secondary transition-all hover:bg-mari-bg-secondary hover:text-mari-text"
          >
            @if (rla.isActive) {
              <span
                class="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-mari-primary"
              ></span>
            }
            @switch (item.icon) {
              @case ('dashboard') {
                <svg lucideLayoutDashboard [size]="18"></svg>
              }
              @case ('courses') {
                <svg lucideFolder [size]="18"></svg>
              }
              @case ('schedule') {
                <svg lucideCalendar [size]="18"></svg>
              }
              @case ('tasks') {
                <svg lucideCheckSquare [size]="18"></svg>
              }
              @case ('study-sets') {
                <svg lucideLayers [size]="18"></svg>
              }
              @case ('pomodoro') {
                <svg lucideTimer [size]="18"></svg>
              }
            }
            {{ item.label }}
          </a>
        }
      </nav>

      <div class="mt-auto space-y-1 border-t border-mari-border pt-4">
        <a
          routerLink="/settings"
          routerLinkActive="bg-mari-primary-light text-mari-primary-dark"
          class="flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-medium text-mari-text-secondary transition-colors hover:bg-mari-bg-secondary hover:text-mari-text"
        >
          <svg lucideSettings [size]="18"></svg>
          Settings
        </a>
      </div>
    </aside>
  `,
})
export class NavRailComponent {
  protected readonly navItems = NAV_ITEMS;
}
