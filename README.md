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

## UI components and motion

The reader uses local shadcn/ui components (Tailwind 3, new-york style) and Radix primitives for forms, navigation, country selection, and saved-story controls. Source-linked news leads the layout; photos appear when supplied by the article. Keyboard focus, mobile menu dismissal, reduced-motion preferences, and dates across time zones are covered by browser checks. See [UI review](docs/ui-review.md) for the design rationale and validation details.

```bash
npx playwright install chromium
npm run test:ui
```

The browser suite mocks API responses and does not modify production data. CI also runs these checks.

## Editorial SEO and account dialogs

The post editor includes a focus phrase, search preview, title and description
length guidance, and an actionable editorial score from the backend. Social
metadata, canonical URL, image alternatives, Article-family schema and robots
settings save with the post. Public article pages render the saved search/social
metadata and safely render Markdown headings and links.

Deploy the backend SEO migration before this frontend update. Set
`NEXT_PUBLIC_SITE_URL` to this frontend's public canonical origin and rebuild.
[SEO editor guide](docs/seo-editor.md) documents fields, score weights and limits.
The score is our review checklist, not a ranking guarantee or a third-party score.

Header Login/Sign Up controls open an accessible Radix dialog, with Escape, focus
trapping/return, password visibility and shared validation. `/login` and `/signup`
remain full-page routes. Dialog travel is disabled for keyboard activation and
reduced-motion preferences. Browser tests cover the dialogs, responsive auth
forms, draft analysis/save and rendered article metadata.

## Google sign-in

Both account pages offer Google sign-in through a server-side authorization code flow with state validation and PKCE. Google tokens are verified by Django/allauth and exchanged for the existing HttpOnly reader JWT cookies. Tokens and client secrets are never passed to browser JavaScript.

