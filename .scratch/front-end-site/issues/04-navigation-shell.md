# 04: Navigation shell

Status: ready-for-agent
Blocked by: 16
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §C1, §C2 · Decisions: D01, D20, D21

**What to build:** the frame every page shares, finished once so that no later ticket has to touch the header, the footer, the layout or the tokens.

- The header shows Concepts · Texts · Questionnaires · Library · Search on every page.
  - On a computer, Concepts and Library open panels.
  - On a phone, a Menu button opens a sheet that slides in, swipes away and closes when you pick a page.
  - Every link works without JavaScript.
- The footer carries the full navigation.
- Behind the frame, this ticket adds once, for everyone:
  - the feature flags;
  - the toast system for "Copied" messages;
  - every new design token;
  - the slots: components whose interface is fixed now and whose inside later tickets fill.

## Owns

- `src/app/layout.tsx`
- `src/styles/globals.css`, the only owner of tokens from now on
- `src/lib/contrast.ts` and `tests/unit/contrast.test.ts`: the new colour pairs
- `src/components/SiteHeader.*` and `SiteFooter.*`, plus `MotionProvider.tsx`. The logo (`Logo.*`, now the Press wordmark) is ticket 16's: use it as ticket 16 left it.
- `src/components/nav/**` (new): the panels, the Drawer and the Menu button
- `src/components/toast/**` (new): the Toast provider and a `toast()` helper
- `src/config/features.ts` (new, or extended if content-v1 already created it for the preview flag)
- slot stubs, each owned afterwards by the ticket that fills it:
  - `src/components/search/SearchTrigger.tsx`, owned by 09
  - `src/components/script/**` (ScriptPreference, HeadScript and ScriptPair), owned by 13
  - `src/components/proposals/ProposalNote.tsx`, owned by 12
  - `src/components/preview/**` (LinkPreview and its root), owned by 05
- `tests/e2e/nav.spec.ts` (new), and the foundation's header spec files. `logo.spec.ts` is ticket 16's; once it has merged, edit it only where the new header changes what it checks, such as the tab order. If those checks sit inside a shared file such as `pages.spec.ts`, which ticket 02 owns, leave them there and don't edit that file.
- `tests/unit/features.test.ts` (new)

## Acceptance criteria

- [ ] **Main navigation (D01):**
  - Every page's header shows the logo and then, in order, Concepts · Texts · Questionnaires · Library · Search.
  - They are server-rendered links to `/concepts/`, `/texts/`, `/questionnaires/`, `/library/` and `/search/`, made with `hrefFor()`, and they work with JavaScript off.
  - The section you are in is marked visibly and with `aria-current`: `"page"` on the section's own page and `"true"` below it.
