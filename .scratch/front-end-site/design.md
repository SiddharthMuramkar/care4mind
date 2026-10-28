# Design notes: the whole public front end

Status: reference (2026-10-27). The specs [content-v1](../content-v1/spec.md) and [front-end-site](spec.md) are built from these notes. Every structure choice here is **provisional**: the decision register, [decisions.md](decisions.md), names the planning ticket that confirms each one.

These notes record the developer's decisions of 2026-10-27:

- Build the whole public front end now, highly interactive.
- Migrate everything worth keeping from the saved copies of the current site.
- Build the KarmaYoga flow with the real statements and a placeholder result.
- Build the Concept map and the site-wide "Devanagari first" setting as labelled Proposals.
- Delegate the structure decisions to the agent.

## Facts from the saved copies

The copies are outside the repo, at `$CARE4MIND_CAPTURES/items.json`, and are never committed.

- **KarmaYoga parts.** `karmayoga-settings.json` `question_ids` gives the parts: steps 58, 59, 61 and 63 hold 12, 6, 9 and 18 items. The page markup lists the steps first and the items in a different order. Use the settings order and flag the difference. Nine agreement items, ids 34–42, list their options Strongly Agree → Strongly Disagree. The answer key, bands and messages were removed from the copies on purpose and must never be migrated.
- **Triguna** contains a `[my_php_code name="Mind"]` shortcode, the source of a test message. Drop it.
- **Atman and Jiva** carry DharmaWiki citation markers: flag them for attribution. Jiva ends mid-citation with "[".
- **The `/concepts/` page** has 83 cards, all linking to dharmawiki.org.
  - Duplicates: Anavrtti appears twice, Brhadaranyaka/Brihadaranyaka, and Pravrtti and Nivrtti twice, one copy with Nishkama Karma's description.
  - Navavidha Bhakti has another entry's description.
  - 11 letters say "No information available".
- **The four values pages** share a 432–435-word "Raja Yoga Foundations: Yama-Niyama" section, identical apart from spacing, plus Yoga Sūtra 2.30 and 2.32.
- **Shared References.** Tomar (2024) is cited on about 16 pages; Srinivasan and Thapliyal on 4 each; Shlokam.org entries on many.
- **Tables.** Each long page has 1–3 tables, mostly "Indian vs Western" comparisons.
- **Library pages.** `text-books` has 24 cover images, 8 amazon.in links and 5 `#` links. `inspirational-books` has no links. In `institutes`, KIIT links to ksrm.ac.in.
- **Homepage area links:**
  - Concepts → `/concepts/`
  - Techniques → `/methods/`
  - Resources → `/resources/` (empty)
  - Tradition and Texts → `/text-books-2-2/`
  - Applications → a dead questionnaire app
  - Research → `/institutes/`
- **Dosha Survey.** Question 9 contains the stray text "learn to you".

## A. Content model v1 (a deep module behind `@/content`)

### A1. Layers

```
src/content/
  index.ts            public API: the only import pages use
  types.ts            view types: what pages receive (plain, serialisable)
  schema/*.ts         record types + define*() identity helpers (the storage shape a CMS collection holds)
  source.ts           the seam: interface ContentSource { records<K>(kind: K): Promise<readonly RecordOf<K>[]> }
                      localSource = generated registry
  graph.ts            built once per process (memoised promise): id maps, reverse links, computed relations;
                      throws on any dangling id, so a broken link can't build
  views/*.ts          record → view mappers
  derive/             routes.ts, trail.ts, az-index.ts, search-documents.ts, graph-data.ts
                      (one file each, so later tickets each own one file)
  legacy.ts           getConcept/listConcepts/getQuestionnaire/listQuestionnaires/getHomepage: same signatures,
                      limited to the foundation's items; deleted in S03
  data/<kind>/<id>.ts one record per file, default export
  generated/registry.ts  git-ignored, written by scripts/content/registry.mjs
```

### A2. Records (storage)

