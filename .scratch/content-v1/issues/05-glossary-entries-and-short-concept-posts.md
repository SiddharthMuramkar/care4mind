# 05: Glossary entries and the short Concept posts

Status: resolved
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

- [x] **Card count, confirmed:** extract the page and record the count in Comments. The saved copy has 82 cards, not the 83 in the design notes and D14: one of its 83 DharmaWiki links is an inline "Vedic" red link inside an Anavrtti description.
- [x] **Merges** (82 cards become 78 entries, unless the count above differs):
  - Anavrtti appears twice, with two descriptions: one entry, one description kept, and the other listed and flagged for the Research editor;
  - Brhadaranyaka Upanishad and Brihadaranyaka Upanishad (whose description says it is another spelling): one entry, with the second spelling and its Devanagari listed;
  - Pravrtti and Nivrtti appears twice: one entry, taking the description "Pravṛtti is worldly action; Nivṛtti is renunciation." from one copy and the link to the Pravrtti and Nivrtti article from the other. The first copy carries Nishkama Karma's description; the second links to the Purusha article. Flagged for the Research editor;
  - Upanishads appears twice, with the same description: one entry.
- [x] **Wrong description:** Navavidha Bhakti's description ("An Upanishad emphasizing renunciation and self-knowledge.") belongs to another entry. It is left out, listed and flagged for the Research editor; the entry keeps its name and link.
- [x] **Each entry:**
  - slug from its ASCII name (D02), ASCII name, and Devanagari as the card gives it;
  - "पुरुषार्थ:" fixed to "पुरुषार्थः" (an ASCII colon typed for the visarga), listed and flagged; unclosed brackets dropped; "छान्दोग्योपनिषतद्" flagged, not fixed;
  - the DharmaWiki URL exactly as the card links it;
  - the description without "Click to learn more";
  - the inline "Vedic" red link dropped and listed.
- [x] **Empty letters:** the 11 "No information available" notes (D, E, F, H, L, O, Q, W, X, Y and Z) make no entries, and are noted in Comments.
- [x] **Attribution:** every entry carries the same Project-owner flag, saying its description may be adapted from DharmaWiki. The report collapses them into one line.
- [x] **Anubandha Chatushtaya:** the 19-word post merges into its entry. The post's sentence joins the card's description, both pages are in provenance, and it is flagged for attribution.
- [x] **Concept links:** the Atman, Jiva and Jagat entries link to their Concepts. The Chitta Bhumis entry's link to the Concept made from Know Your Mind waits for ticket 12; note it in Comments.
- [x] **The three Concepts** (primary topic `self`, no Questionnaire):
  - headword from the page's own text ("Atman (Samskrit: आत्मा)", "Jiva (Samskrit: जीवः)", "जगत || jagat"); IAST the page doesn't print is transliterated from its Devanagari, listed and flagged for the Research editor;
  - bilingual headings kept as written ("परिचयः ॥ Introduction");
  - DharmaWiki citation markers ("[1]", "[2]") and inline DharmaWiki links dropped and listed; each Concept's own DharmaWiki article kept as an external link;
  - Atman and Jiva flagged for attribution (DharmaWiki);
  - Jiva ends mid-citation with a lone "[": it is dropped and listed, and the truncation is flagged for the Research editor, never completed;
  - the chosen slugs and why recorded in Comments.
