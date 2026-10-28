# Content v1: the current site's content as typed records

Status: ready-for-agent
Source: [Design notes](../front-end-site/design.md) (sections A, B, E and F are the source of truth), [Provisional structure decisions](../front-end-site/decisions.md) (D01–D20), [Design direction (planning ticket 21)](../rebuild/issues/21-design-direction.md)
Builds on it: [Front-end site: every public page](../front-end-site/spec.md)
Tickets: [issues/](issues/)

## Problem Statement

The new site has pages but almost nothing to put in them. The front-end foundation (planning ticket 21) carried over one Concept (vikṣepa), the KarmaYoga Scale's intro and the homepage, in provisional types never meant to hold the whole site. Everything else worth keeping exists only in saved copies of the current WordPress site:

- 19 Concepts: 16 pages that each describe a Concept and a questionnaire, and 3 short posts (Atman, Jiva and Jagat);
- 82 glossary cards on `/concepts/`, each pointing to DharmaWiki;
- about 200 References, typed as loose lines and repeated across pages (Tomar (2024) appears on 16);
- dozens of verses, most without their work named, one under the wrong work;
- the KarmaYoga Scale's 45 statements and the Dosha Survey's 12 questions;
- the reading lists, the course list and the Methods page.

Moving it is not a copy-and-paste job:

- **Nothing may be invented.** The brief excludes rewriting content, and source accuracy is the Research editor's call. Every word on the new site must be the current site's own, apart from changes listed for review.
- **Score interpretation must stay out.** The 16 description pages give High, Moderate and Low result texts with no cut-offs. The saved copy of the KarmaYoga Scale comes from a quiz whose answer key and bands were removed on purpose. Until the Psychology expert approves documented scoring rules (FR-05), the site must not interpret anyone's score.
- **The back end isn't chosen.** The Architecture review (planning ticket 23) picks the content back end later. Content shaped around today's files would have to be migrated twice.
- **Many agents will do the work at once.** Shared index files, shared References and shared verses are where parallel lanes collide and where duplicates creep in.
- **Rights and attribution are open.** The KarmaYoga items belong to Navare & Pandey (2022). The candidate source for 14 of the coming-later Questionnaires is a commercial handbook, Tomar (2024). Some text is adapted from DharmaWiki.
- **The current site stays untouched until launch.** The migration may only read saved copies.

## Solution

All the content worth keeping moves into a typed, platform-neutral model (v1), behind the one content interface the pages already use:

- **One record per file,** in the shape a CMS collection would hold: Concepts, topics, works and their passages, References, Questionnaires, glossary entries, reading lists, pages and the homepage. A generated registry lists them, so adding a record never means editing a shared file.
- **One public interface and one seam.** Pages ask the interface for views: plain data shaped for a page. Under it, a single content source supplies records. Today it reads the registry; later a CMS source replaces it and no page changes.
- **Links are ids, checked when the site builds.** A Concept lists its References and verses by id, so Tomar (2024) is one record cited from 16 pages, and Yoga Sūtra 2.30 is one passage quoted by four. A link to an id that doesn't exist stops the build.
- **Every string is accounted for.** Each record names the current-site page it came from and lists every change made on the way. A verify command checks every string against the saved copy and fails on anything that is neither found nor listed.
- **Interpretation is held back and listed.** Each Questionnaire record lists the score sections it left out. Its scoring is "pending" with a reason, and a test fails if held-back wording ever reaches content.
- **Questions for people become flags.** Anything an agent notices but may not decide becomes a flag for the Research editor, the Psychology expert or the Project owner. One command gathers them into a pack for sign-off.
- **The foundation's pages don't change.** A legacy adapter serves them exactly what they get today, until the front-end-site spec moves them to the new interface.
- **The structure is provisional.** Five topics, the keep-merge-drop calls and the split of each description page into a Concept and a coming-later Questionnaire come from the design notes. The decision register names the planning ticket that confirms each one.

## User Stories

### Visitors (general public)

1. As a visitor, I want every Concept the current site explains to be on the new site with its full text, so that nothing I could read before is lost in the rebuild.
2. As a visitor, I want the text to say exactly what the current site said, apart from listed fixes, so that the new site never puts words in its authors' mouths.
3. As a visitor, I want each Concept named by its Sanskrit term in IAST and Devanagari, with the English gloss the page gives, so that I know both what it's called and what it means.
4. As a visitor who knows a term only as "vikshepa" or "Sanshay", I want those spellings stored with the term, so that search and the A–Z find it under the spelling I know.
5. As a visitor, I want each Concept to belong to one main topic, so that I can find related ideas side by side.
6. As a visitor, I want the glossary's short entries kept, each still leading to its DharmaWiki article, so that I can read further.
7. As a visitor, I want duplicate and mislabelled glossary entries cleaned up, so that I'm never shown one term with another term's definition.
8. As a visitor, I want leftovers such as test messages, "#" links and "No information available" gone, so that the site feels looked after.
9. As a visitor, I want the shared introduction to yama and niyama told once, not repeated on four pages, so that I don't read the same 430 words four times.
10. As a visitor, I want every area on the homepage to lead to a real page, so that I'm never sent to an empty page or a dead app.
11. As a visitor, I want Questionnaire pages never to tell me what a High or Low score says about me, so that I'm not led to judge myself by rules nobody has checked.
12. As a visitor, I want the KarmaYoga statements shown exactly as published, so that my answers mean what the scale's authors intended.

### Students and educators

13. As a student, I want each verse shown with its work and its place in it (Yoga Sūtra 1.30), so that I can find it in my own copy.
14. As a student, I want every verse the site quotes gathered under its work, so that I can see which Concepts draw on the same verse.
15. As a student, I want the Devanagari, the transliteration and the translation kept as each page gave them, with informal transliterations labelled, so that I know what is IAST and what isn't.
16. As a student, I want a page's own explanation of a verse kept apart from the verse's translation, so that I can tell the text from the commentary.
17. As a student, I want each sub-term (saṃśaya inside vikṣepa) to have its own anchor, so that I can link straight to it from my notes.
18. As a student, I want the "Indian vs Western" tables kept as tables with their captions, so that I can compare the two views row by row.
19. As an educator, I want the textbooks, inspirational books and courses kept as single lists without duplicates, so that I can give students one reading list.

### Researchers

20. As a researcher, I want each Reference stored once with its details split into fields, so that a book cited on 16 pages is one entry, not 16 differently typed lines.
21. As a researcher, I want each Reference to keep every way the pages wrote it, so that I can check the record against the original citations.
22. As a researcher, I want a DOI or stable URL wherever the pages give one, and a stated reason where there is none, so that FR-03 holds and I can see what's missing.
23. As a researcher, I want each Concept's reference list kept in the page's order, so that the list reads as its author wrote it.
24. As a researcher, I want in-text citations like "(Tomar, 2024)" to resolve to one Reference, so that every citation leads to its entry.
25. As a researcher, I want to see every Concept that cites a given Reference, so that I can follow one source across the site.
26. As a researcher, I want to find every Concept that quotes Yoga Sūtra 2.30, so that I can compare how the pages read the same verse.
27. As a researcher, I want to know which coming-later Questionnaires match a published source (Tomar 2024) and which match none (Sthitaprajña, Five Steps of Perfection), so that I can judge where each stands.

