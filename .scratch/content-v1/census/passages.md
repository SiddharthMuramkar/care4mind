# Census: works and passages

Ticket 04 of [content v1](../spec.md). Every verse the 16 description pages quote, page by page, mapped to its passage (`work/locator`) and to the translation each page uses; then the works, each with its passages. Pages are keyed by their address on the current site, never by a Concept slug: the batch tickets choose those.

6 works, 43 passages, 38 translations. The 16 pages quote verses 56 times; Atman, Jiva and Jagat quote none.

## How to use it

- A Concept quotes a verse as `{ passage, translation, meaning }`. Take `passage` and `translation` from your page's table. "none" means the page gives no translation: the quote names none, and never borrows another page's.
- **Meaning** says whether the page prints a line labelled "Meaning" under the verse. That line is the page's own reading: keep it on your Concept's quote as `meaning`, as the page writes it. It is never a translation.
- **On the page** says where the verse sits. *Top* is above the page's "Introduction" accordion: those verses are the Concept's `verses`, in this order. *In section* is a verse inside a section: a `verse` block there. Headings are quoted as the page prints them.
- The pages print each verse's number after it ("॥ २.३०॥", ".. 2.30..", "2-54"), and many print it again before the translation ("30. Non-killing…"). The passages leave both out, since the locator holds the number; leave them out of the Concept too.
- A verse this census lacks: add its passage file, and say so in your ticket's Comments. A translation, "Meaning" or position this census gets wrong: note it in your Comments for ticket 12. Never edit a passage or work file: ticket 04 owns them.

## Rules the census applied

- **One passage per verse.** A verse several pages quote is one passage, whose provenance names every page. Where pages print it differently, one form is stored and the others are listed in its provenance. The stored form is the one that sets the verse out line for line, as its Devanagari is, in IAST.
- **Translation ids** name the page the stored translation came from, by its address slug, as ticket 01 began (`vikshepa`). A translation several pages print identically is stored once, under the first of them in this census's page order, and the other pages use that id. Two forms that differ only in punctuation count as one (Bhagavad Gītā 2.54).
- **Labels decide.** Text labelled "Translation" is the passage's; text labelled "Meaning" stays with its page. An English line printed under a verse with no label at all (the Karta and Triguna pages) is the verse rendered in English, so it is stored as the translation and flagged for the Research editor to confirm.
- **Unnamed works.** A verse whose heading names no work ("Chapter 2, Sutra 30") is stored under the work its text identifies, listed in its provenance and flagged for the Research editor (planning ticket 16). The Vikshepa page's "Bhagavad Gita" heading over Yoga Sūtra 1.30 stays relabelled and flagged, from ticket 01.
- **Gaps are flagged, never filled.** Missing Devanagari (Yoga Sūtra 1.2, Dhammapada 160), a missing transliteration (Yoga Sūtra 1.33) and missing translations (five verses) are left empty and flagged. No page names the source of its translations, so none is stored; each work with translations carries one flag saying so.
- **Text as given.** Devanagari and transliteration lines as the page breaks them. Changes, each listed in its record: verse numbers left out; ṁ written ṃ; the Suśruta Saṃhitā verse's Latin comma left out of its Devanagari; Sādhana Pañcakam 2's double avagraha, which the page prints as a closing quotation mark, written as two apostrophes; quotation marks around a translation left out.

## By page

### /vikshepa/ (Vikshepa (Distraction))

| # | On the page | Passage | Translation id | Meaning |
| --- | --- | --- | --- | --- |
| 1 | top, under “Shloka from Bhagavad Gita (Chapter 1, Sutra 30)” | `yoga-sutra/1.30` | `vikshepa` | yes |
| 2 | top, under “Shloka from Vedanta Sara (5.211)” | `vedanta-sara/5.211` | `vikshepa` | yes |

- Both passages, and the quotes that name them, come from ticket 01; the vikṣepa Concept already uses these ids.
- Verse 1's heading says "Bhagavad Gita"; its text and number are Yoga Sūtra 1.30 (relabelled and flagged since ticket 01).
- Prose only, not a passage: "Yogi Sutra 1.30–1.32".

### /upavikshepaprofiling/ (Upa-Vikshepa Profiling)

