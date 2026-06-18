import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/** Single browser Supabase client shared by auth, profile, and workspace sync. */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly client: SupabaseClient | null;

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

  get supabase(): SupabaseClient | null {
    return this.client;
  }

  get configured(): boolean {
    return !!this.client;
  }
}
