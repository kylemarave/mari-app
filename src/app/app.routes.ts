import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./pages/courses/courses.page').then((m) => m.CoursesPage),
      },
      {
        path: 'courses/:courseId',
        loadComponent: () =>
          import('./pages/course-detail/course-detail.page').then((m) => m.CourseDetailPage),
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import('./pages/schedule/schedule.page').then((m) => m.SchedulePage),
      },
      {
        path: 'tasks',
        loadComponent: () => import('./pages/tasks/tasks.page').then((m) => m.TasksPage),
      },
      {
        path: 'pomodoro',
        loadComponent: () =>
          import('./pages/pomodoro/pomodoro.page').then((m) => m.PomodoroPage),
      },
      {
        path: 'study-sets',
        loadComponent: () =>
          import('./pages/study-sets/study-sets.page').then((m) => m.StudySetsPage),
      },
      {
        path: 'study-sets/:deckId',
        loadComponent: () =>
          import('./pages/study-session/study-session.page').then((m) => m.StudySessionPage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.page').then((m) => m.SettingsPage),
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
