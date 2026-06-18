import type { Request } from 'express';
import { getSupabaseAdmin } from './supabase-admin';

export type UserPlan = 'free' | 'pro';

/** Keep in sync with src/app/core/models/profile.models.ts */
export const FREE_AI_IMPORTS_PER_MONTH = 3;

export interface ProfileRecord {
  id: string;
  plan: UserPlan;
  ai_imports_used: number;
  ai_imports_period: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export interface GateResult {
  ok: true;
  userId: string;
  profile: ProfileRecord;
}

export interface GateDenied {
  ok: false;
  status: number;
  body: {
    error: string;
    code: 'AUTH_REQUIRED' | 'AI_LIMIT_REACHED' | 'PROFILE_MISSING';
    plan?: UserPlan;
    limit?: number;
    used?: number;
  };
}

export type AiGateResult = GateResult | GateDenied;

function currentPeriod(): string {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${now.getUTCFullYear()}-${month}`;
}

function bearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
}

async function loadProfile(userId: string): Promise<ProfileRecord | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('profiles')
    .select('id, plan, ai_imports_used, ai_imports_period, stripe_customer_id, stripe_subscription_id')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ProfileRecord | null;
}

async function ensureProfile(userId: string): Promise<ProfileRecord> {
  const period = currentPeriod();
  const admin = getSupabaseAdmin();
  const existing = await loadProfile(userId);
  if (existing) {
    if (existing.ai_imports_period !== period) {
      const { data, error } = await admin
        .from('profiles')
        .update({ ai_imports_used: 0, ai_imports_period: period, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('id, plan, ai_imports_used, ai_imports_period, stripe_customer_id, stripe_subscription_id')
        .single();
      if (error) throw new Error(error.message);
      return data as ProfileRecord;
    }
    return existing;
  }

  const { data, error } = await admin
    .from('profiles')
    .insert({
      id: userId,
      plan: 'free',
      ai_imports_used: 0,
      ai_imports_period: period,
    })
    .select('id, plan, ai_imports_used, ai_imports_period, stripe_customer_id, stripe_subscription_id')
    .single();

  if (error) throw new Error(error.message);
  return data as ProfileRecord;
}

export async function assertAiImportAllowed(req: Request): Promise<AiGateResult> {
  const token = bearerToken(req);
  if (!token) {
    return {
      ok: false,
      status: 401,
      body: {
        error: 'Sign in to use AI PDF imports.',
        code: 'AUTH_REQUIRED',
      },
    };
  }

  const admin = getSupabaseAdmin();
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) {
    return {
      ok: false,
      status: 401,
      body: {
        error: 'Invalid or expired session. Please log in again.',
        code: 'AUTH_REQUIRED',
      },
    };
  }

  let profile: ProfileRecord;
  try {
    profile = await ensureProfile(userData.user.id);
  } catch {
    return {
      ok: false,
      status: 403,
      body: {
        error: 'Could not load your subscription profile.',
        code: 'PROFILE_MISSING',
      },
    };
  }

  if (profile.plan === 'pro') {
    return { ok: true, userId: userData.user.id, profile };
  }

  if (profile.ai_imports_used >= FREE_AI_IMPORTS_PER_MONTH) {
    return {
      ok: false,
      status: 402,
      body: {
        error: `Free plan includes ${FREE_AI_IMPORTS_PER_MONTH} AI PDF imports per month. Upgrade to Pro for unlimited imports.`,
        code: 'AI_LIMIT_REACHED',
        plan: 'free',
        limit: FREE_AI_IMPORTS_PER_MONTH,
        used: profile.ai_imports_used,
      },
    };
  }

  return { ok: true, userId: userData.user.id, profile };
}

export async function incrementAiImportUsage(userId: string): Promise<void> {
  const admin = getSupabaseAdmin();
  const profile = await ensureProfile(userId);
  const { error } = await admin
    .from('profiles')
    .update({
      ai_imports_used: profile.ai_imports_used + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw new Error(error.message);
}

export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const token = bearerToken(req);
  if (!token) return null;
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export async function getUserEmailFromRequest(req: Request): Promise<string | null> {
  const token = bearerToken(req);
  if (!token) return null;
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user?.email) return null;
  return data.user.email;
}
