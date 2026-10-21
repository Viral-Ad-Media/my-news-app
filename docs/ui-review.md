# Reader UI and motion review

This update keeps the Next.js App Router, Tailwind 3, existing brand logo and local Geist font, API contracts, routes, and reader workflows.

Guidance: [shadcn/ui](https://ui.shadcn.com/), [Emil Kowalski’s design engineering skill](https://github.com/emilkowalski/skills/blob/main/skills/emil-design-eng/SKILL.md), and [taste-skill app screens](https://github.com/leonxlnx/taste-skill/blob/main/skills/taste-skill/references/app-screens.md).

## Direction and product decisions

Taste-skill dealt two compatible light app styles. Selected **Editorial greeting**, seed **1449238297**, keeping the existing brand palette/type. The reader is a repeat-use application, so the app-screen rules apply: there is no decorative entrance/stagger requirement. Its question is “Which story should I read, and where did it come from?” The product’s face is its own AbokiNews wordmark and the source-labelled Nigerian briefing. Its signature element is a story led by its headline and publisher, with the original-source workflow preserved on detail pages.

Inventory: source-linked articles; real publication dates; Nigerian country filtering; topic categories and article counts; stored story summaries; saved stories; JWT-backed sessions; reader preferences; questions grounded in stored stories; and the existing AbokiNews mark. No invented audience counts, bias percentages, or publisher photographs are added.

This is a restyle of an existing reader. The navigation stays in its existing top-bar position, rather than replacing it with the sheet’s optional workspace sidebar. The home uses an aligned 9/3 column split and a text-led briefing. Counts come from the API. When a story has no image, the layout uses its actual headline and summary instead of a repeated placeholder picture.

## Before and after

| Before | After | Why |
| --- | --- | --- |
| Mobile nav toggled in document flow | shadcn Sheet with Radix focus management, Escape, and trigger focus return | Accessible navigation without moving the reading layout |
| Bespoke inputs and buttons | Local shadcn Button, Input, Label, Select, Checkbox, Tabs, Card, Badge, and Skeleton components | Consistent focus, disabled, selected and checked states |
| 300ms shadow changes on resting cards | Quiet tonal surfaces and subtle pointer feedback | Reading stays immediate; decorative card motion is removed |
| Keyboard menu activation could animate | Input-modality handling disables menu/select motion for keyboard use | Repeated keyboard actions remain immediate |
| No reduced-motion rules | No drawer/select travel or button scaling with reduced motion | Preserves content and focus without travel |
| Placeholder photographs and overlaid headlines | Text-led briefing; photos render only when provided by the story | No invented photo context or unreadable text overlays |
| Non-functional plus buttons inside topic links | Real topic links with counts or simple arrows | Removes invalid nested controls and misleading affordances |
| Plain loading strings and errors without recovery | Layout-shaped flat skeletons and local Retry buttons | Makes progress and recovery clear |

## Component ownership

`components.json` configures the **new-york** shadcn style for the existing Tailwind 3 project. Components were fetched from the official `ui.shadcn.com/r/styles/new-york/` registry and adapted to the app’s tokens, touch sizes, and motion rules. Their MIT license is retained in `src/components/ui/LICENSE.md`. Radix primitives provide keyboard and focus behavior; CSS controls motion, without a separate animation library.

`InteractionPreferences` tracks keyboard versus pointer use. Motion is limited to button press feedback (140ms), the menu entering (220ms) and leaving (140ms), and origin-aware country-select feedback (160ms). Keyboard actions and reduced-motion users bypass travel. Stories do not animate in. Only floating menus/dialogs retain shadows.

## Validation

Run `npm run lint`, `npm run build`, `npm audit --omit=dev`, and `npm run test:ui`. Install browser tooling first with `npx playwright install chromium`; for an already installed browser, set `CHROME_PATH` to its executable. Browser tests start a local Next.js server and mock responses; they do not create production users or change production stories.

Seven browser tests cover 390/768/1440px layouts, search and UTC publication dates in an America/Chicago browser, mobile menu keyboard focus/Escape/link navigation, reduced motion, keyboard topic selection with the saved category IDs, and save/unsave request methods and pressed state.

The visual review uses the existing ten source-linked stories through a local fixture API, with no invented published content. Screenshots and browser output are local review artifacts and excluded from git. Production deployment and physical-device testing are separate from these local checks.

## Final screenshot critique

Reviewed the fold and full-page contact sheets at **1440, 768 and 390px**. The final taste-skill inspection reports **0 failures and 2 warnings**, compared with 3 failures in the original layout. The mobile title is 24px; desktop/tablet are 30px. Body copy is 16px with 1.63 line height.

1. **Reading order:** the lead Nigerian headline is the largest story and its publisher, summary, date and Read story action answer what to read and where it came from. Search remains available above it.
2. **Edges and space:** the header, title and content share a centred 1100px frame. Story pairs share edges and gutters. The inspector flags 42px bands around lead-story metadata/actions and some shorter peer cards; these retain separation for the reading action and consistent row geometry. No empty viewport-sized region precedes the next section.
3. **Colour and face:** the existing AbokiNews mark identifies the reader on the first screen. Neutral tonal cards keep attention on the headline; no fabricated chart/status colours or decorative imagery are added.
4. **Facts:** publication dates and source names match between briefing and latest-news cards, including UTC midnight in a browser west of UTC. Topic counts come directly from the API; category membership can overlap, so counts are not presented as a distinct-article total.
5. **Missing and zero:** a missing photo removes the image region; an invalid/missing date says “Date unavailable.” Empty feeds have a written explanation. Category counts describe articles beside named topics, not notifications.
6. **Labels:** there are no charts or legends to reconcile. Sources remain beside their stories; category links wrap without colliding with adjacent labels.
7. **Phone:** navigation folds into a keyboard-accessible sheet; the country filter wraps below search and stories become one column. The first screen retains the lead headline and Read story action. The sidebar follows the story list, preserving reading priority.

The second warning is below-fold content: this is a scrolling reader with ten full summaries, rather than an operational dashboard that must expose every module at once. The three-story briefing provides the first-screen choice, with the full list below. No inspection exceptions were used. The real starter stories were used only through a local fixture API for review; no new production seed content or fabricated photographs need replacing.

## October 20: editorial SEO workspace and account dialogs

Uses taste-skill's **Achromatic ledger**, seed **2120622647**, retaining local
Geist, the AbokiNews wordmark, existing theme support and the Next/Tailwind 3
stack. The app-screen run applies to forms and editor/detail screens. There was
no redraw. The public top navigation is retained because this is an existing
reader; its phone folding rule was repaired rather than replacing the shell.

Inventory: editorial headlines, source references, summaries, article bodies,
publication dates, topic categories, saved stories, reader sessions, the existing
wordmark and the new search/social metadata. The product's face is its reading
desk and source attribution; the editor's signature element is a live preview of
the post's own search result beside the writing fields. Blue marks the preview
and editorial score, while chrome stays neutral. No stock photos, fake audience
numbers or testimonials were added.

Questions: **editor** — what should I improve before publishing this post?
**login** — how do I return to my reading desk? **signup** — how do I create a
reader account? **article** — what is the explanation and where is its reference?

| Before | After | Why |
| --- | --- | --- |
| Desktop login form displaced below a benefits panel | One shared auth frame with aligned form and reading benefits | The sign-in task stays visible |
| No h1 on login | One 24px h1 on each full auth page | Clear orientation and semantics |
| Desktop navigation stayed visible on phones | Tailwind visibility works after removing a custom `display:flex` override | Frees the first phone screen for its task |
| Account links only changed pages | Lazy-loaded Radix dialogs plus direct page routes | Quick access without losing the reading context |
| Large admin banner and six separate KPI tiles on every tab | Compact title/navigation; real count strip only on overview | Writing and search preview lead on the editor tab |
| No saved SEO controls or draft checks | Editable search/social fields, clear score breakdown and preview | Connects editorial changes to what they produce |
| Unrelated category image and generic coverage for a new explainer | Missing images stay absent; comparison panels need multiple supplied perspectives | Displays the post's real material |

The dialog's only entrance is a 180ms transform/opacity response, with a 160ms
opaque-overlay fade. Keyboard activation and reduced motion remove travel. Inputs
do not stagger or reveal on scroll. Opening focuses the username; switching modes
focuses the new form, and Escape returns focus to the trigger. Full-page and popup
forms have separate IDs. The user can keep the full-page flow.

### Screenshot critique

The fold and full-page sheets were opened at 1440/768/390px, alongside dark mobile
login and signup states and a populated editor preview. The five new source-linked
explainers were served through a local fixture API for review; no production
accounts were used or created. The live editor review called the actual backend
analysis function through the frontend proxy. No sample text needs replacing in
the production UI: review data comes from the pending editorial batch.

1. **Reading order:** auth opens on a named form; editor writing and search settings share the first desktop screen. The score is secondary to the post, with each failed check naming an action.
2. **Frame:** centred auth panels share edges; the 1280px editor uses two writing/settings columns and a full-width post list. The article's independent right rail may end before the full report; that retained ragged-row warning is preferable to stretching short topic/assistant panels into empty frames.
3. **Colour and face:** the existing wordmark remains visible. Only the search preview and score take blue; navigation and controls stay neutral. Dark dialogs have opaque surfaces rather than blur/glass.
4. **Numbers:** score points come from the backend's twelve checks and sum to 100. Character and word counts follow the current draft. Missing analysis is a dash, not a fabricated zero. Existing totals come from the overview API.
5. **Missing data:** no image produces no image region; empty analysis explains how to start. Service failures leave the draft and save action available. Noindex is stated separately from the score.
6. **Labels:** field labels stay beside their fields and the selected tabs identify Search, Social or Advanced. Counts and advice wrap instead of colliding. No chart legends are needed.
7. **Phone:** navigation folds, auth forms fit the width, popup signup scrolls within the dialog, and editor sections stack. Password rules change with input, and focus remains visible. Longer forms intentionally scroll; they do not shrink text to fit a single screen.

Final automated measurements and verification results are recorded with the PR.
The static taste-skill check permits the auth dialog's floating shadow; resting
panels have no new shadows. Physical-device and production-provider testing are
separate from the local browser checks.

| Screen / check | Earlier inspection | Final inspection |
| --- | --- | --- |
| Full-page login, all three widths | 1 failure, 3 warnings | 0 failures, 0 warnings |
| Full-page signup, all three widths | Not separately measured before restyle | 0 failures, 0 warnings |
| Admin | Overview: 1 failure, 3 warnings | New post editor: 0 failures, 0 warnings |
| New explainer detail | First review: 2 failures, 1 warning | 0 failures, 1 warning (independent sidebar length) |
| Static check of changed auth/editor components | — | 0 failures, 1 warning (real floating dialog shadow) |

The final editor fold was re-captured after warming the development API routes;
the earlier cold-start capture showed the legitimate loading state instead of the
loaded editor. Final fold and contact sheets were opened for every width. The
populated preview used the real analysis function and showed 55/100 with six
specific improvements, rather than a fabricated perfect score.
