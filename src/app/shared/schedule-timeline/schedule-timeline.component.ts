import { Component, computed, inject, input, model, signal } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight, LucideTrash2 } from '@lucide/angular';
import {
  ACCENT_STYLES,
  CourseAccent,
  ScheduleEntry,
  ScheduleView,
} from '../../core/models/mari.models';
import { MariStoreService } from '../../core/services/mari-store.service';

interface CalendarCell {
  date: string;
  day: number;
  inMonth: boolean;
  dots: CourseAccent[];
}

@Component({
  selector: 'app-schedule-timeline',
  imports: [LucideChevronLeft, LucideChevronRight, LucideTrash2],
  template: `
    <div>
      <div class="mb-2 flex rounded-[8px] border border-mari-border bg-mari-bg-secondary/80 p-0.5">
        <button
          type="button"
          (click)="view.set('schedule')"
          class="flex-1 rounded-[6px] py-1 text-[11px] font-semibold transition-all"
          [class]="view() === 'schedule'
            ? 'bg-mari-bg text-mari-text shadow-sm'
            : 'text-mari-text-secondary hover:text-mari-text'"
        >
          Day timeline
        </button>
        <button
          type="button"
          (click)="view.set('calendar')"
          class="flex-1 rounded-[6px] py-1 text-[11px] font-semibold transition-all"
          [class]="view() === 'calendar'
            ? 'bg-mari-bg text-mari-text shadow-sm'
            : 'text-mari-text-secondary hover:text-mari-text'"
        >
          Month calendar
        </button>
      </div>

      @if (view() === 'schedule') {
        <div class="mb-2 flex items-center justify-between gap-1.5 rounded-[8px] border border-mari-border bg-mari-bg-secondary/50 px-2 py-1">
          <button type="button" (click)="shiftSelectedDay(-1)" class="rounded-[4px] p-0.5 hover:bg-mari-bg">
            <svg lucideChevronLeft [size]="14"></svg>
          </button>
          <div class="text-center">
            <div class="text-[11px] font-bold text-mari-text">{{ selectedDateLabel() }}</div>
            @if (selectedDate() !== todayIso()) {
              <button type="button" (click)="selectedDate.set(todayIso())" class="text-[10px] font-medium text-mari-primary hover:underline">
                Back to today
              </button>
            }
          </div>
          <button type="button" (click)="shiftSelectedDay(1)" class="rounded-[4px] p-0.5 hover:bg-mari-bg">
            <svg lucideChevronRight [size]="14"></svg>
          </button>
        </div>

        <div class="relative flex flex-col gap-0">
          @if (dayEntries().length) {
            <div class="absolute bottom-1 left-[13px] top-1 w-px bg-mari-border"></div>
          }
          @for (entry of dayEntries(); track entry.id; let last = $last) {
            <div class="relative flex gap-2" [class]="last ? 'pb-0' : 'pb-2'">
              <div
                class="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-md bg-mari-bg text-[8px] font-bold leading-none text-mari-text-secondary ring-1 ring-mari-border"
              >
                {{ compact() ? formatTimeShort(entry.time) : formatTime(entry.time) }}
              </div>
              <div
                class="group min-w-0 flex-1 rounded-[8px] border border-transparent px-2 py-1.5 shadow-sm transition-transform hover:-translate-y-0.5"
                [class]="accentBlock(entry.accent)"
              >
                <div class="flex items-start justify-between gap-1.5">
                  <div class="min-w-0">
                    <div class="text-xs font-semibold leading-snug">{{ entry.title }}</div>
                    <div class="mt-0.5 text-[10px] leading-snug opacity-80">{{ entry.location || 'No location' }}</div>
                  </div>
                  @if (editable()) {
                    <button
                      type="button"
                      (click)="store.deleteScheduleEntry(entry.id)"
                      class="shrink-0 rounded-[8px] p-1.5 opacity-0 transition-all hover:bg-mari-bg/60 group-hover:opacity-100"
                      aria-label="Delete schedule entry"
                    >
                      <svg lucideTrash2 [size]="14"></svg>
                    </button>
                  }
                </div>
              </div>
            </div>
          } @empty {
            <div class="rounded-[14px] border border-dashed border-mari-border py-10 text-center text-sm text-mari-text-tertiary">
              No events for this day
              @if (editable()) {
                <span> — add one below</span>
              }
            </div>
          }
        </div>
      } @else {
        <div class="mb-4 flex items-center justify-between gap-3">
          <button type="button" (click)="shiftMonth(-1)" class="rounded-[10px] border border-mari-border p-2 hover:bg-mari-bg-secondary">
            <svg lucideChevronLeft [size]="18"></svg>
          </button>
          <div class="text-sm font-bold text-mari-text">{{ monthLabel() }}</div>
          <button type="button" (click)="shiftMonth(1)" class="rounded-[10px] border border-mari-border p-2 hover:bg-mari-bg-secondary">
            <svg lucideChevronRight [size]="18"></svg>
          </button>
        </div>

        <div class="grid grid-cols-7 gap-1.5">
          @for (label of dayLabels; track label) {
            <div class="py-1 text-center text-[10px] font-bold uppercase text-mari-text-tertiary">
              {{ label }}
            </div>
          }
          @for (cell of monthCells(); track cell.date) {
            <button
              type="button"
              (click)="selectDate(cell.date)"
              class="flex aspect-square flex-col items-center justify-center rounded-[12px] text-sm font-medium transition-all"
              [class]="calendarCellClass(cell)"
            >
              {{ cell.day }}
              @if (cell.dots.length) {
                <div class="mt-1 flex max-w-full gap-0.5 overflow-hidden px-0.5">
                  @for (dot of cell.dots.slice(0, 3); track dot) {
                    <span class="size-1.5 shrink-0 rounded-full" [class]="accentBar(dot)"></span>
                  }
                </div>
              }
            </button>
          }
        </div>

        @if (editable()) {
          <p class="mt-3 text-center text-xs text-mari-text-tertiary">
            Tap a day to view or add events in the day timeline
          </p>
        }
      }
    </div>
  `,
})
export class ScheduleTimelineComponent {
  readonly entries = input.required<ScheduleEntry[]>();
  readonly editable = input(false);
  readonly compact = input(false);
  readonly selectedDate = model(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
  );