1. Create a **Web application** OAuth client in Google Cloud and configure the consent screen. Add test users while the consent screen is in testing mode.
2. Add `http://localhost:3000/api/auth/google/callback` to the client's authorized redirect URIs. Add `https://<frontend-domain>/api/auth/google/callback` for production. The URI must match exactly.
3. Set the same `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the frontend's `.env.development.local` and Django's `.env`. For production, set them on both Vercel projects. These variables are server-only; do not prefix them with `NEXT_PUBLIC_`.
4. Set `GOOGLE_REDIRECT_URI` on the frontend to the matching callback URL. Restart local servers or redeploy both projects.

Django exposes `POST /api/auth/google/` using its existing allauth tables; no new model migrations are needed. Existing migrations must already be applied. Configure the Google provider through environment variables as above rather than creating a duplicate Google SocialApp in Django admin. Existing password accounts are not automatically linked just because the email matches. A missing configuration or cancelled flow returns to the account page with an explanatory message.


## Automatic news publishing

The n8n JSON files are references for related improvements, not a literal publishing policy. Crawled news keeps its existing structure and publishes immediately. There is no draft state, review queue, approval checkbox, keyword-density gate, or mandatory long-form article structure.

Django prepares missing search/social previews automatically from the original headline and summary. Provider updates refresh automatically derived previews while custom metadata remains intact. Source content, author, article URL and publication time are preserved. Existing reader pages, numeric `/news/<id>` URLs and feeds continue working.

The public `/sitemap.xml` includes indexable articles and is advertised in `/robots.txt`. Set backend `PUBLISHING_SITE_URL` to the frontend `NEXT_PUBLIC_SITE_URL` origin. Migration `0016_automatic_news_publishing` removes the earlier draft/approval implementation, restores the previous article schema, and prepares metadata for existing records. Run the complete migration chain before rollout if the earlier migrations have already been applied.

No paid AI calls, article padding, generated author biographies, guessed facts, or manual approvals are part of this flow. Details are in the companion backend's `docs/publishing-workflow.md`.

### Editorial layout and article photography

The homepage uses a photo-led lead story, supporting headlines, feature tiles, and an article grid. Search, topics, accounts, saved stories, the personal feed, and coverage comparisons remain available on desktop and mobile.

Article images try the API image, crawled remote image, uploaded image, social image, and existing story-specific image, then a local topic photograph. Broken images advance through those candidates automatically. Local fallbacks are labelled **Illustrative photo** so readers can distinguish them from source reporting. They never delay publication or change article records. Subjects without a specific match use the general reporting photograph. See [photograph sources and license](public/images/editorial/CREDITS.md); add new subject photos and mappings in `src/lib/api.js` as coverage expands.

### Country editions and languages

The country dropdown offers 61 editions. A saved choice takes precedence; first-time visitors use Vercel's country header, with browser timezone/locale as a fallback. When detection cannot identify a supported country, readers choose one explicitly. The selected country updates the homepage wording and is sent to headlines, comparisons, search, timelines, personal and saved feeds, RSS previews, category counts, recaps, and Ask Aboki AI. Country matching uses complete country tokens and aliases; UK no longer includes the world desk. Countries with no collected reporting show an empty edition instead of another country's stories. The API must be updated alongside the frontend for server filtering and regional AI answers.

The language dropdown offers 21 languages, with translated core navigation and RTL support for Arabic, Urdu and Persian. Secondary interface strings fall back to English where a translation is missing. Article translation uses the browser's translation engine when available; unavailable translations retain the original report and explain the limitation.

Legacy generated starter cards (`story-11` through `story-20`) and the `story-2` chart are excluded even when stored in an API image field. Source photographs such as `story-4` remain eligible. Added locally stored refinery, data-centre, transmission-line, finance, London, Earth and Europa Clipper photographs provide relevant labelled illustrations when an original source photograph is unavailable. See the image credits above.

### Current topics, categories, and the member live desk

**Topics** in the main navigation opens `/topics`, which shows current published headlines and source tags with an explicit category on every story. It refreshes every 30 seconds while the tab is visible. Topic preferences remain available at `/news/custom` through “Manage followed categories.”

The sidebar now has one **Explore categories** section, including Sports, Culture, Arts, Finance, Games, Entertainment, and other desks. Categories without reporting in the selected country show an empty edition. The coverage/framing section follows Latest briefing, and Latest News spans the content width below it.

**Live**, beside RSS, opens `/live`. Guests see an account sign-in panel. Members receive the country-filtered `/api/reader/live/` feed across all categories, regardless of followed-topic preferences, with an optional category filter. Django enforces authentication on `/api/live/`; the frontend proxy forwards the session without exposing tokens. Updates poll for new published stories every 30 seconds, pause in hidden tabs, and resume when the tab becomes visible. “Live” means automatically refreshed published reporting, not a video broadcast or an additional crawler. Existing ingestion schedules determine when new reporting becomes available.

## Private admin panel

Visit `/admin/login` with a Django staff/superuser account provisioned on the
backend using `python manage.py createsuperuser`. There is no public admin signup.
The six sections are `/admin`, `/admin/articles`, `/admin/categories`,
`/admin/sources`, `/admin/logs`, `/admin/settings`. They use the existing HttpOnly
reader session and a server-authorized `/api/admin/*` proxy. Staff may manage
content and automation; permanent deletion and role changes require superuser.

Set server-only `API_SERVER_URL` to the backend origin ending in `/api`; keep
`NEXT_PUBLIC_API_BASE_URL` pointed at its public API. Secure cookies require HTTPS
in production. The public site keeps its existing layout; admin pages have their
own navigation and use the same color variables. No public navigation link was
added. Existing `/superadmin` editorial functionality remains available.

Backend migrations and a separately deployed worker are required for automation.
See the companion `newsapp-server/docs/admin-panel.md` for the full operational
runbook and change manifest. No production migrations or deployment were run.

The new browser suite runs against a fresh temporary SQLite Django database, with
explicit test-only accounts. It never uses the configured `.env` database:

```bash
CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npx playwright test --config playwright.admin.config.ts
```

The sibling backend and workspace `.venv` must be present. Run this separately
from other Next development servers in this checkout; they share `.next`.

## Updated reader experience

`/topics` is the shared category browser and subscription editor; all old
`/news/custom` links redirect there. My Feed, sidebar categories, dashboard and
footer links use the same interface. Category selection is in the URL and marked
orange. Timelines and Briefing Recap use strict publication-time windows; empty
windows stay empty. Briefing Recap is beneath Ask Aboki AI in the sidebar.

Ask Aboki shows stored-news answers as article links and general questions as
plain text. Set backend `OPENAI_API_KEY` for general answers; news retrieval works
without it. General answers cannot guarantee correctness or access live facts.

Email recovery uses `/forgot-password` and `/reset-password/<uid>/<token>`, through
a same-origin server proxy. Configure backend SMTP and a trusted
`PASSWORD_RESET_FRONTEND_URL`; see `newsapp-server/docs/reader-experience.md`.
Tokens expire after one hour and are single use. Password changes revoke existing
JWT access and refresh tokens. Deploying this token check requires existing
readers to sign in again. No account passwords or API keys belong in frontend env.
