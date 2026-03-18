# NexaAttend — Deployment Guide

## Project Structure
```
nexaattend-deploy/
├── index.html          ← Vite entry point (DO NOT move this)
├── vite.config.js
├── package.json
├── vercel.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx        ← React root
    └── App.jsx         ← Your entire app
```

## Local Development
```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Deploy to Vercel (Fix)

### Option A — Vercel Dashboard (easiest)
1. Go to https://vercel.com/dashboard
2. Click your project → Settings → General
3. Set:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Click Save → Redeploy

### Option B — Fresh Deploy via CLI
```bash
npm install -g vercel
cd nexaattend-deploy
npm install
vercel --prod
```
Vercel will auto-detect Vite. Just press Enter for all prompts.

### Option C — GitHub + Vercel (recommended)
1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import from GitHub
3. Vercel auto-detects Vite — just click Deploy

## Why It Was Broken
Vercel was serving your raw `.jsx` source file directly instead of
building it first. The `vercel.json` in this package fixes that by
explicitly telling Vercel to run `npm run build` and serve the `dist/` folder.
