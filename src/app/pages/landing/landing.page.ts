import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
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
  LucideZap,
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
    LucideZap,
  ],
  template: `
    <!-- Hero -->
    <section class="mari-landing-hero mari-public-section !pb-10 pt-8 sm:!pb-14 sm:pt-10 lg:pt-14">
      <div class="mari-landing-blob mari-landing-blob-1" aria-hidden="true"></div>
      <div class="mari-landing-blob mari-landing-blob-2" aria-hidden="true"></div>
      <div class="mari-landing-blob mari-landing-blob-3" aria-hidden="true"></div>

      <div class="mari-public-container relative z-10">
        <div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <div class="text-center lg:text-left">
            <span
              class="mari-landing-enter mari-chip bg-mari-bg/90 text-mari-primary-dark ring-1 ring-mari-primary-muted/40"
            >
              <svg lucideSparkles [size]="12"></svg>
              Your semester, sorted ✨
            </span>

            <h1
              class="mari-landing-enter mari-landing-enter-delay-1 mt-5 text-3xl font-bold tracking-tight text-mari-text sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12] xl:text-[3.25rem]"
            >
              Study smarter.<br />
              Crush
              <span class="mari-landing-gradient-text">{{ rotatingWord() }}</span>
            </h1>

            <p
              class="mari-landing-enter mari-landing-enter-delay-2 mt-4 text-sm leading-relaxed text-mari-text-secondary sm:text-base lg:max-w-md"
            >
              Tasks, flashcards, schedules, and course files — all in one cozy workspace built
              for late-night study sessions and early-morning lectures.
            </p>

            <div
              class="mari-landing-enter mari-landing-enter-delay-3 mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              <a
                routerLink="/signup"
                class="mari-btn-primary group !px-6 !py-3 !text-sm shadow-md transition-transform hover:scale-[1.02]"
              >
                <svg lucideGraduationCap [size]="16"></svg>
                Start free — no card needed
                <svg
                  lucideArrowRight
                  [size]="15"
                  class="transition-transform group-hover:translate-x-0.5"
                ></svg>
              </a>
              <a routerLink="/pricing" class="mari-btn-secondary !px-5 !py-3 !text-sm">
                See pricing
              </a>
            </div>

            <div
              class="mari-landing-enter mari-landing-enter-delay-4 mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              @for (pill of trustPills; track pill.label) {
                <span
                  class="inline-flex items-center gap-1.5 rounded-full border border-mari-border/80 bg-mari-bg/80 px-3 py-1 text-xs font-medium text-mari-text-secondary backdrop-blur-sm"
                >
                  <span>{{ pill.emoji }}</span>
                  {{ pill.label }}
                </span>
              }
            </div>
          </div>

          <!-- Product preview -->
          <div class="mari-landing-enter mari-landing-enter-delay-2 relative min-w-0">
            <span
              class="mari-landing-sticker mari-landing-sticker-1"
              aria-hidden="true"
              style="--landing-rotate: 8deg"
              >📚</span
            >
            <span
              class="mari-landing-sticker mari-landing-sticker-2"
              aria-hidden="true"
              style="--landing-rotate: -12deg"
              >☕</span
            >
            <span
              class="mari-landing-sticker mari-landing-sticker-3"
              aria-hidden="true"
              style="--landing-rotate: 6deg"
              >🎯</span
            >

            <div class="mari-landing-frame-float mari-product-frame">
              <div class="mari-product-frame-chrome bg-mari-bg-secondary/50">
                <span class="size-2.5 rounded-full bg-accent-coral/80"></span>
                <span class="size-2.5 rounded-full bg-accent-amber/80"></span>
                <span class="size-2.5 rounded-full bg-accent-teal/80"></span>
                <span class="ml-2 text-[10px] font-medium text-mari-text-tertiary"
                  >mari — your dashboard</span
                >
              </div>
              <div class="bg-mari-bg-secondary/30 p-4 sm:p-5">
                <div class="mb-3 flex items-center justify-between">
                  <p class="text-xs font-semibold text-mari-text">
                    Hey, Alex 👋 <span class="font-normal text-mari-text-tertiary">· 3 due today</span>
                  </p>
                  <span
                    class="mari-chip bg-accent-coral-bg text-accent-coral-text animate-pulse"
                    >Exam in 4 days</span
                  >
                </div>
                <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  @for (stat of previewStats; track stat.label) {
                    <div class="mari-stat mari-landing-stat-pop !p-3 text-left">
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
                    <p class="text-xs text-accent-coral-text">High priority 🔥</p>
                  </div>
                  <div class="mari-landing-flashcard">
                    <p class="text-[10px] font-semibold text-mari-primary-dark">Flashcard</p>
                    <p class="mt-1 text-xs font-bold text-mari-text">What is mitosis?</p>
                    <p class="mt-1 text-[10px] text-mari-text-tertiary">Tap to flip →</p>
                  </div>
                  <div class="mari-surface !p-3 text-left">
                    <p class="text-[10px] font-semibold uppercase text-mari-text-tertiary">
                      Next up
                    </p>
                    <p class="mt-1 text-xs font-medium text-mari-text">CHEM 10 · 11:00</p>
                    <p class="text-xs text-mari-text-tertiary">Lab room B</p>
                  </div>
                </div>
                <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-mari-bg">
                  <div
                    class="mari-landing-progress-bar h-full rounded-full bg-gradient-to-r from-accent-teal to-mari-primary"
                    style="width: 68%"
                  ></div>
                </div>
              </div>
            </div>
            <p class="mt-4 text-center text-xs text-mari-text-tertiary lg:text-left">
              This is the real app —
              <a routerLink="/signup" class="font-semibold text-mari-primary hover:underline"
                >jump in free</a
              >
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Marquee -->
    <section class="overflow-hidden border-b border-mari-border/60 bg-mari-bg/70 py-4" aria-hidden="true">
      <div class="mari-landing-marquee-track">
        @for (item of marqueeItems; track $index) {
          <span class="mari-landing-marquee-item">
            <span>{{ item.emoji }}</span>
            {{ item.text }}
          </span>
        }
        @for (item of marqueeItems; track $index) {
          <span class="mari-landing-marquee-item">
            <span>{{ item.emoji }}</span>
            {{ item.text }}
          </span>
        }
      </div>
    </section>

    <!-- Spotlights -->
    @for (spotlight of spotlights; track spotlight.title; let i = $index; let odd = $odd) {
      <section
        class="mari-public-section"
        [class.bg-mari-bg/60]="odd"
        [attr.data-reveal]="''"
      >
        <div
          class="mari-public-container grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
          [class.lg:[direction:rtl]]="odd"
        >
          <div
            class="mari-landing-reveal text-center lg:text-left"
            [class.lg:[direction:ltr]]="odd"
            [class.mari-landing-reveal-delay-1]="true"
          >
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
            <h2 class="text-xl font-bold text-mari-text sm:text-2xl lg:text-3xl">
              {{ spotlight.title }}
            </h2>
            <p class="mt-3 text-sm leading-relaxed text-mari-text-secondary sm:text-base">
              {{ spotlight.description }}
            </p>
            <a
              [routerLink]="spotlight.link"
              class="mari-link-action mt-5 inline-flex items-center gap-1 text-sm font-semibold"
            >
              Try {{ spotlight.tab }}
              <svg lucideArrowRight [size]="14"></svg>
            </a>
          </div>

          <div
            class="mari-landing-reveal mari-landing-spotlight-panel"
            [class.lg:[direction:ltr]]="odd"
            [class.mari-landing-reveal-delay-2]="true"
            [style.--spotlight-glow]="spotlight.glow"
          >
            @switch (spotlight.icon) {
              @case ('sparkles') {
                <div class="relative space-y-2">
                  <div
                    class="rounded-[12px] border-2 border-dashed border-mari-primary-muted/60 bg-mari-primary-light/40 px-4 py-7 text-center transition-colors hover:border-mari-primary/50 hover:bg-mari-primary-light/60"
                  >
                    <svg lucideBookOpen [size]="28" class="mx-auto text-mari-primary"></svg>
                    <p class="mt-2 text-sm font-semibold text-mari-text">Drop your lecture PDF</p>
                    <p class="text-xs text-mari-text-tertiary">AI builds your deck in seconds ⚡</p>
                  </div>
                  @for (card of flashcardPreview; track card; let ci = $index) {
                    <div
                      class="rounded-[10px] border border-mari-border bg-mari-bg px-3 py-2.5 text-sm text-mari-text-secondary transition-transform hover:-translate-y-0.5"
                      [style.animation-delay]="ci * 150 + 'ms'"
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
                          class="mari-landing-kanban-card mb-1.5 cursor-default rounded-[8px] bg-mari-bg px-2 py-1.5 text-xs text-mari-text transition-shadow last:mb-0 hover:shadow-sm"
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
                      class="mari-landing-course-tile flex cursor-default flex-col items-center gap-1.5 rounded-[12px] border border-mari-border/80 p-3"
                      [class]="course.bg"
                    >
                      <span class="text-2xl">{{ course.emoji }}</span>
                      <span class="text-xs font-bold" [class]="course.text">{{ course.code }}</span>
                    </div>
                  }
                </div>
              }
              @case ('timer') {
                <div class="flex flex-col items-center py-4 text-center">
                  <div
                    class="mari-landing-pomodoro-ring flex size-32 items-center justify-center rounded-full border-[5px] border-mari-primary-light bg-mari-bg text-4xl font-bold tabular-nums text-mari-primary"
                  >
                    25:00
                  </div>
                  <p class="mt-4 flex items-center gap-1.5 text-sm font-semibold text-mari-text">
                    <svg lucideZap [size]="14" class="text-accent-amber"></svg>
                    Focus session
                  </p>
                  <p class="text-xs text-mari-text-tertiary">One chapter. One sprint. Zero doom-scrolling.</p>
                </div>
              }
            }
          </div>
        </div>
      </section>
    }

    <!-- Features bento -->
    <section class="mari-public-section" [attr.data-reveal]="''">
      <div class="mari-public-container">
        <div class="mari-landing-reveal mx-auto max-w-2xl text-center lg:max-w-3xl">
          <span class="mari-chip bg-mari-primary-light text-mari-primary-dark mb-3">
            <svg lucideLayoutGrid [size]="11"></svg>
            All-in-one
          </span>
          <h2 class="text-xl font-bold text-mari-text sm:text-2xl lg:text-3xl">
            Everything in one place
          </h2>
          <p class="mt-2 text-sm text-mari-text-secondary sm:text-base">
            Like Notion meets Quizlet — but actually built for how you move through a school week.
          </p>
        </div>

        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (feature of features; track feature.title; let fi = $index) {
            <a
              [routerLink]="feature.link"
              class="mari-landing-reveal mari-landing-feature-card group block"
              [class.mari-landing-reveal-delay-1]="fi % 3 === 1"
              [class.mari-landing-reveal-delay-2]="fi % 3 === 2"
            >
              <span
                class="relative mari-section-icon mb-3 transition-transform duration-300 group-hover:scale-110"
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
              <h3 class="relative text-sm font-bold text-mari-text group-hover:text-mari-primary-dark">
                {{ feature.title }}
              </h3>
              <p class="relative mt-1.5 text-xs leading-relaxed text-mari-text-secondary">
                {{ feature.description }}
              </p>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- Benefits -->
    <section class="mari-public-section bg-mari-bg/60" [attr.data-reveal]="''">
      <div class="mari-public-container">
        <div class="mari-landing-reveal mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 class="text-xl font-bold text-mari-text sm:text-2xl lg:text-3xl">
            Made for real student life
          </h2>
          <p class="mt-2 text-sm text-mari-text-secondary sm:text-base">
            Less app-hopping. More actually studying (and maybe sleeping).
          </p>
        </div>
        <div class="mt-8 grid gap-4 sm:grid-cols-3">
          @for (benefit of benefits; track benefit.title; let bi = $index) {
            <div
              class="mari-landing-reveal mari-landing-benefit"
              [class.mari-landing-reveal-delay-1]="bi === 1"
              [class.mari-landing-reveal-delay-2]="bi === 2"
            >
              <span class="mari-landing-benefit-emoji" [style.animation-delay]="bi * 0.5 + 's'">{{
                benefit.emoji
              }}</span>
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
    <section class="mari-public-section pb-20" [attr.data-reveal]="''">
      <div class="mari-public-container">
        <div class="mari-landing-reveal mari-landing-cta mx-auto max-w-xl sm:max-w-2xl">
          <span class="text-3xl" aria-hidden="true">🚀</span>
          <h2 class="mt-3 text-xl font-bold text-mari-text sm:text-2xl lg:text-3xl">
            Your best semester starts now
          </h2>
          <p class="mx-auto mt-3 max-w-md text-sm text-mari-text-secondary sm:text-base">
            Sign up in seconds. Your dashboard, tasks, and study sets are ready the moment you log in.
          </p>
          <div class="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              routerLink="/signup"
              class="mari-btn-primary group !px-6 !py-3 !text-sm shadow-md transition-transform hover:scale-[1.02]"
            >
              Get started free
              <svg
                lucideArrowRight
                [size]="16"
                class="transition-transform group-hover:translate-x-0.5"
              ></svg>
            </a>
            <a routerLink="/pricing" class="mari-btn-secondary !px-5 !py-3 !text-sm">
              Compare plans
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class LandingPage {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly rotatingWord = signal('every class');
  private readonly rotatingWords = ['every class', 'exam week', 'group projects', 'deadline season'];

  protected readonly trustPills = [
    { emoji: '🆓', label: 'Free to start' },
    { emoji: '⚡', label: 'Sign up in 30 sec' },
    { emoji: '🔒', label: 'Your data stays yours' },
  ];

  protected readonly marqueeItems = [
    { emoji: '📐', text: 'MATH 201 — problem set due Friday' },
    { emoji: '🧪', text: 'CHEM lab report — high priority' },
    { emoji: '💻', text: 'CS project — 3 tasks on board' },
    { emoji: '📝', text: 'ENG essay — flashcards ready' },
    { emoji: '🧬', text: 'BIO midterm — 4 days left' },
    { emoji: '☕', text: 'Pomodoro streak — 5 sessions today' },
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
    { name: 'Done', tasks: ['Quiz prep ✓'] },
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
      glow: 'rgb(83 74 183 / 0.25)',
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
      glow: 'rgb(186 117 23 / 0.2)',
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
      glow: 'rgb(12 68 124 / 0.15)',
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
      glow: 'rgb(29 158 117 / 0.2)',
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
      description: 'Drag tasks To do → Done on your board.',
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

  constructor() {
    afterNextRender(() => {
      this.setupScrollReveal();
      this.setupWordRotation();
    });
  }

  private setupScrollReveal(): void {
    const root = this.host.nativeElement as HTMLElement;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reveals = Array.from(root.querySelectorAll('.mari-landing-reveal'));

    if (prefersReduced) {
      reveals.forEach((el: Element) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    reveals.forEach((el: Element) => observer.observe(el));
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private setupWordRotation(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let index = 0;
    const interval = window.setInterval(() => {
      index = (index + 1) % this.rotatingWords.length;
      this.rotatingWord.set(this.rotatingWords[index]);
    }, 2800);

    this.destroyRef.onDestroy(() => window.clearInterval(interval));
  }
}
