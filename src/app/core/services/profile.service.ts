import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import {
  FREE_AI_IMPORTS_PER_MONTH,
  UserPlan,
  UserProfile,
} from '../models/profile.models';
import { AuthService } from './auth.service';

interface ProfileRow {
  id: string;
  plan: UserPlan;
  ai_imports_used: number;
  ai_imports_period: string;
  stripe_customer_id: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly auth = inject(AuthService);

  private readonly client: SupabaseClient | null;
  private readonly profileSignal = signal<UserProfile | null>(null);
  private loadPromise: Promise<void> | null = null;

  readonly profile = this.profileSignal.asReadonly();
  readonly plan = computed(() => this.profileSignal()?.plan ?? 'free');
  readonly isPro = computed(() => this.plan() === 'pro');
  readonly aiImportsUsed = computed(() => this.profileSignal()?.aiImportsUsed ?? 0);
  readonly aiImportsLimit = computed(() => (this.isPro() ? null : FREE_AI_IMPORTS_PER_MONTH));
  readonly aiImportsRemaining = computed(() => {
    if (this.isPro()) return null;
    const limit = FREE_AI_IMPORTS_PER_MONTH;
    return Math.max(0, limit - this.aiImportsUsed());
  });

  constructor() {
    if (
      isPlatformBrowser(this.platformId) &&
      environment.supabaseUrl &&
      environment.supabaseAnonKey
    ) {
      this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    } else {
      this.client = null;
    }
  }

  clear(): void {
    this.profileSignal.set(null);
    this.loadPromise = null;
  }

  refresh(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !this.client || !this.auth.isAuthenticated()) {
      this.profileSignal.set(null);
      return Promise.resolve();
    }

    if (!this.loadPromise) {
      this.loadPromise = this.fetchProfile().finally(() => {
        this.loadPromise = null;
      });
    }
    return this.loadPromise;
  }

  private async fetchProfile(): Promise<void> {
    if (!this.client) return;

    const session = this.auth.session();
    if (!session) {
      this.profileSignal.set(null);
      return;
    }

    await this.client.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    const { data, error } = await this.client
      .from('profiles')
      .select('id, plan, ai_imports_used, ai_imports_period, stripe_customer_id')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) {
      console.warn('[ProfileService] Failed to load profile:', error.message);
      this.profileSignal.set(null);
      return;
    }

    if (!data) {
      this.profileSignal.set(null);
      return;
    }

    this.profileSignal.set(mapRow(data as ProfileRow));
  }
}

function mapRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    plan: row.plan,
    aiImportsUsed: row.ai_imports_used,
    aiImportsPeriod: row.ai_imports_period,
    stripeCustomerId: row.stripe_customer_id,
  };
}