| # | On the page | Passage | Translation id | Meaning |
| --- | --- | --- | --- | --- |
| 1 | top, under “Shloka from Chapter 1, Sutra 31” | `yoga-sutra/1.31` | `upavikshepaprofiling` | yes |

- The heading names no work; the page's body says "The Patanjali Yoga Sutra 1.31". Stored as Yoga Sūtra 1.31, flagged.

### /panchkleshavikaarprofiling/ (Panch Klesha – Vikaar Profiling)

| # | On the page | Passage | Translation id | Meaning |
| --- | --- | --- | --- | --- |
| 1 | top, under “Panch Klesha: Chapter 2, Sutra 3” | `yoga-sutra/2.3` | `panchkleshavikaarprofiling` | yes |
| 2 | top, under “Pancha Klesha: Chapter 2, Sutra 5” | `yoga-sutra/2.5` | `panchkleshavikaarprofiling` | yes |
| 3 | top, under “Pancha Klesha: Chapter 2, Sutra 7” | `yoga-sutra/2.7` | `panchkleshavikaarprofiling` | yes |
| 4 | top, under “Pancha Klesha: Chapter 2, Sutra 9” | `yoga-sutra/2.9` | `panchkleshavikaarprofiling` | yes |

- The four verses sit under the heading “Shlokas for Panch Klesha – Vikaar Profiling”. Their headings name no work; stored as Yoga Sūtra 2.3–2.9, flagged.
- Verse 3's transliteration is printed as a sub-heading (“sukhānuśayī rāgaḥ .. 2.7..”). It is the passage's transliteration, not a section heading or a term.
- Prose only: "Yoga Sutra of Patanjalii 2.3", "Bhagavad Gītā 2.62-63", "PYS 2.1".

### /knowyourmind/ (Know Your Mind)

| # | On the page | Passage | Translation id | Meaning |
| --- | --- | --- | --- | --- |
| 1 | top, under “Yoga Sutra 1.2 Excerpt for States of Mind” | `yoga-sutra/1.2` | none | yes |
| 2 | top, under “Yoga Sutra 1.30 Excerpt” | `yoga-sutra/1.30` | none | yes |

- Neither verse has a line labelled "Translation": both English lines are labelled "Meaning", so both quotes name no translation. (Yoga Sūtra 1.30 has the Vikshepa page's translation; this page doesn't use it.)
- Yoga Sūtra 1.2 is printed in IAST only. Its Devanagari is empty and flagged.
- The page prints Yoga Sūtra 1.30 in another form: one line, broken into words, with ṁ. The Vikshepa page's form is stored, and this one is listed in the passage's provenance.
- Prose only: “Deśa-bandhaḥ cittasya dhāraṇā” (Yoga Sūtra III.1) and “cittavṛttinirodhaḥ, PYS I.2”, each quoted inside a sentence; they stay in the paragraph.

### /sthitaprajna/ (Sthitaprajna)

| # | On the page | Passage | Translation id | Meaning |
| --- | --- | --- | --- | --- |
| 1 | top, under “Shlokas from Bhagavad Gita (Chapter 2, Verse 54-58, 68)” | `bhagavad-gita/2.54` | `sthitaprajna` | yes |
| 2 | top, under the same heading | `bhagavad-gita/2.55` | `sthitaprajna` | yes |
| 3 | top, under the same heading | `bhagavad-gita/2.56` | `sthitaprajna` | yes |
| 4 | top, under the same heading | `bhagavad-gita/2.57` | `sthitaprajna` | yes |
| 5 | top, under the same heading | `bhagavad-gita/2.58` | `sthitaprajna` | yes |
| 6 | top, under the same heading | `bhagavad-gita/2.68` | `sthitaprajna` | yes |

- All six are shared with the Brahmacharya values page. This page's translations are stored.
- For 2.54 this page runs the transliteration's three lines into one; the Brahmacharya page's three lines are stored, and this form is listed.
- Prose only: "Gita II.55–72", "Gita II.62–63", "Chapter II, verse 15".

### /fivestepsofperfectionprofiling/ (Five Steps of Perfection Profiling)

