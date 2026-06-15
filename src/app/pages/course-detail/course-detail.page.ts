import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideFileStack, LucideLink2 } from '@lucide/angular';
import { ACCENT_STYLES, CourseAccent } from '../../core/models/mari.models';
import { MariStoreService } from '../../core/services/mari-store.service';
import { BookmarkPanelComponent } from '../../shared/bookmark-panel/bookmark-panel.component';
import { FileRepoComponent } from '../../shared/file-repo/file-repo.component';

@Component({
  selector: 'app-course-detail-page',
  imports: [RouterLink, BookmarkPanelComponent, FileRepoComponent, LucideArrowLeft, LucideFileStack, LucideLink2],
  template: `
    <div class="mari-page max-w-5xl">
      <a routerLink="/courses" class="mb-5 inline-flex items-center gap-2 text-sm font-medium text-mari-text-secondary hover:text-mari-primary">
        <svg lucideArrowLeft [size]="16"></svg>
        All courses
      </a>

      @if (course(); as c) {
        <div class="relative mb-6 overflow-hidden rounded-[20px] border border-mari-border/60 p-6 shadow-md" [class]="accentStyles(c.accent).card">
          <div class="absolute inset-x-0 top-0 h-1.5" [class]="accentStyles(c.accent).bar"></div>
          <h1 class="text-2xl font-bold sm:text-3xl" [class]="accentStyles(c.accent).text">{{ c.title }}</h1>
          <p class="mt-1 text-sm opacity-80">{{ c.professor }}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="mari-chip bg-white/70 text-mari-text-secondary">{{ c.fileCount }} files</span>
            <span class="mari-chip bg-white/70 text-mari-text-secondary">{{ bookmarks().length }} bookmarks</span>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <section class="mari-surface-elevated p-5">
            <div class="mari-section-head">
              <div class="mari-section-title">
                <span class="mari-section-icon bg-mari-primary-light text-mari-primary-dark">
                  <svg lucideFileStack [size]="16"></svg>
                </span>
                File repository
              </div>
            </div>
            <app-file-repo [files]="files()" />
          </section>
          <section class="mari-surface-elevated p-5">
            <div class="mari-section-head">
              <div class="mari-section-title">
                <span class="mari-section-icon bg-accent-sage-bg text-accent-sage-text">
                  <svg lucideLink2 [size]="16"></svg>
                </span>
                Bookmark links
              </div>
            </div>
            <app-bookmark-panel [bookmarks]="bookmarks()" />
          </section>
        </div>
      } @else {
        <div class="mari-surface py-16 text-center">
          <p class="text-mari-text-secondary">Course not found.</p>
          <a routerLink="/courses" class="mari-link-action mt-2 inline-block">Back to courses</a>
        </div>
      }
    </div>
  `,
})
export class CourseDetailPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly store = inject(MariStoreService);

  private readonly courseId = computed(() => this.route.snapshot.paramMap.get('courseId') ?? '');
  protected readonly course = computed(() => this.store.getCourse(this.courseId()));
  protected readonly files = computed(() => this.store.getCourseFiles(this.courseId()));
  protected readonly bookmarks = computed(() => this.store.getBookmarksForCourse(this.courseId()));

  accentStyles(accent: CourseAccent) {
    return ACCENT_STYLES[accent];
  }
}
