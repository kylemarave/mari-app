import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'pricing', renderMode: RenderMode.Prerender },
  { path: 'privacy', renderMode: RenderMode.Prerender },
  { path: 'terms', renderMode: RenderMode.Prerender },
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'signup', renderMode: RenderMode.Prerender },
  { path: 'forgot-password', renderMode: RenderMode.Prerender },
  { path: 'reset-password', renderMode: RenderMode.Prerender },
  { path: 'dashboard', renderMode: RenderMode.Server },
  { path: 'courses', renderMode: RenderMode.Server },
  { path: 'courses/:courseId', renderMode: RenderMode.Server },
  { path: 'schedule', renderMode: RenderMode.Server },
  { path: 'tasks', renderMode: RenderMode.Server },
  { path: 'pomodoro', renderMode: RenderMode.Server },
  { path: 'study-sets', renderMode: RenderMode.Server },
  { path: 'study-sets/:deckId', renderMode: RenderMode.Server },
  { path: 'settings', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server },
];