| # | On the page | Passage | Translation id | Meaning |
| --- | --- | --- | --- | --- |
| 1 | top, under “Shlokas of Perfection from Chapter 1, Sutra 20” | `yoga-sutra/1.20` | `fivestepsofperfectionprofiling` | yes |

- The heading names no work; stored as Yoga Sūtra 1.20, flagged.

### /momentumofspiritualpractice/ (Momentum of Spiritual Practice)

| # | On the page | Passage | Translation id | Meaning |
| --- | --- | --- | --- | --- |
| 1 | top, under “Shloka for Momentum of Spiritual Practice from Chapter 1, Sutra 21,22” | `yoga-sutra/1.21` | `momentumofspiritualpractice` | yes |
| 2 | top, under the same heading | `yoga-sutra/1.22` | `momentumofspiritualpractice` | yes |

- One heading covers both verses and names no work; the first Meaning says "This sutra from Patanjali’s Yoga Sutras". Stored as Yoga Sūtra 1.21 and 1.22, flagged.
- Both transliterations are printed as sub-headings (“tīvrasaṃvegānāmāsannaḥ .. 1.21..”, “mṛdumadhyādhimātratvāt tato’pi viśeṣaḥ .. 1.22..”). They are the passages' transliterations, not section headings.
- Not a passage: the paragraph under “What is the Momentum of Spiritual Practice?” that quotes, in English, a passage it labels "Vedanta Saara 1.30" (citing Tomar, 2024), itself quoting "Mundaka Upanishad 1-2-12". It gives no verse text and labels no translation, so it stays in the page's prose. A flag on the Vedānta Sāra work asks the Research editor to confirm.

### /spiritualpractitionerprofiling/ (Spiritual Practitioner Profiling)

| # | On the page | Passage | Translation id | Meaning |
| --- | --- | --- | --- | --- |
| 1 | top, under “Shlokas from Adi Sankaracharya’ Sadhana Panchakam” | `sadhana-panchakam/1` | `spiritualpractitionerprofiling` | yes |
| 2 | top, under the same heading | `sadhana-panchakam/2` | `spiritualpractitionerprofiling` | yes |
| 3 | top, under the same heading | `sadhana-panchakam/3` | `spiritualpractitionerprofiling` | yes |
| 4 | top, under the same heading | `sadhana-panchakam/4` | `spiritualpractitionerprofiling` | yes |
| 5 | top, under the same heading | `sadhana-panchakam/5` | `spiritualpractitionerprofiling` | yes |

- The heading names the work and its author; the verses are numbered 1 to 5.

### /brahmavihara/ (Brahma Vihara)

| # | On the page | Passage | Translation id | Meaning |
| --- | --- | --- | --- | --- |
| 1 | top, under “Shlokas from Patanjali’s Yoga Sutra (Chapter 1, Sutra 33)” | `yoga-sutra/1.33` | `brahmavihara` | yes |

- No transliteration on the page; none is stored, and it is flagged.
- The Meaning ends with a citation, "(Tomar, 2024)": it belongs to the Meaning, so it stays on the quote.

### /knowyourvaluesahimsanon-violenceprofiling/ (Know Your Values: Ahimsa (Non-Violence) Profiling)

| # | On the page | Passage | Translation id | Meaning |
| --- | --- | --- | --- | --- |
| 1 | top, under “Shloka for Know Your Values – Yama from Chapter 2, Sutra 30” | `yoga-sutra/2.30` | `knowyourvaluesahimsanon-violenceprofiling` | yes |
| 2 | top, under “Shloka for Know Your Values – Niyama from Chapter 2, Sutra 32” | `yoga-sutra/2.32` | `knowyourvaluesahimsanon-violenceprofiling` | yes |
| 3 | top, under “Shloka for Know Your Values – Ahimsa from Chapter 2, Sutra 35” | `yoga-sutra/2.35` | `knowyourvaluesahimsanon-violenceprofiling` | yes |

### /knowyourvaluessatyatruthfulnessprofiling/ (Know Your Values: Satya (Truthfulness) Profiling)

