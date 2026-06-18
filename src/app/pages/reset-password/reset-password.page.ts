import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideKeyRound } from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password-page',
  imports: [FormsModule, RouterLink, LucideKeyRound],
  template: `
    <div class="mari-public-container py-10 sm:py-14">
      <div class="mx-auto max-w-md">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-mari-text sm:text-3xl">Choose a new password</h1>
          <p class="mt-2 text-sm text-mari-text-secondary">
            Enter a new password for your Mari account.
          </p>
        </div>

        <form (ngSubmit)="submit()" class="mari-surface-elevated space-y-4 p-6 sm:p-7">
          @if (!auth.isAuthenticated()) {
            <p class="rounded-[10px] border border-accent-amber/30 bg-accent-amber-bg/50 px-3 py-2 text-xs text-accent-amber-text">
              This link may have expired. Request a new reset email from the log in page.
            </p>
          }

          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-mari-text-tertiary">New password</span>
            <input
              type="password"
              name="password"
              autocomplete="new-password"
              required
              minlength="6"
              [(ngModel)]="password"
              class="mari-input"
              placeholder="At least 6 characters"
            />
          </label>

          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-mari-text-tertiary">Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              autocomplete="new-password"
              required
              minlength="6"
              [(ngModel)]="confirmPassword"
              class="mari-input"
              placeholder="Repeat password"
            />
          </label>

          @if (errorMessage()) {
            <p class="text-sm font-medium text-accent-coral-text">{{ errorMessage() }}</p>
          }

          <button
            type="submit"
            class="mari-btn-primary w-full !py-2.5 !text-sm"
            [disabled]="submitting() || !auth.isAuthenticated()"
          >
            <svg lucideKeyRound [size]="16"></svg>
            {{ submitting() ? 'Updating…' : 'Update password' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-mari-text-secondary">
          <a routerLink="/login" class="font-semibold text-mari-primary hover:underline">Back to log in</a>
        </p>
      </div>
    </div>
  `,
})
export class ResetPasswordPage {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected password = '';
  protected confirmPassword = '';
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');

  async submit(): Promise<void> {
    this.errorMessage.set('');

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.submitting.set(true);
    const error = await this.auth.updatePassword(this.password);
    this.submitting.set(false);

    if (error) {
      this.errorMessage.set(error.message);
      return;
    }

    await this.router.navigateByUrl('/dashboard');
  }
}
