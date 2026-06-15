import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowUpRight, LucideFolder, LucideTrash2, LucideUser } from '@lucide/angular';
import { ACCENT_STYLES, CourseFolder } from '../../core/models/mari.models';
import { courseFolderStyleVars, hexToStyles, normalizeHex } from '../../core/utils/course-color';

@Component({
  selector: 'app-course-grid',
  imports: [LucideFolder, LucideUser, LucideArrowUpRight, LucideTrash2, RouterLink],
  template: `
    <div class="grid grid-cols-2 gap-3">
      @for (course of courses(); track course.id) {
        @if (linkMode()) {
          <div
            class="group relative overflow-hidden rounded-[16px] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            [class]="usesCustomColor(course) ? '' : presetCardClass(course.accent)"
            [style]="folderCardStyle(course)"
          >
            <a
              [routerLink]="['/courses', course.id]"
              class="relative block text-left"
              [class]="compact() ? 'p-3' : 'p-4'"
            >
              <div
                class="absolute inset-x-0 top-0 h-1.5"
                [class]="usesCustomColor(course) ? '' : presetBarClass(course.accent)"
                [style.background]="folderBar(course) || null"
              ></div>
              <div class="flex items-start justify-between">
                <div
                  class="flex size-10 items-center justify-center rounded-[12px] bg-mari-bg/70 shadow-sm"
                  [class]="usesCustomColor(course) ? '' : presetTextClass(course.accent)"
                  [style.color]="folderText(course) || null"
                >
                  <svg lucideFolder [size]="compact() ? 18 : 22"></svg>
                </div>
                <svg
                  lucideArrowUpRight
                  [size]="16"
                  class="opacity-0 transition-opacity group-hover:opacity-100"
                  [class]="usesCustomColor(course) ? '' : presetTextClass(course.accent)"
                  [style.color]="folderText(course) || null"
                ></svg>
              </div>
              <div
                class="mt-3 font-semibold"
                [class]="usesCustomColor(course) ? 'text-mari-text' : presetTextClass(course.accent)"
                [style.color]="folderText(course) || null"
                [class.text-sm]="compact()"
                [class.text-base]="!compact()"
              >
                {{ course.title }}
              </div>
              @if (!compact()) {
                <div
                  class="mt-1 flex items-center gap-1 text-xs text-mari-text-secondary/90"
                  [class]="usesCustomColor(course) ? '' : presetTextClass(course.accent)"
                >
                  <svg lucideUser [size]="12"></svg>{{ course.professor }}
                </div>
                <div class="mt-2 inline-flex rounded-full bg-mari-bg/60 px-2 py-0.5 text-[10px] font-semibold text-mari-text-secondary">
                  {{ course.fileCount }} files
                </div>
              }
            </a>

            @if (manageMode()) {
              <button
                type="button"
                (click)="deleteCourse.emit(course.id)"
                class="absolute right-2 top-2 z-10 rounded-[8px] bg-mari-bg/90 p-1.5 text-mari-text-tertiary opacity-0 shadow-sm transition-all hover:bg-accent-coral-bg hover:text-accent-coral-text group-hover:opacity-100"
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
              usesCustomColor(course) ? '' : presetCardClass(course.accent),
              selectedId() === course.id ? 'ring-2 ring-mari-primary ring-offset-2' : '',
              compact() ? 'p-3' : 'p-4',
            ]"
            [style]="folderCardStyle(course)"
          >
            <div
              class="absolute inset-x-0 top-0 h-1.5"
              [class]="usesCustomColor(course) ? '' : presetBarClass(course.accent)"
              [style.background]="folderBar(course) || null"
            ></div>
            <div
              class="flex size-10 items-center justify-center rounded-[12px] bg-mari-bg/70 shadow-sm"
              [class]="usesCustomColor(course) ? '' : presetTextClass(course.accent)"
              [style.color]="folderText(course) || null"
            >
              <svg lucideFolder [size]="compact() ? 18 : 22"></svg>
            </div>
            <div
              class="mt-3 font-semibold"
              [class]="usesCustomColor(course) ? 'text-mari-text' : presetTextClass(course.accent)"
              [style.color]="folderText(course) || null"
              [class.text-sm]="compact()"
              [class.text-base]="!compact()"
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

  usesCustomColor(course: CourseFolder): boolean {
    return Boolean(normalizeHex(course.customColor ?? ''));
  }

  folderCardStyle(course: CourseFolder): Record<string, string> {
    const hex = normalizeHex(course.customColor ?? '');
    if (!hex) return {};
    const vars = courseFolderStyleVars(hex);
    return {
      backgroundColor: vars['--course-card-bg'],
      ...vars,
    };
  }

  folderBar(course: CourseFolder): string {
    const hex = normalizeHex(course.customColor ?? '');
    if (!hex) return '';
    return hexToStyles(hex).bar;
  }

  folderText(course: CourseFolder): string {
    const hex = normalizeHex(course.customColor ?? '');
    if (!hex) return '';
    return hexToStyles(hex).text;
  }

  presetCardClass(accent: CourseFolder['accent']): string {
    return ACCENT_STYLES[accent].card;
  }

  presetBarClass(accent: CourseFolder['accent']): string {
    return ACCENT_STYLES[accent].bar;
  }

  presetTextClass(accent: CourseFolder['accent']): string {
    return ACCENT_STYLES[accent].text;
  }
}
