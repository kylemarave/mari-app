# Deploy Mari to Vercel (with Gemini)

Follow these steps after the repo includes `vercel.json` and `api/index.mjs`.

## What you do in Vercel (cannot be automated from code)

1. **Push this repo to GitHub** (if you have not already).

2. **Import the project** at [vercel.com/new](https://vercel.com/new) → select your GitHub repo.

3. **Confirm build settings** (Vercel may read `vercel.json` automatically):
   - Build Command: `npm run build`
   - Output Directory: `dist/mari-app/browser`
   - Install Command: `npm install`

4. **Add environment variable** (Project → Settings → Environment Variables):
   - Name: `GEMINI_API_KEY`
   - Value: your key from [Google AI Studio](https://aistudio.google.com/apikey)
   - Enable for **Production** (and **Preview** if you want AI on preview URLs)

5. **Deploy** — wait for the build to finish.

6. **Verify Gemini**
   - Open your live URL → **Study Sets**
   - Upload a text-based PDF
   - DevTools → Network → `POST /api/generate-study-set` should return **200**
   - Review UI should show a **Gemini** badge and sectioned reviewer

## Local test (optional, before Vercel)

```powershell
npm run build
$env:GEMINI_API_KEY="your_key"
npm run serve:ssr:mari-app
```

Open `http://localhost:4000/study-sets` and test PDF upload.

## Troubleshooting on Vercel

| Symptom | Fix |
|--------|-----|
| `404` on `/api/generate-study-set` | Redeploy after adding `vercel.json` + `api/index.mjs`; check build logs for `dist/mari-app/server/server.mjs` |
| `500` on API | Set `GEMINI_API_KEY` in Vercel env vars; redeploy |
| Fallback flashcards only (no Gemini badge) | API failed — check function logs in Vercel dashboard |
| Timeout | Try a shorter PDF; Hobby plan has a 10s function limit (Pro allows up to 60s with `maxDuration` in `vercel.json`) |

## Notes

- Dark mode and custom folder colors work without any server or API keys.
- Never commit `GEMINI_API_KEY` to Git — use Vercel env vars only.
