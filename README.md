## Mari App

Student productivity app with AI-powered PDF study sets (Gemini), course folders with custom hex colors, and dark mode.

### Development

```bash
npm install
npm start
```

For AI PDF import during local dev, run the API server in a second terminal (proxied via `proxy.conf.json`):

```bash
# Set GEMINI_API_KEY in .env or environment
npm run dev:api
npm start
```

Copy `.env.example` to `.env` and set `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/apikey).

### Features

- **Study Sets / PDF import** — Upload a PDF on Study Sets; Mari uses Gemini to build a Gizmo-style reviewer (overview, sections, key points) and flashcards. Falls back to local heuristics if the API is unavailable.
- **Course folders** — Preset accents or custom `#RRGGBB` colors when creating or editing a folder.
- **Dark mode** — Settings → Appearance (Light / Dark / System), persisted in `localStorage`.

### Production SSR

```bash
npm run build
npm run serve:ssr:mari-app
```

The Express server in `src/server.ts` exposes `POST /api/generate-study-set` when `GEMINI_API_KEY` is set.
