import { isPlatformBrowser } from '@angular/common';
import { Injectable, Injector, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthError, Session, SupabaseClient, User, createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { MariStoreService } from './mari-store.service';
import { PomodoroService } from './pomodoro.service';
import { ProfileService } from './profile.service';
import { WorkspaceSyncService } from './workspace-sync.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly store = inject(MariStoreService);
  private readonly pomodoro = inject(PomodoroService);
  private readonly injector = inject(Injector);

  private readonly client: SupabaseClient | null;
  private initPromise: Promise<void> | null = null;

  private readonly sessionSignal = signal<Session | null>(null);
  private readonly userSignal = signal<User | null>(null);

  readonly session = this.sessionSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.sessionSignal());
  readonly configured = computed(
    () => !!(environment.supabaseUrl && environment.supabaseAnonKey),
  );

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

  init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }
    if (!this.initPromise) {
      this.initPromise = this.bootstrapSession();
    }
    return this.initPromise;
  }

  async signIn(email: string, password: string): Promise<AuthError | null> {
    if (!this.client) {
      return this.configError();
    }

    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) return error;

    this.applySession(data.session);
    if (data.user) {
      this.bindWorkspaceUser(data.user.id);
    }
    return null;
  }

  async signUp(email: string, password: string, fullName: string): Promise<AuthError | null> {
    if (!this.client) {
      return this.configError();
    }

    const trimmedName = fullName.trim();
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: trimmedName ? { full_name: trimmedName } : undefined,
      },
    });
    if (error) return error;

    if (data.user) {
      this.store.initializeNewUser(data.user.id, {
        name: trimmedName || undefined,
        email,
      });
      this.applySession(data.session);
      this.bindWorkspaceUser(data.user.id);
    }
    return null;
  }

  async resetPassword(email: string): Promise<AuthError | null> {
    if (!this.client) {
      return this.configError();
    }

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : undefined;

    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    return error;
  }

  async updatePassword(password: string): Promise<AuthError | null> {
    if (!this.client) {
      return this.configError();
    }

    const { error } = await this.client.auth.updateUser({ password });
    return error;
  }

  async signOut(): Promise<void> {
    if (this.client) {
      await this.client.auth.signOut();
    }
    this.applySession(null);
    this.bindWorkspaceUser(null);
    await this.router.navigateByUrl('/login');
  }

  async getAccessToken(): Promise<string | null> {
    await this.init();
    return this.sessionSignal()?.access_token ?? null;
  }

  private async bootstrapSession(): Promise<void> {
    if (!this.client) return;

    const { data } = await this.client.auth.getSession();
    this.applySession(data.session);
    if (data.session?.user) {
      this.bindWorkspaceUser(data.session.user.id);
    }

    this.client.auth.onAuthStateChange((_event, session) => {
      this.applySession(session);
      this.bindWorkspaceUser(session?.user?.id ?? null);
    });
  }

  private bindWorkspaceUser(userId: string | null): void {
    this.store.bindUser(userId);
    this.pomodoro.bindUser(userId);
    const profiles = this.injector.get(ProfileService);
    const workspaceSync = this.injector.get(WorkspaceSyncService);
    if (userId) {
      void profiles.refresh();
    } else {
      profiles.clear();
      workspaceSync.clear();
    }
  }

  private applySession(session: Session | null): void {
    this.sessionSignal.set(session);
    this.userSignal.set(session?.user ?? null);
  }

  private configError(): AuthError {
    return {
      name: 'AuthConfigError',
      message:
        'Supabase is not configured. Set NG_APP_SUPABASE_URL and NG_APP_SUPABASE_ANON_KEY in your .env file.',
      status: 500,
    } as AuthError;
  }
}
