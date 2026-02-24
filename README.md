# AbokiNews Frontend

A Next.js 14 frontend for an AI-assisted news experience with:
- Top and latest news feeds
- Category and article detail pages
- Related coverage and sentiment widgets
- Authentication (login/signup) with token storage
- Sidebar topics and exchange-rate panel

This project uses the App Router (`src/app`) and Tailwind CSS.

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Requirements](#requirements)
3. [Quick Start](#quick-start)
4. [Environment Variables](#environment-variables)
5. [Available Scripts](#available-scripts)
6. [Application Routes](#application-routes)
7. [Expected Backend API](#expected-backend-api)
8. [Project Structure](#project-structure)
9. [Architecture Notes](#architecture-notes)
10. [Troubleshooting](#troubleshooting)
11. [Deploy to Vercel](#deploy-to-vercel)

## Tech Stack

- Next.js `14.2.14`
- React `18`
- Tailwind CSS `3.4`
- React Icons
- TypeScript tooling (mixed JS/TS codebase)

## Requirements

- Node.js `18+` (Node `20+` recommended)
- npm `9+`
- A running backend API that serves news/auth endpoints

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create local environment file:

```bash
cp .env.example .env.local
```

3. Update `.env.local` with local or staging values (see [Environment Variables](#environment-variables)).

4. Start development server:

```bash
npm run dev
```

5. Open:

`http://localhost:3000`

## Environment Variables

The app is client-heavy and expects public env vars.

### Required

- `NEXT_PUBLIC_API_BASE_URL`
  - Example: `https://your-api-host.com/api`
  - Used to build all API requests.

### Optional Fallback

- `NEXT_PUBLIC_API_URL`
  - Example: `https://your-api-host.com`
  - Used if `NEXT_PUBLIC_API_BASE_URL` is not provided.
  - `/api` is auto-appended by `src/lib/api.js` when missing.

### Optional

- `NEXT_PUBLIC_EXCHANGE_API_KEY`
  - Used by the exchange-rate widget.
  - If missing, a fallback key in code is used.
  - For production, set your own key to avoid quota/rate-limit issues.

### Sample `.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_EXCHANGE_API_KEY=your_exchange_rate_api_key
```

## Available Scripts

```bash
npm run dev     # Start local development server
npm run build   # Production build
npm run start   # Run production build
npm run lint    # ESLint checks
```

Optional type-check:

```bash
npx tsc --noEmit
```

## Application Routes

| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Home feed: top news, personalized block, latest news, sidebar |
| `/login` | `src/app/login/page.js` | Login page |
| `/signup` | `src/app/signup/page.js` | Signup page |
| `/news/[id]` | `src/app/news/[id]/page.js` | News detail page with sidebars, story coverage, related news |
| `/categories/[categoryId]` | `src/app/categories/[categoryId]/page.js` | Category detail page with article grid |

## Expected Backend API

The frontend expects a REST API under `/api`.

### News

- `GET /api/news/`
- `GET /api/news/{id}/`
- `GET /api/news/{id}/related/`
- `GET /api/news/{id}/coverage/`

### Categories

- `GET /api/categories/`
- `GET /api/categories/{id}/`

### Auth

- `POST /api/auth/login/`
- `POST /api/auth/registration/`

### Minimum Data Shapes Used by UI

#### Article (list/detail)

```json
{
  "id": 123,
  "title": "Headline",
  "content": "Full article body",
  "published_at": "2026-01-01T12:00:00Z",
  "location": "Lagos",
  "image_url": "https://...",
  "categories": [{ "id": 1, "name": "Politics" }],
  "tags": ["economy", "policy"]
}
```

#### Coverage Details (`/news/{id}/coverage/`)

```json
{
  "total_sources": 20,
  "sentiment_stats": {
    "positive": 7,
    "neutral": 9,
    "negative": 4
  },
  "sentiment": "Neutral"
}
```

#### Story Coverage List (same endpoint in current UI)

```json
[
  {
    "id": 1,
    "source": "Source Name",
    "source_logo": "https://...",
    "title": "Coverage headline",
    "published_at": "2026-01-01T09:00:00Z",
    "bias": "left",
    "relevance": 0.91,
    "url": "https://..."
  }
]
```

## Project Structure

```text
src/
  app/
    layout.tsx
    page.tsx
    login/page.js
    signup/page.js
    news/[id]/page.js
    categories/[categoryId]/page.js
  components/
    Header.js
    Footer.js
    TopNews.js
    LatestNews.js
    PersonalizedNewsFeed.js
    RightSidebar.js
    LeftSidebar.js
    StoryCoverage.js
    CoverageDetails.js
    RelatedNews.js
    Login.js
    Signup.js
    ExchangeRate.js
    ...
  lib/
    api.js
public/
  images/
  flags/
```

## Architecture Notes

### Layout

- `src/app/layout.tsx` wraps every route with `Header`, `Footer`, and a centered `main` container.
- Local Geist fonts are loaded and exposed as CSS vars.

### API URL Resolution

`src/lib/api.js` centralizes URL behavior:

- `buildApiUrl(path)` creates API endpoint URLs.
- `resolveApiAssetUrl(path)` resolves backend-hosted media URLs.
- Handles both `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_API_URL`.

### Rendering Strategy

- Route pages use server rendering where appropriate (for example `/news/[id]`).
- Most feed and widget components are client components with `useEffect` fetches and loading/error states.

### Images

Remote domains must be allowed in `next.config.mjs` (`images.domains`).

### Auth Behavior

- Login stores `token` in `localStorage`.
- Personalized feed section checks for token presence and currently gates content with a locked/unlocked placeholder view.

## Troubleshooting

### 1) "API base URL is not configured"

Set at least one env var:
- `NEXT_PUBLIC_API_BASE_URL`
- or `NEXT_PUBLIC_API_URL`

Then restart dev server.

### 2) Remote images fail to load

Add backend/image host to `next.config.mjs` under `images.domains`, then restart.

### 3) Build fails with SWC binary error

If you see:
- `Failed to load SWC binary for darwin/x64`

Install the matching package for your platform/version and rebuild:

```bash
npm install
npm run build
```

If needed, reinstall dependencies from a clean `node_modules`/lockfile state in your environment.

### 4) Auth succeeds but personalized feed is still locked

Check that `localStorage` contains `token` and that browser storage is not blocked.

## Deploy to Vercel

### Prerequisites

1. Push your code to GitHub/GitLab/Bitbucket.
2. Ensure your backend API is publicly reachable via HTTPS.
3. Ensure backend CORS allows your Vercel domain(s).

### Option A: Vercel Dashboard (recommended)

1. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
2. Framework preset: `Next.js` (auto-detected).
3. Keep defaults for:
   - Install command: `npm install`
   - Build command: `npm run build`
4. Add Environment Variables in Project Settings:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://your-api-host.com/api`
   - `NEXT_PUBLIC_API_URL` = `https://your-api-host.com`
   - `NEXT_PUBLIC_EXCHANGE_API_KEY` = `your_exchange_rate_api_key` (optional but recommended)
5. Deploy.

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

Set env vars either in the dashboard or via CLI:

```bash
vercel env add NEXT_PUBLIC_API_BASE_URL production
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_EXCHANGE_API_KEY production
```

### Files already prepared for Vercel

- `vercel.json` defines framework/build/install commands.
- `.env.example` documents required environment variables.

### Post-deploy checklist

1. Open `/` and confirm Top News and Latest News load.
2. Open `/news/[id]` and confirm image + story coverage + related news render.
3. Test `/login` and `/signup`.
4. Confirm remote images load (if not, update `next.config.mjs` `images.domains` and redeploy).
5. Confirm exchange rates load (or set a valid exchange-rate API key).

### Common Vercel-specific issues

- `API base URL is not configured`
  - Missing `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_API_URL` in Vercel env settings.
- `401/403/CORS` on API calls
  - Backend is not allowing the Vercel domain.
- Remote image blocked by Next.js
  - Missing image hostname in `next.config.mjs`.
