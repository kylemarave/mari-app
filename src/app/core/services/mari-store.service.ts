    import { computed, Injectable, inject, signal } from '@angular/core';
import { createId, SEED_STATE } from '../data/seed-data';
import {
  AppState,
  BookmarkLink,
  KanbanColumn,
  StudentProfile,
  TaskItem,
  TaskPriority,
  TaskStatus,
  StudyDeck,
  ScheduleEntry,
  ScheduleBlock,
  CourseAccent,
  CourseFile,
  CourseFolder,
  CountdownEvent,
} from '../models/mari.models';
import { CourseFileStorageService } from './course-file-storage.service';

const STORAGE_KEY = 'mari-app-state';

@Injectable({ providedIn: 'root' })
export class MariStoreService {
  private readonly state = signal<AppState>(this.loadState());
  private readonly fileStorage = inject(CourseFileStorageService);

  readonly student = computed(() => this.state().student);
  readonly countdown = computed(() => this.state().countdown);
  readonly tasks = computed(() => this.state().tasks);
  readonly courses = computed(() => this.syncCourseFileCounts(this.state().courses));
  readonly courseFiles = computed(() => this.state().courseFiles);
  readonly bookmarks = computed(() => this.state().bookmarks);
  readonly scheduleEntries = computed(() => this.state().scheduleEntries ?? []);
  readonly scheduleBlocks = computed(() => this.entriesForDate(this.todayIso()));
  readonly studyDecks = computed(() => this.state().studyDecks);

  readonly kanbanColumns = computed((): KanbanColumn[] => {
    const tasks = this.tasks();
    const todo = tasks.filter((t) => t.status === 'todo' && !t.done);
    const inProgress = tasks.filter((t) => t.status === 'in-progress' && !t.done);
    const done = tasks.filter((t) => t.done || t.status === 'done');

    return [
      {
        id: 'todo',
        title: `To-do (${todo.length})`,
        accent: 'amber',
        tasks: todo.map((t) => ({ id: t.id, title: t.title })),
      },
      {
        id: 'progress',
        title: 'In progress',
        accent: 'blue',
        tasks: inProgress.map((t) => ({ id: t.id, title: t.title })),
      },
      {
        id: 'done',
        title: 'Done',
        accent: 'teal',
        tasks: done.map((t) => ({ id: t.id, title: t.title })),
      },
    ];
  });

  readonly activeTasks = computed(() => this.tasks().filter((t) => !t.done));

  readonly highPriorityTasks = computed(() =>
    this.activeTasks().filter((t) => t.priority === 'high'),
  );

  readonly dashboardStats = computed(() => {
    const active = this.activeTasks();
    const decks = this.studyDecks();
    const totalCards = decks.reduce((n, d) => n + d.cards.length, 0);
    const learnedCards = decks.reduce((n, d) => n + d.learned, 0);
    const nextClass = this.scheduleBlocks()[0];

    return {
      tasksDue: active.length,
      urgent: this.highPriorityTasks().length,
      gpa: this.student().gpa,
      studyProgress: totalCards ? Math.round((learnedCards / totalCards) * 100) : 0,
      nextClass: nextClass ? `${nextClass.title} · ${nextClass.time}` : 'No class today',
      coursesCount: this.courses().length,
    };
  });

  getCourse(id: string) {
    return this.courses().find((c) => c.id === id);
  }

  getCourseFiles(courseId: string) {
    return this.courseFiles()[courseId] ?? [];
  }

  getBookmarksForCourse(courseId: string) {
    return this.bookmarks().filter((b) => !b.courseId || b.courseId === courseId);
  }

  getDeck(id: string) {
    return this.studyDecks().find((d) => d.id === id);
  }

  updateStudent(profile: Partial<StudentProfile>): void {
    this.patch({ student: { ...this.state().student, ...profile } });
  }

  toggleTask(taskId: string): void {
    const tasks = this.state().tasks.map((task) => {
      if (task.id !== taskId) return task;
      const done = !task.done;
      return {
        ...task,
        done,
        status: done ? ('done' as TaskStatus) : task.status === 'done' ? 'todo' : task.status,
        priority: done ? ('done' as TaskPriority) : task.priority === 'done' ? 'medium' : task.priority,
      };
    });
    this.patch({ tasks });
  }

