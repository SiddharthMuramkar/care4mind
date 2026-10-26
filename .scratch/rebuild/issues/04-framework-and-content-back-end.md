# App framework and content back end on Vercel and Neon

Type: research
Mode: AFK
Track: site
Status: open
Blocked by: none
Map: [Care4Mind.org rebuild](../map.md)

## Question

Which app framework and which content back end should the site use on Vercel and Neon ([ADR-0002](../../../docs/adr/0002-vercel-and-neon.md))? Coding agents write all the code from current docs (through context7), so weigh what agents build well and what has strong, current documentation. TypeScript is fine. Content editors aren't developers, and no developer stays on after handover.

**Candidates**

- Frameworks: Next.js (App Router), with Astro, SvelteKit or Nuxt as alternatives where they run well on Vercel.
- Content back ends:
  - Payload CMS, which runs inside a Next.js app and has a Postgres adapter
  - a hosted headless CMS such as Sanity or Contentful, which keeps the content outside Neon
  - a Git-based CMS such as Keystatic or TinaCMS
  - a custom admin built on Neon

**For each pairing, record:**

- whether it runs entirely on Vercel and Neon, and what else it needs
- how Content editors would work:
  - drafts, preview, a review step and revision history
  - roles, and login with two-factor
  - picking related content instead of pasting links
  - repeatable fields (for spelling variants)
  - Unicode IAST and Devanagari
  - images with required alt text
- many-to-many links that carry a note on each link
- media storage: Vercel Blob, Neon object storage, or the CMS's own
- how fast a published edit appears on the site (static pages, incremental revalidation, on-demand)
- export, backup, licence and cost
- maturity and release pace as of October 2026
- the upkeep it needs after handover
- how good its context7 docs are

End with a recommended pairing and a runner-up, with reasons. The developer verifies them in the [Architecture review](23-architecture-review.md), and the [Editing trial](22-editing-trial.md) tests them hands-on.
