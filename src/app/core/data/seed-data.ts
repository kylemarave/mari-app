import {
  AppState,
  BookmarkLink,
  CourseAccent,
  NavItem,
  ScheduleEntry,
} from '../models/mari.models';

function scheduleDate(day: number): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${dayStr}`;
}

function buildSeedScheduleEntries(): ScheduleEntry[] {
  const today = new Date().getDate();
  return [
    {
      id: 's1',
      date: scheduleDate(today),
      time: '9:00',
      title: 'MATH 101',
      location: 'G204',
      accent: 'violet',
    },
    {
      id: 's2',
      date: scheduleDate(today),
      time: '11:00',
      title: 'CHEM 10',
      location: 'Lab',
      accent: 'teal',
    },
    {
      id: 's3',
      date: scheduleDate(today),
      time: '14:00',
      title: 'ENG 201',
      location: 'R102',
      accent: 'coral',
    },
    {
      id: 's4',
      date: scheduleDate(Math.max(1, today - 1)),
      time: '10:00',
      title: 'Office hours',
      location: 'Faculty hall',
      accent: 'amber',
    },
    {
      id: 's5',
      date: scheduleDate(Math.min(28, today + 2)),
      time: '13:00',
      title: 'Group study',
      location: 'Library',
      accent: 'sage',
    },
    {
      id: 's6',
      date: scheduleDate(Math.min(28, today + 5)),
      time: '15:30',
      title: 'CS Lab',
      location: 'B201',
      accent: 'violet',
    },
  ];
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', mobileLabel: 'Home', icon: 'dashboard' },
  { path: '/courses', label: 'Courses', mobileLabel: 'Courses', icon: 'courses' },
  { path: '/schedule', label: 'Schedule', mobileLabel: 'Schedule', icon: 'schedule' },
  { path: '/tasks', label: 'Tasks', mobileLabel: 'Tasks', icon: 'tasks', desktopOnly: true },
  {
    path: '/pomodoro',
    label: 'Pomodoro',
    mobileLabel: 'Focus',
    icon: 'pomodoro',
    desktopOnly: true,
  },
  { path: '/study-sets', label: 'Study Sets', mobileLabel: 'Study', icon: 'study-sets' },
];

export const SEED_STATE: AppState = {
  student: {
    initials: 'MA',
    name: 'Maria Reign',
    shortName: 'Maria .',
    university: 'PUP',
    program: 'BSFT-1A',
    gpa: 3.72,
  },
  countdown: {
    label: 'Calculus Exam — 3 days left',
    daysLeft: 3,
    progress: 68,
  },
  tasks: [
    {
      id: 't1',
      title: 'Read Ch.4',
      done: true,
      status: 'done',
      priority: 'done',
      course: 'ENG 201',
    },
    {
      id: 't2',
      title: 'Lab Report',
      done: false,
      status: 'todo',
      priority: 'high',
      deadline: 'Mon · CHEM 10',
      subtasks: [
        { id: 's1', title: 'Write introduction', done: false },
        { id: 's2', title: 'Compile data tables', done: false },
        { id: 's3', title: 'Proofread conclusion', done: false },
      ],
    },
    {
      id: 't3',
      title: 'Essay draft',
      done: false,
      status: 'in-progress',
      priority: 'medium',
      deadline: 'Wed · ENG 201',
    },
    {
      id: 't4',
      title: 'Problem set 7',
      done: false,
      status: 'todo',
      priority: 'low',
      deadline: 'Fri · MATH 101',
    },
    {
      id: 't5',
      title: 'Read Ch.7',
      done: false,
      status: 'todo',
      priority: 'medium',
      deadline: 'Tue · MATH 101',
    },
    {
      id: 't6',
      title: 'Midterm prep',
      done: true,
      status: 'done',
      priority: 'done',
      course: 'MATH 101',
    },
  ],
  courses: [
    { id: 'math', title: 'Mathematics', professor: 'Dr. Reyes', fileCount: 3, accent: 'violet' },
    { id: 'chem', title: 'Chemistry', professor: 'Prof. Lim', fileCount: 2, accent: 'teal' },
    { id: 'eng', title: 'English Lit', professor: 'Dr. Cruz', fileCount: 1, accent: 'coral' },
    { id: 'physics', title: 'Physics', professor: 'Prof. Tan', fileCount: 2, accent: 'amber' },
  ],
  courseFiles: {
    math: [
      { id: 'f1', name: 'Calculus_Notes_Ch7.pdf', type: 'PDF', date: 'Jun 12', size: '2.4 MB' },
      { id: 'f2', name: 'Problem_Set_7.docx', type: 'DOCX', date: 'Jun 10', size: '840 KB' },
      { id: 'f3', name: 'Exam_Review.pptx', type: 'PPTX', date: 'Jun 8', size: '5.1 MB' },
    ],
    chem: [
      { id: 'f4', name: 'Lab_Report_Template.pdf', type: 'PDF', date: 'Jun 11', size: '1.2 MB' },
      { id: 'f5', name: 'Periodic_Table.png', type: 'PNG', date: 'Jun 9', size: '320 KB' },
    ],
    eng: [{ id: 'f6', name: 'Essay_Rubric.pdf', type: 'PDF', date: 'Jun 13', size: '560 KB' }],
    physics: [
      { id: 'f7', name: 'Thermodynamics_Slides.pdf', type: 'PDF', date: 'Jun 14', size: '3.8 MB' },
      { id: 'f8', name: 'Formula_Sheet.pdf', type: 'PDF', date: 'Jun 7', size: '420 KB' },
    ],
  },
  bookmarks: [
    {
      id: 'b1',
      title: 'Khan Academy — Calculus',
      url: 'khanacademy.org/math/calculus',
      category: 'Reference',
      favicon: 'KA',
      courseId: 'math',
    },
    {
      id: 'b2',
      title: 'UST Student Portal',
      url: 'ust.edu.ph/students',
      category: 'Portal',
      favicon: 'UST',
    },
    {
      id: 'b3',
      title: 'ChemDraw Web',
      url: 'chemdraw.com/editor',
      category: 'Tools',
      favicon: 'CD',
      courseId: 'chem',
    },
    {
      id: 'b4',
      title: 'Purdue OWL Writing Lab',
      url: 'owl.purdue.edu',
      category: 'Writing',
      favicon: 'OW',
      courseId: 'eng',
    },
  ],
  scheduleEntries: buildSeedScheduleEntries(),
  studyDecks: [
    {
      id: 'thermo',
      title: 'Thermodynamics',
      learned: 0,
      cards: [
        {
          id: 'c1',
          question: 'What is Entropy?',
          answer: 'Entropy is a measure of disorder or randomness in a thermodynamic system.',
        },
        {
          id: 'c2',
          question: 'State the First Law of Thermodynamics',
          answer: 'Energy cannot be created or destroyed. ΔU = Q − W.',
        },
        {
          id: 'c3',
          question: 'Define Enthalpy (H)',
          answer: 'H = U + PV — total heat content at constant pressure.',
        },
      ],
    },
    {
      id: 'calc',
      title: 'Calculus Integrals',
      learned: 0,
      cards: [
        {
          id: 'c4',
          question: 'What is integration by parts?',
          answer: '∫u dv = uv − ∫v du',
        },
        {
          id: 'c5',
          question: 'Fundamental Theorem of Calculus',
          answer: 'If F′ = f, then ∫ₐᵇ f(x)dx = F(b) − F(a).',
        },
      ],
    },
  ],
};

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}
