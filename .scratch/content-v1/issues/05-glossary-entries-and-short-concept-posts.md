# 05: Glossary entries and the short Concept posts

Status: ready-for-agent
Blocked by: 02
Spec: [Content v1: the current site's content as typed records](../spec.md) · Decisions: D02, D03, D07, D14

**What to build:** the `/concepts/` glossary becomes clean glossary entries, and the three short posts become Concepts.

- Each glossary card becomes one entry with its DharmaWiki link. Duplicates are merged, and descriptions that belong to another entry are caught and flagged, so a visitor never sees one term with another term's definition.
- Atman, Jiva and Jagat become Concepts in the "self" topic, with their DharmaWiki debts flagged for attribution.

## Owns

- `src/content/data/glossary/**`
- `src/content/data/concepts/`: the three Concept files for `/atman/`, `/jiva/` and `/jagat/`, named by their D02 slugs (the pages write "Atman", "Jiva" and "Jagat")
- `tests/unit/content-glossary.test.ts` (new)

## Acceptance criteria

- [ ] **Card count, confirmed:** extract the page and record the count in Comments. The saved copy has 82 cards, not the 83 in the design notes and D14: one of its 83 DharmaWiki links is an inline "Vedic" red link inside an Anavrtti description.
- [ ] **Merges** (82 cards become 78 entries, unless the count above differs):
  - Anavrtti appears twice, with two descriptions: one entry, one description kept, and the other listed and flagged for the Research editor;
  - Brhadaranyaka Upanishad and Brihadaranyaka Upanishad (whose description says it is another spelling): one entry, with the second spelling and its Devanagari listed;
  - Pravrtti and Nivrtti appears twice: one entry, taking the description "Pravṛtti is worldly action; Nivṛtti is renunciation." from one copy and the link to the Pravrtti and Nivrtti article from the other. The first copy carries Nishkama Karma's description; the second links to the Purusha article. Flagged for the Research editor;
  - Upanishads appears twice, with the same description: one entry.
- [ ] **Wrong description:** Navavidha Bhakti's description ("An Upanishad emphasizing renunciation and self-knowledge.") belongs to another entry. It is left out, listed and flagged for the Research editor; the entry keeps its name and link.
- [ ] **Each entry:**
  - slug from its ASCII name (D02), ASCII name, and Devanagari as the card gives it;
  - "पुरुषार्थ:" fixed to "पुरुषार्थः" (an ASCII colon typed for the visarga), listed and flagged; unclosed brackets dropped; "छान्दोग्योपनिषतद्" flagged, not fixed;
  - the DharmaWiki URL exactly as the card links it;
  - the description without "Click to learn more";
  - the inline "Vedic" red link dropped and listed.
- [ ] **Empty letters:** the 11 "No information available" notes (D, E, F, H, L, O, Q, W, X, Y and Z) make no entries, and are noted in Comments.
- [ ] **Attribution:** every entry carries the same Project-owner flag, saying its description may be adapted from DharmaWiki. The report collapses them into one line.
- [ ] **Anubandha Chatushtaya:** the 19-word post merges into its entry. The post's sentence joins the card's description, both pages are in provenance, and it is flagged for attribution.
- [ ] **Concept links:** the Atman, Jiva and Jagat entries link to their Concepts. The Chitta Bhumis entry's link to the Concept made from Know Your Mind waits for ticket 12; note it in Comments.
- [ ] **The three Concepts** (primary topic `self`, no Questionnaire):
  - headword from the page's own text ("Atman (Samskrit: आत्मा)", "Jiva (Samskrit: जीवः)", "जगत || jagat"); IAST the page doesn't print is transliterated from its Devanagari, listed and flagged for the Research editor;
  - bilingual headings kept as written ("परिचयः ॥ Introduction");
  - DharmaWiki citation markers ("[1]", "[2]") and inline DharmaWiki links dropped and listed; each Concept's own DharmaWiki article kept as an external link;
  - Atman and Jiva flagged for attribution (DharmaWiki);
  - Jiva ends mid-citation with a lone "[": it is dropped and listed, and the truncation is flagged for the Research editor, never completed;
  - the chosen slugs and why recorded in Comments.
- [ ] **Ticket test** (`tests/unit/content-glossary.test.ts`): the entry count recorded above; no description contains "Click to learn more" or "No information available"; every entry's URL is on dharmawiki.org; the three Concepts have the primary topic `self`.
- [ ] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs glossary` plus `concept/<slug>` for each of the three Concepts. No Playwright run: pages don't change.

## Comments
