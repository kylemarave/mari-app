export type MariModule = 'dashboard' | 'courses' | 'schedule' | 'study-sets';

export type CourseAccent = 'violet' | 'teal' | 'coral' | 'amber' | 'sage';

export type TaskPriority = 'high' | 'medium' | 'low' | 'done';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type FileSort = 'name' | 'date' | 'type';

export type ScheduleView = 'schedule' | 'calendar';

export interface StudentProfile {
  initials: string;
  name: string;
  shortName: string;
  university: string;
  program: string;
  gpa: number;
}

export interface CountdownEvent {
  label: string;
  daysLeft: number;
  progress: number;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  done: boolean;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string;
  course?: string;
  subtasks?: Subtask[];
}

export type KanbanAccent = CourseAccent | 'blue';

export interface KanbanColumn {
  id: string;
  title: string;
  accent: KanbanAccent;
  tasks: string[];
}

export interface ScheduleBlock {
  time: string;
  title: string;
  location: string;
  accent: CourseAccent;
}

export interface ScheduleEntry {
  id: string;
  date: string;
  time: string;
  title: string;
  location: string;
  accent: CourseAccent;
}

export interface CourseFolder {
  id: string;
  title: string;
  professor: string;
  fileCount: number;
  accent: CourseAccent;
}

export interface CourseFile {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
}

export interface BookmarkLink {
  id: string;
  title: string;
  url: string;
  category: string;
  favicon: string;
  courseId?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface StudyDeck {
  id: string;
  title: string;
  cards: Flashcard[];
  learned: number;
  sourceFile?: string;
}

export interface CalendarDay {
  day: number;
  dots: CourseAccent[];
}

export interface NavItem {
  path: string;
  label: string;
  mobileLabel: string;
  icon: 'dashboard' | 'courses' | 'schedule' | 'study-sets' | 'tasks' | 'pomodoro';
  desktopOnly?: boolean;
}

export interface AppState {
  student: StudentProfile;
  countdown: CountdownEvent;
  tasks: TaskItem[];
  courses: CourseFolder[];
  courseFiles: Record<string, CourseFile[]>;
  bookmarks: BookmarkLink[];
  scheduleEntries: ScheduleEntry[];
  studyDecks: StudyDeck[];
}

export const ACCENT_STYLES: Record<
  CourseAccent,
  { card: string; text: string; bar: string; block: string }
> = {
  violet: {
    card: 'bg-mari-primary-light',
    text: 'text-mari-primary-dark',
    bar: 'bg-mari-primary',
    block: 'bg-mari-primary-light text-mari-primary-dark',
  },
  teal: {
    card: 'bg-accent-teal-bg',
    text: 'text-accent-teal-text',
    bar: 'bg-accent-teal',
    block: 'bg-accent-teal-bg text-accent-teal-text',
  },
  coral: {
    card: 'bg-accent-coral-bg',
    text: 'text-accent-coral-text',
    bar: 'bg-accent-coral',
    block: 'bg-accent-coral-bg text-accent-coral-text',
  },
  amber: {
    card: 'bg-accent-amber-bg',
    text: 'text-accent-amber-text',
    bar: 'bg-accent-amber',
    block: 'bg-accent-amber-bg text-accent-amber-text',
  },
  sage: {
    card: 'bg-accent-sage-bg',
    text: 'text-accent-sage-text',
    bar: 'bg-accent-sage',
    block: 'bg-accent-sage-bg text-accent-sage-text',
  },
};

export const PRIORITY_STYLES: Record<TaskPriority, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-accent-coral-bg', text: 'text-accent-coral-text', label: 'High' },
  medium: { bg: 'bg-accent-amber-bg', text: 'text-accent-amber-text', label: 'Medium' },
  low: { bg: 'bg-accent-teal-bg', text: 'text-accent-teal-text', label: 'Low' },
  done: { bg: 'bg-accent-teal-bg', text: 'text-accent-teal-text', label: 'Done' },
};
