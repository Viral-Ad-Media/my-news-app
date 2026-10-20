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
