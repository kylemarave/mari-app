import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideRotateCcw, LucideSave, LucideUserCog } from '@lucide/angular';
import { MariStoreService } from '../../core/services/mari-store.service';
import { VirtualIdCardComponent } from '../../shared/virtual-id-card/virtual-id-card.component';

@Component({
  selector: 'app-settings-page',
  imports: [FormsModule, VirtualIdCardComponent, RouterLink, LucideRotateCcw, LucideSave, LucideUserCog],
  template: `
    <div class="mari-page mx-auto max-w-xl">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-mari-text sm:text-3xl">Settings</h1>
        <p class="mt-1 text-sm text-mari-text-secondary">Profile & app data</p>
      </div>

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

      <section class="mt-5 rounded-[16px] border border-accent-coral/40 bg-accent-coral-bg/40 p-5">
        <h2 class="font-semibold text-accent-coral-text">Reset app data</h2>
        <p class="mt-1 text-sm text-mari-text-secondary">Restore defaults for tasks, study progress, and profile.</p>
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
export class SettingsPage {
  private readonly store = inject(MariStoreService);
  protected form = { ...this.store.student() };
  protected countdownForm = { ...this.store.countdown() };
  protected readonly saved = signal(false);

  saveCountdown(): void {
    this.store.updateCountdown(this.countdownForm);
  }

  save(): void {
    this.store.updateStudent(this.form);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }

  reset(): void {
    if (confirm('Reset all app data to defaults?')) {
      this.store.resetProgress();
      this.form = { ...this.store.student() };
      this.countdownForm = { ...this.store.countdown() };
    }
  }
}
