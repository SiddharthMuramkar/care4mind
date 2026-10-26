# Search and Sanskrit spellings on Neon Postgres

Type: research
Mode: AFK
Track: site
Status: open
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