### Research editor

28. As the Research editor, I want every change made during migration listed on the record it changed, so that I can check each one against the original.
29. As the Research editor, I want relabelled verse sources flagged (the "Bhagavad Gita" heading over Yoga Sūtra 1.30), so that I can confirm each attribution.
30. As the Research editor, I want verses whose work the page doesn't name ("Chapter 2, Sutra 30") flagged with the work the migration assigned, so that I can confirm it.
31. As the Research editor, I want IAST that was transliterated from a page's Devanagari, rather than printed on the page, flagged, so that I check every form the site didn't already print.
32. As the Research editor, I want problems the migration noticed but didn't fix flagged ("five consequences" followed by three; Jīva's text ending mid-citation), so that I decide what the correction is.
33. As the Research editor, I want text adapted from DharmaWiki flagged for attribution, so that we credit it correctly.
34. As the Research editor, I want Reference fields filled only from what the pages say, with each gap flagged instead of looked up, so that I know exactly what has and hasn't been checked.
35. As the Research editor, I want every flag addressed to me in one list, each linked to its record, so that I can work through them in one sitting.

### Psychology expert

36. As the Psychology expert, I want no answer key, cut-off, band or High/Moderate/Low text carried into the new site, so that nothing interprets a score before I approve the rules.
37. As the Psychology expert, I want each Questionnaire record to list the score sections left out and where they were, without quoting them, so that I know exactly what exists to review.
38. As the Psychology expert, I want every Questionnaire's scoring recorded as pending with its reason, so that nobody can build a result from it by accident.
39. As the Psychology expert, I want the KarmaYoga Scale's 45 statements and their options stored word for word, in the order its settings give, so that the instrument isn't altered.
40. As the Psychology expert, I want the nine agreement items whose options run from Strongly Agree to Strongly Disagree kept as they are and flagged, so that I decide whether the order matters.
41. As the Psychology expert, I want the difference between the page's item order and the settings' order flagged, so that I can confirm which order the scale uses.
42. As the Psychology expert, I want the KarmaYoga Scale marked "permission needed" with its rights holder named, so that its items aren't published before the rights are cleared.
43. As the Psychology expert, I want the Dosha Survey's 12 questions stored but never offered as a form, so that it stays "coming later" until its scoring is known.
44. As the Psychology expert, I want oddities in a form flagged and never fixed (the stray "learn to you" field in the Dosha Survey), so that I see each instrument exactly as it was.
45. As the Psychology expert, I want text that only says what a questionnaire measures kept as its purpose and flagged for me, so that I can approve or rewrite it.
46. As the Psychology expert, I want the drafted KarmaYoga limitations kept marked as a draft pending my review, so that visitors are never told they're approved.

### Content editors

47. As a Content editor, I want one record per file, named by its id, so that I can find and change one Concept without touching any other.
48. As a Content editor, I want one command that creates a new record of any kind with its fields laid out, so that I never start from a blank file.
49. As a Content editor, I want the build to stop and name the record, the field and the missing id when I link to something that doesn't exist, so that I can fix it without a developer.
50. As a Content editor, I want the checks to refuse decomposed Sanskrit, ṁ for ṃ and held-back wording, so that I can't publish those mistakes by accident.
51. As a Content editor, I want each record's review status (carried over, drafted or reviewed), so that I know what has been checked.
52. As a Content editor, I want shared text stored once, so that a correction is made in one place.
53. As a Content editor, I want one written standard for carrying content over, so that every record follows the same rules whoever made it.
54. As a Content editor, I want the records in the shape a CMS collection would hold, so that moving to a CMS doesn't mean typing the content in again.

### Project owner and the Client