```ts
type Slug = string // lowercase ASCII, hyphenated
interface SanskritName { iast: string; devanagari?: string; ascii: readonly string[] }
type Inline = string // plain text; the renderer tags Devanagari runs and links "(Author, Year)"
interface Flag { for: 'research-editor' | 'psychology-expert' | 'project-owner'; note: string; ticket?: number }
interface Provenance { sources: readonly { url: string; retrieved: string }[]; edits: readonly string[]; flags: readonly Flag[] }
type ReviewStatus = 'carried-over-not-reviewed' | 'drafted-not-reviewed' | 'reviewed'

type Block =
  | { kind: 'paragraph'; text: Inline }
  | { kind: 'list'; style: 'bullet' | 'number'; items: readonly Inline[] }
  | { kind: 'term'; id: Slug; term: SanskritName; gloss?: string; blocks: readonly Block[] } // sub-term, anchor #id
  | { kind: 'table'; id: Slug; caption: Inline; columns: readonly string[]
      rows: readonly { head?: Inline | { term: SanskritName; gloss?: string }; cells: readonly Inline[] }[] }
  | { kind: 'verse'; quote: PassageQuote } // a verse quoted mid-section
  | { kind: 'topic-intro'; topic: Slug } // shared text stored once (the yama–niyama section)
interface Section { id: Slug; heading: Inline; role?: 'applications' | 'comparison'; blocks: readonly Block[] }
interface PassageQuote { passage: string /* 'yoga-sutra/1.30' */; translation?: string; meaning?: Inline }

interface ConceptRecord {
  kind: 'concept'; slug: Slug
  name: { term?: SanskritName; english: string } // english = the gloss, or the title of an English-titled page
  summary: Inline // sentence(s) from the page, never newly written
  topics: { primary: Slug; also?: readonly Slug[] }
  verses: readonly PassageQuote[] // the verses at the top of the page, in source order
  sections: readonly Section[]
  references: readonly string[] // the page's reference list, in source order
  questionnaire?: Slug
  related?: readonly { concept: Slug; note: string }[] // curated; empty until ticket 14
  external?: readonly { label: string; url: string }[] // e.g. the Concept's DharmaWiki article
  reviewStatus: ReviewStatus; provenance: Provenance
}
interface WorkRecord { kind: 'work'; slug: Slug; title: SanskritName & { english?: string }
  attribution?: string; locatorLabel: string; editions?: readonly string[]; provenance: Provenance }
interface PassageRecord { kind: 'passage'; id: string; work: Slug; locator: string; order: readonly number[]
  devanagari: readonly string[]; transliteration?: { lines: readonly string[]; scheme: 'iast' | 'informal' }
  translations: readonly { id: string; text: Inline; source?: string; quotedOn: readonly Slug[] }[]
  provenance: Provenance }
type ReferenceType = 'journal-article' | 'book' | 'chapter' | 'thesis' | 'web-page' | 'dictionary-entry' | 'report' | 'other'
interface ReferenceRecord { kind: 'reference'; id: string; type: ReferenceType
  authors?: string; year?: string; title: string; container?: string; publisher?: string
  volume?: string; issue?: string; pages?: string; edition?: string
  doi?: string; url?: string; noStableLink?: string // FR-03 "where one exists": say why there is none
  asCited: readonly string[] // each distinct way a source page wrote it
  provenance: Provenance }
interface TopicRecord { kind: 'topic'; slug: Slug; name: { english: string; term?: SanskritName }; order: number
  intro?: { sections: readonly Section[]; provenance: Provenance } } // only where real text exists
type QuestionnaireStatus = 'live' | 'preview' | 'coming-soon' | 'coming-later'
interface QuestionnaireRecord { kind: 'questionnaire'; slug: Slug; title: string; sourceTitle: string
  status: QuestionnaireStatus; summary?: Inline; purpose?: readonly Inline[]; format?: readonly Inline[]
  concepts: readonly Slug[]; source?: string; candidateSource?: string // e.g. Tomar (2024), from research ticket 11
  limitations?: { items: readonly Inline[]; status: 'draft-pending-psychology-expert' | 'approved' }
  form?: QuestionnaireForm
  scoring: { status: 'pending'; reason: string } // the only allowed value until tickets 26/28 supply rules
  heldBack: readonly { what: string; where: string }[] // e.g. High/Moderate/Low texts
  rights?: { status: 'permission-needed' | 'cleared'; holder: string; note: string }
  reviewStatus: ReviewStatus; provenance: Provenance }
interface QuestionnaireForm {
  responseSets: Readonly<Record<string, readonly string[]>> // frequency: Always…Never; agreement: Strongly Disagree…
  parts: readonly { id: Slug; title: string; instructions: Inline
    items: readonly { id: string; text: string /* verbatim, never edited */; responseSet: string; reversed?: true }[] }[] }
interface GlossaryEntryRecord { kind: 'glossary'; slug: Slug; name: { ascii: string; devanagari?: string; iast?: string }
  definition?: Inline; url?: string; concept?: Slug; provenance: Provenance }
interface ResourceListRecord { kind: 'resource-list'; slug: Slug; title: string
  groups: readonly { id: Slug; heading: string; items: readonly ResourceItem[] }[]; provenance: Provenance }
type ResourceItem = { type: 'reference'; reference: string; annotation?: Inline }
  | { type: 'course'; provider: string; name: string; description?: Inline; url?: string }
interface PageRecord { kind: 'page'; slug: Slug; title: string; summary: Inline; sections: readonly Section[]; provenance: Provenance }
interface HomepageRecord { kind: 'home'; shloka: {…}; intro: Inline; areas: readonly { title: string; text: Inline; target?: Target }[]; closing: Inline; provenance: Provenance }
```

