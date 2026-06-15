import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowUpRight, LucideFolder, LucideTrash2, LucideUser } from '@lucide/angular';
import { ACCENT_STYLES, CourseFolder } from '../../core/models/mari.models';
import { courseFolderStyleVars, hexToStyles, normalizeHex } from '../../core/utils/course-color';

@Component({
  selector: 'app-course-grid',
  imports: [LucideFolder, LucideUser, LucideArrowUpRight, LucideTrash2, RouterLink],
  template: `
    <div [class]="gridClass()">
      @for (course of courses(); track course.id) {
        @if (linkMode()) {
          <div
            class="group relative min-w-0 overflow-hidden rounded-[12px] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            [class]="usesCustomColor(course) ? '' : presetCardClass(course.accent)"
            [style]="folderCardStyle(course)"
          >
            <a
              [routerLink]="['/courses', course.id]"
              class="relative block min-w-0 text-left"
              [class]="cardPadding()"
            >
              <div
                class="absolute inset-x-0 top-0 h-1"
                [class]="usesCustomColor(course) ? '' : presetBarClass(course.accent)"
                [style.background]="folderBar(course) || null"
              ></div>
              <div class="flex items-start justify-between gap-1">
                <div
                  class="flex shrink-0 items-center justify-center rounded-[10px] bg-mari-bg/70 shadow-sm"
                  [class]="usesCustomColor(course) ? '' : presetTextClass(course.accent)"
                  [class.size-7]="isDashboard()"
                  [class.size-8]="!isDashboard()"
                  [style.color]="folderText(course) || null"
                >
                  <svg lucideFolder [size]="isDashboard() ? 15 : compact() ? 16 : 18"></svg>
                </div>
                @if (!isDashboard()) {
                  <svg
                    lucideArrowUpRight
                    [size]="14"
                    class="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    [class]="usesCustomColor(course) ? '' : presetTextClass(course.accent)"
                    [style.color]="folderText(course) || null"
                  ></svg>
                }
              </div>
              <div
                class="mt-1.5 min-w-0 font-semibold leading-snug"
                [class]="usesCustomColor(course) ? 'text-mari-text' : presetTextClass(course.accent)"
                [class.line-clamp-2]="isDashboard()"
                [class.break-words]="isDashboard()"
                [class.text-xs]="compact() || isDashboard()"
                [class.text-sm]="!compact() && !isDashboard()"
                [style.color]="folderText(course) || null"
              >
                {{ course.title }}
              </div>
              @if (!compact() || isDashboard()) {
                <div
                  class="mt-0.5 flex min-w-0 items-center gap-1 text-mari-text-secondary/90"
                  [class]="usesCustomColor(course) ? '' : presetTextClass(course.accent)"
                  [class.text-[10px]]="isDashboard()"
                  [class.text-[11px]]="!isDashboard()"
                >
                  <svg lucideUser [size]="isDashboard() ? 10 : 11" class="shrink-0"></svg>
                  <span class="truncate">{{ course.professor }}</span>
                </div>
                <div
                  class="inline-flex rounded-full bg-mari-bg/60 px-1.5 py-0.5 text-[9px] font-semibold text-mari-text-secondary"
                  [class.mt-1]="isDashboard()"
                  [class.mt-1.5]="!isDashboard()"
                >
                  {{ course.fileCount }} {{ course.fileCount === 1 ? 'file' : 'files' }}
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
            class="group relative overflow-hidden rounded-[12px] text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            [class]="[
              usesCustomColor(course) ? '' : presetCardClass(course.accent),
              selectedId() === course.id ? 'ring-2 ring-mari-primary ring-offset-2' : '',
              compact() ? 'p-2.5' : 'p-3',
            ]"
            [style]="folderCardStyle(course)"
          >
            <div
              class="absolute inset-x-0 top-0 h-1"
              [class]="usesCustomColor(course) ? '' : presetBarClass(course.accent)"
              [style.background]="folderBar(course) || null"
            ></div>
            <div
              class="flex size-8 items-center justify-center rounded-[10px] bg-mari-bg/70 shadow-sm"
              [class]="usesCustomColor(course) ? '' : presetTextClass(course.accent)"
              [style.color]="folderText(course) || null"
            >
              <svg lucideFolder [size]="compact() ? 16 : 18"></svg>
            </div>
            <div
              class="mt-2 font-semibold"
              [class]="usesCustomColor(course) ? 'text-mari-text' : presetTextClass(course.accent)"
              [style.color]="folderText(course) || null"
              [class.text-xs]="compact()"
              [class.text-sm]="!compact()"
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
  readonly dashboard = input(false);
  readonly linkMode = input(false);
  readonly manageMode = input(false);

  readonly courseSelect = output<string>();
  readonly deleteCourse = output<string>();

  protected isDashboard(): boolean {
    return this.dashboard();
  }

  protected gridClass(): string {
    if (this.dashboard()) {
      return 'grid grid-cols-2 gap-2';
    }
    return 'grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4';
  }

  protected cardPadding(): string {
    if (this.dashboard()) return 'p-2.5';
    return this.compact() ? 'p-2.5' : 'p-3';
  }

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
