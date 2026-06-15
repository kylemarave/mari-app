import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideArrowLeft, LucideFileStack, LucideLink2, LucidePalette } from '@lucide/angular';
import { CourseAccent } from '../../core/models/mari.models';
import { MariStoreService } from '../../core/services/mari-store.service';
import { hexToStyles, normalizeHex, validateHex } from '../../core/utils/course-color';
import { BookmarkPanelComponent } from '../../shared/bookmark-panel/bookmark-panel.component';
import { FileRepoComponent } from '../../shared/file-repo/file-repo.component';

@Component({
  selector: 'app-course-detail-page',
  imports: [
    RouterLink,
    FormsModule,
    BookmarkPanelComponent,
    FileRepoComponent,
    LucideArrowLeft,
    LucideFileStack,
    LucideLink2,
    LucidePalette,
  ],
  template: `
    <div class="mari-page max-w-5xl">
      <a routerLink="/courses" class="mb-5 inline-flex items-center gap-2 text-sm font-medium text-mari-text-secondary hover:text-mari-primary">
        <svg lucideArrowLeft [size]="16"></svg>
        All courses
      </a>

      @if (course(); as c) {
        <div
          class="relative mb-6 overflow-hidden rounded-[20px] border border-mari-border/60 p-6 shadow-md"
          [style.background]="headerStyle().cardBg"
        >
          <div class="absolute inset-x-0 top-0 h-1.5" [style.background]="headerStyle().bar"></div>
          <h1 class="text-2xl font-bold sm:text-3xl" [style.color]="headerStyle().text">{{ c.title }}</h1>
          <p class="mt-1 text-sm opacity-80" [style.color]="headerStyle().text">{{ c.professor }}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="mari-chip bg-mari-bg/70 text-mari-text-secondary">{{ c.fileCount }} files</span>
            @if (c.customColor) {
              <span class="mari-chip bg-mari-bg/70 font-mono text-mari-text-secondary">{{ c.customColor }}</span>
            }
          </div>
        </div>

        <section class="mari-surface-elevated mb-5 p-5">
          <div class="mari-section-head">
            <div class="mari-section-title">
              <span class="mari-section-icon bg-mari-primary-light text-mari-primary-dark">
                <svg lucidePalette [size]="16"></svg>
              </span>
              Folder color
            </div>
          </div>
          <div class="flex flex-wrap items-end gap-3">
            <label class="block">
              <span class="mb-1 block text-xs font-semibold text-mari-text-tertiary">Hex color</span>
              <input type="color" [(ngModel)]="colorPicker" class="size-10 cursor-pointer rounded-[10px] border border-mari-border bg-mari-bg" />
            </label>
            <label class="block min-w-[8rem] flex-1">
              <span class="mb-1 block text-xs font-semibold text-mari-text-tertiary">#RRGGBB</span>
              <input type="text" [(ngModel)]="colorHex" class="mari-input font-mono uppercase" placeholder="#534ab7" />
            </label>
            <button type="button" (click)="saveColor()" class="mari-btn-primary">Save color</button>
            <button type="button" (click)="clearCustomColor()" class="mari-btn-secondary">Use preset</button>
          </div>
          @if (colorSaved()) {
            <p class="mt-2 text-sm font-medium text-accent-teal-text">Folder color updated.</p>
          }
        </section>

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
            <app-file-repo [files]="files()" [courseId]="courseId()" />
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
            <app-bookmark-panel [bookmarks]="bookmarks()" [editable]="true" [courseId]="courseId()" />
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

  protected readonly courseId = computed(() => this.route.snapshot.paramMap.get('courseId') ?? '');
  protected readonly course = computed(() => this.store.getCourse(this.courseId()));
  protected readonly files = computed(() => this.store.getCourseFiles(this.courseId()));
  protected readonly bookmarks = computed(() => this.store.getBookmarksForCourse(this.courseId()));

  protected colorHex = '';
  protected colorPicker = '#534ab7';
  protected readonly colorSaved = signal(false);

  constructor() {
    effect(() => {
      const c = this.course();
      if (c?.customColor) {
        this.colorHex = c.customColor;
        this.colorPicker = c.customColor;
      } else if (c) {
        this.colorPicker = this.presetHex(c.accent);
        this.colorHex = '';
      }
    });
  }

  protected readonly headerStyle = computed(() => {
    const c = this.course();
    if (!c) return hexToStyles('#534ab7');
    const hex = normalizeHex(c.customColor ?? '') || this.presetHex(c.accent);
    return hexToStyles(hex);
  });

  saveColor(): void {
    const id = this.courseId();
    const hex = normalizeHex(this.colorHex) || normalizeHex(this.colorPicker);
    if (!hex || !validateHex(hex)) return;
    this.store.updateCourse(id, { customColor: hex });
    this.colorSaved.set(true);
    setTimeout(() => this.colorSaved.set(false), 2000);
  }

  clearCustomColor(): void {
    this.store.updateCourse(this.courseId(), { customColor: undefined });
    const c = this.course();
    if (c) {
      this.colorPicker = this.presetHex(c.accent);
      this.colorHex = '';
    }
    this.colorSaved.set(true);
    setTimeout(() => this.colorSaved.set(false), 2000);
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
}
