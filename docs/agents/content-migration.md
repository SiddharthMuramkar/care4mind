# Content migration standard

How every content lane carries the current site's saved pages into content v1 records: the same calls in every lane, and proof that nothing was invented. The model itself is in the [content-v1 spec](../../.scratch/content-v1/spec.md); this is how to fill it.

## Steps

Work through them in order.

1. **Read your ticket and its Owns list.** The Owns list names every file you may create or edit; the acceptance criteria name the records, slugs, flags and counts expected of you.

   Done when you can name each file you'll touch, and each one is on the Owns list.
2. **Read the census.** `.scratch/content-v1/census/references.md` and `passages.md` map each saved page, by its current address, to its Reference, passage and translation ids. Tickets 03 and 04 write them.

   Done when you know the id of every Reference, verse and translation your pages use, or have noted each one the census lacks.
3. **Extract each page.** `node scripts/content/extract.mjs <slug>`, with `$CARE4MIND_CAPTURES` set, prints its outline (see [Reading an outline](#reading-an-outline)).

   Done when every block of every outline has a home: a record field, a Questionnaire's `heldBack`, or a provenance edit saying it was dropped. Check the headings one by one: an edit that drops one quotes it as the page writes it.
4. **Write the records.** `pnpm content:new <kind> <id>` writes each new record file with every field of its kind laid out, then the registry. Fill it from the outline by the rules below.

   Done when each field holds the page's own text, or an edit lists the change.
5. **Run verify** on every record you wrote or edited: `node scripts/content/verify.mjs <kind>/<id> …` (a bare kind, such as `reference`, checks all of that kind).

   Done when it exits 0, and lists as unchecked only records that have no saved page.
6. **Add flags.** Every question you noticed but may not decide becomes a flag for its role (see [Who gets which flag](#who-gets-which-flag)).

   Done when each problem you noticed is either fixed and listed as an edit, or flagged.
7. **Run the done-check** your ticket gives: `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then verify on your records.

   Done when every command passes.
8. **Note gaps in Comments.** Under your ticket's `## Comments`: the slugs you chose and why, your counts, the flags you raised, the ids the census lacked, and anything left for ticket 12.

   Done when someone reading only your Comments could check your work.

## The captures

- The saved copies of the current site live outside the repo, in the folder `$CARE4MIND_CAPTURES` names. On the developer's machine: `export CARE4MIND_CAPTURES=/home/fedora/care4mind-captures`. It holds `items.json` (the 33 pages and 6 posts as WordPress REST content) and the KarmaYoga Scale's parsed questions and settings.
- Read them only through the tools: extract prints a page, and verify and report read them themselves. Each tool stops with a clear message when the variable is unset or the folder is missing.
- The copies stay outside the repo: never commit them, copy them into it, or paste raw markup into a record, test or doc. Tool tests use small made-up fixtures.
- The current site stays untouched until launch. Send no request to care4mind.org or the questionnaire app, for any reason, and look nothing up anywhere to fill a gap: a gap is flagged.
- The answer key, bands, passwords and user fields were removed from the copies on purpose. Nothing of that kind is migrated, and no author username is written anywhere.
- Each source in provenance is `{ url: 'https://care4mind.org/<address>/', retrieved: '2026-10-27' }`: the page's address, and the day the copies were made. Redirects are built from these addresses.

## Reading an outline

extract prints one block per line, its type first:

- `h1`–`h6` a heading · `p` a paragraph, one line per line break · `list`, then its items (`•`, or `1.` when numbered) · `table`, then its rows: `th` a row of header cells, `td` any other, cells split by `|`, lines inside a cell by `⏎` · `tab` an accordion title · `ref` a line of a reference list · `image` · `rule` · `shortcode`.
- `verse`: a run of Devanagari lines and the transliteration lines after them, `under` the nearest heading or tab above, each line marked `devanagari` or `latin`. extract groups verses by script, so check their edges against the page: a short English line can read as transliteration.
- `form`: a form's questions with their options, then the fields that aren't questions (such as the anti-spam field a form plugin adds), with the question they follow.
- `quiz` (the KarmaYoga Scale): its parts in the order its settings' `question_ids` give, each with its title, instructions and items; each distinct option list once, numbered; the item order of the page markup; and the quiz text that isn't an item (its start and results pages).
- Each link follows its block as `link “text” → target`, marked `[#]` (a link to nowhere), `[DharmaWiki]` or `[current site]`.
- Text is NFC, with entities decoded and whitespace collapsed; nothing else is changed (`ṁ` stays as the page has it). `--json` prints the same outline as data.

## Real text only

- Every string in a record is the page's own text, or a change listed in provenance as an edit. Nothing is invented, reworded or looked up.
- Text is NFC, with anusvara written ṃ (U+1E43), never ṁ. `normaliseSanskrit()` in `src/lib/sanskrit.ts` does both; list the anusvara change once per record.
- Changes verify ignores need no edit: letter case, curly or straight quotes, the kind of dash, and spacing. List a deliberate one anyway when it changes how a title or name reads (a title put in sentence case).
- Typos are fixed and listed as replacements: `“Negliegence” → “Negligence”`. Questionnaire items are the exception: kept verbatim, flagged.
- A character the site's fonts don't cover, such as an emoji, is left out. The font rule reads provenance too, so the edit names it by its code point (U+1F464) and quotes the resulting text in full.
- A problem you notice but may not fix (a "five consequences" followed by three, text that stops mid-citation) stays as the page has it, flagged for the Research editor.

## Edits

- `provenance.edits` lists every change, one per edit, in plain words.
- A replacement quotes the old and the new text in curly quotes joined by an arrow: `“Indian vs Western concept” → “Indian and Western concepts”`. A deletion has empty new text: `“[2]” → “”`. Text a change adds is quoted in full. One edit may list several replacements of one kind: `Typos fixed: “a” → “b”, “c” → “d”.`
- Quote the old text as the page writes it (copy it from the outline), so the replacement finds it. Curly quotes inside a quote must balance: write a lone one straight, which verify reads as the same mark (`“‘Asteya" in the” → “‘Asteya’ in the”`).
- verify applies every replacement to the page wherever its old text occurs, then searches the page with all of them applied, with each one alone, and as it is. It accepts any text quoted in full in an edit. It reads only this convention: `"old" -> "new"` is not applied.

## Headwords, terms and glosses

- A Concept's headword comes from the page's own text (D07): its IAST, its Devanagari, and in `ascii` the plain spellings the page uses. A page with no Sanskrit headword is named by its English title, flagged for the Research editor.
- IAST that the page doesn't print, transliterated from its Devanagari or split out of a compound, is listed (quoted in full, such as `“bhrāntidarśana”`) and flagged for the Research editor.
- An English gloss (`english`, a term's `gloss`) only as the page gives it, in its title or text. With none, leave it out and flag the gap.
- An ASCII spelling equal to the IAST without diacritics passes verify even when the page doesn't print it (NFR-03). Every other spelling must be on the page.

## Verses and works

- A verse is a passage, `work/locator`, owned by the census tickets. A Concept quotes it as `{ passage, translation, meaning }`.
- Text the page labels "Translation" belongs to the passage, as one of its translations. Text labelled "Meaning" is the page's own reading and stays on the Concept's quote as `meaning`.
- Relabelling is listed and flagged: the vikṣepa page heads Yoga Sūtra 1.30 "Bhagavad Gita (Chapter 1, Sutra 30)". A verse whose page names no work ("Chapter 2, Sutra 30") gets the work its text identifies, listed and flagged for the Research editor.
- Devanagari lines as a page gives them. When no page gives them, the list stays empty and is flagged, never filled from elsewhere. A transliteration's scheme is `iast` only when it follows IAST, else `informal`.
- A verse number printed after the verse ("॥ १.३०॥", ".. 1.30..") is left out and listed: the locator holds it.
- A work's title is in IAST (listed and flagged when the pages print only ASCII); its `locatorLabel` is the page's own word for one numbered unit ("Sutra", "Shloka", "Verse"); its language is Sanskrit unless stated (`pi` for Pali).

## Links

- `#` links are dropped and flagged for the Research editor.
- Other links inside running text, DharmaWiki's included, are dropped and listed. A link that belongs to a Reference ("Read more") moves to that Reference's `url` or `doi`.
- A Concept's own DharmaWiki article is kept, in `external`, labelled “DharmaWiki”, with an edit that quotes the label and says where the address came from (the page's link, or its glossary card's). DharmaWiki citation markers ("[1]") are dropped and listed, and text adapted from DharmaWiki is flagged for attribution.
- An address under a WordPress path (`wp-content`, `wp-json`, `wp-admin`), on any site, is left out of the record, listed, and flagged for the Research editor to give a stable link (Sarkar 2019's PDF): the integrity test refuses those paths everywhere.
- A link with no real destination (a homepage area pointing at the dead questionnaire app) gets no target, flagged for the Project owner.

## Structure

- A sub-heading that names a Sanskrit term becomes a term block (`kind: 'term'`) anchored by the term's IAST without diacritics (`samsaya`). Any other sub-heading starts a new section, its id the heading's words, lowercase and hyphenated.
- Text before a page's first heading is a section headed by the page's title, listed (Jagat).
- A heading over a verse ("Shloka from Chapter 1, Sutra 31") is dropped and listed, quoted as the page writes it: the verse shows its work and number.
- Text after a section's last term sub-heading that speaks of all its terms stays in the section, after the term blocks, listed.
- Applications and "Indian vs Western" sections take the roles `applications` and `comparison` (D05).
- Tables are table blocks. The caption is the page's own, else the heading above the table, listed.
- A reference list that names one work twice gives the Concept that id once, in its first place, listed (Know Your Mind's Krishnappa et al., 2020a and 2020b).
- Shared text is stored once: the yama–niyama section is the values topic's introduction, shown with a `topic-intro` block where a page had it.
- No images are carried over (D18); dropping them is listed.
- Interface text isn't content: "Click to learn more", "Read more", "Course Details", "No information available", accordion titles such as "Introduction" and "References". Dropping it is listed once per record.

## Held back

Until the Psychology expert approves documented scoring rules (FR-05), no record interprets a score.

- Score and interpretation sections are held back: score indicators, High, Moderate and Low indicators or characteristics, score-wise category descriptions, scoring continua, cut-offs, answer keys, bands, result messages, average-score lines.
- Each goes in the Questionnaire's `heldBack` as `{ what, where }`, described and never quoted: "three result bands with their messages, in the quiz's settings".
- A Questionnaire's `scoring` is `{ status: 'pending', reason }` until planning tickets 26 and 28 supply rules.
- Text that only says what a questionnaire measures, interpreting no score, may become its `purpose`, flagged for the Psychology expert. With no such text, the record has no `purpose`, and a Psychology-expert flag (planning ticket 26) asks for one in the words every such record uses: “The page says nothing about what its questionnaire measures outside its held-back score section, so no purpose is stored, and none was written. Write one, or approve leaving it out.”
- The held-back guard in the integrity test refuses, in any content field: "Score indicator", "Score-Based Indicators", "Score Wise Category", "Scoring Continuum", "High/Moderate/Low indicators", "High/Moderate/Low Score", "High/Moderate/Low Characteristics", "Score indicators for", "scored on a scale", any sentence saying what a high, moderate or low score means, and any key named for an answer, a correct option, points, weights, bands, cut-offs or results.

## Questionnaires

- Items are verbatim. An oddity in an item, an option or a form is flagged for the Psychology expert, never fixed.
- Items keep the source's order (for the KarmaYoga Scale, its settings' `question_ids`). Each option list is stored once, in the source's order; `reversed` marks an item whose options the source lists in reverse, and says nothing about scoring.
- A description page's coming-later Questionnaire takes its Concept's slug. Its `title` is the name the page gives its questionnaire, else the page title; `sourceTitle` is always the page title as published.

## Drafted text and review status

- `provenance.drafted` names fields written for the new site rather than carried over. Only text the front-end foundation already drafted is drafted: migration tickets draft nothing.
- verify skips drafted fields and lists them. Each one is flagged, and its record's review status is `drafted-not-reviewed`.
- A migrated record is `carried-over-not-reviewed`; `reviewed` is for a person who has checked it.

## Ids, slugs and files

- One record per file, as its default export, named by its id, in its kind's folder under `src/content/data/` (passages in `passages/<work>/<locator>.ts`). `pnpm content:new` lays a new one out and refuses an id that breaks these rules. The registry is generated: after adding or removing a file by hand, run `node scripts/content/registry.mjs`.
- Slugs are lowercase ASCII words joined by hyphens (D02), and never change once published. A Concept's slug is the page's own ASCII spelling of its headword, else its hyphenated English title (settled rule 14); record it, and why, in Comments. The census never names a Concept slug.
- A Reference id is the first author's surname (both surnames for two authors), or a short name of the site or organisation; then the year, when there is one; then a word, only to tell two apart: `tomar-2024`, `jain-diwakar-2019`, `apa-distraction`. An id never changes once used.
- A passage id is `work/locator` (`yoga-sutra/1.30`), its `order` the locator's numbers. A translation's id names the page it came from, by its address slug (`vikshepa`).
- Ids are unique within a kind; anchors (section ids, term ids, table ids) are slugs, unique within their record.

## File ownership

- Create and edit only the files your ticket's Owns list names. A change needed in a file another ticket owns goes in your ticket's Comments instead.
- Reuse the census ids. A batch ticket adds a Reference or passage file only when the census lacks one, and says so in Comments.
- Each ticket adds its own test file: no two lanes edit the same test.

## Who gets which flag

A flag is `{ for, note, ticket? }` in `provenance.flags`: a question for a person, with the planning ticket that decides it.

- `research-editor`: sources, spellings, attributions and wording. Relabelled or unnamed works, transliterated IAST, missing headwords and glosses, Reference fields the pages don't give, wording problems noticed and left as they are.
- `psychology-expert`: anything about a Questionnaire's items, purpose, limitations or scoring.
- `project-owner`: keep, merge or drop, rights, structure, and links with no real destination.
- Where your ticket names the role for a flag, follow your ticket.
- Write each note to stand alone in the flags pack: what the page has, what the record holds, and that nothing was changed or looked up. Identical notes collapse into one line there, so a question another record already asks (a verse's unnamed work, on its passage and on its Concept) is copied from that record word for word.

## What the tests enforce

`pnpm test` runs the integrity rules over every record (`tests/unit/content-integrity.test.ts`). The ones that shape how a record is written:

- ASCII fields hold plain ASCII; IAST fields Latin letters with IAST marks; Devanagari fields Devanagari, dandas and joiners; every character is one the site's fonts cover.
- Every in-text citation, such as "(Tomar, 2024)", resolves to one of the record's References, or a Research-editor flag quotes it.
- Every Reference has a title and a DOI or URL, or `noStableLink` saying why not ("none given on the current site; not looked up"); a paper or book also has authors, a container or publisher, and a year, or a Research-editor flag naming each one missing (FR-03).
- No string holds `wp-json`, `wp-admin`, `wp-content` or `/author/`, and care4mind.org appears only in provenance.
- Content v1 is complete (`tests/unit/content-completeness.test.ts`, on since ticket 12): every topic has a Concept, every Reference is cited by a record, every passage is quoted and every work has one, and the record counts hold. A record added later arrives linked: a Reference with the record citing it, a passage with its quote.

## What verify checks

- It reads the records the generated registry lists, and the saved copy of each source page in their provenance.
- It normalises both sides: NFC, ṁ to ṃ, letter case, curly and straight quotes, dashes, whitespace, and spacing round punctuation.
- Every content string must be on one of the record's pages, with or without its replacements, or quoted in full in one of its edits. An ASCII spelling equal to its term's IAST without diacritics, case, spaces or hyphens passes.
- It skips ids, links between records, URLs and DOIs, kinds and statuses, and the meta fields `provenance`, `heldBack`, `scoring`, `rights` and `noStableLink`; it lists drafted fields as skipped. A Reference's year is checked like its title: the dates it skips are the retrieval dates in provenance.
- A topic's name and order are the design notes' structure, never checked; a topic introduction is checked against its own sources.
- A record with no saved source, such as `navare-pandey-2022` (from research ticket 11), is listed as unchecked, never as passed. A care4mind.org source with no saved copy fails.
- A miss prints the field path, the string, the closest text on its pages, and where the two part ways. Fix it by matching the page's text, or by listing the edit that explains it. Text pinned by the foundation snapshot (`tests/unit/__snapshots__/content-foundation.test.ts.snap`, which replaced the legacy one when site ticket 03 deleted the legacy adapter) changes by an edit only.

## The flags pack

`node scripts/content/report.mjs` prints every flag grouped by role, identical notes collapsed into one line with a count and the records; then the drafted fields, each Questionnaire's held-back items, and a map of every saved page with the records naming it, or "dropped". `--write` saves it as `.scratch/content-v1/flags.md`; only ticket 12 commits that file.
