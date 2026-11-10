# Later phases

These ideas are kept for after launch, outside this project's scope. They come from the UI/UX spec, #166, and the last four from the November 2026 UI/UX review, #402.

The site's pictures are no longer one of these ideas: `docs/images-and-icons.md` brings over the client's own, kept as they are (`docs/adr/0005-the-clients-pictures.md`).

- Book covers on the reading lists from the Open Library Covers API: look each cover ID up once at build time, sending a User-Agent, because ISBN lookups are limited to 100 per IP every 5 minutes.
- Inline meanings: a Sanskrit word in running text shows its gloss on hover or tap.
- "Breathe with the lotus": a one-minute guided breathing exercise the visitor starts, which ends by itself or with × or Escape, and has no pause toggle.
- Devanagari first as a site-wide setting, dropped from the build in #43 (#29 closed).
- An About page.
- A bottom bar on phones, tried once analytics has a baseline to measure it against.
- Text size and night reading as settings. Each needs a stored preference, and the site keeps nothing in the browser's storage (#43).
- Continue reading: offering the page a visitor last read. It needs the same storage.
- "Was this page clear?" at the foot of a page.
