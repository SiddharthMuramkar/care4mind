# Typefaces for IAST and Devanagari

Type: research
Mode: AFK
Track: site
Status: resolved
Blocked by: none
Map: [Care4Mind.org rebuild](../map.md)

## Question

Which open-licence typefaces display IAST correctly, including capitals and the extra ISO 15919 letters? Which pair well with a Devanagari typeface that renders conjuncts correctly?

For each candidate pairing, record:

- its licence
- its coverage, tested against these terms: vikṣepa, Ṛta, kleśa, ātman, brahmavihāra, sthitaprajña, Ṣaḍdarśana, विक्षेप, क्लेश, स्थितप्रज्ञ
- whether it comes as a variable font
- its file size after subsetting
- how it loads with the likely framework (for example `next/font`), and its effect on LCP and CLS

Also say whether system fonts are acceptable for Devanagari. Shortlist three or four pairings with real character, covering both text and display use.

Nobody decides here. The facts feed [Design direction](21-design-direction.md) and [Sanskrit terms: storage and display](15-sanskrit-terms.md).

## Answer

Researched 2026-10-26. Full findings: [`typefaces-iast-devanagari.md`](https://github.com/SiddharthMuramkar/care4mind/blob/research/typefaces-iast-devanagari/.scratch/rebuild/research/typefaces-iast-devanagari.md) on branch `research/typefaces-iast-devanagari` (pushed, never merged; commit `6ed3b02`).

- Of 110 open-licence Latin families tested, 51 can't spell the test terms, including Geist, Manrope, Bricolage Grotesque, Instrument Serif and Lora. Only 11 cover full ISO 15919 with marks placed properly.
- Google's font subsets (what `next/font/google` serves) drop the ring-below mark in r̥ and l̥. Showing ISO 15919 needs self-hosted fonts through `next/font/local`.
- 62 of 63 Devanagari families render the test terms. Tiro Devanagari Sanskrit stacked every rare Sanskrit conjunct tested; most others show a visible halant in some.
- Without preload, the Devanagari file (88–258 kB) loads only on pages that use it. `next/font`'s layout-shift fix covers Latin only; Devanagari falls back to an unadjusted system font.

**Shortlist, not decided** (all SIL OFL):

- A. Playfair + Tiro Devanagari Sanskrit (classical): the only pairing with full ISO 15919 and the best conjuncts. Tiro has one weight and needs scaling to about 87%.
- B. Anek Latin + Anek Devanagari (contemporary Indian): variable, but lacks ṝ/ḹ and italics, and has the heaviest Devanagari file.
- C. Literata + Eczar (editorial): full IAST and a light Devanagari; Eczar must not set IAST.
- D. Baloo 2 + Mukta (friendly, rounded): full IAST and the smallest files.
- Baseline: Noto Serif + Noto Serif Devanagari: complete but plain.

The [Design direction](21-design-direction.md) picks.

**Gaps** (all listed in the findings): Only Google Fonts families were screened. Rendering was tested only in headless Chrome and Firefox on Linux, not Safari, iOS or Windows. Conjunct quality was judged by eye by a non-specialist, so the Research editor should confirm. No LCP or CLS was measured.
