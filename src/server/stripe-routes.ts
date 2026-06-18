import Stripe from 'stripe';
import type { Express, Request, Response } from 'express';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from './supabase-admin';
import { getUserEmailFromRequest, getUserIdFromRequest } from './profile-gate';

function stripeClient(): Stripe {
  const key = process.env['STRIPE_SECRET_KEY']?.trim();
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured.');
  return new Stripe(key);
}

function proPriceId(): string {
  const id = process.env['STRIPE_PRICE_ID_PRO']?.trim();
  if (!id) throw new Error('STRIPE_PRICE_ID_PRO is not configured.');
  return id;
}

function appOrigin(req: Request): string {
  const configured = process.env['APP_URL']?.trim();
  if (configured) return configured.replace(/\/$/, '');
  const host = req.get('x-forwarded-host') ?? req.get('host');
  const proto = req.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}`;
}

async function loadProfile(userId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('profiles')
    .select('stripe_customer_id, stripe_subscription_id, plan')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const secret = process.env['STRIPE_WEBHOOK_SECRET']?.trim();
  if (!secret) {
    res.status(500).json({ error: 'STRIPE_WEBHOOK_SECRET is not configured.' });
    return;
  }

  if (!isSupabaseAdminConfigured()) {
    res.status(500).json({ error: 'Supabase admin is not configured.' });
    return;
  }

  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') {
    res.status(400).json({ error: 'Missing Stripe signature.' });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(req.body as Buffer, signature, secret);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook signature.';
    res.status(400).json({ error: message });
    return;
  }

  const admin = getSupabaseAdmin();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id ?? session.metadata?.['userId'];
        if (!userId) break;

        await admin
          .from('profiles')
          .update({
            plan: 'pro',
            stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null,
            stripe_subscription_id:
              typeof session.subscription === 'string'
                ? session.subscription
                : session.subscription?.id ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
        const active = subscription.status === 'active' || subscription.status === 'trialing';

        await admin
          .from('profiles')
          .update({
            plan: active ? 'pro' : 'free',
            stripe_subscription_id: subscription.id,
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

        await admin
          .from('profiles')
          .update({
            plan: 'free',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook handler failed.';
    res.status(500).json({ error: message });
  }
}

export function registerStripeRoutes(app: Express): void {
  app.post('/api/create-checkout-session', async (req: Request, res: Response) => {
    try {
      if (!isSupabaseAdminConfigured()) {
        res.status(500).json({ error: 'Supabase admin is not configured.' });
        return;
      }

      const userId = await getUserIdFromRequest(req);
      const email = await getUserEmailFromRequest(req);
      if (!userId || !email) {
        res.status(401).json({ error: 'Sign in to upgrade to Pro.' });
        return;
      }

      const profile = await loadProfile(userId);
      const stripe = stripeClient();
      const origin = appOrigin(req);

      let customerId = profile?.stripe_customer_id ?? null;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email,
          metadata: { userId },
        });
        customerId = customer.id;
        await getSupabaseAdmin()
          .from('profiles')
          .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
          .eq('id', userId);
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        client_reference_id: userId,
        metadata: { userId },
        line_items: [{ price: proPriceId(), quantity: 1 }],
        success_url: `${origin}/settings?billing=success`,
        cancel_url: `${origin}/pricing?billing=cancelled`,
      });

      if (!session.url) {
        res.status(500).json({ error: 'Could not create checkout session.' });
        return;
      }

      res.json({ url: session.url });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/create-portal-session', async (req: Request, res: Response) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        res.status(401).json({ error: 'Sign in to manage billing.' });
        return;
      }

      const profile = await loadProfile(userId);
      if (!profile?.stripe_customer_id) {
        res.status(400).json({ error: 'No billing account found. Upgrade to Pro first.' });
        return;
      }

      const origin = appOrigin(req);
      const portal = await stripeClient().billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${origin}/settings`,
      });

      res.json({ url: portal.url });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Billing portal failed.';
      res.status(500).json({ error: message });
    }
  });
}
