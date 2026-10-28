# 06: Concepts A–Z, glossary and topic pages

Status: ready-for-agent
Blocked by: 03, 04
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §B3, §C3 · Decisions: D03, D14, D15, D21

**What to build:** two ways into the Concepts.

**The A–Z** at `/concepts/` is one alphabetical list of every Concept, every term explained inside a Concept and every glossary entry carried over from the current site.

- A rail of letters jumps through it, and highlights the letter you're on.
- Filter chips narrow it by topic, by text, or to Concept pages only, and the list glides into its new order.
- Glossary entries without a page of their own lead to DharmaWiki and say so.

**Each topic page** at `/topics/<slug>/` shows the topic's Concepts as a contents plate, set like a book's contents with Devanagari numerals and dotted leaders.

- A card lights its row when you point at or focus it, and the row's leader inks in.
- Below come the verses the topic's Concepts quote, and, for the values topic, its shared yama–niyama introduction.

## Owns

- `src/app/concepts/page.tsx` and its CSS Module (not `concepts/[slug]/` or `concepts/map/`)
- `src/app/topics/**`
- `src/components/az/**` (new): the letter rail, filter chips and entries
- `src/components/topics/**` (new): topic cards and the contents plate, which ticket 11 reuses for the five topics
- `src/content/derive/az-index.ts`: adjust only if needed, keeping `@/content`'s interface and the content tests unchanged
- `tests/e2e/concepts-index.spec.ts` and `tests/e2e/topics.spec.ts` (new)

## Acceptance criteria

- [ ] **One A–Z (D14):**
  - `/concepts/` lists every entry from `site.azIndex()`: every Concept, every term (linking to its anchor on its Concept page) and every glossary entry, de-duplicated and sorted.
  - Each entry shows its leading name (IAST, or the English title), its Devanagari where known, and its gloss.
  - Both scripts go through ScriptPair with their `lang` tags.
- [ ] **Glossary entries:**
  - An entry with a Concept page links there.
  - An entry with only a DharmaWiki article links to it, and says it leads to DharmaWiki in words, not only with an icon.
  - An entry with neither shows as text.
  - Every glossary entry has its anchor (`/concepts/#<slug>`), which the old `/anubandha-chatushtaya/` address redirects to.
- [ ] **Letter rail:**
  - A Base UI Toolbar of letter links (`Toolbar.Link`): one Tab stop, with the arrow keys moving between letters.
  - Letters with no entries are shown as plain text, not links.
  - The letter for the section in view is highlighted with CSS only, using the same technique as the Concept page's table of contents.
  - With JavaScript off, every letter is still an ordinary link.
- [ ] **Filter chips:**
  - A Base UI ToggleGroup with the five topics, the works, and "Concept pages / glossary".
  - Choosing chips filters the list and reorders it with a view transition. Only the first 40 items shown get view-transition names.
  - The new count is announced politely ("12 entries", WCAG 4.1.3).
  - The filter state lives in the address's query string, so a filtered view can be shared and browser Back undoes a filter.
  - With JavaScript off, the chips are hidden and the full list shows.
- [ ] **Speed on a long list:**
  - Entries use `content-visibility: auto` with an intrinsic size.
  - Loading the page causes no layout shift (CLS ≤ 0.1).
  - A chip press is measured once at 4× CPU slowdown, kept under 200 ms, and recorded in Comments; ticket 15 adds the standing check.
- [ ] **Previews:** Concept entries and glossary entries that have a Concept page use the LinkPreview slot, so they show previews once ticket 05 merges.
- [ ] **Topic cards morph:** each topic card on `/concepts/` morphs into its topic page's title (`topic-title-<slug>`) inside the forward page turn.
- [ ] **Topic pages (FR-01, D03):**
  - `/topics/<slug>/` lists every Concept whose primary topic it is, as cards, then the Concepts that list it as a secondary topic.
  - It shows computed facts: how many Concepts, how many verses they quote, and from which works.
  - It shows the verses its Concepts quote, each linking to its passage.
  - The values topic shows its shared yama–niyama introduction, stored once.
  - No other topic gets a written description (design B3).
- [ ] **The contents plate (D21):**
  - It has one row per Concept, set like a book's contents: a Devanagari numeral, the Concept's name and a dotted leader. Each row is a real link with the Concept's name.
  - Hovering or focusing a card, or the row itself, lights the row through CSS `:has()`, with no JavaScript, and the row's leader inks in.
  - It follows the Press ornament conventions: finished by default and still in print. Under reduced motion it keeps still, and a row lights at once, with nothing inking in.
  - The numerals and leaders are hidden from assistive technology, and the links are not.
  - It is built to be reused: ticket 11 sets the homepage's five topics with it.
