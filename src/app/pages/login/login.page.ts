import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideGraduationCap, LucideLogIn } from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';
import { sanitizeReturnUrl } from '../../core/utils/sanitize-return-url';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink, LucideLogIn, LucideGraduationCap],
  template: `
    <div class="mari-public-container py-10 sm:py-14">
      <div class="mx-auto max-w-md">
        <div class="mb-6 text-center lg:text-left">
          <span
            class="mari-chip bg-mari-primary-light text-mari-primary-dark ring-1 ring-mari-primary-muted/40"
          >
            <svg lucideGraduationCap [size]="12"></svg>
            Welcome back
          </span>
          <h1 class="mt-4 text-2xl font-bold text-mari-text sm:text-3xl">Log in to Mari</h1>
          <p class="mt-2 text-sm text-mari-text-secondary">
            Pick up where you left off — your workspace syncs across devices when you are logged in.
          </p>
        </div>

        <form (ngSubmit)="submit()" class="mari-surface-elevated space-y-4 p-6 sm:p-7">
          @if (!auth.configured()) {
            <p class="rounded-[10px] border border-accent-amber/30 bg-accent-amber-bg/50 px-3 py-2 text-xs text-accent-amber-text">
              Supabase is not configured. Add NG_APP_SUPABASE_URL and NG_APP_SUPABASE_ANON_KEY to
              your .env file.
            </p>
          }

          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-mari-text-tertiary">Email</span>
            <input
              type="email"
              name="email"
              autocomplete="email"
              required
              [(ngModel)]="email"
              class="mari-input"
              placeholder="you@school.edu"
            />
          </label>

          <label class="block">
            <div class="mb-1 flex items-center justify-between">
              <span class="text-xs font-semibold text-mari-text-tertiary">Password</span>
              <a
                routerLink="/forgot-password"
                class="text-xs font-medium text-mari-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              name="password"
              autocomplete="current-password"
              required
              minlength="6"
              [(ngModel)]="password"
              class="mari-input"
              placeholder="••••••••"
            />
          </label>

          @if (errorMessage()) {
            <p class="text-sm font-medium text-accent-coral-text">{{ errorMessage() }}</p>
          }

          <button
            type="submit"
            class="mari-btn-primary w-full !py-2.5 !text-sm"
            [disabled]="submitting()"
          >
            <svg lucideLogIn [size]="16"></svg>
            {{ submitting() ? 'Signing in…' : 'Log in' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-mari-text-secondary">
          New here?
          <a routerLink="/signup" class="font-semibold text-mari-primary hover:underline">
            Create a free account
          </a>
        </p>
      </div>
    </div>
  `,
})
export class LoginPage {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected email = '';
  protected password = '';
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');

  async submit(): Promise<void> {
    this.errorMessage.set('');
    this.submitting.set(true);

    try {
      const error = await this.auth.signIn(this.email.trim(), this.password);

      if (error) {
        this.errorMessage.set(error.message);
        return;
      }

      const returnUrl = sanitizeReturnUrl(
        this.route.snapshot.queryParamMap.get('returnUrl'),
      );
      await this.router.navigateByUrl(returnUrl);
    } catch {
      this.errorMessage.set('Something went wrong while signing in. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
