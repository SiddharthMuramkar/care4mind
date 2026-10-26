# Typefaces for IAST and Devanagari: research findings

Ticket: [Typefaces for IAST and Devanagari](../issues/07-typefaces-iast-devanagari.md) · Researched 2026-10-26 · Branch: research/typefaces-iast-devanagari

## Summary

- **Many good-looking fonts can't spell Concept names.** Of the 110 open-licence Latin font families tested, 51 cannot show at least one of the ticket's terms (vikṣepa, Ṛta, Ṣaḍdarśana), because they lack the dot-below letters ṛ ṣ ṭ ḍ ṇ ṃ ḥ. Fonts that fail include ones often picked for a "crafted" look: Bricolage Grotesque, Instrument Serif, Geist, Manrope, DM Sans, Lora, Newsreader, IBM Plex, Open Sans and Roboto. Fraunces shows the test terms but has no ṅ. Any typeface Design direction considers has to be checked against the letter list below.
- **Full IAST, capitals included, is common. Full ISO 15919 is rare.** 27 Latin-only families have every IAST letter in lower case and capitals. Only 11 families also have every extra ISO 15919 letter with its marks properly placed: Playfair, Noto Serif, Noto Serif Display, Noto Sans, Merriweather, Charis SIL, Gentium Book Plus, Gentium Plus, Andika, Libertinus Serif and Montserrat.
- **Google's ready-made font files leave out the marks that ISO 15919 needs.** The ISO 15919 letters r̥, l̥ and m̐ are a letter plus a separate combining mark. No subset that Google Fonts serves includes the ring below used in r̥ and l̥, and `next/font/google` serves exactly those subsets. In both Chrome and Firefox these letters then render wrongly. Showing ISO 15919 forms therefore means self-hosting a custom font subset with `next/font/local`. Plain IAST works either way.
- **62 of the 63 Google Fonts families with Devanagari render the three Devanagari test terms properly** (विक्षेप, क्लेश, स्थितप्रज्ञ). The odd one out is the handwriting face Dekko, which shows a halant (्) in every conjunct. They differ on rarer Sanskrit conjuncts:
  - Tiro Devanagari Sanskrit stacks every conjunct tested, in its traditional form.
  - Noto Serif Devanagari stacks all but one.
  - Most other families show a visible halant in two or more of them.
- **Shortlist.** All four pairings below are under the SIL Open Font License, and every family in them is available through `next/font/google`:
  - **A.** Playfair + Tiro Devanagari Sanskrit. A classical look, and the only shortlisted pairing with full ISO 15919.
  - **B.** Anek Latin + Anek Devanagari. Contemporary, made by an Indian foundry, with a width axis.
  - **C.** Literata + Eczar. Editorial, with a lively Devanagari.
  - **D.** Baloo 2 + Mukta. Friendly and rounded.

  Noto Serif with Noto Serif Devanagari is a plainer baseline with complete coverage.
- **How much the fonts weigh.** A page with IAST needs Google's `latin` and `latin-ext` files: 35–115 kB per style for the shortlisted faces, and more if an optical-size or width axis is used. The Devanagari file adds 88–258 kB. Unless it is preloaded, it downloads only on pages that contain Devanagari.
- **Effect on LCP and CLS.** With `font-display: swap`, the `next/font` default, fonts don't hold up LCP (the time until the page's main content appears). `next/font` keeps CLS (how much the page jumps while loading) down for Latin text with an adjusted fallback font. It does nothing for Devanagari text: until the web font arrives, Devanagari shows in an unadjusted system font.
- **System fonts work as a fallback for Devanagari, but not as the designed typeface.** Windows 11, Apple platforms and Android each ship a Devanagari font, so the text renders and costs no download:
  - Windows 11: Nirmala UI.
  - Apple devices: Kohinoor Devanagari and Devanagari Sangam MN.
  - Android: Noto Sans Devanagari.

  The look differs on each platform, though, and these fonts' handling of Sanskrit conjuncts was not tested here.

## Findings

Every source cited below was read on 2026-10-26. Measurements marked "measured here" came from the font files themselves (see How this was tested).

### Words used in this file

- A **typeface** is a design. A **font file** is one digital file of it, and a **family** is the set of its styles (regular, bold, italic).
- A **glyph** is a drawing in a font. A font's **character map** lists which characters it has glyphs for.
- **IAST** is the scholarly way of writing Sanskrit in Latin letters with diacritics: vikṣepa, Ṛta. **ISO 15919** is the international standard for writing Indian scripts in Latin letters. It agrees with IAST on most letters but adds or changes a few.
- A **combining mark** is an accent stored as its own character and drawn on the letter before it. The font must hold the mark's glyph and know where to place it.
- A **conjunct** is a cluster of Devanagari consonants with no vowel between them, such as क्ष (k + ṣ). A font can draw it as a joined or stacked shape. A font with no shape for the cluster draws the first consonant with a **halant** (also called virama; the ् stroke) and then the next one. That is legible, but it reads as a fallback in classical Sanskrit typesetting.
- **Shaping** is the step where the text engine turns characters into positioned glyphs. For Devanagari that includes building conjuncts.
- A **subset** is a cut-down font file that holds only some characters. **WOFF2** is the compressed font format browsers download.
- A **variable font** is one file that holds a continuous range of styles along **axes**: weight (`wght`), width (`wdth`), or optical size (`opsz`), which changes the letter shapes for small or large sizes.
- **`unicode-range`** tells a browser which characters a font file covers, so the browser downloads the file only when the page uses them. **Preload** tells the browser to fetch a font file at once, before it knows the file is needed.
- **LCP** (Largest Contentful Paint) is the time until the largest text block or image appears. **CLS** (Cumulative Layout Shift) measures how much content jumps while the page loads. NFR-02 caps them at 2.5 s and 0.1.
- **`next/font`** is the font loader built into Next.js, the framework the ticket assumes; [App framework and content back end](../issues/04-framework-and-content-back-end.md) still has to confirm it. `next/font/google` loads Google Fonts families, and `next/font/local` loads font files kept in the repo.

