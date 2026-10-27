# Sample the current site: content shape, navigation and brand

Type: research
Mode: AFK
Track: site
Status: resolved
Blocked by: none
Map: [Care4Mind.org rebuild](../map.md)

## Question

What shape is the current content in, and how is the current site navigated and branded? Work read-only, through the public REST API and the homepage HTML:

- at most about ten requests to care4mind.org, at least five seconds apart
- no logins, no forms, no MCP endpoints

Fetch:

- the listings of all pages, posts, media and comments, metadata fields only (use `_fields`)
- the full content of 4–6 representative items: `/atman/`, `/upavikshepaprofiling/`, both Text Books pages, `/indian-philosophy/` and the homepage
- the homepage HTML, for the menus, header, footer and brand assets

Record these facts:

- how Sanskrit terms appear in the samples (Devanagari, IAST, informal ASCII, Hindi or Pali forms), and the spellings found
- English glosses in titles
- how shlokas name their source (work, chapter and verse, translator)
- how references are formatted, and how complete they are
- links between pages, and any prose not in English
- what Elementor and the plugins put into the content, and what the REST API leaves out
- the media files by type and size, and whether they have alt text
- whether any post has public comments
- each menu item and where it points
- the logo, site icon, colours and typefaces
- how `/`, `/home/` and `/home-2/` differ, and how the two Text Books pages differ

Nobody decides anything here, and the full scrape comes after the map. Raw responses include author usernames, so keep them out of the repo.

## Answer

Researched 2026-10-26. Full findings: [`current-site-sample.md`](https://github.com/SiddharthMuramkar/care4mind/blob/research/current-site-sample/.scratch/rebuild/research/current-site-sample.md) on branch `research/current-site-sample` (pushed, never merged; commit `72e9d7c`).

- Content is Elementor page-builder markup with pasted styling and copy-paste formatting (55–97% markup on Elementor pages). References, shlokas and Sanskrit terms are formatted text, never fields.
- Sanskrit appears as Devanagari, IAST, informal ASCII and Hindi-style spellings, often mixed for one term on one page. Only 4 of 39 titles carry an English gloss.
- Shlokas rarely name their work and never a translator. References are an APA-style list (5 of 11 have DOIs) or bare book lines with no publisher; 10 links go to `#`.
- Content pages have no internal links. The 6-item menu shows only at 921 px or less, so desktop visitors get no menu. No public comments.
- 71 media files (37 MB, 15 PNGs over 1 MB); 1 has alt text. Brand: green-to-gold gradient, apricot headings, 11 typeface families including shareware Samarkan.
- `/`, `/home/` and `/home-2/` are three versions of one homepage; only `/` is live. The two Text Books pages are different lists (24 items vs 11 books).

**Gaps** (all listed in the findings): Only 6 items, plus `/home/` and `/home-2/`, were read in full; nothing was rendered in a browser; which media files are used where needs the full scrape.
