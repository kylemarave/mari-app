import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { homeRedirectGuard } from './core/guards/home-redirect.guard';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        canActivate: [homeRedirectGuard],
        loadComponent: () =>
          import('./pages/landing/landing.page').then((m) => m.LandingPage),
      },
      {
        path: 'pricing',
        loadComponent: () =>
          import('./pages/pricing/pricing.page').then((m) => m.PricingPage),
      },
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'signup',
        canActivate: [guestGuard],
        loadComponent: () => import('./pages/signup/signup.page').then((m) => m.SignupPage),
      },
      {
        path: 'forgot-password',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password.page').then((m) => m.ForgotPasswordPage),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/reset-password/reset-password.page').then((m) => m.ResetPasswordPage),
      },
    ],
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
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
      {
        path: '**',
        loadComponent: () =>
          import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
      },
    ],
  },
];
