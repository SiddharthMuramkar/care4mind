# 12: Fidelity sweep and flags pack

Status: ready-for-agent
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

- [ ] **Verify everything:** verify with no arguments exits 0. Its unchecked list holds only records with no saved source, such as `navare-pandey-2022`, each with a Research-editor flag saying where it came from.
- [ ] **Completeness switched on, and passing:**
  - 19 Concepts, each with one primary topic, and every topic with at least one;
  - 18 Questionnaires: the KarmaYoga Scale in preview, and 17 coming later;
  - the number of glossary entries ticket 05 recorded;
  - 3 reading lists, the Methods page, the homepage and 5 topics;
  - every Reference cited by a record, every passage quoted, and every work with a passage;
  - each description-page Concept and its Questionnaire pointing at each other;
  - the glossary entries for Atman, Jiva, Jagat and Chitta Bhumis linking to their Concepts.
- [ ] **Late links set:**
  - the Chitta Bhumis glossary entry links to the Concept made from Know Your Mind;
  - the Dosha Survey's concepts name triguṇa, so its card sits in the temperament topic, flagged for the Project owner as a structure call;
  - every gap a batch ticket noted in its Comments is closed, or flagged when closing it would need new wording.
- [ ] **Slugs checked:** every Concept slug follows D02, and each batch ticket's Comments record the reason.
- [ ] **Census reconciled:**
  - every id in both census files exists, and files a batch ticket added are folded in;
  - each page's reference list in the census matches its Concept's;
  - no two References are the same work under two ids; merge any found, keeping the older id.
- [ ] **Nothing silently lost:** for every saved page with records, each heading in its extract outline is in a record, in a Questionnaire's `heldBack`, or listed as dropped in provenance. Every saved page without records is one the spec drops (the eight in its keep-merge-drop table).
- [ ] **Held back stays out:** the guard passes on the full content, and the KarmaYoga Scale and the Dosha Survey hold no key, band or message.
- [ ] **Derivations on the real content:**
  - `routes()` lists every page in design B2 with the slugs the content has: the 19 Concepts, the 5 topics, the Texts index and every work, the Questionnaires index, the KarmaYoga intro and its flow (with its flag on), the Library home and its five pages, Search, the Concept map and `/proposals/` (with their flags on), and one sample per kind;
  - `azIndex()` merges the Atman, Jiva, Jagat and Chitta Bhumis entries into their Concepts and lists every other glossary entry once;
  - `searchDocuments()` covers every kind; record the total and the count per kind in Comments (design A4 estimated about 330);
  - `graph()` has no edge through Tomar (2024).
- [ ] **Design facts closed,** each present as a flag or a listed edit:
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
- [ ] **Flags pack** (`.scratch/content-v1/flags.md`, written by `report --write`):
  - grouped by role, with identical notes collapsed into one line with a count;
  - the drafted fields, and each Questionnaire's held-back items;
  - the page map of all 39 saved pages and posts, linking the spec's keep-merge-drop table for the reasons.
- [ ] **Ticket test** (`tests/unit/content-sweep.test.ts`): the derivation results above, on the real content.
- [ ] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs` with no arguments. No Playwright run in the lane; the merger runs the full suite on the integration branch.

## Comments
