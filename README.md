# AbokiNews Frontend

Next.js application for reading news, searching stories, selecting topics, viewing a personal feed, saving articles, and asking questions about stored news. Source coverage reflects backend data; political-bias comparisons remain unavailable until verified classification data is integrated.

Companion API: [Viral-Ad-Media/newsapp-server](https://github.com/Viral-Ad-Media/newsapp-server).

## Requirements

- Node.js 22 (used in CI) and npm
- Next.js 15.5.27, React 19, and Tailwind CSS 3.4 as defined in `package.json` and the lockfile
- A running, migrated companion Django backend
- A Next.js server or supported hosting platform; session and exchange routes require server execution

## Local setup

Start the backend first using its README, then from this repository root:

```bash
npm ci
cp .env.example .env.local
```

Set local API URLs in `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
API_SERVER_URL=http://localhost:8000
# Optional, server-only; leave empty to show exchange rates as unconfigured.
EXCHANGE_API_KEY=
```

```bash
npm run dev
```

Open `http://localhost:3000`. On Django, set `DEBUG=True` locally and include `http://localhost:3000` in `CORS_ALLOWED_ORIGINS`. Use one consistent frontend hostname for login and navigation.

## Configuration

| Variable | Visibility and purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Public API base URL, normally ending in `/api`; baked into browser bundles at build time. Required unless the fallback below is set. |
| `NEXT_PUBLIC_API_URL` | Public fallback API origin/base URL; `/api` is appended when absent. The base URL above takes precedence for API requests. |
| `API_SERVER_URL` | Optional server-only API URL for login, refresh, and reader proxy requests; accepts an origin or URL ending in `/api`. Falls back to the public API base. |
| `EXCHANGE_API_KEY` | Optional server-only ExchangeRate-API key. Never use a `NEXT_PUBLIC_` prefix. There is no fallback credential. |

Keep credentials out of version control. Rotate the exchange-provider key previously exposed in the repository/browser code, then configure the replacement on the Next.js host. Configure `OPENAI_API_KEY` on **Django**, not this frontend, to enable generated answers.

## Scripts and validation

```bash
npm run dev             # development server
npm run lint            # ESLint checks
npm run build           # production build
npm run start           # serve the production build
npm audit --omit=dev    # production dependency audit
```

CI uses Node.js 22 and runs `npm ci`, lint, build, and the production dependency audit. The merged repair passed these checks and local end-to-end integration. At that validation, production dependencies had zero reported vulnerabilities. The full development-toolchain audit still reported a `braces` advisory through Tailwind/ESLint glob tooling without a compatible fixed release; this is not a claim that the full audit is clean.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Top/latest news, personal-feed section, questions, and sidebar widgets. |
| `/login`, `/signup` | Username/password login and registration. Signup redirects to login. |
| `/feed` | Personal feed based on selected categories. |
| `/news/custom` | Choose preferred topics. |
| `/news/saved` | Saved stories. |
| `/news/[id]` | Article detail, original source link, summary, saved status, coverage, and related news. Missing stories return 404. |
| `/categories/[categoryId]` | Paginated stories for an exact category ID. |
| `/search?q=term` | Title/description search. |
| `/local-news` | Stories filtered by the country selected in the header. |
| `/timelines` | Stories ordered by publication time. |
| `/lopsided` | Availability message for political-bias comparisons. |

## Authentication and server routes

Login submits credentials to same-origin `POST /api/session`. The Next.js server obtains Django JWTs and sets `news_access` and `news_refresh` cookies: HttpOnly, SameSite=Lax, and Secure in production. JWTs are not returned in the login JSON or stored in localStorage. Development cookies allow local HTTP; use HTTPS for production.

`GET /api/session` reads the current profile and can renew access. `DELETE /api/session` clears cookies. Existing readers must log in again after moving from the old localStorage session implementation.

Reader workflows use `/api/reader/[...path]`, a restricted proxy for `feed`, `preferences`, `saved`, `saved-status`, saved-story details, and `ask`. The proxy forwards JWTs, refreshes expired access, and marks private responses `no-store`. Session and reader mutations require a matching Origin header. Signup and public news requests go directly to the public Django API, so backend CORS must allow the frontend origin.

`GET /api/exchange-rates` calls ExchangeRate-API on the server with NGN as the base, validates supported currency rates, caches the provider fetch for one hour, and includes the provider update timestamp. Missing configuration returns 503; provider failures return 502. The browser never receives the provider key.

## Backend contract

Deploy the companion backend changes and migration 0011 before this frontend.

| Django endpoint under `/api/` | Usage |
| --- | --- |
| `news/` | Paginated public news with `category_id`, `search`, `location`, time filters, and page controls. |
| `news/<id>/` | Article detail including `summary`/`description`, `article_url`, and `image_url`. |
| `news/<id>/related/` | Array of up to four related stories. |
| `news/<id>/coverage/` | Object with `total_sources`, `articles`, `sentiment_stats`, and `sentiment`. |
| `categories/` | Paginated categories containing `article_count`. |
| `categories/<id>/` | Category metadata. |
| `token/`, `token/refresh/`, `auth/user/` | Server-side login, renewal, and profile lookup. |
| `auth/registration/` | Direct signup with username and matching password fields. |
| `feed/`, `preferences/`, `saved/`, `saved/<id>/`, `saved-status/` | Reader workflows through the Next.js proxy. |
| `ask/` | Questions grounded in up to five stored news excerpts. |

Lists return `{count, next, previous, results}` with a default page size of 20 and maximum 100. The UI also accepts legacy arrays. Category pages request `news/?category_id=<id>` instead of fetching individual article IDs.

Coverage is one object whose `articles` field is an array of source entries. It is not a separate top-level array of classified stories. The app does not invent bias percentages or extra sources. Displayed summaries use stored description text. If AI generation is unavailable, answers explicitly report that and provide stored headlines.

## Project structure

```text
src/app/                   Pages and Next.js route handlers
src/app/api/session/       Cookie login, profile, and logout
src/app/api/reader/         Restricted reader proxy
src/app/api/exchange-rates/ Server-only provider request
src/components/            Feeds, navigation, save controls, and widgets
src/lib/api.js             Public API URL and list helpers
src/lib/server-api.js      Internal API URL, cookies, and JWT refresh
public/                    Images and flags
tests/smoke.py             Local integration smoke script
```

Pages combine server rendering with client feed components and loading/error states. Remote news images use `NewsImage` with unoptimized browser loading; upstream article image hosts do not need to be added individually to the Next.js image optimizer. Provider image availability still depends on the upstream host.

## Local integration smoke test

Use an isolated local Django database with at least one article assigned to a category. The script creates a test reader and leaves it in that local database. Install Python `requests` in the test environment.

1. Start the migrated backend at `127.0.0.1:8101` with `DEBUG=True` and `OPENAI_API_KEY` unset to exercise the fallback.
2. Build and start this frontend with `EXCHANGE_API_KEY` unset:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8101/api npm run build
API_SERVER_URL=http://127.0.0.1:8101 npm start -- --hostname 127.0.0.1 --port 3100
```

3. In another terminal:

```bash
python tests/smoke.py
```

The script uses backend `http://127.0.0.1:8101` and frontend `http://localhost:3100`. It checks login, cookie flags, profile, personal feed, preferences, save/unsave, batch status, Origin rejection, proxy restrictions, refresh, question responses, 12 page routes, missing-story 404, exchange configuration, and logout. It explicitly supplies Secure cookies for its local HTTP production-build test; use HTTPS in real deployment.

## Production deployment

1. Deploy Django first. Back up the database, review the migration caveat in its README, and run `migrate` and `collectstatic`.
2. On Vercel or another Next.js host, use Node.js 22 and the Next.js framework preset. The existing `vercel.json` specifies `npm install` and `npm run build`; `npm ci` can be used for a locked install.
3. Set `NEXT_PUBLIC_API_BASE_URL` to the backend HTTPS `/api` URL before building. Set optional `API_SERVER_URL` for runtime server requests and the rotated server-only `EXCHANGE_API_KEY`.
4. Add the exact frontend HTTPS origin to Django's `CORS_ALLOWED_ORIGINS`; configure its backend hostname in `ALLOWED_HOSTS`.
5. Deploy, then verify public feeds, signup/login, preference persistence, save/unsave, session refresh, article/source links, and exchange rates.

Public API URL changes require a rebuild. Provider credentials and server-only variables require the host's runtime/redeployment procedure. AI answers require Django configuration; political-bias views need a verified classification integration. Passing repository CI does not confirm production database migration, provider key rotation, or live deployment health.

## Troubleshooting

- **API URL missing:** set `NEXT_PUBLIC_API_BASE_URL` or its fallback and rebuild/restart. `API_SERVER_URL` alone does not configure browser requests.
- **Signup or public feeds fail with CORS:** allow the exact frontend origin on Django and check the backend's HTTPS reachability.
- **Login or reader proxy fails:** check server-to-backend access and `API_SERVER_URL`, backend migrations, and credentials. For 403 mutations, check that the request Origin matches the actual frontend URL.
- **Personal feed is empty:** ingest news and check selected topics/country filters. Empty topic preferences use all news.
- **Session disappears on a custom domain:** use HTTPS and one consistent domain; cookies are scoped to the frontend host. Log in again after the session upgrade.
- **Exchange panel unavailable:** configure the server-only key and inspect provider quota/status. Missing-key 503 is expected.
- **News image unavailable:** verify the upstream image URL and host; images can fail independently of the news API.
- **AI unavailable or bias page empty:** configure OpenAI on Django for generated answers; political-bias classification remains unimplemented.
