import { Component, effect, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideCalendarDays, LucideListTodo, LucidePlus } from '@lucide/angular';
import { CourseAccent } from '../../core/models/mari.models';
import { MariStoreService } from '../../core/services/mari-store.service';
import { ScheduleTimelineComponent } from '../../shared/schedule-timeline/schedule-timeline.component';

@Component({
  selector: 'app-schedule-page',
  imports: [
    ScheduleTimelineComponent,
    RouterLink,
    FormsModule,
    LucideCalendarDays,
    LucideListTodo,
    LucidePlus,
  ],
  template: `
    <div class="mari-page max-w-6xl">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-mari-text sm:text-3xl">Class Schedule</h1>
          <p class="mt-1 text-sm text-mari-text-secondary">
            {{ store.scheduleEntries().length }} events saved · plan your day and month
          </p>
        </div>
        <a routerLink="/tasks" class="mari-btn-primary text-sm">
          <svg lucideListTodo [size]="16"></svg>
          View tasks
        </a>
      </div>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        <section class="mari-surface-elevated self-start p-5 lg:col-span-8">
          <div class="mari-section-head">
            <div class="mari-section-title">
              <span class="mari-section-icon bg-mari-primary-light text-mari-primary-dark">
                <svg lucideCalendarDays [size]="16"></svg>
              </span>
              Schedule & calendar
            </div>
          </div>
          <app-schedule-timeline
            [entries]="store.scheduleEntries()"
            [(selectedDate)]="selectedDate"
            [editable]="true"
          />
        </section>

        <div class="flex flex-col gap-5 lg:col-span-4">
          <section class="mari-surface p-5">
            <div class="mari-section-head">
              <div class="mari-section-title">
                <span class="mari-section-icon bg-accent-teal-bg text-accent-teal-text">
                  <svg lucidePlus [size]="16"></svg>
                </span>
                Add event
              </div>
            </div>

            <form (ngSubmit)="addEvent()" class="space-y-3">
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">
                  Date
                </label>
                <input type="date" [(ngModel)]="formDate" name="date" class="mari-input" required />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">
                  Time
                </label>
                <input type="time" [(ngModel)]="formTime" name="time" class="mari-input" required />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">
                  Title
                </label>
                <input
                  type="text"
                  [(ngModel)]="formTitle"
                  name="title"
                  placeholder="Class, meeting, study block…"
                  class="mari-input"
                  required
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">
                  Location
                </label>
                <input
                  type="text"
                  [(ngModel)]="formLocation"
                  name="location"
                  placeholder="Room, building, or online"
                  class="mari-input"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">
                  Color
                </label>
                <select [(ngModel)]="formAccent" name="accent" class="mari-input">
                  @for (accent of accents; track accent.value) {
                    <option [value]="accent.value">{{ accent.label }}</option>
                  }
                </select>
              </div>
              <button type="submit" [disabled]="!canSubmit()" class="mari-btn-primary w-full">
                <svg lucidePlus [size]="16"></svg>
                Add to schedule
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  `,
})
export class SchedulePage {
  protected readonly store = inject(MariStoreService);
  protected readonly selectedDate = model(this.store.todayIso());

  protected formDate = this.store.todayIso();
  protected formTime = '09:00';
  protected formTitle = '';
  protected formLocation = '';
  protected formAccent: CourseAccent = 'violet';

  protected readonly accents: { value: CourseAccent; label: string }[] = [
    { value: 'violet', label: 'Violet' },
    { value: 'teal', label: 'Teal' },
    { value: 'coral', label: 'Coral' },
    { value: 'amber', label: 'Amber' },
    { value: 'sage', label: 'Sage' },
  ];

  constructor() {
    effect(() => {
      this.formDate = this.selectedDate();
    });
  }

  canSubmit(): boolean {
    return Boolean(this.formDate && this.formTime && this.formTitle.trim());
  }

  addEvent(): void {
    if (!this.canSubmit()) return;

    const [hour, minute] = this.formTime.split(':');
    const time = `${String(Number(hour)).padStart(2, '0')}:${minute}`;

    this.store.addScheduleEntry({
      date: this.formDate,
      time,
      title: this.formTitle.trim(),
      location: this.formLocation.trim(),
      accent: this.formAccent,
    });

    this.formTitle = '';
    this.formLocation = '';
    this.selectedDate.set(this.formDate);
  }
}