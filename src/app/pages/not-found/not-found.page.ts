import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideHome } from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-not-found-page',
  template: `
    <div class="mari-page mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <p class="text-6xl font-bold text-mari-primary/30">404</p>
      <h1 class="mt-4 text-xl font-bold text-mari-text sm:text-2xl">Page not found</h1>
      <p class="mt-2 text-sm text-mari-text-secondary">
        That link doesn't exist or may have moved.
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        @if (auth.isAuthenticated()) {
          <a routerLink="/dashboard" class="mari-btn-primary !text-sm">
            <svg lucideHome [size]="16"></svg>
            Back to dashboard
          </a>
        } @else {
          <a routerLink="/" class="mari-btn-secondary !text-sm">
            <svg lucideArrowLeft [size]="16"></svg>
            Go home
          </a>
          <a routerLink="/login" class="mari-btn-primary !text-sm">Log in</a>
        }
      </div>
    </div>
  `,
  imports: [RouterLink, LucideHome, LucideArrowLeft],
})
export class NotFoundPage {
  protected readonly auth = inject(AuthService);
}
