# Search and Sanskrit spellings on Neon Postgres: research findings

Ticket: [Search and Sanskrit spellings on Neon Postgres](../issues/05-search-and-sanskrit-spellings.md) · Researched 2026-10-26 · Branch: research/search-and-sanskrit-spellings

## Summary

- **Conversion only works one way.** IAST (the standard way of writing Sanskrit in Latin letters with dots and bars, e.g. vikṣepa) can be converted to Devanagari (विक्षेप) and to "IAST without diacritics" (viksepa) automatically. Plain-ASCII spellings can't be turned back into IAST, because ś, ṣ and s all become "s". Many spellings the current site uses can't be generated from IAST at all: "Panch", "Vikaar", "Teertha yatra", and the spaced "Brahma Vihara". Those have to be collected and stored by hand, as NFR-03 already expects.
- **Transliteration libraries.** Sanscript (JavaScript, MIT licence, 1.3.3) and indic-transliteration (Python, MIT, 2.3.82) share one set of letter maps. Both convert IAST to Devanagari and back. The Python one also has a "lay Indian search terms" helper (kṛṣṇa → krishna). Aksharamukha adds "readable" and "colloquial" romanisations and Hindi-style final-vowel dropping, but it is licensed AGPL-3.0 and is a Python library.
- **Unicode traps.** The same letter can be stored two ways: precomposed (one code point, "NFC") or decomposed (letter plus accent, "NFD"). The site should store and search one form; NFC is the usual choice. ṃ and ṁ are different characters, and normalisation doesn't merge them. Sanscript reads ṁ as candrabindu (ँ), not anusvāra (ं).
- **Plain Postgres search on Neon covers most of FR-04.** Neon supports `unaccent` and `pg_trgm` on every Postgres version it offers. unaccent's stock rules already turn every IAST letter into its plain letter. Neon users can't add synonym files or edit unaccent's rules, but NFR-03 stores each variant as data, so search can index all of them and no synonym dictionary is needed.
- **Neon's own BM25 ranking.** BM25 is a better relevance formula than Postgres's built-in ranking. On Neon it now comes from `lakebase_text`, generally available since 26 June 2026 at version 0.1.3, on Postgres 16 and later. The older `pg_search` extension was retired on 21 September 2026. `lakebase_tokenizer` adds accent stripping and synonym lists kept in ordinary tables. Neither extension adds typo tolerance.
- **Typo tolerance** means matching words that are misspelled by a letter or two. Only the hosted engines (Algolia, Typesense, Meilisearch) have it built in, at up to 2 typos per word. On Postgres, `pg_trgm` gives similar fuzzy matching. Pagefind matches only the start of a word (prefix matching).
- **Devanagari typed into the search box behaves very differently by option.** Postgres's word splitter keeps Devanagari words whole. Pagefind's default accent folding strips Devanagari vowel signs, so for matching, words are reduced to their consonants. Meilisearch leaves Devanagari marks alone. Typesense needs a field marked as Hindi. Algolia's documentation doesn't say. This comes from reading docs and source code; nothing was run. A short test on a Neon branch is the cheapest way to confirm the Postgres side.
- **Cost and running.** The Postgres options add nothing beyond Neon compute the site already pays for. Pagefind is free, but every edit needs a rebuild and redeploy before search sees it. A hosted engine adds a vendor account that has to be handed over to the client:
  - Algolia is free up to 10,000 searches a month, but its logo must be shown.
  - Typesense Cloud starts at about $21.60 a month.
  - Meilisearch Cloud starts at $20 a month.

## Findings

Every source cited here was read on 2026-10-26. Where a finding comes from reading source code rather than documentation or running the software, it says so. No library, database or search engine was run for this ticket, and no Neon or Vercel resource was touched.

### Storing each form of a Sanskrit term

NFR-03 asks for up to three kinds of form for each Concept's Sanskrit term:

- the IAST form, the scholarly spelling with diacritics, e.g. vikṣepa
- the Devanagari form, in the script Sanskrit is usually printed in, e.g. विक्षेप
- every plain-ASCII spelling (ASCII is the basic unaccented English character set), e.g. viksepa and vikshepa

What the sources say about storing them in Postgres:

