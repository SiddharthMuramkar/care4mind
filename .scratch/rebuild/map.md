# Care4Mind.org rebuild

Label: wayfinder:map
Status: open

## Destination

Every decision the build needs is made and recorded, so the build spec can be written and estimated. Building, the full scrape and content migration, and the estimate itself all come after this map.

## Notes

- **Read first:** [the brief](../../docs/project-brief.md) (source of truth; its open questions are OQ1–OQ12), [current-site.md](../../docs/current-site.md), [GLOSSARY.md](../../GLOSSARY.md) and [docs/adr/](../../docs/adr/). Use the glossary's terms. Say "current site" for the WordPress site and its questionnaire app.
- **Platform is fixed:** Vercel and Neon; WordPress goes ([ADR-0002](../../docs/adr/0002-vercel-and-neon.md)). The site is built under the developer's Vercel Pro and Neon accounts. The projects move to accounts the client owns at handover, and the client pays from then on.
- **How it gets built:** coding agents design, write and test all the code, working from current library docs through context7. The developer directs them and verifies the architecture, specs and results, but writes no code by hand. Pick the stack agents build best with; TypeScript is fine.
- **Design bar:**
  - The site should look made by a dedicated team of human designers: custom, rich in colour, fun to explore, with motion and feedback on every scroll and click. It should never look like a template or generic AI output.
  - It must still meet NFR-01 (including reduced motion) and NFR-02.
  - The bar covers how the required features look and behave. A new feature goes to the Project owner in the sign-off pack, or onto the later-phases list.
- **Skills by ticket type:**
  - Grilling tickets use /grilling and /domain-modeling.
  - Prototype tickets use /prototype; coding agents build the prototypes.
  - Research tickets use /research. Findings are committed to `.scratch/rebuild/research/<slug>.md` on a `research/<slug>` branch, which is pushed and never merged.
  - Use /domain-modeling whenever a term settles (GLOSSARY.md) or a hard-to-reverse decision needs an ADR.
- **Talking to the developer:** explain each web-platform term in plain English the first time it comes up. Keep chat replies short; detail goes in the ticket file.
- **Who decides:**
  - The developer: technical and design matters.
  - The Project owner: "(Client)" questions and approvals.
  - The Psychology expert: Questionnaire scoring, interpretation and limitations.
  - The Research editor: source accuracy, citation style and taxonomy review.
  - If a role is unfilled: write the assumption down and mark it for confirmation in the sign-off pack.
- **The client is contacted twice:**
  - [Send the client the question list](issues/01-client-question-list.md)
  - [Send the client the sign-off pack](issues/29-client-sign-off-pack.md)

  A new client question found in between waits under "Follow-ups from the client's replies" below.
- **Questionnaire-track tickets never block site tickets.** A Questionnaire whose questions or scoring rules can't be found is decided as "deferred until the rules arrive, follows after launch". It is never left open.
- **The content model is platform-neutral.** [Content types, topics and shared fields](issues/13-content-types-and-topics.md) through [References, people and journals](issues/17-references-people-journals.md) decide types, fields and links, not database tables. They feed the Architecture review.
- **Planning only.** Hands-on work happens only to unblock a decision. For the current site:
  - Read-only, few requests, spaced out (uncached pages have taken 40 s), and the REST API is preferred over cached HTML.
  - Never log in, probe the MCP endpoints, submit a form or finish the KarmaYoga Scale without the client's OK.
  - Raw captures (they contain author usernames) stay out of the repo.
- **Resolving a ticket:**
  - Write the answer under `## Answer`, set `Status: resolved`, and add one line to Decisions so far.
  - If it answers a brief open question, add a one-line pointer under that question in the brief. Point to the ticket; don't copy the answer.
  - Flag any contradiction with an ADR.
  - If a ticket outgrows one session, stop, split it, and add the new tickets here.
