# Front-end conventions

How every front-end lane builds and tests, so lanes working at once stay coherent and merge cleanly. What to build is in your ticket and the [front-end-site spec](../../.scratch/front-end-site/spec.md); this is how. Lanes don't edit this file: leave notes in your ticket's Comments, and front-end-site ticket 15 folds them in.

## Page turns

- Give a `Link` that goes deeper or onward `transitionTypes={turnForward}` (cards, related links, "next", search results, A–Z entries, contents-plate rows, map points, Start): the page turns forward, like reading on.
- Give breadcrumbs and "previous" `transitionTypes={turnBack}`: stepping back up turns the page back.
- Leave header, footer and menu links untyped: moving between sections isn't reading on, so the page changes at once.
- Never type the browser's Back and Forward: moving through history stays instant.
- Import `turnForward` and `turnBack` from `@/components/PageTurn`, and wrap each page's `<main>` in `<PageTurn>`: it maps the types to the turn and keeps the header and footer still.
- To fly a card's title into the next page's heading, wrap both in `<ViewTransition name={…} share="morph" default="none">` under one name, as `ConceptCard` and the Concept heading do: a name on each page makes one morph.

## Ink

- Add `data-ink` to a link or button to spread ink from the point pressed: one delegated listener in the layout (`InkSpread`) serves the whole site, so the control stays a server component.
- Never add a click listener of your own for ink: the shared one is passive, so it can't delay or swallow a press.

## Press ornaments

