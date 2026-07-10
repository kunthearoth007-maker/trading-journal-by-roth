# Ledger — Daily Trading Journal

A React + Vite trading journal: log trades day-by-day, track P&L in lots
(0.01 lot = $1 per $1 price move), see win rate and streaks, and browse an
activity heatmap + month calendar of your results.

Data is saved to your browser's `localStorage`, so it persists between visits
on the same browser/device.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
```

This outputs a static site into `dist/`. You can preview it locally with:

```bash
npm run preview
```

## Deploy to Vercel

**Option A — Vercel CLI**
```bash
npm i -g vercel
vercel
```
Follow the prompts. Vercel auto-detects Vite; no extra config needed.

**Option B — GitHub + Vercel dashboard**
1. Push this folder to a GitHub repo.
2. Go to vercel.com → New Project → import the repo.
3. Framework preset: Vite (auto-detected). Build command: `npm run build`.
   Output directory: `dist`.
4. Deploy.

## Notes

- All data lives in the browser's `localStorage` under the key
  `journal-entries` — it's per-browser, per-device. There's no backend, so
  nothing syncs across devices unless you add one.
- Lot sizing: P&L = (exit − entry) × lots × 100, matching standard forex/gold
  lot conventions (1.00 lot = 100 units).
