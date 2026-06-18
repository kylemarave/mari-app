import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { AppState } from '../models/mari.models';
import { AuthService } from './auth.service';
import {
  getLocalSyncAt,
  hasWorkspaceContent,
  parseAppStateJson,
  setLocalSyncAt,
} from '../utils/workspace-state.utils';

export type WorkspaceSyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface RemoteWorkspace {
  state: AppState;
  updatedAt: string;
}

interface WorkspaceRow {
  user_id: string;
  state: unknown;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceSyncService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly auth = inject(AuthService);

  private readonly client: SupabaseClient | null;
  private pushTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingPush: { userId: string; state: AppState } | null = null;
  private pushPromise: Promise<void> | null = null;

  readonly status = signal<WorkspaceSyncStatus>('idle');
  readonly lastSyncedAt = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

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
    this.cancelPush();
    this.status.set('idle');
    this.lastSyncedAt.set(null);
    this.errorMessage.set(null);
  }

  /** Pull remote workspace and resolve merge against local (last-write-wins by timestamp). */
  async reconcile(userId: string, localState: AppState): Promise<AppState> {
    if (!this.client || !isPlatformBrowser(this.platformId)) {
      this.status.set('offline');
      return localState;
    }

    this.status.set('syncing');
    this.errorMessage.set(null);

    try {
      if (!(await this.ensureSession())) {
        this.status.set('offline');
        return localState;
      }

      const remote = await this.fetchRemote(userId);
      let localSyncAt = getLocalSyncAt(userId);

      if (!localSyncAt && hasWorkspaceContent(localState)) {
        localSyncAt = new Date().toISOString();
        setLocalSyncAt(userId, localSyncAt);
      }

      const localTime = localSyncAt ? Date.parse(localSyncAt) : 0;

      if (!remote) {
        if (hasWorkspaceContent(localState)) {
          await this.pushNow(userId, localState);
        } else {
          this.status.set('synced');
        }
        return localState;
      }

      const remoteTime = Date.parse(remote.updatedAt);

      if (remoteTime > localTime) {
        this.lastSyncedAt.set(remote.updatedAt);
        this.status.set('synced');
        return remote.state;
      }

      if (localTime > remoteTime || !hasWorkspaceContent(remote.state)) {
        await this.pushNow(userId, localState);
        return localState;
      }

      this.lastSyncedAt.set(remote.updatedAt);
      this.status.set('synced');
      return remote.state;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cloud sync failed';
      console.warn('[WorkspaceSyncService]', message);
      this.errorMessage.set(message);
      this.status.set('error');
      return localState;
    }
  }

  schedulePush(userId: string, state: AppState): void {
    if (!this.client || !isPlatformBrowser(this.platformId)) return;

    this.pendingPush = { userId, state };
    if (this.pushTimer) clearTimeout(this.pushTimer);

    this.pushTimer = setTimeout(() => {
      this.pushTimer = null;
      const pending = this.pendingPush;
      this.pendingPush = null;
      if (!pending) return;
      void this.flushPush(pending.userId, pending.state);
    }, 800);
  }

  cancelPush(): void {
    if (this.pushTimer) {
      clearTimeout(this.pushTimer);
      this.pushTimer = null;
    }
    this.pendingPush = null;
  }

  private async flushPush(userId: string, state: AppState): Promise<void> {
    if (!this.pushPromise) {
      this.pushPromise = this.pushNow(userId, state).finally(() => {
        this.pushPromise = null;
      });
    }
    await this.pushPromise;
  }

  private async pushNow(userId: string, state: AppState): Promise<void> {
    if (!this.client) return;

    this.status.set('syncing');
    this.errorMessage.set(null);

    try {
      if (!(await this.ensureSession())) {
        this.status.set('offline');
        return;
      }

      const { data, error } = await this.client
        .from('workspace_state')
        .upsert(
          {
            user_id: userId,
            state,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )
        .select('updated_at')
        .single();

      if (error) throw new Error(error.message);

      const updatedAt = (data as { updated_at: string }).updated_at;
      setLocalSyncAt(userId, updatedAt);
      this.lastSyncedAt.set(updatedAt);
      this.status.set('synced');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save to cloud';
      console.warn('[WorkspaceSyncService] Push failed:', message);
      this.errorMessage.set(message);
      this.status.set('error');
    }
  }

  private async fetchRemote(userId: string): Promise<RemoteWorkspace | null> {
    if (!this.client) return null;

    const { data, error } = await this.client
      .from('workspace_state')
      .select('user_id, state, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    const row = data as WorkspaceRow;
    const state = parseAppStateJson(row.state);
    if (!state) return null;

    return { state, updatedAt: row.updated_at };
  }

  private async ensureSession(): Promise<boolean> {
    if (!this.client) return false;

    const session = this.auth.session();
    if (!session) return false;

    await this.client.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    return true;
  }
}
