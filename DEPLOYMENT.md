# Deploy Simba (Render + Vercel)

Backend on **Render**, frontend on **Vercel**, PostgreSQL on **Neon** (recommended) or **Render Postgres** (free tier).

## Overview

```
┌─────────────────┐      HTTPS       ┌──────────────────┐
│  Vercel (web)   │ ───────────────► │  Render (API)    │
│  React SPA      │   VITE_API_…     │  Express + AI    │
└─────────────────┘                  └────────┬─────────┘
                                              │
                                              ▼
                                     ┌──────────────────┐
                                     │  PostgreSQL      │
                                     │  (Neon / Render) │
                                     └──────────────────┘
```

---

## 1. Push code to GitHub

Render and Vercel deploy from Git. Commit and push this repo.

---

## 2. Create a database

### Option A — Neon (recommended)

You may already use Neon locally. Create a project at [neon.tech](https://neon.tech) and copy the **connection string** (`DATABASE_URL`).

### Option B — Render Postgres

1. [render.com](https://render.com) → **New** → **PostgreSQL**.
2. Choose the **Free** plan.
3. After creation, copy the **Internal** or **External** connection string for `DATABASE_URL`.

---

## 3. Deploy the API on Render

1. **New** → **Web Service** → connect your GitHub repo.
2. Use these settings:

| Setting | Value |
|---------|--------|
| **Name** | `simba-api` (or any name) |
| **Region** | Closest to your users |
| **Branch** | `main` |
| **Root Directory** | *(leave empty — repo root)* |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run db:push -w @simba/api && npm run build -w @simba/api` |
| **Start Command** | `npm run start -w @simba/api` |
| **Instance type** | Free |

3. Under **Advanced**, set **Health Check Path** to `/health`.

4. Add **Environment Variables**:

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Neon or Render Postgres connection string |
| `CLERK_SECRET_KEY` | Yes | [Clerk](https://dashboard.clerk.com) → API Keys |
| `CLERK_PUBLISHABLE_KEY` | Yes | Same dashboard |
| `GROQ_API_KEY` | Yes | [Groq Console](https://console.groq.com) |
| `CLOUDINARY_CLOUD_NAME` | Yes | [Cloudinary](https://cloudinary.com/console) |
| `CLOUDINARY_API_KEY` | Yes | |
| `CLOUDINARY_API_SECRET` | Yes | |
| `WEB_ORIGIN` | Yes* | Your Vercel URL, e.g. `https://simba.vercel.app` (set after step 4) |
| `ALLOW_VERCEL_PREVIEWS` | No | `true` — allows `*.vercel.app` preview deploys |
| `AI_MODEL` | No | Default: `llama-3.3-70b-versatile` |
| `NODE_VERSION` | No | `20` |

\*Set `WEB_ORIGIN` after the first Vercel deploy, then redeploy the API.

5. Click **Create Web Service** and wait for the build.

6. Verify: `https://<your-service>.onrender.com/health` → `{"status":"ok"}`.

---

## 4. Deploy the frontend on Vercel

Config lives in [`apps/web/vercel.json`](apps/web/vercel.json). Vercel reads it when **Root Directory** is set to `apps/web`.

### Dashboard settings

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → import your repo.
2. **Configure Project:**

| Setting | Value |
|---------|--------|
| **Framework Preset** | Vite *(auto-detected)* |
| **Root Directory** | `apps/web` ← **required** |
| **Build Command** | `npm run build` *(from vercel.json)* |
| **Output Directory** | `dist` *(from vercel.json)* |
| **Install Command** | `cd ../.. && npm install` *(from vercel.json — installs monorepo from repo root)* |

Leave **Node.js Version** at **20.x** (Project → Settings → General → Node.js Version).

### Environment variables

Add for **Production** and **Preview** (Settings → Environment Variables):

| Name | Value | Example |
|------|--------|---------|
| `VITE_API_BASE_URL` | Your Render API URL (no trailing slash) | `https://simba-api.onrender.com` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | `pk_test_…` or `pk_live_…` |

> Vite only exposes vars prefixed with `VITE_`. Redeploy after changing env vars.

### What `vercel.json` does

```json
{
  "installCommand": "cd ../.. && npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/((?!assets/).*)", "destination": "/index.html" }]
}
```

- **installCommand** — Runs from repo root so npm workspaces resolve correctly.
- **rewrites** — Sends all routes (except `/assets/*`) to `index.html` for React Router (`/simba`, `/store/...`, etc.).

### Deploy

1. Click **Deploy**.
2. Copy your URL, e.g. `https://simba.vercel.app`.
3. On **Render**, set `WEB_ORIGIN` to that URL and redeploy the API.

---

## 5. Configure Clerk

In [Clerk Dashboard](https://dashboard.clerk.com) → your app → **Domains**:

- Add your Vercel production URL.
- Add allowed origins for sign-in if prompted.

Use **live** keys (`pk_live_` / `sk_live_`) for a public production site.

---

## 6. Smoke test

1. Open your Vercel URL → sign in.
2. Complete onboarding / open the dashboard.
3. Run an audit (Simba → Audit center).
4. Open the storefront: `https://your-app.vercel.app/store/your-slug`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | Set `WEB_ORIGIN` to the exact Vercel URL (no trailing slash). Use `ALLOW_VERCEL_PREVIEWS=true` for preview URLs. |
| API 502 / slow first load | Render free tier sleeps when idle; first request after sleep can take ~30s. |
| Prisma / DB errors | Check `DATABASE_URL` and build logs for `db:push` failures. |
| Clerk auth fails | Same publishable key on Vercel; secret on Render; Vercel domain allowed in Clerk. |
| AI scan fails | Confirm `GROQ_API_KEY` on Render; watch Groq rate limits. |
| Build fails on Render | Ensure **Root Directory** is empty (monorepo root), not `apps/api`. |

---

## Custom domain (optional)

- **Vercel**: Project → Settings → Domains.
- **Render**: Service → Settings → Custom Domain.
- Update `WEB_ORIGIN` and `VITE_API_BASE_URL`, then redeploy both.
- Add domains in Clerk.