| # | On the page | Passage | Translation id | Meaning |
| --- | --- | --- | --- | --- |
| 1 | top, under “Shloka for Know Your Values – Yama from Chapter 2, Sutra 30” | `yoga-sutra/2.30` | `knowyourvaluesahimsanon-violenceprofiling` | yes |
| 2 | top, under “Shloka for Know Your Values – Niyama from Chapter 2, Sutra 32” | `yoga-sutra/2.32` | `knowyourvaluesahimsanon-violenceprofiling` | yes |
| 3 | top, under “Shloka for Know Your Values – Satya from Chapter 2, Sutra 36” | `yoga-sutra/2.36` | `knowyourvaluessatyatruthfulnessprofiling` | yes |
| 4 | top, under “Shloka for Know Your Values – Satya from Chapter 17, Verse 15” | `bhagavad-gita/17.15` | `knowyourvaluessatyatruthfulnessprofiling` | yes |

- Verse 4's heading names no work; its reference list cites Shlokam's "Bhagavad Gita Chapter 17 – Verse 15". Stored as Bhagavad Gītā 17.15, flagged.

### /knowyourvaluesasteyanonstealingprofiling/ (Know Your Values: Asteya (Non-Stealing) Profiling)

| # | On the page | Passage | Translation id | Meaning |
| --- | --- | --- | --- | --- |
| 1 | top, under “Shloka for Know Your Values – Yama from Chapter 2, Sutra 30” | `yoga-sutra/2.30` | `knowyourvaluesahimsanon-violenceprofiling` | yes |
| 2 | top, under “Shloka for Know Your Values – Niyama from Chapter 2, Sutra 32” | `yoga-sutra/2.32` | `knowyourvaluesahimsanon-violenceprofiling` | yes |

### /knowyourvaluesbrahmacharya-profiling/ (Know Your Values: Brahmacharya Profiling)

| # | On the page | Passage | Translation id | Meaning |
| --- | --- | --- | --- | --- |
| 1 | top, under “Shloka for Know Your Values – Yama from Chapter 2, Sutra 30” | `yoga-sutra/2.30` | `knowyourvaluesahimsanon-violenceprofiling` | yes |
| 2 | top, under “Shloka for Know Your Values – Niyama from Chapter 2, Sutra 32” | `yoga-sutra/2.32` | `knowyourvaluesahimsanon-violenceprofiling` | yes |
| 3 | top, under “Shloka for Know Your Values – Brahmacharya: Chapter 6, Verse 17” | `bhagavad-gita/6.17` | `knowyourvaluesbrahmacharya-profiling` | yes |
| 4 | top, under “Shloka for Know Your Values – Brahmacharya: Chapter 2, Verse 54” | `bhagavad-gita/2.54` | `sthitaprajna` | yes |
| 5 | top, under “… Chapter 2, Verse 55” | `bhagavad-gita/2.55` | `sthitaprajna` | yes |
| 6 | top, under “… Chapter 2, Verse 56” | `bhagavad-gita/2.56` | `sthitaprajna` | yes |
| 7 | top, under “… Chapter 2, Verse 57” | `bhagavad-gita/2.57` | `sthitaprajna` | yes |
| 8 | top, under “… Chapter 2, Verse 58” | `bhagavad-gita/2.58` | `sthitaprajna` | yes |
| 9 | top, under “… Chapter 2, Verse 68” | `bhagavad-gita/2.68` | `sthitaprajna` | yes |

- Verses 3 to 9 are headed with chapter and verse only. 6.17 is stored under the Bhagavad Gītā, which its Meaning names ("the Bhagavad Gita (6.17)"); 2.54 to 2.68 are the Sthitaprajna page's verses. All seven are flagged.
- This page's translation of 2.54 reads "Arjuna said:" where the Sthitaprajna page's reads "Arjuna said-"; the Sthitaprajna page's is stored, and this one is listed. Its transliteration of 2.54, in three lines, is the stored one.
- Each page's Meanings are its own (this page's differ from the Sthitaprajna page's): keep this page's on its quotes.

### The four values pages together

- They print Yoga Sūtra 2.30 and 2.32, with their translations, identically: one passage each, and every page's quote uses the Ahimsa page's translation id. Their headings name no work: flagged.
- Prose only: "the 32nd sutra of the second chapter", and sayings quoted in English inside paragraphs ("– Vyasa Maharaj", "– Vasaya Maharaj", "– Adi Shankaracharya"). They stay in the Concepts' text, or in the values topic's introduction.