- **New ideas** go on the later-phases list, `docs/later-phases.md` (created when the first idea lands).
- **Terms to sharpen** as tickets reach them (gaps in GLOSSARY.md):
  - People and roles: Project owner, client.
  - Content: topic; traditional text, passage and shloka; Model or technique; application; modern construct and construct link; contributor vs author vs translator; review status; IAST form, Devanagari form and ASCII spelling; keyword; evidence type.
  - Sites: current site vs questionnaire app; content back end.
  - Questionnaires: documented scoring rules; result and band; in-scope vs deferred Questionnaire; Questionnaire description page.
  - Process: launch; later-phases list.

## Decisions so far

<!-- one line per closed ticket: [title](issues/NN-slug.md): gist -->

- [Sample the current site: content shape, navigation and brand](issues/02-current-site-sample.md): Content is page-builder markup; Sanskrit is mixed across scripts and spellings; shlokas and references are unstructured text; no desktop menu; 1 of 71 media files has alt text.
- [Every URL and hostname the current site serves](issues/03-current-site-urls.md): 43 sitemap URLs and no old slugs in archives, so redirects can be set per URL class; domain at Namecheap until 2027-09-13; mail is forwarding only, no DMARC.
- [App framework and content back end on Vercel and Neon](issues/04-framework-and-content-back-end.md): Suggests Next.js 16 + Payload CMS (content in Neon, media in Vercel Blob), Sanity as runner-up; verified, and Payload's accent-ignoring search helper is 4.0-only.
- [Search and Sanskrit spellings on Neon Postgres](issues/05-search-and-sanskrit-spellings.md): Store every spelling variant and index them with unaccent and pg_trgm on Neon, no synonym files needed; only hosted engines add typo tolerance; Pagefind strips Devanagari vowel signs; verified.
- [Front-end interaction stack and quality checks](issues/06-front-end-interaction-stack.md): Candidate stack for the Design direction: Next.js 16 and React 19.3, Tailwind 4 tokens plus CSS Modules, Base UI, motion layered CSS → ViewTransition → Motion, GSAP held back; CI with Playwright, axe and Lighthouse; verified.
- [Typefaces for IAST and Devanagari](issues/07-typefaces-iast-devanagari.md): Many popular fonts can't spell IAST; full ISO 15919 needs self-hosted fonts; four pairings shortlisted, with Playfair + Tiro Devanagari Sanskrit the most complete.
- [Running on Vercel and Neon: backups, environments, handover and costs](issues/08-running-on-vercel-and-neon.md): About $22–27 a month; buy Neon directly, not through Vercel's Marketplace, so it can be handed over; preview deploys get database copies; media needs its own backup; verified.
- [How the KarmaYoga Scale and Dosha Survey work now](issues/09-current-questionnaire-behaviour.md): KarmaYoga scores by per-option points held only in the site database, with three result bands in its settings; the Dosha Survey can only show one fixed message to everyone.
- [Questionnaires in web archives](issues/10-questionnaires-in-web-archives.md): Archives hold the same KarmaYoga items and bands but no points; no Dosha Survey scoring anywhere; the old questionnaire app's questions were never archived.
- [Published scales behind the Questionnaires](issues/11-published-scales.md): KarmaYoga items come from Navare & Pandey (2022) and 14 of 16 description pages match Tomar (2024), but neither gives usable cut-offs; no source found for the Dosha Survey.

## Not yet specified

- **Running the site on Vercel and Neon (FR-08).**
  - How Content editors sign in: two-factor, roles, who adds and removes editors.
  - Backups: the schedule, and where copies are kept.
  - Which restore is drilled and written up before launch.
  - Which checks gate a deploy in CI.
  - Security headers, secrets and spend limits.

  Waits on: Running on Vercel and Neon, Editing trial, Architecture review.
- **Launch cutover and handover (FR-09, OQ9).**
  - Switching DNS to Vercel: lower the TTLs first, keep the email records, and roll back by pointing DNS back.
  - What questionnaire.care4mind.org points to afterwards.
  - The content freeze and the final re-capture.
  - Retiring the old hosting after the client's backup.
  - The steps for moving accounts to the client.
  - The form of the Content editor guide.

  Waits on: the question list, Every URL and hostname, Running on Vercel and Neon, Architecture review, URLs and redirects.
