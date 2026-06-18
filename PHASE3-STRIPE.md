# Phase 3 — Stripe + AI gating setup

Run the SQL migration first, then configure Stripe and env vars.

## Step 1: Supabase profiles table

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**
2. Paste and run `supabase/migrations/001_profiles.sql`
3. Confirm **Authentication → Users** still lists your accounts
4. Check **Table Editor → profiles** — existing users should have `plan = free`

## Step 2: Stripe

1. Create a product **Mari Pro** with a recurring price ($8/mo or your choice)
2. Copy the **Price ID** → `STRIPE_PRICE_ID_PRO`
3. Developers → API keys → copy **Secret key** → `STRIPE_SECRET_KEY`
4. Enable **Customer Portal** in Stripe Dashboard (Settings → Billing → Customer portal)

## Step 3: Local `.env`

Add to your `.env` (in addition to existing Supabase/Gemini vars):

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...

APP_URL=http://localhost:4200
```

**Never** commit service role or Stripe keys. Never put `SUPABASE_SERVICE_ROLE_KEY` in `NG_APP_*`.

## Step 4: Local webhook testing

Terminal 1:

```powershell
npm start
```

Terminal 2 (Stripe CLI):

```powershell
stripe listen --forward-to localhost:3001/api/stripe-webhook
```

Copy the webhook signing secret (`whsec_...`) into `.env` as `STRIPE_WEBHOOK_SECRET`, restart `npm start`.

Test checkout:

1. Log in → **Settings** or **Pricing** → **Upgrade to Pro**
2. Use Stripe test card `4242 4242 4242 4242`
3. After success, `profiles.plan` should become `pro` in Supabase

## Step 5: Vercel env vars

Add to Vercel (Production + Preview):

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | AI PDF generation |
| `NG_APP_SUPABASE_URL` | Client auth |
| `NG_APP_SUPABASE_ANON_KEY` | Client auth |
| `SUPABASE_URL` | Server profile gating |
| `SUPABASE_SERVICE_ROLE_KEY` | Server + webhooks |
| `STRIPE_SECRET_KEY` | Checkout + portal |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification |
| `STRIPE_PRICE_ID_PRO` | Pro subscription price |
| `APP_URL` | `https://your-app.vercel.app` |

Redeploy after adding vars.

## Step 6: Production Stripe webhook

Stripe Dashboard → Developers → Webhooks → Add endpoint:

- URL: `https://YOUR_APP.vercel.app/api/stripe-webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

Use the endpoint signing secret as `STRIPE_WEBHOOK_SECRET` on Vercel.

## Free plan limits

- **3 AI PDF imports per calendar month** (UTC) for `plan = free`
- Pro: unlimited (server skips limit check)
- Workspace data (tasks, courses, name) remains **localStorage** — not cloud sync

## Verify

- [ ] `/signup` → dashboard
- [ ] Upload PDF on Free (works up to 3/month)
- [ ] 4th upload returns upgrade prompt
- [ ] Stripe Checkout → `profiles.plan = pro`
- [ ] PDF upload unlimited after Pro
- [ ] **Manage billing** opens Stripe Customer Portal