  toggleSubtask(taskId: string, subtaskId: string): void {
    const tasks = this.state().tasks.map((task) => {
      if (task.id !== taskId || !task.subtasks) return task;
      return {
        ...task,
        subtasks: task.subtasks.map((sub) =>
          sub.id === subtaskId ? { ...sub, done: !sub.done } : sub,
        ),
      };
    });
    this.patch({ tasks });
  }

  addSubtask(taskId: string, title: string): void {
    const trimmed = title.trim();
    if (!trimmed) return;

    const tasks = this.state().tasks.map((task) => {
      if (task.id !== taskId) return task;
      const subtasks = task.subtasks ?? [];
      return {
        ...task,
        subtasks: [...subtasks, { id: createId('st'), title: trimmed, done: false }],
      };
    });
    this.patch({ tasks });
  }

  addTask(title: string, priority: TaskPriority = 'medium'): void {
    const task: TaskItem = {
      id: createId('t'),
      title,
      done: false,
      status: 'todo',
      priority,
    };
    this.patch({ tasks: [...this.state().tasks, task] });
  }

  deleteTask(taskId: string): void {
    this.patch({ tasks: this.state().tasks.filter((t) => t.id !== taskId) });
  }

  updateTaskStatus(taskId: string, status: TaskStatus): void {
    const tasks = this.state().tasks.map((task) => {
      if (task.id !== taskId) return task;
      const done = status === 'done';
      return {
        ...task,
        status,
        done,
        priority: done ? ('done' as TaskPriority) : task.priority === 'done' ? 'medium' : task.priority,
      };
    });
    this.patch({ tasks });
  }

  advanceTaskStatus(taskId: string): void {
    const task = this.state().tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (task.done || task.status === 'done') {
      this.updateTaskStatus(taskId, 'todo');
      return;
    }
    if (task.status === 'todo') {
      this.updateTaskStatus(taskId, 'in-progress');
      return;
    }
    if (task.status === 'in-progress') {
      this.updateTaskStatus(taskId, 'done');
    }
  }

  deleteBookmark(bookmarkId: string): void {
    this.patch({ bookmarks: this.state().bookmarks.filter((b) => b.id !== bookmarkId) });
  }

  updateCountdown(countdown: Partial<CountdownEvent>): void {
    this.patch({ countdown: { ...this.state().countdown, ...countdown } });
  }

  addBookmark(link: Omit<BookmarkLink, 'id'>): void {
    this.patch({
      bookmarks: [...this.state().bookmarks, { ...link, id: createId('b') }],
    });
  }

  addCourse(course: Omit<CourseFolder, 'id' | 'fileCount'>): CourseFolder {
    const newCourse: CourseFolder = {
      ...course,
      id: createId('course'),
      fileCount: 0,
    };
    this.patch({
      courses: [...this.state().courses, newCourse],
      courseFiles: { ...this.state().courseFiles, [newCourse.id]: [] },
    });
    return newCourse;
  }

  updateCourse(courseId: string, patch: Partial<Omit<CourseFolder, 'id' | 'fileCount'>>): void {
    const courses = this.state().courses.map((course) =>
      course.id === courseId ? { ...course, ...patch } : course,
    );
    this.patch({ courses });
  }

  deleteCourse(courseId: string): void {
    const fileIds = (this.state().courseFiles[courseId] ?? []).map((file) => file.id);
    void this.fileStorage.deleteBlobs(fileIds);

    const { [courseId]: _removed, ...remainingFiles } = this.state().courseFiles;
    this.patch({
      courses: this.state().courses.filter((course) => course.id !== courseId),
      courseFiles: remainingFiles,
      bookmarks: this.state().bookmarks.filter((bookmark) => bookmark.courseId !== courseId),
    });
  }

