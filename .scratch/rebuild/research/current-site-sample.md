# Sample the current site: content shape, navigation and brand: research findings

Ticket: [Sample the current site: content shape, navigation and brand](../issues/02-current-site-sample.md) · Researched 2026-10-26 · Branch: research/current-site-sample

## Summary

- **The content is page-builder markup, not structured data.** The sampled pages are built with Elementor, a drag-and-drop page builder, and padded with hand-pasted styling code and copy-paste formatting. On the Elementor pages, 55–97% of the characters are markup rather than words. References, shlokas and Sanskrit terms are formatted text, never separate fields. The one block-editor post sampled (Atman) is clean: 11% markup.
- **Sanskrit appears in four forms, often for one term on one page:**
  - Devanagari script, as in विक्षेप
  - IAST, the scholarly romanisation with diacritics, as in vikṣepa
  - informal ASCII spellings without diacritics, as in Vikshepa, Shvasa or Svasa
  - Hindi-style spellings, as in Panch, Vikaar and adhyatmik

  One Pali form (dukkha) appears in a Reference title. All 39 page and post titles are plain ASCII, and only 4 carry an English gloss.
- **Shlokas don't name their source consistently.** The homepage's shloka names no source at all. The Upa-Vikshepa page says "Chapter 1, Sutra 31", names the work (Patanjali's Yoga Sutra) only in the body text, and credits no translator anywhere.
- **References come in two shapes, both incomplete in places.** The article page has an APA-style list: 11 entries with author–date citations in the text, 5 of them with DOI links. The book pages have bare "Surname, Initials. (Year). Title." lines, with a shop, Google Books or `#` link and no publisher.
- **Content pages don't link to each other.** The sampled articles and lists have no internal links: every link goes out to other sites, mostly dharmawiki.org, DOIs, Google Books and Amazon. Visitors get around only through the homepage's cards and a 6-item menu, and that menu appears only at screen widths of 921 px or less. **Desktop visitors get no menu.**
- **71 media files, 37 MB of originals.** 41 PNG (31 MB, 15 of them over 1 MB), 25 JPEG, 2 WebP and 3 font files. One file has alt text, and that alt text is its file name. No page or post has public comments.
- **Brand:**
  - colours: a green-to-gold gradient (#549D42 → #DFC623) behind the header, the pages and the footer; pale apricot headings (#FFDCA4); amber and peach buttons; lime-to-white cards
  - logo: a framed logo image (WebP, 385×367)
  - site icon: a "Mind" JPEG
  - typefaces: the homepage loads 11 families, including Samarkan, a decorative 1993 shareware display font for Latin letters that is filed under "Hindi" fonts. Its Devanagari shloka is set in a typeface with no Devanagari letters.
- **The duplicate pages:**
  - `/`, `/home/` and `/home-2/` are three versions of one Elementor homepage, all created at the same second; `/` is the newest and the only one in use.
  - The two Text Books pages are different lists. `/text-books/` (in the menu) has four collapsible sections and 24 items with cover images from Amazon. `/text-books-2-2/` (linked from the homepage) has 11 books, 5 of which `/text-books/` lacks.

## Findings

### How the sample was taken

The **REST API** is the current site's public data interface. It answers with structured text (JSON) instead of a web page, and its `_fields` parameter limits a response to named fields ([WordPress REST API handbook, `_fields`][wp-fields]). Ten requests went to care4mind.org, each at least six seconds after the previous one. Every source in this note was read on 2026-10-26, and raw captures are kept outside the repo.

| # | What | Request |
| --- | --- | --- |
| R1 | site settings (name, tagline, front page, logo, icon) | [R1] |
| R2 | all pages, metadata only | [R2] |
| R3 | all posts, metadata only | [R3] |
| R4 | all media, metadata only | [R4] |
| R5 | full content of `/`, `/home/`, `/home-2/`, `/upavikshepaprofiling/`, `/text-books/`, `/text-books-2-2/`, `/indian-philosophy/` | [R5] |
| R6 | full content of the post `/atman/` | [R6] |
| R7 | all comments, metadata only | [R7] |
| R8 | the homepage HTML (menus, header, footer, brand) | [R8] |
| R9 | media dimensions and file sizes (`media_details`) | [R9] |
| R10 | the homepage's Elementor stylesheet (colours and fonts per element) | [R10] |

The REST responses were fresh (`x-cache: MISS`). The homepage HTML came from the site's page cache and was about 9 hours old (`age: 33043`). Its main content still matched the REST version exactly: same text, same 462 elements.

### Content shape at a glance

- **Pages** ([R2]):
  - 33 published pages, all top level, none with a featured image, all with comments closed.
  - Two use a non-default page template: the front page uses Elementor's `elementor_theme`, and Blog uses `page.php`.
  - 24 pages are set by the Astra theme (Astra provides the site's base look and layout) to full width, no sidebar, and no page title or featured image. That is the usual setup for a page laid out entirely in Elementor. The other 9 keep Astra's defaults: `/sample-page/`, `/institutes/`, `/text-books-2-2/`, `/inspirational-books/`, `/webpages-and-av-material/`, `/indian-philosophy/`, `/positive-psychology/`, `/blog/` and `/surveys/`.
- **Pages created at the same second, so probably copies of one another:**
  - All 16 pages that describe a questionnaire (the eight "Profiling" pages, `/triguna/`, `/karta-2/` and six more) were created at 2025-03-19 19:20:44. They were then edited one by one between 12 May and 30 Sep 2025 ([R2]).
  - The three homepages and Blog share 2025-02-23 22:12:20.
  - Concepts, Methods and Resources share 2025-03-05 19:21:50.
  - The newest edit anywhere is the front page, on 2025-10-16.
- **Posts** ([R3]):
  - 6 posts, all from November 2023, comments closed, no tags.
  - Four are in the category Concepts: Atman, Jiva, Jagat and Anubandha Chatushtaya. Two are in Uncategorized: Teertha yatra quiz and KarmaYoga Scale.
  - Two posts have a featured image: Atman and Jagat.

| Sampled item | Built with | Words | HTML characters | Share that is markup |
| --- | --- | --- | --- | --- |
| `/` (front page) | Elementor: 16 sections, 25 columns, 56 widgets | 429 | 49,849 | 94% |
| `/home/` | Elementor | 185 | 36,080 | 97% |
| `/home-2/` | Elementor | 281 | 39,715 | 95% |
| `/upavikshepaprofiling/` | Elementor: heading, text editor and accordion widgets | 1,978 | 31,958 | 55% |
| `/text-books/` | Elementor: one accordion widget | 295 | 22,335 | 91% |
| `/text-books-2-2/` | Elementor: one text-editor widget | 126 | 5,012 | 82% |
| `/indian-philosophy/` | Elementor: one text-editor widget | 103 | 5,554 | 88% |
| `/atman/` (post) | WordPress block editor | 409 | 2,826 | 11% |

Word and character counts were made from [R5] and [R6]. A **widget** is one Elementor building block, such as a heading, image, button or spacer. An **accordion** is a stack of collapsible panels that open on click.

### How Sanskrit terms appear, and the spellings found

Four forms appear in the samples ([R5], [R6], [R8]):

- **Devanagari**, the script Sanskrit is usually printed in, as in यद् भावं तद् भवति. It appears in shlokas, in parentheses after a term, and as section headings on the Atman post. No sampled element marks Devanagari, or any other non-English passage, with a language tag; the whole page is declared `en-US`. WCAG 2.2 success criterion 3.1.2, "Language of Parts" (Level AA, so within NFR-01), asks that the language of each such passage can be determined by software ([WCAG 2.2][wcag-312]).
- **IAST** (International Alphabet of Sanskrit Transliteration), the scholarly way of writing Sanskrit in Latin letters with diacritics, as in vikṣepa or prāṇāyāma. All of it is stored as precomposed Unicode letters (NFC), so a letter such as ṣ is one character rather than s plus a separate dot ([R5], checked with Python's Unicode database 16.0). The homepage uses ṃ (m with dot below) for anusvara, in "bhāvaṃ".
- **Informal ASCII**: plain keyboard letters with no diacritics, often with "sh" for ś or ṣ, "ee" for ī and "aa" for ā. Examples: Vikshepa, Shvasa, Teertha, Vikaar.
- **Hindi-style spellings**, which drop the final -a of the Sanskrit or spell it as it is pronounced in Hindi: Panch Klesha – Vikaar (title), adhyatmik (Atman post), Teertha yatra (title). The labels "Hindi-style" and "Pali" in this note are this note's reading, for the Research editor to confirm.
- **Pali**: one form, "dukkha", in the title of the Teasdale & Chaskalson (2011) Reference on the Upa-Vikshepa page. The page's own text uses duḥkha and Duhkha.

The same term often appears in several forms on one page. On `/upavikshepaprofiling/` ([R5]):

| Term | Forms on the page |
| --- | --- |
| vikṣepa | "Upa-Vikshepa" (title), "Upa Vikshepa", "Upa Vikṣepa", "vikṣepa", "Vikshepa", "citta-vikshepa", and inside the Devanagari compound विक्षेपसहभुवः |
| duḥkha | "Duhkha" (sub-heading), "duḥkha", "Duḥkha", and in Devanagari inside the shloka |
| aṅgamejayatva | "Anggamejayatva" (sub-heading), "angamejayatva", and "aṅgamejayatva" inside the transliterated shloka |
| śvāsa, praśvāsa | "Shvasa", "Prashvasa", "shvasa prashvasa", "Svasa, Prasvasa" (table caption), "śvāsapraśvāsa", "Śvāsā and Praśvāsā" (table) |
| prāṇāyāma | "pranayama", "prāṇāyāma" |
| dhyāna | "dhyana", "dhyāna" |
| Breathing practices | ASCII only: Kapalabhati, "Bastrika" (link text) and "Bhastrika" (body text), Nadishodhana / Nadishuddhi, Suryanuloma Viloma, Chandranuloma Viloma, Suryabhedana, Ujjayi, Bhramari |
| Others | IAST only: upādhis (with an English plural -s), antarāya, ekāgratā. ASCII only: raga-dvesha, adhyatmika, adhibhautika, Adhidaivika |

The other samples:

- **Atman post** ([R6]):
  - It names the language "Samskrit" and gives आत्मा, with both "Atman" and "Atma" in the text.
  - It pairs "Paramatama" with परमात्मा and "vakyanvayata" with वाक्यन्वयत. In both pairs the ASCII spelling doesn't match the Devanagari next to it letter for letter.
  - Its headings follow the pattern Devanagari, then a double danda (॥), then English: "परिचयः ॥ Introduction" and "आत्मतत्वम् ॥ Nature of Atma".
  - Other terms, all ASCII: Upanishads, Brahman, Maya, Karma, Indriyas, manas, buddhi, Prana, Sharira, punarjanma, Avidya, turiya, Vedavyasa, Advaita Vedantins, adhyatmik.
- **Homepage** ([R8]):
  - The shloka is यद् भावं तद् भवति, with the IAST "yad bhāvaṃ tad bhavati" beneath it.
  - "Vāta (air & space), Pitta (fire & water), and Kapha" puts a macron on only one of the three names.
  - Also: "Bharatiya", "Moksha", "Triguna (Sattva, Rajas, Tamas)", "Dosha", "Karma Yoga". `/home/` adds "A Rishi says...".
- **Titles and addresses** ([R2], [R3]): all ASCII. Addresses run the words together and drop glosses, for example `/panchkleshavikaarprofiling/` and `/knowyourvaluesahimsanon-violenceprofiling/`. One title is written in camel case: "KarmaYoga Scale".
- **NFR-03's example** (vikṣepa, viksepa, vikshepa): the current site uses "vikṣepa" and "Vikshepa". It never uses "viksepa", and it shows the Devanagari form only inside a compound.

### English glosses in titles

Of the 39 page and post titles ([R2], [R3]):

- **4 carry an English gloss in parentheses:** "Vikshepa (Distraction)", "Know Your Values: Ahimsa (Non-Violence) Profiling", "… Satya (Truthfulness) Profiling" and "… Asteya (Non-Stealing) Profiling". The Brahmacharya page in the same series has no gloss.
- **14 name a Sanskrit term with no gloss:** Triguna, Karta, Brahma Vihara, Sthitaprajna, Upa-Vikshepa Profiling, Panch Klesha – Vikaar Profiling, Know Your Values: Brahmacharya Profiling, Atman, Jiva, Jagat, Anubandha Chatushtaya, KarmaYoga Scale, Teertha yatra quiz and Dosha Survey.
- **The rest are English only:** Concepts, Methods, Know Your Mind, and so on.

Inside the text, glosses follow the pattern term (gloss): "Daurmanasya (Dejection/Frustration)", "Duḥkha (Suffering/Distress)", "Atman (referred to as Soul or Self)", "punarjanma (reincarnation)" ([R5], [R6]).

The REST API returns titles as HTML, so "Panch Klesha – Vikaar" arrives with the dash written as `&#8211;` ([R2]).

### How shlokas name their source

- **Homepage** ([R8]): Devanagari, then IAST, then "As are the thoughts…so are the manifestations." It names no work, verse or translator.
- **`/upavikshepaprofiling/`** ([R5]):
  - The heading reads "Shloka from Chapter 1, Sutra 31", without naming the work. The verse number appears as "॥ १.३१॥" in Devanagari digits after the Devanagari text, and as ".. 1.31.." (ASCII full stops standing in for the danda) after the IAST.
  - The work is named only in the body text: "The Patanjali Yoga Sutra 1.31".
  - A "Translation:" and a longer "Meaning:" follow, neither credited to anyone.
  - The reference list has "Shlokam.org. (2020, October 19). Yogasutra- Verse 1.31" and "Yoga Sutras of Patanjali. (n.d.). Google Books." Neither names a translator, and the in-text citations never cite Shlokam.org.
- **`/atman/`** ([R6]): "Brahma sutras, by Vedavyasa, (1-4-19 sutras)" gives the work, a traditional author, and chapter-section-sutra joined with hyphens. A quoted English sentence follows with no translator. A footnote marker "[1]" has no footnote.

### How References are formatted, and how complete they are

Three patterns appear:

1. **An article reference list** on `/upavikshepaprofiling/` ([R5]). It is APA-like: Author, Initials. (Year). Title. *Journal*, *volume*(issue), pages. Each entry ends with a "Read more." link, and the text cites by author and date, as in "(Tomar, 2024)".
   - Of the 11 entries, 5 link a DOI (a permanent identifier for a published paper) as a `https://doi.org/…` address. The rest link Google Books (2), Yogapedia (2), a journal website, and Shlokam.org.
   - Gaps, for example:
     - Aich (2013) gives one page number, "165", rather than a range.
     - Paikaray et al. (2018) has no pages.
     - Tomar (2024), a book, has a publisher but no place.
     - "Yoga Sutras of Patanjali (n.d.)" has no author, translator or publisher, only "Google Books".
     - The two Yogapedia entries have no author.
   - The list sits in a collapsed accordion panel titled "References".
2. **Book lists** on `/text-books/`, `/text-books-2-2/` and `/indian-philosophy/` ([R5]). Each entry reads "Surname, Initials. (Year). *Title*." plus a button.
   - No entry has a publisher, edition, place or ISBN (the book number).
   - Nothing distinguishes an author from a translator or editor; for example "Mascaro, J. (1994). The Bhagavad Gita.".
   - One entry reads "Khalil, G. (2001). The Prophet." although its own link points to an Amazon page whose address reads "Prophet-Kahlil-Gibran".
   - The buttons go to Google Books, archive.org, a publisher, or Amazon "Buy Now" pages. Ten of them ("More Info", 5 on each of two pages) point to `#`, which goes nowhere.
   - Course entries (IGNOU, NIOS) are a name, a sentence and a "Course Details" link.
3. **No reference list**: the Atman post has only the dangling "[1]" ([R6]), and the homepage has none ([R8]).

### Links between pages, and prose not in English

- **The sampled content pages have no internal links** ([R5], [R6]):
  - `/upavikshepaprofiling/`: 22 links. 11 go to sections of dharmawiki.org pages (Chitta, Roga, Pranayama), linked from Sanskrit terms. The other 11 are the reference links.
  - `/text-books/`: 24 links, all external or `#`.
  - `/text-books-2-2/`: 14 links, all external.
  - `/indian-philosophy/`: 7 links, all external or `#`.
  - `/atman/`: no links at all.
- **The homepage's 15 content links** ([R8]):
  - 9 internal: `/concepts/`, `/methods/`, `/resources/`, `/text-books-2-2/` and `/institutes/` once each, and `/dosha-survey/` four times.
  - 4 to the questionnaire app at `http://questionnaire.care4mind.org:8020`.
  - 1 button with no link.
  - 1 to dharmawiki.org.

  Every linked button opens in a new browser tab (`target="_blank"`), the internal ones included.
- **Duplicated content:** `/indian-philosophy/` repeats exactly the 7 books, cover images included, of the "Indian Psychology & Philosophy Books" section of `/text-books/` ([R5]).
- **Prose not in English:** the only non-English text in the samples is Sanskrit in Devanagari or IAST: two shlokas, Sanskrit terms in parentheses, and the Atman post's Devanagari headings. All running prose is English. No Hindi prose appears in the samples.

### What Elementor and the plugins put into the content, and what the REST API leaves out

What Elementor adds ([R5], [R8]):

- **Wrappers on everything.** A page sits inside `div.elementor.elementor-<page id>`, and every section, column and widget is a stack of nested `div`s. Each carries a random 7-character `data-id` plus `data-element_type`, `data-e-type` and `data-widget_type` attributes.
- **Spacing built from empty blocks.** The front page uses 17 "spacer" widgets (empty blocks that add vertical space) and 68 line breaks.
- **Entrance animations.** On `/`, 11 elements carry the class `elementor-invisible` and a `data-settings` value such as `{"animation":"fadeIn","animation_delay":800}`. Elementor 4.3.5's stylesheet hides that class (`.elementor-invisible{visibility:hidden}`) until its script reveals the element ([Elementor 4.3.5 frontend.min.css][el-css]). The same stylesheet's reduced-motion rule switches off only the `.animated` animations.
- **An auto-playing carousel.** The homepage carousel autoplays every 5 s and loops forever, with dots, pausing on hover or interaction ([R5]).
- **Content inside accordions.** On `/upavikshepaprofiling/`, the article body (the "Introduction" panel) and the References sit in an accordion. On `/text-books/`, all four sections do. Elementor generates IDs for the panels, such as `elementor-tab-title-9511`, and adds inline SVG plus and minus icons.
- **Alt text filled in automatically.** Alt text is the short description of an image that screen readers read aloud. When an image has none, Elementor falls back to the image's caption and then its title ([Elementor source, `get_image_alt`][el-alt]). So homepage images get file-name alts such as "52688095545_b9fa332de6_c" and "Jewellry making - 2" ([R8]).
- **Its own image crops.** 11 of the 18 images on `/` point to crops Elementor generated under `/wp-content/uploads/elementor/thumbs/`, and these don't appear in the media listing ([R4], [R8]).

What editors pasted into Elementor widgets ([R5]):

- **Style blocks inside the content.** Styling code (CSS) was pasted into the page text.
  - `/upavikshepaprofiling/` has a 1,215-character block. Its lines have line-break and paragraph tags (`<br />`, `</p><p>`) inserted between them, so as written the rules are not valid CSS and a browser would ignore them. Its class name `karma-karta-section`, and an id `karma-karta` used twice, look copied from the Karta page.
  - `/text-books/` has four such blocks, and each one loads the Inter font from Google again. `/text-books-2-2/` and `/indian-philosophy/` have one each.
- **Copy-paste formatting.** `/upavikshepaprofiling/` has 142 `<span style="font-weight: 400">` wrappers around ordinary text, which is typical of text pasted from a word processor. It also has 5 empty bold or heading elements.
- **Leftovers.** `/text-books/` has three HTML comments, and `/home-2/` shows a stray literal "&lt;br" as visible text.
- **No plugin output in the samples.** No sample contains plugin shortcodes or plugin markup: no Quiz Maker, TablePress or WPForms. The three tables on `/upavikshepaprofiling/` are plain HTML tables. The homepage still loads 46 stylesheets and 36 scripts (21 of them separate files), including Quiz Maker User Dashboard, Chart Builder, Survey Maker, TablePress, Menu Icons and a Starter Templates preview script, none of which the page uses ([R8]).

The block editor, by contrast, saves clean paragraphs (`<p class="wp-block-paragraph">`) on the Atman post. Its list of eight points is one paragraph broken by `<br>` rather than a real list ([R6]).

What the REST API leaves out:

- **Header, footer and menus.** They exist only in the page HTML ([R8]). WordPress's menu endpoints answer only users who can edit menus or posts ([WordPress source, `check_has_read_only_access`][wp-menus]).
- **All styling.** The REST content keeps Elementor's class names but none of the colours, typefaces, sizes or layout. Those live in Elementor's per-page stylesheet ([R10]), Elementor's site-wide "kit" stylesheet, and the Astra theme's CSS inlined into each page ([R8]). For example, nothing in [R5] shows that "Psychology" is set in Samarkan.
- **Elementor's own layout data.** The page `meta` field exposes only Astra's 27 layout settings and an empty `footnotes` field ([R2]). The structured data Elementor builds each page from is not exposed, so a scrape gets rendered HTML and the `data-settings` attributes, not widget settings.
- **Nested media fields.** Asking for `media_details.width` and similar nested fields returned no `media_details` at all ([R4]). Asking for the whole field worked ([R9]). The handbook says nested `_fields` are supported from WordPress 5.3 ([wp-fields]); why it failed here wasn't investigated.
- **Images outside the media library.** Elementor's crops and the 31 book covers hotlinked from Amazon's image server (`m.media-amazon.com`) are not in the media listing ([R4], [R5]). Hotlinking means the page displays an image stored on someone else's server.
- **A blank site name.** The site name is blank and the tagline is "Indic ways to invoke a perfect balanced mind" ([R1]). The homepage's `<title>` is the tagline alone. The page has no meta description, no Open Graph tags (the previews social sites show) and no `h1` heading ([R8]).

### Media files: types, sizes and alt text

From [R4] and [R9]:

| Type | Files | Total size | Typical size | Largest | Pixel widths |
| --- | --- | --- | --- | --- | --- |
| PNG | 41 | 30.7 MB | median 729 kB | 2.52 MB | 200–1920 |
| JPEG | 25 | 6.0 MB | median 280 kB | 0.47 MB | 378–2000 |
| WebP | 2 | 0.1 MB | about 43 kB | 47 kB | 385–600 |
| Fonts (1 OTF, 2 TTF) | 3 | 0.4 MB | | 368 kB (Shobhika) | |
| **All** | **71** | **37.3 MB** | | | |

- **Large files.** 15 files are over 1 MB, all PNG, and 33 are over 300 kB. The largest are 1024×1024 PNGs of 2.2–2.5 MB with long descriptive file names, such as `rustic-raw-gold-ore-649489767.png`. Sizes are of the originals; WordPress also keeps resized copies of each.
- **Alt text.** 1 of 71 files has alt text, and it is a file name: "brahma, madurai, meenakshi amman temple-1576032.jpg".
- **Captions.** 4 files have captions: the three fonts are captioned with their own names, and the logo with a URL.
- **Attachments.** Only 5 files are attached to a page or post. Two of them are attached to IDs 10 and 11, which aren't public pages or posts.
- **Upload folders.** Files sit in the folders 2023/09 (6), 2023/10 (13), 2023/11 (14), 2024/05 (29), 2025/02 (8) and 2025/03 (1). Two files dated 2025-02-23, including the current logo, sit in 2023/09.
- **Logo drafts.** At least 9 logo files are stored, from `logo.png` (2023, 300×300) through "Logo-with-frame-2/3/4" (2024) to the current cropped WebP (2025).
- **Fonts in the media library.** Shobhika-Regular.otf and two Samarkan TTFs are stored there, and the Custom Fonts plugin serves them from it ([R8]).

### Public comments

There are none. The comments endpoint returns an empty list with `X-WP-Total: 0` ([R7]). For an anonymous visitor it lists only approved comments ([WordPress REST API handbook, comments][wp-comments]). Every page and post has comments closed ([R2], [R3]). The homepage still advertises a comments feed (`/comments/feed/`) ([R8]).

### Menu items and where they point

The header has one navigation menu, "Site Navigation: Header Menu", and it lives in the mobile pop-up ([R8]):

| Item | Points to |
| --- | --- |
| Home | `https://care4mind.org/` (a custom link) |
| Triguna | `/triguna/` |
| Concepts | `/concepts/` |
| Text Books | `/text-books/` (not the `/text-books-2-2/` the homepage links to) |
| Courses | `/institutes/` |
| Uncategorized | `/category/uncategorized/` (the category archive) |
| └ Dosha Survey | `/dosha-survey/` (a sub-item) |

- **Desktop header.** Above 921 px wide, Astra hides the mobile header (`@media (min-width:922px){#ast-mobile-header{display:none;}}`, with the break point `"break_point":"921"`). The desktop header that shows instead has no menu ([R8]). It holds three things:
  - the logo, which links home and has empty alt text
  - the word "Care4Mind" in white, in the Mangal font via an inline style
  - "Facebook" and "Twitter" links whose addresses are empty and which open a new tab

  The site-title link is present but empty.
- **The menu's reach.** It omits Methods, Resources, Blog, all eight Profiling pages and every post.
- **Footer.** One bar reads "Copyright © 2026 | Powered by IIT Bombay-SJMSOM & HUA", with no links, menu or contact details ([R8]).

### Logo, site icon, colours and typefaces

**Logo and icon** ([R1], [R8], [R9]):

- **Logo.** Media 643, a WebP file of 385×367 px (47 kB), named `cropped-Logo-with-frame-4-and-text-removebg-preview…`: a cropped, background-removed copy of "Logo with frame 4 and text". It shows at 161×153 px with empty alt text.
- **Site icon** (the small image in browser tabs). Media 457, `Mind-2.jpeg`, 1024×1024 px (317 kB). It is served as 32 px and 192 px icons and as the Apple touch icon, from WordPress's resized copies.
- This note records file facts only; the artwork itself wasn't viewed.

**Colours.** Most come from the Astra theme's inline CSS ([R8]); the homepage-only ones come from Elementor's stylesheet for that page ([R10]):

| Colour | Where |
| --- | --- |
| #549D42 → #DFC623 (green to gold gradient) | header bar, page background, footer bar |
| #3E7A32 (dark green) | 2 px line under the header and above the footer |
| #FFDCA4 (pale apricot) | all theme headings, footer text, homepage headings |
| #FFD577 (light gold) | homepage "Karma Yoga" heading |
| #F6A970 (peach) | theme buttons, text selection, mobile menu icon |
| #FFAA00 (amber) | homepage buttons |
| #A7D821 → #FFFFFF (lime to white) | homepage cards |
| #06850D, #549D42 (greens) | homepage card titles |
| #281919 (near-black brown) | homepage card text |
| #FCF1C5 (cream) | mobile menu background |
| #557DBC, #7ACDEE | Facebook and Twitter icons |

- **Theme palette left at defaults.** Astra's own "global palette" is still mostly blues and greys, such as #046BD2. The custom colours above override it almost everywhere.
- **Per-page palettes.** The pasted style blocks bring their own colours, such as #2C3E50, #2980B9, #F9F9F9, #E2FFB3 and #1A4D7A ([R5]).

**Typefaces.** 11 families load on the homepage ([R8], [R10]). "Scripts covered" comes from each family's Google Fonts metadata ([Google Fonts METADATA.pb files][gf]).

| Family | Used for | Loaded from | Scripts covered | Licence |
| --- | --- | --- | --- | --- |
| DM Sans | body text | Google Fonts | Latin | OFL |
| Noto Sans Devanagari | all theme headings h1–h6, including English ones; homepage card titles | Google Fonts, plus a second copy saved locally by Elementor | Devanagari, Latin | OFL |
| Inter | mobile menu; also loaded again by the pasted style blocks | Google Fonts | Latin and others | OFL |
| Encode Sans Condensed | homepage IAST line, tagline, card text | local (Elementor) | Latin | OFL |
| Inter Tight | homepage English gloss of the shloka | local (Elementor) | Latin and others | OFL |
| Instrument Serif | homepage **Devanagari** shloka heading; "Open the doors…" | local (Elementor) | **Latin only** | OFL |
| Cormorant Garamond | "Ancient Indian Wisdom" button; `/text-books-2-2/` headings | local (Elementor) | Latin and others | OFL |
| Roboto, Roboto Slab | Elementor's site-wide default fonts, referenced as variables; their values sit in the kit stylesheet, which wasn't fetched | local (Elementor) | | |
| Samarkan (normal and oblique) | homepage section headings "Psychology", "Questionnaires & Surveys", "Karma Yoga…" | media library, through the Custom Fonts plugin | Latin letters only, in a decorative style that FontSpace files under "Hindi" | listed as shareware by Titivillus Foundry, 1993 ([FontSpace][samarkan]) |
| Shobhika | declared (`@font-face`) but used nowhere on the homepage | media library, through the Custom Fonts plugin | Devanagari, Latin, Cyrillic | OFL 1.1, from IIT Bombay's SandHI project ([Shobhika repository][shobhika]) |

- **A Devanagari heading in a font with no Devanagari.** Instrument Serif has no Devanagari letters, so the homepage shloka is drawn in whatever Devanagari font the visitor's device has.
- **Mangal is referenced but never loaded.** The header word "Care4Mind" asks for Mangal, a Microsoft Devanagari font that ships with Windows ([Microsoft Typography][mangal]). Devices without it fall back to a generic serif.
- **Icon fonts.** The homepage also loads four of them: Dashicons, Genericons, Elementor's icons, and Font Awesome twice (one copy from Menu Icons, one from Elementor) ([R8]).

### How `/`, `/home/` and `/home-2/` differ

All three were created at 2025-02-23 22:12:20 and are Elementor pages ([R2], [R5]):

| | `/` | `/home/` | `/home-2/` |
| --- | --- | --- | --- |
| ID, title, address name | 1371, "Home_TH1", `home-2-2`; set as the front page ([R1]) | 639, "Home", `home` | 1145, "Home", `home-2` |
| Last edited | 2025-10-16 | 2025-04-05 | 2025-04-26 |
| Page template | `elementor_theme` | default | default |
| Top section | 3-image auto-playing carousel, then the shloka, its IAST and gloss, and a tagline | one still image (Sculptor-3), then the same text | carousel, then the same text |
| Six "Psychology" cards | buttons go to `/concepts/`, `/methods/`, `/resources/`, `/text-books-2-2/`, the questionnaire app, `/institutes/` | five buttons go to dharmawiki.org's main page and one ("Questionnaires...") to the questionnaire app; the first is labelled "A Rishi says..." | same as `/` |
| Questionnaire section | "Questionnaires & Surveys": 4 "Questionaire" cards (3 to the questionnaire app, 1 with no link) and 4 survey cards (Dosha and three placeholders), all to `/dosha-survey/` | a Dosha call to action ("Discover your Ayurvedic Dosha…", button "Dosha Survey!"), then "Questionnaires" with 3 unlinked images (Karmayoga, Spiritual Climate, Triguna Scale) | "Questionnaires": 1 card to the questionnaire app; "Surveys": 3 cards (Dosha and 2 reusing the "Tradition and Texts" text), all to `/dosha-survey/` |
| End of page | "Karma Yoga: An Indian Perspective of Work" image (unlinked); "Open the doors to your inner potential !!!" with a dharmawiki.org button | same | same |
| Animated elements | 11 | 0 | 4 |
| Words | 429 | 185 | 281 |

`/` is the newest and the only one in use: it is the front page, and the menu's "Home" item points to it. Its card titles spell "Questionaire", and its Tradition and Texts button reads "Persepctives..." ([R5]).

### How the two Text Books pages differ

| | `/text-books/` | `/text-books-2-2/` |
| --- | --- | --- |
| ID, created, last edited | 972, 2025-03-16, 2025-03-16 | 79, 2023-10-04, 2025-04-26 |
| Linked from | the menu's "Text Books" | the homepage's Tradition and Texts card ("Persepctives...") |
| Layout | full width, page title hidden; one Elementor accordion with 4 collapsible sections | Astra defaults (page title not switched off); one text-editor widget |
| Sections | Psychology Courses (3 entries); Indian and Western Textbooks (6 books, with an inner heading "Psychology Books"); Indian Psychology & Philosophy Books (7); Inspirational Books (8) | Psychology Courses (2 entries: IGNOU UG and PG together, then NIOS); Indian and Western Textbooks (11 books) |
| Images | 24 covers hotlinked from Amazon, alt text = book title | none |
| Buttons | Course Details, Read Online, Learn More, Google Books, 5 "More Info" to `#`, 8 Amazon "Buy Now" | UG Psychology, PG Psychology, Learn More, Read Online, Google Books |
| Only on this page | the Indian Psychology & Philosophy list (the same as `/indian-philosophy/`) and the Inspirational list | Galotti (2008), Stillings et al. (1987), Lopez et al. (2021), Rao & Paranjpe (2016), Parker (2015) |
| Size | 295 words in 22,335 characters of HTML | 126 words in 5,012 characters |

The six textbooks on `/text-books/` all appear on `/text-books-2-2/` as well ([R5]).

## Gaps and uncertainties

- **Only part of the site was read.** The full content of 6 items (plus `/home/` and `/home-2/` for comparison) was read. The other 25 pages and 5 posts were seen only as metadata. They may hold other Sanskrit spellings, plugin shortcodes, TablePress tables or different link patterns. `/inspirational-books/` wasn't compared with the "Inspirational Books" section of `/text-books/`.
- **Header, footer and menu were seen on the homepage only.** Other pages may differ: the Header Footer Elementor plugin is active, though the homepage uses Astra's own header.
- **Nothing was rendered in a browser.** No page was opened in a browser. The missing desktop menu, the font fallbacks for the Devanagari heading and the Mangal wordmark, and the effect of the broken style block are read from HTML and CSS, not seen.
- **Elementor's kit stylesheet wasn't fetched**, to stay within about ten requests. Its global colours and typography (the values behind `--e-global-color-primary` and the Roboto fonts) are unknown.
- **The logo and site-icon artwork weren't viewed.** Only their file metadata is reported.
- **Media use is unknown.** Which of the 71 media files are used, and where, needs the full scrape.
- **Samarkan's licence comes from a distributor's listing**, not from the font's own licence file. Whether anyone registered it is unknown. This matters to the typefaces ticket.
- **The nested `_fields` failure** for `media_details` wasn't investigated.
- **The 9-hour cache.** The homepage HTML came from the page cache. Its content matched the REST API exactly, but the cached header and footer could differ from a fresh copy.
- **Subject-matter questions are left open.** Whether a spelling is Hindi-style or Pali, whether "Paramatama" and "vakyanvayata" are typos, and which edition and translator each shloka and book Reference should name are for the Research editor. This note reports what the pages show and decides nothing.

## Sources

All read on 2026-10-26. The care4mind.org requests were made read-only, without logging in; server times are given in GMT.

- [R1] REST API index, site settings fields (11:43:53)
- [R2] pages listing, metadata fields (11:44:09)
- [R3] posts listing, metadata fields (11:44:43)
- [R4] media listing, metadata fields (11:44:53)
- [R5] full content of 7 pages (11:45:25)
- [R6] full content of the Atman post (11:45:36)
- [R7] comments listing, metadata fields (11:45:47)
- [R8] homepage HTML (served from cache, `age: 33043`)
- [R9] media `media_details` (11:51:36)
- [R10] homepage Elementor stylesheet `post-1371.css` (served from cache; last modified 24 Oct 2026)
- [WordPress REST API handbook: Global Parameters, `_fields`][wp-fields]
- [WordPress REST API handbook: Comments][wp-comments]
- [WordPress code reference: `WP_REST_Menu_Items_Controller::check_has_read_only_access()`][wp-menus]
- [Elementor source: `includes/controls/media.php`, `get_image_alt()`][el-alt]
- [Elementor 4.3.5 `assets/css/frontend.min.css` (WordPress.org plugin repository)][el-css]
- Google Fonts metadata ([gf]): [Instrument Serif][gf-is], [Noto Sans Devanagari][gf-nsd], [Encode Sans Condensed][gf-esc], [Inter Tight][gf-it], [Cormorant Garamond][gf-cg], [DM Sans][gf-dm], [Inter][gf-in]
- [Shobhika repository (IIT Bombay SandHI)][shobhika]
- [Samarkan on FontSpace][samarkan]
- [Microsoft Typography: Mangal font family][mangal]
- [WCAG 2.2, Success Criterion 3.1.2 Language of Parts][wcag-312]
- Context: [docs/current-site.md](../../../docs/current-site.md), [docs/project-brief.md](../../../docs/project-brief.md)

[R1]: https://care4mind.org/wp-json/?_fields=name,description,url,home,page_on_front,page_for_posts,show_on_front,site_logo,site_icon,site_icon_url
[R2]: https://care4mind.org/wp-json/wp/v2/pages?per_page=100&orderby=id&order=asc&_fields=id,date,modified,slug,link,title,parent,menu_order,template,comment_status,featured_media,status,meta
[R3]: https://care4mind.org/wp-json/wp/v2/posts?per_page=100&orderby=id&order=asc&_fields=id,date,modified,slug,link,title,status,categories,tags,comment_status,ping_status,featured_media,format,sticky,template
[R4]: https://care4mind.org/wp-json/wp/v2/media?per_page=100&orderby=id&order=asc&_fields=id,date,slug,link,title,alt_text,caption,mime_type,media_type,media_details.width,media_details.height,media_details.filesize,source_url,post
[R5]: https://care4mind.org/wp-json/wp/v2/pages?per_page=10&slug=home-2-2,home,home-2,upavikshepaprofiling,text-books,text-books-2-2,indian-philosophy&_fields=id,slug,link,title,content,excerpt,template
[R6]: https://care4mind.org/wp-json/wp/v2/posts?slug=atman&_fields=id,slug,link,title,content,excerpt,categories,featured_media,template
[R7]: https://care4mind.org/wp-json/wp/v2/comments?per_page=100&_fields=id,post,parent,date,status,type
[R8]: https://care4mind.org/
[R9]: https://care4mind.org/wp-json/wp/v2/media?per_page=100&orderby=id&order=asc&_fields=id,mime_type,media_details
[R10]: https://care4mind.org/wp-content/uploads/elementor/css/post-1371.css?ver=1792807609
[wp-fields]: https://developer.wordpress.org/rest-api/using-the-rest-api/global-parameters/#_fields
[wp-comments]: https://developer.wordpress.org/rest-api/reference/comments/
[wp-menus]: https://developer.wordpress.org/reference/classes/wp_rest_menu_items_controller/check_has_read_only_access/
[el-alt]: https://github.com/elementor/elementor/blob/main/includes/controls/media.php
[el-css]: https://plugins.svn.wordpress.org/elementor/tags/4.3.5/assets/css/frontend.min.css
[gf]: https://github.com/google/fonts/tree/main/ofl
[gf-is]: https://raw.githubusercontent.com/google/fonts/main/ofl/instrumentserif/METADATA.pb
[gf-nsd]: https://raw.githubusercontent.com/google/fonts/main/ofl/notosansdevanagari/METADATA.pb
[gf-esc]: https://raw.githubusercontent.com/google/fonts/main/ofl/encodesanscondensed/METADATA.pb
[gf-it]: https://raw.githubusercontent.com/google/fonts/main/ofl/intertight/METADATA.pb
[gf-cg]: https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/METADATA.pb
[gf-dm]: https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/METADATA.pb
[gf-in]: https://raw.githubusercontent.com/google/fonts/main/ofl/inter/METADATA.pb
[shobhika]: https://github.com/Sandhi-IITBombay/Shobhika
[samarkan]: https://www.fontspace.com/samarkan-font-f11675
[mangal]: https://learn.microsoft.com/en-us/typography/font-list/mangal
[wcag-312]: https://www.w3.org/TR/WCAG22/#language-of-parts
