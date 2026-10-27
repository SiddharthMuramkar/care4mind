# 02: Migration tooling and the standard

Status: ready-for-agent
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

- [ ] **Captures only:**
  - every tool reads saved copies only from `$CARE4MIND_CAPTURES`, and fails with a clear message when it is unset or the folder is missing;
  - no tool writes into the repo, except report with `--write`;
  - no tool imports a network module, and a test checks it.
- [ ] **extract `<slug>`** prints an outline of one saved page:
  - headings with their level, paragraphs, lists, tables row by row, verse blocks (Devanagari and transliteration lines together, with the label above them), reference-list lines, and links with their targets, marking `#` links and DharmaWiki links;
  - Elementor and WordPress markup gone, entities decoded, text NFC;
  - for `karmayoga-scale`, the four parts in the settings' `question_ids` order, each with its instruction text, items and options;
  - for `dosha-survey`, its 12 questions with their options, with any other form field listed apart as not part of the survey.
- [ ] **verify `[kind | kind/id …]`** (no arguments: every record):
  - normalises both sides: NFC, ṁ to ṃ, letter case, straight and curly quotes, dashes, whitespace and spacing round punctuation;
  - applies the record's “old” → “new” edits to its sources, then requires every content string to appear in one of its provenance sources, or to be quoted in full in one of its edits;
  - passes an ASCII spelling equal to its term's IAST without diacritics, ignoring case, spaces and hyphens;
  - skips ids, links between records, URLs, dates and meta fields (provenance, `heldBack`, `scoring`, `rights`, statuses and `noStableLink`), and lists `drafted` fields as skipped;
  - lists a record with no saved source, such as `navare-pandey-2022`, as unchecked, never as passed;
  - prints each miss with the record, the field path, the string and the closest source text, and exits 1 on any miss; otherwise prints a summary and exits 0.
- [ ] **new `<kind> <id>`** (`pnpm content:new`): writes a template with every field of the kind laid out, in the right folder; refuses an existing file or an id that breaks the id rules; regenerates the registry.
- [ ] **report:**
  - prints every flag grouped by role (Research editor, Psychology expert, Project owner), each with its record and planning ticket, collapsing identical notes into one line with a count and the ids;
  - then the drafted fields, each Questionnaire's held-back items, and a page map: every saved page with the records whose provenance names it, or "dropped";
  - `--write` saves it as `.scratch/content-v1/flags.md`. Only ticket 12 commits that file.
- [ ] **Tool tests** cover the normaliser, parsing and applying edits, matching and misses, and the outline of a small made-up page. No captured text is copied into a test or a fixture.
- [ ] **The standard** (`docs/agents/content-migration.md`), written with the developer's writing-for-agents skill (`~/.claude/skills/writing-for-agents/SKILL.md`):
  - first the ordered steps, each with a completion criterion: read the ticket and its Owns list, read the census, extract each page, write the records, run verify, add flags, run the done-check, note gaps in Comments;
  - then the rules, as reference: every rule in the spec's "The migration standard", the edit convention, D02 slugs, where the captures live and the captures rule, file ownership, and who gets which flag.
- [ ] **AGENTS.md** gains one pointer line, front-loaded on its trigger, telling an agent to read the standard before creating or editing anything in the content data folder.
- [ ] **Ticket 01's records pass verify:** `verify` on `concept/vikshepa`, its works, passages and References, `questionnaire/karmayoga-scale` and `home/home` exits 0.
  - A miss is fixed by listing the edit that explains it, or by declaring a field drafted, never by changing text (the legacy snapshot pins it).
  - Anything declared drafted, and any text that turns out to have been written rather than carried over (the foundation's vikṣepa summary, for instance), is flagged for the Research editor and noted in Comments.
- [ ] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs concept/vikshepa work passage reference questionnaire/karmayoga-scale home`. No Playwright run: pages don't change.

## Comments