  addCourseFile(courseId: string, file: CourseFile): void {
    const existing = this.state().courseFiles[courseId] ?? [];
    this.patch({
      courseFiles: {
        ...this.state().courseFiles,
        [courseId]: [...existing, file],
      },
    });
  }

  deleteCourseFile(courseId: string, fileId: string): void {
    void this.fileStorage.deleteBlob(fileId);
    const existing = this.state().courseFiles[courseId] ?? [];
    this.patch({
      courseFiles: {
        ...this.state().courseFiles,
        [courseId]: existing.filter((file) => file.id !== fileId),
      },
    });
  }

  recordCardLearned(deckId: string): void {
    const studyDecks = this.state().studyDecks.map((deck) => {
      if (deck.id !== deckId) return deck;
      const learned = Math.min(deck.learned + 1, deck.cards.length);
      return { ...deck, learned };
    });
    this.patch({ studyDecks });
  }

  addStudyDeck(deck: Omit<StudyDeck, 'id' | 'learned'> & { id?: string; learned?: number }): StudyDeck {
    const newDeck: StudyDeck = {
      id: deck.id ?? createId('deck'),
      title: deck.title,
      cards: deck.cards,
      learned: deck.learned ?? 0,
      sourceFile: deck.sourceFile,
    };
    this.patch({ studyDecks: [...this.state().studyDecks, newDeck] });
    return newDeck;
  }

  deleteStudyDeck(deckId: string): void {
    this.patch({ studyDecks: this.state().studyDecks.filter((deck) => deck.id !== deckId) });
  }

  entriesForDate(date: string): ScheduleEntry[] {
    return this.scheduleEntries()
      .filter((entry) => entry.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  entriesForMonth(year: number, month: number): ScheduleEntry[] {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return this.scheduleEntries().filter((entry) => entry.date.startsWith(prefix));
  }

  addScheduleEntry(
    entry: Omit<ScheduleEntry, 'id'>,
  ): ScheduleEntry {
    const newEntry: ScheduleEntry = { ...entry, id: createId('sch') };
    this.patch({ scheduleEntries: [...this.scheduleEntries(), newEntry] });
    return newEntry;
  }

  deleteScheduleEntry(entryId: string): void {
    this.patch({
      scheduleEntries: this.scheduleEntries().filter((entry) => entry.id !== entryId),
    });
  }

  todayIso(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  resetProgress(): void {
    this.patch(SEED_STATE);
  }

  private patch(partial: Partial<AppState>): void {
    const next = { ...this.state(), ...partial };
    this.state.set(next);
    this.persist(next);
  }

  private syncCourseFileCounts(courses: AppState['courses']) {
    const files = this.state().courseFiles;
    return courses.map((course) => ({
      ...course,
      fileCount: (files[course.id] ?? []).length,
    }));
  }

  private loadState(): AppState {
    if (typeof localStorage === 'undefined') return structuredClone(SEED_STATE);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(SEED_STATE);
      const parsed = JSON.parse(raw) as Partial<AppState> & {
        scheduleBlocks?: ScheduleBlock[];
        calendarDays?: { day: number; dots: CourseAccent[] }[];
      };
      const merged = { ...structuredClone(SEED_STATE), ...parsed } as AppState;
      if (parsed.scheduleBlocks && !parsed.scheduleEntries) {
        merged.scheduleEntries = this.migrateLegacySchedule(parsed);
      } else if (!merged.scheduleEntries) {
        merged.scheduleEntries = structuredClone(SEED_STATE.scheduleEntries);
      }
      return merged;
    } catch {
      return structuredClone(SEED_STATE);
    }
  }

  private migrateLegacySchedule(
    parsed: Partial<AppState> & { scheduleBlocks?: ScheduleBlock[] },
  ): ScheduleEntry[] {
    const today = this.todayIso();
    const legacy = parsed.scheduleBlocks ?? [];
    if (!legacy.length) return structuredClone(SEED_STATE.scheduleEntries);
    return legacy.map((block, index) => ({
      id: createId(`sch-m${index}`),
      date: today,
      ...block,
    }));
  }

  private persist(state: AppState): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }
}
