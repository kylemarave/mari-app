import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBookOpen,
  LucideCalendar,
  LucideCheckSquare,
  LucideFolderOpen,
  LucideGraduationCap,
  LucideLayoutGrid,
  LucideSparkles,
  LucideTimer,
} from '@lucide/angular';

@Component({
  selector: 'app-landing-page',
  imports: [
    RouterLink,
    LucideSparkles,
    LucideArrowRight,
    LucideCheckSquare,
    LucideFolderOpen,
    LucideCalendar,
    LucideTimer,
    LucideGraduationCap,
    LucideLayoutGrid,
    LucideBookOpen,
  ],
  template: `
    <!-- Hero — split layout fills width on desktop -->
    <section class="mari-public-hero-band mari-public-section !pb-12 pt-8 sm:!pb-14 sm:pt-10 lg:pt-12">
      <div class="mari-public-container">
        <div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <div class="text-center lg:text-left">
            <span
              class="mari-chip bg-mari-bg/90 text-mari-primary-dark ring-1 ring-mari-primary-muted/40"
            >
              <svg lucideSparkles [size]="12"></svg>
              Free student workspace
            </span>

            <h1
              class="mt-5 text-3xl font-bold tracking-tight text-mari-text sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15] xl:text-5xl"
            >
              Study smarter.<br />
              Stay on top of every class.
            </h1>

            <p class="mt-4 text-sm leading-relaxed text-mari-text-secondary sm:text-base lg:max-w-md">
              Mari brings your tasks, schedule, course files, and AI flashcards into one friendly
              dashboard — the same app you will use all semester.
            </p>

            <div class="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <a routerLink="/signup" class="mari-btn-primary !px-5 !py-2.5 !text-sm">
                <svg lucideGraduationCap [size]="16"></svg>
                Start studying free
                <svg lucideArrowRight [size]="15"></svg>
              </a>
              <a routerLink="/pricing" class="mari-btn-secondary !px-5 !py-2.5 !text-sm">
                See pricing
              </a>
            </div>

            <div class="mt-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              @for (pill of trustPills; track pill) {
                <span class="text-xs text-mari-text-tertiary">{{ pill }}</span>
                @if (!$last) {
                  <span class="text-mari-border-secondary">·</span>
                }
              }
            </div>
          </div>

          <!-- Product frame — uses full right column -->
          <div class="min-w-0">
            <div class="mari-product-frame">
              <div class="mari-product-frame-chrome bg-mari-bg-secondary/50">
                <span class="size-2.5 rounded-full bg-accent-coral/80"></span>
                <span class="size-2.5 rounded-full bg-accent-amber/80"></span>
                <span class="size-2.5 rounded-full bg-accent-teal/80"></span>
                <span class="ml-2 text-[10px] font-medium text-mari-text-tertiary"
                  >mari — dashboard</span
                >
              </div>
              <div class="bg-mari-bg-secondary/30 p-4 sm:p-5">
                <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  @for (stat of previewStats; track stat.label) {
                    <div class="mari-stat !p-3 text-left">
                      <div class="mari-stat-label">{{ stat.label }}</div>
                      <div class="mari-stat-value mt-0.5 text-base">{{ stat.value }}</div>
                    </div>
                  }
                </div>
                <div class="mt-3 grid gap-2 sm:grid-cols-3">
                  <div class="mari-surface !p-3 text-left">
                    <p class="text-[10px] font-semibold uppercase text-mari-text-tertiary">
                      Task board
                    </p>
                    <p class="mt-1 text-xs font-medium text-mari-text">Lab report · due tonight</p>
                    <p class="text-xs text-accent-coral-text">High priority</p>
                  </div>
                  <div
                    class="rounded-[10px] border border-mari-primary-muted/50 bg-gradient-to-br from-mari-primary-light to-mari-bg p-3 text-left"
                  >
                    <p class="text-[10px] font-semibold text-mari-primary-dark">Flashcard</p>
                    <p class="mt-1 text-xs font-bold text-mari-text">What is mitosis?</p>
                  </div>
                  <div class="mari-surface !p-3 text-left">
                    <p class="text-[10px] font-semibold uppercase text-mari-text-tertiary">
                      Next up
                    </p>
                    <p class="mt-1 text-xs font-medium text-mari-text">CHEM 10 · 11:00</p>
                    <p class="text-xs text-mari-text-tertiary">Lab room</p>
                  </div>
                </div>
              </div>
            </div>
            <p class="mt-3 text-center text-xs text-mari-text-tertiary lg:text-left">
              Same UI inside the app —
              <a routerLink="/signup" class="font-medium text-mari-primary hover:underline"
                >open workspace</a
              >
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Highlight features — alternating rows like Notion -->
    @for (spotlight of spotlights; track spotlight.title; let odd = $odd) {
      <section class="mari-public-section" [class.bg-mari-bg/60]="odd">
        <div
          class="mari-public-container grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
          [class.lg:[direction:rtl]]="odd"
        >
          <div class="text-center lg:text-left" [class.lg:[direction:ltr]]="odd">
            <span
              class="mari-section-icon mb-4 inline-flex"
              [class]="spotlight.iconBg + ' ' + spotlight.iconColor"
            >
              @switch (spotlight.icon) {
                @case ('sparkles') {
                  <svg lucideSparkles [size]="18"></svg>
                }
                @case ('check') {
                  <svg lucideCheckSquare [size]="18"></svg>
                }
                @case ('folder') {
                  <svg lucideFolderOpen [size]="18"></svg>
                }
                @case ('timer') {
                  <svg lucideTimer [size]="18"></svg>
                }
              }
            </span>
            <h2 class="text-xl font-bold text-mari-text sm:text-2xl">{{ spotlight.title }}</h2>
            <p class="mt-3 text-sm leading-relaxed text-mari-text-secondary sm:text-base">
              {{ spotlight.description }}
            </p>
            <a
              [routerLink]="spotlight.link"
              class="mari-link-action mt-4 inline-flex items-center gap-1 text-sm"
            >
              Open {{ spotlight.tab }}
              <svg lucideArrowRight [size]="14"></svg>
            </a>
          </div>

          <div class="mari-surface-elevated p-5 sm:p-6" [class.lg:[direction:ltr]]="odd">
            @switch (spotlight.icon) {
              @case ('sparkles') {
                <div class="space-y-2">
                  <div
                    class="rounded-[10px] border border-dashed border-mari-primary-muted/60 bg-mari-primary-light/30 px-4 py-6 text-center"
                  >
                    <svg lucideBookOpen [size]="24" class="mx-auto text-mari-primary"></svg>
                    <p class="mt-2 text-sm font-medium text-mari-text">Drop lecture PDF here</p>
                    <p class="text-xs text-mari-text-tertiary">AI builds your deck in seconds</p>
                  </div>
                  @for (card of flashcardPreview; track card) {
                    <div
                      class="rounded-[10px] border border-mari-border bg-mari-bg px-3 py-2 text-sm text-mari-text-secondary"
                    >
                      {{ card }}
                    </div>
                  }
                </div>
              }
              @case ('check') {
                <div class="grid grid-cols-3 gap-2">
                  @for (col of kanbanPreview; track col.name) {
                    <div class="rounded-[10px] bg-mari-bg-secondary/80 p-2">
                      <p class="mb-2 text-[10px] font-bold uppercase text-mari-text-tertiary">
                        {{ col.name }}
                      </p>
                      @for (task of col.tasks; track task) {
                        <div
                          class="mb-1.5 rounded-[8px] bg-mari-bg px-2 py-1.5 text-xs text-mari-text last:mb-0"
                        >
                          {{ task }}
                        </div>
                      }
                    </div>
                  }
                </div>
              }
              @case ('folder') {
                <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  @for (course of previewCourses; track course.code) {
                    <div
                      class="flex flex-col items-center gap-1.5 rounded-[12px] border border-mari-border/80 p-3"
                      [class]="course.bg"
                    >
                      <span class="text-xl">{{ course.emoji }}</span>
                      <span class="text-xs font-bold" [class]="course.text">{{ course.code }}</span>
                    </div>
                  }
                </div>
              }
              @case ('timer') {
                <div class="flex flex-col items-center py-4 text-center">
                  <div
                    class="flex size-28 items-center justify-center rounded-full border-4 border-mari-primary-light bg-mari-bg text-3xl font-bold text-mari-primary"
                  >
                    25:00
                  </div>
                  <p class="mt-4 text-sm font-semibold text-mari-text">Focus session</p>
                  <p class="text-xs text-mari-text-tertiary">One chapter, one sprint, no distractions</p>
                </div>
              }
            }
          </div>
        </div>
      </section>
    }

    <!-- All features — compact 2×3 grid -->
    <section class="mari-public-section">
      <div class="mari-public-container">
        <div class="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 class="text-xl font-bold text-mari-text sm:text-2xl">Everything in one place</h2>
          <p class="mt-2 text-sm text-mari-text-secondary">
            Like Notion or Quizlet, but built around how you actually move through a school week.
          </p>
        </div>

        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (feature of features; track feature.title) {
            <a
              [routerLink]="feature.link"
              class="mari-surface group block p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span
                class="mari-section-icon mb-3"
                [class]="feature.iconBg + ' ' + feature.iconColor"
              >
                @switch (feature.icon) {
                  @case ('sparkles') {
                    <svg lucideSparkles [size]="14"></svg>
                  }
                  @case ('check') {
                    <svg lucideCheckSquare [size]="14"></svg>
                  }
                  @case ('folder') {
                    <svg lucideFolderOpen [size]="14"></svg>
                  }
                  @case ('timer') {
                    <svg lucideTimer [size]="14"></svg>
                  }
                  @case ('calendar') {
                    <svg lucideCalendar [size]="14"></svg>
                  }
                  @case ('grid') {
                    <svg lucideLayoutGrid [size]="14"></svg>
                  }
                }
              </span>
              <h3 class="text-sm font-bold text-mari-text group-hover:text-mari-primary-dark">
                {{ feature.title }}
              </h3>
              <p class="mt-1.5 text-xs leading-relaxed text-mari-text-secondary">
                {{ feature.description }}
              </p>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- Student benefits -->
    <section class="mari-public-section bg-mari-bg/60">
      <div class="mari-public-container">
        <div class="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 class="text-xl font-bold text-mari-text sm:text-2xl">Made for real student life</h2>
          <p class="mt-2 text-sm text-mari-text-secondary">
            Less juggling between apps. More time actually studying.
          </p>
        </div>
        <div class="mt-8 grid gap-4 sm:grid-cols-3">
          @for (benefit of benefits; track benefit.title) {
            <div class="mari-surface p-5 text-center sm:text-left">
              <span class="text-2xl">{{ benefit.emoji }}</span>
              <h3 class="mt-3 text-sm font-bold text-mari-text">{{ benefit.title }}</h3>
              <p class="mt-1.5 text-xs leading-relaxed text-mari-text-secondary">
                {{ benefit.description }}
              </p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="mari-public-section pb-20">
      <div class="mari-public-container">
        <div
          class="mx-auto max-w-xl rounded-2xl border border-mari-primary-muted/40 bg-gradient-to-br from-mari-primary-light via-mari-bg to-accent-teal-bg/30 px-6 py-10 text-center sm:max-w-2xl sm:px-10 sm:py-12"
        >
          <h2 class="text-xl font-bold text-mari-text sm:text-2xl">Your semester starts here</h2>
          <p class="mx-auto mt-3 max-w-md text-sm text-mari-text-secondary">
            Jump into your dashboard — tasks, courses, and study sets are ready after you sign up.
          </p>
          <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a routerLink="/signup" class="mari-btn-primary !px-5 !py-2.5 !text-sm">
              Get started free
              <svg lucideArrowRight [size]="16"></svg>
            </a>
            <a routerLink="/pricing" class="mari-btn-secondary !px-5 !py-2.5 !text-sm">
              Compare plans
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class LandingPage {
  protected readonly trustPills = [
    'Free to start',
    'Email sign-up',
    'Same UI as the app',
  ];

  protected readonly previewStats = [
    { label: 'Tasks due', value: '4' },
    { label: 'Next class', value: 'CHEM' },
    { label: 'Courses', value: '5' },
    { label: 'Study', value: '68%' },
  ];

  protected readonly flashcardPreview = [
    'Q: What is glycolysis?',
    'Q: Name the four phases of mitosis',
  ];

  protected readonly kanbanPreview = [
    { name: 'To do', tasks: ['Lab report', 'Read ch. 7'] },
    { name: 'Doing', tasks: ['Problem set'] },
    { name: 'Done', tasks: ['Quiz prep'] },
  ];

  protected readonly previewCourses = [
    { code: 'MATH', emoji: '📐', bg: 'bg-mari-primary-light/70', text: 'text-mari-primary-dark' },
    { code: 'CHEM', emoji: '🧪', bg: 'bg-accent-teal-bg/70', text: 'text-accent-teal-text' },
    { code: 'ENG', emoji: '📝', bg: 'bg-accent-coral-bg/70', text: 'text-accent-coral-text' },
    { code: 'CS', emoji: '💻', bg: 'bg-accent-blue-bg/70', text: 'text-accent-blue-text' },
    { code: 'BIO', emoji: '🧬', bg: 'bg-accent-sage-bg/70', text: 'text-accent-sage-text' },
    { code: 'HIST', emoji: '📜', bg: 'bg-accent-amber-bg/70', text: 'text-accent-amber-text' },
  ];

  protected readonly spotlights = [
    {
      icon: 'sparkles' as const,
      title: 'Turn PDFs into flashcards',
      tab: 'study sets',
      link: '/signup',
      description:
        'Upload a lecture slide deck and Mari builds a study set for you — like Quizlet, but from your actual class materials.',
      iconBg: 'bg-mari-primary-light',
      iconColor: 'text-mari-primary-dark',
    },
    {
      icon: 'check' as const,
      title: 'Track what is due',
      tab: 'tasks',
      link: '/signup',
      description:
        'A kanban board and schedule timeline so you always know what is due tonight and what class is next.',
      iconBg: 'bg-accent-amber-bg',
      iconColor: 'text-accent-amber-text',
    },
    {
      icon: 'folder' as const,
      title: 'Organize every course',
      tab: 'courses',
      link: '/signup',
      description:
        'Color-coded folders for files, bookmarks, and notes — one digital binder per class instead of scattered tabs.',
      iconBg: 'bg-accent-blue-bg',
      iconColor: 'text-accent-blue-text',
    },
    {
      icon: 'timer' as const,
      title: 'Focus when it counts',
      tab: 'pomodoro',
      link: '/signup',
      description:
        'Built-in pomodoro timer for study sprints before exams. Start from anywhere in the app.',
      iconBg: 'bg-accent-teal-bg',
      iconColor: 'text-accent-teal-text',
    },
  ];

  protected readonly benefits = [
    {
      emoji: '🎒',
      title: 'One app, not five',
      description: 'Tasks, calendar, files, flashcards, and focus — stop switching between tabs.',
    },
    {
      emoji: '📱',
      title: 'Phone or laptop',
      description: 'Bottom nav on mobile, full dashboard on desktop. Study on the bus or at your desk.',
    },
    {
      emoji: '🎯',
      title: 'Exam countdown',
      description: 'See days until your next big test right on the dashboard.',
    },
  ];

  protected readonly features = [
    {
      icon: 'sparkles' as const,
      title: 'AI study sets',
      link: '/signup',
      description: 'PDF → flashcards in seconds.',
      iconBg: 'bg-mari-primary-light',
      iconColor: 'text-mari-primary-dark',
    },
    {
      icon: 'grid' as const,
      title: 'Kanban tasks',
      link: '/signup',
      description: 'Click tasks To do → Done on your board.',
      iconBg: 'bg-accent-amber-bg',
      iconColor: 'text-accent-amber-text',
    },
    {
      icon: 'calendar' as const,
      title: 'Schedule',
      link: '/signup',
      description: 'Classes and deadlines on a timeline.',
      iconBg: 'bg-mari-primary-light',
      iconColor: 'text-mari-primary-dark',
    },
    {
      icon: 'folder' as const,
      title: 'Course folders',
      link: '/signup',
      description: 'Files and links per class.',
      iconBg: 'bg-accent-blue-bg',
      iconColor: 'text-accent-blue-text',
    },
    {
      icon: 'timer' as const,
      title: 'Pomodoro',
      link: '/signup',
      description: '25-min focus sprints built in.',
      iconBg: 'bg-accent-teal-bg',
      iconColor: 'text-accent-teal-text',
    },
    {
      icon: 'check' as const,
      title: 'Dashboard',
      link: '/signup',
      description: 'Your home base every morning.',
      iconBg: 'bg-accent-coral-bg',
      iconColor: 'text-accent-coral-text',
    },
  ];
}