- **Migration recipe.**
  - How each kind of kept page becomes records: the Elementor article with a shloka, the Concept post, the resource list, the landing page, the homepage.
  - Scripted conversion or by hand.
  - Cleaning rules.
  - Harvesting every Sanskrit spelling the current site uses.
  - Parsing and de-duplicating references, and filling gaps within the scope the client sets.
  - Which media survive, and who drafts and approves alt text.

  Waits on: the content-model tickets, Keep, merge or drop, Architecture review, the question list.
- **Page templates and component behaviour.**
  - The template inventory per content type.
  - FR-01's related-content block with empty or very long lists, and whether "show more" still counts as one click.
  - The search results and no-results pages.
  - The 404 page, the privacy notice, and a "not clinical advice" notice.

  Waits on: Links between content, Site map and navigation, Design direction.
- **Launch test plan (FR-06, NFR-01, NFR-02).**
  - Which pages are sampled, and the performance budgets and throttling.
  - Which checks run on every deploy.
  - What is checked by hand, and on which devices.
  - Lab versus real-visitor data.

  Waits on: the question list, Front-end interaction stack, Architecture review.
- **Questionnaires on the new site** (Questionnaire track).
  - One generic engine reading each Questionnaire's record, or code per Questionnaire.
  - Records kept in the repo or in the content back end.
  - Scoring in the browser or on the server.
  - Who may edit a Questionnaire after launch, and how versions are recorded.
  - How each kind of result is shown.

  Waits on: Questionnaire flow and results page, Architecture review, Questionnaire record and test rule, Questionnaire launch scope.
- **Keeping Questionnaire responses** (Questionnaire track; only if the client rejects "store nothing").
  - Where responses live, and who may read them.
  - Retention and deletion, given how long backups are kept.
  - Exports, consent wording and data region.
  - Where any exported past responses are kept.

  Waits on: the question list, Architecture review.
- **Follow-ups from the client's replies.** New questions the replies to the question list raise:
  - a † target rejected
  - roles still unfilled
  - exports that reshape the migration
  - DNS the client doesn't control
  - unknown rights to media or translations
  - an app builder we may contact

  They go out in the sign-off pack, never on their own. Waits on: the question list.

## Out of scope

- Building anything: the schema, admin, templates, search index, Questionnaire engine or CI. Implementation comes after the map.
- The full scrape and content migration, including entering spellings, metadata and alt text. Settled to come after the map.
- Writing the build spec, the estimate, the schedule, pricing or the contract. These follow the map.
- Detailed design of every page template. That is build work; the map sets the design direction and the template inventory.
- Comparing or moving to hosts other than Vercel and Neon. Fixed by ADR-0002; a later move would be a fresh effort.
- Opening production accounts, provisioning, changing DNS, running the restore drill and the launch switch. That is build and launch work.
- Writing the repo docs, the restore write-up and the Content editor guide. These are FR-08 and FR-09 deliverables made during the build.
- Fixing, securing, probing or changing the current site. It stays the client's until launch; its problems are only reported, in the question list.
- Backing up the current site, exporting past Questionnaire responses, and cancelling the old hosting. Only the client can do these.
- Reviving or rehosting the questionnaire app on port 8020. There is no code for it, and it was already down.
- Moving the domain to another registrar, or changing the domain's email.
- The commercial terms of any maintenance arrangement.
- Scholarly checking of all content, and translation into other languages. Excluded by the brief.
- Inventing cut-offs or bands, validating any Questionnaire, creating new instruments, and new interpretation or AI advice. Excluded by the brief.
- Visitor accounts, saved Questionnaire histories, dashboards and a mobile app. Excluded by the brief.
- Journal publishing and peer review. Excluded by the brief.
- AI or semantic search, chatbots, linked-data exports and SEO campaigns beyond NFR-04. These are new ideas, so they go on the later-phases list.
- Legal advice on privacy. That belongs to the client's advisers.
- Recruiting the Psychology expert, Research editor or Content editors. The client names them.
- A performance or accessibility report on the current site. All its code is replaced, and the targets are absolute.
- Live training sessions. They go on the later-phases list if asked for.
- Building deferred Questionnaires after launch. That lies beyond the destination.
