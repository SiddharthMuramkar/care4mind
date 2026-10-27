# Design direction

Type: prototype
Mode: HITL
Track: site
Status: claimed
Blocked by: 02, 06, 07
Waits on: [Sample the current site: content shape, navigation and brand](02-current-site-sample.md), [Front-end interaction stack and quality checks](06-front-end-interaction-stack.md), [Typefaces for IAST and Devanagari](07-typefaces-iast-devanagari.md)
Map: [Care4Mind.org rebuild](../map.md)

## Question

What does the new site look and feel like? Coding agents build two or three throwaway directions, each a homepage and a Concept page with real sample content. They use the stack from the front-end research and the typefaces from the typeface research.

Each direction sets:

- a palette that meets WCAG 2.2 AA contrast
- a type pairing and scale
- the logo or wordmark treatment
- imagery
- a motion and interaction language for scroll and click

The bar:

- The site should look made by a dedicated team of human designers: custom and fun to explore, never template-like or generic AI.
- It must meet NFR-01 (including reduced motion) and NFR-02.
- Settle the tone for the subject: an Indian-psychology portal with mental-health-adjacent Questionnaires, for audiences from the general public to researchers.

The developer picks one direction, or a blend. A direction may suggest a feature beyond the requirements, such as an interactive Concept map. List any such feature for the Project owner in the sign-off pack, rather than assuming it. The Project owner approves the direction in the same pack. Link the prototypes from the answer.

## Comments

**Developer decision, 2026-10-27: this ticket also starts the real codebase.**

- Only the style tiles are throwaway: two or three routes under `/directions/<name>`, deployed to a Vercel preview for the developer to pick from, and deleted before the PR is merged.
- The chosen direction is then built properly, in the repo, as the foundation the full site is built on:
  - the homepage, one Concept page, the KarmaYoga Scale intro page (purpose and limitations; questions not live, labelled "coming soon") and the 404 page
  - real text read from the current site's REST API under the map's rules, with Sanskrit stored as NFC and ṁ normalised to ṃ
  - one small typed content module that reads local files, so a content back end can replace it later. No database or CMS yet: the Architecture review and the Editing trial decide those.
  - ESLint, Prettier, Vitest, Playwright at 360, 768 and 1440 px with axe (`wcag22aa`), Lighthouse CI, and a GitHub Actions workflow that runs them all
  - a Vercel project linked to the repo, with a preview for every PR and noindex on every page until launch
  - short repo docs on how to run, test and deploy
- The framework is now Next.js: [ADR-0003](../../../docs/adr/0003-nextjs-for-the-front-end.md). The [Architecture review](23-architecture-review.md) confirms it instead of choosing it, and its ADR becomes ADR-0004.
- Features a direction suggests beyond the requirements are listed for the sign-off pack, not built.