### A3. Public interface (`@/content`)

```ts
export const concepts: { get(slug): Promise<ConceptView | null>; list(q?: { topic?; work?; reference? }): Promise<ConceptCard[]> }
export const topics: { get(slug): Promise<TopicView | null>; list(): Promise<TopicCard[]> }
export const works: { get(slug): Promise<WorkView | null>; list(): Promise<WorkCard[]> }
export const references: { list(q?: { type?: ReferenceType; citedBy?: Slug }): Promise<ReferenceView[]> }
export const questionnaires: { get(slug): Promise<QuestionnaireView | null>; list(): Promise<QuestionnaireCard[]>
  form(slug): Promise<QuestionnaireFormView | null> } // null unless 'live', or 'preview' with the preview flag on
export const library: { get(slug): Promise<ResourceListView | PageView | null>; list(): Promise<LibraryCard[]> }
export const home: { get(): Promise<HomepageView> }
export const site: {
  routes(): Promise<RouteEntry[]> // { path, kind, pattern, title, sample?, proposal? } for every public page
  trail(path: string): Promise<Crumb[]> // breadcrumbs per D15
  azIndex(): Promise<AzLetter[]> // Concepts + their terms + glossary, de-duplicated and sorted
  searchDocuments(): Promise<SearchDocument[]>
  graph(): Promise<ConceptGraph> // nodes, edges with reasons (Proposal: Concept map)
}
export { hrefFor, displayName, asciiSpellings } // pure; hrefFor(target) returns a typed Route
```

**What the views carry:**

- **`ConceptView`:**
  - the name, plus the display rule: capitalised IAST if there is a term, else the English title;
  - the summary, and the primary and secondary topics;
  - `verses` as `VerseView`, a superset of the foundation's `Shloka` shape, with a work chip and an `href` to the text-page anchor;
  - `sections` with resolved blocks, and a table of contents;
  - `references`, numbered, each with its anchor and a "cited in" list, plus a citation map from in-text strings to reference ids;
  - `linked`: related Concepts with factual reasons ("Both quote Yoga Sūtra 2.30"), works, the Questionnaire card, and links to applications and comparisons;
  - previous and next within the topic, external links, provenance and review status.
- **`RouteEntry.sample`** marks one representative route per kind, for sampled e2e runs.

### A4. Search seam

- **Corpus.** `site.searchDocuments()` returns about 330 documents of these kinds: concept, term, glossary, work, passage, reference, library item, questionnaire, topic and page. Fields and weights: names (every spelling, Devanagari included) 10; title 8; keywords (gloss, topic, work names and locators such as "YS 1.30" or "Yoga Sutra 1.30") 4; people (authors) 4; a text excerpt of at most 300 characters taken from real text 1.
- **Engine.** `src/lib/search/` is pure TypeScript with no new dependency. `buildIndex(docs)` produces compact JSON; `query(index, q)` returns `SearchHit` objects (`{ id, kind, title, href, matched: { field, variant }, parent?, score }`).
- **Normalisation:**
  - NFC, lower case, Latin diacritics stripped.
  - A phonetic key: sh, ṣ, ś → s; ch → c; aa → a; ee, ii → i; oo, uu → u; ri → r; w → v; doubled letters collapsed; a final a or h dropped.
  - Devanagari: anusvāra and a nasal plus virāma before a consonant are treated as one form (पंच = पञ्च); zero-width joiners removed.
- **Matching order:** exact, then prefix, then phonetic, then fuzzy (one edit for 5–7 letters, two for 8 or more). Results are grouped by kind.
- **Where it runs:**
  - `src/app/search-index.json/route.ts` (force-static) is built once;
  - the client loads the index lazily on intent (⌘K, or hover or focus on the trigger) or when the browser is idle;
  - `/search/?q=` is server-rendered with the same engine, so it works without JavaScript.

  Later, a CMS-backed `search()` can call Postgres (unaccent and pg_trgm) behind the same `SearchHit` shape.
