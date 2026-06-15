import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideSearch } from '@lucide/angular';
import { MariStoreService } from '../../core/services/mari-store.service';
import { CourseGridComponent } from '../../shared/course-grid/course-grid.component';

@Component({
  selector: 'app-courses-page',
  imports: [CourseGridComponent, FormsModule, LucideSearch],
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

      @if (filteredCourses().length) {
        <app-course-grid [courses]="filteredCourses()" [linkMode]="true" />
      } @else {
        <div class="mari-surface py-16 text-center text-mari-text-secondary">
          No courses match "{{ query }}"
        </div>
      }
    </div>
  `,
})
export class CoursesPage {
  protected readonly store = inject(MariStoreService);
  protected query = '';

  protected readonly filteredCourses = computed(() => {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.store.courses();
    return this.store.courses().filter(
      (c) => c.title.toLowerCase().includes(q) || c.professor.toLowerCase().includes(q),
    );
  });
}
