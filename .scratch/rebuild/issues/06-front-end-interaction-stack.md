# Front-end interaction stack and quality checks

Type: research
Mode: AFK
Track: site
Status: resolved
Blocked by: none
Map: [Care4Mind.org rebuild](../map.md)

## Question

Which front-end stack gives the site a custom, crafted, highly interactive feel, with motion and feedback on scroll and click? It must still meet NFR-01 (WCAG 2.2 AA) and NFR-02 (Core Web Vitals "good" on mobile: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1). Assume the framework is likely Next.js (React), but flag anything that differs on Astro or SvelteKit.

Survey these as of October 2026, from current docs (context7 first):

- **Styling:** Tailwind CSS, CSS Modules, vanilla-extract, and design tokens.
- **Accessible component primitives:** Radix, React Aria, Ark UI and Base UI.
- **Motion:**
  - Motion (formerly Framer Motion)
  - GSAP and ScrollTrigger, and GSAP's licence
  - CSS scroll-driven animations and the View Transitions API
  - smooth-scroll libraries such as Lenis

  For each, record how it affects INP, CLS and main-thread time.
- **Accessible motion:** `prefers-reduced-motion`, and the keyboard and focus patterns that keep rich interaction accessible.
- **Crafted look:** what makes an interface read as hand-crafted rather than template-made or AI-generated, from credible design sources.

Also record which tools check FR-06 (360–1440 px), NFR-01 and NFR-02 automatically in CI on Vercel, such as Playwright, axe-core, Lighthouse CI and Vercel Speed Insights. Note what still has to be checked by hand.

Nobody decides here. The facts feed [Design direction](21-design-direction.md) and the [Architecture review](23-architecture-review.md).

## Answer

Researched 2026-10-26. Full findings: [`front-end-interaction-stack.md`](https://github.com/SiddharthMuramkar/care4mind/blob/research/front-end-interaction-stack/.scratch/rebuild/research/front-end-interaction-stack.md) on branch `research/front-end-interaction-stack` (pushed, never merged; commit `1661d9a`).

- What decides INP, CLS and LCP is what gets animated (transform, opacity, filter, clip-path) and how much JavaScript ships, not which motion library is used.
- React 19.3 made `<ViewTransition>` stable (Sept 2026) and Next.js runs it with no setup. CSS scroll-driven animations stay off the main thread but don't work in Firefox.
- Motion is MIT and about 5 kB to start if lazy-loaded, but ignores reduced motion unless set to `'user'`. GSAP is free under Webflow's own licence, not open source. Lenis puts wheel scrolling on the main thread.
- Base UI (shadcn's default since July 2026) and React Aria lead the accessible primitives. Tailwind 4 `@theme` tokens are what Next.js recommends.
- CI: Playwright at several widths plus axe-core (finds about 57% of issues; needs the `wcag22aa` tag), Lighthouse CI (no INP), Vercel Deployment Checks. Real-visitor INP needs Speed Insights or web-vitals.
- NFR-01's reduced-motion rule is WCAG AAA. WCAG Reflow tests at 320 px, narrower than FR-06's 360 px. Screen readers, keyboard, motion comfort and real phones still need checking by hand.

**Candidate, not decided:** Next.js 16 + React 19.3; Tailwind CSS 4 tokens in `@theme` plus CSS Modules; Base UI (React Aria runner-up); motion cheapest first: CSS transitions, `<ViewTransition>` for page transitions, Motion (`LazyMotion`, `reducedMotion='user'`) for springs and gestures; GSAP ScrollTrigger held back for one signature scroll sequence; no Lenis. The [Design direction](21-design-direction.md) tries it and the [Architecture review](23-architecture-review.md) confirms it.

**Verified:** 17 claim groups rechecked, 6 minor corrections (dates, a Playwright version note, citation precision, one overstated claim that all design sources agree). None changes the candidate.

**Gaps** (all listed in the findings): Nothing was measured hands-on; sizes are npm or vendor figures. GSAP's licence page was down, so its terms were read from a 2026-10-17 archive copy and need rechecking before the build. Whether Lighthouse CI can measure INP wasn't confirmed.
