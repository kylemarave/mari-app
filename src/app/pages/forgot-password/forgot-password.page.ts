import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideMail } from '@lucide/angular';
import { AuthLayoutComponent } from '../../layout/auth-layout/auth-layout.component';
import { AuthService } from '../../core/services/auth.service';
import { MariLogoComponent } from '../../shared/mari-logo/mari-logo.component';

@Component({
  selector: 'app-forgot-password-page',
  imports: [
    FormsModule,
    RouterLink,
    AuthLayoutComponent,
    MariLogoComponent,
    LucideMail,
    LucideArrowLeft,
  ],
  template: `
    <app-auth-layout mode="forgot">
      <div class="mari-auth-mobile-logo">
        <app-mari-logo size="md" />
      </div>

      <a
        routerLink="/login"
        class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-mari-text-secondary transition-colors hover:text-mari-primary"
      >
        <svg lucideArrowLeft [size]="16"></svg>
        Back to log in
      </a>

      <div class="mb-6">
        <h1 class="text-2xl font-bold text-mari-text sm:text-3xl">Reset your password</h1>
        <p class="mt-2 text-sm leading-relaxed text-mari-text-secondary">
          Enter your email and we will send a link to choose a new password.
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

        @if (errorMessage()) {
          <p
            class="rounded-[10px] border border-accent-coral/25 bg-accent-coral-bg/40 px-3 py-2 text-sm font-medium text-accent-coral-text"
          >
            {{ errorMessage() }}
          </p>
        }

        @if (successMessage()) {
          <p
            class="rounded-[10px] border border-accent-teal/25 bg-accent-teal-bg/50 px-3 py-2 text-sm font-medium text-accent-teal-text"
          >
            {{ successMessage() }}
          </p>
        }

        <button
          type="submit"
          class="mari-btn-primary w-full !py-3 !text-sm shadow-md transition-transform hover:scale-[1.01]"
          [disabled]="submitting()"
        >
          <svg lucideMail [size]="16"></svg>
          {{ submitting() ? 'Sending…' : 'Send reset link' }}
        </button>
      </form>
    </app-auth-layout>
  `,
})
export class ForgotPasswordPage {
  protected readonly auth = inject(AuthService);

  protected email = '';
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  async submit(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.submitting.set(true);

    const error = await this.auth.resetPassword(this.email.trim());
    this.submitting.set(false);

    if (error) {
      this.errorMessage.set(error.message);
      return;
    }

    this.successMessage.set('Check your email for a password reset link.');
  }
}
