# Front-end conventions

How every front-end lane builds and tests, so lanes working at once stay coherent and merge cleanly. What to build is in your ticket and the [front-end-site spec](../../.scratch/front-end-site/spec.md); this is how. Lanes don't edit this file: leave notes in your ticket's Comments, and front-end-site ticket 15 folds them in.

## Page turns

- Give a `Link` that goes deeper or onward `transitionTypes={turnForward}` (cards, related links, "next", search results, A–Z entries, petals, map points, Start): the page turns forward, like reading on.
- Give breadcrumbs and "previous" `transitionTypes={turnBack}`: stepping back up turns the page back.
- Leave header, footer and menu links untyped: moving between sections isn't reading on, so the page changes at once.
- Never type the browser's Back and Forward: moving through history stays instant.
- Import `turnForward` and `turnBack` from `@/components/PageTurn`, and wrap each page's `<main>` in `<PageTurn>`: it maps the types to the turn and keeps the header and footer still.
- To fly a card's title into the next page's heading, wrap both in `<ViewTransition name={…} share="morph" default="none">` under one name, as `ConceptCard` and the Concept heading do: a name on each page makes one morph.

## Ink

- Add `data-ink` to a link or button to spread ink from the point pressed: one delegated listener in the layout (`InkSpread`) serves the whole site, so the control stays a server component.
- Never add a click listener of your own for ink: the shared one is passive, so it can't delay or swallow a press.

## Kolam behaviours

- Draw with `<Kolam columns rows behaviour>` from `@/components/Kolam`: one unbroken line looped round a grid of dots is the site's signature.
- Pick columns and rows that share no factor (3×2, 9×7): otherwise the line isn't one loop, and the generator refuses it.
- Choose a behaviour: `still` (the default), `draw-on-load` (once, for a page's opening), `draw-on-scroll` (as it scrolls into view) or `redraw-on-hover` (inside a link, on hover or focus).
- Keep the finished drawing the default, and animate only inside `@media (prefers-reduced-motion: no-preference)`: reduced motion, browsers without scroll timelines and visits without JavaScript all see the whole kolam.
- Keep a scroll-drawn kolam more than about half a screen above the end of its page: it finishes drawing 60% of the way through its pass, so one lower stays part-drawn.
- Leave kolams `aria-hidden`, and name the link around one instead: drawings are decoration.

## What moves, and what never does

- Animate only transform, opacity, clip-path and SVG stroke offsets (plus the foundation's link underlines): they don't move layout, so nothing shifts or janks.
- Add no scroll or resize listeners and no observers (IntersectionObserver, ResizeObserver, MutationObserver): scroll effects are CSS (scroll-driven animations, `:has()`), which run no script.
- Add no new uses of Motion: it loads lazily for the script switch's knob alone, and more of it would weigh on first loads.
- Reserve every drawing's box (width and height attributes, as `Kolam` does): drawing in must never shift what is around it.
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
- Treat the foundation's shared parts (Kolam, logo, folio, ornaments, breadcrumbs, cards, citation, verse) as read-only once ticket 03 has adapted them, unless your Owns list names one.
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

- Use the ports your task names: 3110, 3120 or 3130 for Playwright (`E2E_PORT`) and 3210, 3220 or 3230 for Lighthouse (`LHCI_PORT`); the main worktree keeps 3100 and 3200. A run on a taken port stops at once rather than test another lane's server.
- Free your own port before a run with `fuser -k <port>/tcp`, never `pkill -f`: that kills your own shell.
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