55. As the Project owner, I want the keep, merge or drop call on each of the 39 current pages and posts applied and shown in one page map, so that I can approve what survives.
56. As the Project owner, I want every flag gathered into one pack, grouped by who must answer it, so that the sign-off pack has one source.
57. As the Project owner, I want rights questions flagged (the KarmaYoga items, Tomar 2024, DharmaWiki text, the Dosha Survey's unknown author), so that nothing is published without permission.
58. As the Project owner, I want homepage areas with no real destination flagged for my decision, so that nothing points at the dead questionnaire app.
59. As the Project owner, I want the topics recorded as provisional, so that I can change them later without rework.
60. As the Project owner, I want the preview flow, the Concept map and the proposals page switched off in production unless someone switches them on, so that nothing I haven't approved goes live.
61. As the Client, I want no new requests sent to the current site during the migration, so that it stays exactly as it is until launch.
62. As the Client, I want author usernames and WordPress paths kept out of the content, so that the handover leaks nothing about the old site's accounts.

### The developer

63. As the developer, I want pages to read content only through one public interface, so that a CMS can replace the files without any page changing.
64. As the developer, I want a single content source under that interface, so that the CMS change and the tests both plug in at one place.
65. As the developer, I want lint to stop pages and components reaching into content internals, and client components importing content values, so that the interface stays the only way in.
66. As the developer, I want the links between records resolved once per process and the build to fail on any dangling id, so that a broken link can't ship.
67. As the developer, I want the registry generated from the data folder and kept out of git, so that it can't go stale in a branch or conflict in a merge.
68. As the developer, I want the foundation pages served unchanged through a legacy adapter, so that content lanes and site lanes can merge in either order.
69. As the developer, I want every content rule enforced by a test (NFC and ṃ, script ranges, provenance, links, held-back wording, no answer keys), so that the rules hold without anyone having to remember them.
70. As the developer, I want views that are plain, serialisable data, so that server components can hand them to small client islands.
71. As the developer, I want the routes, breadcrumbs, A–Z, search documents and Concept-map data computed from the content, so that the pages, tests, sitemap and search can't drift away from it.

### Agents doing the migration

72. As a migration agent, I want a command that prints a clean outline of any saved page, so that I read its structure instead of page-builder markup.
73. As a migration agent, I want a command that fails when any string in my records is neither in the source nor listed as an edit, so that I can prove I invented nothing.
74. As a migration agent, I want my ticket to list the files I may create or edit, so that I never collide with a parallel lane.
75. As a migration agent, I want census files that map every source page to its Reference and passage ids, so that I reuse ids instead of creating duplicates.
76. As a migration agent, I want a written rule for each recurring case (relabelled verses, "#" links, DharmaWiki links, headwords, tables without captions), so that I make the same call every other lane makes.
77. As a migration agent, I want to read the saved copies from a local folder and never the network, so that I cannot touch the current site.

## Implementation Decisions

### The content module

Pages and components, and later the search index, read content only through the public interface (the `@/content` import). Behind it the module has these layers:

- **Public interface:** one namespace per content kind, the site derivations and three pure helpers (below).
- **Views:** what pages receive. Plain, serialisable objects shaped for a page, with every id already resolved.
- **Record schema:** the storage shape, one type per kind, each with an identity helper (`defineConcept()` and so on) that exists only to type-check a record file.
- **The seam:** a content source with one method, `records(kind)`, returning every record of a kind. The local source reads the generated registry. A CMS source implements the same method later, and nothing above it changes. Tests use the same seam to supply made-up records.
- **The graph:** built once per process from the source (a memoised promise). It holds the id maps, the reverse links ("cited by", "quoted in", Concepts per topic and per work) and the computed relations. It throws on any dangling id, naming the record, the field and the missing id, so a broken link can't build.
- **Computed relations (D06).** Two Concepts are related when they quote the same passage, quote the same work, cite the same rarely cited Reference, or share a topic. A Reference is rarely cited when at most 3 Concepts cite it; Tomar (2024) never counts. Each relation carries its reason as a fact ("Both quote Yoga Sūtra 2.30"). The Concept-map edges use the first three kinds only, since topics are the map's sectors. Curated links with an editor's note come later (planning ticket 14).
- **View mappers:** one per kind, from records and the graph to views.
- **Site derivations:** routes, breadcrumb trail, A–Z index, search documents and Concept-map data, one file each. Ticket 13 builds them. Once content v1 is merged, the front-end-site ticket whose Owns list names one of these files may adjust it, keeping the interface and the content tests unchanged, so no two site lanes edit the same file.
- **Legacy adapter:** the foundation's functions and types, unchanged (below).
- **Data:** one record per file, a folder per kind.
- **Generated registry:** written by a script, never committed.

Ticket 01 builds the storage layers (schema, source, registry, graph, legacy adapter); ticket 13, split out so migration can start sooner, builds the views, collections and derivations. It is a deep module in the sense of the developer's setup-ts-deep-modules skill: a small interface over a lot of behaviour, tested at the interface, with no new dependency.

### Records (the storage shape)

The shapes below come from design notes A2. They are inlined because they state the decisions more precisely than prose can; type shapes are this spec's one exception to "no code". Lines marked "settled here" fill gaps the design notes left open (see the next section).

```ts
type Slug = string // lowercase ASCII, hyphenated
interface SanskritName { iast: string; devanagari?: string; ascii: readonly string[] }
type Inline = string // plain text; the renderer tags Devanagari runs and links "(Author, Year)"
interface Flag { for: 'research-editor' | 'psychology-expert' | 'project-owner'; note: string; ticket?: number }
interface Provenance {
  sources: readonly { url: string; retrieved: string }[]
  edits: readonly string[] // one change each; replacements written “old” → “new” (settled here)
  flags: readonly Flag[]
  drafted?: readonly string[] // settled here: field paths written for the new site, not carried over
}
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
interface PassageQuote { passage: string /* 'yoga-sutra/1.30' */; translation?: string /* a translation id */; meaning?: Inline }

interface ConceptRecord {
  kind: 'concept'; slug: Slug
  name: { term?: SanskritName; english?: string } // at least one; english only as the page gives it (settled here)
  summary: Inline // sentence(s) from the page, never newly written
  topics: { primary: Slug; also?: readonly Slug[] }
  verses: readonly PassageQuote[] // the verses at the top of the page, in source order
  sections: readonly Section[]
  references: readonly string[] // the page's reference list, in source order
  questionnaire?: Slug
  related?: readonly { concept: Slug; note: string }[] // curated; empty until planning ticket 14
  external?: readonly { label: string; url: string }[] // e.g. the Concept's own DharmaWiki article
  reviewStatus: ReviewStatus; provenance: Provenance
}
interface WorkRecord { kind: 'work'; slug: Slug; title: SanskritName & { english?: string }
  language?: 'sa' | 'pi' // settled here: Sanskrit unless stated; Dhammapada 160 is Pali
  attribution?: string; locatorLabel: string; editions?: readonly string[]; provenance: Provenance }
interface PassageRecord { kind: 'passage'; id: string; work: Slug; locator: string; order: readonly number[]
  devanagari: readonly string[] // empty, and flagged, when no page gives it (settled here)
  transliteration?: { lines: readonly string[]; scheme: 'iast' | 'informal' }
  translations: readonly { id: string; text: Inline; source?: string }[] // settled here: no stored "quoted on"
  provenance: Provenance }
type ReferenceType = 'journal-article' | 'book' | 'chapter' | 'thesis' | 'web-page' | 'dictionary-entry' | 'report' | 'other'
interface ReferenceRecord { kind: 'reference'; id: string; type: ReferenceType
  authors?: string; year?: string; title: string; container?: string; publisher?: string
  volume?: string; issue?: string; pages?: string; edition?: string
  doi?: string; url?: string; noStableLink?: string // FR-03 "where one exists": say why there is none
  asCited: readonly string[] // each distinct way a source page wrote it
  provenance: Provenance }
interface TopicRecord { kind: 'topic'; slug: Slug; name: { english: string; term?: SanskritName }; order: number
  intro?: { sections: readonly Section[]; references: readonly string[] /* settled here */; provenance: Provenance } }
type QuestionnaireStatus = 'live' | 'preview' | 'coming-soon' | 'coming-later'
interface QuestionnaireRecord { kind: 'questionnaire'; slug: Slug; title: string; sourceTitle: string
  status: QuestionnaireStatus; summary?: Inline; purpose?: readonly Inline[]; format?: readonly Inline[]
  concepts: readonly Slug[]; source?: string; candidateSource?: string // Reference ids; candidate from research ticket 11
  limitations?: { items: readonly Inline[]; status: 'draft-pending-psychology-expert' | 'approved' }
  form?: QuestionnaireForm
  scoring: { status: 'pending'; reason: string } // the only allowed value until planning tickets 26 and 28 supply rules
  heldBack: readonly { what: string; where: string }[] // described, never quoted (settled here)
  rights?: { status: 'permission-needed' | 'cleared'; holder: string; note: string }
  reviewStatus: ReviewStatus; provenance: Provenance }
interface QuestionnaireForm {
  responseSets: Readonly<Record<string, readonly string[]>> // each option list in the source's order
  parts: readonly { id: Slug; title: string; instructions: Inline
    items: readonly { id: string; text: string /* verbatim, never edited */; responseSet: string
      reversed?: true /* settled here: the source lists the options in reverse; says nothing about scoring */ }[] }[] }
interface GlossaryEntryRecord { kind: 'glossary'; slug: Slug; name: { ascii: string; devanagari?: string; iast?: string }
  definition?: Inline; url?: string; concept?: Slug; provenance: Provenance }
interface ResourceListRecord { kind: 'resource-list'; slug: Slug; title: string
  groups: readonly { id: Slug; heading: string; items: readonly ResourceItem[] }[]; provenance: Provenance }
type ResourceItem = { type: 'reference'; reference: string; annotation?: Inline }
  | { type: 'course'; provider: string; name: string; description?: Inline; url?: string }
interface PageRecord { kind: 'page'; slug: Slug; title: string; summary: Inline; sections: readonly Section[]; provenance: Provenance }
interface HomepageRecord { kind: 'home'; shloka: { devanagari: string; iast: string; translation: string }; intro: Inline
  areas: readonly { title: string; text: Inline; target?: Target }[]; closing: Inline; provenance: Provenance }
```

A `Target` names a record (its kind and id, with an optional anchor) or one of the index pages (Concepts, Texts, Questionnaires, Library). Only `hrefFor` turns a target into a path.

### Settled here

The design notes left these open, or the saved copies showed they wouldn't work as written. They work within the register's decisions (D01–D20) and change none of them; the developer may fold them into the register.

1. **Ids are unique within a kind, not across kinds.** The design notes say every id is unique. Across kinds that fails at once: the glossary card "Atman" and the Concept ātman both want `atman`. A record is identified by its kind and id, and every link field implies the kind it points at.
2. **"Quoted on" is computed, not stored.** The design notes store, on each translation, the Concepts that quote it. That would make batch tickets edit passage files the census owns (Bhagavad Gītā 2.54–2.58 are quoted from two batches), and the census would have to name Concepts that don't exist yet, which the graph rejects. A Concept's quote already names the passage and the translation it uses, so the graph derives "quoted in".
3. **The values introduction has its own reference list.** The shared "Raja Yoga Foundations: Yama-Niyama" section cites Tomar (2024), Srinivasan (2016) and Thapliyal et al. (2023). Stored once on the values topic, it needs its own list so its citations resolve on the topic page too.
4. **Drafted text is declared.** The foundation wrote the KarmaYoga Scale's summary, purpose, format and limitations from its instruction steps; they aren't on any page. `provenance.drafted` names such fields. Verify skips and lists them, and a record with drafted fields has the review status "drafted, not reviewed". Only text the foundation already drafted may be drafted; migration tickets draft nothing.
5. **Edits use one convention.** Each edit describes one change. A replacement quotes the old and new text in curly quotes joined by an arrow (“Negliegence” → “Negligence”); a deletion has empty new text (“[2]” → “”). Text a change adds is quoted in full. Verify applies the replacements to the source before matching, and accepts text quoted in full in an edit.
6. **A Concept may have no English name.** Many description pages carry no gloss in their title (Upa-Vikshepa, Panch Klesha, Sthitaprajna, Karta and Triguna among them). A Concept with a Sanskrit term takes its English name only from a gloss the page itself gives, in its title or its text. Where there is none, `english` stays empty rather than have a gloss written for it, and the gap is flagged for the Research editor. A Concept without a term keeps its English title.
7. **A work records its language.** The Friend/Foe page quotes Dhammapada 160 in Pali. `language` defaults to Sanskrit, so the site can tag each passage correctly.
8. **A passage may have no Devanagari.** Yoga Sūtra 1.2 appears only in IAST, on Know Your Mind. Its Devanagari list stays empty and is flagged; it is never filled from elsewhere.
9. **`reversed` records display order only.** It means the source lists that item's options in reverse. It says nothing about scoring.
10. **Held-back items are described, never quoted:** "three result bands with their messages, in the quiz's settings", never the band limits or the wording.
11. **Completeness checks wait for ticket 12.** Some rules can only pass once everything has arrived: every topic has a Concept, every Reference and passage is used, the record counts. The census tickets land References before the Concepts that cite them, and ticket 01 lands five topics with one Concept between them. Ticket 01 writes these checks switched off; ticket 12 switches them on. Every other rule runs from ticket 01.
12. **Late links wait for ticket 12.** Two links point at records a parallel ticket creates: the glossary entry "Chitta Bhumis" to the Concept made from Know Your Mind (ticket 08), and the Dosha Survey to triguṇa (ticket 11), which puts its card in the temperament topic. Setting them early would leave a dangling id.
13. **A coming-later Questionnaire takes its Concept's slug** (the Concept `vikshepa` and the Questionnaire `vikshepa`). Its title is the name the page gives its questionnaire, where it gives one ("Triguna Profile Questionnaire", "Know Your State of Mind Profile"), else the page title. `sourceTitle` is always the page title as published.
14. **Concept slugs follow D02:** the page's own ASCII spelling of the headword, else the hyphenated English title. The slugs in design notes B5 are illustrative. Know Your Mind writes "chittabhumis", so its slug is `chittabhumi`; the Panch Klesha page's own spelling decides between `panch-klesha` and `pancha-klesha`. Each batch ticket records the slug it chose, and why, in its Comments. The census tickets never write a Concept slug: they key everything by the current page's address.
15. **Reference ids** are lowercase ASCII words joined by hyphens: the first author's surname (both surnames for two authors), or for no author a short name of the site or organisation; then the year, when there is one; then a word, only to tell two apart. Examples: `tomar-2024`, `jain-diwakar-2019`, `apa-distraction`. The foundation's ids already fit and stay. An id never changes once used.
16. **Concepts within a topic are ordered alphabetically** by display name, for previous and next, until the Site map (planning ticket 20) sets a reading order.
17. **Feature flags (D16, D20).** Ticket 01 creates the site's `features` module with three flags: `questionnairePreview`, `conceptMap` and `devanagariFirst`, the same three the front-end-site spec uses. Each is on in local runs and Vercel previews and off when `VERCEL_ENV` is `production`, and each can be forced either way by its own environment variable (`FEATURE_QUESTIONNAIRE_PREVIEW=1` or `0`, and likewise `FEATURE_CONCEPT_MAP` and `FEATURE_DEVANAGARI_FIRST`). They are read at build time. The proposals page is on whenever either proposal flag is on. `questionnaires.form()` reads the first; `site.routes()` leaves out every route whose flag is off: a preview Questionnaire's `take/` route, `/concepts/map/`, and `/proposals/` when both proposal flags are off. Front-end-site ticket 04 extends the module later.
18. **Interface text leaves the records.** The foundation homepage's "More Questionnaires … follow" note is interface text. It moves out of the record and into the legacy adapter, and goes when the adapter goes.

### Public interface

From design notes A3, inlined for the same reason as the records:

```ts
export const concepts: {
  get(slug: Slug): Promise<ConceptView | null>
  list(q?: { topic?: Slug; work?: Slug; reference?: string }): Promise<ConceptCard[]>
}
export const topics: { get(slug: Slug): Promise<TopicView | null>; list(): Promise<TopicCard[]> }
export const works: { get(slug: Slug): Promise<WorkView | null>; list(): Promise<WorkCard[]> }
export const references: { list(q?: { type?: ReferenceType; citedBy?: Slug }): Promise<ReferenceView[]> }
export const questionnaires: {
  get(slug: Slug): Promise<QuestionnaireView | null>
  list(): Promise<QuestionnaireCard[]>
  form(slug: Slug): Promise<QuestionnaireFormView | null> // null unless 'live', or 'preview' with features.questionnairePreview on
}
export const library: { get(slug: Slug): Promise<ResourceListView | PageView | null>; list(): Promise<LibraryCard[]> }
export const home: { get(): Promise<HomepageView> }
export const site: { // one derivation file each, built in ticket 13
  routes(): Promise<RouteEntry[]>; trail(path: string): Promise<Crumb[]>; azIndex(): Promise<AzLetter[]>
  searchDocuments(): Promise<SearchDocument[]>; graph(): Promise<ConceptGraph>
}
type RouteEntry = { path: string; kind: string; pattern: string; title: string; sample?: true; proposal?: true }
export { hrefFor, displayName, asciiSpellings } // pure
// Until the front-end-site spec moves the pages: getConcept, listConcepts, getQuestionnaire,
// listQuestionnaires, getHomepage and the foundation's types, unchanged.
```

What the views carry:

- **`ConceptView`:**
  - the name, with the display rule: capitalised IAST if there is a term, else the English title;
  - the summary, and the primary and secondary topics;
  - `verses` as `VerseView`, a superset of the foundation's `Shloka` shape, with a work chip and an `href` to the verse's anchor on its work page;
  - `sections` with resolved blocks (a topic-intro block resolves to the topic's introduction), and a table of contents;
  - `references`, numbered, each with its anchor and a "cited in" list, plus a citation map from in-text strings to Reference ids;
  - `linked`: related Concepts with factual reasons ("Both quote Yoga Sūtra 2.30"), works, the Questionnaire card, and links to the applications and comparison sections;
  - previous and next within the primary topic, external links, provenance and review status.
- **`TopicView`:** the name, its Concepts, the verses they quote, and the introduction where one exists.
- **`WorkView`:** the title and language, and its passages in order, each with its translations attributed and the Concepts that quote it.
- **`ReferenceView`:** every field, its anchor, and the records that cite it.
- **`QuestionnaireView`:** title, status, summary, purpose, format, limitations with their status, source and candidate source. Nothing held back, and no scoring.
- **`QuestionnaireFormView`:** the parts in order, each with its instructions and its items, each item with its options in the source's order. Nothing about scoring.
- **`ResourceListView`, `PageView`, `HomepageView`:** their records with every id resolved and every target turned into a path.
- Every view of a carried-over record also carries its provenance (the old address included) and its review status.

What the site derivations return:

- **`routes()`:** one entry per public page in design B2, with the slugs the content actually has (D01, D02).
  - `pattern` is the route's page-file pattern, such as `/concepts/[slug]/`.
  - `sample` marks one representative route per kind, for sampled end-to-end runs; `proposal` marks the Concept map and `/proposals/`.
  - A route whose flag is off is left out (settled rule 17).
  - A coming-later Questionnaire has no route of its own (it is an anchor on `/questionnaires/`), and `/topics/` is a redirect, not a route.
- **`trail(path)`:** the breadcrumbs of design B6 (D15). The last crumb is the current page; index pages get the short trail (Home › Concepts).
- **`azIndex()`:** the letters A to Z, each with its entries: every Concept, every term inside a Concept (linking to its anchor) and every glossary entry (D14). A glossary entry that names a Concept merges into that Concept's entry. Entries are sorted by their leading name with diacritics ignored, and each carries its names, Devanagari, gloss, link and whether the link leaves the site.
- **`searchDocuments()`:** one document per Concept, term, glossary entry, work, passage, Reference, library item, Questionnaire, topic and page (design A4 estimates about 330). Each has its id, kind, title, link and parent (a term's Concept), and the fields A4 weighs: names (every spelling, Devanagari included), title, keywords (the gloss, the topic, work names and locators such as "YS 1.30" and "Yoga Sutra 1.30"), people (authors; a Concept's people are the authors it cites, so "Tomar" finds the Concepts citing Tomar 2024) and an excerpt of at most 300 characters of real text. The front-end-site search engine applies the weights.
- **`graph()`:** the Concepts as nodes, with their topics, and the edges between them, each with its kind (shared passage, shared work or rarely cited shared Reference) and its reason. The map's rosette positions are the front-end-site ticket's to add.

`hrefFor` follows the site map in design notes B2, with trailing slashes:

| Target | Path |
| --- | --- |
| Concept, or a term inside it | `/concepts/<slug>/`, `#<term id>` |
| Topic | `/topics/<slug>/` |
| Work, or a passage | `/texts/<slug>/`, `#<locator with dots as hyphens>` (`#1-30`) |
| Questionnaire, live or preview | `/questionnaires/<slug>/` |
| Its flow | `/questionnaires/<slug>/take/` |
| Questionnaire, coming later | `/questionnaires/#<slug>` |
| Glossary entry | `/concepts/#<slug>` |
| Reference | `/library/references/#ref-<id>` |
| Reading list or page | `/library/<slug>/` (a group: `#<group id>`) |
| Homepage and the fixed pages | `/`, `/concepts/`, `/concepts/map/`, `/texts/`, `/questionnaires/`, `/library/`, `/library/references/`, `/search/`, `/proposals/` |

Its return type becomes Next's typed `Route` once the front-end-site spec has built the routes.

### Ids, files and the registry

| Kind | Folder | Id | Example |
| --- | --- | --- | --- |
| concept | `concepts` | slug | `vikshepa` |
| topic | `topics` | slug | `values` |
| work | `works` | slug | `yoga-sutra` |
| passage | `passages`, a sub-folder per work | work/locator | `yoga-sutra/1.30` |
| reference | `references` | settled rule 15 | `tomar-2024` |
| questionnaire | `questionnaires` | slug | `karmayoga-scale` |
| glossary | `glossary` | slug | `anubandha-chatushtaya` |
| resource-list | `resource-lists` | slug | `textbooks` |
| page | `pages` | slug | `methods` |
| home | `home` | always `home` | `home` |

- **Slugs** are lowercase ASCII and hyphenated (D02): the page's own ASCII spelling of the headword, else the hyphenated English title (settled rule 14). A slug never changes once published. Term anchors use the term's IAST without diacritics; section ids use the heading's words.
- **One record per file,** as its default export. The file name equals the record's id.
- **The registry** is written by a plain Node script with no dependencies. It scans the data folder, sorts the paths and writes the registry module, which git, Prettier and ESLint all ignore.
  - The `dev`, `build`, `typecheck`, `test` and `test:e2e` scripts run it first, by explicit chaining, not pre-hooks. Every CI job reaches one of them before anything reads content, so the CI workflow doesn't change.
  - Its `--check` mode exits non-zero when the registry on disk is missing or differs from what it would write. Mergers use it, and so does `pnpm check` once front-end-site ticket 01 adds that command.
  - With the registry missing, reading content fails with a message naming the command that writes it.
- **The scaffold,** `pnpm content:new <kind> <id>`, writes a typed template in the right folder and regenerates the registry.

### The boundary rule

ESLint enforces the interface, with no new dependency (the intent of the developer's setup-ts-deep-modules skill):

- Only files inside the content module import its internals. Everything else in the app imports the public interface alone, and relative paths into the module count as internals.
- `'use client'` files may import the public interface for types only.
- Tests may import the seam and the record schema to build made-up sources. Pages and components may not.

### Legacy adapter

- It keeps `getConcept`, `listConcepts`, `getQuestionnaire`, `listQuestionnaires`, `getHomepage`, `asciiSpellings` and the foundation's types, with the same signatures, exported from the public interface.
- It serves the foundation's items only (vikṣepa, the KarmaYoga Scale and the homepage), whatever else the data holds.
- It returns the values the foundation returned, field for field, built from v1 records:
  - the Concept's shlokas from its passages and their translations;
  - the comparison table from the table block in the comparison section;
  - References from their records, under the foundation's ids, with `publication` formatted as before;
  - the homepage areas' links as before (only Concepts, to `#concepts`), whatever targets the record holds;
  - the "More Questionnaires" note, as interface text;
  - statuses mapped back: "preview" to "coming-soon", and every review status to "carried over, not reviewed".
- The one allowed difference: provenance edits may change as the migration lists more of them.
- Front-end-site ticket 03, which moves the pages to the new interface, deletes it.

### The migration standard

Ticket 02 writes the standard for agents. It sets down what the re-homed vikṣepa record already does, plus the rules settled here:

- Real text only. Text is NFC, with anusvara written ṃ.
- Typo fixes are made and listed, as replacements.
- Relabelling is listed and flagged (the vikṣepa page's "Bhagavad Gita (Chapter 1, Sutra 30)" heading over Yoga Sūtra 1.30). A verse whose page doesn't name its work gets the work its text identifies, listed and flagged.
- Inline DharmaWiki links are dropped and listed, but a Concept's own DharmaWiki article is kept as an external link. DharmaWiki citation markers ("[1]") are dropped and listed. DharmaWiki-adapted text is flagged for attribution.
- Score and interpretation sections are held back: listed in `heldBack`, described, never quoted.
- Questionnaire items are kept verbatim: flagged, never fixed.
- The headword comes from the page's own text; otherwise the English title is used and flagged. IAST transliterated from a page's Devanagari is listed and flagged. A gloss is kept only if the page gives one.
- `#` links are dropped and flagged. Other links inside running text are dropped and listed; a link that belongs to a Reference moves to the Reference.
- No images are carried over (D18).
- A sub-heading that names a Sanskrit term becomes a term block; any other sub-heading starts a new section.
- Tables are kept as table blocks. The caption is the page's own, else the heading above the table (listed).
- Text a page labels "Translation" belongs to the passage (census); text labelled "Meaning" is the page's own reading and stays on the Concept's quote.
- Interface text ("Click to learn more", "Read more", "Course Details", "No information available") isn't content; dropping it is listed once per record.
- File ownership: create and edit only what your ticket owns; never edit a file another ticket owns.
- Who gets which flag: the Research editor for sources, spellings, attributions and wording; the Psychology expert for anything about a Questionnaire's items, purpose, limitations or scoring; the Project owner for keep, merge or drop, rights, structure and links with no destination.

### Fidelity tools

Four plain Node scripts with no new dependency. Verify and report load the records the registry lists, using the TypeScript compiler the repo already has or Node's own type stripping.

- **extract `<slug>`** prints a clean outline of one saved page: headings with their level, paragraphs, lists, tables row by row, verse blocks, reference lines, and links with their targets (`#` links and DharmaWiki links marked). For the KarmaYoga Scale it prints the four parts in the settings' order; for the Dosha Survey, its 12 questions, with any other form field listed apart. It never writes into the repo and never touches the network.
- **verify `[kind | kind/id …]`** is the no-invented-text check (no arguments: every record).
  - It normalises both sides: NFC, ṁ to ṃ, letter case, quotes, dashes, whitespace and spacing round punctuation.
  - It applies the record's replacements to its sources, then requires every content string to appear in one of them, or to be quoted in full in one of its edits.
  - An ASCII spelling equal to the term's IAST without diacritics passes: NFR-03 requires it.
  - It skips ids, links between records, URLs, dates and meta fields (provenance, `heldBack`, `scoring`, `rights`, statuses, `noStableLink`), and lists drafted fields as skipped.
  - A record with no saved source, such as the Navare & Pandey (2022) Reference taken from research ticket 11, is listed as unchecked, never as passed.
  - Each miss is printed with the record, the field, the string and the closest source text, and the script exits 1. It runs on the developer's machine only, because the captures never enter the repo or CI.
- **new `<kind> <id>`** is the scaffold above.
- **report** prints every flag grouped by role, with identical notes collapsed into one line with a count and the record ids. It adds the drafted fields, each Questionnaire's held-back items, and a page map: every saved page with the records whose provenance names it, or "dropped". `--write` saves it as the flags pack in this folder; only ticket 12 commits that file.

### The captures rule

- The saved copies of the current site live outside the repo, at `$CARE4MIND_CAPTURES`. On the developer's machine that is `/home/fedora/care4mind-captures` (moved there on 2026-10-27 from a temporary folder a reboot could clear).
- It holds `items.json` (all 33 pages and 6 posts as WordPress REST content, with no author fields) and the KarmaYoga Scale's parsed questions and settings. The answer key, bands, passwords and user fields were removed on purpose and must never be migrated.
- Read them only through the tools, with the variable set. Never commit them, copy them into the repo, or paste raw markup into a record, test or doc.
- Never request care4mind.org or the questionnaire app, for any reason. Nothing is looked up elsewhere to fill a gap either: a gap is flagged.
- CI has no captures. Vitest never reads them; tool tests use small made-up fixtures.

### Provisional structure

From design notes B. The decision register's D-numbers below name the planning ticket that confirms each choice.

**Types (D04, D05).** The kinds in the record shapes above, and no others: a model or technique isn't a type yet, sub-terms stay as anchored term blocks on their Concept's page, and applications and "Indian vs Western" comparisons are section roles, never equivalences.

**Topics (D03).** Topics get no descriptions except the values introduction. Topic pages show computed facts and the verses their Concepts quote.

| Order | Slug | Name | Concepts (primary) | Grounding |
| --- | --- | --- | --- | --- |
| 1 | `self` | Self and person (ātman · jīva) | ātman, jīva, jagat, ātma-bandhu | The posts' own framing; Bhagavad Gītā 6.5 |
| 2 | `mind` | Mind: states and obstacles (citta) | citta-bhūmi, vikṣepa, upa-vikṣepa, pañca kleśa, sthitaprajña | Yoga Sūtra 1.2, 1.30–1.31, 2.3–2.9; Bhagavad Gītā 2.54–2.68 |
| 3 | `practice` | Practice and progress (sādhana) | five steps of perfection, momentum of spiritual practice, spiritual practitioner, brahmavihāra | Yoga Sūtra 1.20–1.22 and 1.33; Sādhana Pañcakam |
| 4 | `values` | Values: yama and niyama | ahiṃsā, satya, asteya, brahmacarya | The shared yama–niyama section, stored once as this topic's introduction; Yoga Sūtra 2.30 and 2.32 |
| 5 | `temperament` | Guṇa and temperament | triguṇa, kartā (and the Dosha Survey card) | Bhagavad Gītā 14; the types of kartā; the triguṇa page's Ayurveda section |

**Keep, merge or drop: all 39 pages and posts (D11, D13, D14, D18).**

| Current | Decision | New home |
| --- | --- | --- |
| `/` (the `care4mind.org` item) | Keep: area links remapped, placeholder cards dropped | `/` |
| `/home/`, `/home-2/` | Drop (duplicates) | Redirect to `/` |
| `/sample-page/` | Drop (WordPress placeholder) | Redirect to `/` |
| `/blog/` | Drop (empty) | Redirect to `/concepts/` |
| `/concepts/` | Keep as glossary entries | `/concepts/` |
| The 16 description pages | Keep: Concept and coming-later Questionnaire (below) | `/concepts/<slug>/` |
| `/methods/` | Keep as a page | `/library/methods/` |
| `/resources/`, `/webpages-and-av-material/` | Drop (empty) | Redirect to `/library/` |
| `/text-books/`, `/text-books-2-2/` | Merge into Text Books; course entries go to Courses, the inspirational section to Inspirational Books | `/library/textbooks/` |
| `/indian-philosophy/` | Merge (a Text Books group) | `/library/textbooks/#indian-psychology-and-philosophy` |
| `/positive-psychology/` | Merge into Text Books, keeping both descriptions | `/library/textbooks/#positive-psychology` |
| `/inspirational-books/` | Keep; de-duplicate against the Text Books section | `/library/inspirational-books/` |
| `/institutes/` ("Courses") | Keep; merge in the IGNOU and NIOS entries | `/library/courses/` |
| `/surveys/`, `/teertha-yatra-quiz/` | Drop (empty) | Redirect to `/questionnaires/` |
| `/dosha-survey/` | Keep as a coming-later Questionnaire: 12 questions stored, not shown as a form | `/questionnaires/#dosha-survey` |
| `/karmayoga-scale/` | Keep as the preview flow | `/questionnaires/karmayoga-scale/` |
| `/atman/`, `/jiva/`, `/jagat/` | Keep as Concepts (attribution flag on the first two) | `/concepts/<slug>/` |
| `/anubandha-chatushtaya/` | Merge into its glossary entry (a 19-word stub) | `/concepts/#anubandha-chatushtaya` |

Redirects themselves, and the other URL classes, belong to planning ticket 24 and front-end-site ticket 14. Each record keeps its old URL in provenance, so redirects for kept pages can be generated from the content.

**The 16 description pages (D12).** Each becomes a Concept and a coming-later Questionnaire. The Concept keeps the verses, definition, components (as term blocks), consequences, absence or disturbances, solutions, applications, Indian vs Western sections and tables, and References. The Questionnaire record holds `sourceTitle`, `concepts: [slug]`, the candidate source where research ticket 11 matched one, `scoring: pending` and `heldBack`. Text that only says what a questionnaire measures, without interpreting scores, may become its `purpose`, flagged for the Psychology expert.

| Page | Concept (illustrative slug) and headword | Topic | Held back | Candidate source (research ticket 11) |
| --- | --- | --- | --- | --- |
| `/vikshepa/` | `vikshepa` vikṣepa (Distraction) | mind | Overall Score indicator; High, Moderate and Low indicators | Tomar (2024) |
| `/upavikshepaprofiling/` | `upa-vikshepa` upa-vikṣepa | mind | Same | Tomar (2024) |
| `/panchkleshavikaarprofiling/` | `pancha-klesha` pañca kleśa; the five kleśas and six vikāras as term blocks | mind | Score indicator; High, Moderate and Low for each kleśa | Tomar (2024) |
| `/knowyourmind/` | `citta-bhumi` citta-bhūmi (the page says "chittabhumis") | mind | Score-Based Indicators | Tomar (2024) |
| `/sthitaprajna/` | `sthitaprajna` sthitaprajña | mind (also self) | Overall Score indicator; High, Moderate and Low | None found |
| `/fivestepsofperfectionprofiling/` | `five-steps-of-perfection` (English title); śraddhā, vīrya, smṛti, samādhi and prajñā as term blocks | practice | Score indicator by step | None found |
| `/momentumofspiritualpractice/` | `momentum-of-spiritual-practice` (English title; flag saṃvega from Yoga Sūtra 1.21) | practice | Overall Score indicator; High, Moderate and Low | Tomar (2024) |
| `/spiritualpractitionerprofiling/` | `spiritual-practitioner` (English title) | practice | Same | Tomar (2024) |
| `/brahmavihara/` | `brahmavihara` brahmavihāra | practice | Score-Based Indicators | Tomar (2024) |
| The four "Know Your Values" pages | `ahimsa`, `satya`, `asteya`, `brahmacharya` | values | Overall Score Indicator; Score Wise Category Description | Tomar (2024) |
| `/frienorfoeofself/` | `atma-bandhu` ātma-bandhu and ātma-ripu | self | Scoring Continuum; High, Moderate and Low ("Self Management Strategies" is kept) | Tomar (2024) |
| `/karta-2/` | `karta` kartā | temperament (also self) | Karta Score-Based Indicators | Tomar (2024) |
| `/triguna/` | `triguna` triguṇa | temperament | The High, Moderate and Low Characteristics table under "Triguna Profile Questionnaire"; the shortcode and its test message are dropped | Tomar (2024) |

The slugs in this table come from design notes B5 and are illustrative. Each batch ticket applies D02 (settled rule 14) and records the slug it chose; Know Your Mind's, for example, becomes `chittabhumi`.

The design notes place Triguna's held-back text in "Guna Predominance". In the saved copy that section holds Bhagavad Gītā 14.11–14.13 and is kept; the score table sits under "Triguna Profile Questionnaire".

**Questionnaires: 18 records (D12, D16).**

- The KarmaYoga Scale, status "preview", with its form.
- The Dosha Survey, status "coming later", its 12 questions stored but never returned as a form.
- One "coming later" record per description page (16).
- No record has an answer key, points, weights, bands, cut-offs or result texts. Every record's scoring is `{ status: 'pending', reason }` until planning tickets 26 and 28 supply rules.
- **KarmaYoga form.** The parts follow the settings' `question_ids`, not the page markup, whose order differs (flagged): steps 58, 59, 61 and 63 hold 12, 6, 9 and 18 items. Parts 1 and 3 use the frequency options (Always to Never: 21 items); parts 2 and 4 the agreement options (Strongly Disagree to Strongly Agree: 24 items). The nine agreement items with ids 34–42 list their options from Strongly Agree, so they are marked `reversed` and flagged. Rights are "permission needed", held by Navare & Pandey (2022); some of its reward items also appear in Mulla & Krishnan (2014).
- **Dosha Survey.** 12 questions with three options each, every question its own response set. After question 9 the saved copy has a field labelled "learn to you". The design notes call it stray text in question 9; it is the hidden anti-spam field WPForms adds (docs/current-site.md), so it is left out, listed and flagged, so that nobody mistakes it for a lost question. Its author is unknown (research ticket 11 found no published source), so its rights are "permission needed" with the holder unknown.

### Parallel migration

- **The graph of tickets.** 01 builds the model; 02 the tools and standard; 03 and 04 the census of References, works and passages; 05, 06 and 07 the glossary and short posts, the Questionnaire forms, and the library and homepage; 08–11 the four Concept batches; 12 the sweep and the flags pack.
- **Owns lists.** Each ticket lists the files it may create or edit. Ownership passes on at a hand-over: 01's References go to 03, its works and passages to 04, the KarmaYoga record to 06, the homepage to 07 and the values topic to 10. The vikṣepa Concept stays 01's, except for its `questionnaire` field, which 08 sets.
- **Census before batches.** Tickets 03 and 04 write a census in this folder mapping every source page, by its current address, to its Reference, passage and translation ids. The census never names a Concept slug; the batch tickets choose those. Batch tickets reuse the census ids. A batch ticket may add a Reference or passage file only when the census lacks it, and must say so in its Comments; it never edits a file the census tickets own. A missing translation or citation form is noted in Comments for ticket 12.
- **Tests.** Each ticket adds its own test file, so no two lanes edit the same test.
- **Merging.** Lanes merge into `SiddharthMuramkar/content-v1` one at a time. After each merge the merger regenerates the registry, runs the done-check and the full Playwright suite; the foundation's pages must stay green.

## Testing Decisions

- **A good test asserts what an outsider can observe:** the view a page would get, the error a broken link gives, the rule a record breaks. It doesn't assert the graph's private maps, the registry's text, or the layout of a record file beyond the id rules.
- **The one seam.** Interface tests build small made-up content sources and call the public interface. Integrity tests read the real records through the same interface and source.
- **Interface (ticket 13):**
  - a dangling id fails with an error naming the record, the field and the id;
  - each namespace returns null for an unknown slug and a view for a known one, and the lists filter by topic, work, Reference and type;
  - `ConceptView` follows the display rule both ways, resolves verses with their work and `href`, numbers References with anchors and "cited in", resolves "(Author, Year)" citations, gives factual reasons for linked items, resolves a topic-intro block, and orders previous and next within the primary topic;
  - `form()` returns null for "coming later", and for "preview" with `questionnairePreview` off; it returns the form for "preview" with the flag on, and for "live";
  - the `features` flags follow their defaults in local, preview and production environments, and each environment variable forces its flag either way;
  - `hrefFor` follows the site map for every kind; `displayName` and `asciiSpellings` behave as specified;
  - every view survives a JSON round trip unchanged;
  - the derivations: `routes()` lists one entry per page with one sample per kind and drops each flagged route when its flag is off; `trail()` gives design B6's trails; `azIndex()` merges a glossary entry into the Concept it names and sorts with diacritics ignored; `searchDocuments()` gives each kind its fields, with a term's parent set; `graph()` gives each edge its kind and reason, and a Reference cited by four or more Concepts, or Tomar (2024), makes no edge.
- **Registry (ticket 01):** every file name equals its record's id; ids are unique within a kind; each record's kind matches its folder; `--check` passes after the script runs and fails when a file is added without running it (shown on a temporary folder).
- **Integrity (ticket 01, on from the start), over every real record:**
  - every string is NFC, with ṃ and never ṁ;
  - ASCII spellings are plain ASCII; IAST fields hold only Latin letters with IAST and ISO 15919 marks; Devanagari fields hold only Devanagari, the dandas and the joiners; every character of every string is one the site's font subsets cover;
  - every record except a topic has provenance with at least one source and a date; a topic introduction has its own;
  - no string contains `wp-json`, `wp-admin`, `wp-content` or `/author/`, and no care4mind.org link appears outside provenance;
  - every id a record names exists, as the right kind;
  - FR-03: every Reference has a title and a DOI or URL, or `noStableLink` with a reason; a paper or book also has authors, a container or publisher, and a year, or a Research-editor flag naming what's missing;
  - the held-back guard: no content string contains "Score indicator", "Score-Based Indicators" (in either spacing), "Score Wise Category", "Scoring Continuum", "High indicators", "Moderate Indicators", "Low Indicators", "High Score", "Moderate Score", "Low Score", "High Characteristics", "Moderate Characteristics", "Low Characteristics", "Score indicators for" or "scored on a scale", or a sentence saying what a high, moderate or low score means;
  - no record has a key named for an answer, a correct option, points, weights, bands, cut-offs or result text; every Questionnaire's scoring is pending with a reason, and one with a form records its rights;
  - each Concept has one primary topic that exists, never repeated in `also`, and has an IAST term, an English name or both;
  - a Concept's Questionnaire lists that Concept among its concepts;
  - every in-text citation in a Concept, or in the values introduction, resolves to one of its References, or a Research-editor flag on that record quotes it;
  - a record with drafted fields has the review status "drafted, not reviewed".
- **Completeness (written in ticket 01, switched on in ticket 12):**
  - every topic has a Concept; every Reference is cited by a record; every passage is quoted; every work has a passage;
  - 19 Concepts; 18 Questionnaires (1 preview, 17 coming later); 5 topics; 3 reading lists; 1 page; the homepage; and the number of glossary entries ticket 05 records;
  - each description-page Concept and its Questionnaire point at each other;
  - the glossary entries for Atman, Jiva, Jagat and Chitta Bhumis link to their Concepts.
- **Legacy (ticket 01):** before the re-homing starts, a test records what the legacy functions return; afterwards they return the same, with only provenance edits allowed to differ. The existing content unit test passes unchanged.
- **Boundary (ticket 01):** a test lints small fixture snippets with the repo's config: an internal import from a page fails, a value import in a `'use client'` file fails, a type-only import passes.
- **Each ticket's own checks (02–11):** each ticket's test file asserts its counts and specifics, such as the KarmaYoga Scale's 12, 6, 9 and 18 items.
- **Tools (ticket 02):** the normaliser, the edit conventions, matching and misses, and the outline of a small made-up page. No captured text is copied into a test or fixture. A test checks that no tool imports a network module.
- **Verify is not a Vitest test.** It needs the captures, which CI doesn't have. Every content ticket runs it on its own records as part of the done-check, and ticket 12 runs it on everything.
- **Playwright.** No content ticket runs it, because pages don't change. The merger runs the full suite after each merge, and the foundation's e2e must stay green. Content v1 adds no e2e tests.
- **The done-check** for every ticket: `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, plus verify on the ticket's records from ticket 02 on.
- **Prior art:** the current content unit test (its walk over every string, the NFC rule and the link checks), the Sanskrit test (normalisation) and the contrast test (it reads source files with a glob, the pattern for the registry test).

## Out of Scope

- Pages, components and UI: the front-end-site spec. That includes every route file, the KarmaYoga flow, search, the A–Z page, the Concept map and "Devanagari first".
- The search engine (index building, normalisation, matching and weights) and the Concept map's layout: front-end-site tickets 09 and 12. Content v1 supplies only their data.
- Moving the foundation pages to the new interface and deleting the legacy adapter (front-end-site ticket 03).
- Feature flags beyond the three settled here (front-end-site ticket 04 adds the rest).
- Any request to the current site or its questionnaire app, and any lookup to fill a gap (DOIs, years, missing translations).
- Images and media, and their alt text.
- Scoring, bands, interpretation and result texts; the Questionnaire engine (planning tickets 26 and 28).
- Changes to GLOSSARY.md. The terms this spec uses that the glossary doesn't define yet (topic, work, passage, glossary entry, reading list, flag, held back) stay provisional, as the register's D04 does for the types, until the planning tickets settle them.
- Redirects from old URLs (planning ticket 24; front-end-site ticket 14).
- Curated related Concepts and links to modern constructs (planning ticket 14).
- The CMS, editor login and the editing trial (planning tickets 22 and 23).
- Rewriting, translating or scholarly checking of content (excluded by the brief).
- The text of dropped pages.

## Further Notes

- **Owns lists name paths on purpose.** The ticket template avoids file paths, because they go stale. These tickets break that rule in one place, the Owns list, because parallel lanes need to know exactly which files are theirs.
- **The captures may vanish.** They sit under `/tmp`, which a reboot can clear. Before migration starts, copy them to a durable, git-ignored place outside the repo and point `$CARE4MIND_CAPTURES` there; nothing may be fetched again to replace them.
- **What the front-end-site spec builds on.** Its tickets start once content v1 is merged into `SiddharthMuramkar/frontend`. After ticket 13 the public interface exists, derivations included; after ticket 12 the content is complete and the flags pack is ready. From then on a site ticket may adjust only the one derivation file its Owns list names; its ticket 03 deletes the legacy adapter, its ticket 04 extends the `features` module, and its ticket 14 builds the redirects from the slugs and provenance content v1 shipped.
- **Planning tickets that confirm the provisional choices:** topics (13), links between content (14), Sanskrit display (15), texts and passages (16), References and citation style (17), keep, merge or drop (19), site map (20), URLs (24), the Questionnaire record (26), launch scope (28) and the sign-off pack (29). The decision register maps each choice to its ticket.
- **Real text only.** Nothing in this spec adds content. Interface words, such as the heading "What it is for", belong to components.
