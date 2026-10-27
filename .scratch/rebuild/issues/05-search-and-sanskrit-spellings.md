# Search and Sanskrit spellings on Neon Postgres

Type: research
Mode: AFK
Track: site
Status: resolved
Blocked by: none
Map: [Care4Mind.org rebuild](../map.md)

## Question

How can the site store each form of a Sanskrit term, and find content by any of them, on Neon Postgres?

**Transliteration**

- Libraries that convert IAST to Devanagari and to plain-ASCII spellings, such as Sanscript / indic-transliteration (JavaScript or Python) and Aksharamukha.
- The common informal ASCII conventions: ś or ṣ to sh, c to ch, ā to aa, ṛ to ri.
- Where automatic conversion goes wrong: dropped final vowels, Hindi or Pali forms such as "Panch Klesha" and "Brahma Vihara", and compounds.
- Unicode pitfalls: composed versus decomposed characters (NFC and NFD), and ṃ versus ṁ.

**Search options**, compared against FR-04 and NFR-03:

- Postgres full-text search with `unaccent`, `pg_trgm` and synonym dictionaries, and which of these Neon supports
- Neon's own search features, such as BM25 ranking, if it offers them
- a prebuilt static index such as Pagefind
- hosted search: Algolia, Typesense Cloud or Meilisearch Cloud

For each option, record:

- whether it matches without diacritics, and treats stored variants as equals
- Devanagari input and typo tolerance
- field weighting
- how the index updates after an edit
- speed when called from Vercel functions
- cost, and what it adds to running the site

Nobody decides here. The decisions are made in three tickets:

- storage rules in [Sanskrit terms: storage and display](15-sanskrit-terms.md)
- search behaviour in [What search finds](18-what-search-finds.md)
- the technology in the [Architecture review](23-architecture-review.md)

## Answer

Researched 2026-10-26. Full findings: [`search-and-sanskrit-spellings.md`](https://github.com/SiddharthMuramkar/care4mind/blob/research/search-and-sanskrit-spellings/.scratch/rebuild/research/search-and-sanskrit-spellings.md) on branch `research/search-and-sanskrit-spellings` (pushed, never merged; commit `5238cb7`).

- IAST converts automatically to Devanagari and to unaccented ASCII, but site spellings like Panch, Vikaar, Teertha yatra and spaced Brahma Vihara must be stored by hand, as NFR-03 expects.
- Sanscript (JS) and indic-transliteration (Python) are MIT and share letter maps; Aksharamukha is AGPL-3.0. Store text as NFC. ṃ and ṁ are different characters, and Sanscript's `iast` scheme turns ṁ into a Vedic sign, so normalise ṁ to ṃ first.
- Neon supports `unaccent` and `pg_trgm` on Postgres 14–18, but not custom synonym files. Indexing every stored variant meets FR-04 and NFR-03 without synonyms.
- Neon's BM25 option is `lakebase_text` (GA June 2026, Postgres 16+); `pg_search` was retired 21 Sep 2026. Neither adds typo tolerance; `pg_trgm` gives fuzzy matching.
- Built-in typo tolerance: only Algolia (free with logo), Typesense (~$22/month) and Meilisearch (~$20/month), each a vendor account to hand over. Pagefind matches word prefixes only, needs a rebuild after each edit, and strips Devanagari vowel signs by default.

**Verified:** 17 claims rechecked, 5 corrected, none changing the comparison. The most important is the Sanscript ṁ mapping above.

**Gaps** (all listed in the findings): Nothing was run. Untested: whether Postgres on Neon treats Devanagari as letters, and how `pg_trgm` handles Devanagari vowel signs; a short test on a Neon branch settles both. The IAST forms used are illustrative and need the Research editor ([Sanskrit terms: storage and display](15-sanskrit-terms.md)). Hosted costs depend on search volume.
