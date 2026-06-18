import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-public-layout',
  host: { class: 'block h-dvh w-full overflow-hidden' },
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideArrowRight],
  template: `
    <div class="flex h-full min-h-0 flex-col mari-bg-mesh">
      <header class="z-30 shrink-0 border-b border-mari-border/80 bg-mari-bg/90 backdrop-blur-md">
        <div class="mari-public-container flex items-center justify-between gap-4 py-3.5">
          <a routerLink="/" class="group flex min-w-0 items-center gap-3">
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-mari-primary to-mari-primary-dark text-sm font-bold text-white shadow-md transition-transform group-hover:scale-105"
            >
              M
            </div>
            <div class="min-w-0">
              <span class="block text-base font-semibold text-mari-text">Mari</span>
              <span class="block truncate text-[11px] text-mari-text-tertiary">Student workspace</span>
            </div>
          </a>

          <nav class="flex items-center gap-1 sm:gap-2">
            <a
              routerLink="/pricing"
              routerLinkActive="bg-mari-primary-light text-mari-primary-dark"
              class="rounded-[10px] px-3 py-2 text-sm font-medium text-mari-text-secondary transition-colors hover:bg-mari-bg-secondary hover:text-mari-text"
            >
              Pricing
            </a>
            @if (auth.isAuthenticated()) {
              <a routerLink="/dashboard" class="mari-btn-primary !px-4 !py-2 !text-sm">
                Open workspace
                <svg lucideArrowRight [size]="15" class="hidden sm:inline"></svg>
              </a>
            } @else {
              <a
                routerLink="/login"
                class="rounded-[10px] px-3 py-2 text-sm font-medium text-mari-text-secondary transition-colors hover:bg-mari-bg-secondary hover:text-mari-text"
              >
                Log in
              </a>
              <a routerLink="/signup" class="mari-btn-primary !px-4 !py-2 !text-sm">
                Get started
                <svg lucideArrowRight [size]="15" class="hidden sm:inline"></svg>
              </a>
            }
          </nav>
        </div>
      </header>

      <main class="mari-scroll-area min-h-0 flex-1">
        <router-outlet />

        @if (!isAuthPage()) {
        <footer class="mt-auto border-t border-mari-border/80 bg-mari-bg/90">
          <div class="mari-public-container py-10">
            <div class="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
              <div class="max-w-xs">
                <div class="flex items-center gap-2.5">
                  <div
                    class="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-mari-primary to-mari-primary-dark text-xs font-bold text-white shadow-sm"
                  >
                    M
                  </div>
                  <div>
                    <span class="block text-sm font-semibold text-mari-text">Mari</span>
                    <span class="text-xs text-mari-text-tertiary">Built for busy semesters</span>
                  </div>
                </div>
                <p class="mt-3 text-xs leading-relaxed text-mari-text-secondary">
                  One calm workspace for courses, tasks, and study sets.
                </p>
              </div>

              <div class="grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm sm:grid-cols-3">
                @for (link of footerLinks; track link.path) {
                  <a
                    [routerLink]="link.path"
                    class="text-mari-text-secondary transition-colors hover:text-mari-primary"
                  >
                    {{ link.label }}
                  </a>
                }
              </div>
            </div>

            <div
              class="mt-8 flex flex-col items-center justify-between gap-2 border-t border-mari-border/60 pt-6 text-center sm:flex-row sm:text-left"
            >
              <p class="text-xs text-mari-text-tertiary">© {{ year }} Mari. Made for students.</p>
              <span class="mari-chip bg-mari-primary-light text-mari-primary-dark">
                Free to start — sign up in seconds
              </span>
            </div>
          </div>
        </footer>
        }
      </main>
    </div>
  `,
})
export class PublicLayoutComponent {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  protected readonly year = new Date().getFullYear();

  protected isAuthPage(): boolean {
    const path = this.router.url.split('?')[0];
    return (
      path === '/login' ||
      path === '/signup' ||
      path === '/forgot-password' ||
      path === '/reset-password'
    );
  }

  protected readonly footerLinks = [
    { path: '/signup', label: 'Sign up' },
    { path: '/login', label: 'Log in' },
    { path: '/pricing', label: 'Pricing' },
  ];
}