- [x] **Ticket test** (`tests/unit/content-glossary.test.ts`): the entry count recorded above; no description contains "Click to learn more" or "No information available"; every entry's URL is on dharmawiki.org; the three Concepts have the primary topic `self`.
- [x] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs glossary` plus `concept/<slug>` for each of the three Concepts. No Playwright run: pages don't change.

## Comments

- **Built (2026-10-28).** 78 glossary entries in `src/content/data/glossary/`, the Concepts `atman`, `jiva` and `jagat` (primary topic `self`, no Questionnaire), and `tests/unit/content-glossary.test.ts` (14 tests, through the content source and `@/content`). verify passes on all 81 records; `verify.mjs glossary concept` checks 82, vikṣepa included, all passed. No page changes: the pages still read the legacy adapter.
- **Counts.** extract confirms 82 cards and 83 DharmaWiki links; the extra link is the inline "Vedic" red link in the first Anavrtti card. Four merges leave 78 entries, the number `content-completeness.test.ts` already holds. The 11 "No information available at this time." notes (D, E, F, H, L, O, Q, W, X, Y and Z) make no entries. They, the page's image, its "Categories" heading and its letter tabs are listed as dropped on every entry, so ticket 12's heading sweep finds them. 3 entries link to a Concept; the other 75 link only to DharmaWiki.
- **Slugs.** The Concepts take the pages' own ASCII spellings of their headwords (D02, settled rule 14): "Atman", "Jiva", "jagat". Each glossary entry takes its card's ASCII name, lowercased and hyphenated. A merged entry takes the first card's slug, so Brihadaranyaka joins `brhadaranyaka-upanishad`, the spelling its own description points to. `taittriya-upanishad` follows the card's spelling (flagged).
- **Decisions the ticket left open:**
  - Anavrtti keeps "The state of non-return, often referring to liberation (Moksha) in Vedanta.": that card sits in its alphabetical place and reads like the other cards. The other card, out of place and carrying the "Vedic" red link, loses its description as a listed deletion, flagged.
  - Pravrtti and Nivrtti takes the first card's Devanagari and link, which match the article it names, and the second card's description. The second card's Devanagari and its Purusha link are listed as dropped.
  - Upanishads keeps the first card's Devanagari (उपनिषदः) and link. The second card's (उपनिषद्, with a link to another article) are listed and flagged, since the page doesn't say which is right.
  - Anubandha Chatushtaya's description is the card's, then the post's sentence, quoted whole in an edit so verify accepts the join. Both pages are its sources. The post's two "(Read more…)" links, to the same article, are dropped as interface text.
  - In the Concepts, text before the first heading (all of Jagat) is a section headed by the page's title, listed, since no wording may be drafted. Each summary is the page's first sentence (two for Jagat). Atman's bilingual headings are first lines of paragraphs on the page; they are now section headings, kept as written, and its eight line-broken statements are a list (both listed).
  - Atman's IAST "ātman" is transliterated from the page's own "आत्मन्", the form its spelling "Atman" follows. Its Devanagari is the headword's "आत्मा". Both are listed and flagged. Jiva's "jīva" and Jagat's "jagat" are printed on the pages. Glosses come only from the pages: "Soul or Self", "living being", "Cosmos".
  - External links are labelled "DharmaWiki" (quoted in an edit) and use the address each glossary card links: the Atman and Jagat posts have no links, and Jiva's citation markers link into the same article. The Concepts' sources stay their own posts only, so a redirect built from provenance can't send `/concepts/` to a Concept.
  - DharmaWiki flags: the glossary's single Project-owner note, as asked (78 records, one line in the report). Atman and Jiva carry two: how to credit DharmaWiki, for the Research editor (planning ticket 17), and whether the text may be used, for the Project owner. Flags on Sanskrit forms name planning ticket 15.
- **Flags raised.**
  - Project owner: the glossary descriptions may be adapted from DharmaWiki (one note, 78 entries); so may Atman's and Jiva's text (one note, 2 Concepts).
  - Research editor: Anavrtti's two descriptions; the Pravrtti and Nivrtti merge; Upanishads' two Devanagari forms and links; Navavidha Bhakti's borrowed description, left out; Purushartha's visarga fix; "छान्दोग्योपनिषतद्", not fixed; the spelling "Taittriya"; the Anubandha sentence's attribution; Atman's transliterated IAST, its attribution, and "Paramatama" and "वाक्यन्वयत" left as written; Jiva's attribution and its truncation; Jagat's "जगत" without the virāma of the card's "जगत्".
  - Typos fixed and listed, in Atman: "ominipotent", "onmipresent".
- **Left for ticket 12:**
  - The Chitta Bhumis entry's link to the Concept made from Know Your Mind (ticket 08).
  - The census files didn't exist when this lane ran. These pages cite no Reference and quote no verse, so no census id was needed or added.
  - Two recurring cases the standard has no rule for, settled here as above: text before a page's first heading, and an external link's label. Ticket 12 owns the standard if they should be written down.