- Draw only in Press's vocabulary of ink, rules and paper (D21 in the site decisions): the folio, the lotus Fleuron, OrnamentRule, rules and dotted leaders. No dot grids, looped line drawings, knots, rosettes or threads.
- Use `<Fleuron />` from `@/components/Fleuron` still, and `<Fleuron draw />` only for a page's one opening moment: it draws itself in once on load, stroke by stroke (`--duration-stroke` a stroke), and scrolling never redraws it.
- Use `<OrnamentRule />` from `@/components/OrnamentRule` as a section break: its two rules ink in from the centre, out from the Fleuron, as it scrolls into view (a scroll-driven animation, no listener or observer).
- Ink a rule or a dotted leader in by transform (`scaleX` from the end it grows out of) or, in SVG, by stroke offset: never by width, which moves layout.
- Keep the finished ornament the default, and animate only inside `@media (prefers-reduced-motion: no-preference)` (and `@supports (animation-timeline: view())` for scroll): reduced motion, browsers without scroll timelines and visits without JavaScript all see it whole.
- Keep a scroll-inked ornament more than about half a screen above the end of its page: an OrnamentRule finishes inking 40% of the way through its pass, so one lower stays part-inked.
- Leave ornaments `aria-hidden`, and name the link round one instead: they are decoration.
- Build the later Press replacements in the same way, each in its own ticket: the Topics contents plate (06 and 11: rows set like a book's contents, with Devanagari numerals and dotted leaders, the row pointed at or focused lit through `:has()` and its leader inked in), cross-reference rules on the Concept page (05: dotted leaders inked in on scroll, still in print and under reduced motion), the KarmaYoga progress tally (10: 45 short rules in groups of 12, 6, 9 and 18, inked as statements are answered, `aria-hidden` beside the Progress element) and the Concept map's printed plate (12: hairline curves, solid, dashed or dotted by link type, inked once on load).

## What moves, and what never does

- Animate only transform, opacity, clip-path and SVG stroke offsets (plus the foundation's link underlines): they don't move layout, so nothing shifts or janks.
- Add no scroll or resize listeners and no observers (IntersectionObserver, ResizeObserver, MutationObserver): scroll effects are CSS (scroll-driven animations, `:has()`), which run no script.
- Add no new uses of Motion: it loads lazily for the script switch's knob alone, and more of it would weigh on first loads.
- Reserve every drawing's box (width and height attributes, as `Fleuron` does): drawing in must never shift what is around it.
- Under "reduce motion", keep everything still and every feature working: lose the animation, never the feature (NFR-01).

## Colours

- Use colours only as tokens from `src/styles/globals.css`, which ticket 04 owns (`color-mix()` of tokens is fine): one file holds the palette, and the contrast test checks its pairs.
- If a token is missing, ask in your ticket's Comments; if you can't wait, append it at the end of `globals.css` in a block commented with your ticket number, and name it in your summary.

## Links and content

- Make every internal link with `hrefFor()` from `@/content`: an address then changes in one place, and ticket 03's lint rule rejects a path typed into an `href`.
- Read content only through `@/content`: its internals are private, and the lint boundary rejects them.
- In a `'use client'` file, import `@/content` for types only (`import type`): content stays out of the browser's bundle.
- Write only interface text (labels, buttons, empty states, help), plainly and in components: everything else is content, and nothing you write may pass for it.
- Never show held-back text or the KarmaYoga answer key anywhere: they aren't in the content module, and must stay out of every page.
- Tag IAST `lang="sa-Latn"` and Devanagari `lang="sa-Deva"`, as ScriptPair, SanskritTerm and Shloka do: screen readers then pronounce them (WCAG 3.1.2).

## Files

- Create and edit only the files your ticket's Owns list names: lanes build at once and merge one by one, and two lanes editing one file collide.
- Ask in your ticket's Comments for a change to any other file; a one-line change you can't avoid (an export, a type) is allowed if your summary names it.
- Treat the foundation's shared parts (the wordmark, folio, Fleuron, OrnamentRule, breadcrumbs, cards, citation, verse) as read-only once ticket 03 has adapted them, unless your Owns list names one.
- Test each page type or shared part in its own spec file, owned by its ticket: no two lanes edit one spec.

## Shared pieces

- Fill only your own slot, keeping its props: ticket 04 adds each once, so no lane edits the header, the layout or the head.

  | Slot | File | Filled by |
  | --- | --- | --- |
  | SearchTrigger | `src/components/search/SearchTrigger.tsx` | 09 |
  | ScriptPreference, HeadScript and ScriptPair | `src/components/script/` | 13 |
  | ProposalNote | `src/components/proposals/ProposalNote.tsx` | 12 |
  | LinkPreview and its root | `src/components/preview/` | 05 |

- Read feature flags (`features` from `@/config/features`) on the server, and hand one to a client component as a prop: flags are read once, when the site builds.
- Make a switched-off feature absent, not hidden: its routes return 404 and leave the route registry, the sitemap, the navigation, search and every link.
- Name title morphs `concept-title-<slug>`, `topic-title-<slug>`, `work-title-<slug>` and `questionnaire-title-<slug>`, and never reuse `site-header` or `site-footer`: two elements with one name on a page stop the transition.
- Give view-transition names to only the first 40 items of a list that reorders: each name is captured and animated on its own, and more cost more than they show.

## Lane commands

- Use the ports your task names: 3110, 3120 or 3130 for Playwright (`E2E_PORT`) and 3210, 3220 or 3230 for Lighthouse (`LHCI_PORT`); the main worktree keeps 3100 and 3200. A Lighthouse run also takes the port after its own, for `next start` behind its HTTP/2 server. A run on a taken port stops at once rather than test another lane's server.
- `pnpm lhci` serves the build over HTTP/2 with TLS, as Vercel does, since Lighthouse's simulated slow 4G models HTTP/1.1's six connections differently. Judge budgets on that default; `LHCI_HTTP=1.1` (plain `next start`) is only for comparing.
- Free your own port (for Lighthouse, the one after it too) before a run with `fuser -k <port>/tcp`, never `pkill -f`: that kills your own shell.
- Run Playwright and Lighthouse only through `scripts/lane/heavy.sh <command…>`: heavy runs queue behind one lock, so the machine is never overloaded.
- In a new worktree, run `pnpm install`, then `node scripts/content/registry.mjs` once: `pnpm check` checks the content registry but doesn't write it.
- While working, narrow runs with `E2E_ONLY=<spec,…>` and `E2E_SCOPE=sample`: the full suite is for the done-check and the merger.
- Done-check: `pnpm check`, then `E2E_SCOPE=sample E2E_PORT=<port> scripts/lane/heavy.sh pnpm check:e2e`; the merger runs `E2E_SCOPE=full` after merging. Tickets 01 and 15 also run `LHCI_PORT=<port> CHROME_PATH=/usr/bin/google-chrome scripts/lane/heavy.sh pnpm lhci`.

## Tests

- Import `test` and `expect` from `tests/e2e/fixtures.ts`: a fixture added there reaches every spec.
- Open a page with `gotoReady(page, path)` before clicking, typing or pressing keys: it waits until React has hydrated (`html[data-hydrated]`), so no press lands before the handlers.
- With JavaScript off, open pages with `page.goto`: nothing hydrates, so there is nothing to wait for.
- Loop over routes with `inScope()`: `E2E_SCOPE` then picks every route, or one of each kind.
- Assert what a person sees and can do (roles, names, states, where focus lands), never class or keyframe names: those change while the behaviour stays.
- Never assume exact positions or which way something moves: GitHub's runner lays pages out slightly differently.
- After scrolling, wait two animation frames before reading a scroll-driven drawing, and poll for a performance entry before reading it: both arrive a little after the action that causes them.
- Hover a link and wait for its prefetch (`prefetched()` in `page-turns.ts`) before pressing it to test a page turn: with Next.js 16.4, a link pressed mid-prefetch loses its transition types.