- **Which forms can be generated.** IAST and Devanagari convert both ways without loss. Sanscript's README calls a scheme "lossy" when it "does not have the letters needed to support lossless translation", and plain ASCII is such a scheme ([sanscript.js README](https://github.com/indic-transliteration/sanscript.js)). So the IAST form is the one other forms can be generated from, never the reverse. Hand-entered ASCII spellings still have to be stored as data (see "Where automatic conversion goes wrong").
- **Generated columns only see their own row.** A generated column is a database column whose value Postgres computes from other columns. Postgres says the generation expression "can only use immutable functions and cannot use subqueries or reference anything other than the current row in any way" ([PostgreSQL 18: Generated Columns](https://www.postgresql.org/docs/current/ddl-generated-columns.html)). If the variant spellings live in the Concept's own row, for example as a text array, a generated search column can include them. If they live in a separate table, one row per spelling, the search column has to be kept up to date another way, such as a trigger or a separate search table. A separate table allows a uniqueness check across all spellings, which would catch two Concepts claiming the same spelling.
- **`unaccent()` can't go directly into a generated column.** Indexing it needs an `IMMUTABLE` wrapper function, which Neon documents ([Neon: unaccent](https://neon.com/docs/extensions/unaccent)). `to_tsvector` with an explicit configuration name is allowed in indexes and generated columns, even when that configuration includes unaccent ([PostgreSQL 18: Tables and Indexes](https://www.postgresql.org/docs/current/textsearch-tables.html)).
- **Normalise text when it is saved.** Postgres has a built-in `normalize(text, NFC)` function and an `IS NFC NORMALIZED` test on UTF-8 databases ([PostgreSQL 18: String Functions](https://www.postgresql.org/docs/current/functions-string.html)). Neon databases are UTF-8 with the `C.UTF-8` collation by default ([Neon: Postgres compatibility](https://neon.com/docs/reference/compatibility)). See "Unicode pitfalls" below for why this matters.

### Transliteration

Transliteration means rewriting text from one writing system into another letter by letter, such as Devanagari into Latin letters.

#### Libraries

| Library | Language | Latest release (registry) | Licence | What it covers |
| --- | --- | --- | --- | --- |
| [@indic-transliteration/sanscript](https://www.npmjs.com/package/@indic-transliteration/sanscript) (Sanscript.js) | JavaScript, runs in the browser or on the server | 1.3.3, published 8 Jun 2025 | MIT | IAST, ISO 15919, Harvard-Kyoto, ITRANS, SLP1, Velthuis, WX, Kolkata, and dozens of Brahmic and other scripts including Devanagari |
| [indic-transliteration](https://pypi.org/project/indic-transliteration/) (Python port, `indic_transliteration`) | Python | 2.3.82, uploaded 6 Apr 2026 | MIT | Same schemes, plus OPTITRANS, a "lay Indian" ASCII helper and a fix for "lazy" anusvāra |
| [aksharamukha](https://pypi.org/project/aksharamukha/) | Python | 2.3 (PyPI upload 14 Oct 2024; repository last pushed 30 Aug 2026) | AGPL-3.0 | Many scripts, plus "Roman (Readable)" and "Roman (Colloquial)" outputs and Hindi schwa removal |
| [aksharamukha on npm](https://www.npmjs.com/package/aksharamukha) | JavaScript wrapper | 2.3.0-32, published 25 May 2026 | GPL-3.0-only | Published from a third-party repository, not the Aksharamukha project's own; described as "Aksharamukha in your browser!" |

Release dates and licences come from the [npm registry](https://registry.npmjs.org/@indic-transliteration/sanscript), the [PyPI JSON API](https://pypi.org/pypi/indic-transliteration/json) and the [Aksharamukha PyPI entry](https://pypi.org/pypi/aksharamukha/json). The Aksharamukha repository's licence (AGPL-3.0) comes from the [GitHub API](https://api.github.com/repos/virtualvinodh/aksharamukha-python) and its [setup.py](https://github.com/virtualvinodh/aksharamukha-python/blob/main/setup.py). The repository also ships a `gpl-3.0.txt` file.

What each one does that matters here:

- **Sanscript.js.** The call is `Sanscript.t(input, from, to, options)`. Its letter maps are built from the shared `common_maps` TOML files when the package is built ([sanscript.js API reference via context7](https://github.com/indic-transliteration/sanscript.js/blob/master/_autodocs/api-reference/sanscript.md)). It has three options ([README](https://github.com/indic-transliteration/sanscript.js)):
  - `syncope` gives Hindi-style reading of Latin-letter input, so `ajay` becomes अजय.
  - `preferred_alternates` picks variant outputs, such as `aa` instead of `A` in ITRANS.
  - `skip_sgml` decides whether text inside HTML/SGML tags is transliterated too.
- **indic-transliteration (Python).** Its README has a section titled "Lay Indian search terms" with examples: `to_lay_indian("kRShNa") == "krishna"` and `to_lay_indian("taM jitvA") == "tam jitva"` ([README](https://github.com/indic-transliteration/indic_transliteration_py)). The source shows the rules it applies to OPTITRANS text: `R`→`ri`, `x`→`ksh`, `jn`→`GY` by default, then everything lowercased ([roman.py](https://github.com/indic-transliteration/indic_transliteration_py/blob/master/indic_transliteration/sanscript/schemes/roman.py)). OPTITRANS itself writes श as `sh`, ष as `Sh`, च as `ch`, ā as `A` (lowercased to `a`), क्ष as `x` and ज्ञ as `jn` ([optitrans.toml](https://github.com/indic-transliteration/common_maps/blob/master/roman/optitrans.toml)). The same README shows `fix_lazy_anusvaara("saMchara") == "sa~nchara"`, which turns an anusvāra before a consonant into the matching nasal letter.
- **Aksharamukha.** Its "Roman (Readable)" map writes ā as `aa`, ī as `ee`, ū as `oo`, ṛ as `ri'`, ś and ṣ as `sh`, c as `ch` and ch as `chh` ([RomanReadable.py](https://github.com/virtualvinodh/aksharamukha-python/blob/main/aksharamukha/ScriptMap/Roman/RomanReadable.py)). "Roman (Colloquial)" writes ā as `a`, ṛ as `ri`, and ś and ṣ as `sh` ([RomanColloquial.py](https://github.com/virtualvinodh/aksharamukha-python/blob/main/aksharamukha/ScriptMap/Roman/RomanColloquial.py)). It has a rule-based `RemoveSchwaHindi` step for Devanagari input ([PreProcess.py](https://github.com/virtualvinodh/aksharamukha-python/blob/main/aksharamukha/PreProcess.py)). Its web documentation page renders only with JavaScript, and its text couldn't be read for this ticket.

#### Common informal ASCII conventions

There is no single informal standard. Three published rule sets, plus the current site's own spellings, show the range:

| IAST letter | unaccent (Postgres) | "Lay Indian" (indic-transliteration) | Aksharamukha Readable | Aksharamukha Colloquial |
| --- | --- | --- | --- | --- |
| ā, ī, ū | a, i, u | a, i, u | aa, ee, oo | a, i, u |
| ś, ṣ | s, s | sh, sh | sh, sh | sh, sh |
| c, ch | c, ch | ch, ch | ch, chh | ch, chh |
| ṛ | r | ri | ri' | ri |
| kṣ | ks | ksh | ksh | ksh |
| jñ | jn | gy | (not checked) | (not checked) |
| ṃ (anusvāra) | m | m | M (post-processed) | M (post-processed) |

The unaccent column comes from Postgres's `unaccent.rules` file for Postgres 18. It maps every IAST letter checked to its bare letter: ā ī ū ṛ ṝ ḷ ḹ ṃ ṁ ḥ ṅ ñ ṭ ḍ ṇ ś ṣ, and the capitals checked. It also deletes 99 standalone combining marks in the range U+0300–U+036F, including the dot below (U+0323), the ring below (U+0325) and the macron (U+0304) ([unaccent.rules](https://github.com/postgres/postgres/blob/REL_18_STABLE/contrib/unaccent/unaccent.rules)). The other columns come from the source files cited above. They are read from the maps, not produced by running the libraries.

The current site's spellings, set against what unaccent alone would produce. The IAST forms are illustrative; the Research editor confirms them in [Sanskrit terms: storage and display](../issues/15-sanskrit-terms.md).

| Current site (from [current-site.md](../../../docs/current-site.md)) | Likely IAST | unaccent gives | Also needs |
| --- | --- | --- | --- |
| Atman, Jiva, Jagat, Triguna, Ahimsa, Satya, Asteya | ātman, jīva, jagat, triguṇa, ahiṃsā, satya, asteya | atman, jiva, jagat, triguna, ahimsa, satya, asteya | nothing: same as the site |
| Sthitaprajna | sthitaprajña | sthitaprajna | nothing (the "lay Indian" rule would give sthitapragya instead) |
| Vikshepa, Upa-Vikshepa | vikṣepa, upavikṣepa | viksepa, upaviksepa | ṣ→sh rule; the hyphen is the site's own |
| Brahmacharya, Dosha, Anubandha Chatushtaya | brahmacarya, doṣa, anubandha catuṣṭaya | brahmacarya, dosa, anubandha catustaya | c→ch and ṣ→sh rules |
| Panch Klesha – Vikaar | pañca kleśa, vikāra | panca klesa, vikara | Hindi final-vowel drop ("panch", "vikaar"): hand entry |
| Brahma Vihara (URL `/brahmavihara/`) | brahmavihāra | brahmavihara | the spaced form: hand entry, or search that splits and joins words |
| Teertha yatra | tīrthayātrā | tirthayatra | ī→ee, the space, and the short final a: hand entry |
| KarmaYoga | karmayoga | karmayoga | nothing for unaccent; how "KarmaYoga" splits depends on the search engine |

#### Where automatic conversion goes wrong

- **Dropped final vowels (Hindi "schwa deletion").** Hindi pronunciation drops the inherent final "a" of many Sanskrit words: "panch" for pañca, "vikaar" for vikāra. Sanscript's `syncope` option only works in the other direction, reading Latin-letter input Hindi-style when converting to Devanagari ([README](https://github.com/indic-transliteration/sanscript.js)). Aksharamukha's `RemoveSchwaHindi` is a pattern rule on Devanagari ([PreProcess.py](https://github.com/virtualvinodh/aksharamukha-python/blob/main/aksharamukha/PreProcess.py)). It can't know which spelling the current site used, so those spellings have to be harvested and stored.
- **Pali and Hindi forms are different words, not different spellings.** The Pali Text Society dictionary gives Pali upekkhā (equanimity, one of the brahmavihāras) and compares it with Buddhist Sanskrit upekṣā ([PTS Pali-English Dictionary, "Upekkhā"](https://dsal.uchicago.edu/cgi-bin/app/pali_query.py?qs=upekkh&searchhws=yes&matchtype=default)). No transliteration rule links the two, so a Pali form is just another stored variant. "Brahma Vihara" itself is spelled the same in Pali and Sanskrit (brahmavihāra); what differs on the current site is the space and the missing diacritics.
- **Compounds.** Transliteration works letter by letter, so it never adds or removes a space. Devanagari writes a compound as one word (ब्रह्मविहार). The current site uses a spaced form ("Brahma Vihara"), a hyphenated form ("Upa-Vikshepa") and joined capitals ("KarmaYoga"), and its URLs use joined forms. A search engine only finds "brahmavihara" from "brahma vihara" if both spellings are stored, or if it splits and joins query words (see the search options below).
- **Anusvāra versus nasal letters in Devanagari.** Hindi users often type पंच (with an anusvāra dot) where Sanskrit writes पञ्च (with the letter ñ). These are different characters, not two encodings of one character. Converted to IAST, पंच becomes "paṃca", which unaccent turns into "pamca", not "panca". The Python library's `fix_lazy_anusvaara` addresses this for ITRANS input ([README](https://github.com/indic-transliteration/indic_transliteration_py)). The Sanscript.js README documents no equivalent.
- **ASCII is ambiguous.** "sh" may stand for ś or ṣ, and "a" for a or ā. An ASCII spelling therefore can't be converted back to IAST or Devanagari. Sanscript's README notes that it "makes some fairly bad hard-coded assumptions" about lossy output ([README](https://github.com/indic-transliteration/sanscript.js)).

#### Unicode pitfalls

- **Composed versus decomposed (NFC and NFD).** "ṣ" can be one code point (U+1E63) or "s" followed by a combining dot below (U+0073 U+0323). Unicode calls the two "canonically equivalent". Normalisation Form C (NFC) composes them and Form D (NFD) decomposes them, so that "equivalent strings have a unique binary representation" ([UAX #15, revision 58, Unicode 18.0](https://www.unicode.org/reports/tr15/)). Where the two forms meet:
  - Postgres compares strings byte by byte, so an exact match, a uniqueness check or a URL slug sees the two forms as different until both sides are normalised with `normalize()` ([PostgreSQL 18](https://www.postgresql.org/docs/current/functions-string.html)).
  - unaccent copes with both forms, because it maps ṣ to s and also deletes a standalone U+0323 ([unaccent.rules](https://github.com/postgres/postgres/blob/REL_18_STABLE/contrib/unaccent/unaccent.rules)).
  - Sanscript's IAST map lists the decomposed forms as accepted input alternatives ([iast.toml](https://github.com/indic-transliteration/common_maps/blob/master/roman/iast.toml)).
- **ṃ versus ṁ.** ṃ is U+1E43 (LATIN SMALL LETTER M WITH DOT BELOW) and ṁ is U+1E41 (M WITH DOT ABOVE). They are not canonically equivalent, so NFC doesn't merge them (Unicode 16 character data, checked with Python's `unicodedata`). IAST writes anusvāra as ṃ; ISO 15919, a related scholarly standard, writes it as ṁ ([iast.toml](https://github.com/indic-transliteration/common_maps/blob/master/roman/iast.toml), [iso.toml](https://github.com/indic-transliteration/common_maps/blob/master/roman/iso.toml)). Where this bites:
  - The common_maps IAST scheme lists ṁ as an input alternative for candrabindu (m̐, ँ), with a comment that a source text uses it that way. So IAST text containing ṁ converts to ँ, not ं.
  - unaccent maps both to "m", so search isn't affected. Exact comparison and Devanagari generation are.
  - The same goes for ṛ (IAST, U+1E5B) and r̥ (ISO 15919, r plus U+0325). The IAST map accepts r̥ as an alternative for ṛ.
- **Devanagari normalisation.** NFC decomposes a few precomposed Devanagari letters with nukta (Unicode composition exclusions). Sanskrit rarely uses nukta, so this mostly affects Hindi or Urdu loanwords. This is general Unicode behaviour and wasn't checked against a specific source here.

### Search options, compared against FR-04 and NFR-03

FR-04 asks that site search find content by title, Concept name in any spelling, author (for example of a Reference), traditional text and keyword. NFR-03 asks that search match any stored form of a Sanskrit term.

#### Postgres full-text search, unaccent, pg_trgm and synonym dictionaries, and what Neon supports

Full-text search in Postgres turns each document into a `tsvector`, a list of normalised words ("lexemes"). Queries are `tsquery` values matched with `@@`, and a GIN index (a lookup table from each word to the rows containing it) makes that fast ([PostgreSQL 18: Tables and Indexes](https://www.postgresql.org/docs/current/textsearch-tables.html)).

What Neon supports, from [Neon's extension list](https://neon.com/docs/extensions/pg-extensions) unless noted:

| Piece | On Neon? |
| --- | --- |
| `unaccent` (strip accents) | Yes: 1.1 on Postgres 14–18. Its rules file can't be changed by users; customising it needs a support ticket ([Neon: unaccent](https://neon.com/docs/extensions/unaccent)). |
| `pg_trgm` (fuzzy matching) | Yes: 1.6 on Postgres 14–18 ([Neon: pg_trgm](https://neon.com/docs/extensions/pg_trgm)) |
| `fuzzystrmatch`, `dict_int` | Yes |
| Synonym and thesaurus dictionaries | The templates are built into Postgres, but their files must sit in `$SHAREDIR/tsearch_data` on the server ([PostgreSQL 18: Dictionaries](https://www.postgresql.org/docs/current/textsearch-dictionaries.html)). Neon gives no access to the host file system ([Neon: Postgres compatibility](https://neon.com/docs/reference/compatibility)), so custom synonym files aren't possible. |
| `dict_xsyn` | Not in Neon's list |
| `rum` (an alternative index type) | 1.3 on Postgres 14–17, not on 18 |
| `pg_search` (ParadeDB BM25) | Gone: deprecated for new projects 19 March 2026 and retired from existing ones 21 September 2026 ([Neon: pg_search](https://neon.com/docs/extensions/pg_search)) |
| `lakebase_text`, `lakebase_tokenizer` | Yes, Postgres 16 and later: see the next section |

Against the criteria:

- **Matching without diacritics, and stored variants as equals.**
  - A text-search configuration that runs words through `unaccent` before the `simple` dictionary makes "viksepa" match "vikṣepa" on both the document and the query side. The `simple` dictionary lowercases words but doesn't "stem" them, that is, it doesn't cut words down to a root, which would mangle Sanskrit. Postgres documents this pattern ([PostgreSQL 18: unaccent](https://www.postgresql.org/docs/current/unaccent.html)), and the stock rules cover all IAST letters (see above).
  - Stored variants become equals by putting every stored spelling into the Concept's `tsvector` at the same weight as the title. Nothing extra is needed, because NFR-03 already stores the variants as data.
  - Hyphenated words are indexed both whole and as parts: Postgres's parser emits "foo-bar-beta1" as the full word plus "foo", "bar" and "beta1" ([PostgreSQL 18: Parsers](https://www.postgresql.org/docs/current/textsearch-parsers.html)). So "Upa-Vikshepa" can be found by "vikshepa".
  - A joined word such as "brahmavihara" is not split. Prefix search (`brahma:*`) finds words that start with the typed text ([PostgreSQL 18: Controlling Text Search](https://www.postgresql.org/docs/current/textsearch-controls.html)).
- **Devanagari input.**
  - Postgres's default parser treats zero-width marks (such as the virama ्) and Devanagari spacing vowel signs as "not word breakers" ([wparser_def.c, PG 18](https://github.com/postgres/postgres/blob/REL_18_STABLE/src/backend/tsearch/wparser_def.c), `p_isspecial`). A Devanagari word therefore stays one token.
  - unaccent has no Devanagari rules, so Devanagari passes through unchanged.
  - What counts as a "letter" depends on the database's `lc_ctype` setting ([PostgreSQL 18: Parsers](https://www.postgresql.org/docs/current/textsearch-parsers.html)). Neon's default is `C.UTF-8`. Whether that classifies Devanagari letters as letters wasn't verified (see Gaps).
  - Another way in is to transliterate a Devanagari query to IAST with Sanscript before searching. Devanagari input then reaches the same IAST and ASCII fields as Latin input.
- **Typo tolerance.**
  - Full-text search matches exact words or prefixes only.
  - `pg_trgm` adds fuzzy matching. It splits text into three-letter pieces ("trigrams") and offers `similarity` and `word_similarity` functions and the `%` and `<%` operators, with default thresholds of 0.3 and 0.6. It has GIN and GiST index support ([PostgreSQL 18: pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html)).
  - pg_trgm "ignores non-word characters (non-alphanumerics)". Its behaviour on Devanagari vowel signs isn't documented.
  - The site's spellings list would be a few hundred rows, small enough for a fuzzy pass over just the names. This size is an estimate from current-site.md's 33 pages and 6 posts, not a measurement.
- **Field weighting.** `setweight` labels parts of a `tsvector` A, B, C or D, for example title versus body. `ts_rank` weighs them by default as {0.1, 0.2, 0.4, 1.0} for D, C, B, A ([PostgreSQL 18: Controlling Text Search](https://www.postgresql.org/docs/current/textsearch-controls.html)). Titles and Sanskrit forms can be A, authors and traditional texts B, keywords C and body D.
- **How the index updates after an edit.** A stored generated `tsvector` column is computed "when it is written" ([PostgreSQL 18](https://www.postgresql.org/docs/current/ddl-generated-columns.html)). A Content editor's save updates search in the same transaction, with no separate step.
- **Speed when called from Vercel functions** (a Vercel function is a piece of server code Vercel runs on demand).
  - Search is one query on the database connection the site already has. With Vercel's "Fluid compute" (Vercel reusing warm function instances between requests), Neon recommends a normal TCP connection pool (`attachDatabasePool`) so warm functions reuse connections and skip the roughly 8 network round trips of a new connection ([Neon: Connecting from Vercel](https://neon.com/docs/guides/vercel-connection-methods)).
  - If the Neon compute has "scaled to zero" (been suspended after 5 idle minutes), the first query waits for a "cold start" that "typically takes a few hundred milliseconds" ([Neon: Connection latency](https://neon.com/docs/connect/connection-latency)). On the Launch plan, scale to zero can be turned off ([Neon pricing](https://neon.com/pricing)).
  - Neon recommends putting the app and the database in the same region. Neon has no India region; its nearest Asian region is Singapore ([Neon: Regions](https://neon.com/docs/introduction/regions)). Regions are for [Running on Vercel and Neon](../issues/08-running-on-vercel-and-neon.md).
- **Cost, and what it adds to running the site.** Nothing new to sign up for, back up or hand over: the search data lives in the database. Neon bills compute at $0.106 per CU-hour on Launch ([Neon pricing](https://neon.com/pricing)), so a search query costs only the compute time it uses. For scale: keeping the smallest 0.25 CU compute always on, to avoid cold starts, would be 0.25 × 730 hours ≈ 182.5 CU-hours ≈ $19.35 a month. That figure is calculated from the published price, and it is a cost of the database, not of search.

#### Neon's own search features: Lakebase Search (BM25)

BM25 is a relevance formula that uses how often a word appears across the whole collection. Postgres's built-in `ts_rank` doesn't. Neon now offers it as "Lakebase Search", developed by Databricks ([Neon: Lakebase Search](https://neon.com/docs/ai/lakebase-search)):

- **Status.** Lakebase Search "is now available to all Neon users on Postgres 16+", per the 26 June 2026 changelog ([Neon changelog 2026-06-26](https://neon.com/docs/changelog/2026-06-26)), after a private preview announced on 12 June ([Neon changelog 2026-06-12](https://neon.com/docs/changelog/2026-06-12)). Current versions: `lakebase_text` 0.1.3 and `lakebase_tokenizer` 0.2.0 ([extension list](https://neon.com/docs/extensions/pg-extensions)).
- **`lakebase_text`** adds a `lakebase_bm25` index on an ordinary `tsvector` column, queried with the `<@>` operator and `to_bm25query(...)`. Standard `tsvector` types and query operators "work unchanged" ([Neon: lakebase_text](https://neon.com/docs/extensions/lakebase-text)):
  - Corpus statistics are "computed at index build time and updated by VACUUM", Postgres's routine clean-up task. New rows are scored against statistics that lag until the next VACUUM.
  - The index has tuning parameters `k1` and `b`. The page doesn't say whether `setweight` labels affect BM25 scores (see Gaps).
- **`lakebase_tokenizer`** adds a `tokenizer_wholeword` dictionary with options `Lowercase`, `Normalize` (NFC/NFD/NFKC/NFKD), `StripAccents` ("Applies NFKD normalization and removes combining marks"), `Stopwords`, `Synonyms` and an English `Stemmer` ([Neon: lakebase_tokenizer](https://neon.com/docs/extensions/lakebase-tokenizer)):
  - Synonyms are stored in a SQL table, so they work on Neon where synonym files don't. Each is a one-to-one replacement of a single word, up to 100,000 rows per set.
  - After a synonym set changes, the dictionary must be reloaded and stored `tsvector` values regenerated.
- **Against the criteria.**
  - Diacritic-free matching: as with unaccent, via `StripAccents`.
  - Stored variants: the same approach as plain Postgres.
  - Typo tolerance: none documented.
  - Field weighting: not documented for BM25.
  - Index update: immediate for rows, with statistics catching up at VACUUM.
  - Speed and cost: the same as plain Postgres; it is the same database.
  - Devanagari: per its own description, `StripAccents` removes all combining marks after NFKD. That would strip Devanagari vowel signs, so Devanagari would need a configuration without that option. This is inferred from the documentation; it wasn't tested.

#### A prebuilt static index: Pagefind

Pagefind builds a search index when the site is built. The index is a set of static files that the visitor's browser downloads in small chunks. "Pagefind can run a full-text search on a 10,000 page site with a total network payload under 300kB" ([pagefind.app](https://pagefind.app/)). Current version 1.5.2, 12 April 2026, MIT licence ([npm registry](https://registry.npmjs.org/pagefind)).

- **Matching without diacritics.** Pagefind does this by default: "searching for 'cafe' will match pages containing 'café' and vice versa". Exact matches rank higher through `diacriticSimilarity` (default 0.8). `exactDiacritics: true` turns the folding off ([search config](https://pagefind.app/docs/search-config), [ranking](https://pagefind.app/docs/ranking)). In the source, folding is NFD decomposition followed by removing every combining mark ([splitting.rs](https://github.com/Pagefind/pagefind/blob/main/pagefind/src/fossick/splitting.rs), `normalize_diacritics`).
- **Stored variants as equals.** Pagefind indexes only what is on the page or in a custom record. Variants would have to be in the page text, or added through the Node API's `addCustomRecord` ([Node API](https://github.com/pagefind/pagefind/blob/main/docs/content/docs/node-api.md)). The UI's `processTerm` hook can rewrite a query before searching; Pagefind's own example replaces `aa` with `ā` ([UI docs](https://github.com/pagefind/pagefind/blob/main/docs/content/docs/ui.md)).
- **Devanagari input, from reading the source.**
  - Before indexing, each word keeps only characters where Rust's `is_alphanumeric()` is true. The Devanagari virama (U+094D) isn't "Alphabetic" in Unicode's data ([DerivedCoreProperties 18.0](https://www.unicode.org/Public/UCD/latest/ucd/DerivedCoreProperties.txt)), so it is dropped.
  - Diacritic folding then removes all combining marks, which includes every Devanagari vowel sign and the anusvāra. By that logic, विक्षेप is indexed for matching as वकषप, and ब्रह्मविहार as बरहमवहर. The original form is kept for ranking.
  - Matching still works, but loosely: different words with the same consonants collide. `exactDiacritics: true` keeps the vowel signs but also stops IAST folding.
  - Hindi (`hi`) has Pagefind stemming ([multilingual](https://pagefind.app/docs/multilingual)). It is a Hindi stemmer, not a Sanskrit one.
- **Typo tolerance.** None documented. It matches word prefixes ("part" finds "party") and ranks closer-length words higher ([ranking](https://pagefind.app/docs/ranking)). The 1.4.0–1.5.2 release notes don't mention typo tolerance ([releases](https://github.com/Pagefind/pagefind/releases)). Hyphenated and joined-capital words are also indexed as their parts ([splitting.rs](https://github.com/Pagefind/pagefind/blob/main/pagefind/src/fossick/splitting.rs)).
- **Field weighting.** `data-pagefind-weight` sets a weight on any element (0 to 10, on a quadratic scale). `metaWeights` weights metadata fields; the title gets 5× by default ([weighting](https://pagefind.app/docs/weighting), [ranking](https://pagefind.app/docs/ranking)).
- **How the index updates after an edit.** Only on the next build. The indexing API builds the index from the pages and records given to it in that run (`build_indexes` in [api.rs](https://github.com/Pagefind/pagefind/blob/main/pagefind/src/service/api.rs)). No call for updating one page in an existing index appears in the [Node API docs](https://github.com/pagefind/pagefind/blob/main/docs/content/docs/node-api.md). A Content editor's save would need to call a Vercel Deploy Hook, a secret URL that starts a new deployment ([Vercel: Deploy Hooks](https://vercel.com/docs/deploy-hooks)), and search would lag until that deployment finishes. Build minutes are billed at $0.0035 per CPU minute on paid Vercel teams. Vercel's own example is a 3-minute build on 4 vCPUs = 12 CPU minutes ([Vercel: Managing Builds](https://vercel.com/docs/builds/managing-builds)).
- **Speed from Vercel functions.** None are called: search runs in the visitor's browser, in a Web Worker since 1.5.0 ([releases](https://github.com/Pagefind/pagefind/releases)).
- **Cost and what it adds.** No account and no fee, but a build-time indexing step. With a server-rendered framework, that step reads from the database and writes the index. The framework is still open in [Framework and content back end](../issues/04-framework-and-content-back-end.md).

#### Hosted search: Algolia, Typesense Cloud, Meilisearch Cloud

All three are separate services. The site sends each record to them, and the browser usually queries them directly with a search-only key.

**Algolia**

- **Diacritics.** Algolia removes diacritics at indexing and query time; this "is language-agnostic and you can't turn it off", except per character with `keepDiacriticsOnCharacters` ([normalization](https://www.algolia.com/doc/guides/managing-results/optimize-search-results/handling-natural-languages-nlp/in-depth/normalization)).
- **Variants.** Stored variants can go in a searchable attribute. Synonyms come in regular (multi-way), one-way, alternative-correction and placeholder forms ([synonyms](https://www.algolia.com/doc/guides/managing-results/optimize-search-results/adding-synonyms)).
- **Devanagari.** Hindi (`hi`) is a supported language, with stop words and basic plurals ([supported languages](https://www.algolia.com/doc/guides/managing-results/optimize-search-results/handling-natural-languages-nlp/in-depth/supported-languages)). Normalisation removes "accents, umlauts, and Arabic short vowels" ([natural languages](https://www.algolia.com/doc/guides/managing-results/optimize-search-results/handling-natural-languages-nlp)). What it does to Devanagari vowel signs isn't stated.
- **Typos and compounds.** Up to two typos per word ([typo tolerance](https://www.algolia.com/doc/guides/managing-results/optimize-search-results/typo-tolerance)). Splitting and joining of query words is on by default ([splitting and concatenation](https://www.algolia.com/doc/guides/managing-results/optimize-search-results/handling-natural-languages-nlp/in-depth/splitting-and-concatenation)), so "brahma vihara" and "brahmavihara" can meet.
- **Weighting.** The order of `searchableAttributes` sets field importance ([searchableAttributes](https://www.algolia.com/doc/api-reference/api-parameters/searchableAttributes)).
- **Index update.** Indexing jobs are queued and usually "finish within seconds or even milliseconds" ([asynchronous operations](https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/in-depth/index-operations-are-asynchronous)).
- **Speed.** It is queried from the browser. Algolia lists an India data centre in Noida, but "some regions aren't available for all plans" ([servers and clusters](https://www.algolia.com/doc/guides/scaling/infrastructure/classic/servers-clusters)). The Grow plan lists US, UK and EU hosting ([pricing](https://www.algolia.com/pricing)).
- **Cost** ([pricing](https://www.algolia.com/pricing)):
  - Free: 10,000 searches a month and 50,000 records. At the limit, Algolia "may suspend the applicable Service or apply an Algolia attribution" ([Free plan terms](https://www.algolia.com/policies/free-plan-details)). Free-plan sites are asked to show the Algolia logo next to the search bar ([support article](https://support.algolia.com/hc/en-us/articles/4406981826065-Do-I-need-to-display-the-Algolia-logo-when-on-a-free-plan)).
  - Grow: 10,000 searches a month included, then $0.50 per extra 1,000. 100,000 records included, then $0.40 per extra 1,000.

**Typesense Cloud**

- **Diacritics.** Fields without a locale are treated as English, and "diacritics (accent marks) are automatically removed from European accented characters". Fields with another locale keep diacritics, using ICU, a standard Unicode library ([locale guide](https://typesense.org/docs/guide/locale.md)). The tokenizer source converts each character with `iconv` "ASCII//TRANSLIT" in the default path ([tokenizer.cpp](https://github.com/typesense/typesense/blob/main/src/tokenizer.cpp)). That should fold ṣ to s, but it wasn't tested.
- **Variants.** One-way and multi-way synonym sets ([synonyms](https://typesense.org/docs/30.2/api/synonyms.html)).
- **Devanagari.** Hindi (`hi`) is listed. Typesense advises: "Always Specify the Locale if it's not an English field" ([locale guide](https://typesense.org/docs/guide/locale.md)), so Devanagari belongs in its own `hi` field. What the default path does to Devanagari wasn't tested.
- **Typos and compounds.** `num_typos` 0–2, default 2. `split_join_tokens` treats a space as a typo, so "basket ball" and "basketball" can meet ([search API](https://typesense.org/docs/30.2/api/search.html)).
- **Weighting.** `query_by` order plus `query_by_weights` (0–127) ([search API](https://typesense.org/docs/30.2/api/search.html), [ranking](https://typesense.org/docs/guide/ranking-and-relevance.md)).
- **Index update.** Single-document upsert is meant "to index a document in response to some user action" ([documents API](https://typesense.org/docs/30.2/api/documents.html)).
- **Speed.** Regions include Mumbai, Hyderabad and Singapore ([Typesense Cloud](https://cloud.typesense.org/)).
- **Cost.** The smallest cluster is $0.03 an hour, "$21.60 /month". The first 720 hours are free. Bandwidth out is $0.09/GB after the first 10 GB ([pricing](https://typesense.org/pricing/)).

**Meilisearch Cloud**

- **Diacritics.** Latin script gets "Decomposition, lowercase, nonspacing-marks removal" ([language](https://www.meilisearch.com/docs/resources/help/language)), so IAST folds to plain letters.
- **Devanagari.** It has no dedicated pipeline. In the tokenizer source, nonspacing-mark removal applies only to Hebrew, Thai, Arabic, Latin and Greek ([charabia nonspacing_mark.rs](https://github.com/meilisearch/charabia/blob/main/charabia/src/normalizer/nonspacing_mark.rs)), so Devanagari keeps its vowel signs.
- **Typos and compounds.**
  - One typo for words of 5 or more characters, two for 9 or more ([typo tolerance](https://www.meilisearch.com/docs/capabilities/full_text_search/relevancy/typo_tolerance_settings)).
  - Multi-word queries are also searched joined up (up to 3 words), and single words may be split ([concatenated and split queries](https://meilisearch.com/docs/resources/internals/concat)).
  - The tokenization page says "ice cream" will not match "icecream" ([tokenization](https://www.meilisearch.com/docs/capabilities/indexing/advanced/tokenization)), which conflicts with the concatenation page (see Gaps).
- **Weighting.** The order of `searchableAttributes` ([attribute ranking order](https://meilisearch.com/docs/capabilities/full_text_search/relevancy/attribute_ranking_order)).
- **Index update.** Document additions are queued tasks ([asynchronous operations](https://meilisearch.com/docs/capabilities/indexing/tasks_and_batches/async_operations)).
- **Speed.** Regions include Singapore; no India region is listed ([cloud regions](https://www.meilisearch.com/docs/capabilities/platform/infrastructure/regions)).
- **Cost.** From $20 a month after a 14-day trial. The estimator shows $23–$30 a month at 100,000 documents and 10,000 searches ([pricing](https://www.meilisearch.com/pricing)).

**What any hosted engine adds to running the site:**

- a second copy of the content that must be kept in sync on every save, plus a periodic full re-sync to catch drift
- an admin key held as a Vercel secret and a public search-only key
- another account to hand over to the client under FR-09, and another bill the client pays after handover ([map notes](../map.md))

#### Side by side

| | Postgres FTS + unaccent + pg_trgm | Lakebase Search (BM25) | Pagefind | Algolia | Typesense Cloud | Meilisearch Cloud |
| --- | --- | --- | --- | --- | --- | --- |
| Matches without diacritics | Yes (unaccent) | Yes (`StripAccents`) | Yes (default) | Yes (always on) | Yes for default fields (not tested) | Yes (Latin) |
| Stored variants as equals | Index every stored spelling | Same | Variants must be in page or record | Searchable attribute or synonyms | Field or synonyms | Field or synonyms |
| Devanagari input | Words kept whole by parser (locale not verified) | Avoid `StripAccents` on Devanagari | Folded to consonants by default | Not documented | Needs `hi` field | Marks kept |
| Typo tolerance | pg_trgm similarity | None documented | Prefix only | Up to 2 typos; split and join | 0–2 typos; split and join | 1–2 typos; split and join |
| Field weighting | `setweight` A–D | Not documented | Element and meta weights | Attribute order | Order and weights | Attribute order |
| Update after an edit | Same transaction | Rows at once; statistics at VACUUM | Next build and deploy | Queued, seconds | Upsert per document | Queued task |
| Speed from Vercel | One query on the existing connection; cold start a few hundred ms if scaled to zero | Same | No function; runs in browser | Browser to Algolia | Browser to Typesense | Browser to Meilisearch |
| Cost | Neon compute only | Neon compute only; needs Postgres 16+ | Free; build minutes | Free with logo up to 10K searches, then $0.50 per 1K | About $21.60 a month | From $20 a month |
| Adds to running | Nothing new | Young extension (0.1.3, GA June 2026) | Build step and deploy hook | Vendor account, sync | Vendor account, sync | Vendor account, sync |

## Gaps and uncertainties

- **Nothing was run.** Under this ticket's rules no downloaded code was executed and no Neon or Vercel resource was touched. Every behaviour above comes from documentation, data files or source code. Points that reading couldn't settle, each answerable with a short test on a throwaway Neon branch or a local build:
  - Whether Neon's `C.UTF-8` locale makes Postgres's parser treat Devanagari letters as letters. `SELECT * FROM ts_debug('simple', 'विक्षेप');` settles it. A Neon docs example shows computes built on Debian, but the C library version wasn't confirmed.
  - How `pg_trgm` handles Devanagari vowel signs and virama.
  - Whether `lakebase_text` BM25 scores respect `setweight` labels, and how fresh rows score before the next VACUUM.
  - Pagefind's query-side normalisation. The indexing side and the ranking code were read; the browser bundle's normalisation of the typed query wasn't traced.
  - Typesense's default (English) path on Devanagari text, and Algolia's normalisation of Devanagari vowel signs. Neither vendor documents these.
- **Meilisearch's docs disagree with each other.** The tokenization page says "ice cream" won't match "icecream". The concatenation page says multi-word queries are also searched joined.
- **The library-derived spellings are read from maps, not produced by running the libraries.** Examples are "sthitapragya" from the lay-Indian rule, and the nasal shortcuts in OPTITRANS that turn "~nc" into "nc". Sanscript.js 1.3.3 (June 2025) bundles the maps as they stood at its build; the current `common_maps` files may differ.
- **The IAST forms in the current-site table are illustrative.** The Research editor confirms them in [Sanskrit terms: storage and display](../issues/15-sanskrit-terms.md). Harvesting every spelling the current site uses is migration work.
- **Licences need reading before any use.** Aksharamukha is AGPL-3.0 on PyPI and GitHub, yet its repository also ships `gpl-3.0.txt`. The npm `aksharamukha` package is a third-party GPL-3.0 build; how it runs in the browser wasn't checked. No legal reading was done.
- **Hosted costs depend on traffic that isn't known.** Search volume comes from analytics ([Findability and analytics](../issues/25-findability-and-analytics.md)). The audience's location, which decides regions, belongs to [Running on Vercel and Neon](../issues/08-running-on-vercel-and-neon.md).
- **Some sources were unreadable.** Aksharamukha's documentation site (aksharamukha.com/python) renders only with JavaScript and returned no text. The sanscript.js README doesn't show its last commit date.
- **Search engines outside the ticket's list weren't researched.**

## Sources

All read on 2026-10-26.

Neon

- Postgres extensions list: https://neon.com/docs/extensions/pg-extensions
- unaccent: https://neon.com/docs/extensions/unaccent
- pg_trgm: https://neon.com/docs/extensions/pg_trgm
- pg_search (deprecated): https://neon.com/docs/extensions/pg_search
- Lakebase Search overview: https://neon.com/docs/ai/lakebase-search
- lakebase_text: https://neon.com/docs/extensions/lakebase-text
- lakebase_tokenizer: https://neon.com/docs/extensions/lakebase-tokenizer
- Changelog 2026-06-12 (private preview): https://neon.com/docs/changelog/2026-06-12
- Changelog 2026-06-26 (Lakebase Search GA): https://neon.com/docs/changelog/2026-06-26
- Postgres compatibility (collation, file system, roles): https://neon.com/docs/reference/compatibility
- Connection latency and timeouts: https://neon.com/docs/connect/connection-latency
- Connecting to Neon from Vercel: https://neon.com/docs/guides/vercel-connection-methods
- Regions: https://neon.com/docs/introduction/regions
- Pricing: https://neon.com/pricing

PostgreSQL 18 documentation and source

- Dictionaries: https://www.postgresql.org/docs/current/textsearch-dictionaries.html
- unaccent: https://www.postgresql.org/docs/current/unaccent.html
- pg_trgm: https://www.postgresql.org/docs/current/pgtrgm.html
- Parsers: https://www.postgresql.org/docs/current/textsearch-parsers.html
- Controlling text search: https://www.postgresql.org/docs/current/textsearch-controls.html
- Tables and indexes: https://www.postgresql.org/docs/current/textsearch-tables.html
- String functions (normalize): https://www.postgresql.org/docs/current/functions-string.html
- Generated columns: https://www.postgresql.org/docs/current/ddl-generated-columns.html
- unaccent.rules (REL_18_STABLE): https://github.com/postgres/postgres/blob/REL_18_STABLE/contrib/unaccent/unaccent.rules
- Text search parser source (REL_18_STABLE): https://github.com/postgres/postgres/blob/REL_18_STABLE/src/backend/tsearch/wparser_def.c

Transliteration

- Sanscript.js README: https://github.com/indic-transliteration/sanscript.js
- Sanscript.js API reference (via context7): https://github.com/indic-transliteration/sanscript.js/blob/master/_autodocs/api-reference/sanscript.md
- Sanscript.js npm registry entry: https://registry.npmjs.org/@indic-transliteration/sanscript
- indic_transliteration README: https://github.com/indic-transliteration/indic_transliteration_py
- indic_transliteration roman.py: https://github.com/indic-transliteration/indic_transliteration_py/blob/master/indic_transliteration/sanscript/schemes/roman.py
- indic-transliteration PyPI JSON: https://pypi.org/pypi/indic-transliteration/json
- common_maps optitrans.toml: https://github.com/indic-transliteration/common_maps/blob/master/roman/optitrans.toml
- common_maps iast.toml: https://github.com/indic-transliteration/common_maps/blob/master/roman/iast.toml
- common_maps iso.toml: https://github.com/indic-transliteration/common_maps/blob/master/roman/iso.toml
- Aksharamukha repository (GitHub API): https://api.github.com/repos/virtualvinodh/aksharamukha-python
- Aksharamukha setup.py: https://github.com/virtualvinodh/aksharamukha-python/blob/main/setup.py
- Aksharamukha RomanReadable.py: https://github.com/virtualvinodh/aksharamukha-python/blob/main/aksharamukha/ScriptMap/Roman/RomanReadable.py
- Aksharamukha RomanColloquial.py: https://github.com/virtualvinodh/aksharamukha-python/blob/main/aksharamukha/ScriptMap/Roman/RomanColloquial.py
- Aksharamukha PreProcess.py: https://github.com/virtualvinodh/aksharamukha-python/blob/main/aksharamukha/PreProcess.py
- Aksharamukha PyPI JSON: https://pypi.org/pypi/aksharamukha/json
- aksharamukha npm registry entry: https://registry.npmjs.org/aksharamukha
- PTS Pali-English Dictionary, "Upekkhā": https://dsal.uchicago.edu/cgi-bin/app/pali_query.py?qs=upekkh&searchhws=yes&matchtype=default

Unicode

- UAX #15, Unicode Normalization Forms (revision 58): https://www.unicode.org/reports/tr15/
- DerivedCoreProperties 18.0.0: https://www.unicode.org/Public/UCD/latest/ucd/DerivedCoreProperties.txt

Pagefind

- Home: https://pagefind.app/
- Search config: https://pagefind.app/docs/search-config
- Ranking: https://pagefind.app/docs/ranking
- Weighting: https://pagefind.app/docs/weighting
- Multilingual: https://pagefind.app/docs/multilingual
- Node API (via context7): https://github.com/pagefind/pagefind/blob/main/docs/content/docs/node-api.md
- UI docs: https://github.com/pagefind/pagefind/blob/main/docs/content/docs/ui.md
- splitting.rs: https://github.com/Pagefind/pagefind/blob/main/pagefind/src/fossick/splitting.rs
- api.rs: https://github.com/Pagefind/pagefind/blob/main/pagefind/src/service/api.rs
- Releases: https://github.com/Pagefind/pagefind/releases
- npm registry entry: https://registry.npmjs.org/pagefind

Vercel

- Deploy Hooks: https://vercel.com/docs/deploy-hooks
- Managing Builds: https://vercel.com/docs/builds/managing-builds

Algolia

- Pricing: https://www.algolia.com/pricing
- Free plan terms: https://www.algolia.com/policies/free-plan-details
- Logo on the free plan: https://support.algolia.com/hc/en-us/articles/4406981826065-Do-I-need-to-display-the-Algolia-logo-when-on-a-free-plan
- Normalization: https://www.algolia.com/doc/guides/managing-results/optimize-search-results/handling-natural-languages-nlp/in-depth/normalization
- Natural languages: https://www.algolia.com/doc/guides/managing-results/optimize-search-results/handling-natural-languages-nlp
- Supported languages: https://www.algolia.com/doc/guides/managing-results/optimize-search-results/handling-natural-languages-nlp/in-depth/supported-languages
- Typo tolerance: https://www.algolia.com/doc/guides/managing-results/optimize-search-results/typo-tolerance
- Splitting and concatenation: https://www.algolia.com/doc/guides/managing-results/optimize-search-results/handling-natural-languages-nlp/in-depth/splitting-and-concatenation
- Synonyms: https://www.algolia.com/doc/guides/managing-results/optimize-search-results/adding-synonyms
- searchableAttributes: https://www.algolia.com/doc/api-reference/api-parameters/searchableAttributes
- Asynchronous operations: https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/in-depth/index-operations-are-asynchronous
- Servers and clusters: https://www.algolia.com/doc/guides/scaling/infrastructure/classic/servers-clusters

Typesense

- Pricing: https://typesense.org/pricing/
- Typesense Cloud (regions): https://cloud.typesense.org/
- Locale guide: https://typesense.org/docs/guide/locale.md
- Search API (30.2): https://typesense.org/docs/30.2/api/search.html
- Synonyms (30.2): https://typesense.org/docs/30.2/api/synonyms.html
- Documents API (30.2): https://typesense.org/docs/30.2/api/documents.html
- Ranking and relevance: https://typesense.org/docs/guide/ranking-and-relevance.md
- tokenizer.cpp: https://github.com/typesense/typesense/blob/main/src/tokenizer.cpp

Meilisearch

- Pricing: https://www.meilisearch.com/pricing
- Language support: https://www.meilisearch.com/docs/resources/help/language
- Tokenization: https://www.meilisearch.com/docs/capabilities/indexing/advanced/tokenization
- Concatenated and split queries: https://meilisearch.com/docs/resources/internals/concat
- Typo tolerance: https://www.meilisearch.com/docs/capabilities/full_text_search/relevancy/typo_tolerance_settings
- Attribute ranking order: https://meilisearch.com/docs/capabilities/full_text_search/relevancy/attribute_ranking_order
- Asynchronous operations: https://meilisearch.com/docs/capabilities/indexing/tasks_and_batches/async_operations
- Cloud regions: https://www.meilisearch.com/docs/capabilities/platform/infrastructure/regions
- charabia nonspacing_mark.rs: https://github.com/meilisearch/charabia/blob/main/charabia/src/normalizer/nonspacing_mark.rs
