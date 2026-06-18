import { registerGeminiStudyRoutes } from './gemini-study';
import { registerStripeRoutes } from './stripe-routes';
import type { Express } from 'express';

export function registerMariApiRoutes(app: Express): void {
  registerGeminiStudyRoutes(app);
  registerStripeRoutes(app);
}
