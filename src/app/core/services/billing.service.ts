import { Injectable, inject, signal } from '@angular/core';
import { STRIPE_BILLING_ENABLED } from '../config/features';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly auth = inject(AuthService);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly enabled = STRIPE_BILLING_ENABLED;

  async startCheckout(): Promise<boolean> {
    this.errorMessage.set('');

    if (!STRIPE_BILLING_ENABLED) {
      this.errorMessage.set('Pro upgrades are coming soon.');
      return false;
    }

    this.loading.set(true);

    try {
      const token = await this.auth.getAccessToken();
      if (!token) {
        this.errorMessage.set('Sign in to upgrade to Pro.');
        return false;
      }

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        this.errorMessage.set(data.error ?? 'Could not start checkout.');
        return false;
      }

      window.location.href = data.url;
      return true;
    } catch {
      this.errorMessage.set('Could not connect to billing.');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async openPortal(): Promise<boolean> {
    this.errorMessage.set('');

    if (!STRIPE_BILLING_ENABLED) {
      this.errorMessage.set('Billing management is coming soon.');
      return false;
    }

    this.loading.set(true);

    try {
      const token = await this.auth.getAccessToken();
      if (!token) {
        this.errorMessage.set('Sign in to manage billing.');
        return false;
      }

      const res = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        this.errorMessage.set(data.error ?? 'Could not open billing portal.');
        return false;
      }

      window.location.href = data.url;
      return true;
    } catch {
      this.errorMessage.set('Could not connect to billing.');
      return false;
    } finally {
      this.loading.set(false);
    }
  }
}
