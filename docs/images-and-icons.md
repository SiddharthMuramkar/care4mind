# Care4Mind: the pictures spec

**Version 1 · 9 November 2026 · for Claude Code (Opus) working in `SiddharthMuramkar/care4mind`**

The client's own pictures come over from care4mind.org into the new site: the lotus-brain Emblem, the folk-ornament Stickers and the Plates, folk paintings of people at work. Then every topic, section, Concept, Questionnaire and Traditional text gets a picture in the same style, which the old site never had.

This file is `docs/images-and-icons.md`, and its companion data is `scripts/art/originals.json`. Facts about the old site were read from its WordPress REST API and its live pages on 9 November 2026. Facts about the new site come from `main` at `f08d5d0`.

---

## 0. How to use this spec

- **Read first:** `CLAUDE.md`, `GLOSSARY.md`, `docs/project-brief.md` (NFR-01, NFR-02, FR-07), issue #166 (the Press look and its motion rule), `docs/later-phases.md`, `src/styles/globals.css`, `src/config/old-site-urls.ts` and `src/config/redirects.ts`.
- **The repo's rules still hold.** `pnpm check` says a change is done. Work goes through pull requests, never a push to `main`. Pages that change also run `pnpm check:e2e`. Components live in a folder named for them, styled by a CSS module, reading tokens from `globals.css`. Markup names no utility class but `sr-only`.
- **Text in `src/content/data/` is not touched.** Pictures attach to content from a separate art registry (section 6.4), so `pnpm content:verify` has nothing new to check. Citations in Concept, Questionnaire and Library content are not picture sources: leave them alone.
- **Work in the order of section 8.** Each ticket there is one PR with its own "done when", except ticket 12, which is several (section 8). Ticket PRs have base `images`, the integration branch, and land with `gh pr merge --squash` (this repo allows squash merges only, and auto-merge is off). Nothing merges into `main` from a ticket while one PR from `images` to `main` waits for Siddharth, because a merge to `main` goes live on care4mind.xyz. Everything runs without him except one step: making the new pictures (ticket 12).
- **Section 10 lists the decisions this spec takes by default.** Siddharth confirms them with the client. Until he does, build to the defaults.
- **Words in this spec** are the words in `GLOSSARY.md`: Emblem, Sticker, Pothi, Plate, Medallion, Frontispiece, Ornament and Interim picture. A Plate is any square folk painting, whether the client's or made for this site, and a Medallion is how a Plate is shown (a circle inside a drawn ring), so new painted pictures are `plate-x`. A Pothi is a Sticker of a palm-leaf manuscript, one per Traditional text (`pothi-x`). Picture families are Emblem, Sticker and Plate. Only shipped pictures have one: the other values in Appendix A and `originals.json` classify old files.

---

## 1. The short version