  protected readonly store = inject(MariStoreService);
  protected readonly view = signal<ScheduleView>('schedule');
  protected readonly dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  protected readonly viewMonth = signal(new Date().getMonth());
  protected readonly viewYear = signal(new Date().getFullYear());
  protected readonly todayIso = signal(this.isoDate(new Date()));

  protected readonly dayEntries = computed(() =>
    this.entries()
      .filter((entry) => entry.date === this.selectedDate())
      .sort((a, b) => a.time.localeCompare(b.time)),
  );

  protected readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
      new Date(this.viewYear(), this.viewMonth(), 1),
    ),
  );

  protected readonly monthCells = computed((): CalendarCell[] => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: CalendarCell[] = [];

    for (let i = 0; i < startOffset; i++) {
      const date = new Date(year, month, -startOffset + i + 1);
      cells.push(this.buildCell(date, false));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(this.buildCell(new Date(year, month, day), true));
    }

    while (cells.length % 7 !== 0) {
      const last = cells[cells.length - 1];
      const [y, m, d] = last.date.split('-').map(Number);
      const next = new Date(y, m - 1, d + 1);
      cells.push(this.buildCell(next, false));
    }

    return cells;
  });

  protected readonly selectedDateLabel = computed(() =>
    new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(new Date(`${this.selectedDate()}T12:00:00`)),
  );

  accentBlock(accent: CourseAccent): string {
    return ACCENT_STYLES[accent].block + ' border-mari-border/30';
  }

  accentBar(accent: CourseAccent): string {
    return ACCENT_STYLES[accent].bar;
  }

  formatTime(time: string): string {
    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return time;
    const hour = Number(match[1]);
    const minute = match[2];
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const normalized = hour % 12 || 12;
    return minute === '00' ? `${normalized}${suffix}` : `${normalized}:${minute}${suffix}`;
  }

  formatTimeShort(time: string): string {
    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return time;
    const hour = Number(match[1]);
    const suffix = hour >= 12 ? 'p' : 'a';
    return `${hour % 12 || 12}${suffix}`;
  }

  selectDate(date: string): void {
    this.selectedDate.set(date);
    this.view.set('schedule');
    const [year, month] = date.split('-').map(Number);
    this.viewYear.set(year);
    this.viewMonth.set(month - 1);
  }

  shiftSelectedDay(delta: number): void {
    const [year, month, day] = this.selectedDate().split('-').map(Number);
    const next = new Date(year, month - 1, day + delta);
    this.selectedDate.set(this.isoDate(next));
  }

  shiftMonth(delta: number): void {
    const next = new Date(this.viewYear(), this.viewMonth() + delta, 1);
    this.viewYear.set(next.getFullYear());
    this.viewMonth.set(next.getMonth());
  }

  calendarCellClass(cell: CalendarCell): string {
    if (this.selectedDate() === cell.date) {
      return 'bg-mari-primary text-white shadow-md ring-2 ring-mari-primary-muted';
    }
    if (cell.date === this.todayIso()) {
      return 'bg-mari-primary-light text-mari-primary-dark ring-1 ring-mari-primary-muted';
    }
    if (!cell.inMonth) {
      return 'bg-mari-bg text-mari-text-tertiary/70';
    }
    if (cell.dots.length) {
      return 'bg-mari-bg-secondary text-mari-text hover:bg-mari-bg-tertiary';
    }
    return 'bg-mari-bg-secondary text-mari-text hover:bg-mari-bg-tertiary';
  }

  private buildCell(date: Date, inMonth: boolean): CalendarCell {
    const iso = this.isoDate(date);
    const dots = [
      ...new Set(
        this.entries()
          .filter((entry) => entry.date === iso)
          .map((entry) => entry.accent),
      ),
    ];
    return { date: iso, day: date.getDate(), inMonth, dots };
  }

  private isoDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