### /frienorfoeofself/ (Are you a Friend/Foe of Yourself?)

| # | On the page | Passage | Translation id | Meaning |
| --- | --- | --- | --- | --- |
| 1 | top, under “Bhagavad Gita Shloka (Chapter 6, Verse 5)” | `bhagavad-gita/6.5` | none | yes |
| 2 | top, under “Buddhist Dhammapada Verse 160” | `dhammapada/160` | none | yes |

- Both English lines are labelled "Meaning": no translations, flagged.
- Dhammapada 160 is Pali, printed in roman letters only. Its Devanagari is empty and flagged; its work's language is Pali.
- Prose only: "verse 6.5", "verse 2.48", "verses 6.16–6.17", "verse 18.46", "verse 9.27".

### /karta-2/ (Karta)

| # | On the page | Passage | Translation id | Meaning |
| --- | --- | --- | --- | --- |
| 1 | top, under “Bhagavad Gita – Types of Karta”, then “Sattvik Karta” | `bhagavad-gita/18.23` | `karta-2` | no |
| 2 | top, under “Rajasic Karta” | `bhagavad-gita/18.24` | `karta-2` | no |
| 3 | top, under “Tamasic Karta” | `bhagavad-gita/18.25` | `karta-2` | no |

- The English line under each verse has no label. It is stored as the translation, flagged for the Research editor, so these quotes name `karta-2` and have no Meaning.
- The verse numbers (18-23 to 18-25) are printed only after each verse.

### /triguna/ (Triguna)

| # | On the page | Passage | Translation id | Meaning |
| --- | --- | --- | --- | --- |
| 1 | in section “Trigunas”, under “Bhagavad Gita – Gunatraya Vibhaga (Chapter 14)” | `bhagavad-gita/14.5` | none | yes |
| 2 | in section “Sattva” | `bhagavad-gita/14.6` | `triguna` | no |
| 3 | in section “Rajas” | `bhagavad-gita/14.7` | `triguna` | no |
| 4 | in section “Tamas” | `bhagavad-gita/14.8` | `triguna` | no |
| 5 | in section “Triguna Profile Questionnaire”, after its table | `bhagavad-gita/14.9` | `triguna` | no |
| 6 | in section “Guna Predominance” | `bhagavad-gita/14.11` | `triguna` | no |
| 7 | in section “Guna Predominance” | `bhagavad-gita/14.12` | `triguna` | no |
| 8 | in section “Guna Predominance” | `bhagavad-gita/14.13` | `triguna` | no |
| 9 | in section “Ayurvedic Perspectives” | `sushruta-samhita/4.35` | none | no |

- The page has no "Introduction" accordion: every verse sits inside a section.
- 14.5's English line is labelled "Meaning" (and quoted): no translation, flagged. The paragraph after it ("All three Gunas coexist…") is the page's prose.
- 14.6 to 14.13: the English lines have no label; stored as translations, flagged. The quotation marks around 14.9 to 14.13's are left out. Their headings name no work; stored under the Bhagavad Gītā, whose chapter 14 the page names, flagged.
- 14.9 sits after the High, Moderate and Low Characteristics table, which is held back with the Questionnaire. The verse and its translation interpret no score, so they are kept.
- Suśruta Saṃhitā 4.35: no translation and no Meaning, flagged. The page numbers it "(Sush Samh 4.35)" and lists "Sushruta Samhita (Sharirasthanam Adhyayam 4 Sutram 35)" in its Online Resources; the locator is 4.35, and a flag asks how to name its section.

### /atman/, /jiva/, /jagat/ (posts)

No verses. Atman mentions "Brahma sutras, by Vedavyasa, (1-4-19 sutras)" in prose.

### Not passages

- The homepage's opening line, “यद् भावं तद् भवति”: it stays on the homepage record (ticket 07).
- Verses only named in prose, and words of a verse quoted inside a sentence: listed under each page above.
- English quotations inside a paragraph: Momentum of Spiritual Practice's "Vedanta Saara 1.30" (flagged on the work), and the values pages' sayings of Vyasa Maharaj and Adi Shankaracharya.