- [ ] **Panels on wide screens** (a Base UI NavigationMenu, with links rendered through Next's `Link`):
  - The Concepts panel lists the five topics with their Concept counts, the A–Z and, while `conceptMap` is on, the Concept map.
  - The Library panel lists its five pages.
  - Each panel opens from the keyboard and closes with Escape, with focus back on the control that opened it.
  - Hover opens it after a short delay, and the panel stays open while the pointer moves into it (WCAG 1.4.13).
  - A panel never traps focus.
- [ ] **Menu on narrow screens:**
  - Below the width at which the five sections fit on one line, a "Menu" button opens a Base UI Drawer.
  - Its code loads on the first press or when the browser is idle.
  - While open, focus moves into the sheet and stays there.
  - Escape, a Close button or a swipe dismisses it, and following a link closes it and navigates.
  - Focus returns to Menu when it closes.
  - Without JavaScript, Menu is a link to the full navigation in the footer.
- [ ] **Fits at every width:**
  - The header neither wraps nor scrolls sideways at 320, 360, 768 or 1440 px.
  - Every header control is at least 44 × 44 CSS px, and the logo keeps its 48 px target.
- [ ] **Footer:**
  - The full navigation: every section and every Library page.
  - The wordmark, tagline, credit and preview notice.
  - A link to `/proposals/` while either proposal flag is on.
- [ ] **Feature flags (D16, D20):**
  - `features` has `questionnairePreview`, `conceptMap` and `devanagariFirst`.
  - Each is on in local runs and Vercel previews, off when `VERCEL_ENV` is `production`, and can be forced either way by its own environment variable.
  - Unit tests cover the three environments and both overrides for each flag.
  - If content-v1 already reads the preview flag somewhere else, that place reads `features` instead.
- [ ] **Toasts:**
  - One Base UI Toast provider sits in the layout, with a `toast()` helper for later tickets.
  - Toasts are announced politely and never take focus.
  - Each stays at least 5 s, pauses while hovered or focused, and can be dismissed.
- [ ] **Slots,** with their props final and documented in a short comment, so later tickets change only their insides:
  - **SearchTrigger** sits in the header and the Drawer. Its stub is a link to `/search/` labelled "Search", and it accepts an optional initial query.
  - **ScriptPreference** sits in the header and the Drawer. Its stub renders nothing.
  - **HeadScript** sits in the document head. Its stub renders nothing.
  - **ScriptPair** renders a term's two spellings, IAST then Devanagari, each with its `lang` tag (`sa-Latn`, `sa-Deva`).
  - **ProposalNote** works from day one: a labelled note reading "Proposal" that links to `/proposals/`.
  - **LinkPreview** takes a link plus a typed preview payload (kind, name, Devanagari, gloss and a short text). Its stub renders the plain link, and its root, mounted once in the layout, renders nothing.
- [ ] **Tokens, once.** `globals.css` gains every token later tickets need, so none of them edits it:
  - topic hues;
  - Questionnaire status colours (always paired with text);
  - the Proposal label;
  - surfaces for the toast, Drawer, palette and previews;
  - the scroll shadow;
  - the offset that keeps sticky parts below the header;
  - z-index layers;
  - durations for morphs and list reordering.

  Every new text pair is added to the contrast test at 4.5:1, and every graphic or focus pair at 3:1.
- [ ] **Press only (D21):** after merging the integration branch with ticket 16, this lane's Kolam uses go:
  - the `kolam()` call in NavPanels, `<Kolam>` in MenuDrawer and ToastViewport, and `<Logo redraw>`;
  - the kolam colour tokens its CSS reads.

  The drawings are replaced with Press ornaments (the Fleuron or OrnamentRule) and the colours with Press tokens, and `git grep -il kolam -- src tests docs` prints nothing on this lane. This ticket no longer owns the logo: ticket 16 does.
- [ ] **Reduced motion:** panels and the Drawer open and close without sliding or fading, and still work.
- [ ] **Speed:**
  - The header adds no layout shift.
  - The Drawer's code isn't in any page's first-load JavaScript.
  - Opening the Drawer is measured once at 4× CPU slowdown and recorded in Comments; ticket 15 adds the standing check.
- [ ] **Tests:** `nav.spec.ts` covers:
  - every header link with JavaScript disabled;
  - opening and closing each panel by keyboard, with focus returning;
  - the Drawer at 360 px: it opens, Tab stays inside, Escape closes it, focus returns, and a link closes it and navigates;
  - axe with each panel open and with the Drawer open;
  - no overflow at 320 px.
- [ ] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments

### Build notes (lane/site-04, 2026-10-28)

**What is built**

- **Header** (`SiteHeader.tsx`, `nav/**`): a sticky indigo strip. It holds the logo, then Concepts · Texts · Questionnaires · Library as server-rendered `hrefFor()` links, then Search (the SearchTrigger slot), the ScriptPreference slot and Menu.
  - `aria-current` comes from the address (`nav/current.ts`, `CurrentLink`): `"page"` on a section's own page, `"true"` below it. Topics count as below Concepts (design B6).
  - The current section shows a vermilion lozenge under its name, hollow for `"true"`.
  - A scroll-driven shadow (CSS `scroll(root)`, no listener) lifts the strip once the page moves under it.
- **Panels** (`NavPanels.tsx`, Base UI NavigationMenu with `render={<Link/>}`): each section link stays a plain link to its page. A chevron toggle beside Concepts and Library ("More in Concepts", "More in Library") opens the panel.
  - The panels' code loads when the browser is idle on wide screens, or as soon as a mouse or focus comes near. A toggle pressed before the code arrives opens its panel when it does.
  - Hover waits 120 ms before opening and 240 ms before closing, so the pointer can move into the panel (WCAG 1.4.13). Escape gives focus back to the toggle. Tab runs through the panel and on to the next item, never trapped.
  - The panels are set like a book's contents: Devanagari numerals, dotted leaders that ink in from the centre and a count where the page number would be. Their running head sits over a double rule. Rows rise in turn, only under `no-preference`.
  - The Library rows now count what each page holds, as the Library page does: "188 References", "20 entries", "5 sections".
- **Drawer** (`MenuButton.tsx` + `MenuDrawer.tsx`, Base UI Drawer, `swipeDirection="right"`): without JavaScript, Menu is `<a href="#site-nav">` to the footer's navigation. Once hydrated it becomes a button with `aria-haspopup="dialog"`.
  - Its code loads when the browser is idle on narrow screens, or on `pointerdown` or the first press. It is never in first-load JS.
  - The sheet is a leaf of paper. It holds SearchTrigger, ScriptPreference, the four sections with Devanagari numerals, the topics in their hues with leaders and counts, the Library pages, and a Fleuron.
  - Following a link closes it. `finalFocus` returns focus to Menu.
- **Footer**: wordmark, tagline, the full navigation (every section, A–Z, topics, map and Library pages), Search and Proposals (only while `site.routes()` has them), credit and preview notice. Its `<nav id="site-nav" aria-label="All sections">` is where Menu leads without JavaScript.
- **Toasts** (`toast/**`): `toast('Copied')` or `toast({ title, description })` from any client component. The layout's `Toaster` costs nothing until the first call. Then Base UI's Toast loads, and its polite live region (`priority: 'low'`) mounts two frames before the queued toast is shown, so the first one is announced.
  - A toast stays 6 s, pauses on hover or focus, and has a Dismiss button. It never takes focus.
  - No page calls `toast()` yet, so the first Copy button (05 or 07) should add the e2e check: polite announcement, still there after 5 s, focus unchanged.
- **Flags** (`src/config/features.ts`): `questionnairePreview`, `conceptMap` and `devanagariFirst` come from `readFeatures(env)`. `tests/unit/features.test.ts` covers local, preview and production, plus `1`/`0` overrides, for each flag. Content-v1 already reads them through `createContent(features)`; the shell imports `features`.
- **Slots**: `search/SearchTrigger.tsx` (props `placement`, `initialQuery`, `children`, `className`), `script/ScriptPreference.tsx` (`placement`), `script/HeadScript.tsx`, `script/ScriptPair.tsx`, `proposals/ProposalNote.tsx`, `preview/LinkPreview.tsx` (`children`, `preview: PreviewPayload`) and `preview/LinkPreviewRoot.tsx`. Each has its contract in a comment.
  - HeadScript is mounted in `<head>` only while `devanagariFirst` is on. `<html>` carries `suppressHydrationWarning` for the attribute it will set.
- **Tokens** (`globals.css`, block commented "ticket 04"):
  - Topic hues `--color-topic-*`, reached as `--topic` under `[data-topic=…]`.
  - Status badges `--color-status-*` with `-ink`, reached as `--status`/`--status-ink` under `[data-status=…]`.
  - The Proposal label `--color-proposal(-ink)`.
  - Surfaces `--color-{panel,drawer,palette,preview,toast}` with `-ink`, `-muted` and `-line`, plus `--color-palette-highlight(-ink)`, `--color-backdrop` and `--color-scroll-shadow`.
  - `--header-height`, `--sticky-top` and the `--layer-*` z-index stack.
  - `--duration-morph`, `--duration-reorder`, `--duration-panel`, `--duration-sheet` and `--ease-sheet`.
  - Every new pair is in `src/lib/contrast.ts`: 4.5:1 for text, 3:1 for graphics and focus.

**Decisions the spec left open**

- **Breakpoint 72rem (1152 px).** Below it, the sections move into the Drawer and Search becomes a reading-glass icon. The five sections alone fit from about 60rem. 72rem keeps room for what later tickets add to the strip: the ScriptPreference control (about 48 px, ticket 13) and the ⌘K hint in SearchTrigger (ticket 09). At 768 px the Menu is shown.
- The header is sticky. `html { scroll-padding-top: calc(var(--header-height) + 1rem) }` keeps in-page links and focused controls clear of it.
  - While a native popover is open (the Concept page's "Also spelled"), the header scrolls with the page instead of sticking, so it never covers the popover's focus (2.4.11).
- Header, footer and Menu links carry no page-turn type, as the page-turn rule asks.
- An earlier run shrank the wordmark below 24rem in `Logo.module.css` (ticket 16's file). That change is reverted: the header fits at 320 px with the logo as ticket 16 left it (`nav.spec.ts` "fits on one line" and `reflow.spec.ts` pass).

**Measured**

- **Opening the Drawer at 4× CPU** (`openOnSlowPhone`, 360 px, code already loaded at idle): the press answers in 88 ms on `/` and 96 ms on `/concepts/vikshepa/` (Event Timing). The sheet is visible 211 ms and 225 ms after the press. Ticket 15 adds the standing check.
- **Lighthouse** (`pnpm lhci`, HTTP/2), median of 3 runs:

  | Page | LCP | TBT | CLS | Performance | Accessibility |
  | --- | --- | --- | --- | --- | --- |
  | `/` | 1.89 s | 28 ms | 0 | 1.0 | 1.0 |
  | `/concepts/vikshepa/` | 1.96 s | 39 ms | 0.001 | 0.99 | 1.0 |
  | `/questionnaires/karmayoga-scale/` | 1.90 s | 35 ms | 0.001 | 1.0 | 1.0 |

**Tests changed outside `nav.spec.ts`** (each only where the new header changes what it checks)

- `tests/e2e/home.spec.ts` (ticket 11's) and `tests/e2e/motion.spec.ts` (ticket 02's): the header's Concepts now opens `/concepts/` (D01) instead of gliding to the homepage's Concepts section, so the header case is dropped from the glide and reduced-motion jump loops.
  - In home.spec.ts, the "links to another page jump" test now presses the logo.
- `tests/e2e/logo.spec.ts`: after the logo, the tab order goes to Concepts from 72rem and to Search below it.
- `tests/e2e/page-turn.spec.ts`: below 72rem the header-link check opens Menu first. It no longer waits for prefetch, because an untyped link has no turn type to lose.
- `tests/e2e/underlines.spec.ts`: the header's Concepts underline is checked at 1440 px, where the sections show.
- `eslint.config.mjs`: dropped the `SiteHeader.tsx` ignore for `care4mind/href-from-hreffor`, as its comment asked once this ticket merged.

**Notes for the conventions doc (ticket 15)**

- Use `toast()` from `@/components/toast/toast` for every "Copied"-style confirmation. Never mount a second provider.
- Sticky parts use `top: var(--sticky-top)`. Layers come only from `--layer-*`. Topic and status colour come from `data-topic` and `data-status`, never from a hue written in a module.
- `siteNav()` (`src/components/nav/site-nav.ts`) is the one source for the shell's links. A page that needs "where am I" marking uses `CurrentLink`.
- Heavy interactive parts follow the shell's pattern: a server-rendered link or control that works first, then the island's code from `whenIdle()` or on the first pointer or focus, with an early press replayed when the code arrives.

**Left over:** nothing in this ticket. The toast e2e check waits for its first caller (see Toasts).
