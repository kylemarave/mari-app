# Mari App

Student productivity app with AI-powered PDF study sets (Gemini), course folders, tasks, schedule, and Supabase auth.

## Development

```bash
npm install
cp .env.example .env   # fill NG_APP_SUPABASE_* and GEMINI_API_KEY
npm start
```

`npm start` runs the Gemini API server and Angular dev server together (PDF AI import works via proxy).

Copy `.env.example` to `.env` for local reference — **do not commit `.env`**.

### Required local env vars

| Variable | Purpose |
|----------|---------|
| `NG_APP_SUPABASE_URL` | Supabase project URL (client auth) |
| `NG_APP_SUPABASE_ANON_KEY` | Supabase anon key (client auth) |
| `GEMINI_API_KEY` | AI PDF → study sets (server only) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side JWT verification + AI usage limits |

Also set `SUPABASE_URL` to the same URL as `NG_APP_SUPABASE_URL` for the dev API.

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/001_profiles.sql` in **SQL Editor** (plan + AI usage tracking).
3. Run `supabase/migrations/002_workspace_state.sql` in **SQL Editor** (cloud workspace sync).
4. **Authentication → URL Configuration** — add `http://localhost:4200` and your production URL to **Redirect URLs**.

### Stripe (optional, not required yet)

Pro checkout is disabled in the app until you configure Stripe. See `PHASE3-STRIPE.md` when ready. Set `STRIPE_BILLING_ENABLED = true` in `src/app/core/config/features.ts` after adding Stripe env vars.

## Deploy to Vercel

See **[DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md)** for the full checklist, env vars, and test plan.

## Features

- **Auth** — Email signup/login, password reset (Supabase)
- **Study Sets / PDF import** — Upload a PDF; Mari uses Gemini to build a reviewer and flashcards (3 free AI imports/month)
- **Workspace** — Dashboard, tasks, courses, schedule, Pomodoro, bookmarks — **syncs to Supabase** when logged in (local cache + cloud)
- **Plans** — Free tier with AI limits; Pro billing coming soon
- **Dark mode** — Settings → Appearance

## Production SSR (local)

```bash
npm run build
# PowerShell:
$env:GEMINI_API_KEY="your_key"
$env:NG_APP_SUPABASE_URL="https://xxx.supabase.co"
$env:NG_APP_SUPABASE_ANON_KEY="your_anon_key"
$env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
npm run serve:ssr:mari-app
```

## Legal

Placeholder **Privacy** and **Terms** pages live at `/privacy` and `/terms`. Replace copy before a public launch.
