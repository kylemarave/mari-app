import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowRight, LucideGraduationCap, LucideSparkles } from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup-page',
  imports: [FormsModule, RouterLink, LucideSparkles, LucideArrowRight, LucideGraduationCap],
  template: `
    <div class="mari-public-container py-10 sm:py-14">
      <div class="mx-auto max-w-md">
        <div class="mb-6 text-center lg:text-left">
          <span
            class="mari-chip bg-mari-primary-light text-mari-primary-dark ring-1 ring-mari-primary-muted/40"
          >
            <svg lucideSparkles [size]="12"></svg>
            Free student workspace
          </span>
          <h1 class="mt-4 text-2xl font-bold text-mari-text sm:text-3xl">Create your Mari account</h1>
          <p class="mt-2 text-sm text-mari-text-secondary">
            Start with a clean workspace — add your courses, tasks, and study sets from scratch.
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
            <span class="mb-1 block text-xs font-semibold text-mari-text-tertiary">Full name</span>
            <input
              type="text"
              name="fullName"
              autocomplete="name"
              [(ngModel)]="fullName"
              class="mari-input"
              placeholder="Maria Reign"
            />
          </label>

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
            <span class="mb-1 block text-xs font-semibold text-mari-text-tertiary">Password</span>
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
            <svg lucideGraduationCap [size]="16"></svg>
            {{ submitting() ? 'Creating account…' : 'Get started free' }}
            <svg lucideArrowRight [size]="15"></svg>
          </button>

          <p class="text-center text-[11px] leading-relaxed text-mari-text-tertiary">
            Workspace data syncs to your account in the cloud. Course file blobs stay on each device for now.
          </p>
        </form>

        <p class="mt-6 text-center text-sm text-mari-text-secondary">
          Already have an account?
          <a routerLink="/login" class="font-semibold text-mari-primary hover:underline">Log in</a>
        </p>
      </div>
    </div>
  `,
})
export class SignupPage {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected fullName = '';
  protected email = '';
  protected password = '';
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  async submit(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.submitting.set(true);

    const error = await this.auth.signUp(
      this.email.trim(),
      this.password,
      this.fullName.trim(),
    );
    this.submitting.set(false);

    if (error) {
      this.errorMessage.set(error.message);
      return;
    }

    if (this.auth.isAuthenticated()) {
      await this.router.navigateByUrl('/dashboard');
      return;
    }

    this.successMessage.set(
      'Account created! Check your email to confirm, then log in.',
    );
  }
}
