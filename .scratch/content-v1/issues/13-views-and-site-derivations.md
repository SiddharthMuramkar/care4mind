# 13: Views and site derivations

Status: ready-for-agent
Blocked by: 01
Spec: [Content v1: the current site's content as typed records](../spec.md) · Decisions: D02, D06, D07, D10, D15, D16, D20

**What to build:** the public interface the front-end-site spec builds every page on. Every content kind gets its view and collection, and the five site derivations work over whatever records exist: routes, breadcrumb trail, A–Z, search documents and Concept-map data.

This was split out of ticket 01 so the migration tickets can start sooner. It runs in its own lane alongside them and touches no data file. Its tests use made-up sources plus whatever real records have merged; it works for any amount of data, because the batches keep adding records after it lands.

## Owns

- `src/content/types.ts` (the view types), `src/content/views/**`, `src/content/derive/**` (`routes.ts`, `trail.ts`, `az-index.ts`, `search-documents.ts`, `graph-data.ts`), the collection exports in `src/content/index.ts` (not the legacy exports), and the related-Concept computation in `src/content/graph.ts`
- New tests: `tests/unit/content-interface.test.ts` and `tests/unit/content-derive.test.ts`
- No data file, page, component or end-to-end file

## Acceptance criteria

- [ ] **Related Concepts (D06),** computed in the graph from a shared passage, a shared work, a rarely cited shared Reference (cited by at most 3 Concepts; Tomar (2024) never counts) or a shared topic. Each comes with its reason as a fact, such as "Both quote Yoga Sūtra 2.30".
- [ ] **Public interface:** `concepts`, `topics`, `works`, `references`, `questionnaires`, `library`, `home` and `site`, plus `hrefFor`, `displayName` and `asciiSpellings`, with the spec's signatures.
  - Every view survives a JSON round trip unchanged.
  - `ConceptView` carries what the spec lists: the display name, summary, topics, verses with their work and `href`, sections with resolved blocks and a table of contents, numbered References with anchors and "cited in", the citation map, linked items with their reasons, previous and next in the primary topic (alphabetical for now), external links, provenance and review status.
  - Every view of a carried-over record carries its provenance and review status.
  - `hrefFor` follows the spec's table for every kind, with trailing slashes.
- [ ] **Site derivations,** each in its own file:
  - `routes()`: one entry per public page in design B2 for the data present, each with `path`, `kind`, `pattern` and `title`; exactly one `sample` per kind; `proposal` on the Concept map and `/proposals/`; no route for a coming-later Questionnaire;
  - `trail(path)`: design B6's trail for every kind of page, with the page itself last;
  - `azIndex()`: Concepts, their terms and the glossary entries, by letter; a glossary entry that names a Concept merged into it; sorted with diacritics ignored;
  - `searchDocuments()`: one document per Concept, term, glossary entry, work, passage, Reference, library item, Questionnaire, topic and page, with design A4's fields; a term's parent is its Concept, and a Concept's people are the authors it cites;
  - `graph()`: the Concepts as nodes with their topics, and an edge for each shared passage, shared work or rarely cited shared Reference, with its kind and reason.
- [ ] **Flag gates:** `questionnaires.form()` returns a preview Questionnaire's form only while `questionnairePreview` is on. `routes()` leaves out a preview Questionnaire's `take/` route while that flag is off, `/concepts/map/` while `conceptMap` is off, and `/proposals/` while both proposal flags are off.
- [ ] **Interface and derivation tests,** with made-up sources: the dangling-id error, each view kind, the `form()` and `routes()` flag gates, the flag defaults and overrides, `hrefFor` for every kind, `displayName` both ways, and each derivation's behaviour above, including that a Reference cited by four Concepts, or Tomar (2024), makes no edge.
- [ ] **Legacy untouched:** the legacy adapter, its snapshot test and `tests/unit/content.test.ts` pass unchanged.
- [ ] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`. No Playwright run: pages don't change.

## Comments
