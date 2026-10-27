# 12: Fidelity sweep and flags pack

Status: resolved
Blocked by: 05, 06, 07, 08, 09, 10, 11, 13
Spec: [Content v1: the current site's content as typed records](../spec.md) · Decisions: D01–D20

**What to build:** the proof that content v1 is complete and faithful, and the pack that the people who must decide will read.

- Every record passes verify, and the completeness checks are switched on and pass.
- The links that had to wait are set, the census gaps are closed, and every saved page is accounted for, heading by heading.
- The derivations give real answers on the real content.
- The flags pack gathers every question for the Research editor, the Psychology expert and the Project owner, with a page map they can approve. It feeds the sign-off pack (planning ticket 29).

## Owns

- any file in `src/content/data/`, for sweep fixes only: edits, flags, the late links and census gaps, never new wording
- `tests/unit/content-completeness.test.ts`, to switch its checks on
- `tests/unit/content-sweep.test.ts` (new)
- `.scratch/content-v1/census/references.md` and `passages.md`, to reconcile them
- `.scratch/content-v1/flags.md` (new, written by report)
- `docs/agents/content-migration.md`, for rules the sweep found missing

## Acceptance criteria

- [x] **Verify everything:** verify with no arguments exits 0. Its unchecked list holds only records with no saved source, such as `navare-pandey-2022`, each with a Research-editor flag saying where it came from.
- [x] **Completeness switched on, and passing:**
  - 19 Concepts, each with one primary topic, and every topic with at least one;
  - 18 Questionnaires: the KarmaYoga Scale in preview, and 17 coming later;
  - the number of glossary entries ticket 05 recorded;
  - 3 reading lists, the Methods page, the homepage and 5 topics;
  - every Reference cited by a record, every passage quoted, and every work with a passage;
  - each description-page Concept and its Questionnaire pointing at each other;
  - the glossary entries for Atman, Jiva, Jagat and Chitta Bhumis linking to their Concepts.
- [x] **Late links set:**
  - the Chitta Bhumis glossary entry links to the Concept made from Know Your Mind;
  - the Dosha Survey's concepts name triguṇa, so its card sits in the temperament topic, flagged for the Project owner as a structure call;
  - every gap a batch ticket noted in its Comments is closed, or flagged when closing it would need new wording.
- [x] **Slugs checked:** every Concept slug follows D02, and each batch ticket's Comments record the reason.
- [x] **Census reconciled:**
  - every id in both census files exists, and files a batch ticket added are folded in;
  - each page's reference list in the census matches its Concept's;
  - no two References are the same work under two ids; merge any found, keeping the older id.
- [x] **Nothing silently lost:** for every saved page with records, each heading in its extract outline is in a record, in a Questionnaire's `heldBack`, or listed as dropped in provenance. Every saved page without records is one the spec drops (the eight in its keep-merge-drop table).
- [x] **Held back stays out:** the guard passes on the full content, and the KarmaYoga Scale and the Dosha Survey hold no key, band or message.
- [x] **Derivations on the real content:**
  - `routes()` lists every page in design B2 with the slugs the content has: the 19 Concepts, the 5 topics, the Texts index and every work, the Questionnaires index, the KarmaYoga intro and its flow (with its flag on), the Library home and its five pages, Search, the Concept map and `/proposals/` (with their flags on), and one sample per kind;
  - `azIndex()` merges the Atman, Jiva, Jagat and Chitta Bhumis entries into their Concepts and lists every other glossary entry once;
  - `searchDocuments()` covers every kind; record the total and the count per kind in Comments (design A4 estimated about 330);
  - `graph()` has no edge through Tomar (2024).
- [x] **Design facts closed,** each present as a flag or a listed edit:
  - vikṣepa's "Bhagavad Gita" relabel, and the heading and summary wording verify found in the re-homed records;
  - every verse whose work the page didn't name;
  - Atman and Jiva's attribution, and Jiva's truncation;
  - the KarmaYoga order difference, ids 34–42 reversed, and "permission needed";
  - the Dosha Survey's anti-spam field and its unknown author;
  - the glossary merges, Navavidha Bhakti's description and the "Vedic" red link;
  - Tomar (2024)'s permission question;
  - no published source for Sthitaprajña, Five Steps of Perfection or the Dosha Survey;
  - KIIT's link, the `#` links and the retailer links;
  - saṃvega for Momentum of Spiritual Practice;
  - the yama–niyama copy choice;
  - Triguna's shortcode and test message;
  - the homepage areas without a real target.
- [x] **Flags pack** (`.scratch/content-v1/flags.md`, written by `report --write`):
  - grouped by role, with identical notes collapsed into one line with a count;
  - the drafted fields, and each Questionnaire's held-back items;
  - the page map of all 39 saved pages and posts, linking the spec's keep-merge-drop table for the reasons.
- [x] **Ticket test** (`tests/unit/content-sweep.test.ts`): the derivation results above, on the real content.
- [x] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs` with no arguments. No Playwright run in the lane; the merger runs the full suite on the integration branch.

## Comments

- **Built (2026-10-28).** The ten completeness checks are on (`tests/unit/content-completeness.test.ts`), with the two late links they need: the Chitta Bhumis glossary entry links `chittabhumi`, and the Dosha Survey's `concepts` name `triguna`, which puts its card in the temperament topic. `tests/unit/content-sweep.test.ts` (48 tests, through `createContent(localSource, flags)` and the content source) checks the derivations, the late links, the design facts, the D02 slugs, the purpose question and the records verify can't check; a mutation run (a dropped link, a removed glossary entry, two altered flags) failed the tests it should. 534 unit tests pass. The census files are reconciled, the standard has the rules the sweep found missing, and `report --write` wrote the flags pack.
- **Verify, with no arguments:** 362 records · 357 passed · 1 unchecked (`navare-pandey-2022`, flagged as taken from the Published scales research) · 4 topics structure only · 0 failed. Drafted fields, listed and skipped: vikṣepa's summary; the KarmaYoga Scale's summary, purpose, format and limitations.
- **Nothing silently lost.** A scratch check (kept outside the repo) read the 426 headings, accordion tabs and quiz parts in the outlines of the 31 saved pages with records. Each is in a record, described in a Questionnaire's `heldBack`, or quoted in a listed edit, except two found unlisted and now listed: vikṣepa's verse heading “Shloka from Vedanta Sara (5.211)” and the eight headings of the homepage's left-out cards. Held-back sub-headings (“Score Wise Category Description (High)” and the like) are described by name and level, never quoted. A second check found each of the 412 links on those pages kept or listed, apart from those inside held-back text. The 8 pages without records are the spec's 8 drops.
- **Derivations on the real content:** 45 routes with every flag on and 42 with every flag off, one sample for each of 16 kinds. A–Z: 139 entries (19 Concepts, 46 terms, 74 glossary entries; Atman, Jiva, Jagat and Chitta Bhumis merged into their Concepts). Search documents: 448, against design A4's estimate of about 330: 19 Concepts, 46 terms, 78 glossary entries, 6 works, 43 passages, 188 References, 41 library items, 18 Questionnaires, 5 topics and 4 pages. Concept map: 19 nodes and 85 edges (19 shared passage, 62 shared work, 4 rarely cited Reference), none through Tomar (2024).
- **Slugs (D02):** all 19 are the pages' own ASCII spellings of their headwords, or the English titles of the three pages without one, and each batch ticket's Comments give the reason (01: `vikshepa`; 05: `atman`, `jiva`, `jagat`; 08: `upa-vikshepa`, `panch-klesha`, `chittabhumi`, `sthitaprajna`; 09: `five-steps-of-perfection`, `momentum-of-spiritual-practice`, `spiritual-practitioner`, `brahma-vihara`; 10: `ahimsa`, `satya`, `asteya`, `brahmacharya`; 11: `atma-bandhu`, `karta`, `triguna`). `chittabhumi` is the singular of the page's only form, "chittabhumis" (settled rule 14).
- **Census:** every id in both files exists (188 References, 43 passages, 6 works) and every record is in them; no batch added one. Each page's reference list and verses match its Concept's, and no two References are one work (checked by DOI, URL, title and author and year: nothing to merge). Notes added on where Karta's and Triguna's Concepts place their verses.
- **Decisions the spec left open,** flags and edits only, no record text changed:
  - The question tickets 09 and 11 asked six Questionnaires with no purpose now sits, word for word, on the nine others with none (vikṣepa, upa-vikṣepa, pañca kleśa, citta-bhūmi, sthitaprajña and the four values), so the pack asks it once for 15.
  - The homepage's "Dosha" card describes the survey. It stays out with its section, and its sentence is quoted in a Psychology-expert flag as a candidate purpose rather than carried over by a sweep.
  - The standard gains the calls the batch tickets made for recurring cases: text before the first heading, verse headings, closing text after term blocks, a reference listed twice, emoji, a lone quote in an edit, the external link's label, WordPress paths on other sites, the purpose question and shared flag wording. Its step 3 now asks for each heading by name.
- **Flags raised:** Project owner: the Dosha Survey's place in the temperament topic (ticket 13). Psychology expert: the purpose question on nine Questionnaires, and the Dosha Survey's purpose, quoting the homepage card (ticket 26). Edits listed: vikṣepa's verse headings, the homepage's card headings, and the DharmaWiki link dropped from Yoga Sūtra 1.33's translation (ticket 09's note). The pack holds 353 flags in 173 lines: Research editor 225 (147 lines), Psychology expert 27 (13), Project owner 101 (13).
- **Left over,** each in a file this ticket doesn't own:
  - `src/content/graph.ts` reads only innermost parentheses, so Ahimsa's “(“EPRA International Journal of Multidisciplinary Research (IJMR),” 2019b)” isn't read as a citation and won't link to `epra-2019` (ticket 10).
  - The A–Z and search derivations read a Concept's own terms only, so Yama and Niyama, term blocks in the values introduction, are in neither (ticket 10).
  - For front-end-site ticket 05: a values Concept's first section and the introduction's section share an id and heading; draw the introduction in that section's place (ticket 10).
  - `src/content/schema/questionnaire.ts` has no form-level description, so the KarmaYoga quiz's description line stays out, flagged (ticket 06).
  - `tests/unit/content-integrity.test.ts` refuses WordPress paths on any site, which keeps Sarkar (2019)'s only link out (flagged); narrowing it to care4mind.org is ticket 01's call (ticket 03).
  - Whole-content tests can pass Vitest's 5-second limit on a busy machine. This ticket's tests load the content once, in a `beforeAll` with 60 s; a global `testTimeout` in `vitest.config.ts` would cover the rest (ticket 09).
  - For front-end-site ticket 12: shared works make 62 of the map's 85 edges, the Yoga Sūtra and the Bhagavad Gītā joining most Concepts, so the map may want to lead with shared passages and rare References.
