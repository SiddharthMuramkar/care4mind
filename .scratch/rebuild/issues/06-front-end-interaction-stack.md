# Front-end interaction stack and quality checks

Type: research
Mode: AFK
Track: site
Status: open
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
