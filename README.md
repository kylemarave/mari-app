# Mari App

Student productivity app with AI-powered PDF study sets (Gemini), course folders with custom hex colors, and dark mode.

## Development

```bash
npm install
npm start
```

For AI PDF import during local dev, run the API server in a second terminal (proxied via `proxy.conf.json`):

```bash
# Set GEMINI_API_KEY in environment (PowerShell example)
$env:GEMINI_API_KEY="your_key_here"
npm run dev:api
```

In another terminal:

```bash
npm start
```

Copy `.env.example` to `.env` for local reference (do not commit `.env`).

## Deploy to Vercel

See **[DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md)** for the full checklist (GitHub import, `GEMINI_API_KEY`, verify steps).

Quick summary:

1. Push to GitHub → import on Vercel  
2. Set `GEMINI_API_KEY` in Vercel → Environment Variables  
3. Deploy → test PDF upload on `/study-sets`

## Features

- **Study Sets / PDF import** — Upload a PDF on Study Sets; Mari uses Gemini to build a Gizmo-style reviewer (overview, sections, key points) and flashcards. Falls back to local heuristics if the API is unavailable.
- **Course folders** — Preset accents or custom `#RRGGBB` colors when creating or editing a folder.
- **Dark mode** — Settings → Appearance (Light / Dark / System), persisted in `localStorage`.

## Production SSR (local)

```bash
npm run build
# PowerShell:
$env:GEMINI_API_KEY="your_key"
npm run serve:ssr:mari-app
```

The Express server in `src/server.ts` exposes `POST /api/generate-study-set` when `GEMINI_API_KEY` is set.
