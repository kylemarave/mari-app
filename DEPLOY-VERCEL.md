# Deploy Mari to Vercel

Follow these steps after the repo includes `vercel.json` and `api/index.mjs`.

## What you do in Vercel (cannot be automated from code)

1. **Push this repo to GitHub** (if you have not already).

2. **Import the project** at [vercel.com/new](https://vercel.com/new) → select your GitHub repo.

3. **Confirm build settings** (Vercel may read `vercel.json` automatically):
   - Build Command: `npm run build`
   - Output Directory: `dist/mari-app/browser`
   - Install Command: `npm install`

4. **Add environment variables** (Project → Settings → Environment Variables):

   ### Required (auth + AI)

   | Name | Purpose |
   |------|---------|
   | `GEMINI_API_KEY` | AI PDF → study sets ([Google AI Studio](https://aistudio.google.com/apikey)) |
   | `NG_APP_SUPABASE_URL` | Supabase project URL (client auth) |
   | `NG_APP_SUPABASE_ANON_KEY` | Supabase anon/public key (client auth) |
   | `SUPABASE_URL` | Same as Supabase URL (server-side profile gating) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server only — never expose to client) |

   Enable for **Production** (and **Preview** if you want auth + AI on preview URLs).

   ### Optional (Stripe — when Pro billing is ready)

   | Name | Purpose |
   |------|---------|
   | `STRIPE_SECRET_KEY` | Stripe secret key (Checkout + Portal) |
   | `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
   | `STRIPE_PRICE_ID_PRO` | Stripe Price ID for Pro subscription |
   | `APP_URL` | `https://your-app.vercel.app` (Stripe redirect URLs) |

   Then set `STRIPE_BILLING_ENABLED = true` in `src/app/core/config/features.ts` and redeploy. See `PHASE3-STRIPE.md` for webhook setup.

5. **Supabase**
   - Run `supabase/migrations/001_profiles.sql` in **SQL Editor**.
   - Run `supabase/migrations/002_workspace_state.sql` for cloud workspace sync.
   - **Authentication → URL Configuration** — Site URL = your Vercel domain; add `http://localhost:4200` and production URL to **Redirect URLs**.

6. **Deploy** — wait for the build to finish.

## Test checklist (after deploy)

Use this list to verify production without Stripe:

- [ ] `/` loads landing page; footer links to Privacy and Terms work
- [ ] `/signup` → create account → lands on `/dashboard`
- [ ] `/login` → log out from Settings → log back in
- [ ] `/forgot-password` sends reset email (check Supabase redirect URLs)
- [ ] `/study-sets` shows AI usage `X / 3` for free accounts
- [ ] Upload PDF while logged in → `POST /api/generate-study-set` returns **200** (Gemini badge on reviewer)
- [ ] Settings shows **Free** plan, AI usage count, and **Cloud sync** status
- [ ] Add a task on one browser → same account on another device → task appears after login/sync
- [ ] Pricing page shows “coming soon” for Pro checkout (Stripe not enabled)
- [ ] `/privacy` and `/terms` render placeholder legal copy

### With Stripe (later)

- [ ] Upgrade button opens Stripe Checkout
- [ ] Webhook updates `profiles.plan` to `pro`
- [ ] Manage billing opens Stripe Customer Portal

## Local test (before Vercel)

The app uses [`@ngx-env/builder`](https://www.npmjs.com/package/@ngx-env/builder) to load `NG_APP_*` variables from `.env` at build/serve time.

```powershell
# Copy .env.example → .env and fill NG_APP_SUPABASE_* + GEMINI_API_KEY + SUPABASE_SERVICE_ROLE_KEY
npm start
```

Restart `npm start` after changing `.env`. On startup you should see ngx-env list `NG_APP_SUPABASE_URL` and `NG_APP_SUPABASE_ANON_KEY`.

SSR production build:

```powershell
npm run build
$env:GEMINI_API_KEY="your_key"
$env:NG_APP_SUPABASE_URL="https://xxx.supabase.co"
$env:NG_APP_SUPABASE_ANON_KEY="your_anon_key"
$env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
npm run serve:ssr:mari-app
```

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| Auth login fails / "not configured" | Set `NG_APP_SUPABASE_URL` and `NG_APP_SUPABASE_ANON_KEY` in Vercel; redeploy |
| Login page refreshes / stuck on "Signing in…" | Check browser console; ensure latest deploy includes auth fixes |
| Redirect loop or stuck on login | Confirm Supabase Site URL matches your domain; confirm email if required |
| `404` on `/api/generate-study-set` | Redeploy after adding `vercel.json` + `api/index.mjs`; check build logs |
| `500` on API | Set `GEMINI_API_KEY` in Vercel env vars; redeploy |
| `401` on PDF AI upload | User must be logged in; set `SUPABASE_SERVICE_ROLE_KEY` on server |
| `402` / limit error on PDF AI | Free monthly limit (3) reached — wait for next month or set `plan = pro` in Supabase for testing |
| Cloud sync not updating | Run `002_workspace_state.sql`; check Settings → Cloud sync status; verify RLS policies |
| Upgrade button errors | Expected until Stripe is configured; app shows "coming soon" when `STRIPE_BILLING_ENABLED` is false |
| Plan not updating after payment | Configure Stripe webhook → `/api/stripe-webhook` (when Stripe enabled) |
| Fallback flashcards only (no Gemini badge) | API failed — check function logs in Vercel dashboard |
| Timeout on large PDFs | Try a shorter PDF; Hobby plan has a 10s function limit |

## Notes

- **Workspace data** (tasks, courses, study decks, schedule, bookmarks, profile) syncs to Supabase `workspace_state` when logged in. **localStorage** is used as a local cache; course file **blobs** remain in IndexedDB per device.
- **Plan and AI usage** are stored in Supabase `profiles` (syncs across devices for billing metadata only).
- Never commit API keys or Supabase service role to Git — use Vercel env vars only.
