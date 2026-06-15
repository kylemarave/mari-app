import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucidePlus, LucideSearch } from '@lucide/angular';
import { CourseAccent } from '../../core/models/mari.models';
import { MariStoreService } from '../../core/services/mari-store.service';
import { CourseGridComponent } from '../../shared/course-grid/course-grid.component';
import { normalizeHex, validateHex } from '../../core/utils/course-color';

@Component({
  selector: 'app-courses-page',
  imports: [CourseGridComponent, FormsModule, LucidePlus, LucideSearch],
  template: `
    <div class="mari-page">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-mari-text sm:text-3xl">Course Folders</h1>
          <p class="mt-1 text-sm text-mari-text-secondary">
            {{ store.courses().length }} subjects · files, notes & bookmarks in one place
          </p>
        </div>
        <div class="relative w-full sm:w-72">
          <svg lucideSearch [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-mari-text-tertiary"></svg>
          <input type="search" [(ngModel)]="query" placeholder="Search courses…" class="mari-input pl-9" />
        </div>
      </div>

      <form (ngSubmit)="addFolder()" class="mari-surface-elevated mb-5 space-y-3 p-4">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
          <div class="lg:col-span-4">
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">
              Folder name
            </label>
            <input type="text" [(ngModel)]="folderTitle" name="folderTitle" placeholder="e.g. Biology 101" class="mari-input" required />
          </div>
          <div class="lg:col-span-4">
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">
              Professor
            </label>
            <input type="text" [(ngModel)]="folderProfessor" name="folderProfessor" placeholder="Instructor name" class="mari-input" />
          </div>
          <div class="sm:col-span-2 lg:col-span-4">
            <button type="submit" [disabled]="!folderTitle.trim()" class="mari-btn-primary w-full">
              <svg lucidePlus [size]="16"></svg>
              Add folder
            </button>
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">
            Folder color
          </label>
          <div class="overflow-hidden rounded-[12px] border border-mari-border bg-mari-bg-secondary/50 px-3 py-2.5">
            <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
              <div class="flex items-center gap-1.5" role="group" aria-label="Preset colors">
                @for (accent of accents; track accent.value) {
                  <button
                    type="button"
                    (click)="selectPreset(accent.value)"
                    class="size-7 shrink-0 rounded-full transition-all hover:scale-105"
                    [class]="presetSwatchClass(accent.value)"
                    [class.ring-2]="folderAccent === accent.value && !folderCustomHex"
                    [class.ring-mari-text]="folderAccent === accent.value && !folderCustomHex"
                    [class.ring-offset-2]="folderAccent === accent.value && !folderCustomHex"
                    [class.ring-offset-mari-bg-secondary]="folderAccent === accent.value && !folderCustomHex"
                    [attr.aria-label]="accent.label"
                    [attr.aria-pressed]="folderAccent === accent.value && !folderCustomHex"
                  ></button>
                }
              </div>

              <div class="hidden h-6 w-px shrink-0 bg-mari-border sm:block"></div>

              <div class="flex min-w-0 items-center gap-2 sm:max-w-[11rem]">
                <span class="shrink-0 text-[11px] font-medium text-mari-text-tertiary">Custom</span>
                <label class="inline-flex shrink-0 cursor-pointer items-center">
                  <span
                    class="size-7 rounded-[8px] border border-mari-border shadow-sm"
                    [style.background]="folderColorPicker"
                  ></span>
                  <input
                    type="color"
                    [(ngModel)]="folderColorPicker"
                    name="folderColorPicker"
                    (input)="onColorPickerChange()"
                    class="sr-only"
                  />
                </label>
                <input
                  type="text"
                  [(ngModel)]="folderCustomHex"
                  name="folderCustomHex"
                  placeholder="#534AB7"
                  maxlength="7"
                  class="mari-input h-8 min-w-0 flex-1 px-2.5 font-mono text-xs uppercase"
                  (input)="onHexInput()"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      @if (filteredCourses().length) {
        <app-course-grid [courses]="filteredCourses()" [linkMode]="true" [manageMode]="true" (deleteCourse)="requestDelete($event)" />
      } @else {
        <div class="mari-surface py-16 text-center text-mari-text-secondary">
          @if (query.trim()) {
            No courses match "{{ query }}"
          } @else {
            No folders yet — add one above to get started.
          }
        </div>
      }

      @if (confirmingDelete(); as courseId) {
        <div class="fixed inset-0 z-40 flex items-center justify-center bg-mari-text/40 p-4 backdrop-blur-sm">
          <div class="w-full max-w-sm rounded-[16px] border border-mari-border bg-mari-bg p-5 shadow-xl">
            <h2 class="text-lg font-bold text-mari-text">Delete folder?</h2>
            <p class="mt-2 text-sm text-mari-text-secondary">
              This removes the folder and all uploaded files inside it.
            </p>
            <div class="mt-5 flex justify-end gap-2">
              <button type="button" (click)="confirmingDelete.set(null)" class="mari-btn-secondary">Cancel</button>
              <button type="button" (click)="deleteFolder(courseId)" class="mari-btn-primary bg-accent-coral hover:bg-accent-coral-text">
                Delete
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CoursesPage {
  protected readonly store = inject(MariStoreService);
  protected query = '';
  protected folderTitle = '';
  protected folderProfessor = '';
  protected folderAccent: CourseAccent = 'violet';
  protected folderCustomHex = '';
  protected folderColorPicker = '#534ab7';
  protected readonly confirmingDelete = signal<string | null>(null);

  protected readonly accents: { value: CourseAccent; label: string; swatch: string }[] = [
    { value: 'violet', label: 'Violet', swatch: 'bg-mari-primary' },
    { value: 'teal', label: 'Teal', swatch: 'bg-accent-teal' },
    { value: 'coral', label: 'Coral', swatch: 'bg-accent-coral' },
    { value: 'amber', label: 'Amber', swatch: 'bg-accent-amber' },
    { value: 'sage', label: 'Sage', swatch: 'bg-accent-sage' },
  ];

  protected readonly filteredCourses = computed(() => {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.store.courses();
    return this.store.courses().filter(
      (c) => c.title.toLowerCase().includes(q) || c.professor.toLowerCase().includes(q),
    );
  });

  presetSwatchClass(accent: CourseAccent): string {
    return this.accents.find((a) => a.value === accent)?.swatch ?? 'bg-mari-primary';
  }

  selectPreset(accent: CourseAccent): void {
    this.folderAccent = accent;
    this.folderCustomHex = '';
    const defaults: Record<CourseAccent, string> = {
      violet: '#534ab7',
      teal: '#1d9e75',
      coral: '#d85a30',
      amber: '#ba7517',
      sage: '#639922',
    };
    this.folderColorPicker = defaults[accent];
  }

  onHexInput(): void {
    const normalized = normalizeHex(this.folderCustomHex);
    if (validateHex(this.folderCustomHex)) {
      this.folderColorPicker = normalized;
    }
  }

  onColorPickerChange(): void {
    this.folderCustomHex = this.folderColorPicker.toUpperCase();
  }

  addFolder(): void {
    const title = this.folderTitle.trim();
    if (!title) return;

    const customColor = normalizeHex(this.folderCustomHex) || normalizeHex(this.folderColorPicker);

    this.store.addCourse({
      title,
      professor: this.folderProfessor.trim() || 'TBA',
      accent: this.folderAccent,
      customColor: customColor || undefined,
    });

    this.folderTitle = '';
    this.folderProfessor = '';
    this.folderAccent = 'violet';
    this.folderCustomHex = '';
    this.folderColorPicker = '#534ab7';
  }

  requestDelete(courseId: string): void {
    this.confirmingDelete.set(courseId);
  }

  deleteFolder(courseId: string): void {
    this.store.deleteCourse(courseId);
    this.confirmingDelete.set(null);
  }
}
