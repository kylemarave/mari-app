import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideCheck,
  LucideGraduationCap,
  LucideLoaderCircle,
  LucideSparkles,
  LucideX,
  LucideZap,
} from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';
import { STRIPE_BILLING_ENABLED } from '../../core/config/features';
import { BillingService } from '../../core/services/billing.service';
import { ProfileService } from '../../core/services/profile.service';
import { FREE_AI_IMPORTS_PER_MONTH } from '../../core/models/profile.models';

type PlanFeature = { label: string; included: boolean };

@Component({
  selector: 'app-pricing-page',
  imports: [
    RouterLink,
    LucideCheck,
    LucideX,
    LucideSparkles,
    LucideGraduationCap,
    LucideZap,
    LucideArrowRight,
    LucideLoaderCircle,
  ],
  template: `
    <div class="mari-public-container pb-16 pt-8 sm:pt-12">
      <section class="mari-hero p-5 text-center sm:p-8">
        <div class="mb-2 flex items-center justify-center gap-1.5">
          <svg lucideSparkles [size]="14" class="text-mari-primary"></svg>
          <span class="text-[10px] font-semibold uppercase tracking-wider text-mari-primary-dark">
            Student-friendly pricing
          </span>
        </div>
        <h1 class="text-2xl font-bold text-mari-text sm:text-3xl lg:text-4xl">
          Start free. Upgrade when midterms hit hard.
        </h1>
        <p class="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-mari-text-secondary sm:text-base">
          The full workspace is free — Pro unlocks unlimited AI PDF imports when you are drowning in
          lecture slides.
        </p>
        <div class="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span class="mari-chip bg-mari-bg/90 text-mari-text-secondary">🎓 Student budget friendly</span>
          <span class="mari-chip bg-accent-teal-bg text-accent-teal-text">No credit card for Free</span>
        </div>
      </section>

      <section class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        @for (highlight of planHighlights; track highlight.label) {
          <div class="mari-stat text-center !p-4">
            <div class="mari-stat-label">{{ highlight.label }}</div>
            <div class="mari-stat-value mt-1 text-lg">{{ highlight.free }}</div>
            <div class="mt-1 text-xs font-medium text-mari-primary">Pro: {{ highlight.pro }}</div>
          </div>
        }
      </section>

      <div class="mt-10 grid gap-5 lg:grid-cols-2 lg:gap-6">
        <article class="mari-surface-elevated flex flex-col p-6 sm:p-7">
          <div class="mari-section-head-sm !mb-4">
            <div class="mari-section-title">
              <span class="mari-section-icon bg-mari-bg-secondary text-mari-text-secondary">
                <svg lucideGraduationCap [size]="14"></svg>
              </span>
              Free
            </div>
            <span class="mari-chip bg-accent-sage-bg text-accent-sage-text">Most students</span>
          </div>
          <p class="text-sm text-mari-text-secondary">Everything you need for a normal semester</p>
          <p class="mt-3">
            <span class="text-4xl font-bold tracking-tight text-mari-text">$0</span>
            <span class="text-sm text-mari-text-tertiary"> / forever</span>
          </p>

          <ul class="mt-6 flex flex-1 flex-col gap-2.5">
            @for (feature of freeFeatures; track feature.label) {
              <li class="flex items-start gap-2.5 text-sm">
                @if (feature.included) {
                  <svg lucideCheck [size]="17" class="mt-0.5 shrink-0 text-accent-teal"></svg>
                } @else {
                  <svg lucideX [size]="17" class="mt-0.5 shrink-0 text-mari-text-tertiary/70"></svg>
                }
                <span
                  [class]="
                    feature.included ? 'text-mari-text-secondary' : 'text-mari-text-tertiary line-through decoration-mari-border'
                  "
                >
                  {{ feature.label }}
                </span>
              </li>
            }
          </ul>

          <a routerLink="/signup" class="mari-btn-secondary mt-7 w-full !py-2.5 !text-sm">
            Get started free
          </a>
        </article>

        <article
          class="relative flex flex-col overflow-hidden rounded-[12px] border-2 border-mari-primary bg-mari-bg p-6 shadow-[var(--shadow-mari-lg)] sm:p-7"
        >
          <span
            class="absolute right-4 top-4 rounded-full bg-mari-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          >
            Exam season
          </span>

          <div class="relative mari-section-head-sm !mb-4">
            <div class="mari-section-title">
              <span class="mari-section-icon bg-mari-primary-light text-mari-primary-dark">
                <svg lucideZap [size]="14"></svg>
              </span>
              Pro
            </div>
            <span class="mari-chip bg-mari-primary-light text-mari-primary-dark">Power learners</span>
          </div>
          <p class="relative text-sm text-mari-text-secondary">
            Unlimited AI when every prof uploads a 40-page PDF
          </p>
          <p class="relative mt-3">
            <span class="text-4xl font-bold tracking-tight text-mari-text">$8</span>
            <span class="text-sm text-mari-text-tertiary"> / month</span>
          </p>

          <ul class="relative mt-6 flex flex-1 flex-col gap-2.5">
            @for (feature of proFeatures; track feature.label) {
              <li class="flex items-start gap-2.5 text-sm">
                <svg lucideCheck [size]="17" class="mt-0.5 shrink-0 text-accent-teal"></svg>
                <span class="text-mari-text-secondary">{{ feature.label }}</span>
              </li>
            }
          </ul>

          @if (profile.isPro()) {
            <a routerLink="/settings" class="mari-btn-primary relative mt-7 w-full !py-2.5 !text-sm">
              Manage plan in Settings
            </a>
          } @else if (billingEnabled && auth.isAuthenticated()) {
            <button
              type="button"
              (click)="upgrade()"
              class="mari-btn-primary relative mt-7 w-full !py-2.5 !text-sm"
              [disabled]="billing.loading()"
            >
              @if (billing.loading()) {
                <svg lucideLoaderCircle [size]="16" class="animate-spin"></svg>
                Opening checkout…
              } @else {
                Upgrade to Pro
                <svg lucideArrowRight [size]="15"></svg>
              }
            </button>
          } @else if (auth.isAuthenticated()) {
            <p class="relative mt-7 rounded-[12px] border border-mari-border bg-mari-bg-secondary/60 px-4 py-3 text-center text-sm text-mari-text-secondary">
              Pro checkout is coming soon. You still get {{ freeAiImports }} AI PDF imports per month on Free.
            </p>
          } @else {
            <a routerLink="/signup" class="mari-btn-primary relative mt-7 w-full !py-2.5 !text-sm">
              Start free, upgrade later
              <svg lucideArrowRight [size]="15"></svg>
            </a>
          }

          @if (billing.errorMessage()) {
            <p class="relative mt-2 text-center text-xs text-accent-coral-text">{{ billing.errorMessage() }}</p>
          }
        </article>
      </div>

      <section class="mt-10 lg:mt-12">
        <div class="mari-section-head mb-4">
          <div class="mari-section-title text-sm">
            <span class="mari-section-icon bg-mari-primary-light text-mari-primary-dark">
              <svg lucideSparkles [size]="14"></svg>
            </span>
            Side-by-side
          </div>
        </div>

        <div class="mari-surface-elevated overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr class="border-b border-mari-border bg-mari-bg-secondary/70">
                  <th class="px-5 py-3.5 font-semibold text-mari-text-secondary">Feature</th>
                  <th class="px-5 py-3.5 text-center font-semibold text-mari-text-secondary">Free</th>
                  <th class="px-5 py-3.5 text-center font-semibold text-mari-primary-dark">Pro</th>
                </tr>
              </thead>
              <tbody>
                @for (row of comparisonRows; track row.feature) {
                  <tr class="border-b border-mari-border/80 last:border-0 hover:bg-mari-bg-secondary/40">
                    <td class="px-5 py-3.5 font-medium text-mari-text">{{ row.feature }}</td>
                    <td class="px-5 py-3.5 text-center text-mari-text-secondary">{{ row.free }}</td>
                    <td class="px-5 py-3.5 text-center font-semibold text-mari-primary-dark">{{ row.pro }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="mt-10">
        <div class="mari-gradient-card p-6 text-center sm:p-8">
          <h2 class="text-lg font-bold text-mari-text sm:text-xl">Not sure yet? Just open the app.</h2>
          <p class="mx-auto mt-2 max-w-md text-sm text-mari-text-secondary">
            Your dashboard works the same on Free — explore courses, tasks, and study sets before you upgrade.
          </p>
          <a routerLink="/signup" class="mari-btn-primary mt-5 inline-flex !text-sm">
            Open my workspace
            <svg lucideArrowRight [size]="15"></svg>
          </a>
        </div>
      </section>
    </div>
  `,
})
export class PricingPage {
  protected readonly auth = inject(AuthService);
  protected readonly billing = inject(BillingService);
  protected readonly profile = inject(ProfileService);
  protected readonly billingEnabled = STRIPE_BILLING_ENABLED;
  protected readonly freeAiImports = FREE_AI_IMPORTS_PER_MONTH;
  private readonly router = inject(Router);

