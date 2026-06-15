import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'dashboard', renderMode: RenderMode.Prerender },
  { path: 'courses', renderMode: RenderMode.Prerender },
  { path: 'courses/:courseId', renderMode: RenderMode.Server },
  { path: 'schedule', renderMode: RenderMode.Prerender },
  { path: 'tasks', renderMode: RenderMode.Prerender },
  { path: 'pomodoro', renderMode: RenderMode.Prerender },
  { path: 'study-sets', renderMode: RenderMode.Prerender },
  { path: 'study-sets/:deckId', renderMode: RenderMode.Server },
  { path: 'settings', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Prerender },
];
