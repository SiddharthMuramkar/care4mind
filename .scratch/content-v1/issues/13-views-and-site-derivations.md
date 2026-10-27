# 13: Views and site derivations

Status: resolved
Blocked by: 01
Spec: [Content v1: the current site's content as typed records](../spec.md) · Decisions: D02, D06, D07, D10, D15, D16, D20

**What to build:** the public interface the front-end-site spec builds every page on. Every content kind gets its view and collection, and the five site derivations work over whatever records exist: routes, breadcrumb trail, A–Z, search documents and Concept-map data.

This was split out of ticket 01 so the migration tickets can start sooner. It runs in its own lane alongside them and touches no data file. Its tests use made-up sources plus whatever real records have merged; it works for any amount of data, because the batches keep adding records after it lands.

## Owns

- `src/content/types.ts` (the view types), `src/content/views/**`, `src/content/derive/**` (`routes.ts`, `trail.ts`, `az-index.ts`, `search-documents.ts`, `graph-data.ts`), the collection exports in `src/content/index.ts` (not the legacy exports), and the related-Concept computation in `src/content/graph.ts`
- New tests: `tests/unit/content-interface.test.ts` and `tests/unit/content-derive.test.ts`
- No data file, page, component or end-to-end file

## Acceptance criteria

- [x] **Related Concepts (D06),** computed in the graph from a shared passage, a shared work, a rarely cited shared Reference (cited by at most 3 Concepts; Tomar (2024) never counts) or a shared topic. Each comes with its reason as a fact, such as "Both quote Yoga Sūtra 2.30".
- [x] **Public interface:** `concepts`, `topics`, `works`, `references`, `questionnaires`, `library`, `home` and `site`, plus `hrefFor`, `displayName` and `asciiSpellings`, with the spec's signatures.
  - Every view survives a JSON round trip unchanged.
  - `ConceptView` carries what the spec lists: the display name, summary, topics, verses with their work and `href`, sections with resolved blocks and a table of contents, numbered References with anchors and "cited in", the citation map, linked items with their reasons, previous and next in the primary topic (alphabetical for now), external links, provenance and review status.
  - Every view of a carried-over record carries its provenance and review status.
  - `hrefFor` follows the spec's table for every kind, with trailing slashes.
- [x] **Site derivations,** each in its own file:
  - `routes()`: one entry per public page in design B2 for the data present, each with `path`, `kind`, `pattern` and `title`; exactly one `sample` per kind; `proposal` on the Concept map and `/proposals/`; no route for a coming-later Questionnaire;
  - `trail(path)`: design B6's trail for every kind of page, with the page itself last;
  - `azIndex()`: Concepts, their terms and the glossary entries, by letter; a glossary entry that names a Concept merged into it; sorted with diacritics ignored;
  - `searchDocuments()`: one document per Concept, term, glossary entry, work, passage, Reference, library item, Questionnaire, topic and page, with design A4's fields; a term's parent is its Concept, and a Concept's people are the authors it cites;
  - `graph()`: the Concepts as nodes with their topics, and an edge for each shared passage, shared work or rarely cited shared Reference, with its kind and reason.
- [x] **Flag gates:** `questionnaires.form()` returns a preview Questionnaire's form only while `questionnairePreview` is on. `routes()` leaves out a preview Questionnaire's `take/` route while that flag is off, `/concepts/map/` while `conceptMap` is off, and `/proposals/` while both proposal flags are off.
- [x] **Interface and derivation tests,** with made-up sources: the dangling-id error, each view kind, the `form()` and `routes()` flag gates, the flag defaults and overrides, `hrefFor` for every kind, `displayName` both ways, and each derivation's behaviour above, including that a Reference cited by four Concepts, or Tomar (2024), makes no edge.
- [x] **Legacy untouched:** the legacy adapter, its snapshot test and `tests/unit/content.test.ts` pass unchanged.
- [x] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`. No Playwright run: pages don't change.

## Comments

- **Built (2026-10-28).** The view types (`src/content/types.ts`), the view mappers (`src/content/views/`: one file per kind, plus `names.ts`, `href.ts`, `blocks.ts`, `refs.ts` and `common.ts`), the five derivations (`src/content/derive/`: `routes.ts`, `trail.ts`, `az-index.ts`, `search-documents.ts`, `graph-data.ts`), the related-Concept computation in `graph.ts` (`graph.related(slug)`), and the public interface in `index.ts`: `concepts`, `topics`, `works`, `references`, `questionnaires`, `library`, `home`, `site`, `hrefFor`, `displayName` and `asciiSpellings` (moved, unchanged), with every view type. 70 new tests (44 interface, 26 derivations); 166 unit tests pass. No data file touched, so there are no slugs or flags from this ticket.
- **The seam.** `createContent(source, flags)` in `views/index.ts` builds every namespace over one content source and one set of feature flags; `@/content` binds it to the local source and this build's `features`. Tests build it over made-up sources and flags, and a few run over the real records through `@/content` with invariants that hold for any amount of content.
- **Decisions the spec left open:**
  - Related Concepts (D06): one fact per shared passage, work, rarely cited Reference (at most 3 citing Concepts; `tomar-2024` never) and topic (primary or not). A work counts only when the pair shares no passage of it, since "Both quote Yoga Sūtra 1.30" already says they quote the Yoga Sūtra; so a pair never gets a passage edge and a work edge for the same work. Reasons read "Both quote Yoga Sūtra 2.30", "Both quote the Yoga Sūtra", "Both cite Jain & Diwakar (2019)" and "Both are in the topic “Mind: states and obstacles”". `linked.related` lists each Concept once with all its reasons, strongest first (passage, work, Reference, topic), then by name. Map edges use the first three kinds, one per fact per pair.
  - Reference labels come from the free-text authors without initials: "Rao (2001)", "Jain & Diwakar (2019)", "Thapliyal et al. (2023)" (three or more, or "et al."), else the title; the year up to its first comma.
  - `hrefFor` takes a record target or `{ page }` for the nine fixed pages. A Questionnaire target carries its status (coming later gives `/questionnaires/#<slug>`), and `flow: true` gives `take/`. It returns `string` until front-end-site ticket 03 can narrow it to Next's `Route`. A passage id that isn't `work/locator` throws.
  - Views never hold `undefined` (absent fields are left out), so every view passes a strict JSON round trip; Sanskrit names are copied, never shared with a record.
  - Kinds that store no review status (works, passages, References, lists, pages, the homepage, a topic introduction) get "drafted, not reviewed" when their provenance declares drafted fields, else "carried over, not reviewed". Views carry the record's provenance whole: sources, edits, flags and drafted fields.
  - A verse shows only the translation its quote names, and none when it names none; another page's translation is never borrowed.
  - The citation map keys each in-text citation as written inside its parentheses ("Tomar, 2024"), includes those in a shared topic introduction the Concept shows, and leaves out what doesn't resolve (the integrity test already makes those flagged).
  - `linked.questionnaires`: the Concept's own Questionnaire first, then any other listing it, so vikṣepa keeps the KarmaYoga Scale. A topic's verses are those its primary Concepts quote (as design B3's grounding lists them), by work title, then locator.
  - `QuestionnaireView` carries no rights note: like `heldBack` and `scoring`, it stays in the record. The form view turns `reversed` into the option order and doesn't expose the flag.
  - Routes: site-map order; Concepts, works and Library pages by path, topics by their order, Questionnaires by slug with the flow after its intro. The sample is each kind's first route. Kinds: home, concepts, concept, concept-map, topic, texts, work, questionnaires, questionnaire, questionnaire-flow, library, references, resource-list, page, search, proposals. Fixed pages are titled with design B2 and B6's labels, and the flow "Take it", its crumb, so a trail always ends with its route's title. A flow route needs a form as well as its gate, as `form()` does, so the KarmaYoga Scale's appears once ticket 06 adds the form. A coming-soon Questionnaire gets an intro route and no flow.
  - Trail: every page above the path that exists, plus B6's two exceptions (a topic sits under Concepts; a Concept under its primary topic). A missing slash, a query or a fragment is ignored; a path that isn't a page in this build, a switched-off one included, has no trail. Crumbs carry `lang` where the label is IAST.
  - A–Z: all 26 letters, plus `#` only if a name starts outside A–Z; ties go Concept, term, glossary. A merged glossary entry adds its names (as spellings), its Devanagari where the Concept has none, its definition, and its anchor (`anchors`), so `/concepts/#atman` still lands. A glossary entry links to its DharmaWiki article (marked external) or to nothing. Every entry carries `topics` and `works` for the filter chips; a term takes its Concept's.
  - Search: a "library item" is each book or course on a reading list (a book is also a Reference document; its library item links to its group), and a "page" document is the Methods page or a reading list. `parent` is set for terms (their Concept), passages (their work) and library items (their list). Locator keywords are the plain title's initials ("YS 1.30") for titles of two words or more, plus the IAST and plain titles with the locator; a Concept also gets the locators it quotes. Excerpts are cut at a word with "…".
- **Counts on today's content (23 records, every flag on):** 18 routes; 31 search documents (1 Concept, 9 terms, 2 works, 2 passages, 11 References, 1 Questionnaire, 5 topics); one map node and no edges.
- **Flags raised:** none (no record changed).
- **Left over:**
  - Curated `related` links (the record field, empty until planning ticket 14) don't reach the views yet; ticket 14 decides how they show.
  - For front-end-site ticket 03: every crumb has an `href`, the last included; the Breadcrumbs component marks the last as the current page.
  - A slug equal to a fixed page (a Concept called `map`, a reading list called `references`) would give two routes one path; the real-content route test fails on it.
