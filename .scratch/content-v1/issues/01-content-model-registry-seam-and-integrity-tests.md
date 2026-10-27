# 01: Content model v1, registry, seam and integrity tests

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: [Content v1: the current site's content as typed records](../spec.md) · Decisions: D02–D09, D12, D14–D16, D20

**What to build:** the content module becomes v1, and no page notices.

- Behind the same import, the foundation's three items become v1 records: the vikṣepa Concept with its two verses and ten References, the KarmaYoga Scale's intro, and the homepage. The five provisional topics join them.
- A generated registry lists every record. One content source reads it, and the graph resolves every id once and refuses a broken one.
- The `features` module switches the preview flow, the Concept map and the site-wide script setting. The public interface's new collections, views and site derivations come in ticket 13, which runs alongside the migration tickets.
- The foundation pages keep calling the old functions and get exactly what they got before.
- Lint guards the interface, and the integrity tests enforce every content rule from here on.

## Owns

- `src/content/**`. This ticket creates:
  - the module: `index.ts`, `schema/`, `source.ts`, `graph.ts` (ids, reverse links, the dangling-id error) and `legacy.ts`. `types.ts`, `views/` and `derive/` are ticket 13's;
  - `data/concepts/vikshepa.ts`;
  - `data/works/yoga-sutra.ts` and `data/works/vedanta-sara.ts`;
  - `data/passages/yoga-sutra/1.30.ts` and `data/passages/vedanta-sara/5.211.ts`;
  - `data/references/`: the ten vikṣepa References under their foundation ids (`apa-distraction`, `bhavanani-2012`, `gurubhaktananda-2018`, `jain-diwakar-2019`, `krishnananda-1996`, `schleim-2025`, `sharma-pareek`, `shlokam-2025`, `swamij-1-30`, `tomar-2024`), and `navare-pandey-2022`;
  - `data/questionnaires/karmayoga-scale.ts`;
  - `data/home/home.ts`;
  - `data/topics/`: `self`, `mind`, `practice`, `values` and `temperament`.

  Later tickets take some of these over (the spec's "Parallel migration" lists them).
- The provisional files this replaces, deleted: `src/content/concepts/`, `src/content/questionnaires/` and `src/content/home.ts`. The foundation's types move into the legacy adapter.
- `src/config/features.ts` (new). Front-end-site ticket 04 extends it later.
- `scripts/content/registry.mjs` (new).
- `package.json`: the `dev`, `build`, `typecheck`, `test` and `test:e2e` scripts.
- `.gitignore`, `.prettierignore` and `eslint.config.mjs`.
- New tests: `tests/unit/content-registry.test.ts`, `content-integrity.test.ts`, `content-completeness.test.ts`, `content-legacy.test.ts` (with its snapshot) and `content-boundary.test.ts` (with its lint fixtures).
- Not `tests/unit/content.test.ts`, which must pass unchanged, and no page, component or end-to-end file.

## Acceptance criteria

- [ ] **Legacy snapshot first:** before anything else changes, a test records what `getConcept`, `listConcepts`, `getQuestionnaire`, `listQuestionnaires`, `getHomepage` and `asciiSpellings` return today for every foundation item, and passes.
- [ ] **Schema:** a record type and an identity helper for each kind (concept, topic, work, passage, reference, questionnaire, glossary, resource-list, page and home), with the shapes the spec gives, including what it settles: `drafted`, the topic introduction's references, the optional English name, a work's language, no stored "quoted on", and `reversed` meaning display order only. A record with a wrong or missing field fails typecheck.
- [ ] **Seam:** a content source with one method that returns every record of a kind. The local source reads the registry. With the registry missing, reading content fails with a message naming the command that writes it.
- [ ] **Registry:**
  - a plain Node script with no dependencies scans the data folder, sorts the paths and writes the registry module;
  - git, Prettier and ESLint all ignore the generated module;
  - `--check` exits non-zero when the registry on disk is missing or differs from what the script would write;
  - `dev`, `build`, `typecheck`, `test` and `test:e2e` run the script first, by explicit chaining, not pre-hooks;
  - from a clean checkout with no registry, CI's order (`pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`) passes, and so does `pnpm build`, with no change to the CI workflow.
- [ ] **Graph:**
  - built once per process;
  - reverse links for "cited by", "quoted in", and Concepts per topic and per work;
  - a dangling id throws an error that names the record, the field and the missing id.
- [ ] **Feature flags (D16, D20):** `features` holds `questionnairePreview`, `conceptMap` and `devanagariFirst`.
  - Each is on in local runs and Vercel previews, off when `VERCEL_ENV` is `production`, and forced either way by `FEATURE_QUESTIONNAIRE_PREVIEW`, `FEATURE_CONCEPT_MAP` or `FEATURE_DEVANAGARI_FIRST` set to `1` or `0`. They are read at build time.
  - The proposals page is on whenever either proposal flag (`conceptMap`, `devanagariFirst`) is on; there is no separate flag for it.
  - Ticket 13's `questionnaires.form()` and `site.routes()` read these flags. A unit test covers the defaults and the overrides.
- [ ] **Legacy adapter:**
  - the five functions, `asciiSpellings` and the foundation's types are still exported from the public interface, with the same signatures;
  - they cover vikṣepa, the KarmaYoga Scale and the homepage only, whatever else the data holds;
  - the legacy snapshot test passes, allowing only provenance edits to differ;
  - `tests/unit/content.test.ts` passes without edits.
- [ ] **Re-homed records:**
  - `vikshepa`: primary topic `mind`; its two verses as `yoga-sutra/1.30` and `vedanta-sara/5.211`, each translation stored on its passage; the comparison table as a table block in its comparison section; each obstacle a term block with an anchor; its ten References by their foundation ids; the foundation's edits kept;
  - `karmayoga-scale`: status "preview" and intro fields only, with no form yet; summary, purpose, format and limitations listed in `drafted`, with the review status "drafted, not reviewed"; source `navare-pandey-2022`; concepts `['vikshepa']`, flagged for the Project owner because planning ticket 14 decides real links;
  - `home`: the shloka, intro, six areas with no targets yet, and closing. The "More Questionnaires…" note is interface text in the legacy adapter, not in the record;
  - the five topics from the spec's table, in order, with no introduction yet.
- [ ] **Boundary rule:** lint fails when a page or component imports a content internal, by alias or by relative path, and when a `'use client'` file imports a value from the public interface. A test lints small fixture snippets with the repo's config to prove each case, and that a type-only import passes.
- [ ] **Integrity tests:** every rule under the spec's Testing Decisions → Integrity, run over every real record and passing now. That includes the held-back guard and the walk for answer-key fields.
- [ ] **Completeness tests:** written as the spec lists them and switched off, each with a note that ticket 12 switches it on.
- [ ] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`. No Playwright run: pages don't change. The merger runs the full suite, and the foundation's end-to-end tests must pass.

## Comments
