# 02: Migration tooling and the standard

Status: resolved
Blocked by: 01
Spec: [Content v1: the current site's content as typed records](../spec.md)

**What to build:** everything a migration agent needs to carry pages over the same way, and to prove it invented nothing.

- Four commands work on the saved copies and the records: extract prints a clean outline of any saved page, verify checks every string in a record against its page, new scaffolds a typed record, and report gathers every flag into a pack.
- A written standard sets the rules, and one line in AGENTS.md points every agent at it.
- The records ticket 01 re-homed pass verify.

## Owns

- `scripts/content/extract.mjs`, `verify.mjs`, `new.mjs` and `report.mjs` (new)
- `package.json`: the `content:new` script
- `docs/agents/content-migration.md` (new)
- `AGENTS.md`: one pointer line
- `tests/unit/content-tools.test.ts` (new) and its made-up fixtures
- the provenance of the records ticket 01 created: edits and `drafted` only, to make verify pass, never their text

## Acceptance criteria

- [x] **Captures only:**
  - every tool reads saved copies only from `$CARE4MIND_CAPTURES`, and fails with a clear message when it is unset or the folder is missing;
  - no tool writes into the repo, except report with `--write`;
  - no tool imports a network module, and a test checks it.
- [x] **extract `<slug>`** prints an outline of one saved page:
  - headings with their level, paragraphs, lists, tables row by row, verse blocks (Devanagari and transliteration lines together, with the label above them), reference-list lines, and links with their targets, marking `#` links and DharmaWiki links;
  - Elementor and WordPress markup gone, entities decoded, text NFC;
  - for `karmayoga-scale`, the four parts in the settings' `question_ids` order, each with its instruction text, items and options;
  - for `dosha-survey`, its 12 questions with their options, with any other form field listed apart as not part of the survey.
- [x] **verify `[kind | kind/id …]`** (no arguments: every record):
  - normalises both sides: NFC, ṁ to ṃ, letter case, straight and curly quotes, dashes, whitespace and spacing round punctuation;
  - applies the record's “old” → “new” edits to its sources, then requires every content string to appear in one of its provenance sources, or to be quoted in full in one of its edits;
  - passes an ASCII spelling equal to its term's IAST without diacritics, ignoring case, spaces and hyphens;
  - skips ids, links between records, URLs, dates and meta fields (provenance, `heldBack`, `scoring`, `rights`, statuses and `noStableLink`), and lists `drafted` fields as skipped;
  - lists a record with no saved source, such as `navare-pandey-2022`, as unchecked, never as passed;
  - prints each miss with the record, the field path, the string and the closest source text, and exits 1 on any miss; otherwise prints a summary and exits 0.
- [x] **new `<kind> <id>`** (`pnpm content:new`): writes a template with every field of the kind laid out, in the right folder; refuses an existing file or an id that breaks the id rules; regenerates the registry.
- [x] **report:**
  - prints every flag grouped by role (Research editor, Psychology expert, Project owner), each with its record and planning ticket, collapsing identical notes into one line with a count and the ids;
  - then the drafted fields, each Questionnaire's held-back items, and a page map: every saved page with the records whose provenance names it, or "dropped";
  - `--write` saves it as `.scratch/content-v1/flags.md`. Only ticket 12 commits that file.
- [x] **Tool tests** cover the normaliser, parsing and applying edits, matching and misses, and the outline of a small made-up page. No captured text is copied into a test or a fixture.
- [x] **The standard** (`docs/agents/content-migration.md`), written with the developer's writing-for-agents skill (`~/.claude/skills/writing-for-agents/SKILL.md`):
  - first the ordered steps, each with a completion criterion: read the ticket and its Owns list, read the census, extract each page, write the records, run verify, add flags, run the done-check, note gaps in Comments;
  - then the rules, as reference: every rule in the spec's "The migration standard", the edit convention, D02 slugs, where the captures live and the captures rule, file ownership, and who gets which flag.
- [x] **AGENTS.md** gains one pointer line, front-loaded on its trigger, telling an agent to read the standard before creating or editing anything in the content data folder.
- [x] **Ticket 01's records pass verify:** `verify` on `concept/vikshepa`, its works, passages and References, `questionnaire/karmayoga-scale` and `home/home` exits 0.
  - A miss is fixed by listing the edit that explains it, or by declaring a field drafted, never by changing text (the legacy snapshot pins it).
  - Anything declared drafted, and any text that turns out to have been written rather than carried over (the foundation's vikṣepa summary, for instance), is flagged for the Research editor and noted in Comments.
- [x] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs concept/vikshepa work passage reference questionnaire/karmayoga-scale home`. No Playwright run: pages don't change.

## Comments

- **Built (2026-10-28).** Four plain Node tools in `scripts/content/` (no new dependency), the standard (`docs/agents/content-migration.md`), its pointer at the top of `AGENTS.md`, `pnpm content:new`, and 39 tests in `tests/unit/content-tools.test.ts` with made-up fixtures written inline. Seams: the captures (`openCaptures()` in `extract.mjs`, the only place a saved page is read, tested over made-up captures folders), `checkRecord()` (verify's matching, tested with made-up records), `buildReport()`, and each command line, tested by running it on a temporary repo root (`--root`).
- **Decisions the spec left open:**
  - The Owns list allows only the four tool files, so they share code by importing each other: `extract.mjs` is also the captures module and the command-line plumbing, `verify.mjs` the records module (it reads the generated registry through `module.registerHooks` and the repo's TypeScript compiler, so it needs Node 22.15 or newer: this machine runs 22.23, CI 24). A missing or stale registry stops verify and report, naming `node scripts/content/registry.mjs`.
  - Exit codes: 0 clean, 1 a miss, 2 when a tool can't run (no captures, an unknown kind or id, a stale registry, a bad argument).
  - verify searches each page with all of a record's replacements applied, with each one alone, and with none: two edits can change one sentence for two strings, and `asCited` keeps the page's wording. "Quoted in full" means inside a curly-quoted text of an edit; quotes nest when balanced, and nothing written another way (`"a" -> "b"`) is applied.
  - A Reference's year is checked like its title; the dates verify skips are the retrieval dates in provenance. Otherwise a looked-up year would pass.
  - A topic's name and order are the design notes' structure, so a topic with no introduction is listed as "structure only" (neither passed nor unchecked); an introduction is checked against its own provenance.
  - A care4mind.org source with no saved copy fails, so a mistyped address can't pass as unchecked. A Questionnaire's `source` is a link; a translation's `source` is text and is checked.
  - extract groups verse lines by script: a run of Devanagari lines (Devanagari at least half the letters), then the Latin lines after them with fewer than two common English words; a transliteration with no Devanagari counts when it carries a verse mark and IAST letters. Each verse is labelled with the nearest heading or tab above. Reference lines are those after a "References" or "Online Resources" heading or tab. It also accepts an address or URL, and `--json`.
  - The KarmaYoga Scale's outline takes its part order from `karmayoga-settings.json` (`question_ids`), its items and options from `karmayoga-questions.json`, and each part's title and instructions from the page's own step markup. Each distinct option list is printed once and numbered: items 34–42 use the reverse of the agreement list. The page markup's item order is printed for the flag, and the start and results pages' text is listed as not items. Scripts in the saved page (which hold the quiz plugin's encoded options) are never read.
  - Forms are outlined generically: each fieldset is a question; any other control is listed apart with the question it follows. The Dosha Survey gives 12 questions of three options and a text field "learn to you" after question 9.
  - "No tool writes into the repo" holds for the tools that read the captures (extract, verify, report without `--write`), and a test proves it on a temporary root. `new` writes its record file and the registry by design. Its templates leave the source address empty, so the integrity tests fail until it is filled, and prefill `retrieved: '2026-10-27'`, the day the copies were made.
  - The flags pack has no date in it, so it diffs cleanly when ticket 12 commits it. Identical notes collapse by role and wording; their tickets merge.
- **Ticket 01's records:** verify on `concept/vikshepa work passage reference questionnaire/karmayoga-scale home` exits 0: 17 passed, `navare-pandey-2022` unchecked (its source is the paper's DOI), drafted fields listed (vikṣepa's summary; the KarmaYoga Scale's summary, purpose, format and limitations). verify found one miss, fixed by an edit rather than a text change: in vikṣepa's anavasthitatva paragraph the foundation had joined the page's “above- mentioned” into “above-mentioned” without listing it, and the edit now does. With no arguments, verify checks all 23 records: the same, plus the five topics as structure only.
- **Flags:** none new. The text that turned out written rather than carried over is the drafted text ticket 01 declared, and each piece is already flagged: vikṣepa's summary for the Research editor, and the KarmaYoga Scale's summary, purpose, format and limitations for the Psychology expert, who owns a Questionnaire's purpose and limitations under the standard. The one unlisted change verify found was a typo fix, now listed. This ticket's Owns list allows only edits and `drafted` on those records, so if the KarmaYoga drafts should also carry a Research-editor flag, ticket 06, which owns that record next, can add it.
- **For later tickets:** extract confirms ticket 05's counts on `/concepts/`: 82 cards, 83 DharmaWiki links (one is the inline "Vedic" red link) and 11 "No information available" notes. Verse grouping is a reading aid, not a census: check its edges against the page. The census files (tickets 03 and 04) don't exist yet; the standard's step 2 points at them.
- **Left over:** nothing in this ticket's scope.
