import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideGraduationCap, LucideLock, LucideLogIn, LucideMail } from '@lucide/angular';
import { AuthLayoutComponent } from '../../layout/auth-layout/auth-layout.component';
import { AuthService } from '../../core/services/auth.service';
import { MariLogoComponent } from '../../shared/mari-logo/mari-logo.component';
import { sanitizeReturnUrl } from '../../core/utils/sanitize-return-url';

@Component({
  selector: 'app-login-page',
  imports: [
    FormsModule,
    RouterLink,
    AuthLayoutComponent,
    MariLogoComponent,
    LucideLogIn,
    LucideGraduationCap,
    LucideMail,
    LucideLock,
  ],
  template: `
    <app-auth-layout mode="login">
      <div class="mari-auth-mobile-logo">
        <app-mari-logo size="md" [animated]="true" />
      </div>

      <div class="mb-6 text-center lg:text-left">
        <span
          class="mari-chip bg-mari-primary-light text-mari-primary-dark ring-1 ring-mari-primary-muted/40"
        >
          <svg lucideGraduationCap [size]="12"></svg>
          Welcome back
        </span>
        <h1 class="mt-4 text-2xl font-bold text-mari-text sm:text-3xl">Log in to Mari</h1>
        <p class="mt-2 text-sm leading-relaxed text-mari-text-secondary">
          Pick up where you left off — your workspace syncs across devices.
        </p>
      </div>

      <form (ngSubmit)="submit()" class="mari-auth-form space-y-4">
        @if (!auth.configured()) {
          <p
            class="rounded-[10px] border border-accent-amber/30 bg-accent-amber-bg/50 px-3 py-2 text-xs text-accent-amber-text"
          >
            Supabase is not configured. Add NG_APP_SUPABASE_URL and NG_APP_SUPABASE_ANON_KEY to
            your .env file.
          </p>
        }

        <label class="block">
          <span class="mb-1.5 block text-xs font-semibold text-mari-text-tertiary">Email</span>
          <div class="mari-auth-field">
            <svg lucideMail [size]="15" class="mari-auth-field-icon"></svg>
            <input
              type="email"
              name="email"
              autocomplete="email"
              required
              [(ngModel)]="email"
              class="mari-auth-input"
              placeholder="you@school.edu"
            />
          </div>
        </label>

        <label class="block">
          <div class="mb-1.5 flex items-center justify-between">
            <span class="text-xs font-semibold text-mari-text-tertiary">Password</span>
            <a
              routerLink="/forgot-password"
              class="text-xs font-medium text-mari-primary transition-colors hover:text-mari-primary-dark hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <div class="mari-auth-field">
            <svg lucideLock [size]="15" class="mari-auth-field-icon"></svg>
            <input
              type="password"
              name="password"
              autocomplete="current-password"
              required
              minlength="6"
              [(ngModel)]="password"
              class="mari-auth-input"
              placeholder="••••••••"
            />
          </div>
        </label>

        @if (errorMessage()) {
          <p
            class="rounded-[10px] border border-accent-coral/25 bg-accent-coral-bg/40 px-3 py-2 text-sm font-medium text-accent-coral-text"
          >
            {{ errorMessage() }}
          </p>
        }

        <button
          type="submit"
          class="mari-btn-primary group w-full !py-3 !text-sm shadow-md transition-transform hover:scale-[1.01]"
          [disabled]="submitting()"
        >
          <svg lucideLogIn [size]="16"></svg>
          {{ submitting() ? 'Signing in…' : 'Log in' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-mari-text-secondary">
        New here?
        <a
          routerLink="/signup"
          class="font-semibold text-mari-primary transition-colors hover:text-mari-primary-dark hover:underline"
        >
          Create a free account
        </a>
      </p>
    </app-auth-layout>
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

      const returnUrl = sanitizeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));
      await this.router.navigateByUrl(returnUrl);
    } catch {
      this.errorMessage.set('Something went wrong while signing in. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
