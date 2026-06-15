import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowUpRight, LucideFolder, LucideTrash2, LucideUser } from '@lucide/angular';
import { ACCENT_STYLES, CourseFolder } from '../../core/models/mari.models';

@Component({
  selector: 'app-course-grid',
  imports: [LucideFolder, LucideUser, LucideArrowUpRight, LucideTrash2, RouterLink],
  template: `
    <div class="grid grid-cols-2 gap-3">
      @for (course of courses(); track course.id) {
        @if (linkMode()) {
          <div
            class="group relative overflow-hidden rounded-[16px] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            [class]="accentStyles(course.accent).card"
          >
            <a
              [routerLink]="['/courses', course.id]"
              class="relative block text-left"
              [class]="compact() ? 'p-3' : 'p-4'"
            >
              <div class="absolute inset-x-0 top-0 h-1.5" [class]="accentStyles(course.accent).bar"></div>
              <div class="flex items-start justify-between">
                <div
                  class="flex size-10 items-center justify-center rounded-[12px] bg-white/70 shadow-sm"
                  [class]="accentStyles(course.accent).text"
                >
                  <svg lucideFolder [size]="compact() ? 18 : 22"></svg>
                </div>
                <svg
                  lucideArrowUpRight
                  [size]="16"
                  class="opacity-0 transition-opacity group-hover:opacity-100"
                  [class]="accentStyles(course.accent).text"
                ></svg>
              </div>
              <div
                class="mt-3 font-semibold"
                [class]="[accentStyles(course.accent).text, compact() ? 'text-sm' : 'text-base']"
              >
                {{ course.title }}
              </div>
              @if (!compact()) {
                <div class="mt-1 flex items-center gap-1 text-xs text-mari-text-secondary/90">
                  <svg lucideUser [size]="12"></svg>{{ course.professor }}
                </div>
                <div class="mt-2 inline-flex rounded-full bg-white/50 px-2 py-0.5 text-[10px] font-semibold text-mari-text-secondary">
                  {{ course.fileCount }} files
                </div>
              }
            </a>

            @if (manageMode()) {
              <button
                type="button"
                (click)="deleteCourse.emit(course.id)"
                class="absolute right-2 top-2 z-10 rounded-[8px] bg-white/80 p-1.5 text-mari-text-tertiary opacity-0 shadow-sm transition-all hover:bg-accent-coral-bg hover:text-accent-coral-text group-hover:opacity-100"
                aria-label="Delete folder"
              >
                <svg lucideTrash2 [size]="14"></svg>
              </button>
            }
          </div>
        } @else {
          <button
            type="button"
            (click)="courseSelect.emit(course.id)"
            class="group relative overflow-hidden rounded-[16px] text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            [class]="[
              accentStyles(course.accent).card,
              selectedId() === course.id ? 'ring-2 ring-mari-primary ring-offset-2' : '',
              compact() ? 'p-3' : 'p-4',
            ]"
          >
            <div class="absolute inset-x-0 top-0 h-1.5" [class]="accentStyles(course.accent).bar"></div>
            <div
              class="flex size-10 items-center justify-center rounded-[12px] bg-white/70 shadow-sm"
              [class]="accentStyles(course.accent).text"
            >
              <svg lucideFolder [size]="compact() ? 18 : 22"></svg>
            </div>
            <div
              class="mt-3 font-semibold"
              [class]="[accentStyles(course.accent).text, compact() ? 'text-sm' : 'text-base']"
            >
              {{ course.title }}
            </div>
          </button>
        }
      }
    </div>
  `,
})
export class CourseGridComponent {
  readonly courses = input.required<CourseFolder[]>();
  readonly selectedId = input<string | null>(null);
  readonly compact = input(false);
  readonly linkMode = input(false);
  readonly manageMode = input(false);

  readonly courseSelect = output<string>();
  readonly deleteCourse = output<string>();

  accentStyles(accent: CourseFolder['accent']) {
    return ACCENT_STYLES[accent];
  }
}
