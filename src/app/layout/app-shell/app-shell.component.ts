import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideBell, LucideLogOut, LucideSettings, LucideTimer } from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';
import { MariStoreService } from '../../core/services/mari-store.service';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { CountdownBannerComponent } from '../../shared/countdown-banner/countdown-banner.component';
import { NavRailComponent } from '../../shared/nav-rail/nav-rail.component';
import { UtilitySidebarComponent } from '../../shared/utility-sidebar/utility-sidebar.component';
import { MariLogoComponent } from '../../shared/mari-logo/mari-logo.component';

@Component({
  selector: 'app-shell',
  host: { class: 'block h-dvh w-full overflow-hidden' },
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NavRailComponent,
    BottomNavComponent,
    UtilitySidebarComponent,
    CountdownBannerComponent,
    MariLogoComponent,
    LucideSettings,
    LucideBell,
    LucideTimer,
    LucideLogOut,
  ],
  template: `
    <div class="flex h-full overflow-hidden mari-bg-mesh">
      <app-nav-rail class="hidden h-full shrink-0 lg:flex" />

      <div class="flex min-h-0 min-w-0 flex-1 flex-col">
        <header class="z-20 shrink-0 border-b border-mari-border/80 bg-mari-bg/90 backdrop-blur-md">
          <div class="flex items-center justify-between gap-4 px-4 py-3 lg:px-8">
            <div class="flex min-w-0 items-center gap-3 lg:hidden">
              <app-mari-logo size="sm" />
              <div>
                <div class="text-sm font-semibold text-mari-text">Mari</div>
                <div class="text-[11px] text-mari-text-tertiary">{{ todayLabel }}</div>
              </div>
            </div>

            <div class="hidden min-w-0 flex-1 lg:block">
              <div class="text-xs font-medium uppercase tracking-wider text-mari-text-tertiary">
                {{ todayLabel }}
              </div>
              <div class="truncate text-lg font-semibold text-mari-text">
                Welcome back, {{ store.student().shortName }}
              </div>
            </div>

            <div class="flex items-center gap-1">
              <a
                routerLink="/pomodoro"
                routerLinkActive="bg-mari-primary-light text-mari-primary-dark"
                class="rounded-[10px] p-2.5 text-mari-text-secondary transition-colors hover:bg-mari-bg-secondary hover:text-mari-text"
                aria-label="Pomodoro timer"
              >
                <svg lucideTimer [size]="20"></svg>
              </a>
              <a
                routerLink="/tasks"
                class="relative hidden rounded-[10px] p-2.5 text-mari-text-secondary transition-colors hover:bg-mari-bg-secondary hover:text-mari-text sm:flex"
                aria-label="High-priority tasks"
              >
                <svg lucideBell [size]="20"></svg>
                @if (store.highPriorityTasks().length; as count) {
                  <span
                    class="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-accent-coral text-[9px] font-bold text-white"
                  >
                    {{ count }}
                  </span>
                }
              </a>
              <a
                routerLink="/settings"
                routerLinkActive="bg-mari-primary-light text-mari-primary-dark"
                class="rounded-[10px] p-2.5 text-mari-text-secondary transition-colors hover:bg-mari-bg-secondary hover:text-mari-text"
                aria-label="Settings"
              >
                <svg lucideSettings [size]="20"></svg>
              </a>
              <button
                type="button"
                (click)="logout()"
                class="rounded-[10px] p-2.5 text-mari-text-secondary transition-colors hover:bg-mari-bg-secondary hover:text-mari-text"
                aria-label="Log out"
              >
                <svg lucideLogOut [size]="20"></svg>
              </button>
            </div>
          </div>

          @if (store.countdown().label) {
            <div class="border-t border-mari-border/60 px-4 pb-3 pt-2 lg:px-8">
              <app-countdown-banner [event]="store.countdown()" />
            </div>
          }
        </header>

        <div class="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <main class="mari-scroll-area min-h-0 min-w-0 flex-1 px-4 py-4 lg:px-6 lg:py-5">
            <router-outlet />
          </main>

          <app-utility-sidebar
            class="mari-sidebar-scroll hidden h-full w-[min(100%,300px)] xl:block"
            [profile]="store.student()"
          />
        </div>

        <app-bottom-nav class="shrink-0 lg:hidden" />
      </div>
    </div>
  `,
})
export class AppShellComponent {
  protected readonly store = inject(MariStoreService);
  private readonly auth = inject(AuthService);

  protected readonly todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  protected logout(): void {
    void this.auth.signOut();
  }
}