  protected readonly planHighlights = [
    { label: 'AI PDF imports', free: '3 / mo', pro: 'Unlimited' },
    { label: 'Flashcards', free: 'Unlimited', pro: 'Unlimited' },
    { label: 'Workspace tools', free: 'All included', pro: 'All included' },
  ];

  protected readonly freeFeatures: PlanFeature[] = [
    { label: 'Dashboard, tasks & schedule', included: true },
    { label: 'Course folders & file storage', included: true },
    { label: 'Pomodoro focus timer', included: true },
    { label: 'Up to 3 AI PDF imports per month', included: true },
    { label: 'Unlimited AI PDF imports', included: false },
    { label: 'Priority AI processing', included: false },
  ];

  protected readonly proFeatures: PlanFeature[] = [
    { label: 'Everything in Free', included: true },
    { label: 'Unlimited AI PDF imports', included: true },
    { label: 'Priority AI processing', included: true },
    { label: 'Advanced study set analytics', included: true },
    { label: 'Early access to new features', included: true },
  ];

  protected readonly comparisonRows = [
    { feature: 'AI PDF imports', free: '3 / month', pro: 'Unlimited' },
    { feature: 'Study sets & flashcards', free: 'Unlimited', pro: 'Unlimited' },
    { feature: 'Tasks & kanban', free: 'Included', pro: 'Included' },
    { feature: 'Schedule timeline', free: 'Included', pro: 'Included' },
    { feature: 'Course folders', free: 'Included', pro: 'Included' },
    { feature: 'Pomodoro timer', free: 'Included', pro: 'Included' },
    { feature: 'Cloud workspace sync', free: 'Coming later', pro: 'Coming later' },
  ];

  upgrade(): void {
    if (!this.auth.isAuthenticated()) {
      void this.router.navigateByUrl('/signup');
      return;
    }
    void this.billing.startCheckout();
  }
}
