import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucidePlus, LucideSearch } from '@lucide/angular';
import { CourseAccent } from '../../core/models/mari.models';
import { MariStoreService } from '../../core/services/mari-store.service';
import { CourseGridComponent } from '../../shared/course-grid/course-grid.component';

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
          <input
            type="search"
            [(ngModel)]="query"
            placeholder="Search courses…"
            class="mari-input pl-9"
          />
        </div>
      </div>

      <form
        (ngSubmit)="addFolder()"
        class="mari-surface-elevated mb-5 grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
      >
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">
            Folder name
          </label>
          <input
            type="text"
            [(ngModel)]="folderTitle"
            name="folderTitle"
            placeholder="e.g. Biology 101"
            class="mari-input"
            required
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">
            Professor
          </label>
          <input
            type="text"
            [(ngModel)]="folderProfessor"
            name="folderProfessor"
            placeholder="Instructor name"
            class="mari-input"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">
            Color
          </label>
          <select [(ngModel)]="folderAccent" name="folderAccent" class="mari-input">
            @for (accent of accents; track accent.value) {
              <option [value]="accent.value">{{ accent.label }}</option>
            }
          </select>
        </div>
        <button type="submit" [disabled]="!folderTitle.trim()" class="mari-btn-primary">
          <svg lucidePlus [size]="16"></svg>
          Add folder
        </button>
      </form>

      @if (filteredCourses().length) {
        <app-course-grid
          [courses]="filteredCourses()"
          [linkMode]="true"
          [manageMode]="true"
          (deleteCourse)="requestDelete($event)"
        />
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
              <button type="button" (click)="confirmingDelete.set(null)" class="mari-btn-secondary">
                Cancel
              </button>
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
  protected readonly confirmingDelete = signal<string | null>(null);

  protected readonly accents: { value: CourseAccent; label: string }[] = [
    { value: 'violet', label: 'Violet' },
    { value: 'teal', label: 'Teal' },
    { value: 'coral', label: 'Coral' },
    { value: 'amber', label: 'Amber' },
    { value: 'sage', label: 'Sage' },
  ];

  protected readonly filteredCourses = computed(() => {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.store.courses();
    return this.store.courses().filter(
      (c) => c.title.toLowerCase().includes(q) || c.professor.toLowerCase().includes(q),
    );
  });

  addFolder(): void {
    const title = this.folderTitle.trim();
    if (!title) return;

    this.store.addCourse({
      title,
      professor: this.folderProfessor.trim() || 'TBA',
      accent: this.folderAccent,
    });

    this.folderTitle = '';
    this.folderProfessor = '';
    this.folderAccent = 'violet';
  }

  requestDelete(courseId: string): void {
    this.confirmingDelete.set(courseId);
  }

  deleteFolder(courseId: string): void {
    this.store.deleteCourse(courseId);
    this.confirmingDelete.set(null);
  }
}
