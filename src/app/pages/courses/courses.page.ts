import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucidePlus, LucideSearch } from '@lucide/angular';
import { CourseAccent } from '../../core/models/mari.models';
import { MariStoreService } from '../../core/services/mari-store.service';
import { CourseGridComponent } from '../../shared/course-grid/course-grid.component';
import { hexToStyles, normalizeHex, validateHex } from '../../core/utils/course-color';

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

      <form
        (ngSubmit)="addFolder()"
        class="mari-surface-elevated mb-5 grid grid-cols-1 gap-4 p-4 lg:grid-cols-12 lg:items-end"
      >
        <div class="lg:col-span-3">
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">
            Folder name
          </label>
          <input type="text" [(ngModel)]="folderTitle" name="folderTitle" placeholder="e.g. Biology 101" class="mari-input" required />
        </div>
        <div class="lg:col-span-3">
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">
            Professor
          </label>
          <input type="text" [(ngModel)]="folderProfessor" name="folderProfessor" placeholder="Instructor name" class="mari-input" />
        </div>
        <div class="lg:col-span-4">
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">
            Folder color
          </label>
          <div class="flex flex-wrap items-center gap-2">
            @for (accent of accents; track accent.value) {
              <button
                type="button"
                (click)="selectPreset(accent.value)"
                class="size-8 rounded-full ring-2 ring-offset-2 ring-offset-mari-bg transition-all"
                [class]="presetSwatchClass(accent.value)"
                [class.ring-mari-primary]="folderAccent === accent.value && !folderCustomHex"
                [attr.aria-label]="accent.label"
              ></button>
            }
            <input type="color" [(ngModel)]="folderColorPicker" name="folderColorPicker" class="size-9 cursor-pointer rounded-[10px] border border-mari-border bg-mari-bg" />
            <input
              type="text"
              [(ngModel)]="folderCustomHex"
              name="folderCustomHex"
              placeholder="#534ab7"
              class="mari-input min-w-[7rem] flex-1 font-mono text-sm uppercase"
              (input)="onHexInput()"
            />
          </div>
        </div>
        <div class="lg:col-span-2">
          <button type="submit" [disabled]="!folderTitle.trim()" class="mari-btn-primary w-full">
            <svg lucidePlus [size]="16"></svg>
            Add folder
          </button>
        </div>

        <div class="lg:col-span-12">
          <div
            class="rounded-[16px] border border-mari-border p-4 shadow-sm transition-all"
            [style.background]="previewCardStyle().cardBg"
          >
            <div class="mb-2 h-1.5 rounded-full" [style.background]="previewCardStyle().bar"></div>
            <div class="text-sm font-semibold" [style.color]="previewCardStyle().text">Preview · {{ folderTitle || 'New folder' }}</div>
            <p class="mt-1 text-xs opacity-80" [style.color]="previewCardStyle().text">
              {{ previewColorLabel() }}
            </p>
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

  protected readonly previewCardStyle = computed(() => {
    const hex = normalizeHex(this.folderCustomHex) || normalizeHex(this.folderColorPicker);
    if (hex) return hexToStyles(hex);
    return hexToStyles(
      {
        violet: '#534ab7',
        teal: '#1d9e75',
        coral: '#d85a30',
        amber: '#ba7517',
        sage: '#639922',
      }[this.folderAccent],
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

  previewColorLabel(): string {
    const hex = normalizeHex(this.folderCustomHex) || normalizeHex(this.folderColorPicker);
    return hex ? `Custom ${hex}` : `Preset · ${this.folderAccent}`;
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

  presetHex(accent: CourseAccent): string {
    const map: Record<CourseAccent, string> = {
      violet: '#534ab7',
      teal: '#1d9e75',
      coral: '#d85a30',
      amber: '#ba7517',
      sage: '#639922',
    };
    return map[accent];
  }

  requestDelete(courseId: string): void {
    this.confirmingDelete.set(courseId);
  }

  deleteFolder(courseId: string): void {
    this.store.deleteCourse(courseId);
    this.confirmingDelete.set(null);
  }
}
