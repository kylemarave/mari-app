import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideCalendar,
  LucideCheckSquare,
  LucideFolder,
  LucideLayoutDashboard,
  LucideLayers,
} from '@lucide/angular';
import { NAV_ITEMS } from '../../core/data/seed-data';
import { MariStoreService } from '../../core/services/mari-store.service';

@Component({
  selector: 'app-bottom-nav',
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideLayoutDashboard,
    LucideFolder,
    LucideCalendar,
    LucideLayers,
    LucideCheckSquare,
  ],
  template: `
    <nav
      class="flex h-[72px] shrink-0 items-stretch justify-around border-t border-mari-border/80 bg-mari-bg/95 px-2 pb-1 pt-1 backdrop-blur-md"
    >
      @for (item of mobileItems(); track item.path) {
        <a
          [routerLink]="item.path"
          routerLinkActive="text-mari-primary"
          #rla="routerLinkActive"
          [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
          class="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[12px] text-[10px] font-medium text-mari-text-tertiary transition-colors active:bg-mari-bg-secondary"
        >
          @if (rla.isActive) {
            <span class="absolute inset-x-3 top-0 h-0.5 rounded-full bg-mari-primary"></span>
          }
          @switch (item.icon) {
            @case ('dashboard') {
              <svg lucideLayoutDashboard [size]="22"></svg>
            }
            @case ('courses') {
              <svg lucideFolder [size]="22"></svg>
            }
            @case ('schedule') {
              <svg lucideCalendar [size]="22"></svg>
            }
            @case ('tasks') {
              <svg lucideCheckSquare [size]="22"></svg>
            }
            @case ('study-sets') {
              <svg lucideLayers [size]="22"></svg>
            }
          }
          <span [class.font-semibold]="rla.isActive">{{ item.mobileLabel }}</span>
          @if (item.path === '/tasks' && store.highPriorityTasks().length; as n) {
            <span
              class="absolute right-[calc(50%-18px)] top-2 flex size-4 items-center justify-center rounded-full bg-accent-coral text-[8px] font-bold text-white"
            >
              {{ n }}
            </span>
          }
        </a>
      }
    </nav>
  `,
})
export class BottomNavComponent {
  protected readonly store = inject(MariStoreService);
  protected readonly mobileItems = computed(() => {
    const mobile = NAV_ITEMS.filter((i) => !i.desktopOnly);
    const tasks = NAV_ITEMS.find((i) => i.path === '/tasks')!;
    const withoutStudy = mobile.filter((i) => i.path !== '/study-sets');
    return [...withoutStudy.slice(0, 3), tasks, mobile.find((i) => i.path === '/study-sets')!];
  });
}
