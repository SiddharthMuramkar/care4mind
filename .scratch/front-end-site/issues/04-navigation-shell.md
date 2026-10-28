# 04: Navigation shell

Status: ready-for-agent
Blocked by: 01
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §C1, §C2 · Decisions: D01, D20

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
- `src/components/SiteHeader.*`, `SiteFooter.*`, `Wordmark.*` and the foundation's logo, plus `MotionProvider.tsx`
- `src/components/nav/**` (new): the panels, the Drawer and the Menu button
- `src/components/toast/**` (new): the Toast provider and a `toast()` helper
- `src/config/features.ts` (new, or extended if content-v1 already created it for the preview flag)
- slot stubs, each owned afterwards by the ticket that fills it:
  - `src/components/search/SearchTrigger.tsx`, owned by 09
  - `src/components/script/**` (ScriptPreference, HeadScript and ScriptPair), owned by 13
  - `src/components/proposals/ProposalNote.tsx`, owned by 12
  - `src/components/preview/**` (LinkPreview and its root), owned by 05
- `tests/e2e/nav.spec.ts` (new), and the foundation's header and logo spec files. If those checks sit inside a shared file such as `pages.spec.ts`, which ticket 02 owns, leave them there and don't edit that file.
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