1. **What the client loves** is one coherent visual language: a pink lotus that is also a brain, folk-art Stickers, and folk paintings of Indians absorbed in skilled work (a jeweller, a sculptor, farmers, painters, a sage "painting" a brain). The paintings illustrate the motto *yad bhāvaṃ tad bhavati*: as are the thoughts, so are the manifestations. All of them look AI-made (1024 × 1024, numbered variants, uploaded May 2024), and the client chose the themes.
2. **The old site has 71 files in its media library.** 22 are worth bringing over as they are (2 Emblems, 9 Stickers, 11 Plates). 4 are rebuilt as SVG (three borders and the Karma Yoga diagram). 4 wait on a licence check. 13 are archived. 28 are dropped: theme demo photos, stock pictures with no licence on record, an icon pack and fonts. Appendix A has all 71.
3. **The new site keeps Press**, its indigo-and-paper look (#166), as the November 2026 UI/UX review (#402) refines it. The pictures sit on the paper as tipped-in Plates and Stickers. They are never recoloured or duotoned. That reverses the duotone idea in `docs/later-phases.md`, because the client's colours are the point.
4. **Opus can draw some of it and not the rest.** It draws the borders, the Medallion rings and the Karma Yoga diagram as SVG. It cannot hand-draw the folk paintings or the detailed Stickers. Those need an image model: Recraft's official MCP server, which learns a custom style from the client's own Stickers. Thirty-two new pictures take one paid month of Recraft Basic, about US$12 plus tax (D4). Making them is the one step that waits for Siddharth (section 8, ticket 12). Everything else, including the contact sheet, the prompts and the placements, is built around it.
5. **Nothing old breaks.** Every old media address (273 WordPress addresses plus 9 Elementor thumbnails, 282 in all) answers with a 301: to its new file where the picture survives, otherwise to the page that showed it (FR-07).

---

## 2. What the client loves: the picture families

### 2.1 The Emblem (logo)

*Files: `Logo-with-frame-4-and-text.png` (1024 × 1024) and `Logo-final-e1715691828178.png` (781 × 713).*

- **The idea:** a lotus seen from the side whose outer petals are drawn as the folds of a brain. A grey-brown, ribbed cerebellum sits low on the right. The lotus stalk curves down as the brain stem. Mind (brain) and Indian contemplative tradition (lotus) become one shape.
- **The lotus-brain:** coral and salmon pink "gyri" covered in fine dot-work and dark-red linework. The inner lotus petals are cream with coral tips and small dot ornaments. Outlines are dark maroon-brown.
- **The frame (version 4, the one in use):** a thick dark sage-green ring. Inside it at the top sits a small coral-and-cream flower between two dark-green leaves. A row of small coral dots and crescents runs down the left. Two sage-green laurel sprigs meet at a three-leaf sprig at the bottom.
- **The motto under the ring:** यद् भावं तद् भवति, in a dark Devanagari serif, baked into the picture.
- **Alternatives the team tried:** a dotted orange-and-green ring with four teal diamond points (version 3), and concentric pink, green and teal rings with arrow points (version 2). There is also an older 2023 logo, an orange lotus with a meditating figure on a green hand over "CARE4MIND · MANOVIKASAM".

### 2.2 Stickers

*Files: `Cosmos-icon`, `Psychology-Techniques-icon` (three versions), `Book-icon-2`, `book-icon`, `Meditation-icon`, `Gear-Icon` and `Survey-1`. All are PNGs with transparent backgrounds, 480–1080 px.*

These are what the client means by "the icons". On the old homepage they sit at about 108 px on the six section cards.

| Sticker | What it shows | Old card |
|---|---|---|
| Cosmos | An eight-petal coral lotus mandala with a teal centre, on a black starfield with pink, orange, striped and ringed planets | Concepts, and Resources |
| Psychology-Techniques-4 | A brain in two halves, packed with small symbols: bar charts, a pencil, a person, a keyhole, a water drop, a compass wheel and puzzle pieces | Techniques |
| Psychology-Techniques-2 | A brain split by a central blade, filled with swirls, gears, dots and petals in coral, blue and cream | not shown |
| Psychology-Techniques | A dome shaped like a head, full of gears, an eye, a drop, triangles, bars and spirals | not shown |
| Book-2 | A closed book with a teal cover, a coral eight-petal flower in the middle, a cross strap, coral page edges and a ribbon | Tradition and Texts |
| book | A second book with a coral, teal and mustard mandala on the cover and a clasp. No die-cut edge | not shown |
| Meditation | A cream figure in lotus pose with three coral dots down the body, before a symmetrical teal, coral and orange temple arch | not shown |
| Gear | Concentric gears in orange, pink and teal inside a spiked gear ring, filled with pastel paisleys | Research |
| Survey (clipboard) | A clipboard with a teal clip and a four-line checklist, framed by folk flowers on black | Applications |

**What makes a Sticker** (the style rules for new ones are in section 7.4):

- **One central symbol**, front-on and nearly symmetrical, filling about 85% of the canvas.
- **Bold, even, near-black outlines.** Finer inner lines.
- **Every region filled with folk ornament** in the Madhubani and Gond manner: dots, paisleys, lotus petals, scallops and leaf sprigs. No empty areas.
- **A soft pastel-folk palette:** coral pink, dusty rose, teal, deep teal, marigold, cream, small touches of orange and periwinkle. Black only where the subject is the night sky.
- **A thick cream die-cut edge** following the silhouette, sometimes with a faint soft shadow.
- **Flat colour.** No gradients, no text, no letters.

### 2.3 Plates (the folk paintings)

*Files: square 1024 × 1024 JPEGs, uploaded May 2024.*

| Plate | What it shows | Old use |
|---|---|---|
| Jewellry-making-2 | A jeweller in a maroon turban and round glasses threads a ruby-and-emerald necklace on a patterned blue rug, among brass lamps, tools and pots. The background is a pale line sketch of figures | hero, slide 1 |
| Sculptor-3 | A young sculptor in a cream kurta and red-bordered veshti chisels a stone Ganesha under a red-tiled temple canopy, on a blue ground with red flowers in pots | hero, slide 2 |
| Indian-Farmer | A farmer in a red turban ploughs with a white zebu while a woman in a yellow-orange sari plants seedlings. Black bullocks, a cart, three patterned trees, birds and a river behind; a band of bright flowers in front | hero, slide 3 |
| Jewellry-making-1 | A woman in a green and red sari strings a gold-and-emerald necklace on a black bust, above a painted chest | not shown |
| Karmayoga-Main-image | A man in a striped shirt kneels to dig and plant, beside a potted plant, under a sky of blue and black mandala rosettes and swirling clouds, over a zigzag folk border | Dosha card |
| Intricate-painting-1 | An old man in a white turban and yellow kurta paints tiny patterns on a bowl by a river. Fruit trees, a rising sun with Madhubani rays, and birds | not shown |
| Intricate-painting-2 | An old man in an orange turban and green kurta paints birds on a panel by a lake, under trees full of birds | not shown |
| Work-on-the-brain-1 | A white-bearded sage in red patterned robes sits cross-legged and paints a brain with a fine brush, paint pots around him, under a deep-blue sky with a spiral galaxy | Survey -02 card |
| human-mind-and-sage-2 | A black silhouette of a sage with orange Warli-like patterning reaches out to a black brain full of gold mandala lines, against swirling orange circles | survey -03 card |
| Mind-2 | A square folk tile: a tree whose crown is a brain-shaped mandala of maroon, teal and black swirls, in a striped pot, among flowering branches, inside a dotted border | not shown |
| Spiritual-Climate | A sheet of separate folk motifs on pale green: lotuses, suns, oil lamps, tiered temple roofs, an elephant and tulsi plants | old duplicate homepage |

**What makes a Plate:**

- **The subject is one Indian person, or a couple, absorbed in patient, skilled work.** Crafts, farming, painting, or a sage working on the mind. The mood is calm concentration and the dignity of work, which is karma yoga.
- **The style blends Indian folk painting:** Madhubani (double outlines, hatching, birds and fish, dense borders), Pattachitra and Kalighat (bold black contour, flat bright colour), Kerala murals (warm ochres, ornate canopies), Gond (dot-and-dash fills) and Warli (silhouettes).
- **Jewel-tone colour on cream:** vermilion, marigold, peacock blue and teal, leaf green, maroon and turmeric, with black contours.
- **The subject sits in the middle,** so it survives the circular crop the client chose for every Plate on the old site.
- **No text, no logos.**

### 2.4 The old borders

There are three thin borders: a Madhubani dot-line (a double rule over alternating black and terracotta dots), a band of yellow, orange and red dots between hairlines, and a dark-green rule over black and rust dots. They are PNG strips. Opus redraws them as SVG, so they come back as Ornaments (section 6.5), which keeps them sharp, themeable and about 1 KB each.

### 2.5 The other pictures

- **The 2023 "cosmos" set:** a translucent blue meditating figure full of stars, two Flickr spiral galaxies, a woman's profile merged with a nebula (Shutterstock), and a seeker under a starry sky. The theme, the self and the cosmos (ātman, jagat), is good. The pictures are photographic, the licences are unknown or unsuitable, and they clash with the folk set. The theme comes back as new folk-style Plates (`plate-atman`, `plate-jagat`).
- **The 2023 photo-real AI pictures:** a sculptor, a jeweller, and a three-step "raw gold ore to ornament" story, a fine metaphor for purifying the mind (citta-śuddhi). They are a different style, so they are archived. Redrawing the gold story in folk style is left out for now (section 9).
- **The Karma Yoga diagram:** a cycle drawn in PowerPoint style, with its text baked into the picture. It is rebuilt as an accessible SVG (section 6.6; transcription in Appendix C).
- **Never the client's style:** generic line icons from an icon pack, stock vectors (WhatsApp forwards and a Storyset-like illustration), Astra theme demo photos and a Wepik composite.

### 2.6 What is a picture and what is not

The old site's look is partly pictures, partly text and partly CSS. This is what each part actually is.

| On the old site | What it is | On the new site |
|---|---|---|
| Logo, top left | A picture (WebP, cropped from the Emblem PNG) | The header keeps its line lotus; the Emblem picture goes in the footer and on the homepage (5.1, D2) |
| Round hero slides | Pictures (JPEG) in an Elementor carousel, cut to circles by CSS | Plates in a visitor-controlled viewer (5.2) |
| Icons on the six cards | Pictures (PNG with transparency) in Elementor "image box" widgets | Sticker pictures (5.2–5.8) |
| Round pictures on the Questionnaire cards | Pictures (JPEG/PNG) cut to circles by CSS | Medallions (5.6) |
| The curly headings ("psychology", "questionnaires & surveys") | **Text**, set in the Samarkan font, which imitates Devanagari with Latin letters | Not carried over (decision D8) |
| यद् भावं तद् भवति at the top | **Text**, in a Devanagari font | Already on the new site as text |
| Green-to-yellow background and lime card gradients | **CSS gradients**, not pictures | Not carried over: Press keeps its own colours |
| The Karma Yoga cycle | A picture with text baked in | Rebuilt as SVG with real text (6.6) |
| Orange buttons | CSS | Press keeps its own buttons |

### 2.7 The story the pictures tell

The client's choice of themes is consistent, and new pictures keep to it:

- **Work as practice (karma yoga).** Every Plate shows someone fully absorbed in their work. A jeweller, a sculptor and a farmer "manifest their thoughts" in what they make, which is the motto. The 2023 Wepik picture put the motto around the jeweller, so the pairing is the client's own.
- **The mind as something we work on.** Brains appear as material: painted by a sage, lit by a sage, grown as a tree, wired into a lotus.
- **Tradition as living craft.** Books, temple arches, oil lamps, lotuses and folk borders, never museum-like.
- **The self and the cosmos.** The starfield lotus (Cosmos Sticker), the sage under a galaxy, and the 2023 cosmos photos.

---

## 3. Ground rules

1. **Keep the originals as they are.** Do not recolour, duotone, filter, re-crop the source files or "improve" them with AI. Circular crops are done in CSS, so the source stays whole.
2. **Press stays.** The site's colours, type and header lotus (#166) change only as the November 2026 UI/UX review (#402) sets out: a dark colour scheme with light paper, the missing colour roles, one type scale and a system sans for small interface text (#403), and the later items its sub-issues build. The only layout changes are the ones section 5 sets out: the homepage's two-column hero, homepage sections at 72rem, and cards and page heads that make room for a picture. Pictures fit into Press, not the other way round.
3. **No text inside pictures.** Text is real text (WCAG 1.4.5). This is why the Karma Yoga diagram is rebuilt and the Emblem is used without its baked-in motto.
4. **Every picture shipped has a record:** its origin, its licence or proof of ownership, its alt text and its approval. Nothing with an unknown licence ships, with one exception: the 22 kept pictures go in now, and the client's answer on reusing them (section 11, question 1) is tracked in #25 as a launch blocker.
5. **No layout shift, no slow pages.** Every picture has fixed dimensions and stays inside the budget in section 6.10. NFR-02 still passes.
6. **Motion follows #166.** Nothing moves on its own for more than 5 s after load. Anything else moves only when the visitor scrolls, hovers, focuses or presses.
7. **A new picture is approved by the client before it ships,** from the contact-sheet PDF (section 7.9). Until then it stays behind the `draftArt` flag. The Project owner and Research editor are not yet named, so the drafted alt text and captions ship as written assumptions, listed in #25.
8. **No source, origin, licence or credit text sits beside any picture on the site,** including on the `/credits/` gallery. Origin and licence stay required in the registry, and appear only on the plain list linked from the end of `/credits/` (section 5.10).

**The design bar.** The site stays minimal, and the client's folk art should feel as if it had always been there.

- **Restraint.** Every element earns its place. When in doubt, remove it. No Ornaments, badges, gradients, shadows or effects beyond this spec.
- **Composition.** Pictures have room to breathe. Sizes follow section 5.11. Ring, Sticker and Plate sizes stay consistent across page kinds.
- **Rhythm.** Spacing comes from the tokens. Vertical rhythm around pictures is even. Cards in a row align.
- **Loading.** No layout shift, no pop-in against a mismatched background.
- **Interaction.** Quiet and immediate. Every link, card and button has clear hover, focus-visible and active states, consistent across the site. The homepage paintings feel direct by mouse, touch and keyboard. Transitions are short, and absent under reduced motion.
- **Phones.** 360 px looks designed, not shrunk. Touch targets are at least 44 px.
- **Access and speed.** WCAG AA, forced colours, reduced motion, and the budgets in 6.9 and 6.10.

## 4. The inventory

The old site's WordPress media library holds **71 files** (`/wp-json/wp/v2/media`, checked 9 November 2026): 68 pictures and 3 fonts. WordPress also made resized copies, so the library serves **273 addresses**. Elementor adds 9 thumbnail addresses of its own, making **282 media rows** in all. FR-07 counts the 71. `src/config/old-site-urls.ts` knows only 18 of them today (52 addresses).

| Verdict | Count | Meaning |
|---|---|---|
| **KEEP** | 22 | Copied byte for byte into `art/masters/`, processed into `public/art/` and used (sections 5 and 6) |
| **REBUILD** | 4 | Redrawn as SVG by Opus: three borders and the Karma Yoga cycle |
| **HOLD** | 4 | Two Flickr galaxies and two copies of a temple photo. Not shipped unless their licence is confirmed |
| **ARCHIVE** | 13 | The team's own earlier work and duplicates. Downloaded and handed to the client, not shipped |
| **DROP** | 28 | Theme demo photos, stock pictures with no licence on record, an icon pack, abstract placeholders and fonts. Not shipped |

The full table, with each file's old address, size, family, where the old site showed it, verdict, new id and new file, is **Appendix A**. The same data, machine-readable, is **`scripts/art/originals.json`**: every script in this spec reads it. Its `kb` field holds the size WordPress reports, which fetch step 1 compares. Appendix A shows the real download where the two differ (498 and 515).

Every file, whatever its verdict, gets downloaded once (ticket 2). WordPress is switched off after launch, and this library is the only copy anyone knows of.

---

## 5. Where every picture goes

Sizes are CSS pixels. An **Interim picture** is a stand-in, used until the new picture is made in ticket 12. Interim pictures appear only at the head of a page (and on that page's share card) and on the five topic cards. They never appear on Concept, Questionnaire or Traditional text cards, which stay bare until they have their own picture. A page can ship with Interim pictures.

Every page head carries one picture, centred above its title, with these exceptions. The homepage hero's Plate sits beside the motto and heading. `/search/` shows its Sticker in the empty and no-results states only. `/proposals/`, `/questionnaires/[slug]/take/`, `/credits/` and `/credits/sources/` have no head picture.

### 5.1 Site-wide

| Place | Picture | Size | Notes |
|---|---|---|---|
| Header | none (the line lotus and wordmark stay) | — | The lotus-brain turns to mush below about 48 px, and the header lotus has its own tested motion (#166). Decision D2 |
| Footer, beside the wordmark | `emblem-ring` | 72 | Decorative (`alt=""`). The motto goes under it as real Devanagari text, as it was under the old logo |
| Share cards (`opengraph-image`) | The page's head picture from `artFor`: its Sticker, Pothi, Plate or Interim picture. A take page uses its Questionnaire's. The homepage, `/proposals/`, `/credits/` and `/credits/sources/` use the Emblem | 320 | Right-hand third of the 1200 × 630 card, x 800 to 1120 (6.7). Ticket 10 |
| Home-screen icon (`apple-icon.png`) | unchanged | — | |
| Favicon (`icon.svg`) | unchanged | — | The line lotus stays legible at 16 px |

### 5.2 Homepage

From 64rem the homepage's Folio and its sections widen to 72rem, on the homepage only.

| Section | Picture | Size | Notes |
|---|---|---|---|
| Hero Folio | **Plate viewer**: `plate-jeweller`, `plate-sculptor`, `plate-farmers`, `plate-jeweller-woman`, `plate-painter-bowl`, `plate-painter-birds`, `plate-karma-yoga`, in that order. The first three are the old carousel's own order | 360 from 64rem; 168 below | From 64rem the Folio splits into two columns, the Plate on the left as a Medallion and the motto and heading on the right, as on the old site, so the main button shows without scrolling. Below 64rem a small Medallion sits above the motto, so the heading stays on the first screen at 360 × 740. One Plate shows at a time. The visitor moves on with buttons; it never moves on its own (6.5, 6.11) |
| What's on your mind? | `sticker-mind-dome` beside the heading | 56 | Decorative |
| Explore by topic | Each topic's Sticker on its card (5.4) | 64 | In its own row above the title, with the topic's numeral to its right. Decorative. The five topics fit one row |
| Start with these | Each featured Concept's Plate, as a Medallion (5.5) | 72 | In its own row above the title, with the Devanagari to its right. Decorative. The three featured cards fit one row. Until a Concept has its own Plate, its card shows no picture |
| How it works | none | — | |
| Who's behind this | `emblem-ring` | 120 | Beside the text from 48rem, above it below. `alt` from Appendix B |
| Before the closing line | `FolkBorder variant="dot-line"` | full width × 12 | Replaces nothing; the `OrnamentRule`s between sections stay |

**Laying out the hero and the cards:**

- The two-column hero is CSS grid on the Folio itself, with explicit `grid-column` on each child. Add no wrapper element: the `h1` must stay a direct child of the Folio, because `tests/e2e/pages.spec.ts`, `tests/e2e/home.spec.ts` and `tests/e2e/drawings.ts` find the Folio that way.
- Card pictures get their own row above the title, not the top-right corner, where they cover the Devanagari and the status badge. The grid that works on a Concept card: `grid-template-areas: 'art deva' 'title title' 'gloss gloss' 'meta meta' 'summary summary' 'action action'`.

### 5.3 Section pages

A Sticker sits centred above the page's heading, at 112 px (88 px below 48rem). It is decorative, since the heading names the section.

| Page | Sticker | Interim picture |
|---|---|---|
| `/concepts/` (A–Z) | `sticker-cosmos` (the old Concepts card) | — |
| `/concepts/map/` | `sticker-cosmos` | — |
| `/texts/` | `sticker-book-ornate` (the old Tradition and Texts card) | — |
| `/questionnaires/` | `sticker-clipboard` (the old Applications card) | — |
| `/library/` | `sticker-library` (new) | `sticker-book-clasp` |
| `/library/textbooks/` | `sticker-book-clasp` | — |
| `/library/inspirational-books/` | `sticker-book-lotus` (new) | `sticker-book-clasp` |
| `/library/courses/` (Courses in India) | `sticker-gear` (the old Research card, which linked to Courses) | — |
| `/library/methods/` (Therapy approaches) | `sticker-mind-tools` (the old Techniques card, which linked to Methods) | — |
| `/library/references/` | `sticker-palm-leaf` (new) | `sticker-book-clasp` |
| `/start/` (behind its flag) | `sticker-cosmos` | — |
| `/search/` | `sticker-mind-dome`, in the empty and no-results states only | — |
| `/proposals/` | none | — |

### 5.4 Topic pages

| Topic | Sticker (card only, 64) | Frontispiece Plate (Medallion, 240) |
|---|---|---|
| Self and person | `sticker-self` (new). Interim picture: `sticker-cosmos` | `plate-sage-lights-mind` |
| Mind: states and obstacles | `sticker-mind-swirl` | `plate-sage-paints-mind` |
| Practice and progress | `sticker-meditation` | `plate-painter-bowl` |
| Values: yama and niyama | `sticker-values` (new). Interim picture: `sticker-book-ornate` | `plate-tree-of-mind` |
| Temperament (guṇa) | `sticker-gunas` (new). Interim picture: `sticker-gear`, so Cosmos does not appear twice in the topic row | `plate-farmers` |

A topic page shows its Frontispiece only, centred above the heading (200 px below 48rem). Its ring takes the topic's colour. The Sticker stays on the topic's card, wherever that card appears, including on `/concepts/`. The Frontispiece is decorative. A–Z entries carry no picture.

### 5.5 Concept pages and cards

- **Concept page:** the Concept's Medallion at 120 px (88 px below 48rem), centred above the title at every width. Decorative. The 88 px is set by `tests/e2e/concept.spec.ts`: at 390 px the first section sits at 1597 of its 1700 px limit, and a picture adds its height plus the title block's 12 px gap.
- **Concept card** (homepage, topic pages, Start here): its Medallion at 64 px (72 on the homepage's featured cards), in its own row above the title. Decorative.
- **A–Z index, the concept map, the "related Concepts" links on a Questionnaire page:** no picture on any entry or link. They stay clean indexes and plain links. The index and map pages keep their head Sticker (5.3).
- **Which:** each Concept gets its own Plate (`plate-<slug>`, section 7.8). Interim picture: its topic's Sticker, or that topic's Interim picture from 5.4 until the Sticker exists, at the same sizes (120 / 88), at the head of the Concept page only, never on the card.

### 5.6 Questionnaire pages and cards

- **Page:** a Medallion at 120 px (88 px below 48rem), centred above the title. Decorative.
- **Card:** its own Plate as a Medallion at 64 px, in its own row above the title, with the status badge to its right. Decorative. A card with no Plate of its own stays bare.
- **Which, at the page head:** the Questionnaire's own Plate if it has one, otherwise its first Concept's Plate, otherwise `sticker-clipboard` as the Interim picture.
- **Own Plates:** the KarmaYoga Scale gets `plate-karma-yoga`, the client's "Karmayoga Main image", which is made for it. The Dosha Survey's Plate waits until the Survey has a page (D11).
- **The KarmaYoga Scale page** also gets the rebuilt **Karma Yoga cycle** (6.6), in its purpose section under the heading "The cycle of action". The old homepage carried it beside this Questionnaire's theme. Placing it here is decision D9.

### 5.7 Traditional text pages

- **`/texts/` cards:** each text's Pothi at 72 px, in its own row above the title. Decorative. A text with no Pothi yet shows a bare card, never an Interim picture.
- **`/texts/[slug]/`:** its Pothi at 120 px, centred above the title. Decorative.
- **Which:** `pothi-<slug>` (new, section 7.8). Interim picture: `sticker-book-ornate`, at the page head only.

### 5.8 Library pages

Section Stickers only (5.3). Book covers from the Open Library stay on the later-phases list.

The old Courses page hot-linked five universities' logos from their own sites. They do not come over: they are trademarks, they were hot-linked, and Press lists courses as text.

### 5.9 Errors

| Page | Picture | Size |
|---|---|---|
| 404 | `plate-404` (new, shown as a Medallion). Interim picture: `emblem-mark` | 200 (160 below 48rem) |
| Error and global error | `emblem-mark` | 96 |

The 404 page asks `artFor` for its picture and shows a Medallion when it gets a Plate, or the decorative Emblem when it gets `emblem-mark`. The error pages show the Emblem directly.

### 5.10 Credits page (new)

`/credits/` is a gallery of every shipped picture, grouped by family. Each entry shows the picture at 160 px with its caption from Appendix B, where it has one, and nothing else: no origin, licence or credit text beside any picture. A "Picture credits" link goes in the footer, and the page's `h1` reads the same.

One quiet link at the end of `/credits/`, "Where these pictures come from", leads to **`/credits/sources/`**: a plain list built from the registry, with no pictures, giving every picture's name (its caption, or its alt text where it has none), origin and licence. The wording for the client's own pictures, "From the Care4Mind website", appears only on this list. A generated picture reads "Made with Recraft from the Care4Mind style, November 2026". A licensed picture gives its licence and credit line. Neither page links to a file under `/art/`. Both pages render `ReadingPage` and are registered in the route registry (6.12).

`/credits/` doubles as a gallery of the team's work, which the old site showed only three Plates of. `docs/later-phases.md` already planned a credits page.

### 5.11 Sizes at a glance

Only the homepage hero Plate sets `sizes`, because its displayed width changes at 64rem. Every other picture has a numeric `width` and no `sizes`, so `next/image` lists two files, 1× and 2×.

| Use | CSS px (wide / narrow) | Served widths (1× and 2×) | Shape |
|---|---|---|---|
| Hero Plate | 360 / 168 | 360, 720 (served as 750) / 168, 336 | circle |
| Topic Frontispiece | 240 / 200 | 240, 480 | circle |
| 404 picture | 200 / 160 | 200, 400 | circle |
| Concept or Questionnaire Medallion on its page | 120 / 88 | 120, 240 | circle |
| Pothi on its page | 120 | 120, 240 | Sticker |
| Section Sticker on its page | 112 / 88 | 112, 224 | Sticker |
| Sticker, Pothi or Medallion on a card | 64–72 | 64, 128, 72, 144 | Sticker / circle |
| Footer Emblem | 72 | 72, 144 | Emblem |
| Emblem in "Who's behind this" | 120 | 120, 240 | Emblem |
| Sticker beside "What's on your mind?" | 56 | 64, 112 (56 rounds up) | Sticker |
| Error-page Emblem | 96 | 112, 200 (both round up) | Emblem |
| Credits thumbnail | 160 | 160, 320 | as the picture |

## 6. How to build it

### 6.1 Files and folders

```text
art/
  masters/          committed. KEEP originals, byte for byte, under their new names
    emblem/  stickers/  plates/
  generated/        committed. Picked new pictures at full size, each with <id>.json (its provenance). `approved` in the registry says whether the client has approved one
  prompts.json      committed. One filled prompt per new picture (7.7, 7.8)
  styles.json       committed. The two Recraft style ids (7.3)
  inbox/            gitignored. Candidates from the image tool, waiting for review
  wp-export/        gitignored. The whole WordPress download, all 71 files, zipped for the client
public/art/         committed. What the site serves, made from art/masters and art/generated
  emblem/  stickers/  plates/
scripts/art/
  originals.json    this spec's companion: the 71 files and their verdicts
  fetch.mjs         downloads the 71 files and lists every old media address
  process.mjs       turns masters into the files in public/art (6.3)
  sheet.mjs         builds the contact sheet and its PDF for review (7.9)
art/cards/          committed. 320 px PNG and JPEG copies that share cards draw (6.7)
src/art/            the art registry (6.4). Imports content only through @/content
src/components/art/ Sticker, Medallion, MedallionRing, ArtFigure, PlateViewer, FolkBorder,
                    KarmaCycle: one folder with an index.ts, like components/library
src/components/Emblem/  Emblem, in its own folder (6.5)
```

- `public/art/` keeps stable addresses (`/art/stickers/cosmos.png`). Old media addresses redirect to them (6.8). A Pothi lives in `public/art/stickers/` as `pothi-<slug>.png`, since a Pothi is a Sticker.
- **A file under `public/art/` never changes in place.** A new version gets a new name (`plate-404-v2.jpg`) and a new registry id. That is what makes the long image cache in 6.7 safe.
- Add `art/inbox/` and `art/wp-export/` to `.gitignore`. Add `/art/` (anchored to the root, so `src/art/` and `scripts/art/` stay formatted) and `scripts/art/originals.json` to `.prettierignore`, because Prettier fails on the machine-written JSON there.
- Every script under `scripts/art/` starts with `// @ts-check` on its first line, as `tests/unit/scripts-typecheck.test.ts` requires.
- `sharp` processes the pictures. Add it as a direct, pinned devDependency (`0.35.5`, today only a transitive dependency of Next). Its prebuilt binaries need no install script.

### 6.2 Getting the originals (do this before WordPress goes)

`scripts/art/fetch.mjs` (run it as `pnpm art:fetch`) does four things:

1. **Checks the list.** It reads `https://care4mind.org/wp-json/wp/v2/media?per_page=100` (and page 2 if there is one) and compares it with `originals.json`. If a file was added, removed or changed size, it stops and says so.
2. **Downloads everything.** Every `source_url` goes into `art/wp-export/<yyyy>/<mm>/<file>`. It compares each download's byte size with the server's `Content-Length`, not with WordPress's reported `filesize`, which is wrong for ids 498 and 515. It checks each file's pixel size against the API.
3. **Copies the keepers.** Every KEEP file is copied, byte for byte, to `art/masters/<folder>/<new name>`, the folder and name taken from `newSrc` in `originals.json`.
4. **Lists every old address.** It prints every `source_url` and every `media_details.sizes[*].source_url` with its WordPress id: 273 addresses on 9 November 2026. With the 9 Elementor thumbnail addresses, that is 282 rows for the redirect inventory (6.8).

Then zip the year folders in `art/wp-export/` as `art/wp-export/care4mind-wordpress-media.zip` (gitignored with the folder) for Siddharth to hand to the client. It is the only full copy of their media library.

The script sends a plain `User-Agent` naming the project (not a personal email), waits 200 ms between downloads, and writes nothing outside `art/`.

### 6.3 Processing (`scripts/art/process.mjs`, run as `pnpm art`)

It is idempotent: it reads `art/masters/` and `art/generated/` and rewrites `public/art/` and `art/cards/`. Each family has its own recipe.

**Plates** (JPEG, 1024 × 1024): copy as they are, with no re-encoding. `next/image` makes the AVIF and WebP sizes. A square Plate in a square box has nowhere to move, so a Medallion simply centres it. All 11 of the client's Plates look right centred: faces and hands stay inside the circle.

**Stickers** (PNG with transparency):

1. Stop and report if the picture has no transparency. The source needs its background removed: Recraft's `remove_background`, or ask Siddharth.
2. Trim the fully transparent margin.
3. **Give it a die-cut edge if it has none.** `book-icon.png` (WordPress 505) has none, and some generated Stickers may not. To add one: dilate the alpha mask by 3% of the longer side, fill it with cream `#FFF8EC`, lay the art over it, and add a soft shadow (blur 1% of the side, offset down 0.6%, black at 18%).
4. Pad to a square with a 4% transparent margin, so Stickers line up in grids.
5. Resize down to 1024 × 1024 if larger. Never scale up: flag anything under 512 px (`Survey-1` is 481 × 602 and is fine at its largest uses, 320 px: the credits thumbnail at 2× and the share card).
6. Write a PNG to `public/art/stickers/<name>.png`.

**Emblem:**

- **`emblem-ring`** comes from `Logo-with-frame-4-and-text.png` (WordPress 604, 1024 × 1024, cream background). The ring is 740 × 723 px, not square, and the motto sits under it. Take only the rows above the motto (the non-background box is x 137 to 876, y 134 to 856). Flood-fill from the edges, clearing every connected pixel whose sum of absolute differences from the background `(249, 243, 231)` is under 60, then trim and pad to a square. The cream inside the ring stays, because it reads well on both paper and indigo. Write a PNG. Look at the result on both grounds before committing it.
- **`emblem-mark`** comes from `Logo-final-e1715691828178.png` (WordPress 498, already transparent). Trim it, pad it square and write a PNG.

**Generated pictures:** generated Stickers and Pothis follow the Sticker recipe. Generated Plates arrive as PNG and, unlike the client's Plates, are re-encoded: `sharp` resizes each to 1024 × 1024 if larger and writes a JPEG at quality 85 to `public/art/plates/<name>.jpg`. For a generated picture, `<name>` is its full id: `public/art/stickers/sticker-self.png`, `public/art/stickers/pothi-yoga-sutra.png`, `public/art/plates/plate-404.jpg`. Each picture's `art/generated/<id>.json` carries its provenance (7.9).

The script prints a table of every output file: its pixel size, its byte size and its family. The unit test in 6.12 checks the registry against those files.

### 6.4 The art registry (`src/art/`)

Pictures attach to content here, not in `src/content/data/`.

```ts
// src/art/types.ts
export type ArtFamily = 'emblem' | 'sticker' | 'plate'

export type ArtOrigin =
  /** The Care4Mind team's own picture, from the old site's media library. */
  | { kind: 'care4mind'; wpId: number; oldPath: string }
  /** Made for this site with an image tool, from the briefs in docs/images-and-icons.md. */
  | { kind: 'generated'; tool: string; model: string; style?: string; prompt: string; made: string }
  /** Someone else's picture under a licence that allows it, with the credit it asks for. */
  | { kind: 'licensed'; credit: string; source: string }

export interface ArtRecord {
  /** kebab-case and never reused: a new version gets a new id. */
  id: string
  family: ArtFamily
  /** A file under public/. */
  src: `/art/${string}`
  /** The file's own pixel size; the unit test checks them. */
  width: number
  height: number
  /** What the picture shows, for wherever it stands alone. At most 125 characters. */
  alt: string
  /** A Plate's visible caption. */
  caption?: string
  origin: ArtOrigin
  /** Shown only on /credits/sources/, never beside the picture. Required for every picture. */
  licence: string
  /** A generated picture stays false until the client approves it (section 3, rule 7), and while false renders only where the draftArt flag is on. The 22 kept pictures are true. */
  approved: boolean
}
```

- **`src/art/registry.ts`** holds every record, importing the two Emblem records from `src/art/emblem.ts`. It starts with the 22 KEEP pictures (Appendix B has their alt text and captions). They ship with `approved: true`, because they go in now (section 3, rule 4). Their `licence` reads "The client's own picture; reuse confirmation pending" until #25 is answered. Ticket 12 adds the generated ones.
- **`src/art/slots.ts`** lists the 32 new pictures from section 7.8, one slot per brief: its id, family and where it goes. A slot has no file and no record yet. It is the id a placement names before the picture exists.
- **`src/art/assign.ts`** says which picture goes where, exactly as in section 5:
  - `sectionArt`: concepts, map, texts, questionnaires, library, textbooks, inspirational-books, courses, methods, references, start, search and notFound (5.9).
  - `topicArt`: each topic's Sticker and Frontispiece Plate.
  - `conceptArt` and `workArt`: an id per slug, filled from the slots.
  - `questionnaireArt`: a partial map, holding only `karmayoga-scale` (`plate-karma-yoga`, a registry id) for now (5.6).
  - `heroPlates`: the Plate viewer's ids, in order.
  - Every value is typed as a registry or slot id, so a typo fails `pnpm typecheck`.
- **`src/art/index.ts`** is the one import, and is `server-only`:
  - `art(id)` returns a record.
  - `artFor(target)` always returns a record for a page head. It follows the Interim pictures in section 5. A Concept's Interim picture is its topic's Sticker, or that topic's Interim picture from 5.4 while the Sticker is absent. A Questionnaire uses its own Plate, then its first Concept's, then `sticker-clipboard`. A Traditional text's Interim picture is `sticker-book-ornate`. The 404 page's picture is `plate-404`, then `emblem-mark` as its Interim picture.
  - `ownArt(target)` returns a Concept's, Questionnaire's or Traditional text's own picture for its card, or `undefined`. It never returns an Interim picture.
  - A slot with no record counts as absent. A record with `approved: false` counts only while `features.draftArt` is on.
- **`src/art/emblem.ts`** holds the two Emblem records as plain data, which `registry.ts` imports, with no `server-only`, because the error pages are client components and `Emblem` has to work there. `PlateViewer` is a client component too: it imports the record type with `import type` and receives its records as props.
- **Add a flag `draftArt`** (`FEATURE_DRAFT_ART`) to `src/config/features.ts`, following its pattern, and to the three lists in `tests/unit/features.test.ts`. There is no `.env.example` to update. Off in production, on everywhere else. Branch previews are off in this repo (`vercel.json`), so drafts are seen in local runs and in the contact-sheet PDF, and production never shows a draft.

### 6.5 Components (`src/components/art/`)

`Emblem` alone lives in `src/components/Emblem/`, so the error pages, which are client components, import it without the art folder's index and the server-only members behind it.

Each one is a server component unless marked otherwise. Each uses `next/image` with explicit `width` and `height`, and no `sizes` (section 5.11). Only `PlateViewer` sets `sizes`, `(min-width: 64rem) 360px, 168px`, because its displayed width changes at 64rem. Everywhere else, a `sizes` value would make the page list about 24 file sizes per picture. A CSS module reads tokens from `globals.css`. New decorative colour tokens go in `globals.css` under the "Decorative only" comment: `--color-ring` (an alias of `--press-rule`) and `--color-sticker-shadow` (`color-mix(in srgb, var(--press-night) 18%, transparent)`, following `--color-scroll-shadow`), so `tests/unit/contrast.test.ts` passes. Never put a primitive `--press-*` colour in a module, and never set a module `color:` to `--color-surface-rule`. Every id inside an inline SVG comes from `useId`, so two pictures on a page never share one.

| Component | Props | Renders | Notes |
|---|---|---|---|
| `Emblem` | `variant: 'ring' \| 'mark'`, `size`, `decorative = true`, `firstScreen = false`, `className?` | the Emblem picture | `alt=""` when decorative (beside the wordmark), the record's alt otherwise. Reads `src/art/emblem.ts`, never `@/art` (6.4) |
| `Sticker` | `art`, `size`, `firstScreen = false` | the Sticker, aspect ratio from the record | Always decorative (the credits page shows Stickers through `ArtFigure`, with their alt). A soft drop-shadow (`filter: drop-shadow(...)` with `--color-sticker-shadow`). Lifts when its own card is hovered or focused (6.11). `pointer-events: none`, so it never steals a card's click. A card's Sticker is a direct child of its `<article>`, selected with `article:is(:hover, :has(:focus-visible)) > .sticker` (and `article:active > .sticker` for the press). The `>` matters: `ReadingPage`'s Folio is an `<article>` too, so a plain descendant selector would lift every Sticker on the page at once. A page-head Sticker sits inside `<header>`, so it stays still, and no other Sticker may be a direct child of an `<article>`. Don't select a `.card` class, because `tests/unit/css-module-classes.test.ts` requires each module's classes to be read by its markup. Don't add `data-paper` to `TopicCard` or `TextCard`: it remaps their link and focus colours, and `tests/e2e/pages.spec.ts` would then require corners on them. Below the first screen, a Sticker stands on the pale paper colour while loading, which its client part, `StickerImage`, takes away once the file has loaded: a Sticker is cut out, so it never covers the paper. The paper shows only where the script runs (`@media (scripting: enabled)`), since nothing else would take it away. A `firstScreen` Sticker has no paper: its file usually arrives before the script, so the paper would show on the loaded picture until React took it away, and for good if the script failed |
| `Medallion` | `art`, `size`, `topic?`, `decorative = true`, `firstScreen = false` | a circle: the Plate with `border-radius: 50%` and `object-fit: cover`, inside a `MedallionRing` | The ring takes `--topic` when `topic` is given, set as an inline `--topic: var(--color-topic-<slug>)`, otherwise `--color-ring`. Never add a `data-topic` attribute: a Concept card's `TopicChip` must stay the only one, because `tests/e2e/topics.spec.ts` finds it strictly. While loading, the circle shows the pale paper colour, which the opaque Plate covers |
| `MedallionRing` | `size`, `still?` | inline SVG, `aria-hidden`: an outer ring of small dots, an inner hairline ring, a small flower at the top between two leaves, and two laurel sprigs meeting at the bottom | The Emblem's frame, redrawn by Opus in 10–14 paths with `pathLength="1"`. When its `size` is below 96 it draws only the two rings. Strokes in `currentColor`, so forced colours work. `still` leaves out the scroll ink-in (6.11), and the homepage passes it to `PlateViewer` already `still` |
| `ArtFigure` | `art`, `shape: 'circle' \| 'square'` | `<figure>` with the picture and a `<figcaption>` holding the caption | Used on `/credits/` for every family, with the record's alt (Emblems, Stickers and Pothis with `shape: 'square'`). The `figcaption` renders only when the record has a caption |
| `PlateViewer` | `plates` (the fields it shows), `ring`, `className?` | the hero's figure (the Plate cropped to a circle inside a `MedallionRing`), caption and two buttons | **Client component**, under 3 KB gzipped, no carousel library. Details below |
| `FolkBorder` | `variant: 'dot-line' \| 'dot-band' \| 'rule-dots'` | inline SVG, `aria-hidden`, full width × 12 px, a repeating `<pattern>` with its id from `useId` | Redraws the three old borders (2.4) in token colours |
| `KarmaCycle` | none | the Karma Yoga cycle (6.6) | |

**PlateViewer, in detail:**

- **First paint:** the server renders the first Plate with `preload`, the replacement for `priority` in Next.js 16, and `fetchPriority="high"`, so the preload is asked for ahead of every other file. It is the homepage's LCP candidate from 64rem.
- **Controls:** under the Plate, two round buttons, "Previous painting" and "Next painting" (accessible names), at least 44 × 44 px, wrapping from the last Plate to the first. `components/glyphs` has only a right-pointing `ArrowGlyph`, so "Previous painting" flips it with CSS. They sit in a `role="group"` labelled "Paintings". The server renders this row at its full height, so nothing below it moves at first paint.
- **Caption:** "The jeweller · 1 of 7", in a `figcaption` marked `aria-live="polite"`. It announces the change only.
- **Changing Plates:** the new Plate fades in over the old in `--duration-move` with `--ease-out`. With reduced motion it swaps at once.
- **Loading:** the next and previous Plates' files are fetched when a button is hovered or focused (`getImageProps` gives the `srcSet`), never before.
- **It never moves on its own** (#166). No autoplay, no timer, no swipe-only control. A swipe may also work, but the buttons are always there.
- **Without JavaScript:** the first Plate and its caption show, and the buttons are not visible or usable. They stay `visibility: hidden` until `useHydrated` (`components/browser`) is true, which holds their row's height. Don't use `html[data-hydrated]`: nothing a visitor sees may depend on it.

### 6.6 The Karma Yoga cycle, rebuilt (`KarmaCycle`)

The old picture (`Karma-Yoga.png`, 1077 × 742) bakes its words into pixels. The rebuild is an inline SVG with real text. Appendix C transcribes it.

- **Wording:** keep the words exactly as the picture spells them (`Karmabija`, `Citta-shuddhi`, `Nischayam`…). They are old-site content. IAST spellings would be new words for the Research editor (#166), so leave them for a later change.
- **Layout:** five nodes around a circle, clockwise from the top right: Karmabija, Dharmabaddha Kama (Desire), Nischayam Resolve, Karma Action, and Karmaphala / Punya or Papa at the top left. "Karmabandha Mochana" sits in the middle. Five curved arrows join them, each labelled: Manonigraha, Buddhi, Svadharma, Phala-Tyaga and Citta-shuddhi. A small curved arrow from "Lokasamgraha" points into Karmaphala.
- **The strike-throughs carry meaning.** In the original, "Karmaphala", "Punya or Papa" and "Karmabija" are struck through: renounce the fruit, and the seed of further action is burnt. Draw each as a `<line>` over the word. Don't use `text-decoration`, which SVG renders unreliably. Say it in words in the text alternative.
- **Colours:** tokens only, added under "Decorative only" in `globals.css`. Arrows in `--press-turmeric-deep`, vermilion, rose, indigo-rule and umber, echoing the original's orange, pink, slate and brown (plain turmeric is only 1.36:1 on the paper, too faint for an arrow). Arrow labels in `--color-surface-link`. The centre in `--color-surface-muted`. Check every text colour against the paper in `src/styles/contrast.ts`.
- **Accessibility:**
  - A `<figure id="karma-cycle">` holds the SVG (`role="img"` with `aria-labelledby` pointing at its `<title>` and `<desc>`) and a visible caption.
  - Under it, a disclosure, "Read the cycle as a list", holds an ordered list of the steps, built from the same data as the SVG so the two never disagree.
- **Size:** 100% of the reading column, at most 720 px, with `viewBox="0 0 1080 740"`. On narrow screens the labels stay at least 15 px, the site's smallest text, so the viewBox is laid out with that in mind. Test it at 360 px.
- **Motion:** as the figure scrolls through view, each arrow draws in after the one before it, on a `view()` timeline like `OrnamentRule`, scrubbing both ways with the scroll. `stroke-dashoffset` appears only inside `@media (prefers-reduced-motion: no-preference)` and `@supports (animation-timeline: view())`; the default state is the finished drawing.
- **Where:** the KarmaYoga Scale page (D9). The old file's addresses redirect to `/questionnaires/karmayoga-scale/#karma-cycle`.

### 6.7 `next.config.ts`

```ts
images: {
  formats: ['image/avif', 'image/webp'],
  // Files under /art/ never change in place (6.1), so a long cache is safe.
  // Next.js 16's default is 4 hours.
  minimumCacheTTL: 2_678_400, // 31 days
  // The widths section 5.11 uses, so each picture is transformed at only a few sizes.
  // 720 is served by the 750 device size.
  imageSizes: [64, 72, 112, 120, 128, 144, 160, 168, 200, 224, 240, 320, 336, 360, 400, 480],
  // `qualities` stays at Next.js 16's default, [75].
},
```

- Share cards read files from disk at render time. Add `'./art/cards/**'` to the `'/**/opengraph-image*'` entry of `outputFileTracingIncludes`, next to the fonts already there.
- Share cards are drawn by Satori, whose picture support is narrower than a browser's. Give it PNG and JPEG only: `pnpm art` writes 320 px copies of each picture to `art/cards/` (committed: about 160 to 210 KB for a Sticker or Emblem PNG, 30 to 50 KB for a Plate JPEG). `src/lib/share-card.tsx` gets a slot for the picture beside its text, in the right-hand third at x 800 to 1120 (320 px, inside the card's 80 px padding).

### 6.8 Old media addresses (FR-07)

Every old media address answers with one 301, to a page or a file that answers 200.

1. **Extend the inventory.** In `src/config/old-site-urls.ts`, give `OldMedia` a `wpId: number`. Add every address `pnpm art:fetch` lists (273), and keep the 9 Elementor thumbnail addresses already there, matching each to its WordPress id by file name: 282 media rows. `shownOn` keeps what it says today, and is `[]` for files no page showed. Update the doc comment's numbers: "every uploaded file, all 71". The redirect table grows from 140 rows to 370.
2. **Map surviving pictures to their new files.** Add `src/config/old-media-art.ts`, exporting `artFileOf`: a plain-data map from WordPress id to new file, for example `{ 464: '/art/plates/jeweller.jpg', … }`. It has no `@/` imports, because `next.config.ts` loads `redirects.ts` through a loader that can't follow them. The Emblem's three old copies (643, 624, 614) also map to `/art/emblem/emblem-ring.png`. `Karma-Yoga.png` (38) maps to `/questionnaires/karmayoga-scale/#karma-cycle`, a page rather than a file.
3. **Use the map in `src/config/redirects.ts`:**
   ```ts
   const media = oldMedia.map(({ address, wpId, shownOn }) => ({
     source: address,
     destination: artFileOf[wpId] ?? newPageOf(shownOn[0] ?? '/'),
   }))
   ```
   Every other file, the ones not in `artFileOf`, keeps leading to the page that showed it, or to the homepage.
4. **Teach `tests/unit/redirects.test.ts`** that a destination may also be a file under `public/` that exists. Update its counts and rules: 52 media addresses become 282, the address pattern allows `.webp`, `.ttf` and `.otf`, `shownOn` may be empty, the check that each address goes where its page now leads expects `artFileOf[wpId]` when present and otherwise `newPageOf(shownOn[0] ?? '/')`, as `redirects.ts` does, and the "every destination is a route or an anchor" check accepts those files and, as one exact allowance, wpId 38's destination `/questionnaires/karmayoga-scale/#karma-cycle`, an anchor `hrefFor` never makes (`tests/e2e/redirects.spec.ts` already checks that the id is on the page). Add a check that every KEEP id in `scripts/art/originals.json` has an entry in the map, and that every entry's file is a registry record's `src`, leaving out wpId 38, whose entry is a page.

### 6.9 Accessibility (NFR-01)

- **Decorative pictures** (Stickers, Pothis, Plates shown as Medallions and the footer Emblem) take `alt=""`. They always sit beside text that names the thing.
- **Pictures that carry meaning** take the record's alt: the hero Plate (with its visible caption), `/credits/` entries, the Emblem in "Who's behind this" and the Karma cycle (6.6).
- **No picture is the only way** to reach or understand anything. No text sits on a picture.
- **Alt text is plain English,** without Sanskrit diacritics: an `alt` can't carry a `lang`.
- **Pictures don't change the focus order.** Cards keep their own focus ring, and pictures inside them never take focus or clicks.
- **Forced colours:** rings, borders and the cycle draw in `currentColor`. The viewer's buttons keep visible borders. Add one page of each changed kind to `tests/e2e/forced-colors.spec.ts`, which today covers few pages: the homepage, a Concept page, a topic page, `/credits/`, `/questionnaires/karmayoga-scale/` (its Medallion and the cycle), a section page, a Traditional text page and the 404.
- **Reduced motion:** no lift, no crossfade, no ink-in (6.11). `tests/e2e/motion.spec.ts` still passes.
- **The viewer's buttons** are at least 44 × 44 px (WCAG 2.5.8 asks for 24).
- **Every changed page** passes `expectNoAxeViolations`.

### 6.10 Performance budget (NFR-02)

| What | Budget |
|---|---|
| Layout shift from pictures and the Plate viewer | none: every `<Image>` has its size reserved, and the viewer's button row holds its height from first paint |
| Preloaded pictures | at most one a page, the picture at its head. The homepage's is its first hero Plate, through Next's `preload`, at high priority. Elsewhere React adds it: while server rendering, React 19 preloads every `<img>` that isn't lazy, and the head picture is the only one |
| Pictures in the first screen | the picture at each page's head (`HeadPicture`, `SectionSticker`, a Traditional text's Pothi, a topic's Frontispiece, the 404's and the error pages') takes `firstScreen`: `loading="eager"` and `fetchPriority="high"`, never Next's `preload`, so it is requested before the first text paints. Everything else lazy-loads (the default) |
| Hero Plate | ≤ 120 KB at 750 px (AVIF, measured 74 to 118 KB across the seven) |
| Medallion at 120 px | ≤ 25 KB at 2× |
| Sticker at 112 px | ≤ 20 KB at 2× |
| Homepage, mobile, first screen | ≤ 120 KB of pictures |
| Homepage, whole page | ≤ 350 KB of pictures |
| Plate viewer script | ≤ 3 KB gzipped |
| Lighthouse (`lighthouserc.cjs`, unchanged) | LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms and accessibility ≥ 0.95 on `/`, `/concepts/vikshepa/` and `/questionnaires/karmayoga-scale/` |

**What it costs on Vercel:** about 60 pictures × 3 widths × 2 formats is roughly 400 image transformations per 31-day cache period. Hobby includes 5,000 a month. Pro charges $0.05 per 1,000. So it comes to a few cents a month at most.

### 6.11 Motion

Everything here sits inside `@media (prefers-reduced-motion: no-preference)` and is started by the visitor (#166). The default state is always finished: a ring or arrow is fully drawn unless a guarded rule says otherwise. `stroke-dashoffset` appears only inside those guards, so `tests/e2e/motion.spec.ts` and `tests/e2e/smoke.spec.ts` keep seeing finished drawings.

| What | Trigger | Motion |
|---|---|---|
| Sticker on a card | the card is hovered or focused | `translateY(-3px) rotate(-3deg)` in `--duration-quick` with `--ease-out`, like a Sticker lifting at a corner. Back the same way |
| Sticker on a card | the card is pressed | `scale(0.97)`, alongside the card's existing ink spread |
| Medallion ring | scrolls through view | the rings ink in with the scroll (stroke-dashoffset 1 → 0 on a `view()` timeline) and scrub back if the visitor scrolls back, like `OrnamentRule`, which is `view()` on `scaleX` |
| Plate viewer | a button is pressed | the new Plate fades in over `--duration-move` |
| Karma cycle | scrolls through view | the arrows draw in one after another, scrubbing both ways (6.6) |
| Hero Plate on load | — | **nothing.** It is the LCP element and must paint at once. Its ring stays fully drawn, with no scroll ink-in |

### 6.12 Tests

**Change** (in the same PR as the change that breaks them, saying why in the PR description):

- `tests/e2e/home.spec.ts`.
  - The opening-folio test asserts that `main` has no element with the role `img`. A picture with `alt=""` has no such role, so the decorative Stickers and Plates shown as Medallions don't break it. The hero Plate and the Emblem in "Who's behind this" do, because they have real alt text. Replace that line with three checks: exactly two `img` roles in `main`, the hero Plate (with a visible caption) and that Emblem; every other `<img>` in `main` has `alt=""`; every `<img>` has `width` and `height`.
  - Point its strict `svg` locators at the Fleuron itself, `svg[data-lotus]`. Keep the Fleuron assertions.
  - "Is never the largest contentful paint" keeps `inDrawing` false, and now allows text or the first Plate as the largest element.
- `tests/e2e/pages.spec.ts`. The 404 test asserts no `img` role (still true: the 404 picture is decorative) and exactly one `svg` in `main` (no longer true: the Medallion ring is an `svg` too). Point that locator at `svg[data-lotus]`.
- `tests/e2e/library.spec.ts` ("No images: nothing from the current site but its words") and the "wait for a later phase" comment in `src/app/library/page.tsx`: update both, since the Library now shows its Sticker.
- `tests/e2e/share-card.spec.ts`: strengthen it to check the card has a picture in its right-hand third (x 800 to 1120), not only that the PNG has the right size. `/credits/` and `/credits/sources/` need their own `opengraph-image` file, because the test visits one page of each kind. Ticket 9 adds both with the existing share card, and ticket 10 adds the picture to them.
- `tests/unit/redirects.test.ts`, as in 6.8.
- `tests/unit/features.test.ts`, for `draftArt`, as in 6.4.
- The route registry, for `/credits/` and `/credits/sources/`, two fixed pages of two new kinds, `credits` and `credits-sources`, titled "Picture credits" and "Where these pictures come from": `FixedPage` and `RouteKind` in `src/content/types.ts`, `src/content/views/href.ts`, `src/content/derive/routes.ts`, `src/content/derive/describe.ts`, the routes list in `tests/unit/content-derive.test.ts` and the sorted list of sample kinds in `tests/unit/content-sweep.test.ts`. `ABOUT` in `describe.ts` gets one sentence per kind, because a page with no description fails `tests/unit/site.test.ts` and `tests/e2e/share-card.spec.ts`:
  - `credits`: "Every picture on Care4Mind, grouped by family, with its caption."
  - `credits-sources`: "Where each picture on Care4Mind came from, and its licence."
- `tests/unit/pointers.test.ts`: this spec names files that don't exist yet, so exclude `docs/images-and-icons.md` with a one-line reason.
- **Never** delete or weaken an accessibility, contrast, motion or performance assertion to make room for a picture. Change the picture instead.
- The header tests (`logo.spec.ts`, `smoke.spec.ts`) stay as they are, because the header doesn't change (D2). The footer test only forbids line art inside the wordmark and the lotus beside it, so the Emblem picture next to the wordmark passes. Its "Picture credits" label must equal the page's `h1` (`tests/e2e/nav.spec.ts`).

**Add:**

- **`tests/unit/art.test.ts`, the registry's integrity:**
  - ids are unique and kebab-case, and every `src` exists under `public/`;
  - `width` and `height` equal the file's real pixels;
  - every `alt` is non-empty and at most 125 characters;
  - every origin is complete: a `generated` one has its tool, model, prompt and date, and a `licensed` one has its credit and source; every record has a non-empty `licence`;
  - every id in `assign.ts` exists in the registry or the slots;
  - every topic, section and Traditional text resolves through `artFor`, and so does every Concept and Questionnaire;
  - `ownArt` never returns an Interim picture;
  - the 22 KEEP records have `approved: true`;
  - the 32 slots each have a brief in `art/prompts.json` (ticket 11 adds this check, with the file);
  - no file under `public/art/` lacks a record;
  - each file is under 1.5 MB.
- **`tests/e2e/art.spec.ts`:**
  - on `/`, a topic page, a Concept page, a Questionnaire page and a Traditional text page, every picture loads (`naturalWidth > 0`) and causes no layout shift;
  - the Plate viewer works by keyboard alone, its caption announces the change, and after 10 s with no input the same Plate still shows;
  - with reduced motion, a hovered card's Sticker has no transform;
  - `/credits/` shows no origin, licence or credit text beside a picture, and its last link leads to `/credits/sources/`;
  - axe passes.

No comment or test title may cite an issue or ticket number (`tests/unit/comment-codes.test.ts`).

### 6.13 Docs

- **`docs/later-phases.md`:** remove the "Images in one consistent look… duotone…" bullet and point to this file. Keep the Open Library book covers bullet.
- **`docs/adr/0005-the-clients-pictures.md`:** the decision to keep the client's folk art as it is (no duotone), with stable files under `public/art/`, `next/image`, the art registry and the image tool. Say what was given up: one uniform treatment, and with it the duotone's calm.
- **`tests/unit/pointers.test.ts`,** as in 6.12.

## 7. Making new pictures

### 7.1 What Opus draws itself, and what needs an image model

| Opus draws it as SVG in code | It needs an image model |
|---|---|
| `MedallionRing`, the Emblem's frame redrawn | Folk paintings with people (Plates) |
| `FolkBorder`, the three old borders | Dense ornamental Stickers like the client's |
| `KarmaCycle` | Pothis with painted motifs |
| Any geometric Ornament: rules, dot rows, frames | |

Hand-written SVG versions of the painterly pictures would look like clip-art next to the client's set and break the family. For those, Opus does everything except the drawing:

1. writes each prompt from its brief (7.8);
2. calls the image tool through MCP;
3. saves the candidates and builds the contact sheet;
4. processes the picked picture, registers it and places it.

### 7.2 Which image tool

Recraft is the tool (D4). The other rows record what it was compared with, and none of them is used unless Siddharth says so.

| Tool | Best at | How Claude Code uses it | Cost | Who owns the pictures |
|---|---|---|---|---|
| **Recraft (the choice)** | Stickers and Pothis. Learns a reusable custom style from 1–10 reference pictures. Can also give SVG, remove backgrounds and upscale | The official hosted MCP server. Signs in with OAuth, so there is no API key to manage | Basic plan, Pay monthly, about US$12 a month plus any tax (1,000 credits a month); one month should cover this spec. The US$10 price needs a US$120 annual payment. **Not the free plan**: its pictures are public, owned by Recraft and not for commercial use | On a paid plan, the account holder owns them with commercial rights, and keeps them after cancelling |
| Google Gemini: Nano Banana 2 (`gemini-3.1-flash-image`) or Nano Banana Pro (`gemini-3-pro-image`) | Painterly pictures with people. Takes up to 14 reference pictures | A community MCP server, such as Google's `gemini-cli-extensions/nanobanana`, with a `GEMINI_API_KEY` | About US$0.07 per 1K picture (Pro about US$0.13) | Per Google's API terms |
| OpenAI: GPT Image 2 or 2.5 | Pictures and edits from reference pictures | A community MCP server (for example `gpt-image-2-mcp`), with an `OPENAI_API_KEY` | About US$0.006 (low quality) to US$0.21 (high) per 1024 × 1024 picture | OpenAI's terms assign the output to you |
| No tool | Anything | Siddharth pastes the prompts from 7.7–7.8 into ChatGPT or Gemini, attaches the reference pictures, and saves the results into `art/inbox/<id>/` | Whatever he already pays for | Per that product's terms |

- **Recraft for everything:** Stickers, Pothis and Plates. If a Plate is still short of the client's after three rounds, Siddharth decides whether to try again or drop it.
- **The budget:** about 32 pictures × 4 candidates is roughly 130–150 generations. At 2 credits a generation on Recraft V4.1 (10 on V4.1 Pro), that fits inside one month's 1,000 credits. So the cost is one month of Basic on Pay monthly: about **US$12 plus any tax**.
- **The account is Siddharth's own,** for one month. Cancel before it renews, even if the client hasn't answered: paid-plan rights survive cancellation. Rights pass to the client at handover, along with Recraft's condition that the pictures can't be used to train AI.
- **Never put an API key in the repo.** Add keyed servers with `--scope user`.

### 7.3 Setup

On the machine that runs Claude Code:

```bash
# Recraft, official, OAuth
claude mcp add --transport http --scope user recraft https://mcp.recraft.ai/mcp
# then in Claude Code run /mcp, pick recraft and sign in with the Recraft account
```

- **In Claude Code on the web,** add `img.recraft.ai` to the environment's allowed network domains, or downloads fail.
- **Recraft's result links expire after about 24 hours.** Save each candidate to `art/inbox/` as soon as it arrives.
- **Before any client picture goes to Recraft or another image tool,** the client must have answered section 11, question 1. Uploading a picture means promising you have the right to. `create_style` uploads the 12 listed below, so without that answer ticket 12 stops here.
- **Make the two styles once** with `create_style`, and record their ids in `art/styles.json` (committed; ids are not secrets):
  - **`c4m-sticker`**, from Cosmos-icon, Book-icon-2, Meditation-icon, Gear-Icon, Survey-1 and Psychology-Techniques-icon-4.
  - **`c4m-plate`**, from Jewellry-making-2, Sculptor-3, Indian-Farmer, Intricate-painting-1, Intricate-painting-2 and Karmayoga-Main-image.
- **Before writing any Recraft call,** read `https://www.recraft.ai/docs/api-reference/agents.md` for the current models and parameters. A custom style is bound to the model it was made with.

### 7.4 Style rules: Stickers

- **One symbol**, front-on and close to symmetrical, centred, filling about 85% of the canvas.
- **Outline:** bold and even, near-black (about `#1F1A1A`), roughly 2.5% of the canvas width. Inner lines about half that.
- **Fill:** every region carries folk ornament in the Madhubani and Gond manner: dots and dot rows, paisleys, lotus petals, scallops, leaf sprigs and small rosettes. No empty areas, no plain gradients.
- **Palette** (approximate, for prompts): coral pink `#EE7F73`, dusty rose `#F3B5AA`, teal `#4FB3AC`, deep teal `#23686A`, marigold `#F1B53F`, orange `#EE7B35`, cream `#FBF1DE`, with touches of periwinkle `#8E9BD6`. Black grounds only for night skies.
- **Edge:** a thick, even, cream die-cut edge, about 4% of the width, following the outer silhouette, with a faint soft shadow under it.
- **Light:** flat. No 3D, no glossy highlights, no photo textures.
- **Never** text, letters, numerals, script-like squiggles, logos or watermarks.

### 7.5 Style rules: Plates

- **Subject:** Indian people absorbed in calm, skilled, everyday work or practice, shown with dignity. One person or a small group, in mid-ground, often in three-quarter view, seated or kneeling, surrounded by the tools of their work.
- **Style:** Indian folk painting. Madhubani double outlines and line-fill hatching, Pattachitra and Kalighat bold black contours and flat colour, Kerala-mural warm ochres and ornate canopies, Gond dot-and-dash fills. Patterned trees, birds, flowers, mandala rosettes and swirling clouds in the background, sometimes a decorative strip along the bottom.
- **Palette:** jewel tones on cream: vermilion, marigold yellow, peacock blue and teal, leaf green, maroon and turmeric, with black contours.
- **Format:** square, 1:1. **Everything that matters sits inside the central circle,** because Medallions are cropped to it. The corners hold only background pattern.
- **People:** traditional and everyday Indian dress, varied across the set by region, age and gender. The client's existing Plates are mostly men, so new ones should lean the other way.
- **Mood:** calm, hopeful, concentrated. No distress, no clinical settings, no therapy-room imagery (the brief puts diagnosis and treatment out of scope).
- **No deities** unless a brief asks for one.
- **Never** text, letters, numerals, signatures or watermarks.

### 7.6 Style rules: Pothis

A Pothi is a Sticker (7.4) of a **palm-leaf manuscript:** stacked leaves between two painted wooden boards, tied with a red cord, seen from the front at a slight angle. Each text's symbol is painted on the top board. The six Pothis keep the same shape, angle and cord, so they read as one set.

### 7.7 Prompt templates

Fill `{…}` from the briefs in 7.8. With Recraft, pass the matching custom style. With other tools, attach the six reference pictures of the family.

**Sticker:**

```text
Die-cut sticker illustration of {MOTIF}. Indian folk-art ornament style, Madhubani and Gond
influence: every shape filled with fine pattern (dots, paisleys, lotus petals, scallops, leaf
sprigs). Bold, even, near-black outlines; flat colour, no gradients; palette of coral pink,
dusty rose, teal, deep teal, marigold and cream with small touches of orange and periwinkle.
Front-on, centred, nearly symmetrical, filling about 85% of the frame. A thick, even,
cream die-cut border follows the outer silhouette, with a faint soft shadow beneath.
Plain transparent background. No text, letters, numbers, logos or watermark.
```

**Plate:**

```text
Square Indian folk painting of {SUBJECT}. Style blending Madhubani, Pattachitra and Kerala
mural traditions: bold black contour lines, flat saturated colours (vermilion, marigold,
peacock blue, leaf green, maroon, turmeric) on a cream ground, patterned fills in clothing,
trees and sky, decorative birds, flowers and mandala rosettes. Calm, absorbed mood; a
dignified, respectful depiction of Indian people in everyday dress. Keep the whole subject
inside the central circle of the square, which will be cropped to a circle; fill the corners
with simple background pattern only. No text, letters, numbers, signature or watermark.
```

**Pothi:**

```text
Die-cut sticker of a palm-leaf manuscript bundle (pothi), seen from the front at a slight
angle: stacked palm leaves between two painted wooden boards, tied with a red cord. On the
top board, painted in Indian folk style: {SYMBOL}. [Then the sticker template's style
sentences, from "Bold, even, near-black outlines" to the end.]
```

**Avoid** (as a negative prompt where the tool has one, otherwise as a closing sentence): *photorealism, 3D render, glossy plastic, gradients, Western cartoon or anime style, text, pseudo-letters, Devanagari or Latin script, extra fingers, distorted faces, caricature, watermark, signature.*

### 7.8 The new pictures

Each row is one brief. The Plates here are shown as Medallions. There are 32 new pictures: 6 Stickers, 6 Pothis and 20 Plates. Every row becomes a slot in `src/art/slots.ts` (6.4).

**Stickers (6):**

| id | For | The picture |
|---|---|---|
| `sticker-self` | Topic: Self and person | A seated figure in meditation whose body is a window onto a starry indigo night, a small golden flame glowing at the heart, resting on an eight-petal coral lotus. The client's atman-and-brahman theme, in their Sticker style |
| `sticker-values` | Topic: Values | A brass oil lamp (diya) on a lotus base holding five small flames, under a symmetrical arch of teal and coral folk ornament |
| `sticker-gunas` | Topic: Temperament (guṇa) | Three strands, cream, vermilion and deep indigo, braided into a closed ring around a small three-petal flower, each strand filled with dot-work (guṇa also means strand) |
| `sticker-library` | `/library/` | A low carved wooden book-stand holding three stacked books and a palm-leaf manuscript tied with red string |
| `sticker-book-lotus` | Inspirational books | An open book with a pink lotus blooming up out of its pages, short rays around the flower |
| `sticker-palm-leaf` | References | A palm-leaf manuscript between two painted wooden boards, tied with a cord ending in a teal tassel, one leaf slightly fanned out |

**Pothis (6):**

| id | Text | Symbol on the top board |
|---|---|---|
| `pothi-bhagavad-gita` | Bhagavad Gītā | A chariot wheel with a conch shell at its hub |
| `pothi-dhammapada` | Dhammapada | A single Bodhi (peepal) leaf with fine veins |
| `pothi-sadhana-panchakam` | Sādhana Pañcakam | Five small oil lamps in a row |
| `pothi-sushruta-samhita` | Suśruta Saṃhitā | Healing herbs and leaves around a stone mortar and pestle |
| `pothi-vedanta-sara` | Vedānta Sāra | An ocean wave curling around a single drop of water |
| `pothi-yoga-sutra` | Yoga Sūtra | A seated yogi inside an eight-petal lotus |

**Plates for Concepts (19):**

| id | Concept | The picture |
|---|---|---|
| `plate-ahimsa` | Ahiṃsā | A woman kneels by a lotus pond with open palms; a deer drinks from the pond and two sparrows eat grain from her hands |
| `plate-asteya` | Asteya | At a village fruit stall, the seller hands a dropped coin purse back to its owner; baskets of mangoes and bananas all round |
| `plate-atma-bandhu` | Ātma-bandhu | A young man kneels at a still river and reaches toward his reflection, which reaches back: two hands about to meet at the water's surface |
| `plate-atman` | Ātman | A seated meditating figure whose body holds a starry night, a small golden flame at the heart, inside a ring of lotus petals |
| `plate-brahma-vihara` | Brahmavihāra | Four friends in a circle round a lotus pond: one shares food, one comforts another, one laughs with joy, one sits calmly with closed eyes |
| `plate-brahmacharya` | Brahmacarya | A young student in white sits upright on a mat, calmly holding the reins of five small horses that stand quietly before him |
| `plate-chittabhumi` | Citta-bhūmi | Five lotuses in a row on a pond, from a closed bud on a drooping stem to a fully open flower standing still, reflected in calm water |
| `plate-five-steps-of-perfection` | Five steps of perfection | Five stepping stones rise across a stream toward a blooming lotus; a pilgrim stands on the middle stone |
| `plate-jagat` | Jagat | The cosmos in Gond dot-work: a spiral galaxy, sun, moon and planets, with a tiny seated figure on a hilltop watching. Replaces the old site's Flickr galaxy |
| `plate-jiva` | Jīva | A great banyan tree sheltering a child, an old woman, a cow, a dog and birds, drawn in Gond dots and dashes |
| `plate-karta` | Kartā | A potter at his wheel, calm and absorbed, shaping a pot; finished pots line a shelf behind him |
| `plate-momentum-of-spiritual-practice` | Momentum of spiritual practice | A woman draws water from a stepwell, pot after pot; beside her a sapling has grown into a young tree |
| `plate-panch-klesha` | Pañca kleśa | Five dark clouds drift across a bright sun; a figure on a hill watches them pass |
| `plate-satya` | Satya | A girl holds up a polished brass mirror that catches the sun; a lit oil lamp stands beside her |
| `plate-spiritual-practitioner` | Spiritual practitioner | A pilgrim with a staff and a cloth bag walks a winding road toward a hilltop temple at sunrise |
| `plate-sthitaprajna` | Sthitaprajña | A sage sits perfectly still on a rock among waves; a tortoise beside him draws in its head and legs |
| `plate-triguna` | Triguṇa | Three people in one picture: one reads calmly by a lamp (in white), one runs carrying a load (in red), one sleeps under a tree (in dark blue) |
| `plate-upa-vikshepa` | Upa-vikṣepa | A weaver at a handloom whose threads have tangled; gusts of wind swirl round her as her hands pause |
| `plate-vikshepa` | Vikṣepa | A monkey leaps from branch to branch in a tree while a meditator sits beneath, trying to stay still |

**Plate for a page (1):**

| id | For | The picture |
|---|---|---|
| `plate-404` | 404 page | A traveller stands at a fork in a forest path holding a blank palm-leaf map; an owl on a branch points one wing back toward a lit village |

The Dosha Survey's Plate (a stone mortar and pestle with herbs, swirling wind on the left, a flame on the right, flowing water over earth below) waits until the Survey has a page (D11), so it isn't among the 32.

The pictures draw on images the Concepts' own pages and texts use, such as the tortoise of Bhagavad Gītā 2.58 for Sthitaprajña, and on common Indian imagery, such as the restless monkey mind. A picture makes no claim. The client approves each one from the contact-sheet PDF (rule 7). Pothis, which stand for a named text, and any caption that names a text or verse go to the Research editor when one is named.

### 7.9 Workflow, from brief to page

Ticket 11 builds the contact sheet and fills `art/prompts.json` from the briefs in 7.8, so everything is ready before any picture is made. Ticket 12 then runs these steps.

1. **Style test.** With Recraft connected and the two styles made (7.3), make one test Sticker and one test Plate. Siddharth compares them with the client's own on the contact sheet and says whether to go on.
2. **Generate.** First apply the client's answer to section 11, question 5 to the briefs in 7.8 and to `art/prompts.json`. Then make four candidates per brief with the family's style. Save them as `art/inbox/<id>/1.png` … `4.png`.
3. **Review.** `pnpm art:sheet` writes `art/inbox/sheet.html`, which shows each brief with its candidates:
   - at the sizes they'll be used (64, 120 and 240 px);
   - on the paper and on the indigo ground;
   - Plates behind their circle mask;
   - next to two of the client's own pictures from the same family.

   Siddharth picks one, or asks for another round. For the client, the script also prints the sheet to `art/inbox/sheet.pdf` with Playwright, which the repo already has.
4. **Keep the pick.** Move it to `art/generated/<id>.png` and write `art/generated/<id>.json`: `{ tool, model, style, prompt, made, candidates, picked }`.
5. **Process and register.** Run `pnpm art`, then add the record to `src/art/registry.ts` with `approved: false` and its `licence`. The slot now has a record, so it shows in local runs only (the `draftArt` flag).
6. **Approve.** When the client approves it from the PDF, set `approved: true` in a one-line PR. Its Interim picture is gone from that page, and the picture ships.

### 7.10 Review checklist (every new picture)

- [ ] **Family:** same outline weight, pattern density, palette and flat light as the references. On the contact sheet it looks like a sibling of the client's pictures.
- [ ] **Brief:** it shows the brief's idea and nothing that fights it.
- [ ] **No writing:** no text, letters, numerals, fake script, signature or watermark. Check the corners.
- [ ] **Bodies:** hands have five fingers; faces, feet and animals' legs are whole.
- [ ] **Plates:** everything important is inside the circle.
- [ ] **Stickers and Pothis:** clean transparency, an even cream edge, no grey halo.
- [ ] **Respect:** dress, tools and settings are plausible and respectful. No deity unless asked. No caste or regional caricature.
- [ ] **The set:** across all the new pictures, a balance of women and men, ages and regions.
- [ ] **Mood:** calm and hopeful. No distress, nothing clinical.
- [ ] **Technical:** at least 1024 px, sRGB, no visible artefacts.

### 7.11 Adding a picture later

An editor writes a one-line brief. Someone with the image tool makes four candidates. Siddharth picks one, the client approves it, and a developer runs `pnpm art` and adds the record.

## 8. Order of work

Make each ticket a sub-issue labelled `ready-for-agent`, except ticket 12, labelled `ready-for-human`. Each lands as one PR with base `images`, by `gh pr merge --squash`, except ticket 12, which lands as several: the pictures, then the one-line approval PRs of 7.9. Its PRs have base `images` while the PR from `images` to `main` is open. After that merges they have base `main`, and Siddharth merges them, because each puts a picture live. One PR from `images` to `main` waits for Siddharth.

**Only ticket 12 waits for Siddharth.** Making the new pictures needs his Recraft payment and sign-in, the client's answers on rights and subjects (7.3, 7.9), his picks and the client's approval. Everything else runs without him, and the site works with Interim pictures until ticket 12 is done.

**Every ticket that changes a page** is done only when the changed pages meet the design bar in section 3 at 360, 768 and 1440 px, including the hover, focus-visible and active states of every link, card and button it adds or changes. The check is screenshots at those widths and in those states, reviewed by an independent critic agent that did not build the ticket. The ticket fixes whatever the critic finds short of the bar.

| # | Ticket | Done when |
|---|---|---|
| 1 | **Repair what's already broken:** `pnpm shots` crashes with "This module cannot be imported from a Client Component module" (`server-only` under Vite's runner); the Library test "a volume lifts from the shelf under the pointer" fails on clean `main` (`expect.poll` timeout in `tests/e2e/page-turns.ts`, 4 of 6 runs at 1440 and 768). Exclude this spec in `tests/unit/pointers.test.ts` and add `/art/` and `scripts/art/originals.json` to `.prettierignore` | `pnpm shots` writes its screenshots. The Library test passes 10 runs out of 10 at each width. `pnpm check` passes with this spec, `GLOSSARY.md` and `scripts/art/originals.json` committed |
| 2 | **Download the old media** (6.2): `scripts/art/fetch.mjs`, the `.gitignore` entries, `sharp` as a direct devDependency | All 71 files are in `art/wp-export/`, each compared with the server's `Content-Length`. The 22 KEEP masters are committed under `art/masters/`. The 273 addresses are listed. `art/wp-export/care4mind-wordpress-media.zip` exists, with a copy outside any ticket worktree, in the `art/wp-export/` of the checkout that holds the `images` branch, because removing a worktree deletes its gitignored files. The PR and the final report name that path. Nothing is served yet |
| 3 | **Registry, processing and image settings** (6.3, 6.4, 6.7): `scripts/art/process.mjs`, `src/art/` including `slots.ts`, the `draftArt` flag, `images` in `next.config.ts`, `tests/unit/art.test.ts` without its prompts check | `public/art/` holds the 22 processed pictures, and `art/cards/` a 320 px PNG or JPEG copy of each. The registry has their records, with alt text, captions and `licence` from Appendix B and 6.4, each with `approved: true`. `slots.ts` has all 32 slot ids, so tickets 4 to 6 can name them. `pnpm check` passes |
| 4 | **Art components, used first on the section pages** (6.5, 5.3): Emblem, Sticker, Medallion, MedallionRing, ArtFigure, FolkBorder | Every section page in 5.3 shows its Sticker, or its Interim picture. `pnpm check` and `pnpm check:e2e` pass, including axe, forced colours and reduced motion |
| 5 | **Homepage** (5.2, 6.5): PlateViewer, topic Stickers on topic cards, Medallions on featured cards where a Concept has its own Plate, the Emblem in "Who's behind this" and the footer, the folk border, the two-column hero and 72rem sections; `home.spec.ts` updated | The homepage matches 5.2 at 360, 768 and 1440 px. The viewer works by keyboard and never moves on its own. The footer matches 5.1: `emblem-ring` at 72 px, `alt=""`, and the motto under it as real Devanagari text. `tests/e2e/art.spec.ts` exists and covers `/`. `tests/e2e/forced-colors.spec.ts` covers the homepage (6.9). Lighthouse on `/` passes `lighthouserc.cjs` |
| 6 | **Topic, Concept, Questionnaire, Traditional text, Library and error pages** (5.4–5.9), with Interim pictures at page heads and bare cards where no picture exists yet; the `tests/e2e/pages.spec.ts` change in 6.12 | Every page kind in section 5 shows its picture or its Interim picture. `artFor` resolves for every slug, and no Concept, Questionnaire or Traditional text card shows an Interim picture. `tests/e2e/art.spec.ts` covers these page kinds. `tests/e2e/forced-colors.spec.ts` covers a Concept page, a topic page, a Traditional text page and the 404 (6.9) |
| 7 | **The Karma Yoga cycle** (6.6) on the KarmaYoga Scale page | Every word in Appendix C is real text. The strike-throughs are drawn. The list alternative matches the SVG. Every SVG label renders at 15 px or more at 360 px. Forced colours pass on the page (6.9). Lighthouse on `/questionnaires/karmayoga-scale/` passes |
| 8 | **Old media redirects** (6.8): `oldMedia` with all addresses and `wpId`s, `old-media-art.ts`, `redirects.ts`, `redirects.test.ts` | All 282 old media addresses answer one 301, to a file or page that answers 200. The redirect table has 370 rows. `pnpm check` and `pnpm check:e2e` pass, including `tests/e2e/redirects.spec.ts` over all media rows |
| 9 | **Credits page, its plain list and the docs** (5.10, 6.13): `/credits/`, `/credits/sources/`, their two route kinds and `describe.ts` sentences (6.12), an `opengraph-image` file for each using the existing share card, the footer link, `docs/later-phases.md`, `docs/adr/0005-the-clients-pictures.md`, a comment on #25 | `/credits/` shows all 22 pictures with captions only and is in the sitemap. Its last link leads to `/credits/sources/`, which lists each picture's origin and licence. `tests/e2e/art.spec.ts` and `tests/e2e/forced-colors.spec.ts` cover `/credits/`. `tests/e2e/share-card.spec.ts` passes for both pages. The docs are updated. #25 has a comment with the rights question marked as blocking launch, the other questions in section 11, the Appendix B alt text and captions, and the Appendix C text alternative |
| 10 | **Share cards with pictures** (5.1, 6.7): `src/lib/share-card.tsx` draws the page's picture on the right; `outputFileTracingIncludes` covers `art/cards/**` | `tests/e2e/share-card.spec.ts` passes, with a picture in the right-hand third of the card of every route kind, including `/proposals/`, `/questionnaires/[slug]/take/`, `/credits/` and `/credits/sources/` |
| 11 | **Contact sheet and prompts** (7.7, 7.8, 7.9): `scripts/art/sheet.mjs`, `art/prompts.json`, the prompts check in `tests/unit/art.test.ts` | `pnpm art:sheet` writes `art/inbox/sheet.html` and `art/inbox/sheet.pdf`, showing each of the 32 briefs next to the client's own pictures, with empty places for candidates. `art/prompts.json` has a filled prompt for all 32. Each placement names its slot, and the site still shows Interim pictures or bare cards |
| 12 | **Make the new pictures** (`ready-for-human`) (7.2, 7.3, 7.9): Recraft set up on Siddharth's account, the client's answer to section 11 question 1 before any of their pictures is uploaded (7.3), `art/styles.json`, the style test, question 5's answer applied to the briefs (7.9), 32 pictures, his picks, the client's approval | Each picture passes 7.10, is approved, is registered with `approved: true` and placed; its Interim picture is gone |

---

## 9. Left out for now

These extras are not built, so that the first version stays simple. Each could be its own PR later.

- **Optional placements:** Stickers in the header's navigation panels, `sticker-map`, `sticker-start` and an Emblem `apple-icon.png`.
- **Motto ring.** *yad bhāvaṃ tad bhavati · as are the thoughts, so are the manifestations*, set on a circular path in the hero Plate's ring, as the team's 2023 Wepik design did.
- **Single motifs.** The motif sheet (`plate-motifs`) cut into about ten separate Stickers, for empty states and list markers.
- **The gold story, redrawn** as three folk Plates, from the team's 2023 "raw ore → refined gold → ornament" pictures.
- **Two more Plates** to balance the hero set: a woman weaving silk on a handloom, and a woman potter at her wheel.
- **Vector Stickers** and **a printable art sheet** for the client's presentations.

---

## 10. Decisions this spec takes by default

Siddharth confirms these with the client. Until he does, build to them.

| # | Default | The alternative |
|---|---|---|
| D1 | **The originals stay as they are:** no recolouring or duotone. This reverses the duotone line in `docs/later-phases.md` | A shared duotone. It would be calmer, but it removes what the client likes |
| D2 | **The header stays as it is** (line lotus and wordmark). The Emblem goes in the footer, the homepage, share cards and the credits page | The Emblem replaces the header lotus at about 40 px. It loses detail at that size and the lotus's lean-and-bloom motion, and the header tests need rewriting |
| D3 | **Nothing with an unknown licence ships, apart from the 22 kept pictures** (section 3, rule 4). The cosmic meditator, the WhatsApp pictures, the Shutterstock photo, the Storyset-like vector and the icon pack are dropped, and their themes are redrawn in the client's style. The Flickr galaxies and the temple photo are held | Keep the galaxies with a credit line, if they turn out to be NASA/ESA Hubble images |
| D4 | **Image tool:** Recraft's official MCP server on the Basic plan, Pay monthly, for one month, on Siddharth's own account. Rights pass to the client at handover | Prompts pasted by hand into ChatGPT or Gemini |
| D5 | **Hero:** a viewer the visitor controls. No autoplay | One fixed Plate |
| D6 | **The 22 kept masters are committed** (about 16 MB). The full 71-file WordPress export is zipped and handed to the client, not committed | Commit everything (about 36 MB) |
| D7 | **The client approves each new picture** from the contact-sheet PDF. New pictures stay behind `draftArt` until then. The Project owner and Research editor are not yet named, so drafted alt text and captions ship as written assumptions in #25 | The developer approves |
| D8 | **The Samarkan headings don't come back.** The font is shareware that needs a bought commercial licence, and Press has its own type | Buy a Samarkan licence, or look for an open-licence font with a similar feel |
| D9 | **The Karma Yoga cycle lives on the KarmaYoga Scale page** | A page of its own, or the Kartā Concept |
| D10 | **The old Courses page's university logos don't come over** | Self-hosted logos with each university's permission |
| D11 | **The Dosha Survey's Plate waits until the Survey has a page,** so 32 new pictures, not 33 | Make it now, as a 33rd picture |

---

## 11. Questions for the client

1. Did your team make these pictures, and with which tool? May we reuse all of them? **The site can't launch without this answer.** Uploading them to Recraft means promising you have the right to, so ticket 12 can't start without it either (7.3).
2. Do you have any of them larger than 1024 × 1024?
3. Is the Emblem with the green ring (version 4) your logo of record, or do you prefer another frame?
4. Where did the galaxy and temple photos come from?
5. Are there subjects you would like in the new pictures, such as particular crafts, regions or people? Anything to avoid, such as deities or particular symbols? The answer goes into the briefs in 7.8 before any picture is generated (7.9).
6. Who on your side approves new pictures?

---

## Appendix A. The old media library, file by file

Checked against `https://care4mind.org/wp-json/wp/v2/media` on 9 November 2026. Sizes are the originals'. "Shown on the old site" comes from the live homepage, the pages' content and the posts' featured images. Verdicts are explained in section 4.

| WP id | Old file (under `/wp-content/uploads/`) | Size | Family | Shown on the old site | Verdict | New id → file | Notes |
|---|---|---|---|---|---|---|---|
| 604 | `2024/05/Logo-with-frame-4-and-text.png` | 1024 × 1024, 1037 KB | emblem | source of the header logo | **KEEP** | `emblem-ring` → `/art/emblem/emblem-ring.png` | Master. Crop off the Devanagari line and make everything outside the ring transparent. |
| 498 | `2024/05/Logo-final-e1715691828178.png` | 781 × 713, 674 KB | emblem | not shown | **KEEP** | `emblem-mark` → `/art/emblem/emblem-mark.png` | Lotus-brain alone, transparent. For small sizes and the 404 page. WordPress reports 823 KB for this file; the download is 674 KB. |
| 643 | `2023/09/cropped-Logo-with-frame-4-and-text-removebg-preview-e1742128192520.webp` | 385 × 367, 46 KB | emblem | header logo, every page | **ARCHIVE** | — | Too small to reuse; emblem-ring replaces it. |
| 624 | `2023/09/Logo-with-frame-4-and-text-removebg-preview.png` | 500 × 500, 217 KB | emblem | not shown (parent of the header crop) | **ARCHIVE** | — | Low-res copy of 604 with the motto baked in. |
| 614 | `2025/02/Logo-with-frame-4-and-text-removebg-preview.png` | 500 × 500, 217 KB | emblem | not shown | **ARCHIVE** | — | Duplicate of 624. |
| 597 | `2024/05/Logo-with-frame-3-e1715785860721-1.png` | 624 × 607, 469 KB | emblem | not shown | **ARCHIVE** | — | Alternative frame: dotted orange-green ring, teal diamond compass points. |
| 595 | `2024/05/Logo-with-frame-3-e1715785860721.png` | 624 × 607, 712 KB | emblem | not shown | **ARCHIVE** | — | Duplicate of 597. |
| 589 | `2024/05/Logo-with-frame-2-final.png` | 1024 × 1024, 916 KB | emblem | not shown | **ARCHIVE** | — | Alternative frame: concentric pink, green and teal rings with arrow points. |
| 241 | `2023/10/logo.png` | 300 × 300, 15 KB | emblem | not shown | **ARCHIVE** | — | 2023 logo: orange lotus with a meditating figure on a green hand, 'CARE4MIND / MANOVIKASAM'. History only. |
| 511 | `2024/05/Cosmos-icon.png` | 777 × 777, 1124 KB | sticker | home: Concepts and Resources cards | **KEEP** | `sticker-cosmos` → `/art/stickers/cosmos.png` | Section: Concepts. |
| 514 | `2024/05/Psychology-Techniques-icon-4.png` | 817 × 758, 1131 KB | sticker | home: Techniques card | **KEEP** | `sticker-mind-tools` → `/art/stickers/mind-tools.png` | Library: Therapy approaches (the old Methods page). |
| 510 | `2024/05/Psychology-Techniques-icon-2.png` | 840 × 851, 1329 KB | sticker | not shown | **KEEP** | `sticker-mind-swirl` → `/art/stickers/mind-swirl.png` | Topic: Mind. |
| 509 | `2024/05/Psychology-Techniques-icon.png` | 916 × 791, 1369 KB | sticker | not shown | **KEEP** | `sticker-mind-dome` → `/art/stickers/mind-dome.png` | Search page and its no-results state; 'What's on your mind?'. |
| 513 | `2024/05/Book-icon-2.png` | 558 × 769, 909 KB | sticker | home: Tradition and Texts card | **KEEP** | `sticker-book-ornate` → `/art/stickers/book-ornate.png` | Section: Traditional texts. |
| 505 | `2024/05/book-icon.png` | 1080 × 1080, 898 KB | sticker | not shown | **KEEP** | `sticker-book-clasp` → `/art/stickers/book-clasp.png` | Library: Textbooks. Has no die-cut edge yet: add one (section 6.3). |
| 512 | `2024/05/Meditation-icon.png` | 882 × 908, 1471 KB | sticker | not shown | **KEEP** | `sticker-meditation` → `/art/stickers/meditation.png` | Topic: Practice. |
| 508 | `2024/05/Gear-Icon.png` | 821 × 813, 1077 KB | sticker | home: Research card (linked to Courses) | **KEEP** | `sticker-gear` → `/art/stickers/gear.png` | Library: Courses in India. |
| 515 | `2024/05/Survey-1-e1715701729946.png` | 481 × 602, 382 KB | sticker | home: Applications card | **KEEP** | `sticker-clipboard` → `/art/stickers/clipboard.png` | Section: Questionnaires. WordPress reports 953 KB for this file; the download is 382 KB. |
| 464 | `2024/05/Jewellry-making-2.jpeg` | 1024 × 1024, 339 KB | plate | home hero carousel, slide 1 | **KEEP** | `plate-jeweller` → `/art/plates/jeweller.jpg` | Home hero, first Plate. |
| 466 | `2024/05/Sculptor-3.jpeg` | 1024 × 1024, 298 KB | plate | home hero carousel, slide 2 | **KEEP** | `plate-sculptor` → `/art/plates/sculptor.jpg` | Home hero. |
| 468 | `2024/05/Indian-Farmer.jpeg` | 1024 × 1024, 375 KB | plate | home hero carousel, slide 3 | **KEEP** | `plate-farmers` → `/art/plates/farmers.jpg` | Home hero; Temperament topic. |
| 463 | `2024/05/Jewellry-making-1.jpeg` | 1024 × 1024, 346 KB | plate | not shown | **KEEP** | `plate-jeweller-woman` → `/art/plates/jeweller-woman.jpg` | Home hero. |
| 497 | `2024/05/Karmayoga-Main-image.jpeg` | 1024 × 1024, 322 KB | plate | home: Dosha card; /home/ | **KEEP** | `plate-karma-yoga` → `/art/plates/karma-yoga.jpg` | KarmaYoga Scale. |
| 461 | `2024/05/Intricate-painting-1.jpeg` | 1024 × 1024, 406 KB | plate | not shown | **KEEP** | `plate-painter-bowl` → `/art/plates/painter-bowl.jpg` | Home hero; Practice topic. |
| 462 | `2024/05/Intricate-painting-2.jpeg` | 1024 × 1024, 378 KB | plate | not shown | **KEEP** | `plate-painter-birds` → `/art/plates/painter-birds.jpg` | Home hero. |
| 467 | `2024/05/Work-on-the-brain-1.jpeg` | 1024 × 1024, 347 KB | plate | home: Survey -02 card | **KEEP** | `plate-sage-paints-mind` → `/art/plates/sage-paints-mind.jpg` | Mind topic. |
| 460 | `2024/05/human-mind-and-sage-2.jpeg` | 1024 × 1024, 282 KB | plate | home: survey -03 card | **KEEP** | `plate-sage-lights-mind` → `/art/plates/sage-lights-mind.jpg` | Self topic. |
| 457 | `2024/05/Mind-2.jpeg` | 1024 × 1024, 310 KB | plate | not shown | **KEEP** | `plate-tree-of-mind` → `/art/plates/tree-of-mind.jpg` | Values topic. |
| 499 | `2024/05/Spiritual-Climate.jpeg` | 1024 × 1024, 186 KB | plate | /home/ (old duplicate homepage) | **KEEP** | `plate-motifs` → `/art/plates/motifs.jpg` | Motif sheet: lotus, diya, temple, elephant, tulsi. Credits page; slice into small motifs later (section 9). |
| 495 | `2024/05/Madhubani-dot-line-border-e1715423049444-2.png` | 1104 × 21, 33 KB | ornament | not seen in use | **REBUILD** | `FolkBorder dot-line` | Redraw as SVG: thin double rule over a row of alternating black and terracotta dots. |
| 490 | `2024/05/Madhubani-dot-line-border-e1715423049444-1.png` | 811 × 43, 68 KB | ornament | not shown | **REBUILD** | `FolkBorder dot-band` | Redraw as SVG: a band of yellow, orange and red dots between two hairlines. |
| 585 | `2024/05/border-7a-2.png` | 1888 × 69, 160 KB | ornament | not shown | **REBUILD** | `FolkBorder rule-dots` | Redraw as SVG: dark green rule over black and rust dots of two sizes. |
| 583 | `2024/05/border-7a.png` | 1024 × 1024, 178 KB | ornament | not shown | **ARCHIVE** | — | Same border as 585 on a square canvas. |
| 38 | `2023/09/Karma-Yoga.png` | 1077 × 742, 121 KB | diagram | home: Karma Yoga section | **REBUILD** | `KarmaCycle` | Text baked into a picture. Rebuild as an SVG with real text (section 6.6). |
| 37 | `2023/09/Triguna-Scale.png` | 600 × 600, 14 KB | diagram | /home/ | **DROP** | — | Abstract shapes, no meaning. The new Temperament Sticker replaces it. |
| 276 | `2023/11/52688095545_b9fa332de6_c.jpg` | 747 × 800, 242 KB | photo | home: questionnaire cards; Jagat post's featured image | **HOLD** | — | Spiral galaxy from Flickr (file name is a Flickr photo id). If it is NASA/ESA Hubble, it is usable with a credit line. Default: replaced by a folk-style cosmos Plate. |
| 275 | `2023/11/53233668647_b2f50e07b4_c.jpg` | 800 × 779, 273 KB | photo | not shown | **HOLD** | — | Second Flickr galaxy. Same as 276. |
| 371 | `2023/11/brahma-madurai-meenakshi-amman-temple-1576032.jpg` | 1280 × 1026, 456 KB | photo | not shown (734 is its copy) | **HOLD** | — | Temple sculpture photo; the number looks like a Pixabay id. Verify before any reuse. |
| 734 | `2025/03/brahma-madurai-meenakshi-amman-temple-1576032-1024x821-1.jpg` | 1024 × 821, 178 KB | photo | /concepts/ | **HOLD** | — | Copy of 371 shown on the old Concepts page. |
| 415 | `2023/11/south-indian-sculptor-in-veshti-cross-legged-engaged-intensely-in-carving-a-rock-2.png` | 1024 × 1024, 1493 KB | photo | not shown | **ARCHIVE** | — | Photo-real AI picture (2023). Different style from the folk set. |
| 398 | `2023/11/indian-jeweler-hunched-over-intricate-workspace-crafting-exquisite-ornaments-emeralds-glinting-un-1.png` | 1024 × 1024, 1502 KB | photo | not shown | **ARCHIVE** | — | Photo-real AI picture (2023), same jeweller theme. |
| 385 | `2023/11/rustic-raw-gold-ore-649489767.png` | 1024 × 1024, 2457 KB | photo | not shown | **ARCHIVE** | — | Gold ore, part 1 of a 'raw ore to ornament' story (citta-shuddhi). Photo-real AI. |
| 384 | `2023/11/rustic-raw-impure-gold-ore-487328361.png` | 1024 × 1024, 2461 KB | photo | not shown | **ARCHIVE** | — | Gold ore, part 2. |
| 383 | `2023/11/transformation-of-gold-ore-into-lustrous-ornaments-in-the-background-of-serene-meditative-whitish-382111856.png` | 1024 × 1024, 2159 KB | photo | not shown | **ARCHIVE** | — | Gold, part 3. |
| 324 | `2023/11/atman-and-brahman.jpg` | 750 × 518, 44 KB | photo | home: questionnaire cards; Atman post's featured image | **DROP** | — | Source and licence unknown. Theme kept: a new folk-style cosmic-self Plate for Atman. |
| 272 | `2023/11/shutterstock_1561867960.jpg.webp` | 600 × 315, 38 KB | photo | not shown | **DROP** | — | Shutterstock stock photo. No licence on record: never reuse. |
| 271 | `2023/11/Spiritua_Seeking_7214.jpg` | 1200 × 514, 86 KB | photo | not shown | **DROP** | — | Stock-style photo, source unknown. |
| 312 | `2023/11/physical-symptoms.jpg` | 2000 × 2000, 122 KB | photo | not shown | **DROP** | — | Flat stock vector (looks like a Storyset/Freepik illustration, which needs a credit). Off-style. |
| 9 | `2023/09/WhatsApp-Image-2023-08-03-at-3.13.15-PM.png` | 1172 × 1172, 1742 KB | photo | home: Survey -04 card | **DROP** | — | Red glittering meditator before a white lotus. Stock-like, source unknown. |
| 35 | `2023/09/WhatsApp-Image-2023-08-03-at-3.50.07-PM-2.jpeg` | 1080 × 720, 229 KB | photo | not shown | **DROP** | — | Stock-style vector of deities and symbols. Source unknown. |
| 245 | `2023/10/image-1.png` | 600 × 600, 111 KB | photo | not shown | **DROP** | — | Vintage botanical drawing of a flowering branch. Source unknown. |
| 406 | `2023/11/wepik-20231128113137reiF.png` | 1920 × 1080, 1468 KB | composite | not shown | **DROP** | — | Wepik composite: jeweller photo in a circle with the motto curved round it. Text baked in; the idea could return as an SVG motto ring (section 9). |
| 405 | `2023/11/wepik-20231128112742aCcw.png` | 1920 × 1080, 1230 KB | composite | not shown | **DROP** | — | Smaller version of 406. |
| 208 | `2023/10/009-psychology-1.png` | 512 × 512, 9 KB | line-icon | not shown | **DROP** | — | Generic black line icon from a numbered icon pack (looks like Flaticon, which needs a credit). |
| 207 | `2023/10/008-psychology.png` | 512 × 512, 9 KB | line-icon | not shown | **DROP** | — | Same pack. |
| 205 | `2023/10/006-unlock.png` | 512 × 512, 14 KB | line-icon | not shown | **DROP** | — | Same pack. |
| 204 | `2023/10/005-mental-health.png` | 512 × 512, 16 KB | line-icon | not shown | **DROP** | — | Same pack. |
| 203 | `2023/10/004-group-therapy.png` | 512 × 512, 17 KB | line-icon | not shown | **DROP** | — | Same pack. |
| 202 | `2023/10/003-sensory.png` | 512 × 512, 15 KB | line-icon | not shown | **DROP** | — | Same pack. |
| 201 | `2023/10/002-emotions.png` | 512 × 512, 10 KB | line-icon | not shown | **DROP** | — | Same pack. |
| 200 | `2023/10/001-growth.png` | 512 × 512, 15 KB | line-icon | not shown | **DROP** | — | Same pack. |
| 636 | `2025/02/outdoor-image-04.jpg` | 379 × 218, 15 KB | theme-demo | not shown | **DROP** | — | Astra theme starter-template photo (skiers). |
| 635 | `2025/02/snow-1.jpg` | 378 × 385, 44 KB | theme-demo | not shown | **DROP** | — | Theme demo. |
| 634 | `2025/02/image-1.jpg` | 378 × 385, 45 KB | theme-demo | not shown | **DROP** | — | Theme demo. |
| 633 | `2025/02/outdoor-image-01.jpg` | 644 × 402, 39 KB | theme-demo | not shown | **DROP** | — | Theme demo. |
| 632 | `2025/02/walking-v1.jpg` | 644 × 402, 277 KB | theme-demo | not shown | **DROP** | — | Theme demo. |
| 631 | `2025/02/hiking-v1.jpg` | 644 × 402, 246 KB | theme-demo | not shown | **DROP** | — | Theme demo. |
| 630 | `2025/02/quote-1.png` | 200 × 154, 4 KB | theme-demo | not shown | **DROP** | — | Theme demo quotation mark. |
| 221 | `2023/10/SamarkanOblique-BXew.ttf` | font, 20 KB | font | not seen in use | **DROP** | — | Samarkan is shareware: a commercial licence has to be bought from its maker. |
| 220 | `2023/10/SamarkanNormal-Gg5D.ttf` | font, 58 KB | font | the curly 'psychology' style headings | **DROP** | — | Same. |
| 217 | `2023/10/Shobhika-Regular.otf` | font, 360 KB | font | not seen in use | **DROP** | — | Open-source Devanagari font. The new site already uses Tiro Devanagari Sanskrit. |

## Appendix B. Alt text and captions for the kept pictures

These are drafts, written as assumptions and listed in #25 until the Project owner is named. A caption shows only where the picture stands alone (the hero Plates and the `/credits/` gallery). Stickers are always decorative where they are placed, so their alt text is used only on the credits page.

| id | alt | caption |
|---|---|---|
| `emblem-ring` | Care4Mind's emblem: a pink lotus whose petals form a brain, in a green ring of leaves | — |
| `emblem-mark` | A pink lotus whose petals form a brain, its stalk a brain stem | — |
| `sticker-cosmos` | A pink lotus mandala among planets and stars | — |
| `sticker-mind-tools` | A brain filled with small symbols: charts, a pencil, a keyhole, a water drop | — |
| `sticker-mind-swirl` | A brain made of swirling folk patterns in coral, blue and cream | — |
| `sticker-mind-dome` | A head-shaped dome full of gears, an eye, a drop and patterns | — |
| `sticker-book-ornate` | A closed book with a teal cover, a coral flower and a strap | — |
| `sticker-book-clasp` | An ornate book with a mandala on its cover and a clasp | — |
| `sticker-meditation` | A person meditating before a teal and coral temple arch | — |
| `sticker-gear` | Interlocking gears inside a patterned mandala | — |
| `sticker-clipboard` | A clipboard with a checklist, framed by folk flowers | — |
| `plate-jeweller` | A jeweller in a maroon turban and round glasses threads a necklace of rubies and emeralds | The jeweller |
| `plate-sculptor` | A young sculptor chisels a stone Ganesha under a tiled temple roof | The sculptor |
| `plate-farmers` | A farmer ploughs with a white bull while a woman plants seedlings beside him | The farmers |
| `plate-jeweller-woman` | A woman in a green and red sari strings a gold and emerald necklace | The necklace maker |
| `plate-karma-yoga` | A man kneels to dig and plant beneath a sky of blue folk patterns | The planter |
| `plate-painter-bowl` | An old man in a white turban paints fine patterns on a bowl by a river | The bowl painter |
| `plate-painter-birds` | An old man in an orange turban paints birds beneath trees full of birds | The bird painter |
| `plate-sage-paints-mind` | A white-bearded sage paints a brain under a night sky with a spiral galaxy | Working on the mind |
| `plate-sage-lights-mind` | A sage drawn in black and gold touches a glowing, patterned brain | Lighting the mind |
| `plate-tree-of-mind` | A tree whose crown is a patterned brain grows from a striped pot | The tree of the mind |
| `plate-motifs` | Folk motifs: lotuses, suns, oil lamps, temples, an elephant and tulsi plants | Motifs |

## Appendix C. The Karma Yoga cycle, word for word

From `2023/09/Karma-Yoga.png` (1077 × 742), as shown on the old homepage under the heading "Karma Yoga: An Indian Perspective of Work". Spellings are kept exactly.

| Position | Text | Drawn as |
|---|---|---|
| Centre | Karmabandha Mochana | slate grey-blue, large |
| Top left (node) | Karmaphala / Punya or Papa | on a light panel, **both lines struck through** |
| Top right (node) | Karmabija | on a light panel, **struck through** |
| Right (node) | Dharmabaddha Kama (Desire) | dark grey-brown |
| Bottom (node) | Nischayam / Resolve | dark grey-brown |
| Left (node) | Karma / Action | dark grey-brown |
| Arrow, Karmaphala → Karmabija | Citta-shuddhi | orange arrow, red label |
| Arrow, Karmabija → Dharmabaddha Kama | Manonigraha | orange arrow, red label |
| Arrow, Dharmabaddha Kama → Nischayam | Buddhi | pink arrow, red label |
| Arrow, Nischayam → Karma | Svadharma | slate-blue arrow, red label |
| Arrow, Karma → Karmaphala | Phala-Tyaga | brown arrow, purple label |
| Small curved arrow into Karmaphala, from the top left | Lokasamgraha | red label |

**Text alternative** (for `<desc>`, using only the diagram's words; it ships as a written assumption, listed in #25): "A cycle of action. Karmabija leads, through Manonigraha, to Dharmabaddha Kama (desire); through Buddhi to Nischayam (resolve); through Svadharma to Karma (action); and through Phala-Tyaga to Karmaphala, punya or papa. Lokasamgraha also leads into Karmaphala. Karmaphala and Karmabija are struck through, and Citta-shuddhi leads from Karmaphala back to Karmabija. At the centre: Karmabandha Mochana."

## Appendix D. Sources

- **The old site:** care4mind.org's REST API (`/wp-json/wp/v2/media`, `/pages`, `/posts`) and its live homepage, read 9 November 2026.
- **The new site:** `SiddharthMuramkar/care4mind` at `f08d5d0`, and the live site at care4mind.vercel.app.
- **Next.js 16 images:** `preload` replaces `priority`; `images.qualities` defaults to `[75]`; `minimumCacheTTL` defaults to 4 hours ([Next.js `Image` docs](https://nextjs.org/docs/app/api-reference/components/image); [upgrading to 16](https://nextjs.org/docs/app/guides/upgrading/version-16)).
- **Vercel Image Optimization:** 5,000 transformations a month included on Hobby; US$0.05 per 1,000 on Pro ([Vercel pricing](https://vercel.com/docs/pricing); [Image Optimization limits](https://vercel.com/docs/image-optimization/limits-and-pricing)).
- **Recraft:**
  - the official MCP server, its tools, credits billing, and the `img.recraft.ai` note for Claude Code on the web ([MCP tools](https://www.recraft.ai/docs/mcp-reference/tools); [server README](https://github.com/recraft-ai/mcp-recraft-server));
  - the API, its models, styles from 1–10 references, and result links that expire after about 24 hours ([API docs](https://www.recraft.ai/docs); [use with AI tools](https://www.recraft.ai/docs/api-reference/ai-tools));
  - plans: the free plan is public and non-commercial; paid plans give ownership and commercial rights ([pricing](https://www.recraft.ai/pricing)).
- **Gemini image models:** IDs and prices ([Nano Banana in Claude Code](https://blog.laozhang.ai/en/posts/nano-banana-claude-code); [gemini-image-mcp](https://github.com/JimothySnicket/gemini-image-mcp)).
- **OpenAI image models:** GPT Image 2 per-image prices ([gpt-image-2-mcp](https://github.com/borys520/gpt-image-2-mcp)); GPT Image 1 shut down on 23 October 2026 ([model page](https://developers.openai.com/api/docs/models/gpt-image-1)).
- **Samarkan:** shareware by Titivillus Foundry; contact the designer for a commercial licence ([FontSpace](https://www.fontspace.com/samarkan-font-f11675)).
- **ESA/Hubble pictures:** CC BY 4.0, with a credit ([ESA/Hubble copyright](https://esahubble.org/public/copyright)).
