# App framework and content back end on Vercel and Neon: research findings

Ticket: [App framework and content back end on Vercel and Neon](../issues/04-framework-and-content-back-end.md) · Researched 2026-10-26 · Branch: research/framework-and-content-back-end

Every source below was read on 2026-10-26. Version numbers, release dates and download counts come from the npm registry (the public index of JavaScript packages) on that day. Nothing was created, signed up for or changed on Vercel, Neon or any other service.

## Summary

- **Recommended pairing: Next.js (App Router) with Payload CMS, storing content in Neon Postgres and media in Vercel Blob.** It is the only candidate that keeps all content in Neon, as [ADR-0002](../../../docs/adr/0002-vercel-and-neon.md) requires, and still gives Content editors a ready-made admin. That admin has drafts, preview, revision history, pick-from-a-list links, repeatable fields, required alt text, and links that carry a note. It is MIT-licensed and costs nothing beyond Vercel and Neon.
- **Payload's weak points are real and need planning.** It has no built-in two-factor login, so the build needs a community plugin or single sign-on. Its "review step" is "editors save drafts, a reviewer publishes"; formal approval workflows are a paid Enterprise feature. Because the client's own Vercel and Neon accounts run it, it needs more upkeep than a hosted CMS: frequent releases, a security release with breaking changes in September 2026, and a 3.x to 4.0 upgrade ahead (4.0 has been in beta since 2026-10-09).
- **Runner-up: Next.js with Sanity (Growth plan).** It has the least back-end upkeep, polished preview, and a built-in draft-only role for a review step. But it keeps content on Sanity's servers, outside Neon, which **contradicts ADR-0002**. It also costs $15 per editor seat a month, offers two-factor only through Google or GitHub sign-in, and shipped two major versions in the last 12 months.
- **The other candidates fit worse.** Contentful's Free plan bars commercial use, and its next plan is $300 a month. Keystatic and TinaCMS keep content in a GitHub repo, so a published edit waits for a rebuild, and Tina's self-hosted mode needs MongoDB or Redis rather than Neon. A custom admin on Neon fits ADR-0002 but means building and maintaining every editing feature with no developer after handover.
- **Next.js is the framework agents are best equipped for.** Version 16.2 and later ship version-matched docs inside the project for agents to read, and 16.3 adds an `AGENTS.md` that points agents at them. Payload only runs inside Next.js (or TanStack Start from 4.0). Astro is the strongest alternative framework if Payload is not chosen.
- **Published edits can reach visitors in seconds** with Payload, Sanity or a custom admin: Vercel says it updates cached pages in every region within 300 ms of a revalidation. Git-based options wait for a new deployment, which takes minutes.
- **context7 docs are strong for every serious candidate, but agents must pin versions.** context7 is the service that feeds current library docs to coding agents. Its default Payload docs come from the 4.0 beta branch, not the 3.x stable release, and some examples it returns only work in 4.0.
- **Verification (2026-10-26) did not change the recommendation.** Fixes: Payload versions are opt-in, not on by default; the accent-ignoring `postgresUnaccent()` setting is 4.0-only; join-field drag ordering needs `orderable: true`; the Visual Editor is not yet available; the one-argument `revalidateTag` is deprecated rather than removed; and the Vercel 4.5 MB limit is now confirmed. The `postgresUnaccent()` finding adds weight to the question of which Payload major to start on, for the [search ticket](../issues/05-search-and-sanskrit-spellings.md). See [Verification](#verification).

## Findings

### The candidates in October 2026

Terms used below:

- An **app framework** is the code toolkit the website is built with.
- A **content back end** (or CMS, content management system) is where Content editors write and store content.
- A **headless** CMS stores content and hands it to the site over an API, without drawing the pages itself.
- A **Git-based** CMS saves content as files in the site's code repository.

#### Frameworks

| Framework | Latest stable (date) | Current major since | Stable releases, last 12 months | Licence and steward | Runs on Vercel |
| --- | --- | --- | --- | --- | --- |
| Next.js | 16.4.3 (2026-10-23) | 16.x, 2025-10-22 | 88 (includes 15.x backports) | MIT, Vercel | Native; made by Vercel |
| Astro | 7.4.2 (2026-10-21) | 7.x, 2026-06-22 | 113 | MIT; team joined Cloudflare in Jan 2026 | Yes, `@astrojs/vercel` 11.0.16 (2026-10-19) |
| SvelteKit | 3.1.0 (2026-10-14) | 3.x, 2026-10-01 | 60 | MIT | Yes, `@sveltejs/adapter-vercel` 7.0.1 (2026-10-14) |
| Nuxt | 4.6.2 (2026-10-16) | 4.x, 2025-07-15 | 31 | MIT; NuxtLabs joined Vercel in Jul 2025 | Yes, through Nuxt's `routeRules` |

Sources: npm registry entries for [next](https://registry.npmjs.org/next), [astro](https://registry.npmjs.org/astro), [@sveltejs/kit](https://registry.npmjs.org/@sveltejs/kit), [nuxt](https://registry.npmjs.org/nuxt), [@astrojs/vercel](https://registry.npmjs.org/@astrojs/vercel) and [@sveltejs/adapter-vercel](https://registry.npmjs.org/@sveltejs/adapter-vercel).

- **All four run well on Vercel.** Vercel's incremental static regeneration (ISR) works with Next.js, SvelteKit, Nuxt and Astro ([Vercel ISR docs](https://vercel.com/docs/incremental-static-regeneration)). ISR means Vercel serves a saved copy of each page and rebuilds it in the background when told to or on a timer.
- **Stewardship changed for two of them.**
  - Astro's company joined Cloudflare on 2026-01-16. Astro says it "stays open-source and MIT-licensed" and "continues to support a wide set of deployment targets, not just Cloudflare" ([Astro blog](https://astro.build/blog/joining-cloudflare)).
  - NuxtLabs joined Vercel on 2025-07-08. Nuxt remains "independent, open source ... with an MIT license" ([Vercel blog](https://vercel.com/blog/nuxtlabs-joins-vercel)).
- **SvelteKit's current major is 25 days old.** Version 3.0.0 came out on 2026-10-01 ([npm](https://registry.npmjs.org/@sveltejs/kit)), so its docs and examples are still catching up.
- **Next.js does the most to help coding agents.** Its [AI agents guide](https://nextjs.org/docs/app/guides/ai-agents) says:
  - From 16.2, each project ships documentation matching its installed version under `node_modules/next/dist/docs/`, so agents don't rely on older training data.
  - From 16.3, `next dev` writes an `AGENTS.md` that tells agents to read those docs first.
  - A built-in MCP endpoint (Model Context Protocol, a standard way for an agent to query a running tool) reports routes, logs and compile errors.
  - Vercel's evals report a 100% pass rate with the bundled docs.
- **Weekly downloads** (npm, 19–25 Oct 2026) are a rough guide to how much code and help exists: next 15.5 million, astro 1.66 million, @sveltejs/kit 0.77 million, nuxt 0.57 million ([npm downloads API](https://api.npmjs.org/downloads/point/2026-10-19:2026-10-25/next)).

#### Content back ends

| Back end | Latest stable (date) | Where the content lives | Licence and steward | Which frameworks it pairs with |
| --- | --- | --- | --- | --- |
| Payload | 3.92.0 (2026-10-22); 4.0.0-beta.4 (2026-10-22) | Your own Postgres (Neon) | MIT; Figma since June 2025 | Next.js only in 3.x; Next.js or TanStack Start in 4.0 |
| Sanity | 6.20.0 (2026-10-19) | Sanity's hosted Content Lake | Studio (the editing app) MIT; Content Lake is a paid service | Next.js, Astro, Nuxt and others |
| Contentful | SDK 11.12.10 (2026-09-09) | Contentful's servers | Paid service; SDK MIT | Any |
| Keystatic | @keystatic/core 0.6.9 (2026-08-26) | Files in the GitHub repo | MIT; Thinkmill | Next.js (`next >=14`), Astro 5–7 |
| TinaCMS | 3.15.0 (2026-10-19) | Files in the GitHub repo, plus an index database | Apache-2.0; Tina Cloud is a paid service | Any; best documented with Next.js |
| Custom admin | n/a | Neon | Whatever the agents write | Any |

Sources: npm registry entries for [payload](https://registry.npmjs.org/payload), [sanity](https://registry.npmjs.org/sanity), [contentful](https://registry.npmjs.org/contentful), [@keystatic/core](https://registry.npmjs.org/@keystatic/core), [@keystatic/next](https://registry.npmjs.org/@keystatic/next), [@keystatic/astro](https://registry.npmjs.org/@keystatic/astro) and [tinacms](https://registry.npmjs.org/tinacms); [Payload 4.0 beta post](https://payloadcms.com/posts/releases/payload-4-beta-redesigned-admin-tanstack-mcp); [Payload joins Figma](https://payloadcms.com/posts/blog/payload-is-joining-figma); [Sanity docs home](https://www.sanity.io/docs).

- **Payload's version support:**
  - `@payloadcms/next` 3.92.0 accepts Next.js `>=16.3.3 <17.0.0`, plus some 15.x ranges.
  - The 4.0 beta needs Next.js `>=16.4.0` ([npm](https://registry.npmjs.org/@payloadcms/next)) and Node 24.22.1 or later ([v4.0.0-beta.4 release](https://github.com/payloadcms/payload/releases/tag/v4.0.0-beta.4)).
  - Payload 3.92.0 runs on Node 22 or 24 ([npm](https://registry.npmjs.org/payload)).
- **The three pairings worth a close look:**
  - Next.js + Payload
  - Next.js + Sanity
  - Next.js + a custom admin on Neon

  The rest are covered where they differ.

### Whether it runs entirely on Vercel and Neon, and what else it needs

- **Payload (inside Next.js).** The Payload admin and the public site are one Next.js app on Vercel, and content sits in Neon. "Payload remains a self-hosted solution ... Anywhere you can run a Next.js app, you can run Payload" ([Payload Cloud FAQ](https://payloadcms.com/payload-has-joined-figma)).
  - **Database adapter:** use `@payloadcms/db-postgres`, which connects through Drizzle ORM and node-postgres ([Payload Postgres docs](https://payloadcms.com/docs/database/postgres)). An ORM is a library that turns code into database queries.
    - This matches Neon's advice for Vercel's Fluid compute (Vercel's way of running server code): "Use pg (node-postgres) with @vercel/functions" ([Neon: choosing a connection method](https://neon.com/docs/connect/choose-connection)).
    - Avoid `@payloadcms/db-vercel-postgres`. It depends on `@vercel/postgres` ([npm](https://registry.npmjs.org/@payloadcms/db-vercel-postgres)), which npm marks deprecated ([npm](https://registry.npmjs.org/@vercel/postgres)).
  - **What else it needs:**
    - An email service for password resets. Payload ships `email-resend` and `email-nodemailer` adapters ([Payload packages](https://github.com/payloadcms/payload/tree/main/packages)), and [Running on Vercel and Neon](../issues/08-running-on-vercel-and-neon.md) covers this.
    - Vercel Cron, if scheduled publishing is used: "Never use `autoRun` on serverless platforms" ([Payload jobs docs](https://github.com/payloadcms/payload/blob/main/docs/jobs-queue/overview.mdx)).
    - A storage adapter for media, because Vercel's filesystem doesn't keep uploaded files ([Payload deployment docs](https://payloadcms.com/docs/production/deployment)).
- **Sanity.** Content lives in Sanity's hosted Content Lake, so it does **not** run entirely on Vercel and Neon. The Studio can be embedded in the Next.js app on Vercel. Login, roles, assets and history are Sanity's ([Sanity pricing](https://www.sanity.io/pricing)).
- **Contentful.** Content and media live on Contentful's servers. Its Free plan "may only be used to test and learn about Contentful's product ... it may not be used to support commercial use cases" ([Contentful usage limits](https://www.contentful.com/help/admin/usage/usage-limit)).
- **Keystatic.** Content is files in a GitHub repo, so it lives in GitHub, not Neon.
  - Editing needs either a GitHub App plus a GitHub account for each editor ([GitHub mode](https://keystatic.com/docs/github-mode)), or Keystatic Cloud, which "allow[s] team members to edit content without needing a GitHub account" ([Keystatic Cloud docs](https://github.com/Thinkmill/keystatic/blob/main/docs/src/content/pages/cloud.mdoc)).
  - The deployment section of its docs still reads "Coming soon" ([GitHub mode](https://keystatic.com/docs/github-mode)).
- **TinaCMS.** You choose between two setups:
  - Tina Cloud, a paid hosted service.
  - Self-hosting, which needs a Git provider and a database adapter. The documented adapters are MongoDB and Upstash Redis (formerly Vercel KV) ([Tina data layer docs](https://tina.io/docs/reference/content-api/data-layer)). No Postgres adapter is listed, so Neon isn't used.
- **Custom admin on Neon.** Everything runs on Vercel and Neon. Login could use Neon's Managed Better Auth, which is generally available, but its MFA (multi-factor login) is "Coming soon" ([Neon Auth roadmap](https://neon.com/docs/auth/roadmap)). The alternative is self-hosted Better Auth, whose `twoFactor` plugin does TOTP ([Better Auth 2FA docs](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/plugins/2fa.mdx)). TOTP is the six-digit code from an authenticator app.

**ADR check.** ADR-0002 says the site's "data lives in Neon". Sanity and Contentful put content on another company's servers. Keystatic and TinaCMS put it in GitHub, and TinaCMS also needs MongoDB or Redis when self-hosted. Choosing any of them would contradict ADR-0002 as written; only Payload and a custom admin keep content in Neon.

### How Content editors would work

#### Drafts, preview, a review step and revision history

- **Payload** has the most built in:
  - **Drafts:** turning on `versions.drafts` gives "Save draft" and "Publish" buttons, optional autosave, and scheduled publish and unpublish ([Payload drafts docs](https://payloadcms.com/docs/versions/drafts)).
  - **History:** versions are opt-in for each collection, and keep 100 per document by default once turned on (corrected on verification: the 3.x versions docs call versions "totally opt-in", turned on with `versions: true` or a `versions` object; drafts "rely on Versions being enabled", so every collection that needs history or drafts must set this). The admin lets editors "view diffs ... and restore documents back to prior versions" ([Payload versions docs](https://payloadcms.com/docs/versions/overview)).
  - **Preview:** a Preview button opens the page in Next.js draft mode, which shows unpublished content ([Payload preview docs](https://payloadcms.com/docs/admin/preview)). Live Preview shows the page beside the form in an iframe and updates as the editor types ([Payload Live Preview docs](https://payloadcms.com/docs/live-preview/overview)).
  - **Review step:** access rules can let editors save drafts while only some roles publish. "When this constraint prevents publishing, the Admin UI automatically hides the Publish and Unpublish buttons" ([Payload drafts docs](https://payloadcms.com/docs/versions/drafts)). Formal approval flows with notifications are a paid Enterprise feature, "Publishing Workflows" ([Payload Enterprise](https://payloadcms.com/enterprise)).
- **Sanity:**
  - **Drafts and preview** are built in, through the Presentation tool and the Live Content API ([Sanity Next.js docs](https://www.sanity.io/docs/nextjs/introduction)).
  - **History** lasts 3 days on Free, 90 days on Growth and 365 days on Enterprise. Scheduled drafts and comments start on Growth; content releases are a Growth add-on ([Sanity pricing](https://www.sanity.io/pricing)).
  - **Review step:** the Contributor role has "Read and write access to draft content ... with no access to project settings" ([Sanity roles concepts](https://www.sanity.io/docs/content-lake/roles-concepts)). On Growth, Contributors write and an Editor or Administrator publishes.
- **Contentful:** comments, tasks and scheduled publishing start on Lite at $300 a month. Workflows are "Not available" in the Free plan's Starter space ([Contentful pricing](https://www.contentful.com/pricing/)).
- **Keystatic:** a draft is a Git branch, and a review is a pull request in GitHub, outside Keystatic. History is Git history. Preview takes extra setup: "One of the downsides of building static sites with content files is the delay ... You typically need to open a PR and wait for deploy previews". Its recipe adds Next.js draft mode reading from the branch ([Keystatic previews recipe](https://keystatic.com/docs/recipes/real-time-previews)).
- **TinaCMS:** "Editorial Workflow" starts on Team Plus at $41 per project a month ([Tina pricing](https://tina.io/pricing)).
- **Custom admin:** none of this exists until agents build it: draft and published states, a version table, diffs, restore and preview.

#### Roles, and login with two-factor

- **Payload:**
  - **Roles** are written in code as access functions, usually checking a `role` field on the user ([Payload drafts docs](https://payloadcms.com/docs/versions/drafts), [access control docs](https://payloadcms.com/docs/access-control/overview)).
  - **Two-factor isn't built in.** The authentication docs list passwords, lockouts, sessions, API keys and custom strategies, but don't mention 2FA, MFA or TOTP ([Payload authentication docs](https://payloadcms.com/docs/authentication/overview)). There are three ways to add it:
    - The community plugin `payload-totp` 3.0.6: MIT, published 2026-10-04, needs `payload ^3.88.0`, about 2,550 weekly downloads ([npm](https://registry.npmjs.org/payload-totp), [downloads](https://api.npmjs.org/downloads/point/2026-10-19:2026-10-25/payload-totp)).
    - A community bridge to Better Auth.
    - Payload Enterprise SSO (single sign-on through the client's Google or Microsoft account), which hands two-factor to that provider ([Payload Enterprise](https://payloadcms.com/enterprise)).
- **Sanity:**
  - **Roles:** Free has only Administrator and Viewer, so every Content editor would be an admin. Growth adds Editor, Developer and Contributor. Custom roles are Enterprise only ([Sanity roles](https://www.sanity.io/docs/user-guides/roles), [pricing](https://www.sanity.io/pricing)).
  - **Two-factor:** login is "via ... Google Accounts and GitHub ... optionally with two-factor authentication" ([Sanity security](https://www.sanity.io/security)), or email and password. SAML SSO is Enterprise ([Sanity SSO docs](https://www.sanity.io/docs/developer-guides/sso-saml)).
- **Contentful:** two-factor is "available free of charge for all customers" ([Contentful 2FA FAQ](https://www.contentful.com/help/faq/two-factor-authentication/)). Free has 2 roles (Admin, Editor); Lite has 3 (Admin, Editor, Author) ([pricing](https://www.contentful.com/pricing/)).
- **Keystatic:** access goes through GitHub repo permissions, or Keystatic Cloud teams, where "every user in team will have access to all projects within that team" ([Keystatic Cloud docs](https://github.com/Thinkmill/keystatic/blob/main/docs/src/content/pages/cloud.mdoc)).
- **TinaCMS:** Tina Cloud has 2 roles up to Team Plus, 3 roles (beta) on Business, and SSO only on Enterprise ([Tina pricing](https://tina.io/pricing)).
- **Custom admin:** Better Auth's `twoFactor` and `admin` plugins give TOTP and roles ([Better Auth admin plugin](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/plugins/admin.mdx)). Neon's managed version doesn't yet support MFA ([Neon Auth roadmap](https://neon.com/docs/auth/roadmap)).

#### Picking related content instead of pasting links

Every CMS candidate has a field that links to another item by picking it from a searchable list:

- **Payload:** the `relationship` field, which can hold several items (`hasMany`), filter the choices, and link to more than one content type ([Payload relationship docs](https://payloadcms.com/docs/fields/relationship)).
- **Sanity:** the `reference` type, with filters ([Sanity reference type](https://www.sanity.io/docs/studio/reference-type)).
- **Keystatic:** `fields.relationship` and `fields.multiRelationship`, which store the linked entry's slug, its URL name ([Keystatic field reference](https://github.com/Thinkmill/keystatic/blob/main/_autodocs/api-reference/04-asset-relational-fields.md)). Renaming a slug therefore risks breaking links. That is an inference from the stored value and was not tested.
- **Contentful and TinaCMS:** both have reference fields. Contentful lists "Links/reference fields" on every plan ([Contentful pricing](https://www.contentful.com/pricing/)). Tina's `reference` field "enables a parent document to link to another document in a different collection" ([Tina reference type](https://tina.io/docs/reference/types/reference)).
- **Custom admin:** agents would build the picker.

#### Repeatable fields (for spelling variants)

- **Payload:** a text field with `hasMany: true` "makes this field an ordered array of text", with `minRows` and `maxRows` limits. An `array` field holds repeating groups, such as a spelling plus a label ([Payload text field docs](https://payloadcms.com/docs/fields/text), [array field docs](https://payloadcms.com/docs/fields/array)).
- **Sanity:** array fields can hold strings or objects, and the reference-type docs show an array of references ([Sanity reference type](https://www.sanity.io/docs/studio/reference-type)). A string array for variants is the same mechanism (not tested).
- **Keystatic:** `fields.array`, with length limits ([Keystatic structural fields](https://github.com/Thinkmill/keystatic/blob/main/_autodocs/api-reference/06-structural-fields.md)).

#### Unicode IAST and Devanagari

- **Storage is not a differentiator.** Neon "supports UTF8 encoding" ([Neon Postgres compatibility](https://neon.com/docs/reference/compatibility)), and the hosted and Git-based options store JSON or text files, which are Unicode too.
- **Search needs care in Payload.** Payload's text search treats accented and unaccented letters as different (vikṣepa doesn't match viksepa). An opt-in `postgresUnaccent()` setting that ignores accents exists only in the 4.0 beta (corrected on verification: it is documented on Payload's `main` (4.0 beta) branch, not in the 3.x Postgres docs. `@payloadcms/db-postgres` 3.92.0 doesn't export it, and 4.0.0-beta.4 does. On 3.x, accent-insensitive matching needs custom work, such as a stored accent-free copy of each field or a custom query through Drizzle) ([Payload Postgres docs, main branch](https://github.com/payloadcms/payload/blob/main/docs/database/postgres.mdx)). This belongs to [Search and Sanskrit spellings](../issues/05-search-and-sanskrit-spellings.md).
- **Typing IAST** depends on the editor's keyboard or input method. A typing helper inside the admin would be custom work in any CMS (not researched further).

#### Images with required alt text

- **Payload:** media is an "upload collection" whose fields you define. Payload's own reference pattern makes `alt` a `required: true` text field, so an image can't be saved without it ([Payload collections skill reference](https://github.com/payloadcms/payload/blob/main/packages/payload/skills/payload/reference/COLLECTIONS.md)).
- **Sanity:** image fields take an `alt` sub-field ([Sanity docs](https://www.sanity.io/docs/developer-guides/deciding-fields-and-relationships)), and `rule.required()` makes any field mandatory ([Sanity validation](https://www.sanity.io/docs/studio/validation)).
- **Keystatic:** an object holding `fields.image` and a `fields.text` set to `validation: { isRequired: true }` ([Keystatic scalar fields](https://github.com/Thinkmill/keystatic/blob/main/_autodocs/api-reference/03-scalar-fields.md), [asset fields](https://github.com/Thinkmill/keystatic/blob/main/_autodocs/api-reference/04-asset-relational-fields.md), [structural fields](https://github.com/Thinkmill/keystatic/blob/main/_autodocs/api-reference/06-structural-fields.md)).
- **On Vercel, Payload uploads that pass through the server are limited to 4.5 MB.** Setting `clientUploads: true` sends files straight to storage ([Payload storage adapters](https://payloadcms.com/docs/upload/storage-adapters)).

### Many-to-many links that carry a note on each link

A many-to-many link joins items in both directions, such as a Concept linked to many References and a Reference linked to many Concepts. A note on each link (for example, why a Concept relates to a modern construct) needs somewhere to live on the link itself.

- **Payload documents this exact pattern.**
  - Create a junction collection: a content type whose items are the links, each holding the two related items.
  - Add `join` fields on both sides so editors see and add links from either item.
  - "You could add additional 'context' fields to this shared junction collection ... which would allow you to store additional information directly on relationships" ([Payload join field docs](https://payloadcms.com/docs/fields/join)).
  - A join field shows the related items without storing them twice. Links can be reordered by dragging once the join field sets `orderable: true` (corrected on verification: drag-and-drop ordering is off unless `orderable` is set) ([same page](https://payloadcms.com/docs/fields/join)).
- **Sanity:** an array of objects, each holding a `reference` and a note, gives the note. Showing the reverse side inside the Studio would need extra configuration (inference; not tested).
- **Keystatic:** an array of objects holding a relationship and a note works the same way, with the same one-sided limit.
- **Custom admin:** a junction table with a note column is plain SQL. Agents build the editing screens.

### Media storage: Vercel Blob, Neon object storage, or the CMS's own

- **Vercel Blob** (Vercel's file storage, served through its CDN, a worldwide network of caches).
  - **Payload support:** `@payloadcms/storage-vercel-blob` is an official Payload adapter, released with each Payload version (3.92.0 on 2026-10-22) ([npm](https://registry.npmjs.org/@payloadcms/storage-vercel-blob), [Payload storage adapters](https://payloadcms.com/docs/upload/storage-adapters)).
  - **Pricing:** Pro is usage-based, paid from the monthly credit. Vercel's worked example prices storage at $0.023 per GB-month and transfer at $0.05 per GB in its US East region ([Vercel Blob pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing)).
- **Neon Object Storage** (S3-compatible storage inside the Neon project; S3 is Amazon's file-storage interface, which many tools speak).
  - **Status:** it reached general availability on 2026-09-18 ([Neon changelog](https://neon.com/docs/changelog/2026-09-18)), after a beta from 2026-07-17 ([Neon changelog](https://neon.com/docs/changelog/2026-07-17)).
  - **Branching:** files "branch and fork copy-on-write with your database", so a preview database copy also gets its own view of the media ([Neon Object Storage](https://neon.com/docs/storage/overview)).
  - **Pricing and regions:** $0.023 per GB-month on paid plans, with downloads counted against the project's 500 GB monthly transfer allowance ([Neon plans](https://neon.com/docs/introduction/plans)). It runs in four AWS regions.
  - **S3 compatibility:** path-style addressing only. Versioning and lifecycle settings are stored but not enforced ([Neon S3 compatibility](https://neon.com/docs/storage/s3-compatibility)).
  - **With Payload:** Payload's S3 adapter accepts a custom `endpoint` and `forcePathStyle` (shown for Cloudflare R2), so it should connect. Neither Payload nor Neon documents the pairing, though, and it is untested ([Payload storage adapters](https://payloadcms.com/docs/upload/storage-adapters)).
  - **Delivery:** Neon's docs describe public-read buckets and presigned links (temporary signed URLs), but no built-in CDN.
- **The CMS's own storage:**
  - Sanity stores and serves assets itself: 100 GB of storage and 100 GB of transfer a month on Free and Growth ([Sanity pricing](https://www.sanity.io/pricing)).
  - Contentful includes 50 GB a month of asset transfer on Free ([Contentful pricing](https://www.contentful.com/pricing/)).
  - Keystatic keeps images in the repo, or in Keystatic Cloud Images on Pro ([Keystatic Cloud docs](https://github.com/Thinkmill/keystatic/blob/main/docs/src/content/pages/cloud.mdoc)).
- **At 71 media files, cost is negligible either way.** The choice rests on maturity (Vercel Blob plus Payload's first-party adapter) against branch-awareness (Neon). Backup of media belongs to [Running on Vercel and Neon](../issues/08-running-on-vercel-and-neon.md).

### How fast a published edit appears on the site

Pages can be built ahead of time (**static**), rebuilt on a timer (**incremental revalidation**), or rebuilt when an edit is published (**on-demand revalidation**).

- **Vercel's side is fast.** "When you revalidate content, all caches across all regions update within 300ms" ([Vercel ISR docs](https://vercel.com/docs/incremental-static-regeneration)).
- **The Next.js functions to call:**
  - `revalidatePath` regenerates a page.
  - `revalidateTag` refreshes everything tagged with a name. From Next.js 16 it takes a second argument: `'max'` to keep showing the old copy while refreshing, or `{ expire: 0 }` to expire immediately ([Next.js revalidateTag docs](https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/04-functions/revalidateTag.mdx)). (Corrected on verification: the one-argument form is deprecated, not removed. It fails TypeScript type-checking, still runs if that error is suppressed, and behaves like `{ expire: 0 }` ([nextjs.org revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)).)
  - `updateTag` only works from a Server Action ([Next.js caching migration guide](https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/migrating-to-cache-components.mdx)).
- **Payload: seconds.** It runs in the same app, so a publish can call `revalidatePath` directly in an `afterChange` hook, as Payload's website template does ([Payload hooks reference](https://github.com/payloadcms/payload/blob/main/packages/payload/skills/payload/reference/HOOKS.md), [website template README](https://github.com/payloadcms/payload/blob/main/templates/website/README.md)). The template notes one catch: a changed image needs its page republished to refresh the image cache.
- **Sanity: seconds.** "Content editors see changes reflected on the live site within seconds of publishing" with the Live Content API ([Sanity Next.js docs](https://www.sanity.io/docs/nextjs/introduction)). It can also use webhooks, automatic calls to the site when content changes.
- **Contentful: seconds,** through webhooks to the site.
- **Keystatic and TinaCMS (Git-based): minutes.** A publish is a Git commit, so the change appears after Vercel builds and deploys the new commit ([Keystatic previews recipe](https://keystatic.com/docs/recipes/real-time-previews)).
- **Custom admin: seconds,** the same as Payload, once built.

### Export, backup, licence and cost

| | Export and backup | Licence | Cost on top of Vercel Pro and Neon |
| --- | --- | --- | --- |
| Payload | Content is ordinary Postgres tables in Neon, so Neon snapshots and point-in-time restore apply ([Neon plans](https://neon.com/docs/introduction/plans)). The import-export plugin adds CSV or JSON export from the admin ([Payload import-export docs](https://payloadcms.com/docs/plugins/import-export)). | MIT ([licence](https://github.com/payloadcms/payload/blob/main/LICENSE.md)) | $0. Enterprise features (SSO, Publishing Workflows, Visual Editor) are sold through a sales demo, with no published price ([Payload Enterprise](https://payloadcms.com/enterprise)). (Corrected on verification: the Enterprise page marks the Visual Editor "Coming Soon", so it can't be bought yet. It publishes no prices and offers only "Schedule a Demo".) |
| Sanity | `sanity datasets export` writes documents and assets to an archive, and exports count against the API quota ([Sanity export docs](https://www.sanity.io/docs/content-lake/exporting-data), [datasets](https://www.sanity.io/docs/content-lake/datasets)). Managed daily backups are Enterprise only ([Sanity backups CLI](https://www.sanity.io/docs/cli-reference/cli-backups)). | Studio MIT; Content Lake proprietary | Free $0 (Admin and Viewer roles only, 3-day history, public datasets only), or Growth $15 per seat a month. Viewers are free ([Sanity pricing](https://www.sanity.io/pricing)). |
| Contentful | Through its APIs and CLI (not researched further) | Proprietary service | Free is not for commercial use; Lite is $300 a month ([Contentful pricing](https://www.contentful.com/pricing/)). |
| Keystatic | Content is files in Git, so every clone is a full copy. | MIT | $0 with GitHub mode. Keystatic Cloud is free up to 3 users per team; Pro is $10 a month plus $5 per user beyond 3 ([Keystatic Cloud docs](https://github.com/Thinkmill/keystatic/blob/main/docs/src/content/pages/cloud.mdoc)). |
| TinaCMS | Content is files in Git. | Apache-2.0 ([npm](https://registry.npmjs.org/tinacms)) | Tina Cloud: Free for 2 users, Team $24, Team Plus $41 with Editorial Workflow, Business $249, all per project per month ([Tina pricing](https://tina.io/pricing)). |
| Custom admin | Plain Postgres in Neon | Your own code | $0 in licences, the most build effort |

### Maturity and release pace as of October 2026

Stable releases in the last 12 months come from the npm registry entries already cited.

- **Payload:**
  - **Pace:** 47 stable releases. 3.92.0 came out on 2026-10-22.
  - **4.0 beta:** started on 2026-10-09 and reached beta.4 on 2026-10-22. It brings a redesigned admin ("readying WCAG 2.2 AA for a stable release, though it is a work-in-progress"), TanStack Start support, a rewritten MCP integration and upgrade codemods, scripts that rewrite code for a new version ([Payload 4.0 beta post](https://payloadcms.com/posts/releases/payload-4-beta-redesigned-admin-tanstack-mcp), [v4.0.0-beta.0 release](https://github.com/payloadcms/payload/releases/tag/v4.0.0-beta.0)). No stable date is announced.
  - **Security:** on 2026-09-18 Payload released 3.90.0 to fix "multiple vulnerabilities", with "several necessary breaking changes" ([Payload security update](https://payloadcms.com/posts/blog/payload-security-update-available-for-3x-and-40)).
  - **Ownership and usage:** Figma owns Payload and says it "will remain an open-source product" ([Figma blog](https://www.figma.com/blog/payload-joins-figma)). It had about 240,000 weekly downloads ([npm downloads](https://api.npmjs.org/downloads/point/2026-10-19:2026-10-25/payload)).
- **Sanity:**
  - **Pace:** 85 stable releases, and two major versions in the last 12 months: 5.x (2025-12-16) and 6.x (2026-06-11). Before those came 4.x (2025-07-15).
  - **Usage:** about 253,000 weekly downloads.
- **Contentful:** the JavaScript SDK had 28 releases. The service itself is mature.
- **Keystatic:**
  - **Pace:** `@keystatic/core` is still on 0.x, with 13 releases and the latest on 2026-08-26.
  - **Activity:** the repo's last push was 2026-10-01, and it has 202 open issues and pull requests ([GitHub API](https://api.github.com/repos/Thinkmill/keystatic)).
  - **Usage:** about 37,000 weekly downloads.
- **TinaCMS:**
  - **Pace:** 54 stable releases; 3.x has been out since 2025-12-01.
  - **Activity:** 509 open issues and pull requests ([GitHub API](https://api.github.com/repos/tinacms/tinacms)).
  - **Usage:** about 9,200 weekly downloads.
- **Custom-admin building blocks:**
  - Drizzle ORM is 0.45.4 (2026-10-08), still on 0.x, with 5 releases ([npm](https://registry.npmjs.org/drizzle-orm)).
  - Better Auth is 1.7.13 (2026-10-25), with 82 releases ([npm](https://registry.npmjs.org/better-auth)).
  - Neon's auth SDK `@neondatabase/auth` is 0.7.0-beta ([npm](https://registry.npmjs.org/@neondatabase/auth)).

### The upkeep each needs after handover

No developer stays on, so whoever the client hires later inherits the stack.

- **Payload: the most upkeep of the packaged options.**
  - **What runs it:** the app, the admin and the database schema all run on the client's Vercel and Neon.
  - **Updates:** Payload and Next.js must be updated together, because Payload pins the Next.js versions it accepts.
  - **Security:** releases can carry breaking changes, as 3.90.0 did.
  - **Schema changes:** these go through Payload migrations: "in production, generate a migration with `payload migrate:create` and run `payload migrate`" ([v4 migration guide](https://github.com/payloadcms/payload/blob/main/docs/migration-guide/v4.mdx)).
  - **Upgrades ahead:** a 3.x to 4.0 move is coming, with a codemod and an "agent-assisted" upgrade command ([v4.0.0-beta.0 release](https://github.com/payloadcms/payload/releases/tag/v4.0.0-beta.0)).
  - **Third-party piece:** a community two-factor plugin adds code to keep current.
- **Sanity: the least back-end upkeep.** Sanity runs the database, login, assets and history. The Studio and `next-sanity` still need updating. `next-sanity` 13.4.0 requires Next.js 16 and Sanity 5 or 6 ([npm](https://registry.npmjs.org/next-sanity)), and two Sanity majors in the last year mean regular upgrades. The client also has to keep paying per seat.
- **Contentful:** low technical upkeep, but at $300 a month.
- **Keystatic and TinaCMS:**
  - **Keystatic:** low runtime upkeep, since there is no database. But editors need GitHub or Keystatic Cloud accounts, and the project is 0.x with slower releases.
  - **TinaCMS:** a paid Cloud plan, or a MongoDB or Redis database to run.
- **Custom admin: the most upkeep.** Every editing feature (drafts, history, preview, media handling, link pickers and validation) is bespoke code with no upstream fixes.

### How good each one's context7 docs are

context7 scores each library it indexes. "Snippets" is the number of code examples it holds. "Benchmark" is context7's own quality score out of 100; how it is calculated wasn't checked. The figures come from context7's library search on 2026-10-26, and each library has a page at `https://context7.com/<id>` (for example, [context7.com/payloadcms/payload](https://context7.com/payloadcms/payload)).

| Library | context7 ID | Snippets | Benchmark | Newest pinned version |
| --- | --- | --- | --- | --- |
| Next.js | /vercel/next.js | 6,160 | 79.28 | v16.2.9 (current is 16.4.3) |
| Payload | /payloadcms/payload | 8,052 | 72.45 | v3.85.0 (current is 3.92.0) |
| Payload docs site | /websites/payloadcms | 1,201 | 75.03 | n/a |
| Sanity docs site | /websites/sanity_io | 12,454 | 74.39 | n/a |
| Contentful docs | /websites/contentful_developers | 8,927 | 75.51 | n/a |
| Keystatic | /thinkmill/keystatic | 597 | 74.6 | n/a |
| TinaCMS docs | /websites/tina_io | 2,179 | 78.18 | n/a |
| Astro docs | /withastro/docs | 6,352 | 76.07 | n/a |
| SvelteKit docs | /websites/svelte_dev_kit | 3,737 | 76.01 | n/a |
| Nuxt 4 docs | /websites/nuxt_4_x | 3,769 | 75.73 | n/a |
| Drizzle ORM docs | /drizzle-team/drizzle-orm-docs | 5,796 | 68.79 | n/a |
| Better Auth | /better-auth/better-auth | 5,650 | 72.77 | v1.6.23 |
| Neon | /neondatabase/website | 39,583 | 69.64 | n/a |

(Corrected on verification: benchmark scores aren't stable. A second lookup on 2026-10-26 gave Payload 73.06 and Next.js 76.95, so treat them as rough. Snippet counts and newest pinned versions (Payload v3.85.0, Next.js v16.2.9) matched.)

Things seen while querying:

- **context7's default Payload docs are the 4.0 beta.** They come from Payload's `main` branch, which is now 4.0.0-beta.4, while the `3.x` branch is 3.92.0 ([main package.json](https://raw.githubusercontent.com/payloadcms/payload/main/packages/payload/package.json), [3.x package.json](https://raw.githubusercontent.com/payloadcms/payload/3.x/packages/payload/package.json)).
  - One answer about image uploads used `@payloadcms/transformer-sharp`, which exists only as a 4.0 beta ([npm](https://registry.npmjs.org/@payloadcms/transformer-sharp)).
  - Agents building on 3.x must ask context7 for a pinned 3.x version, or read the docs bundled in the installed package.
- **Next.js answers come from the `canary` (pre-release) docs.** That is a little ahead of 16.4.3. The version-matched docs inside the project ([Next.js AI agents guide](https://nextjs.org/docs/app/guides/ai-agents)) are the safer source.
- **Docs drift.** A Sanity webhook example returned by context7 calls `revalidateTag(body._type)` with one argument ([Sanity webhook docs](https://www.sanity.io/docs/nextjs/validating-sanity-webhooks-nextjs)), but Next.js 16 deprecates that form and expects a second argument (corrected on verification: deprecated and a TypeScript error, not a runtime failure) ([Next.js revalidateTag docs](https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/04-functions/revalidateTag.mdx)).
- **Payload docs drift the other way too.** The 4.0-only `postgresUnaccent()` setting appears in the default (main-branch) docs, so an agent on 3.x would be told to import something its installed package doesn't export (found on verification).
- **Agent tooling beyond context7:**
  - Payload ships agent skills inside its package (`packages/payload/skills/`), a separate skills repo and an MCP plugin ([Payload packages](https://github.com/payloadcms/payload/tree/main/packages), [Payload 4.0 beta post](https://payloadcms.com/posts/releases/payload-4-beta-redesigned-admin-tanstack-mcp)).
  - Sanity has a hosted MCP server and an agent toolkit ([Sanity MCP server](https://www.sanity.io/docs/ai/mcp-server)).
  - Neon publishes agent skills ([Neon changelog](https://neon.com/docs/changelog/2026-06-26)).
  - Keystatic and TinaCMS have none of these, as far as their docs show.

### Recommended pairing and runner-up

**Recommended: Next.js 16 (App Router) + Payload, content in Neon through `@payloadcms/db-postgres`, media in Vercel Blob.**

Why:

1. **It fits ADR-0002.** It is the only packaged editor that keeps content in Neon and runs entirely on Vercel, with no third content service. Neon's snapshots and restore then cover the content.
2. **It covers the editing list out of the box.** Drafts, autosave, scheduled publish, preview and side-by-side live preview, 100-version history with diffs and restore (turned on for each collection; corrected on verification: versions are opt-in), and a draft-then-publish review step through roles. It also has pick-from-a-list links, repeatable text, required alt text, and a documented pattern for links that carry a note.
3. **Published edits reach visitors in seconds.** The admin and site share one app, so a publish can trigger revalidation directly, with no webhooks.
4. **It is the stack agents are best equipped for.** Payload is TypeScript configuration in code, with its own agent skills and MCP plugin. Next.js ships version-matched docs for agents. Both have deep context7 coverage.
5. **It costs nothing extra.** MIT licence, no licence fee, no per-seat cost for the client.

What to plan for:

- **Two-factor login.** Pick the community `payload-totp` plugin (check it supports whichever Payload major is used), a Better Auth bridge, or Enterprise SSO. Settle this under the map's "Running the site on Vercel and Neon" section.
- **Which Payload major to start on.** Begin on 3.x if 4.0 isn't stable when the build starts, and plan the move. Begin on 4.0 if it is stable by then.
- **Pin versions for agents.** Pin context7 queries to the Payload major in use, and have agents read the installed package's docs.
- **Postgres adapter.** Use `@payloadcms/db-postgres`, not the Vercel Postgres adapter.
- **Uploads.** Turn on `clientUploads`, because of Vercel's 4.5 MB upload limit.
- **Search.** Treat accents in Payload's built-in text matching as a [search ticket](../issues/05-search-and-sanskrit-spellings.md) concern. Payload's built-in accent-insensitive setting, `postgresUnaccent()`, exists only in 4.0, so a 3.x start needs a custom approach (corrected on verification).
- **Versions.** Turn on `versions` (with `drafts`) for every content collection, because Payload leaves them off by default (found on verification).
- **Editing trial.** Try Neon Object Storage in the [Editing trial](../issues/22-editing-trial.md) only if branch-aware media matters; otherwise stay on Vercel Blob.

**Runner-up: Next.js 16 + Sanity on the Growth plan.**

Why:

- **The least back-end upkeep after handover.** Sanity runs the database, login, assets and history.
- **A polished editor.** Live Content API updates within seconds, visual preview, a Contributor role that can only draft (a ready-made review step), comments and scheduled drafts on Growth.
- **Strong agent tooling.** A hosted MCP server, agent skills and large context7 coverage.

Against:

- **It contradicts ADR-0002**, because content would live in Sanity's Content Lake, not Neon. Choosing it means amending that ADR.
- **Per-seat cost.** $15 per editor seat a month.
- **Two-factor only through Google or GitHub sign-in.**
- **Limited history.** 90 days on Growth; managed backups are Enterprise only.
- **Two major versions in the last 12 months.**

**If the runner-up must also stay inside ADR-0002**, the only candidate is a custom admin on Neon (Next.js, Drizzle ORM and Better Auth). The findings rate it the highest build and upkeep risk for a site with no developer after handover.

**Framework if Payload is not chosen.** Astro is the main alternative to Next.js for the Sanity or Git-based pairings. It is MIT, very actively released, and supports ISR on Vercel, though its team is now part of Cloudflare.

The developer verifies these in the [Architecture review](../issues/23-architecture-review.md), and the [Editing trial](../issues/22-editing-trial.md) tests them hands-on.

## Gaps and uncertainties

- **Nothing was set up or tried.** Editing quality, admin speed on Vercel (cold starts, the delay when a server function wakes up) and bundle size are untested. The [Editing trial](../issues/22-editing-trial.md) covers this.
- **Payload with Neon Object Storage** (through `@payloadcms/storage-s3` with a custom endpoint) isn't documented by either project. Whether it works is unknown.
- **Payload 4.0's stable release date** isn't announced.
- **`payload-totp` and Payload 4.0.** The plugin declares `payload ^3.88.0`; whether it works with 4.0 is unknown. Its quality and maintenance weren't reviewed beyond npm metadata.
- **The Vercel 4.5 MB upload limit** is quoted from Payload's docs, not confirmed on a Vercel limits page. (Corrected on verification: confirmed. Vercel's Functions limits page says "The maximum payload size for the request body or the response body of a Vercel Function is 4.5 MB" ([Vercel Functions limits](https://vercel.com/docs/functions/limitations)).)
- **Sanity:** whether the Free plan's terms allow commercial use, and which region holds the Content Lake data, weren't checked. Showing reverse links inside the Studio wasn't researched.
- **Contentful:** version-history limits and export tooling weren't researched, because its Free plan bars commercial use.
- **Keystatic:** whether Keystatic Cloud logins support two-factor, and whether Keystatic has any role model beyond GitHub or Cloud team access, weren't found in its docs.
- **TinaCMS:** the licence text of `@tinacms/datalayer` ("SEE LICENSE IN LICENSE" on npm) wasn't read.
- **context7 benchmark scores** are context7's own numbers; how it calculates them wasn't checked.
- **Download counts** reflect popularity, not quality.
- **The Payload admin's own accessibility** was not assessed. The 4.0 beta says WCAG 2.2 AA is "a work-in-progress".
- **Costs at this site's size** (Neon compute, Blob, function usage) belong to [Running on Vercel and Neon](../issues/08-running-on-vercel-and-neon.md).

## Verification

A second agent re-checked the claims the recommendation rests on, live against primary sources on 2026-10-26. It used read-only calls only: the npm registry and package tarballs, context7, Vercel's documentation search, Neon's docs tools, and web fetches. Nothing was created or changed on Vercel, Neon or any other service.

| # | Claim checked | Source re-checked | Outcome |
| --- | --- | --- | --- |
| 1 | Versions and dates: next 16.4.3 (2026-10-23), 16.0.0 on 2025-10-22, 88 stable releases; payload 3.92.0 and 4.0.0-beta.4 (2026-10-22), beta.0 on 2026-10-09, 47 stable releases; sanity 6.20.0, with 5.0.0 on 2025-12-16 and 6.0.0 on 2026-06-11; next-sanity 13.4.0 needs Next 16 and Sanity 5 or 6 | npm registry | Confirmed. Payload 3.92.0's exact Node range is `^22.23.4 \|\| >=24.22.1`. |
| 2 | `@payloadcms/next` 3.92.0 accepts Next `>=16.3.3 <17`; the 4.0 beta needs Next `>=16.4.0` and Node `>=24.22.1` | npm registry (peerDependencies, engines) | Confirmed |
| 3 | Payload is MIT; `@payloadcms/db-postgres` uses Drizzle and `pg`; `db-vercel-postgres` depends on the deprecated `@vercel/postgres`; Neon advises `pg` with `@vercel/functions` on Fluid | npm registry, package tarball, LICENSE.md, Neon "Choosing a connection method" | Confirmed |
| 4 | Payload versions are on by default and keep 100 per document | Payload 3.x versions docs (website, raw `3.x` branch, context7 `/payloadcms/payload/v3.85.0`) | **Corrected.** Versions are opt-in; 100 per document is the default once they are on. |
| 5 | Drafts, autosave, scheduled publish, and the hidden Publish button for a review step | Payload drafts docs | Confirmed. Drafts require versions, and scheduled publish requires a way to run jobs. |
| 6 | No built-in 2FA in Payload; `payload-totp` 3.0.6 is MIT and needs `payload ^3.88.0`; Enterprise offers SSO and Publishing Workflows | Payload authentication docs, npm registry, Payload Enterprise page | Confirmed. **Corrected:** the Visual Editor is "Coming Soon", and the page publishes no prices. |
| 7 | Junction collection with "context" fields for a note on each link | Payload join field docs (3.x) | Confirmed. **Corrected:** drag ordering needs `orderable: true`. |
| 8 | `postgresUnaccent()` ignores accents in Payload search | Payload Postgres docs on the `3.x` and `main` branches; `@payloadcms/db-postgres` 3.92.0 and 4.0.0-beta.4 tarballs | **Corrected.** It exists only in 4.0 beta. |
| 9 | Security release 3.90.0 on 2026-09-18 with breaking changes; 4.0 beta announcement (TanStack Start, WCAG 2.2 AA "work-in-progress", no stable date); codemods and the agent-assisted upgrade command | Payload security post, 4.0 beta post (dated 2026-10-19), v4.0.0-beta.0 release notes | Confirmed. The codemods are in the release notes, not the blog post. |
| 10 | Sanity: $15 per seat a month on Growth; Free has only Administrator and Viewer roles; history kept 3, 90 or 365 days; Contributor role writes drafts but can't publish; two-factor only through Google or GitHub | Sanity pricing, roles docs, security page | Confirmed. Email and password login also exists, without Sanity-side 2FA. |
| 11 | Contentful's Free plan bars commercial use; Lite costs $300 a month and adds comments, tasks and scheduled publishing | Contentful usage-limits page, pricing page | Confirmed |
| 12 | Vercel updates caches in every region within 300 ms; ISR works with Next.js, SvelteKit, Nuxt and Astro; 4.5 MB function body limit; Blob costs $0.023 per GB-month and $0.05 per GB | Vercel ISR docs, Functions limits, Blob pricing | Confirmed. The 4.5 MB gap is now closed. |
| 13 | Neon Object Storage became generally available on 2026-09-18, in 4 AWS regions, at $0.023 per GB-month, sharing the 500 GB transfer allowance; Managed Better Auth's MFA is "Coming soon" | Neon changelog 2026-09-18, Object Storage overview, plans page, Auth roadmap (via Neon docs tools) | Confirmed |
| 14 | Next.js 16.2+ bundles docs for its version; 16.3+ writes the managed `AGENTS.md`; MCP endpoint; 100% eval pass rate | Next.js AI agents guide (updated 2026-10-15) | Confirmed. The 100% figure comes from Vercel's AGENTS.md-versus-Skills research. |
| 15 | context7's default Payload docs come from `main` (4.0 beta) and return `@payloadcms/transformer-sharp`, which exists only as 4.0 beta | context7 query, raw `main` and `3.x` package.json, npm registry | Confirmed. **Corrected:** benchmark scores shifted between lookups. |
| 16 | The one-argument `revalidateTag` fails in Next.js 16 | nextjs.org revalidateTag reference | **Corrected.** It is deprecated and a TypeScript error, but still runs. |
| 17 | Tina self-hosting supports MongoDB or Upstash Redis only; Editorial Workflow starts on Team Plus at $41 | Tina data layer docs, Tina pricing | Confirmed |

Also noticed: Payload's reference pattern marks `alt` as `required: true`, but the 3.x website template leaves `required` commented out on its Media collection. A build that starts from that template must turn it on.

**Effect on the recommendation:** none. Next.js with Payload, content in Neon and media in Vercel Blob still stands, with Sanity Growth as the runner-up. The `postgresUnaccent()` finding is the most consequential: on Payload 3.x, Sanskrit accent-insensitive search needs custom work, which bears on the [search ticket](../issues/05-search-and-sanskrit-spellings.md) and on which Payload major to start on.

## Sources

All read 2026-10-26.

**Frameworks and Vercel**
- npm registry entries: [next](https://registry.npmjs.org/next), [astro](https://registry.npmjs.org/astro), [@sveltejs/kit](https://registry.npmjs.org/@sveltejs/kit), [nuxt](https://registry.npmjs.org/nuxt), [@astrojs/vercel](https://registry.npmjs.org/@astrojs/vercel), [@sveltejs/adapter-vercel](https://registry.npmjs.org/@sveltejs/adapter-vercel), [react](https://registry.npmjs.org/react)
- npm downloads API, 2026-10-19 to 2026-10-25: [next](https://api.npmjs.org/downloads/point/2026-10-19:2026-10-25/next) and the same endpoint for each package named
- [Next.js: How Next.js supports AI coding agents](https://nextjs.org/docs/app/guides/ai-agents)
- [Next.js revalidateTag reference](https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/04-functions/revalidateTag.mdx)
- [Next.js migrating to Cache Components](https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/migrating-to-cache-components.mdx)
- [Vercel: Incremental Static Regeneration](https://vercel.com/docs/incremental-static-regeneration)
- [Vercel Blob pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing)
- [Vercel Functions limits](https://vercel.com/docs/functions/limitations) and [nextjs.org revalidateTag reference](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) (added on verification)
- [Astro joins Cloudflare](https://astro.build/blog/joining-cloudflare)
- [NuxtLabs joins Vercel](https://vercel.com/blog/nuxtlabs-joins-vercel)

**Payload**
- npm registry entries: [payload](https://registry.npmjs.org/payload), [@payloadcms/next](https://registry.npmjs.org/@payloadcms/next), [@payloadcms/db-postgres](https://registry.npmjs.org/@payloadcms/db-postgres), [@payloadcms/db-vercel-postgres](https://registry.npmjs.org/@payloadcms/db-vercel-postgres), [@payloadcms/storage-vercel-blob](https://registry.npmjs.org/@payloadcms/storage-vercel-blob), [@payloadcms/storage-s3](https://registry.npmjs.org/@payloadcms/storage-s3), [@payloadcms/transformer-sharp](https://registry.npmjs.org/@payloadcms/transformer-sharp), [@vercel/postgres](https://registry.npmjs.org/@vercel/postgres), [payload-totp](https://registry.npmjs.org/payload-totp)
- Payload docs: [Postgres](https://payloadcms.com/docs/database/postgres), [Drafts](https://payloadcms.com/docs/versions/drafts), [Versions](https://payloadcms.com/docs/versions/overview), [Preview](https://payloadcms.com/docs/admin/preview), [Live Preview](https://payloadcms.com/docs/live-preview/overview), [Authentication](https://payloadcms.com/docs/authentication/overview), [Access control](https://payloadcms.com/docs/access-control/overview), [Relationship field](https://payloadcms.com/docs/fields/relationship), [Join field](https://payloadcms.com/docs/fields/join), [Array field](https://payloadcms.com/docs/fields/array), [Text field](https://payloadcms.com/docs/fields/text), [Storage adapters](https://payloadcms.com/docs/upload/storage-adapters), [Deployment](https://payloadcms.com/docs/production/deployment), [Import Export plugin](https://payloadcms.com/docs/plugins/import-export)
- Payload source: [jobs queue docs](https://github.com/payloadcms/payload/blob/main/docs/jobs-queue/overview.mdx), [v4 migration guide](https://github.com/payloadcms/payload/blob/main/docs/migration-guide/v4.mdx), [collections skill reference](https://github.com/payloadcms/payload/blob/main/packages/payload/skills/payload/reference/COLLECTIONS.md), [hooks skill reference](https://github.com/payloadcms/payload/blob/main/packages/payload/skills/payload/reference/HOOKS.md), [website template README](https://github.com/payloadcms/payload/blob/main/templates/website/README.md), [packages directory](https://github.com/payloadcms/payload/tree/main/packages), [LICENSE](https://github.com/payloadcms/payload/blob/main/LICENSE.md), [main package.json](https://raw.githubusercontent.com/payloadcms/payload/main/packages/payload/package.json), [3.x package.json](https://raw.githubusercontent.com/payloadcms/payload/3.x/packages/payload/package.json)
- Payload releases and posts: [v4.0.0-beta.0](https://github.com/payloadcms/payload/releases/tag/v4.0.0-beta.0), [v4.0.0-beta.4](https://github.com/payloadcms/payload/releases/tag/v4.0.0-beta.4), [Payload 4.0 beta announcement](https://payloadcms.com/posts/releases/payload-4-beta-redesigned-admin-tanstack-mcp), [Security update for 3.x and 4.0](https://payloadcms.com/posts/blog/payload-security-update-available-for-3x-and-40), [Payload is joining Figma](https://payloadcms.com/posts/blog/payload-is-joining-figma), [Payload Cloud FAQ](https://payloadcms.com/payload-has-joined-figma), [Payload Enterprise](https://payloadcms.com/enterprise)
- [Figma: Welcoming Payload](https://www.figma.com/blog/payload-joins-figma)
- Added on verification: [Postgres docs, `3.x` branch](https://github.com/payloadcms/payload/blob/3.x/docs/database/postgres.mdx), [Postgres docs, `main` branch](https://github.com/payloadcms/payload/blob/main/docs/database/postgres.mdx), [versions docs, `3.x` branch](https://github.com/payloadcms/payload/blob/3.x/docs/versions/overview.mdx), [website template Media collection (3.x)](https://github.com/payloadcms/payload/blob/3.x/templates/website/src/collections/Media.ts), and the npm tarballs of `@payloadcms/db-postgres` [3.92.0](https://registry.npmjs.org/@payloadcms/db-postgres/-/db-postgres-3.92.0.tgz) and [4.0.0-beta.4](https://registry.npmjs.org/@payloadcms/db-postgres/-/db-postgres-4.0.0-beta.4.tgz)

**Sanity**
- npm registry entries: [sanity](https://registry.npmjs.org/sanity), [next-sanity](https://registry.npmjs.org/next-sanity)
- [Sanity pricing](https://www.sanity.io/pricing)
- Sanity docs: [Roles](https://www.sanity.io/docs/user-guides/roles), [Roles and permissions](https://www.sanity.io/docs/content-lake/roles-concepts), [Security](https://www.sanity.io/security), [SAML SSO](https://www.sanity.io/docs/developer-guides/sso-saml), [Reference type](https://www.sanity.io/docs/studio/reference-type), [Validation](https://www.sanity.io/docs/studio/validation), [Deciding fields and relationships](https://www.sanity.io/docs/developer-guides/deciding-fields-and-relationships), [Next.js introduction](https://www.sanity.io/docs/nextjs/introduction), [Validating webhooks in Next.js](https://www.sanity.io/docs/nextjs/validating-sanity-webhooks-nextjs), [Exporting data](https://www.sanity.io/docs/content-lake/exporting-data), [Datasets](https://www.sanity.io/docs/content-lake/datasets), [Backups CLI](https://www.sanity.io/docs/cli-reference/cli-backups), [MCP server](https://www.sanity.io/docs/ai/mcp-server)

**Contentful**
- [Contentful pricing](https://www.contentful.com/pricing/)
- [Contentful usage limits](https://www.contentful.com/help/admin/usage/usage-limit)
- [Contentful 2FA FAQ](https://www.contentful.com/help/faq/two-factor-authentication/)
- [npm: contentful](https://registry.npmjs.org/contentful)

**Keystatic**
- npm registry entries: [@keystatic/core](https://registry.npmjs.org/@keystatic/core), [@keystatic/next](https://registry.npmjs.org/@keystatic/next), [@keystatic/astro](https://registry.npmjs.org/@keystatic/astro)
- Keystatic docs: [GitHub mode](https://keystatic.com/docs/github-mode), [Real-time previews recipe](https://keystatic.com/docs/recipes/real-time-previews)
- Keystatic source: [Keystatic Cloud docs](https://github.com/Thinkmill/keystatic/blob/main/docs/src/content/pages/cloud.mdoc), [scalar fields reference](https://github.com/Thinkmill/keystatic/blob/main/_autodocs/api-reference/03-scalar-fields.md), [asset and relational fields reference](https://github.com/Thinkmill/keystatic/blob/main/_autodocs/api-reference/04-asset-relational-fields.md), [structural fields reference](https://github.com/Thinkmill/keystatic/blob/main/_autodocs/api-reference/06-structural-fields.md)
- [GitHub API: Thinkmill/keystatic](https://api.github.com/repos/Thinkmill/keystatic)

**TinaCMS**
- [npm: tinacms](https://registry.npmjs.org/tinacms)
- [Tina pricing](https://tina.io/pricing)
- [Tina data layer](https://tina.io/docs/reference/content-api/data-layer)
- [Tina reference type](https://tina.io/docs/reference/types/reference)
- [GitHub API: tinacms/tinacms](https://api.github.com/repos/tinacms/tinacms)

**Neon, and custom-admin building blocks**
- Neon docs: [Plans](https://neon.com/docs/introduction/plans), [Object Storage overview](https://neon.com/docs/storage/overview), [S3 compatibility](https://neon.com/docs/storage/s3-compatibility), [Choosing a connection method](https://neon.com/docs/connect/choose-connection), [Postgres compatibility](https://neon.com/docs/reference/compatibility), [Managed Better Auth roadmap](https://neon.com/docs/auth/roadmap)
- Neon changelog: [2026-07-17](https://neon.com/docs/changelog/2026-07-17), [2026-09-18](https://neon.com/docs/changelog/2026-09-18), [2026-06-26](https://neon.com/docs/changelog/2026-06-26)
- npm registry entries: [drizzle-orm](https://registry.npmjs.org/drizzle-orm), [better-auth](https://registry.npmjs.org/better-auth), [@neondatabase/auth](https://registry.npmjs.org/@neondatabase/auth)
- Better Auth docs: [two-factor plugin](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/plugins/2fa.mdx), [admin plugin](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/plugins/admin.mdx)

**context7**
- Library search and queries (IDs in the table above), for example [context7.com/payloadcms/payload](https://context7.com/payloadcms/payload)
