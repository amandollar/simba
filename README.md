# Simba

AI-powered commerce platform for small merchants. Simba gives you a storefront, order management, and an agent workspace that audits your catalog, suggests fixes, optimizes copy, and builds growth plans from your real store data.

## Features

### Store management
- Create and customize a storefront (name, slug, branding, logo, accent colors)
- Product catalog with images (Cloudinary), categories, and descriptions
- Guest checkout, orders, customers, reviews, and analytics
- Launch readiness checklist before going live

### Simba AI workspace
| Agent | What it does |
|-------|----------------|
| **Audit** | Scans your store across UX, SEO, accessibility, conversion, and trust — produces a health score and prioritized issues |
| **Fixes** | Review issues, apply one-click auto-fixes, or jump to the right product/page |
| **Copy** | Optimize product titles and descriptions for SEO and conversion |
| **Growth** | Store-stage-aware growth plan with evidence, email drafts, and action tracking |
| **Consultant** | Chat about your store using live scan results, catalog, and sales data |
| **History** | Scan timeline, score trends, fix proof, and audit diffs |

## Tech stack

| Layer | Stack |
|-------|--------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7 |
| **Backend** | Node.js, Express, TypeScript, Prisma |
| **Database** | PostgreSQL |
| **Auth** | [Clerk](https://clerk.com) |
| **AI** | Groq (`llama-3.3-70b-versatile`) via OpenAI-compatible API |
| **Images** | Cloudinary |

## Project structure

```
simba/
├── apps/
│   ├── api/                    # Express API + AI agents
│   │   ├── prisma/             # Database schema
│   │   ├── scripts/            # Seed & maintenance scripts
│   │   └── src/
│   │       ├── agents/         # Orchestrators & specialist agents
│   │       ├── lib/            # AI, scoring, store snapshot, etc.
│   │       └── routes/         # REST endpoints
│   └── web/                    # React merchant dashboard + storefront
│       └── src/
│           ├── application/    # Hooks & app logic
│           ├── domain/         # Types & pure helpers
│           ├── infrastructure/ # API client
│           └── presentation/   # Pages, layouts, components
└── package.json                # npm workspaces root
```

## Prerequisites

- **Node.js** 20+
- **PostgreSQL** (local or hosted — e.g. [Neon](https://neon.tech))
- **Clerk** account — [dashboard.clerk.com](https://dashboard.clerk.com)
- **Groq** API key — [console.groq.com](https://console.groq.com)
- **Cloudinary** account (for product image uploads) — [cloudinary.com](https://cloudinary.com)

## Getting started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd simba
npm install
```

### 2. Configure environment

**API** — copy and fill in `apps/api/.env`:

```bash
cp apps/api/.env.example apps/api/.env
```

**Web** — copy and fill in `apps/web/.env`:

```bash
cp apps/web/.env.example apps/web/.env
```

Use the same Clerk **publishable** key in both `apps/api/.env` (`CLERK_PUBLISHABLE_KEY`) and `apps/web/.env` (`VITE_CLERK_PUBLISHABLE_KEY`).

### 3. Set up the database

```bash
npm run db:push -w apps/api
npm run db:generate -w apps/api
```

### 4. Run locally

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Web (dashboard) | http://localhost:3000 |
| API | http://localhost:4000 |
| API health | http://localhost:4000/health |

Sign in, complete onboarding to create your store, then open **Simba → Audit center** and run your first scan.

### 5. Seed demo data (optional)

After creating a store in the app, seed catalog, orders, and reviews (with intentional flaws for AI testing):

```bash
# Set your store slug in apps/api/.env
# SEED_MERCHANT_SLUG=your-store-slug

npm run seed
```

## Environment variables

### API (`apps/api/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `GROQ_API_KEY` | Yes | Groq API key for AI agents |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `PORT` | No | API port (default `4000`) |
| `WEB_ORIGIN` | No | Frontend origin for CORS (default `http://localhost:3000`) |
| `AI_MODEL` | No | Model override (default `llama-3.3-70b-versatile`) |
| `SEED_MERCHANT_SLUG` | No | Store slug for `npm run seed` |

### Web (`apps/web/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | API URL (default `http://localhost:4000`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |

## Scripts

Run from the repo root:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API + web in parallel |
| `npm run dev:api` | API only |
| `npm run dev:web` | Web only |
| `npm run build` | Production build (API + web) |
| `npm run seed` | Seed demo catalog, orders, reviews |

API workspace scripts (`npm run <script> -w apps/api`):

| Command | Description |
|---------|-------------|
| `db:push` | Push Prisma schema to database |
| `db:generate` | Regenerate Prisma client |
| `db:studio` | Open Prisma Studio |
| `reset:audits` | Clear audit & fix history (keeps store data) |
| `start` | Run compiled API (`dist/index.js`) |

## API overview

Authenticated routes use Clerk JWT via `Authorization: Bearer <token>`.

| Prefix | Purpose |
|--------|---------|
| `/merchant` | Store profile, launch, readiness |
| `/store` | Products, orders, customers, analytics, reviews |
| `/audits` | Run scans, history, diffs |
| `/issues` | Issue list, status updates, auto-fix |
| `/fixes` | Applied fix history |
| `/growth` | Growth plan generation & tracking |
| `/consultant` | AI chat |
| `/public/:slug` | Public storefront & checkout (no auth) |

## AI architecture

Agents follow an **orchestrator + specialist** pattern:

```
apps/api/src/agents/
├── orchestrator/     # Compose data + call specialists
│   ├── audit-orchestrator.ts
│   ├── fix-orchestrator.ts
│   ├── growth-orchestrator.ts
│   ├── copy-orchestrator.ts
│   └── consultant-orchestrator.ts
└── specialists/      # Focused LLM or rule-based tasks
    ├── lens-agent.ts       # Per-lens audit (UX, SEO, …)
    ├── growth-agent.ts
    ├── copy-agent.ts
    └── consultant/
```

Audits combine deterministic rules with lens agents (run sequentially with rate limiting). Growth plans merge a computed **growth brief** (orders, catalog gaps, segments) with LLM-generated actions grounded in real product names and metrics.

## Storefront URLs

Each merchant gets a public storefront:

```
http://localhost:3000/store/<slug>
```

Checkout is guest-only — no customer accounts required on the storefront.

## Production notes

- Build the API: `npm run build -w apps/api` then `npm run start -w apps/api`
- Build the web: `npm run build -w apps/web` — static output in `apps/web/dist`
- Set `WEB_ORIGIN` to your deployed frontend URL
- Use a managed PostgreSQL instance and set `DATABASE_URL`
- Groq free tier has rate limits; the API queues AI calls with backoff

## License

Private — all rights reserved.
