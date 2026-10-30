---
status: accepted
---

# Build the site with Next.js, starting with the front end

The new site is built with Next.js 16 (App Router) and React 19.3, in strict TypeScript, managed with pnpm. The developer chose this on 2026-10-27, while working the planning map's [Design direction](https://github.com/SiddharthMuramkar/care4mind/issues/17), and decided at the same time that execution starts early for the front end only: the code written for the chosen direction is kept, merged and built on, instead of being thrown away. A framework is the hardest part of the code to swap later, so starting real code means fixing it now rather than in the Architecture review.

Next.js was the framework every piece of research assumed or suggested: [App framework and content back end](https://github.com/SiddharthMuramkar/care4mind/blob/505105015beb09f12a7532c9ed33377e131061cf/.scratch/rebuild/issues/04-framework-and-content-back-end.md) pairs it with each content back end it found workable on Vercel and Neon, [Front-end interaction stack](https://github.com/SiddharthMuramkar/care4mind/blob/505105015beb09f12a7532c9ed33377e131061cf/.scratch/rebuild/issues/06-front-end-interaction-stack.md) found the motion and accessibility pieces work with it out of the box, and [Typefaces for IAST and Devanagari](https://github.com/SiddharthMuramkar/care4mind/blob/505105015beb09f12a7532c9ed33377e131061cf/.scratch/rebuild/issues/07-typefaces-iast-devanagari.md) relies on its font loader to self-host fonts that spell ISO 15919. It also runs on Vercel (ADR-0002) with no extra setup.

## Considered options

- **Astro 7.** It ships the least JavaScript by default, which helps speed (NFR-02). But Payload, the leading content back end in ticket 04, runs inside Next.js, and the accessible-component libraries ticket 06 shortlisted are React-only, so they would sit inside React islands anyway.
- **SvelteKit 3.** Ark UI would be its only shortlisted accessible-component library, and its Svelte package lags the others.
- **Wait for the Architecture review.** That would keep ticket 21's code throwaway and repeat the work once the review ends.

## Consequences

- The [Architecture review](https://github.com/SiddharthMuramkar/care4mind/issues/19) confirms this choice rather than making it, and records its own decisions in ADR-0004.
- The content back end, search, media storage and editor login are still open. Until the Architecture review and the Editing trial decide them, pages read content through one small typed content module that reads local files, so a back end can replace it without changing the pages.
- The front-end stack from ticket 06 comes with it: Tailwind CSS 4 tokens plus CSS Modules, Base UI for accessible parts, and motion layered from CSS through React's `<ViewTransition>` to Motion. GSAP and Lenis are not used.
- Whoever maintains the site after handover (FR-09) inherits a Next.js and React codebase.
