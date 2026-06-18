export type UserPlan = 'free' | 'pro';

export interface UserProfile {
  id: string;
  plan: UserPlan;
  aiImportsUsed: number;
  aiImportsPeriod: string;
  stripeCustomerId: string | null;
}

export const FREE_AI_IMPORTS_PER_MONTH = 3;

export interface AiLimitErrorPayload {
  error: string;
  code: 'AI_LIMIT_REACHED' | 'AUTH_REQUIRED';
  plan?: UserPlan;
  limit?: number;
  used?: number;
}
