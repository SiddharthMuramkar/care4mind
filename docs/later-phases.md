# Later phases

These ideas are kept for after launch, outside this project's scope. All of them come from the UI/UX spec, #166.

- Images in one consistent look (hero, topics, traditional texts), each given the same duotone treatment, with a credits record and a `/credits/` page. Check each source's licence again before use:
  - The Met Open Access: CC0; look for the "OA" mark on the object's image.
  - Unsplash: free, but not to be compiled into a similar or competing service; Unsplash+ images have a separate paid licence.
  - Pexels: free, but no identifiable people shown in a bad light, no implied endorsement, and no use in a logo, trademark or business name.
  - Wikimedia Commons: the licence differs per file; CC BY-SA needs credit and share-alike.
  - Open Peeps: CC0.
  - unDraw: free, but must be self-hosted (no hotlinking), and its style is so common it works against a distinctive look.
- Book covers on the reading lists from the Open Library Covers API: look each cover ID up once at build time, sending a User-Agent, because ISBN lookups are limited to 100 per IP every 5 minutes.
- Inline meanings: a Sanskrit word in running text shows its gloss on hover or tap.
- "Breathe with the lotus": a one-minute guided breathing exercise the visitor starts, which ends by itself or with × or Escape, and has no pause toggle.
- Devanagari first as a site-wide setting, dropped from the build in #43 (#29 closed).
- An About page.
