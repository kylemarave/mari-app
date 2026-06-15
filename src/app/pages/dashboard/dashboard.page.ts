import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBookMarked,
  LucideBookOpen,
  LucideCalendar,
  LucideCheckSquare,
  LucideFolderOpen,
  LucideLayoutGrid,
  LucideSparkles,
} from '@lucide/angular';
import { MariStoreService } from '../../core/services/mari-store.service';
import { BookmarkPanelComponent } from '../../shared/bookmark-panel/bookmark-panel.component';
import { CourseGridComponent } from '../../shared/course-grid/course-grid.component';
import { KanbanBoardComponent } from '../../shared/kanban-board/kanban-board.component';
import { ScheduleTimelineComponent } from '../../shared/schedule-timeline/schedule-timeline.component';
import { TaskListComponent } from '../../shared/task-list/task-list.component';
import { VirtualIdCardComponent } from '../../shared/virtual-id-card/virtual-id-card.component';
import { FlashcardComponent } from '../../shared/flashcard/flashcard.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    VirtualIdCardComponent,
    KanbanBoardComponent,
    ScheduleTimelineComponent,
    CourseGridComponent,
    BookmarkPanelComponent,
    TaskListComponent,
    FlashcardComponent,
    RouterLink,
    LucideCheckSquare,
    LucideCalendar,
    LucideBookOpen,
    LucideFolderOpen,
    LucideBookMarked,
    LucideLayoutGrid,
    LucideSparkles,
    LucideArrowRight,
  ],
  template: `
    <div class="mari-page flex flex-col gap-5 lg:gap-6">
      <!-- Hero -->
      <div class="mari-hero flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="mb-1 flex items-center gap-2">
            <svg lucideSparkles [size]="16" class="text-mari-primary"></svg>
            <span class="text-xs font-semibold uppercase tracking-wider text-mari-primary-dark"
              >Your workspace</span
            >
          </div>
          <h1 class="text-2xl font-bold text-mari-text sm:text-3xl">
            Hey, {{ store.student().name.split(' ')[0] }} 👋
          </h1>
          <p class="mt-1 max-w-md text-sm text-mari-text-secondary">
            {{ store.activeTasks().length }} tasks active ·
            {{ store.dashboardStats().nextClass }} is up next
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <a routerLink="/tasks" class="mari-btn-primary">
            <svg lucideCheckSquare [size]="16"></svg>
            Add task
          </a>
          <a
            routerLink="/study-sets"
            class="inline-flex items-center gap-1.5 rounded-[12px] border border-mari-primary/30 bg-mari-bg/80 px-4 py-2.5 text-sm font-semibold text-mari-primary-dark backdrop-blur transition-colors hover:bg-mari-bg"
          >
            Study now
            <svg lucideArrowRight [size]="16"></svg>
          </a>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <a routerLink="/tasks" class="mari-stat group transition-shadow hover:shadow-md">
          <div class="mari-stat-label">Tasks due</div>
          <div class="mari-stat-value mt-1">{{ stats().tasksDue }}</div>
          <div class="mt-2 flex items-center gap-1 text-xs text-accent-coral-text">
            <span class="size-1.5 rounded-full bg-accent-coral"></span>
            {{ stats().urgent }} high priority
          </div>
        </a>
        <a routerLink="/schedule" class="mari-stat group transition-shadow hover:shadow-md">
          <div class="mari-stat-label">Next class</div>
          <div class="mt-1 truncate text-lg font-semibold text-mari-text">{{ stats().nextClass }}</div>
          <div class="mt-2 text-xs text-mari-text-tertiary">Today's schedule</div>
        </a>
        <a routerLink="/settings" class="mari-stat group transition-shadow hover:shadow-md">
          <div class="mari-stat-label">GPA</div>
          <div class="mari-stat-value mt-1 text-mari-primary">{{ stats().gpa }}</div>
          <div class="mt-2 text-xs text-mari-text-tertiary">{{ store.student().program }}</div>
        </a>
        <a routerLink="/study-sets" class="mari-stat group transition-shadow hover:shadow-md">
          <div class="mari-stat-label">Study progress</div>
          <div class="mari-stat-value mt-1">{{ stats().studyProgress }}%</div>
          <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-mari-bg-secondary">
            <div
              class="h-full rounded-full bg-gradient-to-r from-accent-teal to-mari-primary"
              [style.width.%]="stats().studyProgress"
            ></div>
          </div>
        </a>
      </div>

      <!-- Mobile ID -->
      <div class="lg:hidden">
        <app-virtual-id-card [profile]="store.student()" variant="mobile-header" />
      </div>

      <!-- Bento grid -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <!-- ID card -->
        <section class="mari-surface hidden p-5 lg:col-span-4 lg:block">
          <app-virtual-id-card [profile]="store.student()" variant="widget" />
        </section>

        <!-- Kanban -->
        <section class="mari-surface-elevated p-5 lg:col-span-8">
          <div class="mari-section-head">
            <div class="mari-section-title">
              <span class="mari-section-icon bg-accent-amber-bg text-accent-amber-text">
                <svg lucideLayoutGrid [size]="16"></svg>
              </span>
              Task board
            </div>
            <a routerLink="/tasks" class="mari-link-action">Open tasks →</a>
          </div>
          <app-kanban-board [columns]="store.kanbanColumns()" [editable]="true" />
        </section>

        <!-- Upcoming tasks -->
        <section class="mari-surface p-5 lg:col-span-5">
          <div class="mari-section-head">
            <div class="mari-section-title">
              <span class="mari-section-icon bg-accent-coral-bg text-accent-coral-text">
                <svg lucideCheckSquare [size]="16"></svg>
              </span>
              Upcoming tasks
            </div>
            <a routerLink="/tasks" class="mari-link-action">See all</a>
          </div>
          <app-task-list [tasks]="store.activeTasks().slice(0, 4)" [compact]="true" [editable]="true" />
        </section>

        <!-- Schedule -->
        <section class="mari-surface p-5 lg:col-span-4">
          <div class="mari-section-head">
            <div class="mari-section-title">
              <span class="mari-section-icon bg-mari-primary-light text-mari-primary-dark">
                <svg lucideCalendar [size]="16"></svg>
              </span>
              Today
            </div>
            <a routerLink="/schedule" class="mari-link-action">Calendar</a>
          </div>
          <app-schedule-timeline
            [entries]="store.scheduleEntries()"
            [compact]="true"
            [editable]="false"
          />
        </section>

        <!-- Quick study -->
        <section class="mari-surface p-5 lg:col-span-3">
          <div class="mari-section-head">
            <div class="mari-section-title">
              <span class="mari-section-icon bg-accent-teal-bg text-accent-teal-text">
                <svg lucideBookOpen [size]="16"></svg>
              </span>
              Quick study
            </div>
          </div>
          @if (featuredDeck(); as deck) {
            <app-flashcard [deck]="deck" [deckId]="deck.id" [compact]="true" />
          } @else {
            <div class="rounded-[14px] border border-dashed border-mari-border py-8 text-center">
              <p class="text-sm text-mari-text-secondary">No study sets yet</p>
              <a routerLink="/study-sets" class="mari-btn-primary mt-3 inline-flex text-xs">
                Create from PDF
              </a>
            </div>
          }
        </section>

        <!-- Courses -->
        <section class="mari-surface p-5 lg:col-span-6">
          <div class="mari-section-head">
            <div class="mari-section-title">
              <span class="mari-section-icon bg-accent-blue-bg text-accent-blue-text">
                <svg lucideFolderOpen [size]="16"></svg>
              </span>
              Course folders
              <span class="mari-chip bg-mari-bg-secondary text-mari-text-secondary">{{
                stats().coursesCount
              }}</span>
            </div>
            <a routerLink="/courses" class="mari-link-action">Browse all</a>
          </div>
          <app-course-grid [courses]="store.courses()" [linkMode]="true" />
        </section>

        <!-- Bookmarks -->
        <section class="mari-surface p-5 lg:col-span-6">
          <div class="mari-section-head">
            <div class="mari-section-title">
              <span class="mari-section-icon bg-accent-sage-bg text-accent-sage-text">
                <svg lucideBookMarked [size]="16"></svg>
              </span>
              Saved links
            </div>
          </div>
          <app-bookmark-panel [bookmarks]="store.bookmarks()" [grid]="true" [editable]="true" />
        </section>
      </div>
    </div>
  `,
})
export class DashboardPage {
  protected readonly store = inject(MariStoreService);
  protected readonly stats = computed(() => this.store.dashboardStats());
  protected readonly featuredDeck = computed(() => this.store.studyDecks()[0]);
}