## By work

### `yoga-sutra`: Yoga Sūtra

Attributed to "Patanjali" · Sanskrit · locator label "Sutra" · ASCII "Yoga Sutra" · no Devanagari title on any page. Title in IAST flagged (ticket 01).

| Passage | Quoted on | Translations | Notes |
| --- | --- | --- | --- |
| `yoga-sutra/1.2` | /knowyourmind/ | none | No Devanagari; Meaning only. Both flagged. |
| `yoga-sutra/1.20` | /fivestepsofperfectionprofiling/ | `fivestepsofperfectionprofiling` | Work not named; flagged. |
| `yoga-sutra/1.21` | /momentumofspiritualpractice/ | `momentumofspiritualpractice` | Work not named; flagged. |
| `yoga-sutra/1.22` | /momentumofspiritualpractice/ | `momentumofspiritualpractice` | Work not named; flagged. |
| `yoga-sutra/1.30` | /vikshepa/, /knowyourmind/ | `vikshepa` | Relabelled on /vikshepa/, flagged; /knowyourmind/'s form listed. |
| `yoga-sutra/1.31` | /upavikshepaprofiling/ | `upavikshepaprofiling` | Work not named; flagged. |
| `yoga-sutra/1.33` | /brahmavihara/ | `brahmavihara` | No transliteration; flagged. |
| `yoga-sutra/2.3` | /panchkleshavikaarprofiling/ | `panchkleshavikaarprofiling` | Work not named; flagged. |
| `yoga-sutra/2.5` | /panchkleshavikaarprofiling/ | `panchkleshavikaarprofiling` | Work not named; flagged. |
| `yoga-sutra/2.7` | /panchkleshavikaarprofiling/ | `panchkleshavikaarprofiling` | Work not named; flagged. |
| `yoga-sutra/2.9` | /panchkleshavikaarprofiling/ | `panchkleshavikaarprofiling` | Work not named; flagged. |
| `yoga-sutra/2.30` | the four values pages | `knowyourvaluesahimsanon-violenceprofiling` | Work not named; flagged. |
| `yoga-sutra/2.32` | the four values pages | `knowyourvaluesahimsanon-violenceprofiling` | Work not named; flagged. |
| `yoga-sutra/2.35` | /knowyourvaluesahimsanon-violenceprofiling/ | `knowyourvaluesahimsanon-violenceprofiling` | Work not named; flagged. |
| `yoga-sutra/2.36` | /knowyourvaluessatyatruthfulnessprofiling/ | `knowyourvaluessatyatruthfulnessprofiling` | Work not named; flagged. |

### `vedanta-sara`: Vedānta Sāra

Sanskrit · locator label "Shloka" · ASCII "Vedanta Sara" · no attribution on any page. Title in IAST flagged (ticket 01).

| Passage | Quoted on | Translations | Notes |
| --- | --- | --- | --- |
| `vedanta-sara/5.211` | /vikshepa/ | `vikshepa` | Informal transliteration; "वास्तु" flagged (ticket 01). |

The work's own flag covers Momentum of Spiritual Practice's English quotation labelled "Vedanta Saara 1.30", left in that page's prose.

### `bhagavad-gita`: Bhagavad Gītā · भगवद्गीता

Sanskrit · locator label "Verse" · ASCII "Bhagavad Gita", "Bhagavat Gita" · no attribution on any page. The Devanagari title is the Concepts page's ("Bhagavad Gita (भगवद्गीता)"). Title in IAST flagged.

