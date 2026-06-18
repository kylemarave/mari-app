# Deploy Mari to Vercel (with Gemini)

Follow these steps after the repo includes `vercel.json` and `api/index.mjs`.

## What you do in Vercel (cannot be automated from code)

1. **Push this repo to GitHub** (if you have not already).

2. **Import the project** at [vercel.com/new](https://vercel.com/new) → select your GitHub repo.

3. **Confirm build settings** (Vercel may read `vercel.json` automatically):
   - Build Command: `npm run build`
   - Output Directory: `dist/mari-app/browser`
   - Install Command: `npm install`

4. **Add environment variables** (Project → Settings → Environment Variables):

   | Name | Purpose |
   |------|---------|
   | `GEMINI_API_KEY` | AI PDF → study sets ([Google AI Studio](https://aistudio.google.com/apikey)) |
   | `NG_APP_SUPABASE_URL` | Supabase project URL (Auth) |
   | `NG_APP_SUPABASE_ANON_KEY` | Supabase anon/public key (Auth) |

   Enable for **Production** (and **Preview** if you want auth + AI on preview URLs).

   In Supabase: Authentication → URL Configuration → add your Vercel site URL and `http://localhost:4200` for local dev.

5. **Deploy** — wait for the build to finish.

6. **Verify**
   - Open `/` → **Get started** → `/signup` → create account → lands on `/dashboard`
   - Log out (Settings or header) → `/login`
   - **Study Sets** → upload PDF → `POST /api/generate-study-set` should return **200** when `GEMINI_API_KEY` is set

## Local test (optional, before Vercel)

The app uses [`@ngx-env/builder`](https://www.npmjs.com/package/@ngx-env/builder) to load `NG_APP_*` variables from `.env` at build/serve time.

```powershell
# Copy .env.example → .env and fill NG_APP_SUPABASE_* + GEMINI_API_KEY
npm start
```

Restart `npm start` after changing `.env`. On startup you should see ngx-env list `NG_APP_SUPABASE_URL` and `NG_APP_SUPABASE_ANON_KEY`.

SSR production build:

```powershell
npm run build
$env:GEMINI_API_KEY="your_key"
$env:NG_APP_SUPABASE_URL="https://xxx.supabase.co"
$env:NG_APP_SUPABASE_ANON_KEY="your_anon_key"
npm run serve:ssr:mari-app
```

## Troubleshooting on Vercel

| Symptom | Fix |
|--------|-----|
| Auth login fails / "not configured" | Set `NG_APP_SUPABASE_URL` and `NG_APP_SUPABASE_ANON_KEY` in Vercel; redeploy |
| Redirect loop or stuck on login | Confirm Supabase Site URL matches your domain; disable email confirm for dev if needed |
| `404` on `/api/generate-study-set` | Redeploy after adding `vercel.json` + `api/index.mjs`; check build logs for `dist/mari-app/server/server.mjs` |
| `500` on API | Set `GEMINI_API_KEY` in Vercel env vars; redeploy |
| Fallback flashcards only (no Gemini badge) | API failed — check function logs in Vercel dashboard |
| Timeout | Try a shorter PDF; Hobby plan has a 10s function limit (Pro allows up to 60s with `maxDuration` in `vercel.json`) |

## Notes

- **Workspace data** is stored in the browser per user (`localStorage` key `mari-app-state-{userId}`). Cloud sync is a future phase.
- Dark mode and custom folder colors work without any server or API keys.
- Never commit `GEMINI_API_KEY` or Supabase keys to Git — use Vercel env vars only.
