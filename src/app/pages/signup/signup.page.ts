import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideGraduationCap,
  LucideLock,
  LucideMail,
  LucideSparkles,
  LucideUser,
} from '@lucide/angular';
import { AuthLayoutComponent } from '../../layout/auth-layout/auth-layout.component';
import { AuthService } from '../../core/services/auth.service';
import { MariIconBadgeComponent } from '../../shared/mari-icon-badge/mari-icon-badge.component';
import { MariLogoComponent } from '../../shared/mari-logo/mari-logo.component';

@Component({
  selector: 'app-signup-page',
  imports: [
    FormsModule,
    RouterLink,
    AuthLayoutComponent,
    MariLogoComponent,
    MariIconBadgeComponent,
    LucideSparkles,
    LucideArrowRight,
    LucideGraduationCap,
    LucideUser,
    LucideMail,
    LucideLock,
  ],
  template: `
    <app-auth-layout mode="signup">
      <div class="mari-auth-mobile-logo">
        <app-mari-logo size="md" [animated]="true" />
      </div>

      <div class="mb-6 text-center lg:text-left">
        <span
          class="mari-chip bg-mari-primary-light text-mari-primary-dark ring-1 ring-mari-primary-muted/40"
        >
          <svg lucideSparkles [size]="12"></svg>
          Free student workspace
        </span>
        <h1 class="mt-4 text-2xl font-bold text-mari-text sm:text-3xl">Create your Mari account</h1>
        <p class="mt-2 text-sm leading-relaxed text-mari-text-secondary">
          Start with a clean workspace — add courses, tasks, and study sets from scratch.
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
          <span class="mb-1.5 block text-xs font-semibold text-mari-text-tertiary">Full name</span>
          <div class="mari-auth-field">
            <svg lucideUser [size]="15" class="mari-auth-field-icon"></svg>
            <input
              type="text"
              name="fullName"
              autocomplete="name"
              [(ngModel)]="fullName"
              class="mari-auth-input"
              placeholder="Maria Reign"
            />
          </div>
        </label>

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
          <span class="mb-1.5 block text-xs font-semibold text-mari-text-tertiary">Password</span>
          <div class="mari-auth-field">
            <svg lucideLock [size]="15" class="mari-auth-field-icon"></svg>
            <input
              type="password"
              name="password"
              autocomplete="new-password"
              required
              minlength="6"
              [(ngModel)]="password"
              class="mari-auth-input"
              placeholder="At least 6 characters"
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
          class="mari-btn-primary group w-full !py-3 !text-sm shadow-md transition-transform hover:scale-[1.01]"
          [disabled]="submitting()"
        >
          <svg lucideGraduationCap [size]="16"></svg>
          {{ submitting() ? 'Creating account…' : 'Get started free' }}
          <svg lucideArrowRight [size]="15" class="transition-transform group-hover:translate-x-0.5"></svg>
        </button>

        <div class="flex flex-wrap items-center justify-center gap-2 pt-1">
          @for (perk of signupPerks; track perk.label) {
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-mari-bg-secondary px-2.5 py-1 text-[10px] font-medium text-mari-text-secondary"
            >
              <app-mari-icon-badge [icon]="perk.icon" [variant]="perk.variant" size="xs" />
              {{ perk.label }}
            </span>
          }
        </div>
      </form>

      <p class="mt-6 text-center text-sm text-mari-text-secondary">
        Already have an account?
        <a
          routerLink="/login"
          class="font-semibold text-mari-primary transition-colors hover:text-mari-primary-dark hover:underline"
        >
          Log in
        </a>
      </p>
    </app-auth-layout>
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

  protected readonly signupPerks = [
    { icon: 'gift' as const, variant: 'primary' as const, label: 'Free forever tier' },
    { icon: 'zap' as const, variant: 'amber' as const, label: '30 sec setup' },
    { icon: 'shield' as const, variant: 'teal' as const, label: 'Secure sync' },
  ];

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

    this.successMessage.set('Account created! Check your email to confirm, then log in.');
  }
}