### How this was tested

- **Candidates.** Font files came from Google Fonts' own source repository ([github.com/google/fonts](https://github.com/google/fonts)), taken on 2026-10-26.
  - Devanagari: all 63 families that Google Fonts tags with Devanagari, out of 1,950 families in its catalogue ([Google Fonts metadata](https://fonts.google.com/metadata/fonts)).
  - Latin: 110 families, covering common text faces, scholarly faces, and display faces often used for a crafted look.
  - That makes 173 families in all. Two more requested families aren't on Google Fonts.
- **Coverage.** Each font's character map was read with fontTools 4.67.0.
- **Mark placement.** Each ISO 15919 letter-plus-mark sequence was shaped with HarfBuzz 15.0.0, with and without the font's mark-positioning features. A sequence counts as handled when the font repositions or merges the mark.
- **Conjuncts.** Every test string was rendered with HarfBuzz and the conjuncts were judged by eye. An automated check (comparing each conjunct with a forced-halant version of itself) missed cases that are plainly visible in the renders, so it was dropped.
- **Browsers.** Headless Chrome 156 and Firefox 158 on Linux rendered test pages that used either Google's served subset files or the full font files (measured here).
- **Sizes.**
  - What Google Fonts actually served on 2026-10-26 through its CSS API (`fonts.googleapis.com/css2`). These are the files `next/font/google` copies.
  - Custom WOFF2 subsets made with fontTools, keeping every OpenType feature and with hinting removed.
  - Sizes are in kB (1,000 bytes).
- **Licences.** Each family's `METADATA.pb` in the Google Fonts repository and each font's internal name table.

### The letters tested

- **IAST.** Lower case ā ī ū ṛ ṝ ḷ ḹ ṃ ḥ ṅ ñ ṭ ḍ ṇ ś ṣ, and capitals Ā Ī Ū Ṛ Ṝ Ḷ Ḹ Ṃ Ḥ Ṅ Ñ Ṭ Ḍ Ṇ Ś Ṣ. Each one is a single Unicode character. For example, ṝ is U+1E5D LATIN SMALL LETTER R WITH DOT BELOW AND MACRON ([Unicode 18.0 character data](https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt)).
- **ISO 15919 standard.**
  - ISO 15919:2001 is still current. ISO marks it "to be revised", and a second edition was approved on 2026-07-01 to go forward as a final draft ([ISO 15919:2001](https://www.iso.org/standard/28333.html), [ISO/DIS 15919](https://www.iso.org/standard/87130.html)).
  - The standard is sold, so it wasn't read. The extra letters below come from Unicode CLDR instead. CLDR says its Indic transliteration "follows the ISO 15919" standard and lists where it differs from older practice ([CLDR transliteration guidelines](https://cldr.unicode.org/index/cldr-spec/unicode-transliteration-guidelines)). The letters were taken from its rule file ([InterIndic-Latin.xml](https://github.com/unicode-org/cldr/blob/main/common/transforms/InterIndic-Latin.xml)).
- **ISO 15919 extras, as CLDR implements them:**
  - r̥ r̥̄ l̥ l̥̄ for ऋ ॠ ऌ ॡ. ISO keeps ṛ and ḷ for other letters: ड़ and ळ.
  - ē ō for long e and o.
  - ṁ for anusvara, and m̐ for candrabindu.
  - ẏ ḻ ṉ ṟ ṯ ḵ ẖ ġ ẇ for nukta letters and for letters used in other Indian scripts, and ĕ ŏ for the short and candra vowels.
- **How r̥ and m̐ are stored.** Unicode 18.0 has no single character for r̥ or l̥. They are stored as r or l followed by U+0325 COMBINING RING BELOW, and m̐ as m followed by U+0310 COMBINING CANDRABINDU ([Unicode 18.0 character data](https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt)). So a font needs the mark's glyph and positioning rules for it, not just a letter.
- **Test words.**
  - The ticket's ten terms.
  - A Sanskrit stress line of rarer conjuncts: द्ध द्व द्भ द्म द्ग ह्म ह्न ह्य ह्ल ङ्क ङ्ग ङ्ख ट्ट ड्ढ श्च श्व ष्ट्र र्त्स्न्य.
  - The words आकाङ्क्षा (ङ्क्ष), उद्भव, तत्त्व, श्रद्धा, लक्ष्मी, ॐ and सोऽहम्.

### Which open-licence typefaces display IAST correctly

All 173 families are under the SIL Open Font License 1.1 (OFL), according to each family's `METADATA.pb` in [github.com/google/fonts](https://github.com/google/fonts) (measured here). The table groups them by Latin coverage (measured here).

| Group | What it covers | Families |
| --- | --- | --- |
| Complete: IAST and ISO 15919 | Every IAST letter and capital, every ISO 15919 extra letter, and the marks for r̥, R̥, l̥, m̐ placed by the font | Playfair, Noto Serif, Noto Serif Display, Noto Sans (also has Devanagari), Merriweather, Charis SIL, Gentium Book Plus, Gentium Plus, Andika, Libertinus Serif, Montserrat |
| Full IAST | Every IAST letter and capital; some ISO 15919 extras missing | EB Garamond, Literata, Source Serif 4, Inter, Inter Tight, Gelasio, Libre Baskerville, Cormorant, Cormorant Garamond, Castoro, Cardo, Ysabeau, Ysabeau Office, Source Sans 3, Space Grotesk, Unbounded, Onest. With Devanagari: Baloo 2, Gotu, Mukta |
| IAST except ṝ ḹ | Every IAST letter except the rare long vocalic ṝ ḹ (and their capitals Ṝ Ḹ) | 32 families, including Anek Latin, Alegreya, Bitter, Crimson Pro, Spectral, Vollkorn, Young Serif, Recursive, Work Sans, Plus Jakarta Sans and Lexend. With Devanagari: Kripa. Tiro Devanagari Sanskrit, Hindi and Marathi lack only ḹ and Ḹ |
| Partial | Shows the test terms but lacks other IAST letters | 8 families. Fraunces lacks ṅ and Ṅ, as in saṅkalpa; Fira Sans lacks ṃ; Public Sans and Libre Caslon Text lack ḷ ṃ ṇ |
| Fails the test terms | Missing ṛ ṣ ḍ or similar | 102 families: 51 of the 110 Latin-only families, and 51 of the 63 Devanagari families, whose own Latin letters lack IAST |

Notes:

- **Well-known faces that fail the test terms:** Bricolage Grotesque, Instrument Serif, Instrument Sans, Geist, Manrope, DM Sans, Outfit, Sora, Figtree, Lora, Newsreader, IBM Plex Sans, IBM Plex Serif, Open Sans, Roboto, Roboto Flex, Playfair Display (the older family; Playfair is a different one), Hanken Grotesk, Schibsted Grotesk, Syne, Rubik, Karla, Mona Sans, Red Hat Display, Bodoni Moda and Atkinson Hyperlegible Next (measured here).
- **Capitals with marks.** EB Garamond positions the ring under lower-case r̥ and l̥ and the candrabindu on m̐, but not under capital R̥ and L̥ or on M̐ (measured here). Inter and Literata have all of IAST but no ring-below or candrabindu mark at all.
- **The missing ṝ and ḹ.** These letters are rare; they appear mainly in lists of the Sanskrit alphabet and in grammar. When a font has the parts (ṛ and a combining macron), HarfBuzz builds the letter from them. A render of Tiro's missing Ḹ showed this (measured here). Whether each browser does the same was not tested.

### ISO 15919 letters and Google's font subsets

Google Fonts serves each family as several subset files, each with a `unicode-range`. The `latin` and `latin-ext` ranges include only three combining marks: U+0304 macron, U+0308 and U+0329 ([Google Fonts CSS for Noto Serif](https://fonts.googleapis.com/css2?family=Noto+Serif:wght@100..900); the ranges were identical in every CSS response checked, for Noto Serif, Noto Serif Devanagari, Charis SIL, EB Garamond and Tiro Devanagari Sanskrit).

- No served subset of those five families covers U+0325, the ring below.
- U+0310, the candrabindu, appears only in Noto Serif's separate `math` subset, a different file from the one holding the letter m.
- The full Noto Serif file contains U+0325, U+0310 and U+0331, but Google's served `latin` and `latin-ext` files for it don't (measured here).

CSS defines what happens next:

- A font face covers only the characters that are both in its `unicode-range` and in its file ([CSS Fonts Level 4, §4.5](https://www.w3.org/TR/css-fonts-4/)).
- A browser tries to draw a letter and its combining marks with one font, and looks for another font when the first doesn't support the whole cluster ([CSS Fonts Level 4, §5.3](https://www.w3.org/TR/css-fonts-4/)).

**Browser test** (measured here). The test page used Google's served Noto Serif `latin` and `latin-ext` files with their ranges, and then the full font file. It did not include the `math` file, so how m̐ behaves with all of Google's subsets loaded is untested.

- Plain IAST rendered correctly in both browsers with both setups.
- With Google's files, Chrome 156 drew r̥, R̥, l̥, r̥̄, L̥ and m̐ entirely in the fallback font.
- With Google's files, Firefox 158 kept the letter in Noto Serif but drew the mark from another font, out of place.
- With the full font file, both browsers rendered every letter correctly.
- IAST stored decomposed, with each letter and its mark as separate characters, also broke in Firefox with Google's files: the dot under ṣ and the accent on ś were out of place. It rendered correctly when stored precomposed (NFC, one character per letter). This supports the NFC rule that [Sanskrit terms: storage and display](../issues/15-sanskrit-terms.md) already proposes.

What this means: if the site shows only IAST, stored as NFC, Google's subsets through `next/font/google` work. If it shows ISO 15919 forms such as r̥ or m̐, the Latin face must:

1. be one of the "Complete" families in the table above (Tiro's Latin also has these marks);
2. be self-hosted with `next/font/local` as a full file or as a custom subset that keeps U+0300–036F.

### Devanagari typefaces and conjuncts

All 63 Devanagari families render विक्षेप, क्लेश and स्थितप्रज्ञ with no missing glyphs (measured here). Two automated checks, plus the renders that were viewed, found that 62 of them form क्ष, क्ल, स्थ, प्र and ज्ञ as conjuncts. The exception is the handwriting face Dekko, which draws every conjunct, even क्ष and प्र, as a consonant with a halant followed by the next consonant (measured here).

The families differ on rarer conjuncts. The table covers the families judged by eye; renders were made with HarfBuzz, and the shortlisted ones were also checked in Chrome 156 (measured here).

| Family | Where a visible halant appeared instead of a conjunct | Its own Latin letters cover IAST? |
| --- | --- | --- |
| Tiro Devanagari Sanskrit | nowhere in the test set, including ङ्क्ष, ङ्ख, द्भ, ड्ढ and र्त्स्न्य | yes, except ḹ Ḹ; also has the ISO 15919 marks |
| Sahitya | nowhere in the test set | no |
| Noto Serif Devanagari, Noto Sans Devanagari | ङ्क्ष (in आकाङ्क्षा) | no; Noto Serif and Noto Sans supply it |
| Eczar | ङ्ख, ङ्क्ष | no |
| Anek Devanagari | ङ्ख, ङ्क्ष | no; Anek Latin supplies it |
| Baloo 2, Mukta, Gotu | ङ्ख, ङ्क्ष | yes |
| Martel | द्ध (बुद्धि, श्रद्धा) | no |
| Annapurna SIL | द्भ, द्ग, ड्ढ, ङ्क्ष | no |
| Yatra One | ङ्क, ङ्ग, ङ्ख, ङ्क्ष | no |
| Akshar | ह्न, ह्ल, ङ्क, ङ्ग, ङ्ख, ङ्क्ष | no |
| Kripa (added to Google Fonts in September 2026) | द्भ, द्ग, ह्न, ह्ल, ङ्क, ङ्ग, ङ्ख, ङ्क्ष | yes, except ṝ ḹ |

- **Tiro's Sanskrit cut.** Tiro Devanagari comes in Hindi, Marathi and Sanskrit versions. Google Fonts describes the Sanskrit version as one that "favours traditional forms of conjuncts". Its design follows the 19th- and 20th-century metal types of the Nirnaya Sagar Press, and it began as a typeface for the Murty Classical Library of India ([Tiro Devanagari Sanskrit on Google Fonts](https://fonts.google.com/specimen/Tiro+Devanagari+Sanskrit/about)).
- **Is a visible halant acceptable?** For rare clusters, that is a judgement about Sanskrit typesetting for the Research editor. This file only records where it happens.
- **Weights and styles** ([Next.js 16.4.3 font list](https://github.com/vercel/next.js/blob/v16.4.3/packages/font/src/google/font-data.json)):
  - Tiro Devanagari Sanskrit has only Regular and Italic. A bold Devanagari heading in it would be faked by the browser, as Chrome 156 did in the pairing test here.
  - Variable Devanagari families include Noto Serif Devanagari and Noto Sans Devanagari (width and weight), Anek Devanagari (width and weight), Baloo 2, Eczar, Akshar, Kripa and Matangi (weight).
- **Versions lag upstream.** The google/fonts copy of Tiro Devanagari Sanskrit is version 1.52 (measured here). Tiro's own repository has published compiled releases from v1.65, March 2026 ([TiroTypeworks/Indigo](https://github.com/TiroTypeworks/Indigo)). The newer version wasn't tested.
- **Not open: Brill.** The Brill typeface is a well-known scholarly font with full transliteration support. Its free licence is for non-commercial use only and says "Embedding the Font in HTML web pages is not allowed"; web use needs a separate paid licence ([Brill Fonts EULA](https://brill.com/page/510270)). It was not considered further.

### Shortlist: four pairings with character

Each pairing names a face for running text and one for display: large headings, Concept titles and the homepage. All are OFL. None declares a Reserved Font Name, so a custom subset of them needs no renaming (see Licences below). All are in Next.js 16.4.3's `next/font/google` font list and in its table of fallback metrics, which it uses to cut CLS ([font list](https://github.com/vercel/next.js/blob/v16.4.3/packages/font/src/google/font-data.json), [metrics](https://unpkg.com/next@16.4.3/dist/server/capsize-font-metrics.json)). Sizes in the tables below and in the comparison table were measured here.

**A. Classical press: Playfair + Tiro Devanagari Sanskrit**

- **Roles.** Playfair for Latin text and display. Tiro Devanagari Sanskrit for Devanagari in both.
- **Character.**
  - Playfair's optical-size axis runs "from the extremely small Agate (5pt) to the extremely big Needlepoint (1200pt)": low contrast for small text, "as high contrast as practically possible" for display. Its description calls it "well suited for general purpose typesetting" ([Playfair on Google Fonts](https://fonts.google.com/specimen/Playfair/about)).
  - Tiro is described above.
- **Coverage.** Playfair is in the "Complete" group. Tiro's Devanagari stacked every test conjunct. This is the only shortlisted pairing that shows ISO 15919 correctly, but only when self-hosted (see the ISO 15919 section above).
- **Variable.** Playfair has `opsz` 5–1200, `wdth` and `wght` 300–900, plus an italic file. Tiro is static: Regular and Italic.
- **Size balance.** Playfair's x-height is 0.415 em and the top of Tiro's Devanagari headline is at 0.620 em, so Devanagari looks large beside Playfair. Tiro's own Latin has an x-height of 0.477 em. Matching that designed balance would mean scaling Tiro to about 87%.

| Font | Files Google serves | Size | Custom subset (measured here) | Size |
| --- | --- | --- | --- | --- |
| Playfair | `latin` + `latin-ext`, weight axis only | 114.6 kB | IAST and ISO, weight only | 88.0 kB |
| Playfair | `latin` + `latin-ext`, with optical size | 220.0 kB | IAST and ISO, with optical size | 174.0 kB |
| Tiro Devanagari Sanskrit | `devanagari`, Regular | 183.9 kB | Devanagari | 117.4 kB |

**B. Contemporary Indian: Anek Latin + Anek Devanagari**

- **Roles.** Both for text and display. The width axis gives condensed or wide display settings.
- **Character.** Ek Type's Anek was made by 12 designers. Its description says "it is in the boldest weights that Anek comes alive", with "sharp terminals and tapered joineries", "ideal for setting titillating headlines or that magnetic word-mark" ([Anek Devanagari on Google Fonts](https://fonts.google.com/specimen/Anek+Devanagari/about)).
- **Coverage.**
  - Anek Latin has all of IAST except ṝ ḹ.
  - It has no ṁ, ring below or candrabindu, so no ISO 15919 r̥ or m̐.
  - Its Devanagari shows a visible halant in ङ्ख and ङ्क्ष.
  - Anek Devanagari's own Latin letters lack IAST, so Anek Latin must come first in the font list.
- **Variable.** Both have `wdth` 75–125 and `wght` 100–800. Neither has an italic, so the browser would fake a slanted style for italic text such as book titles in References.

| Font | Files Google serves | Size | Custom subset (measured here) | Size |
| --- | --- | --- | --- | --- |
| Anek Latin | `latin` + `latin-ext`, weight axis only | 81.3 kB | IAST, weight only | 47.1 kB |
| Anek Latin | `latin` + `latin-ext`, with width | 186.1 kB | | |
| Anek Devanagari | `devanagari`, weight axis only | 257.7 kB | Devanagari, weight only | 255.3 kB |
| Anek Devanagari | `devanagari`, with width | 726.2 kB | Devanagari, with width | 726.5 kB |

Anek Devanagari is the heaviest Devanagari file on the shortlist.

**C. Editorial: Literata + Eczar**

- **Roles.** Literata for Latin text, and for Latin display through its optical-size axis. Eczar for Devanagari text and display.
- **Character.**
  - Literata was made by TypeTogether as the typeface of Google Play Books, and is described as "a full-fledged digital publishing toolbox — headline, paragraph, and caption text" ([Literata on Google Fonts](https://fonts.google.com/specimen/Literata/about)).
  - Eczar, by Vaibhav Singh and Rosetta, was designed "to bring liveliness and vigor to multi-script typesetting in Latin and Devanagari". Its heaviest weights are "best suited for headlines" ([Eczar on Google Fonts](https://fonts.google.com/specimen/Eczar/about)).
- **Coverage.**
  - Literata has full IAST, capitals included.
  - It has no ṁ, ring below or candrabindu.
  - Eczar's Devanagari shows a visible halant in ङ्ख and ङ्क्ष.
  - Eczar's own Latin letters lack ṛ ṣ ḍ, so Eczar must never set IAST text.
- **Variable.** Literata has `opsz` 7–72 and `wght` 200–900, plus an italic. Eczar has `wght` 400–800.
- **Size balance.** Literata's x-height is 0.507 em and Eczar's headline is at 0.608 em. The ratio is 1.20, against 1.30 for Eczar's own Latin, so the Devanagari reads a little small.

| Font | Files Google serves | Size | Custom subset (measured here) | Size |
| --- | --- | --- | --- | --- |
| Literata | `latin` + `latin-ext`, weight axis only | 95.2 kB | IAST, weight only | 76.3 kB |
| Literata | `latin` + `latin-ext`, with optical size | 199.7 kB | IAST, with optical size | 162.1 kB |
| Eczar | `devanagari` | 87.9 kB | Devanagari | 89.6 kB |

**D. Friendly: Baloo 2 (display) + Mukta (text)**

- **Roles.** Baloo 2 for display and Mukta for text. Both families carry Latin and Devanagari, and both come from Ek Type.
- **Character.**
  - Baloo 2 is "an affable display typeface" whose lighter weights "retain Baloo's characteristic bounce" ([Baloo 2 on Google Fonts](https://fonts.google.com/specimen/Baloo+2/about)).
  - Mukta is "contemporary, humanist, mono-linear", built so that one script doesn't dominate the other ([Mukta on Google Fonts](https://fonts.google.com/specimen/Mukta/about)).
- **Coverage.**
  - Both have full IAST, capitals included.
  - Neither has ṁ, ring below or candrabindu.
  - Both show a visible halant in ङ्ख and ङ्क्ष.
- **Variable.** Baloo 2 has `wght` 400–800. Mukta is static, seven weights, each a separate set of files, and has no italic.
- **Tone.** Design direction must judge whether a rounded, playful tone suits a mental-health-adjacent site.

| Font | Files Google serves | Size | Custom subset (measured here) | Size |
| --- | --- | --- | --- | --- |
| Baloo 2 | `latin` + `latin-ext` | 60.6 kB | IAST | 34.0 kB |
| Baloo 2 | `devanagari` | 115.1 kB | Devanagari | 112.2 kB |
| Mukta, per weight | `latin` + `latin-ext` | 35.2 kB | IAST | 17.4 kB |
| Mukta, per weight | `devanagari` | 99.4 kB | Devanagari | 61.1 kB |

**Baseline, complete but plain: Noto Serif, Noto Serif Display and Noto Serif Devanagari.** These have complete IAST and ISO 15919. The Devanagari stacked every test conjunct except ङ्क्ष. Noto Sans also contains both Latin and Devanagari in one family, which suits interface text. All are variable on `wdth` and `wght`.

| Font | Files Google serves | Size | Custom subset (measured here) | Size |
| --- | --- | --- | --- | --- |
| Noto Serif | `latin` + `latin-ext`, weight axis only | 223.3 kB | IAST and ISO, weight only | 56.1 kB |
| Noto Serif Devanagari | `devanagari`, weight axis only | 126.9 kB | Devanagari | 123.4 kB |

Google's `latin-ext` file alone is 186.6 kB, because it covers far more than IAST.

**Comparison.**

| Pairing | Licence | IAST incl. capitals | ISO 15919 extras | Ten test terms | Rare Sanskrit conjuncts | Variable | Latin, Google / custom (one style) | Devanagari, Google / custom |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A. Playfair + Tiro Devanagari Sanskrit | OFL 1.1 | all | all (self-hosted only) | all render | all stacked | Latin yes; Devanagari no | 114.6 / 88.0 kB | 183.9 / 117.4 kB |
| B. Anek Latin + Anek Devanagari | OFL 1.1 | all but ṝ ḹ | partial: no ṁ, r̥, m̐ | all render | halant in ङ्ख, ङ्क्ष | both | 81.3 / 47.1 kB | 257.7 / 255.3 kB |
| C. Literata + Eczar | OFL 1.1 | all | partial: no ṁ, r̥, m̐ | all render | halant in ङ्ख, ङ्क्ष | both | 95.2 / 76.3 kB | 87.9 / 89.6 kB |
| D. Baloo 2 + Mukta | OFL 1.1 | all | partial: no ṁ, r̥, m̐ | all render | halant in ङ्ख, ङ्क्ष | Baloo 2 yes; Mukta no | 35.2 / 17.4 kB (Mukta) | 99.4 / 61.1 kB (Mukta) |
| Baseline: Noto Serif + Noto Serif Devanagari | OFL 1.1 | all | all (self-hosted only) | all render | halant in ङ्क्ष | both | 223.3 / 56.1 kB | 126.9 / 123.4 kB |

Why these four:

- Each covers the ten test terms with a Latin face that has full or near-full IAST.
- Each pairs that with a Devanagari face that renders every test term.
- Together they span four distinct tones: classical, contemporary Indian, editorial and friendly.

Families with good coverage but less distinct character were left out: Source Serif 4, EB Garamond, Gentium, Charis SIL, Merriweather, Inter and Space Grotesk. They remain sound substitutes for the Latin side of any pairing.

### Loading with `next/font`, and the effect on LCP and CLS

**How `next/font/google` works:**

- It downloads the CSS and font files at build time and serves them from the site's own domain: "No requests are sent to Google by the browser" ([Next.js 16.4.3 font docs](https://github.com/vercel/next.js/blob/v16.4.3/docs/01-app/03-api-reference/02-components/font.mdx)). Next.js 16.4.3 was the latest release ([npm registry](https://registry.npmjs.org/next/latest)).
- It copies every subset file listed in Google's CSS. Only the subsets named in the `subsets` option get a preload link ([find-font-files-in-css.ts](https://github.com/vercel/next.js/blob/v16.4.3/packages/font/src/google/find-font-files-in-css.ts); [font docs](https://github.com/vercel/next.js/blob/v16.4.3/docs/01-app/03-api-reference/02-components/font.mdx)).
- A font is preloaded only on the routes that use it ([font docs](https://github.com/vercel/next.js/blob/v16.4.3/docs/01-app/03-api-reference/02-components/font.mdx)).

**Settings that matter for these fonts:**

- **`subsets`.**
  - IAST letters such as ā, ś and ṛ sit in Google's `latin-ext` range, so a Latin face needs both `latin` and `latin-ext` ([Google Fonts CSS](https://fonts.googleapis.com/css2?family=Noto+Serif:wght@100..900)).
  - A preload link ignores `unicode-range` ([web.dev, Best practices for fonts](https://web.dev/articles/font-best-practices)). Preloading the `devanagari` file therefore costs every page that uses the font, including pages with no Devanagari.
  - Not preloading it means a page with Devanagari finds the font late, and its Devanagari swaps in later.
- **Variable axes.** `next/font/google` includes only the weight axis by default; other axes are added with the `axes` option ([font docs](https://github.com/vercel/next.js/blob/v16.4.3/docs/01-app/03-api-reference/02-components/font.mdx)). Adding optical size or width roughly doubles the Latin files (see the size tables).
- **`display`.** The default is `swap` ([font docs](https://github.com/vercel/next.js/blob/v16.4.3/docs/01-app/03-api-reference/02-components/font.mdx)). With anything other than `auto` or `block`, "text will always be visible during load, and LCP won't be blocked on an additional network request" ([web.dev, Optimize LCP](https://web.dev/articles/optimize-lcp)). `optional` avoids font-swap layout shifts entirely, at the cost of showing the fallback font if the web font arrives late ([web.dev, Best practices for fonts](https://web.dev/articles/font-best-practices)).

**CLS for Latin text.** `adjustFontFallback` is on by default. It builds a fallback font face from `local("Arial")` or `local("Times New Roman")`, with `size-adjust` and ascent, descent and line-gap overrides calculated from precomputed metrics for the Google family ([get-fallback-font-override-metrics.ts](https://github.com/vercel/next.js/blob/v16.4.3/packages/font/src/google/get-fallback-font-override-metrics.ts), [font-utils.ts](https://github.com/vercel/next.js/blob/v16.4.3/packages/next/src/server/font-utils.ts), [constants.ts](https://github.com/vercel/next.js/blob/v16.4.3/packages/next/src/shared/lib/constants.ts)). These metrics exist for every shortlisted family.

- **Kripa** is absent from 16.4.3's Google font list, so it would need `next/font/local`.
- **Kripa, Matangi and Libertinus Serif** have no precomputed metrics, so they get no adjusted fallback ([font list](https://github.com/vercel/next.js/blob/v16.4.3/packages/font/src/google/font-data.json), [metrics](https://unpkg.com/next@16.4.3/dist/server/capsize-font-metrics.json)).

**CLS for Devanagari text.**

- The adjusted fallback is Arial or Times New Roman, which have no Devanagari. Until the Devanagari web font arrives, the browser falls through to a system Devanagari font with no adjustment.
- The precomputed metrics are measured on Latin text, even for Devanagari families. For example, the entry for Noto Serif Devanagari lists only `latin` and `thai` widths ([metrics](https://unpkg.com/next@16.4.3/dist/server/capsize-font-metrics.json)).
- Devanagari fonts also declare deeper line metrics than Latin ones: a descent of 0.52–0.69 em for Anek Devanagari, Eczar, Baloo 2, Mukta and Noto Serif Devanagari, against 0.20–0.31 em for Playfair, Literata, Noto Serif and Anek Latin (measured here). So a line holding Devanagari may change height when fonts swap.
- The prototypes should measure this. Short inline terms such as "Vikṣepa (विक्षेप)" carry less risk than a shloka block.

**`next/font/local`** loads font files kept in the repo ([font docs](https://github.com/vercel/next.js/blob/v16.4.3/docs/01-app/03-api-reference/02-components/font.mdx)). It is the route for:

- custom subsets that keep the ISO 15919 marks;
- a single Latin file in place of Google's `latin` + `latin-ext` pair. For Noto Serif that is 56.1 kB instead of 223.3 kB (measured here).

Two of its options matter here:

- `adjustFontFallback` defaults to Arial.
- `declarations` can add descriptors such as `size-adjust`, for example to scale Tiro down to sit with Playfair.

**Licences when making a custom subset.**

- The OFL lets a site host the fonts itself and load them with `@font-face` ("explicitly allowed by the licensing model") ([OFL-FAQ, section 2](https://openfontlicense.org/ofl-faq)).
- Subsetting counts as modification ("Removing any parts of the font … is considered modification"), and a modified font may not use a Reserved Font Name ([OFL-FAQ 2.6](https://openfontlicense.org/ofl-faq); [Webfonts and Reserved Font Names](https://openfontlicense.org/webfonts-and-reserved-font-names)).
- None of the shortlisted fonts declares a Reserved Font Name. These candidates do, and would need their internal names changed in a custom subset (measured here):
  - Source Serif 4 and Source Sans 3: "Source"
  - Merriweather
  - Charis SIL: "Charis" and "SIL"
  - Gentium Book Plus and Gentium Plus: "Gentium" and "SIL"
  - Andika: "Andika" and "SIL"
  - Lora
  - Playfair Display

**If the framework is Astro rather than Next.js.** Astro 6 has its own Fonts API, with Google and local providers, per-font `subsets`, a `unicodeRange` option (since 6.0) and metric-adjusted fallbacks ([Astro configuration reference](https://github.com/withastro/docs/blob/main/src/content/docs/en/reference/configuration-reference.mdx), [Astro fonts guide](https://github.com/withastro/docs/blob/main/src/content/docs/en/guides/fonts.mdx)). Its Google provider wasn't checked for the subset issue above.

**What was not measured.** No lab or field LCP and CLS figures were taken (see Gaps). The size tables are the input for the performance budget in the Design direction prototypes.

### Are system fonts acceptable for Devanagari?

**What each platform ships:**

- **Windows 11** ships Nirmala UI, whose Devanagari was designed by John Hudson of Tiro Typeworks ([Nirmala UI](https://learn.microsoft.com/en-us/typography/font-list/nirmala-ui)). Mangal, Kokila, Aparajita, Sanskrit Text and Utsaah come only in an optional "Devanagari Supplemental Fonts" feature, which is not enabled by default ([Microsoft: fonts missing after upgrading](https://learn.microsoft.com/en-us/windows/deployment/windows-missing-fonts?pivots=windows-11)).
- **Apple** ([Apple system fonts](https://developer.apple.com/fonts/system-fonts/)):
  - iOS and iPadOS: Kohinoor Devanagari (Regular, Light and Semibold) and Devanagari Sangam MN are installed.
  - macOS also installs ITF Devanagari, Devanagari MT and Shree Devanagari 714.
  - Other Devanagari fonts are marked "downloadable": present only if the user has downloaded them. Examples are Tiro Devanagari Sanskrit, Hindi and Marathi, Gotu, Sama Devanagari and Adelle Sans Devanagari on both systems, and ITF Devanagari and the Bold and Medium weights of Kohinoor Devanagari on iOS.
- **Android** maps Devanagari to Noto Sans Devanagari, with Noto Serif Devanagari as the serif fallback ([AOSP fonts.xml](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/data/fonts/fonts.xml)). The file is marked deprecated as the source of installed fonts; device makers are asked to keep it in step with the newer configuration file "as much as possible". Noto Sans Devanagari was tested here: it stacks every test conjunct except ङ्क्ष.

**In favour of system fonts:**

- Windows 11, Apple platforms and Android all ship a Devanagari font, so Devanagari always renders on them.
- No download, so no effect on LCP and no font swap.

**Against system fonts as the designed typeface:**

- The design differs on each platform: a Windows visitor sees Nirmala UI, an iPhone visitor sees Kohinoor Devanagari or Devanagari Sangam MN, and an Android visitor sees Noto. No particular style can be relied on.
- That conflicts with the design bar in the [map](../map.md): custom, never template-like.
- Nirmala UI's and Kohinoor's handling of Sanskrit conjuncts wasn't tested; their font files weren't available here.

**In short:** system fonts are acceptable as the last step of the Devanagari font list, and as the fallback while a web font loads. Using them as the main Devanagari face trades design control for speed.

## Gaps and uncertainties

- **ISO 15919 text not read.**
  - The ISO standard is sold, so the list of extra letters comes from Unicode CLDR's implementation of it.
  - A second edition is at the final-draft stage and may change letters.
- **Only Google Fonts screened.** The screen covered 173 Google Fonts families. Open fonts outside Google Fonts were not screened, and the Latin list is a selection, not all 1,950 families.
- **Conjuncts judged by eye.** A non-specialist judged them on a fixed test list, and only about 20 of the 63 Devanagari families were viewed. The automated checks were unreliable for rare conjuncts and were dropped; they agreed with the renders only on the five common conjuncts in the test terms. The Research editor, or another reader of Sanskrit, should confirm the shortlist renders before a choice is made.
- **Browser coverage.**
  - Tested only in headless Chrome 156 and Firefox 158 on Linux. Safari and iOS, which use Apple's own text engine, and Windows were not tested.
  - The Firefox check used Noto Serif only.
- **System fonts.** Their conjunct depth was not tested. Android's newer font configuration file couldn't be fetched, so the Android mapping comes from the deprecated `fonts.xml`. An informal forum report says iOS 26 changed the default Devanagari font; Apple's documentation doesn't confirm it, and it wasn't verified.
- **No LCP or CLS measurements.** Only file sizes and the loading mechanism are reported. Real numbers need the Design direction prototypes on throttled mobile, with the checks chosen in [Front-end interaction stack](../issues/06-front-end-interaction-stack.md).
- **Versions and lists can drift.** Google Fonts copies can lag the designers' own releases; Tiro is 1.52 on Google Fonts against v1.65 upstream. Next.js's font list and fallback metrics were read at 16.4.3 and can change.
- **Pairing quality is a design judgement.** The x-height and headline figures are measurements; how well the faces sit together is for Design direction.
- **Missing letters assembled from parts.** Whether browsers build a missing ṝ or ḹ from a letter and marks was seen only in HarfBuzz renders.
- **Framework still open.** The framework is not settled, so `next/font` is assumed. Astro's Google provider wasn't checked for the subset issue.

## Sources

All read on 2026-10-26.

- ISO, [ISO 15919:2001](https://www.iso.org/standard/28333.html) and [ISO/DIS 15919](https://www.iso.org/standard/87130.html): catalogue pages, status and life cycle.
- Unicode CLDR, [Unicode Transliteration Guidelines](https://cldr.unicode.org/index/cldr-spec/unicode-transliteration-guidelines) and [InterIndic-Latin.xml](https://github.com/unicode-org/cldr/blob/main/common/transforms/InterIndic-Latin.xml).
- Unicode, [UnicodeData.txt, Unicode 18.0.0](https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt).
- Google Fonts:
  - [catalogue metadata](https://fonts.google.com/metadata/fonts)
  - CSS API responses such as [Noto Serif](https://fonts.googleapis.com/css2?family=Noto+Serif:wght@100..900), and the subset files they link to
  - the source repository [github.com/google/fonts](https://github.com/google/fonts) (`METADATA.pb` and font files)
  - specimen pages for [Tiro Devanagari Sanskrit](https://fonts.google.com/specimen/Tiro+Devanagari+Sanskrit/about), [Playfair](https://fonts.google.com/specimen/Playfair/about), [Anek Devanagari](https://fonts.google.com/specimen/Anek+Devanagari/about), [Eczar](https://fonts.google.com/specimen/Eczar/about), [Literata](https://fonts.google.com/specimen/Literata/about), [Baloo 2](https://fonts.google.com/specimen/Baloo+2/about) and [Mukta](https://fonts.google.com/specimen/Mukta/about)
- Tiro Typeworks, [Indigo repository](https://github.com/TiroTypeworks/Indigo).
- Brill, [Brill Fonts End User License Agreement](https://brill.com/page/510270).
- Next.js 16.4.3:
  - [Font module docs](https://github.com/vercel/next.js/blob/v16.4.3/docs/01-app/03-api-reference/02-components/font.mdx)
  - [find-font-files-in-css.ts](https://github.com/vercel/next.js/blob/v16.4.3/packages/font/src/google/find-font-files-in-css.ts)
  - [get-fallback-font-override-metrics.ts](https://github.com/vercel/next.js/blob/v16.4.3/packages/font/src/google/get-fallback-font-override-metrics.ts)
  - [loader.ts](https://github.com/vercel/next.js/blob/v16.4.3/packages/font/src/google/loader.ts)
  - [font-data.json](https://github.com/vercel/next.js/blob/v16.4.3/packages/font/src/google/font-data.json)
  - [font-utils.ts](https://github.com/vercel/next.js/blob/v16.4.3/packages/next/src/server/font-utils.ts)
  - [constants.ts](https://github.com/vercel/next.js/blob/v16.4.3/packages/next/src/shared/lib/constants.ts)
  - [capsize-font-metrics.json in the published package](https://unpkg.com/next@16.4.3/dist/server/capsize-font-metrics.json)
  - the [npm registry entry](https://registry.npmjs.org/next/latest)
- Astro docs: [configuration reference](https://github.com/withastro/docs/blob/main/src/content/docs/en/reference/configuration-reference.mdx) and [fonts guide](https://github.com/withastro/docs/blob/main/src/content/docs/en/guides/fonts.mdx), through context7.
- W3C, [CSS Fonts Module Level 4](https://www.w3.org/TR/css-fonts-4/), §4.5 (`unicode-range`) and §5.3 (cluster matching).
- web.dev, [Best practices for fonts](https://web.dev/articles/font-best-practices) and [Optimize Largest Contentful Paint](https://web.dev/articles/optimize-lcp).
- SIL, [OFL-FAQ](https://openfontlicense.org/ofl-faq) and [Webfonts and Reserved Font Names](https://openfontlicense.org/webfonts-and-reserved-font-names).
- Microsoft, [Nirmala UI](https://learn.microsoft.com/en-us/typography/font-list/nirmala-ui) and [How to add fonts that are missing after upgrading Windows](https://learn.microsoft.com/en-us/windows/deployment/windows-missing-fonts?pivots=windows-11).
- Apple, [System Fonts](https://developer.apple.com/fonts/system-fonts/).
- Android Open Source Project, [fonts.xml](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/data/fonts/fonts.xml).
- Measured here, with fontTools 4.67.0, HarfBuzz 15.0.0, Pillow 13.0.0 with libraqm 0.11.0, Google Chrome 156.0.8078.47 and Firefox 158.0.1. The inputs were font files from [github.com/google/fonts](https://github.com/google/fonts) and subset files served by fonts.gstatic.com. Raw files and scripts are kept outside the repo.