- [ ] **No JavaScript of their own:** topic pages add no client component, and the A–Z's only islands are the chips and the previews.
- [ ] **Breadcrumbs (D15):** Home › Concepts on the A–Z, and Home › Concepts › {topic} on topic pages.
- [ ] **Reflow:** both page types fit 320 px with no sideways scroll (WCAG 1.4.10), and the contents plate wraps without hiding any link.
- [ ] **Tests:**
  - `concepts-index.spec.ts` covers: the rail by keyboard, a filter by mouse and by keyboard with the announced count, the address keeping the filter, JavaScript off, axe with a filter applied, and a glossary anchor reached from another page.
  - `topics.spec.ts` covers: rows lighting and their leaders inking in on card focus (computed style), row links, the values introduction, and axe.
- [ ] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments

**From content-v1, 2026-10-28:** Yama and Niyama are term blocks in the values topic's introduction, which `az-index.ts` doesn't read (it takes a Concept's own terms), and no glossary entry covers them. Include topic-introduction terms in the A–Z, linking to their anchor on the topic page. Counts on the merged content: 139 A–Z entries before this change.

**Built, 2026-10-28 (lane/site-06):**

- **The A–Z** (`src/app/concepts/page.tsx`, `src/components/az/**`): the five topics as cards, then every entry of `site.azIndex()` by letter, set like a dictionary (two columns from 60rem, a column rule between). Each entry gives its name in both scripts through ScriptPair, its gloss, what it is in words ("Concept page", "Term in Vikṣepa", "Term in the introduction to Values: yama and niyama", "Glossary"), a glossary entry's description and its other spellings. 141 entries on the merged content: 19 Concept pages, 48 terms, 74 glossary entries.
  - Glossary entries: one merged into a Concept is that Concept's entry and carries its anchor (an empty `span` per extra anchor, as ticket 03 had it); one with a DharmaWiki article links there and says "on DharmaWiki ↗" inside the link; one with neither would show as text (the content has none today, so the spec checks that case only when one exists).
  - Concept entries are wrapped in the LinkPreview slot with their names, gloss and summary.
  - Topic cards (`src/components/topics/TopicCard.tsx`): Devanagari numeral, name (named `topic-title-<slug>`, so it flies into the topic page's heading on the forward turn), IAST term, count; the topic's hue edges the card. They lift under the pointer and press in, only under `no-preference`.
- **The rail and the chips** are one small island, `AzIndex` (its styles in `AzIndex.module.css`, the entries' in `az.module.css`; Turbopack still merges both into the stylesheet every page loads, as ticket 03 found), wrapped round the server-rendered list (passed as children, so the entries ship no JavaScript). The server sends the rail as plain links and the chips as plain toggle buttons; Base UI's Toolbar and ToggleGroup (`AzKeyboard.tsx`) load when the browser is idle or a pointer or focus comes near, and take their place (focus handed on; a press under way finishes on the plain chip first). Without JavaScript the chips are hidden by `@media (scripting: none)`, so nothing shifts when they hydrate.
  - The rail is a sticky band under the header, a printer's double rule above and below. Letters with no entries are grey text. The current letter is vermilion with a lozenge, from `scroll-target-group: auto` and `:target-current` (CSS only; Firefox and Safari show no mark yet). On a phone the band scrolls sideways inside itself.
  - The chips: one ToggleGroup (`multiple`) with three labelled rows, Topic (the five), Text (the six works the entries quote) and Show ("Concept pages", "Terms", "Glossary"). OR within a row, AND across rows. On a phone each row scrolls sideways.
  - The filter lives in the address (`?topic=mind,self&text=yoga-sutra&kind=concept`): a press pushes a new address (`history.pushState`, which Next's router follows), and Back and Forward restore it. The address is read with `useSyncExternalStore`, so the server's HTML is the whole list.
  - A filter sets `hidden` on the entries and letters it leaves out (each entry carries `data-topics`, `data-works`, `data-kind`), so the list never re-renders. Letters it empties turn to plain text on the rail. The count ("35 entries") is a polite live region; "Clear filters" appears while any chip is pressed; an empty result says so.
  - The list glides in a view transition (`document.startViewTransition`, class `az-entry`, `--duration-reorder`): only the entries on screen are named, at most 40, named by their place in the list and cleared when it ends. None under reduced motion.
- **Topic pages** (`src/app/topics/[slug]/**`): title page (kicker "Topic" with its Devanagari numeral, the heading named `topic-title-<slug>`, the IAST term, the facts: "5 Concepts · 14 verses quoted, from Bhagavad Gītā, Vedānta Sāra and Yoga Sūtra"), the values introduction at a reading measure (Sections, its References and provenance), then "Its Concepts": the contents plate, sticky on the left from 64rem, beside the Concepts' cards (the shared ConceptCard), those whose primary topic it is first, then "Also in this topic". Last, "Verses its Concepts quote": per work, each verse set like a manuscript's index, its opening line (after any "… उवाच" speaker line) in Devanagari or transliteration, a dotted leader and its locator, the whole row a link to the passage, with "Quoted in …" under it. No client component.
- **The contents plate** (`src/components/topics/ContentsPlate.tsx`): `<ContentsPlate label groups={[{ title?, rows: [{ key, href, name, trailing?, trailingLang? }] }]} />`. A `nav` named by `label`, its running head over a double rule, rows numbered in Devanagari across groups, each row's link named by the row's name alone and stretched over the row; numerals and leaders `aria-hidden`; on topic pages the trailing text is the Concept's Devanagari. A lit row takes `--lit: 1`: the link colour, a vermilion wash, and its leader's vermilion dots uncovered from the centre by `clip-path` (a transition only under `no-preference`; at once under reduced motion; never in print). Rows light on their own `:hover`/`:focus-within`, and through `:has()` from a card inside `plateScope` carrying `plateCard(n)` (`data-plate-card`), up to 12 rows (one selector each; the component throws at build time past that).
  - **For ticket 11** (the homepage's five topics): `<ContentsPlate label="Topics" groups={[{ rows: topics.map((t) => ({ key: t.slug, href: hrefFor({ kind: 'topic', id: t.slug }), name: t.name, trailing: `${t.conceptCount} Concepts` })) }]} />`. To make a row fly into the topic page's heading, pass its name wrapped in `<ViewTransition name={`topic-title-${slug}`} share="morph" default="none">`, as long as no TopicCard on the same page carries the name.
- **`src/content/derive/az-index.ts`**: as content-v1 asked, the terms a topic's introduction explains (yama, niyama) are A–Z entries linking to their anchors on the topic page (`/topics/values/#yama`), filtered by that topic and the works its introduction quotes. `@/content`'s interface and the content tests are unchanged (139 → 141 entries).

Decisions the spec left open:

- The rail is part of the chips' island rather than an island of its own: Base UI's Toolbar is a client component, and a filter turns emptied letters to text, so the two share state. The A–Z's islands are this one and the previews.
- "Concept pages / glossary" became a Show row of three chips (Concept pages, Terms, Glossary), so terms can be picked out too.
- A term's "Term in …" names its Concept or topic in words, not with a second link: the entry's own link already leads there, and 48 more links weighed on the page.
- On topic pages the plate's trailing column holds each Concept's Devanagari, where a book has its page number; the English gloss is on the card.
- Chip labels are the topics' and works' names as the content gives them.

Measured:

- **A chip press at 4× CPU** (`openOnSlowPhone`, Event Timing, the list on screen, four presses: Mind, Concept pages, then both off): 360 px 144, 104, 80, 120 ms; under reduced motion (no view transition) 96, 72, 64, 120 ms. At 1440 px the same presses take 216, 192, 144, 184 ms (reduced motion 120, 88, 96, 144 ms): the view transition's two extra frames cost most there. Changing a stylesheet or re-rendering the rail made no difference; naming only on-screen entries (first try named 40 from the first on screen: 1440 px 264–448 ms) did. For ticket 15's standing check.
- **No layout shift** on load: `concepts-index.spec.ts` sums layout-shift entries through hydration and the Base UI swap (< 0.1; it reads 0 here).
- **HTML**: `/concepts/` 288 kB, 30.8 kB gzip (two-thirds of it the RSC payload repeating the list); `/topics/mind/` 11.7 kB gzip. First-load JS adds the island (2.8 kB gzip); Base UI's parts load at idle. No new font, preload or token. Lighthouse wasn't run (neither page is in `lighthouserc.cjs`).

Tests: new `tests/e2e/concepts-index.spec.ts` (13 tests) and `tests/e2e/topics.spec.ts` (10 tests), green at 360, 768 and 1440 px (twice over, `--repeat-each=2`); the sample run of `pages`, `crawler`, `reflow`, `motion`, `smoke`, `nav`, `home`, `page-turn`, `underlines` and `ink` passes too. No existing test changed.

For the conventions doc (ticket 15):

- Lightning CSS (Turbopack) doesn't know `:target-current` yet: in a CSS Module it warns at every build ("not recognized as a valid pseudo-class") but keeps the rule. The A–Z writes that one rule into its island's server-rendered `<style>` instead (`CURRENT` in `AzIndex.tsx`). Ticket 05's table of contents will meet the same warning.
- Chrome's `scroll-target-group` marks the next target when a section is shorter than the band it reads by (here the letters E, F, G, I and L mark the letter after). Test the current-letter mark on a long section.
- `content-visibility: auto` with `contain-intrinsic-size: auto 7rem` remembers a skipped element's width too, so after a window narrows, off-screen entries keep their old width and the page scrolls sideways. Give long lists `contain-intrinsic-block-size` only.
- In Chrome a scroll container with no Tab-reachable child is itself a Tab stop: a roving-focus row that scrolls (the chips on a phone) needs `tabIndex={-1}` to stay one Tab stop.
- axe's target-size rule fails a link cut by the screen's edge or the sticky header: put what you scan in the middle of the view first.
- Swapping a server-rendered control for its Base UI version on idle can land between a pointerdown and its click and lose the press: hold the swap until the press ends.

Left over: nothing in this ticket.
