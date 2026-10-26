# App framework and content back end on Vercel and Neon

Type: research
Mode: AFK
Track: site
Status: resolved
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

## Answer

Researched 2026-10-26. Full findings: [`framework-and-content-back-end.md`](https://github.com/SiddharthMuramkar/care4mind/blob/research/framework-and-content-back-end/.scratch/rebuild/research/framework-and-content-back-end.md) on branch `research/framework-and-content-back-end` (pushed, never merged; commit `084bfe6`).

- Payload is the only packaged editor that keeps all content in Neon, as ADR-0002 requires. It has drafts, preview, version history with restore, pick-from-list links, repeatable fields, required alt text and notes on links. MIT licence, no extra cost.
- Payload gaps: no built-in two-factor login (community payload-totp plugin or SSO), formal approval workflows only in paid Enterprise, and self-run upkeep including a 3.x → 4.0 upgrade (4.0 is in beta).
- Runner-up: Next.js 16 + Sanity Growth. Least upkeep and polished editing, but content lives outside Neon (contradicts ADR-0002), $15 per seat a month, 90-day history.
- Ruled out: Contentful (free plan bars commercial use), Keystatic and TinaCMS (edits wait minutes for a rebuild), a custom admin (most build and upkeep risk).
- context7 defaults Payload's docs to the 4.0 beta, so agents must pin the Payload version in use.

**Suggested, not decided:** Next.js 16 (App Router) + Payload CMS, content in Neon through `@payloadcms/db-postgres`, media in Vercel Blob. The [Architecture review](23-architecture-review.md) decides.

**Verified:** 17 claims rechecked, 7 corrected, none changing the suggestion. The one that matters downstream: Payload's `postgresUnaccent()` exists only in the 4.0 beta, so on 3.x accent-insensitive Sanskrit search needs custom work. That bears on [Search and Sanskrit spellings on Neon Postgres](05-search-and-sanskrit-spellings.md) and on which Payload major to start on. Versions are opt-in per collection, not on by default.

**Gaps** (all listed in the findings): Nothing was tried hands-on (left to the Editing trial); Payload's S3 adapter with Neon Object Storage is untested; no Payload 4.0 stable date.
