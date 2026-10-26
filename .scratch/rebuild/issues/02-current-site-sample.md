# Sample the current site: content shape, navigation and brand

Type: research
Mode: AFK
Track: site
Status: open
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
