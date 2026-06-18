import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideSparkles } from '@lucide/angular';
import { MariIconBadgeComponent } from '../../shared/mari-icon-badge/mari-icon-badge.component';
import { MariLogoComponent } from '../../shared/mari-logo/mari-logo.component';

@Component({
  selector: 'app-auth-layout',
  imports: [
    RouterLink,
    MariLogoComponent,
    MariIconBadgeComponent,
    LucideSparkles,
  ],
  template: `
    <div class="mari-auth-layout">
      <aside class="mari-auth-aside" aria-hidden="true">
        <div class="mari-landing-blob mari-landing-blob-1 mari-auth-blob" ></div>
        <div class="mari-landing-blob mari-landing-blob-2 mari-auth-blob"></div>

        <div class="relative z-10 flex h-full flex-col justify-between p-8 xl:p-10">
          <a routerLink="/" class="group inline-flex items-center gap-3 self-start">
            <app-mari-logo size="lg" [animated]="true" />
            <div>
              <span class="block text-lg font-semibold text-mari-text">Mari</span>
              <span class="text-xs text-mari-text-tertiary">Student workspace</span>
            </div>
          </a>

          <div>
            <span class="mari-chip bg-mari-bg/80 text-mari-primary-dark ring-1 ring-mari-primary-muted/30">
              <svg lucideSparkles [size]="11"></svg>
              {{ asideTagline() }}
            </span>
            <h2 class="mt-4 text-2xl font-bold leading-tight text-mari-text xl:text-3xl">
              {{ asideHeadline() }}
            </h2>
            <p class="mt-3 max-w-sm text-sm leading-relaxed text-mari-text-secondary">
              {{ asideDescription() }}
            </p>

            <ul class="mt-8 space-y-3">
              @for (item of asideFeatures; track item.label) {
                <li
                  class="mari-auth-feature-row mari-landing-enter"
                  [class.mari-landing-enter-delay-1]="$index === 1"
                  [class.mari-landing-enter-delay-2]="$index === 2"
                >
                  <app-mari-icon-badge [icon]="item.icon" [variant]="item.variant" size="sm" />
                  <span class="text-sm font-medium text-mari-text">{{ item.label }}</span>
                </li>
              }
            </ul>
          </div>

          <p class="text-xs text-mari-text-tertiary">Trusted by students juggling 4+ courses</p>
        </div>
      </aside>

      <div class="mari-auth-main">
        <div class="mari-auth-panel mari-landing-enter">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {
  readonly mode = input<'login' | 'signup' | 'forgot'>('login');

  protected readonly asideFeatures = [
    { icon: 'sparkles' as const, variant: 'primary' as const, label: 'AI flashcards from your PDFs' },
    { icon: 'layers' as const, variant: 'amber' as const, label: 'Kanban tasks & schedule' },
    { icon: 'book' as const, variant: 'teal' as const, label: 'Course folders in one place' },
  ];

  protected asideTagline(): string {
    switch (this.mode()) {
      case 'signup':
        return 'Free to start';
      case 'forgot':
        return 'Account recovery';
      default:
        return 'Welcome back';
    }
  }

  protected asideHeadline(): string {
    switch (this.mode()) {
      case 'signup':
        return 'Your semester HQ starts here';
      case 'forgot':
        return 'We will get you back in';
      default:
        return 'Pick up right where you left off';
    }
  }

  protected asideDescription(): string {
    switch (this.mode()) {
      case 'signup':
        return 'Create a free account and set up your courses, tasks, and study sets in minutes.';
      case 'forgot':
        return 'Reset your password and jump back into your dashboard.';
      default:
        return 'Log in to sync your workspace across devices and keep every class on track.';
    }
  }
}