- **Test cases:**
  - vikshepa, viksepa, vikṣepa and विक्षेप all rank the Vikṣepa Concept first;
  - "Sanshay" finds the saṃśaya term inside Vikṣepa;
  - panch klesha, pancha klesha and pañca kleśa all find Pañca kleśa;
  - "brahma vihara" and "brahmavihara" both find Brahmavihāra;
  - "YS 1.30" finds the passage;
  - "Tomar" finds the Reference and the Concepts citing it;
  - पंच matches पञ्च;
  - "vikshpa" finds Vikṣepa;
  - an empty query returns nothing.

### A5. Files and registration

- **IDs and file names.**
  - Concepts, topics, works, lists, pages, glossary entries and Questionnaires use their slug.
  - References use `surname-year[-word]`, e.g. `tomar-2024`.
  - Passages live at `data/passages/<work>/<locator>.ts`, giving the id `yoga-sutra/1.30`.
  - The file name must equal the record id.
- **Registry.** `scripts/content/registry.mjs` is plain Node with no dependencies. It scans `src/content/data/**`, sorts the paths, and writes `src/content/generated/registry.ts`, which is git-ignored, Prettier-ignored and ESLint-ignored. Its `--check` mode fails on a stale registry. The `dev`, `build`, `typecheck`, `test` and `test:e2e` scripts each run it first (explicit chaining, not pre-hooks). `source.ts` explains clearly if the registry is missing.
- **Scaffold.** `pnpm content:new <kind> <id>` writes a typed template.
- **Unit test.** Checks file name equals id, every id is unique, and each file's `kind` matches its folder.
- **Boundary rule** (the intent of the developer's setup-ts-deep-modules skill, with no new dependency): ESLint `no-restricted-imports`.
  - Only `src/content/**` may import `@/content/*` internals.
  - Pages and components import `@/content` alone.
  - `'use client'` files may import `@/content` for types only.

### A6. Fidelity tooling

- **`scripts/content/extract.mjs <slug>`** reads `$CARE4MIND_CAPTURES/items.json` and prints a clean outline (headings, paragraphs, lists, tables, verse blocks, reference lines, links). It never writes into the repo and never touches the network.
- **`scripts/content/verify.mjs [ids…]`** is the no-invented-text check. Every string in a record must be found in its source after normalisation (NFC, ṁ→ṃ, quotes, dashes, whitespace, listed typo fixes). Anything else must be covered by a provenance edit, or the script exits 1. It runs on the developer's machine only, because the captures never enter the repo or CI. Interface text lives in components, never in records.
- **`scripts/content/report.mjs`** gathers every flag, grouped by role, into `.scratch/content-v1/flags.md`.
- **`docs/agents/content-migration.md`** writes down the standard set by `vikshepa.ts`:
  - real text only; NFC; ṃ;
  - typo fixes are made and listed;
  - relabelling (such as "Bhagavad Gita" → Yoga Sūtra 1.30) is listed and flagged;
  - inline DharmaWiki links are dropped and listed, but a Concept's own DharmaWiki article is kept as an external link;
  - score and interpretation sections are held back;
  - Questionnaire items are kept verbatim: flagged, never fixed;
  - the headword comes from the page's own text, otherwise the English title is used and flagged;
  - `#` links are dropped and flagged;
  - no images are carried over;
  - file-ownership rules: create files only; never edit a file another ticket owns.

## B. Provisional structure

### B2. Site map

```
/                                        Home
/concepts/                               Concepts: A–Z of Concepts, their terms and glossary entries; filter by topic and text
/concepts/<slug>/                        Concept (19)
/concepts/map/                           Concept map            [Proposal]
/topics/<slug>/                          Topic landing (5); /topics/ redirects to /concepts/
/texts/                                  Traditional texts
/texts/<slug>/                           A work: the verses quoted on the site, each with "quoted in"
/questionnaires/                         KarmaYoga Scale (preview) + 17 coming later
/questionnaires/karmayoga-scale/         Purpose and limitations
/questionnaires/karmayoga-scale/take/    The flow               [preview; behind a flag]
/library/                                Library home
/library/references/  /library/textbooks/  /library/inspirational-books/  /library/courses/  /library/methods/
/search/                                 Search results (also opened with ⌘K)
/proposals/                              Features proposed beyond the brief, for sign-off
```

URLs end with a slash (`trailingSlash: true`, matching the current site, so each old URL redirects in one hop). The slug is the current site's ASCII spelling of the headword, else the hyphenated English title, and is never changed once published.

### B3. Topics

| Slug | Name | Concepts (primary) | Grounding |
| --- | --- | --- | --- |
| `self` | Self and person (ātman · jīva) | ātman, jīva, jagat, ātma-bandhu | The posts' own framing; Bhagavad Gītā 6.5 |
| `mind` | Mind: states and obstacles (citta) | citta-bhūmi, vikṣepa, upa-vikṣepa, pañca kleśa, sthitaprajña | Yoga Sūtra 1.2, 1.30–1.31, 2.3–2.9; Bhagavad Gītā 2.54–2.68 |
| `practice` | Practice and progress (sādhana) | five steps of perfection, momentum of spiritual practice, spiritual practitioner, brahmavihāra | Yoga Sūtra 1.20–1.22 and 1.33; Sādhana Pañcakam |
| `values` | Values: yama and niyama | ahiṃsā, satya, asteya, brahmacarya | The shared yama–niyama section is this topic's introduction, stored once; Yoga Sūtra 2.30 and 2.32 |
| `temperament` | Guṇa and temperament | triguṇa, kartā (and the Dosha Survey card) | Bhagavad Gītā 14; the types of kartā; the triguṇa page's Ayurveda section |

Topics get no descriptions except the values introduction. Topic pages show computed facts and the verses their Concepts quote.

### B4. Keep, merge or drop: all 39 items

| Current | Decision | New home |
| --- | --- | --- |
| `/` (`care4mind.org` item) | Keep: area links remapped, placeholder cards dropped | `/` |
| `/home/`, `/home-2/` | Drop (duplicates) | Redirect to `/` |
| `/sample-page/` | Drop (WordPress placeholder) | Redirect to `/` |
| `/blog/` | Drop (empty) | Redirect to `/concepts/` |
| `/concepts/` | Keep as glossary entries | `/concepts/` |
| The 16 description pages | Keep: Concept + coming-later Questionnaire (B5) | `/concepts/<slug>/` |
| `/methods/` | Keep as a Page | `/library/methods/` |
| `/resources/`, `/webpages-and-av-material/` | Drop (empty) | Redirect to `/library/` |
| `/text-books/`, `/text-books-2-2/` | Merge into Textbooks; course entries go to Courses, the inspirational section to Inspirational books | `/library/textbooks/` |
| `/indian-philosophy/` | Merge (a Textbooks section) | `/library/textbooks/#indian-psychology-and-philosophy` |
| `/positive-psychology/` | Merge into Textbooks, keeping both descriptions | `/library/textbooks/#positive-psychology` |
| `/inspirational-books/` | Keep; de-duplicate against the Text Books section | `/library/inspirational-books/` |
| `/institutes/` ("Courses") | Keep; merge in the IGNOU and NIOS entries | `/library/courses/` |
| `/surveys/`, `/teertha-yatra-quiz/` | Drop (empty) | Redirect to `/questionnaires/` |
| `/dosha-survey/` | Keep as a coming-later Questionnaire: 12 items stored, not shown as a form | `/questionnaires/#dosha-survey` |
| `/karmayoga-scale/` | Keep as the preview flow | `/questionnaires/karmayoga-scale/` |
| `/atman/`, `/jiva/`, `/jagat/` | Keep as Concepts (attribution flag on the first two) | `/concepts/<slug>/` |
| `/anubandha-chatushtaya/` | Merge into its glossary entry (a 19-word stub) | `/concepts/#anubandha-chatushtaya` |
| Other URL classes | `/category/concepts/` → `/concepts/`; `/category/uncategorized/` → `/`; `/author/:x*` → `/` (pattern only, never a username); `/feed/` → `/` | Ticket 24 |

### B5. How the 16 description pages split

Each page becomes:

- **A Concept page.** It keeps the verses, definition, components (as term blocks), consequences, absence or disturbances, solutions, applications, Indian vs Western sections and tables, and References.
- **A coming-later Questionnaire record.** It holds `sourceTitle`, `concepts: [slug]`, `candidateSource: tomar-2024` where research ticket 11 matched it, `scoring: pending`, and `heldBack` listing the score headings left out.

Text that describes what a questionnaire measures, without interpreting scores, may become the record's `purpose`, flagged for the Psychology expert.

| Page | Concept slug and headword | Topic | Held back |
| --- | --- | --- | --- |
| vikshepa | `vikshepa` vikṣepa (Distraction) | mind | Overall Score indicator; High, Moderate and Low indicators |
| upavikshepaprofiling | `upa-vikshepa` upa-vikṣepa | mind | Same |
| panchkleshavikaarprofiling | `pancha-klesha` pañca kleśa; the six vikāras as term blocks | mind | Score indicator; High, Moderate and Low for each kleśa |
| knowyourmind | `citta-bhumi` citta-bhūmi (the page says "chittabhumis") | mind | Score-Based Indicators |
| sthitaprajna | `sthitaprajna` sthitaprajña | mind (also self) | Overall Score indicator; High, Moderate and Low |
| fivestepsofperfectionprofiling | `five-steps-of-perfection` (English title); śraddhā, vīrya, smṛti, samādhi and prajñā as term blocks | practice | Score indicator by step |
| momentumofspiritualpractice | `momentum-of-spiritual-practice` (English title; flag saṃvega from Yoga Sūtra 1.21) | practice | Overall Score indicator; High, Moderate and Low |
| spiritualpractitionerprofiling | `spiritual-practitioner` (English title) | practice | Same |
| brahmavihara | `brahmavihara` brahmavihāra | practice | Score-Based Indicators |
| knowyourvalues ×4 | `ahimsa`, `satya`, `asteya`, `brahmacharya` | values | Overall Score indicator; Score Wise Category Description |
| frienorfoeofself | `atma-bandhu` ātma-bandhu and ātma-ripu | self | Scoring Continuum; High, Moderate and Low ("Self Management Strategies" is kept) |
| karta-2 | `karta` kartā | temperament (also self) | Karta Score-Based Indicators |
| triguna | `triguna` triguṇa | temperament | Score-band interpretation in "Guna Predominance"; the shortcode and test message dropped |

### B6. Breadcrumbs

| Page type | Trail |
| --- | --- |
| Concept | Home › Concepts › {primary topic} › {Concept} |
| Topic | Home › Concepts › {topic} |
| Concept map | Home › Concepts › Concept map |
| Work | Home › Texts › {work} |
| Questionnaire | Home › Questionnaires › {title} |
| Questionnaire flow | Home › Questionnaires › {title} › Take it |
| Library page | Home › Library › {page} |
| Search, Proposals | Home › {page} |

## C. Interaction design

### C1. Base UI 1.9

Its exports (checked in `node_modules/@base-ui/react`): accordion, alert-dialog, autocomplete, avatar, button, checkbox(-group), collapsible, combobox, context-menu, dialog, drawer, field, fieldset, form, input, menu, menubar, meter, navigation-menu, number-field, otp-field, popover, preview-card, progress, radio(-group), scroll-area, select, separator, slider, switch, tabs, toast, toggle, toggle-group, toolbar, tooltip. `filter-dropdown` is not exported: don't use it. The bundled docs at `node_modules/@base-ui/react/docs/react/` have recipes for:

- **Autocomplete:** a command palette (Dialog + `Autocomplete.Root open inline autoHighlight="always" keepHighlight` + ScrollArea, with `filter={null}` for your own search).
- **PreviewCard:** detached triggers through `createHandle<T>()` with a typed payload. Preview content must stay supplementary.
- **Drawer:** a mobile navigation menu, with swipe to dismiss.
- **NavigationMenu:** Next links through `render={<NextLink/>}`.
- **Toolbar:** `Toolbar.Link` for roving focus.

### C2. Site-wide layer

- **Header.** The baseline is server-rendered links, so it works without JavaScript.
  - Desktop: a NavigationMenu with a Concepts panel (the 5 topics with counts, the A–Z and the map) and a Library panel.
  - Phone: a lazily loaded Drawer sheet, swipe to dismiss, closed on navigation.
  - It also holds the search trigger and the script-preference slot.
- **Command palette (⌘K or Ctrl+K, never a single-key shortcut, WCAG 2.1.4).**
  - Results are grouped by kind, with a "matched *Sanshay*" chip showing which spelling hit.
  - Devanagari input works.
  - `Autocomplete.Status` announces the count.
  - The empty state suggests real search terms.
  - Focus returns to the trigger on close.
- **Link previews.** One PreviewCard root per page, covering Concept links, glossary entries with Concept pages, in-text citations and verse links. They never cover the focused element (2.4.11), Escape dismisses them, and they show nothing on touch.
- **Toasts** confirm "Copy citation" and "Copy verse" politely.
- **Print stylesheet** for the reading pages and the Questionnaire result.
- **Motion.**
  - The foundation's language applies throughout: kolam behaviours, page turn, ink, underline draw.
  - Additions: card-to-title morphs for topics, works and Questionnaires, and view transitions when filters reorder lists and when the questionnaire changes part.
  - Active-section highlighting is CSS only. Check `scroll-target-group` and `:target-current` support first, with `timeline-scope` scroll-driven animations as the alternative.
  - No scroll listeners or observers, and no new uses of Motion. Under reduced motion everything is still.

### C3. By page type

| Route | Signature interactions | Accessibility and speed |
| --- | --- | --- |
| `/` | Foundation hero; a search entry with sample spellings (vikshepa · विक्षेप · viksepa) that opens the palette pre-filled; a topic rosette kolam, one petal per topic, drawn on scroll; one verse per work; the KarmaYoga card plus a coming-later shelf; typographic book spines leading to the Library; a static map teaser (Proposal) | The hero stays the LCP element; petals are real links |
| `/concepts/` | A–Z rail (a `Toolbar` of letter links, active letter in CSS); filter chips (`ToggleGroup`: topics, works, "Concept pages / glossary"), reordered with a view transition; glossary entries open DharmaWiki (marked external); previews on Concept entries | `content-visibility: auto` with an intrinsic size; view-transition names only on the first 40 visible items; chip INP < 200 ms at 4× CPU slowdown |
| `/concepts/<slug>/` | Foundation features; a sticky table of contents with the active section highlighted; a "Linked knowledge" panel with kolam threads drawn on scroll; citations that link to `#ref-<id>` with previews and open the accordion; verse cards with "Copy verse"; tables with a sticky first column and scroll shadows; previous and next in the topic (page turn); print | FR-01 one-click test; server components with small client islands |
| `/topics/<slug>/` | Rosette with one petal per Concept; hovering or focusing a card lights its petal (CSS `:has()`); the topic's verses; the values introduction | No JavaScript |
| `/texts/`, `/texts/<slug>/` | A manuscript view with verses in order, Devanagari and IAST, translations attributed, "quoted in" chips; a sticky locator rail; deep links `#1-30` | No JavaScript; reflow at 320 px for long Devanagari lines |
| `/questionnaires/` | KarmaYoga preview featured; coming-later cards grouped by topic | Status in text, not colour only |
| `/questionnaires/karmayoga-scale/` | Purpose and limitations before Start; a Preview badge; "Your answers aren't scored yet" | FR-05 order |
| `/library/references/` | Filter by type and topic; an author A–Z rail; "cited in" chips; copy citation; anchors that match citation links | `content-visibility` |
| `/library/*` | Typographic spine shelf with annotations; course cards; methods tables | No images |
| `/search/` | Server-rendered results grouped by kind, showing the matched variant; a refine-as-you-type island | Works without JavaScript; the results heading is focused after a submit |

### C4. The KarmaYoga flow (preview)

- **Purpose and limitations come first.** Start leads to `/take/`. The step is reflected as `?step=part-2` (with pushState) so browser Back moves between parts. Answers never appear in the URL; a reload with no answers in memory returns to the start.
- **One part per screen.** Four parts, each opening with its real instruction text. Each statement is a native `<fieldset><legend>` with 5 native radio buttons styled as pills of at least 44 px, in the source's option order (reversed for items 34–42; flagged). No auto-advance (WCAG 3.2.2) and no single-key shortcuts.
- **Progress.** A decorative 9×5 kolam: each answer lights a dot and the line draws in proportion. Beside it, the text "Part 2 of 4 · 14 of 45 answered" inside a Base UI Progress element with `aria-valuetext` (not a live region).
- **Refusing incomplete parts.** Next shows an error summary at the top and moves focus to it. Each error links to its unanswered statement, which gets `aria-invalid` and a text message. Answers already given are kept, and Back keeps everything.
- **Review.** Every statement with its answer, and a "Change" link per part that returns focus to that statement.
- **Result.**
  - A labelled placeholder: "The KarmaYoga Scale's scoring rules are with the Psychology expert; your result appears here once they are confirmed." No numbers or bands.
  - The "not a diagnosis" limitation; the visitor's answers; the source citation.
  - Retake (confirmed with an AlertDialog), Print, and links to related Concepts.
- **State in memory only** (`useReducer`), with a `beforeunload` warning while answers are unsaved. Nothing goes to storage, cookies or the server. `scoreQuestionnaire(record, answers)` returns `{ status: 'pending' }`.
- **Motion.** Part changes use a view transition. No celebratory motion.
- **Gating.** The route returns 404 unless `features.questionnairePreview` is on: on for Vercel previews and local runs, off in production by default.

### C5. Proposals (labelled with `ProposalNote` and switched by `src/config/features.ts`)

- **Concept map** (`/concepts/map/`).
  - Layout is computed at build time, with no layout JavaScript: a rosette with one sector per topic.
  - Edges are curved kolam threads, typed as shared passage, shared work or rarely cited shared Reference. Tomar (2024) is excluded, because it would connect everything.
  - Nodes are HTML links laid over an SVG edge layer. Hover or focus highlights neighbours through build-generated `:has()` rules. Filters use a `ToggleGroup`.
  - The accessible equivalent is a "Connections" list with reasons. It is the default below about 600 px.
- **Site-wide "Devanagari first".**
  - An inline head script of about 200 bytes reads localStorage and sets `html[data-script]` before first paint, so nothing flashes or shifts.
  - The foundation's switch becomes global.
  - `ScriptPair` orders the two scripts with CSS everywhere.
- **`/proposals/`** lists the proposals for sign-off: these two, plus audio pronunciation and a "kolam of your reading path", which are described but not built.

## D. Orchestration notes

- **Machine:** 8 CPUs and 15 GB. At most 3 heavy lanes and 3 light lanes. Playwright and Lighthouse run one at a time under `flock /tmp/care4mind-heavy.lock`, with 4 workers.
- **Lanes:**
  - Each lane is a worktree under `/home/fedora/orca/workspaces/project1/lanes/<ticket>` on branch `lane/<ticket>`, cut from its integration tip.
  - Content lanes merge into `SiddharthMuramkar/content-v1`, whose worktree is `/home/fedora/orca/workspaces/project1/lanes/content-v1`.
  - Site lanes merge into `SiddharthMuramkar/frontend`, in the main worktree.
- **Mergers** run one at a time. After each merge: regenerate the registry, run `pnpm check`, and run the full e2e suite where pages exist.
- **Lanes don't push.**

## E. Environment improvements to do first

1. **S01: ports and servers.**
   - Ports come from the environment: `E2E_PORT` (default 3100; lanes 3110, 3120, 3130) and `LHCI_PORT`.
   - Server reuse is off unless `E2E_REUSE=1`.
   - `E2E_WORKERS`, `E2E_RETRIES`, `E2E_SCOPE=sample|full`, `E2E_ONLY`.
   - `scripts/lane/heavy.sh` runs a command under the flock.
   - `pnpm check` runs registry check, lint, format, typecheck, unit tests and build; `pnpm check:e2e` runs the e2e suite.
   - A hydration marker (`html[data-hydrated]`) plus a `gotoReady()` fixture, so no test clicks before React attaches handlers.
2. **S02: route registry and links.**
   - e2e reads its routes from `site.routes()`, and a unit test maps every `page.tsx` pattern to a registry entry.
   - Every route at 360, 768 and 1440 px: status 200, one h1, no sideways scroll, axe at WCAG 2.2 AA, noindex in both places, title, description and canonical.
   - A crawler starts at `/`: every link returns 200, every `#fragment` exists, no orphan pages, and the sitemap matches the registry.
3. **C01: integrity tests (Vitest).**
   - NFC and ṃ; ASCII spellings are ASCII; IAST and Devanagari stay within their character ranges and the font subsets.
   - Provenance on every carried-over record.
   - No `wp-json`, `wp-admin`, `wp-content` or `/author/`, and no care4mind.org links outside provenance.
   - Every referenced id exists; every Reference is cited; FR-03 fields complete, or `noStableLink` with a reason.
   - A guard against held-back text: no "Score Wise Category", "High indicators", "Moderate Indicators", "Scoring Continuum" and similar.
   - No answer-key or points fields; KarmaYoga has 45 items, split 21/24.
   - Each Concept has exactly one primary topic, and every topic has at least one Concept.
4. **Agent docs.** `docs/agents/content-migration.md` (C02) and `docs/agents/frontend-conventions.md` (S01), which records:
   - page-turn and `transitionTypes`;
   - `data-ink`;
   - the Kolam behaviours;
   - no scroll listeners or new Motion;
   - colours only in `globals.css`;
   - `hrefFor()` for every internal link.

## F. Risks

| Risk | Mitigation |
| --- | --- |
| Merge conflicts | One record per file, plus a generated registry; tokens and slots added once in S04; strict file ownership; serial mergers |
| Flaky tests under load | Lane ports, no reuse, the heavy lock, the hydration fixture, worker limits, one retry with a trace |
| Content fidelity | `verify.mjs`, listed edits, the C12 sweep, the held-back guard test |
| Copyright | KarmaYoga items (Navare &amp; Pandey 2022) flagged `permission-needed`, with the preview flag off in production. Tomar (2024) and the DharmaWiki-adapted text are flagged. The repo is private, previews need a login, every page is noindex |
| Speed | No new fonts; lazy index and drawer; Lighthouse and INP budgets; Tiro `font-display: optional` as the fallback |
| A placeholder result mistaken for a real one | A "Placeholder" label, no numbers, the flag, FR-05 tests |
