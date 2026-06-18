import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideCreditCard, LucideLogOut, LucideRotateCcw, LucideSave, LucideSparkles, LucideUserCog, LucideZap } from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';
import { STRIPE_BILLING_ENABLED } from '../../core/config/features';
import { BillingService } from '../../core/services/billing.service';
import { ProfileService } from '../../core/services/profile.service';
import { MariStoreService } from '../../core/services/mari-store.service';
import { WorkspaceSyncService } from '../../core/services/workspace-sync.service';
import { VirtualIdCardComponent } from '../../shared/virtual-id-card/virtual-id-card.component';

@Component({
  selector: 'app-settings-page',
  imports: [FormsModule, VirtualIdCardComponent, RouterLink, LucideRotateCcw, LucideSave, LucideUserCog, LucideLogOut, LucideZap, LucideCreditCard, LucideSparkles],
  template: `
    <div class="mari-page mx-auto max-w-xl">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-mari-text sm:text-3xl">Settings</h1>
        <p class="mt-1 text-sm text-mari-text-secondary">Profile & app data</p>
      </div>

      @if (billingNotice()) {
        <p class="mb-5 rounded-[12px] border border-accent-teal/30 bg-accent-teal-bg/50 px-4 py-3 text-sm text-accent-teal-text">
          {{ billingNotice() }}
        </p>
      }

      <section class="mari-surface-elevated mb-5 p-5">
        <div class="mari-section-head">
          <div class="mari-section-title">
            <span class="mari-section-icon bg-mari-primary-light text-mari-primary-dark">
              <svg lucideSparkles [size]="16"></svg>
            </span>
            Plan
          </div>
          <span
            class="mari-chip"
            [class]="profile.isPro()
              ? 'bg-mari-primary-light text-mari-primary-dark'
              : 'bg-mari-bg-secondary text-mari-text-secondary'"
          >
            {{ profile.isPro() ? 'Pro' : 'Free' }}
          </span>
        </div>

        @if (!profile.isPro() && profile.aiImportsRemaining() !== null) {
          <p class="mt-2 text-sm text-mari-text-secondary">
            AI PDF imports this month: {{ profile.aiImportsUsed() }} / {{ profile.aiImportsLimit() }}
          </p>
        } @else if (profile.isPro()) {
          <p class="mt-2 text-sm text-mari-text-secondary">Unlimited AI PDF imports on Pro.</p>
        }

        <div class="mt-4 flex flex-col gap-2 sm:flex-row">
          @if (billingEnabled && profile.isPro()) {
            <button type="button" (click)="manageBilling()" class="mari-btn-secondary flex-1" [disabled]="billing.loading()">
              <svg lucideCreditCard [size]="16"></svg>
              Manage billing
            </button>
          } @else if (billingEnabled && !profile.isPro()) {
            <button type="button" (click)="upgrade()" class="mari-btn-primary flex-1" [disabled]="billing.loading()">
              <svg lucideZap [size]="16"></svg>
              Upgrade to Pro
            </button>
          } @else if (!profile.isPro()) {
            <p class="text-sm text-mari-text-secondary">
              Pro upgrades with unlimited AI imports are coming soon.
            </p>
          }
        </div>

        @if (billing.errorMessage()) {
          <p class="mt-2 text-sm text-accent-coral-text">{{ billing.errorMessage() }}</p>
        }
      </section>

      <section class="mari-surface-elevated mb-5 p-5">
        <div class="mari-section-head">
          <div class="mari-section-title">
            <span class="mari-section-icon bg-accent-blue-bg text-accent-blue-text">
              <svg lucideUserCog [size]="16"></svg>
            </span>
            Live preview
          </div>
        </div>
        <app-virtual-id-card [profile]="form" variant="mobile-header" />
      </section>

      <section class="mari-surface-elevated mb-5 space-y-4 p-5">
        <h2 class="text-sm font-bold uppercase tracking-wide text-mari-text-tertiary">Exam countdown</h2>
        <label class="block">
          <span class="mb-1 block text-xs font-semibold text-mari-text-tertiary">Label</span>
          <input type="text" [(ngModel)]="countdownForm.label" name="cdLabel" class="mari-input" />
        </label>
        <div class="grid grid-cols-2 gap-3">
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-mari-text-tertiary">Days left</span>
            <input type="number" min="0" [(ngModel)]="countdownForm.daysLeft" name="cdDays" class="mari-input" />
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-mari-text-tertiary">Prepared %</span>
            <input type="number" min="0" max="100" [(ngModel)]="countdownForm.progress" name="cdProgress" class="mari-input" />
          </label>
        </div>
        <button type="button" (click)="saveCountdown()" class="mari-btn-secondary w-full">Update countdown</button>
      </section>

      <form (ngSubmit)="save()" class="mari-surface space-y-4 p-5">
        <h2 class="text-sm font-bold uppercase tracking-wide text-mari-text-tertiary">Profile details</h2>

        <label class="block">
          <span class="mb-1 block text-xs font-semibold text-mari-text-tertiary">Full name</span>
          <input type="text" [(ngModel)]="form.name" name="name" class="mari-input" />
        </label>

        <div class="grid grid-cols-2 gap-3">
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-mari-text-tertiary">Short name</span>
            <input type="text" [(ngModel)]="form.shortName" name="shortName" class="mari-input" />
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-mari-text-tertiary">Initials</span>
            <input type="text" maxlength="3" [(ngModel)]="form.initials" name="initials" class="mari-input uppercase" />
          </label>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-mari-text-tertiary">University</span>
            <input type="text" [(ngModel)]="form.university" name="university" class="mari-input" />
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-mari-text-tertiary">Program</span>
            <input type="text" [(ngModel)]="form.program" name="program" class="mari-input" />
          </label>
        </div>

        <button type="submit" class="mari-btn-primary w-full">
          <svg lucideSave [size]="16"></svg>
          Save changes
        </button>
        @if (saved()) {
          <p class="text-center text-sm font-medium text-accent-teal-text">Profile saved successfully.</p>
        }
      </form>

      <section class="mari-surface-elevated mb-5 p-5">
        <h2 class="text-sm font-bold uppercase tracking-wide text-mari-text-tertiary">Cloud sync</h2>
        <p class="mt-2 text-sm text-mari-text-secondary">
          Tasks, courses, study sets, and profile sync across devices when you are logged in.
        </p>
        <p class="mt-2 text-xs text-mari-text-tertiary">
          @switch (workspaceSync.status()) {
            @case ('syncing') {
              Syncing workspace…
            }
            @case ('synced') {
              Synced
              @if (workspaceSync.lastSyncedAt(); as at) {
                · {{ formatSyncTime(at) }}
              }
            }
            @case ('offline') {
              Offline — changes saved on this device only
            }
            @case ('error') {
              Sync issue — {{ workspaceSync.errorMessage() ?? 'try again later' }}
            }
            @default {
              Local cache ready
            }
          }
        </p>
        <p class="mt-1 text-[11px] text-mari-text-tertiary">
          Course file uploads stay on this device (IndexedDB) until storage sync is added.
        </p>
      </section>

      <section class="mari-surface-elevated mb-5 p-5">
        <h2 class="text-sm font-bold uppercase tracking-wide text-mari-text-tertiary">Account</h2>
        @if (auth.user(); as user) {
          <p class="mt-2 text-sm text-mari-text-secondary">{{ user.email }}</p>
        }
        <button type="button" (click)="logout()" class="mari-btn-secondary mt-4 w-full">
          <svg lucideLogOut [size]="16"></svg>
          Log out
        </button>
      </section>

      <section class="mt-5 rounded-[16px] border border-accent-coral/40 bg-accent-coral-bg/40 p-5">
        <h2 class="font-semibold text-accent-coral-text">Reset workspace</h2>
        <p class="mt-1 text-sm text-mari-text-secondary">Clear tasks, courses, study sets, and profile fields.</p>
        <button
          type="button"
          (click)="reset()"
          class="mt-3 inline-flex items-center gap-2 rounded-[12px] border border-accent-coral bg-mari-bg px-4 py-2 text-sm font-semibold text-accent-coral-text hover:bg-accent-coral-bg"
        >
          <svg lucideRotateCcw [size]="16"></svg>
          Reset everything
        </button>
      </section>

      <a routerLink="/dashboard" class="mt-6 inline-block text-sm font-medium text-mari-primary hover:underline">← Back to dashboard</a>
    </div>
  `,
})
export class SettingsPage implements OnInit {
  private readonly store = inject(MariStoreService);
  protected readonly auth = inject(AuthService);
  protected readonly profile = inject(ProfileService);
  protected readonly billing = inject(BillingService);
  protected readonly billingEnabled = STRIPE_BILLING_ENABLED;
  protected readonly workspaceSync = inject(WorkspaceSyncService);
  private readonly route = inject(ActivatedRoute);
  protected form = { ...this.store.student() };
  protected countdownForm = { ...this.store.countdown() };
  protected readonly saved = signal(false);
  protected readonly billingNotice = signal('');

  ngOnInit(): void {
    const billing = this.route.snapshot.queryParamMap.get('billing');
    if (billing === 'success') {
      this.billingNotice.set('Welcome to Pro! Your plan may take a moment to update.');
      void this.profile.refresh();
    }
  }

  upgrade(): void {
    void this.billing.startCheckout();
  }

  manageBilling(): void {
    void this.billing.openPortal();
  }

  saveCountdown(): void {
    this.store.updateCountdown(this.countdownForm);
  }

  save(): void {
    this.store.updateStudent(this.form);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }

  reset(): void {
    if (confirm('Reset your workspace to empty? This cannot be undone.')) {
      this.store.resetProgress();
      this.form = { ...this.store.student() };
      this.countdownForm = { ...this.store.countdown() };
    }
  }

  logout(): void {
    void this.auth.signOut();
  }

  formatSyncTime(iso: string): string {
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  }
}
