import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideMail } from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  imports: [FormsModule, RouterLink, LucideMail, LucideArrowLeft],
  template: `
    <div class="mari-public-container py-10 sm:py-14">
      <div class="mx-auto max-w-md">
        <a
          routerLink="/login"
          class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-mari-text-secondary hover:text-mari-primary"
        >
          <svg lucideArrowLeft [size]="16"></svg>
          Back to log in
        </a>

        <div class="mb-6">
          <h1 class="text-2xl font-bold text-mari-text sm:text-3xl">Reset your password</h1>
          <p class="mt-2 text-sm text-mari-text-secondary">
            Enter your email and we'll send a link to choose a new password.
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

          @if (errorMessage()) {
            <p class="text-sm font-medium text-accent-coral-text">{{ errorMessage() }}</p>
          }

          @if (successMessage()) {
            <p class="text-sm font-medium text-accent-teal-text">{{ successMessage() }}</p>
          }

          <button
            type="submit"
            class="mari-btn-primary w-full !py-2.5 !text-sm"
            [disabled]="submitting()"
          >
            <svg lucideMail [size]="16"></svg>
            {{ submitting() ? 'Sending…' : 'Send reset link' }}
          </button>
        </form>
      </div>
    </div>
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