| Passage | Quoted on | Translations | Notes |
| --- | --- | --- | --- |
| `bhagavad-gita/2.54` | /sthitaprajna/, /knowyourvaluesbrahmacharya-profiling/ | `sthitaprajna` | Pages' forms differ; one listed. Unnamed on the values page; flagged. |
| `bhagavad-gita/2.55` | /sthitaprajna/, /knowyourvaluesbrahmacharya-profiling/ | `sthitaprajna` | Unnamed on the values page; flagged. |
| `bhagavad-gita/2.56` | /sthitaprajna/, /knowyourvaluesbrahmacharya-profiling/ | `sthitaprajna` | Unnamed on the values page; flagged. |
| `bhagavad-gita/2.57` | /sthitaprajna/, /knowyourvaluesbrahmacharya-profiling/ | `sthitaprajna` | Unnamed on the values page; flagged. |
| `bhagavad-gita/2.58` | /sthitaprajna/, /knowyourvaluesbrahmacharya-profiling/ | `sthitaprajna` | Unnamed on the values page; flagged. |
| `bhagavad-gita/2.68` | /sthitaprajna/, /knowyourvaluesbrahmacharya-profiling/ | `sthitaprajna` | Unnamed on the values page; flagged. |
| `bhagavad-gita/6.5` | /frienorfoeofself/ | none | Meaning only; flagged. |
| `bhagavad-gita/6.17` | /knowyourvaluesbrahmacharya-profiling/ | `knowyourvaluesbrahmacharya-profiling` | Work not named in its heading; flagged. |
| `bhagavad-gita/14.5` | /triguna/ | none | Meaning only; flagged. |
| `bhagavad-gita/14.6` | /triguna/ | `triguna` | Work not named; unlabelled translation. Both flagged. |
| `bhagavad-gita/14.7` | /triguna/ | `triguna` | Work not named; unlabelled translation. Both flagged. |
| `bhagavad-gita/14.8` | /triguna/ | `triguna` | Work not named; unlabelled translation. Both flagged. |
| `bhagavad-gita/14.9` | /triguna/ | `triguna` | Work not named; unlabelled translation. Both flagged. |
| `bhagavad-gita/14.11` | /triguna/ | `triguna` | Work not named; unlabelled translation. Both flagged. |
| `bhagavad-gita/14.12` | /triguna/ | `triguna` | Work not named; unlabelled translation. Both flagged. |
| `bhagavad-gita/14.13` | /triguna/ | `triguna` | Work not named; unlabelled translation. Both flagged. |
| `bhagavad-gita/17.15` | /knowyourvaluessatyatruthfulnessprofiling/ | `knowyourvaluessatyatruthfulnessprofiling` | Work not named; flagged. |
| `bhagavad-gita/18.23` | /karta-2/ | `karta-2` | Unlabelled translation; flagged. |
| `bhagavad-gita/18.24` | /karta-2/ | `karta-2` | Unlabelled translation; flagged. |
| `bhagavad-gita/18.25` | /karta-2/ | `karta-2` | Unlabelled translation; flagged. |

### `dhammapada`: Dhammapada

Pali · locator label "Verse" · ASCII "Dhammapada" · no attribution on any page.

| Passage | Quoted on | Translations | Notes |
| --- | --- | --- | --- |
| `dhammapada/160` | /frienorfoeofself/ | none | No Devanagari; Meaning only. Both flagged. |

### `sadhana-panchakam`: Sādhana Pañcakam

Attributed to "Adi Sankaracharya" · Sanskrit · locator label "Shloka" · ASCII "Sadhana Panchakam". Title in IAST flagged.

| Passage | Quoted on | Translations | Notes |
| --- | --- | --- | --- |
| `sadhana-panchakam/1` | /spiritualpractitionerprofiling/ | `spiritualpractitionerprofiling` | |
| `sadhana-panchakam/2` | /spiritualpractitionerprofiling/ | `spiritualpractitionerprofiling` | Double avagraha written as two apostrophes (listed). |
| `sadhana-panchakam/3` | /spiritualpractitionerprofiling/ | `spiritualpractitionerprofiling` | |
| `sadhana-panchakam/4` | /spiritualpractitionerprofiling/ | `spiritualpractitionerprofiling` | |
| `sadhana-panchakam/5` | /spiritualpractitionerprofiling/ | `spiritualpractitionerprofiling` | |

### `sushruta-samhita`: Suśruta Saṃhitā

Sanskrit · locator label "Sutram" (the page's "Sharirasthanam Adhyayam 4 Sutram 35") · ASCII "Sushruta Samhita" · no attribution on any page. Title in IAST flagged.

| Passage | Quoted on | Translations | Notes |
| --- | --- | --- | --- |
| `sushruta-samhita/4.35` | /triguna/ | none | No translation; locator's section unnamed. Both flagged. |
