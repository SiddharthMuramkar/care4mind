# References census

Written by content-v1 ticket 03 (2026-10-28) from the saved copies of 2026-10-27 · [Spec](../spec.md) · [Ticket 03](../issues/03-references-census.md) · [The migration standard](../../../docs/agents/content-migration.md)

Every Reference the kept pages cite or list, page by page, mapped to its record in `src/content/data/references/` (one file per id). Pages are keyed by their current address, never by a Concept slug.

- **Batch tickets (08–11):** find your page below. Its reference list is in the page’s order: your Concept’s `references` are these ids, in this order. Reuse them; never add a second record for a work that is here. If your page needs a Reference that isn’t, add the file and say so in your Comments, for ticket 12 to fold in.
- **Ticket 07:** the Library pages’ books are References too (D09). Each listed book is mapped to its id under the page’s own headings; course entries are not References and aren’t here.
- **Ticket 12:** reconciles this census with what the batches add. The flags on each record are in its provenance; `node scripts/content/report.mjs` gathers them.

## Counts

- **188 References.** 155 from the reference lists of the 16 description pages (188 lines, counting Triguna’s “Online Resources” line once); 32 more from the five Library pages (54 book entries, 33 books; `rao-paranjpe-2016` is also on a description page’s list); and `navare-pandey-2022`, from research ticket 11, which no page cites.
- **Tomar (2024)**, `tomar-2024`, is on all 16 description pages, written 5 ways. Srinivasan (2016) and Thapliyal et al. (2023) are on the four values pages, one record each.
- **Shlokam.org** entries are one record per page they cite: the home page (`shlokam-2025`), the Yogasutra and Sādhana Pañcakam indexes, and each verse page (`shlokam-2020-yogasutra-2-30`, `shlokam-2024-gita-2-54` and so on).
- **Atman, Jiva and Jagat** have no reference lists. Course entries (IGNOU, NIOS, the institutes) are courses, for ticket 07.

## How the records were made

- **Ids** follow settled rule 15: the first author’s surname (both for two authors), or with no author a short name of the site or organisation; then the year, when there is one; then a word, only to tell two apart (`mascaro-1994-gita`, `yogapedia-2023-angamejayatva`, `shlokam-2020-yogasutra-1-31`). A surname is the family name as the page writes it: the part before the comma of an inverted name (`mandal-pal-2023`, `rodriguez-nieto-2021`), or the last word of a name written in full (`ayoola-2024`, `swaroop-2016`, `krishnappa-2020`, `saraswati-2014`). Two exceptions: an initial typed into a surname is left out (`murthy-kiran-kumar-2007`, for “K Murthy, P.”), and where the page’s inversion puts a given name before the comma, the id follows the page’s own in-text citation (`prabhu-bhat-2013`, for “Aravinda Prabhu, H.” cited as “(Prabhu & Bhat, 2013)”). An organisation or site takes its short name (`ias-express-2023`, `wisdomlib-2022`, `dharmawiki`, and `esushruta` from the e-book’s address); two books whose page names no author take one from their title (`yoga-sutras-patanjali`, `tamil-siddhas`). Ticket 01’s eleven ids stay as they are.
- **Fields** come from the page lines only: authors, year, title, container, publisher, volume, issue, pages and edition as written; a doi.org link becomes the DOI, any other link the URL. Nothing is looked up. A gap is flagged for the Research editor: a missing DOI or link (with `noStableLink` saying “none given on the current site; not looked up”), and for a paper or book each missing author, year and journal or publisher.
- **Years** keep the letter a page adds to tell its own entries apart (`2020a, October 19`), as ticket 01 kept `n.d.-b`, so that the page’s in-text “(Shlokam.org, 2020a)” resolves. Know Your Mind lists one paper twice, as 2020a and 2020b: its record has `2020`, the year its in-text citations use.
- **`asCited`** keeps each distinct line a page writes, without its link label (“Read more.”, “Know More”, “View book”, “Google Books”, “Buy Now”: interface text, listed as dropped).
- **Edits** are listed on each record: link labels dropped, a doi.org link kept as the DOI, page ranges with an en dash, titles written wholly in capitals put in sentence case (as ticket 01 did for Bhavanani), clear typos fixed (“Triguņa” → “Triguṇa”), and fields split out of irregular lines.
- **Links:** the five `#` “More Info” links on `/text-books/` and the same five on `/indian-philosophy/` are dropped and flagged; Amazon links are kept as a book’s URL only where the pages give no other link, flagged for the Project owner. Sarkar (2019)’s only link is a PDF under a WordPress uploads address, which the content rules keep out of records: left out and flagged.

## Description pages

### `/vikshepa/` · Vikshepa (Distraction)

Reference list, in the page’s order:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `apa-distraction` | APA Dictionary of Psychology. (n.d.-b). |
| 2 | `bhavanani-2012` | Bhavanani, Y. D. A. B. (2012). OBSTACLES ON THE PATH OF YOGA. Yoga Life, 43, 3-9. |
| 3 | `gurubhaktananda-2018` | Gurubhaktananda, S., Sri Sadananda Yogindra Saraswati, Swami Advayanandaji, Sri Sadananda Yogindra Saraswati, Swami Advayanandaji, Swami Sivananda, Swami Tapovanji, & Swami Chinmayananda. (2018). VEDANTA-SARA. |
| 4 | `jain-diwakar-2019` | Jain, R., & Diwakar, A. (2019). [Review study of obstacles in the path of yoga: Yog Pratibandhakar Bhav]. In International Journal of Yogic, Human Movement and Sports Sciences (Vol. 4, Issue 2, pp. 189–190) [Journal-article]. |
| 5 | `krishnananda-1996` | Nine Obstacles in Meditation – Darshan of Swami Krishnananda in 1996. (n.d.). |
| 6 | `schleim-2025` | Schleim, S. (2025). How compatible are Western psychology and yoga psychology? Epistemology, concepts and localization. Frontiers in Psychology, 16. |
| 7 | `sharma-pareek` | Sharma, P., & Pareek, L. V. G. Interpretation of Vyādhi through Āyurveda Terminology. |
| 8 | `shlokam-2025` | Shlokam.org. (2025, July 2). Hindu shlokas, Bhagavad gita, Upanishads, granthas, mantras. Shlokam. |
| 9 | `tomar-2024` | Tomar, V. S. (2024). Self management through self evaluation. Prabhat Prakashan. |
| 10 | `swamij-1-30` | Yoga Sutras of Patanjali 1.30-1.32: Obstacles and solutions. (n.d.-b). |

### `/upavikshepaprofiling/` · Upa-Vikshepa Profiling

Reference list, in the page’s order:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `aich-2013` | Aich, T. (2013). Buddha philosophy and western psychology. Indian Journal of Psychiatry, 55(6), 165. |
| 2 | `anderson-2016` | Anderson, C. S. (2016). Four Noble Truths. Oxford Research Encyclopedia of Religion. |
| 3 | `paikaray-2018` | Paikaray, S., Kar, A. C., & Nathani, N. (2018). Effect of Preksha Meditation on efficiency of Respiration- A review. Ayurlog: National Journal of Research in Ayurved Science, 6(3). |
| 4 | `salagame-2014` | Salagame, K. K. (2014). Positive Psychology and Indian Psychology: birds of the same feather. Psychological Studies, 59(2), 116–118. |
| 5 | `saoji-2018` | Saoji, A. A., Raghavendra, B., & Manjunath, N. (2018). Effects of yogic breath regulation: A narrative review of scientific evidence. Journal of Ayurveda and Integrative Medicine, 10(1), 50–58. |
| 6 | `shlokam-2020-yogasutra-1-31` | Shlokam.org. (2020, October 19). Yogasutra- Verse 1.31 – Yogasutra-1.31-Duḥkhadaurmana. Shlokam. |
| 7 | `teasdale-chaskalson-2011` | Teasdale, J. D., & Chaskalson, M. (2011). How does mindfulness transform suffering? I: the nature and origins of dukkha. Contemporary Buddhism, 12(1), 89–102. |
| 8 | `tomar-2024` | Tomar, V. S. (2024). Self management through self evaluation. Prabhat Prakashan. |
| 9 | `yoga-sutras-patanjali` | Yoga Sutras of Patanjali. (n.d.). Google Books. |
| 10 | `yogapedia-2023-angamejayatva` | Yogapedia. (2023a, December 21). Angamejayatva. Yogapedia. |
| 11 | `yogapedia-2023-shvasa-prashvasa` | Yogapedia. (2023b, December 21). Shvasa prashvasa. Yogapedia. |

### `/panchkleshavikaarprofiling/` · Panch Klesha – Vikaar Profiling

Reference list, in the page’s order:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `hridaya-yoga-2024` | Hridaya Yoga. (2024, April 28). Kleshas the 5 Fundamental causes of Suffering. |
| 2 | `ias-express-2023` | IAS EXPRESS. (2023, September 10). 17.4 Klesas (Yoga) for UPSC. |
| 3 | `jakubczak-2004` | Jakubczak, M. (2004). Towards Knowing ourselves: Classical yoga perspective. Journal of Human Values, 10(2), 111–116. |
| 4 | `jayswal-2020` | Jayswal, A. (2020). Fear and its solution in applied yoga psychology. International Journal of Indian Psychology, 8(3). |
| 5 | `kshirsagar-2025` | Kshirsagar, C. A., Dhimdhime, R. S., Shewale, Y., & Rajenimbalkar, A. (2025). Decoding Krodha: A Conceptual Study of anger in Ayurvedic and contemporary Perspectives. Journal of Emerging Technologies and Innovative Research, 12(6). |
| 6 | `praxis-2022` | Praxis International Journal of Social Science and Literature. (2022b). Praxis International Journal of Social Science and Literature. |
| 7 | `roche-2018` | Roche, L. (2018). Yoga: A self-regulation process. Yoga Mimamsa, 50(1), 16. |
| 8 | `sharma-2021` | Sharma, M. (2021). Indian Psychology- exploring the historical roots, emerging trends and future implications. International Journal of Indian Psychology, 9(2). |
| 9 | `shlokam-2020-yogasutra-1-31` | Shlokam.org. (2020, October 19). Yogasutra- Verse 1.31 – Yogasutra-1.31-Duḥkhadaurmana. Shlokam. |
| 10 | `singh-2020` | Singh, S. P. (2020). Indian perspective of Freud’s Psychoanalysis Theory. Journal of Emerging Technologies and Innovative Research, 7(9), 265–267. |
| 11 | `tomar-2024` | Tomar, V. S. (2024). Self management through self evaluation. Prabhat Prakashan. |
| 12 | `yogapedia` | Yogapedia. (n.d.). Yogapedia. |
| 13 | `yogitim-2024` | Yogitim. (2024, August 20). The cause of suffering: The 5 Kleshas • Yoga Basics • Yoga Basics. Yoga Basics. |

### `/knowyourmind/` · Know Your Mind

Reference list, in the page’s order:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `prabhu-bhat-2013` | Aravinda Prabhu, H., & Bhat, P. (2013). Mind and consciousness in yoga – Vedanta: A comparative analysis with western psychological concepts. Indian Journal of Psychiatry, 55(6), 182. |
| 2 | `das-rai-2024` | Das, A., & Rai, R. (2024). Exploring Mental Well-being from the Perspective of the Indian Knowledge System with Special Reference to… ResearchGate, 55(2), 119–137. |
| 3 | `krishnappa-2020` | Durga Tanisandra Krishnappa, Sridhar, M. K., & Nagendra, H. R. (2020a). Concept of mind in Indian philosophy, Western philosophy, and psychology. Yoga Mimamsa, 52(1), 25–28. |
| 4 | `krishnappa-2020` | Durga Tanisandra Krishnappa, Sridhar, M. K., & Nagendra, H. R. (2020b). Concept of mind in Indian philosophy, Western philosophy, and psychology. Yoga Mimamsa, 52(1), 25–28. |
| 5 | `jayasheela-salagame-2018` | Jayasheela ., & K. Salagame, K. K. (2018). Triguņa and chitta bhũmike in Yoga practitioners. Indian Journal of Positive Psychology, 9(01). |
| 6 | `sridhar-nagendra-2021` | Sridhar, M., & Nagendra, H. (2021). Consciousness in Indian philosophy and modern physics. International Journal of Yoga – Philosophy, Psychology and Parapsychology, 9(2), 53. |
| 7 | `tomar-2024` | Tomar, Dr. V. S. (2024). Self Management Through Self Evaluation (1st ed., Vol. 1). Prabhat |
| 8 | `shlokam-2020-yogasutra-1-2` | Yogasutra- Verse 1.2 – Yogasutra-1.2-yogaścittavṛttinirodhaḥ – In Sanskrit with English Transliteration, Translation, Meaning and Commentary by Swami Vivekananda. (2020, October 19). Shlokam. |

The list names `krishnappa-2020` twice: one record, both lines kept as cited.
In-text citations that match none of these ids as written, noticed while mapping (check your own Concept’s text; fix by a listed edit or flag): “(Sharma et al., 2024)”, “(Krishnappa el al., 2020)”, “(Krishnappa et l., 2020)”.

### `/sthitaprajna/` · Sthitaprajna

Reference list, in the page’s order:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `adkoli-2022` | Adkoli, B. (2022). S-5 formula for leadership development. Journal of Education Technology in Health Sciences, 8(3), 88–92. |
| 2 | `apa-emotional-intelligence` | APA Dictionary of Psychology. (n.d.). |
| 3 | `kaundinya-2024` | Kaundinya, N. (2024). HARMONIZING DHARMA AND DEMOCRACY: Prayagraj Law Review., 2(1), 43–51. |
| 4 | `kp-2025` | KP, N. D. S. (2025). STHITAPRAJNA IN MODERN WORK-LIFE BALANCE: INSIGHTS FROM THE BHAGAVAD GITA. International Journal of Research in Commerce and Management Studies, 07(01), 175–179. |
| 5 | `samant` | Samant, N. Eastern Philosophy and Western Science: A Parallel Study of the Bhagavad Gita and Western Theories. |
| 6 | `sharma-1997` | Sharma, A. (1997). Sankara on the Sthitaprajna. Nidan: International Journal for Indian Studies, 1997(9), 49-53. |
| 7 | `shlokam-2025` | Shlokam.org. (2025, July 2). Hindu shlokas, Bhagavad gita, Upanishads, granthas, mantras. Shlokam. |
| 8 | `sivakumar-rajini-2022` | Sivakumar, K. S., & Rajini, G. (2022). A study on Bhagavad Gita’s approach to stress management. International Journal of Indian Psychology, 10(4), 1985-1991. |
| 9 | `surti-ganga-2021` | Surti, N., & Ganga, V. (2021). Emotional Intelligence: A Study of its Evolution. Journal of Education: Rabindrabharati University, 133-141. |
| 10 | `tomar-2024` | Tomar, V. S. (2024). Self management through self evaluation. Prabhat Prakashan. |
| 11 | `wisdomlib-2022` | www.wisdomlib.org. (2022b, October 14). 6. Sthitaprajna (a true Yogin). |

In-text citations that match none of these ids as written, noticed while mapping (check your own Concept’s text; fix by a listed edit or flag): “(Sharma, 1977)”, “(Samant, 2023)”.

### `/fivestepsofperfectionprofiling/` · Five Steps of Perfection Profiling

Reference list, in the page’s order:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `apa-perfectionism` | APA Dictionary of Psychology. (n.d.). |
| 2 | `chundawat-panda-2022` | Chundawat, A., & Panda, S. K. (2022). Concept of Smriti (Memory), Influencing Factors and Enhancing Tools: a review. International Journal of Health Sciences and Research, 12(6), 140–146. |
| 3 | `dharwadkar-2021` | Dharwadkar, S. R. (2021). The concept of Shraddha – unflinching faith for character building. HARIDRA, 2(06), 33–42. |
| 4 | `dong-2022` | Dong, M., Weststrate, N. M., & Fournier, M. A. (2022). Thirty years of Psychological Wisdom Research: What we know about the correlates of an ancient concept. Perspectives on Psychological Science, 18(4), 778–811. |
| 5 | `gangasagre` | Gangasagre, J. N. G. a. D. N. S. (n.d.). WJPMR \| Abstract. |
| 6 | `indurkar` | Indurkar, P. C. D. P. (n.d.). Hindrances to Samadhi in the context of 21st century: A Comparative analysis of Vedic and later Vedic texts. International Journal of Science and Research (IJSR). |
| 7 | `jeste-vahia-2008` | Jeste, D. V., & Vahia, I. V. (2008). Comparison of the Conceptualization of Wisdom in Ancient Indian Literature with Modern Views: Focus on the Bhagavad Gita. Psychiatry, 71(3), 197–209. |
| 8 | `kyeon-2010` | Kyeon, Y., Cho, S., Hwang, H., & Lee, K. (2010). The Effects of Perfectionism on Academic Achievement in Medical Students. Korean Journal of Medical Education, 22(3), 205–214. |
| 9 | `nazari-2022` | Nazari, N. (2022). Perfectionism and mental health problems: Limitations and directions for future research. World Journal of Clinical Cases, 10(14), 4709–4712. |
| 10 | `patterson-2021` | Patterson, H., Firebaugh, C. M., Zolnikov, T. R., Wardlow, R., Morgan, S. M., & Gordon, B. (2021). A systematic review on the psychological effects of perfectionism and accompanying treatment. Psychology, 12(01), 1–24. |
| 11 | `rao-1989` | Rao, K. L. S. (1989). SRI AUROBINDO ON THE TYPES OF SHRADDHA (FAITH) IN THE “GITA.” Journal of South Asian Literature, 24(1), 168–178. |
| 12 | `shlokam-2020-yogasutra-1-20` | Shlokam.org. (2020, October 19). Yogasutra- Verse 1.20 – Yogasutra-1.20-Śraddhāvīryasmṛti. Shlokam. |
| 13 | `tomar-2024` | Tomar, V. S. (2024). Self management through self evaluation. Prabhat Prakashan. |
| 14 | `wisdomlib-2025-absorption` | www.wisdomlib.org. (2025, May 12). Absorption (Samadhi) according to the Yoga-Upanishads [Part 3.8]. |
| 15 | `wisdomlib-2025-prajna` | www.wisdomlib.org. (2025b, August 17). Prajna: Significance and symbolism. |

### `/momentumofspiritualpractice/` · Momentum of Spiritual Practice

Reference list, in the page’s order:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `cucchi-qoronfleh-2025` | Cucchi, A., & Qoronfleh, M. W. (2025). Cultural perspective on religion, spirituality and mental health. Frontiers in Psychology, 16. |
| 2 | `eaude-2024` | Eaude, T. (2024). Barriers to young children’s spiritual growth – and some pointers to how these can be overcome. International Journal of Children S Spirituality, 1–16. |
| 3 | `fopka-kowalczyk-2022` | Fopka-Kowalczyk, M., Best, M., & Krajnik, M. (2022). The Spiritual Supporter Scale as a new tool for assessing spiritual care competencies in professionals: design, validation, and psychometric evaluation. Journal of Religion and Health, 62(3), 2081–2111. |
| 4 | `ghahramani-2025` | Ghahramani, M., Memaryan, N., Ghahari, S., & Malakouti, K. (2025). When spirituality fades: a qualitative exploration of spiritual deficiencies in suicide ideation and attempt. Mental Health Religion & Culture, 1–22. |
| 5 | `lau-2020` | Lau, E., McClintock, C., Graziosi, M., Nakkana, A., Garcia, A., & Miller, L. (2020). Content analysis of spiritual life in contemporary USA, India, and China. Religions, 11(6), 286. |
| 6 | `lee-park-2025` | Lee, Y., & Park, S. (2025). Advancements and challenges in spiritual care over the last decade. Holistic Nursing Practice. |
| 7 | `milner-2019` | Milner, K., Crawford, P., Edgley, A., Hare-Duke, L., & Slade, M. (2019). The experiences of spirituality among adults with mental health difficulties: a qualitative systematic review. Epidemiology and Psychiatric Sciences, 29. |
| 8 | `neathery-2019` | Neathery, M., He, Z., Taylor, E. J., & Deal, B. (2019). Spiritual perspectives, spiritual care, and knowledge of recovery among psychiatric mental health nurses. Journal of the American Psychiatric Nurses Association, 26(4), 364–372. |
| 9 | `ryff-2021` | Ryff, C. D. (2021). Spirituality and Well-Being: Theory, Science, and the Nature connection. Religions, 12(11), 914. |
| 10 | `sargeant-yoxall-2023` | Sargeant, S., & Yoxall, J. (2023). Psychology and Spirituality: Reviewing developments in history, method and practice. Journal of Religion and Health, 62(2), 1159–1174. |
| 11 | `shlokam-2020-yogasutra` | Shlokam.org. (2020, November 22). Yogasutra Verses in Sanskrit, English with Commentary. Shlokam. |
| 12 | `staples-2022` | Staples, B. A., Shaheen, M., Mayhew, M. J., & Rockenbach, A. N. (2022). Challenge and Support: Worldview Champions promote Spiritual wellness. Journal of College and Character, 23(4), 313–332. |
| 13 | `tomar-2024` | Tomar, V. S. (2024). Self management through self evaluation. Prabhat Prakashan. |

### `/spiritualpractitionerprofiling/` · Spiritual Practitioner Profiling

Reference list, in the page’s order:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `choi-2020` | Choi, S. H., McClintock, C. H., Lau, E., & Miller, L. (2020). The Dynamic Universal Profiles of Spiritual Awareness: A Latent Profile Analysis. Religions, 11(6), 288. |
| 2 | `ford-2023` | Ford, T., Lipson, J., & Miller, L. (2023). Spiritually grounded character: A latent profile analysis. Frontiers in Psychology, 13. |
| 3 | `ivtzan-jegatheeswaran-2015` | Ivtzan, I., & Jegatheeswaran, S. (2015). The Yoga Boom in Western Society: Practitioners’ Spiritual vs. Physical Intentions and Their Impact on Psychological Wellbeing. Journal of Yoga & Physical Therapy, 05(03). |
| 4 | `kaufman-2022` | Kaufman, C. C., Berlin, K., Okwumabua, T., & Thurston, I. (2022). Spirituality and Religiosity Profiles among Diverse Young Adults: The Relationship with Meaning Making. Journal of Spirituality in Mental Health, 25(2), 83–103. |
| 5 | `malviya-greenham-2025` | Malviya, S., & Greenham, J. (2025). Exploration of roles and contribution of spiritual care practitioners in mental health: an Australian study. Journal of Religion and Health. |
| 6 | `padigapati-chandraiah-2020` | Padigapati, N., & Chandraiah, K. (2020). An empirical study on spiritual intelligence and quality of life among sales trainers: mediating effect of self-efficacy. International Journal of Indian Psychology, 8(3). |
| 7 | `park-2011` | Park, N. S., Lee, B. S., Sun, F., Klemmack, D. L., Roff, L. L., & Koenig, H. G. (2011). Typologies of Religiousness/Spirituality: Implications for Health and Well-Being. Journal of Religion and Health, 52(3), 828–839. |
| 8 | `sekagya-2024` | Sekagya, Y. H. K., Muchunguzi, C., Unnikrishnan, P., & Mulogo, E. M. (2024). An exploratory study on becoming a traditional spiritual healer among Baganda in Central Uganda. PLOS Global Public Health, 4(4), e0002581. |
| 9 | `shlokam-2020-sadhana-panchakam` | Shlokam.org. (2020, November 22). Sādhana Panchakam Verses in Sanskrit, English with Commentary. Shlokam. |
| 10 | `tamil-siddhas` | The philosophy of the Tamil Siddhas. (n.d.). Google Books. |
| 11 | `tomar-2024` | Tomar, V. S. (2024). Self management through self evaluation. Prabhat Prakashan. |
| 12 | `warber-2015` | Warber, S. L., Bruyere, R. L., Weintrub, K., & Dieppe, P. (2015). A consideration of the Perspectives of Healing Practitioners on Research into Energy Healing. Global Advances in Health and Medicine, 4(1_suppl). |

In-text citations that match none of these ids as written, noticed while mapping (check your own Concept’s text; fix by a listed edit or flag): “(Inbadas, 2017)”.

### `/brahmavihara/` · Brahma Vihara

Reference list, in the page’s order:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `bhattacharjee-2016` | Bhattacharjee, A. (2016). Emotional maturity among young adults: A comparative study. Indian Journal of Psychological Science, 6(2), 73-79. |
| 2 | `chatterjee-2018` | Chatterjee, R. (2018). The Social Significance of BrahmaVihara and its Relation to Nature. IJCRT, 6(1), 2320–2882. |
| 3 | `ford-2021` | Ford, S. (2021, June 16). Yoga and Buddhist Philosophy: The Brahmaviharas and Patanjali’s Yoga Sutra 1.33. Integral Yoga San Francisco. |
| 4 | `gilbert-2015` | Gilbert, P. (2015). The Evolution and Social Dynamics of Compassion. Social and Personality Psychology Compass, 9(6), 239–254. |
| 5 | `shlokam-2025` | Hindu Shlokas, Bhagavad Gita, Upanishads, Granthas, Mantras. (2025, March 22). Shlokam. |
| 6 | `mandal-2024` | Mandal, M. (2024). Analytical Study Of Brahmavihara In Buddhism And Vedanta Philosophy. International Journal of Creative Research Thoughts, 12(12), 2320–2882. |
| 7 | `sarkar-2019` | Sarkar, B. K. (2019). Buddhists Concept of Brahma-Vihar: An Analysis of Morals. |
| 8 | `tomar-2024` | Tomar, Dr. V. S. (2024). Self Management Through Self Evaluation. Prabhat Prakashan. |
| 9 | `zeng-2015` | Zeng, X., Chiu, C. P. K., Wang, R., Oei, T. P. S., & Leung, F. Y. K. (2015). The effect of loving-kindness meditation on positive emotions: a meta-analytic review. Frontiers in Psychology, 6(1693). |

In-text citations that match none of these ids as written, noticed while mapping (check your own Concept’s text; fix by a listed edit or flag): “(Gilbert & Choden, 2013)”, “(Mishra & Kumar, 2020)”, “(Bhattacharjee, 2024)”.

### `/knowyourvaluesahimsanon-violenceprofiling/` · Know Your Values: Ahimsa (Non-Violence) Profiling

Reference list, in the page’s order:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `ayoola-2024` | Adebola Racheal Ayoola, Adebayo Victor Ogunbadejo2, & Adedeji Matthew Adedayo. (2024). THE PRINCIPLE OF NON-VIOLENCE: A VERITABLE TOOL FOR SUSTAINABLE PEACE, SECURITY AND NATIONAL DEVELOPMENT IN NIGERIA. American Research Journal of Contemporary Issues, Vol. 2, Issue 2 (April-June, 2024)(Issue 2). |
| 2 | `barai-2018` | Barai, A. K. (2018). The Gandhian Philosophy of Truth and Non-Violence: A Pathway to Global Peace. In Journal of Emerging Technologies and Innovative Research (JETIR), Journal of Emerging Technologies and Innovative Research (JETIR) (Vol. 5, Issue 1, pp. 364–365) [Journal-article]. |
| 3 | `bharadwaj-2024` | Bharadwaj, N. M. K., Akolkar, N. a. H., & Azam, N. M. S. (2024). A comparative study of Indian philosophical human values with western philosophy. World Journal of Advanced Research and Reviews, 23(3), 2343–2351. |
| 4 | `epra-2019` | EPRA International Journal of Multidisciplinary Research (IJMR). (2019b). EPRA International Journal of Multidisciplinary Research (IJMR). |
| 5 | `mandal-pal-2023` | Mandal Pal, S. (2023). The Metaphysics of Ahimsa: Gandhi’s Non-Violence in a Philosophical Context. In International Journal of Research Publication and Reviews (Vol. 4, Issue 9, pp. 2037–2042). |
| 6 | `reznik-2019` | Reznik, S. V., Dekhnich, O. V., Kutomanov, S. A., Maidansky, M. A., & Filatova, Y. S. (2019). “AHIMSA” PRINCIPLE IN THE RELIGIOUS AND CULTURAL PRACTICES OF ANCIENT AND CONTEMPORARY INDIA. Humanities & Social Sciences Reviews, 7(5), 830–834. |
| 7 | `shlokam-2020-yogasutra-2-30` | Shlokam.org. (2020a, October 19). Yogasutra- Verse 2.30 – Yogasutra-2.30-Ahiṃsāsatyā. Shlokam. |
| 8 | `shlokam-2020-yogasutra-2-32` | Shlokam.org. (2020b, October 19). Yogasutra- Verse 2.32 – Yogasutra-2.32-Śaucasaṃtoṣat. Shlokam. |
| 9 | `shlokam-2020-yogasutra-2-35` | Shlokam.org. (2020c, October 19). Yogasutra- Verse 2.35 – Yogasutra-2.35-Ahiṃsāpratiṣṭhāyāṃ. Shlokam. |
| 10 | `srinivasan-2016` | Srinivasan, T. M. (2016). From Yama to Samyama. International Journal of Yoga, 9(2), 95. |
| 11 | `sudrajat-2017` | Sudrajat, D. & Universitas Pendidikan Indonesia. (2017). Adaptation of Teenage Nonviolence Test to measure the peacefulness of senior high school students. In Proceedings of the 1st International Conference on Educational Sciences (ICES 2017) – Volume 1 (pp. 127–132) [Conference-proceeding]. SCITEPRESS – Science and Technology Publications, Lda. |
| 12 | `thapliyal-2023` | Thapliyal, V., Tyagi, P., Jaiswal, G., & Thakur, G. S. (2023). Role of Yama-Niyama in socio-personal development of an individual in the postCOvid era. Journal of Mountain Research, 18(2). |
| 13 | `tomar-2024` | Tomar, V. S. (2024). Self management through self evaluation. Prabhat Prakashan. |

In-text citations that match none of these ids as written, noticed while mapping (check your own Concept’s text; fix by a listed edit or flag): “(Jain & Prakrit Bharati academy, JaiPur, 2016)”, “(Reznik et al., 2019b)”.

### `/knowyourvaluessatyatruthfulnessprofiling/` · Know Your Values: Satya (Truthfulness) Profiling

Reference list, in the page’s order:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `agrawal-aldons-2023` | Agrawal, R., & Aldons, S. (2023). Bridging the Gap Between Western and Indian Concept of Truth. International Journal of Indian Psychology, 11(2), 1901–1910. |
| 2 | `chakraborty-2020` | Chakraborty, Asst. P. (2020). GANDHI’S PHILOSOPHY OF TRUTH: SATYAGRAHA VERSUS CONVENTIONAL TRUTH. Scholarly Research Journal for Interdisciplinary Studies, 8/63(2278–8808), SJIF 2019 = 6.380, www.srjis.com. |
| 3 | `geppert-2022` | Geppert, C. (2022). The balance of Truth-Telling and respect for confidentiality: the ethics of case reports. Federal Practitioner, 39 (2). |
| 4 | `kazmi-2019` | Kazmi, S. S. H. (2019). Gandhian way of resilience and wellbeing. SSRN Electronic Journal. |
| 5 | `reinhardt-2022` | Reinhardt, N., Trnka, L., & Reinhard, M. (2022). The correlation of honesty-humility and learning goals with academic cheating. Social Psychology of Education, 26(1), 211–226. |
| 6 | `reynolds-2025` | Reynolds, C. J., Jayawickreme, E., Wheat, R., Stokes, E., Santos, C., Fleeson, W., & Furr, R. M. (2025). Honesty as truthfulness: New trait and state measures of truthfulness to advance research and theorizing on when and why people are honest. European Journal of Personality. |
| 7 | `shlokam-2024-gita-17-15` | Shlokam.org. (2024, May 7). Bhagavad Gita Chapter 17 – Verse 15 – 17.15 anudvegakaram vakyam. Shlokam. |
| 8 | `shlokam-2020-yogasutra-2-36` | Shlokam.org. (2020, October 19). Yogasutra- Verse 2.36 – Yogasutra-2.36-Satyapratiṣṭhāyāṃ. Shlokam. |
| 9 | `shlokam-2020-yogasutra-2-30` | Shlokam.org. (2020a, October 19). Yogasutra- Verse 2.30 – Yogasutra-2.30-Ahiṃsāsatyā. Shlokam. |
| 10 | `shlokam-2020-yogasutra-2-32` | Shlokam.org. (2020b, October 19). Yogasutra- Verse 2.32 – Yogasutra-2.32-Śaucasaṃtoṣat. Shlokam. |
| 11 | `srinivasan-2016` | Srinivasan, T. M. (2016). From Yama to Samyama. International Journal of Yoga, 9(2), 95. |
| 12 | `tandon-singh-2013` | Tandon, A., & Singh, V. (2013). Impact of Mahatma Gandhi′s concepts on mental health: Reflections. Indian Journal of Psychiatry, 55(6), 231. |
| 13 | `testoni-2020` | Testoni, I., Wieser, M. A., Kapelis, D., Pompele, S., Bonaventura, M., & Crupi, R. (2020). Lack of Truth-Telling in Palliative Care and Its Effects among Nurses and Nursing Students. Behavioral Sciences, 10(5), 88. |
| 14 | `thapliyal-2023` | Thapliyal, V., Tyagi, P., Jaiswal, G., & Thakur, G. S. (2023). Role of Yama-Niyama in socio-personal development of an individual in the postCOvid era. Journal of Mountain Research, 18(2). |
| 15 | `tomar-2024` | Tomar, V. S. (2024). Self management through self evaluation. Prabhat Prakashan. |
| 16 | `zahedi-2011` | Zahedi, F. (2011, December 27). The challenge of truth telling across cultures: a case study. |

### `/knowyourvaluesasteyanonstealingprofiling/` · Know Your Values: Asteya (Non-Stealing) Profiling

Reference list, in the page’s order:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `alam-2024` | Alam, K. K., Gangwani, N., & Mohan, M. (2024). Perception and practice of the eight limbs of yoga in yoga teachers: A cross-sectional descriptive study. Journal of Family Medicine and Primary Care, 13(4), 1500–1506. |
| 2 | `dylan-muncaster-2021` | Dylan, A., & Muncaster, K. (2021). The yamas and niyamas of ashtanga yoga: relevance to social work practice. Journal of Religion & Spirituality in Social Work Social Thought, 40(4), 420–442. |
| 3 | `matko-2021` | Matko, K., Sedlmeier, P., & Bringmann, H. C. (2021). Differential Effects of Ethical Education, Physical hatha Yoga, and Mantra Meditation on Well-Being and Stress in Healthy Participants—An Experimental Single-Case Study. Frontiers in Psychology, 12. |
| 4 | `parmar-2014` | Parmar, D. P. (2014). Non stealing (Asteya). PARIPEX – INDIAN JOURNAL OF RESEARCH, 3(12), 141. |
| 5 | `shlokam-2020-yogasutra-2-30` | Shlokam.org. (2020a, October 19). Yogasutra- Verse 2.30 – Yogasutra-2.30-Ahiṃsāsatyā. Shlokam. |
| 6 | `shlokam-2020-yogasutra-2-32` | Shlokam.org. (2020b, October 19). Yogasutra- Verse 2.32 – Yogasutra-2.32-Śaucasaṃtoṣat. Shlokam. |
| 7 | `srinivasan-2016` | Srinivasan, T. M. (2016). From Yama to Samyama. International Journal of Yoga, 9(2), 95. |
| 8 | `thapliyal-2023` | Thapliyal, V., Tyagi, P., Jaiswal, G., & Thakur, G. S. (2023). Role of Yama-Niyama in socio-personal development of an individual in the postCOvid era. Journal of Mountain Research, 18(2). |
| 9 | `tomar-2024` | Tomar, V. S. (2024). Self management through self evaluation. Prabhat Prakashan. |

### `/knowyourvaluesbrahmacharya-profiling/` · Know Your Values: Brahmacharya Profiling

Reference list, in the page’s order:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `alter-1997` | Alter, J. S. (1997). Seminal Truth: A modern science of male celibacy in North India. Medical Anthropology Quarterly, 11(3), 275–298. |
| 2 | `dylan-muncaster-2021` | Dylan, A., & Muncaster, K. (2021). The yamas and niyamas of ashtanga yoga: relevance to social work practice. Journal of Religion & Spirituality in Social Work Social Thought, 40(4), 420–442. |
| 3 | `kumar-2024` | Kumar, M., Alha, S., & Baberwal, A. (2024). A review article on the importance of brahamcharya in healthy life of current era. In International Journal of Creative Research Thoughts (IJCRT), International Journal of Creative Research Thoughts (IJCRT) (Vol. 12, Issue 10, p. e674) [Journal-article]. |
| 4 | `manapat-2019` | Manapat, P. D., Edwards, M. C., MacKinnon, D. P., Poldrack, R. A., & Marsch, L. A. (2019). A psychometric analysis of the brief Self-Control scale. Assessment, 28(2), 395–412. |
| 5 | `meher-2023` | Meher, K., Panda, S. K., & Kumar, M. (2023). Importance of Brahmacharya for health in contemporary Times. International Journal of Health Sciences and Research, 13(9), 163–167. |
| 6 | `rodriguez-nieto-2021` | Rodríguez-Nieto, G., Dewitte, M., Sack, A. T., & Schuhmann, T. (2021). Individual differences in testosterone and Self-Control predict compulsive sexual behavior proneness in young males. Frontiers in Psychology, 12. |
| 7 | `sahu-2023` | Sahu, S. K. (2023). Concept of Brahmacharya in Indian Philosophy. Zenodo (CERN European Organization for Nuclear Research). |
| 8 | `shlokam-2020-yogasutra-2-30` | Shlokam.org. (2020a, October 19). Yogasutra- Verse 2.30 – Yogasutra-2.30-Ahiṃsāsatyā. Shlokam. |
| 9 | `shlokam-2020-yogasutra-2-32` | Shlokam.org. (2020b, October 19). Yogasutra- Verse 2.32 – Yogasutra-2.32-Śaucasaṃtoṣat. Shlokam. |
| 10 | `shlokam-2024-gita-6-17` | Shlokam.org. (2024, May 7). Bhagavad Gita Chapter 6 – Verse 17 – 6.17 yuktaharaviharasya. Shlokam. |
| 11 | `shlokam-2024-gita-2-54` | Shlokam.org. (2024a, May 7). Bhagavad Gita Chapter 2 – Verse 54 – 2.54 sthita-prajnasya. Shlokam. |
| 12 | `shlokam-2024-gita-2-55` | Shlokam.org. (2024b, May 7). Bhagavad Gita Chapter 2 – Verse 55 – 2.55 prajahati. Shlokam. |
| 13 | `shlokam-2024-gita-2-56` | Shlokam.org. (2024c, May 7). Bhagavad Gita Chapter 2 – Verse 56 – 2.56 duhkheshv. Shlokam. |
| 14 | `shlokam-2024-gita-2-57` | Shlokam.org. (2024d, May 7). Bhagavad Gita Chapter 2 – Verse 57 – 2.57 yah sarvatranabhi. Shlokam. |
| 15 | `shlokam-2024-gita-2-58` | Shlokam.org. (2024e, May 7). Bhagavad Gita Chapter 2 – Verse 58 – 2.58 yada sanharate. Shlokam. |
| 16 | `shlokam-2024-gita-2-68` | Shlokam.org. (2024f, May 7). Bhagavad Gita Chapter 2 – Verse 68 – 2.68 tasmad yasya. Shlokam. |
| 17 | `skandhan-2021` | Skandhan, K., Antony Jose, & Prasad BS. (2021). BRAHMACHARYA (CELIBACY) PROLONGS LIFE SPAN BY REDUCING THE AGEING PROCESS [Ayurveda]. GLOBAL JOURNAL FOR RESEARCH ANALYSIS, 10(07), X 15GJRA-GLOBAL JOURNAL FOR RESEARCH ANALYSIS. |
| 18 | `srinivasan-2016` | Srinivasan, T. M. (2016). From Yama to Samyama. International Journal of Yoga, 9(2), 95. |
| 19 | `thapliyal-2023` | Thapliyal, V., Tyagi, P., Jaiswal, G., & Thakur, G. S. (2023). Role of Yama-Niyama in socio-personal development of an individual in the postCOvid era. Journal of Mountain Research, 18(2). |
| 20 | `tomar-2024` | Tomar, V. S. (2024). Self management through self evaluation. Prabhat Prakashan. |

### `/frienorfoeofself/` · Are you a Friend/Foe of Yourself?

Reference list, in the page’s order:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `arshavidyananda-2021` | #149 Self-love in Vedanta – ArshaVidyAnanda. (2021, November 22). Arshavidyananda. |
| 2 | `shlokam-2024-gita-6-5` | Bhagavad Gita Chapter 6 – Verse 5 – 6.5 uddharedatmanatmanam – All Bhagavad Gita (Geeta) Verses in Sanskrit, English, Transliteration, Word Meaning, Translation, Audio, Shankara Bhashya, Adi Sankaracharya Commentary and Links to Videos by Swami Chinmayananda and others. (2024, May 7). Shlokam. |
| 3 | `hegde-nayak-2025` | Hegde, K. P., & Nayak, V. (2025). Managing the Self: Lessons from the Bhagavad Gita on Personal Management and Development. Millah Journal of Religious Studies, 359–378. |
| 4 | `nagar-2023` | Nagar, D. P. (2023). Lessons on Self Realization from the Bhagavad Gita. Zenodo (CERN European Organization for Nuclear Research). |
| 5 | `saraswati-2014` | Narsimha Saraswati. (2014, November 6). Our own Aatma (inner self) is our friend and enemy according to Shrimad Bhagawad Geeta. Speakingtree.in; Speaking Tree. |
| 6 | `paranjpe-2010` | Paranjpe, A. C. (2010). Theories of Self and Cognition. Psychology and Developing Societies, 22(1), 5–48. |
| 7 | `pepper-henry-1991` | Pepper, F. C., & Henry, S. L. (1991). An Indian Perspective of Self-Esteem. Canadian Journal of Native Education, 18(2). |
| 8 | `tomar-2024` | Tomar, Dr. V. S. (2024). Self Management Through Self Evaluation. Prabhat Prakashan. |
| 9 | `vivekavani-2015` | VivekaVani. (2015, July 10). Dhammapada, Verse 160 – One Is One’s Best Saviour – VivekaVani. VivekaVani. |

In-text citations that match none of these ids as written, noticed while mapping (check your own Concept’s text; fix by a listed edit or flag): “(Krishnappa el al., 2020)”, “(Prabhu & Bhat, 2013)”, “(Paranjape, 2010)”, “(Hegde & Nayak, 2024)”.
Its text also cites “(Tomar, 20204)”: the five-figure year keeps the content graph from reading it as a citation at all, so no check will catch it.

### `/karta-2/` · Karta

Reference list, in the page’s order:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `coward-1983` | Coward, H. G. (1983). Psychology and Karma. Philosophy East and West, 33(1), 49. |
| 2 | `shlokam-2021` | Gita Ch 18 – Moksha Sanyasa Yoga – Shlokam. (2021, September 8). |
| 3 | `ignou-2017` | IGNOU. (2017). Unit-5 Brief History of Indian Metaphysics. Egyankosh.ac.in. |
| 4 | `rao-paranjpe-2016` | K Ramakrishna Rao & Paranjpe, A. C. (2016). Psychology in the Indian Tradition. New Delhi: Springer India. |
| 5 | `paranjpe-1996` | Paranjpe, A. C. (1996). Some Basic Psychological Concepts from the Intellectual Tradition of India. Psychology and Developing Societies, 8(1), 7–27. |
| 6 | `paranjpe-1998` | Paranjpe, A. C. (1998). Self And Identity In Modern Psychology And Indian Thought. Internet Archive. |
| 7 | `potter-1967` | Potter, K. H. (1967). Freedom and Determinism from an Indian Perspective. Philosophy East and West, 17(1/4), 113. |
| 8 | `tomar-2024` | Tomar, V. S. (2024). Self Management Through Self Evaluation. Prabhat Prakashan. |
| 9 | `shlokam-2020-yogasutra` | Yogasutra Verses – Patanjali’s Yogasutra. (2020, November 22). |

### `/triguna/` · Triguna

Reference list, in the page’s order:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `bonshe-srivastava-2023` | Bonshe, & Srivastava, M. (2023). Effect of Triguna on the self-esteem of young adults, Journal of Philosophy and Social Science, 8(2), 327–335. |
| 2 | `gupta-1977` | Gupta. (1977). Madhusudana Sarasvati On The Bhagavad Gita: Being An English Translation Of His Commentary, Gudhartha Dipika. Motilal Banarsidass. |
| 3 | `jayasheela-salagame-2018` | Jayasheela & K. Salagame, K. K. (2018). Triguņa and chitta bhũmike in Yoga practitioners. Indian Journal of Positive Psychology, 9(01). |
| 4 | `murthy-kiran-kumar-2007` | K Murthy, P., & Kiran Kumar, S. K. (2007). Concept triguna: A critical analysis and synthesis. Psychological Studies, 2. |
| 5 | `khanna-2013` | Khanna, P., Singh, K., Singla, S., & Verma, V. (2013). Relationship between Triguna theory and well-being indicators. International Journal of Yoga – Philosophy, Psychology and Parapsychology, 1(2), 69. |
| 6 | `pandey-dubey-2020` | Pandey, S., & Dubey, A. (2020). Confluence of Triguna and PERMA Model: An Empirical Validation. Mind and Society, 10(03-04), 43–49. |
| 7 | `swaroop-2016` | R. Swaroop, Salagame, K. K. K., & Archana Bhat Kallahalla. (2016). Triguna: A Conceptual Study and the Development and Validation of AHS Scale. Indian Journal of Positive Psychology, 7(4), 380–389. |
| 8 | `sandhya-vinodkumar-2021` | Sandhya, M. R., & Vinodkumar, M. V. (2021). Critical insight in concept of Triguna: A review. International Journal of Research in Ayurveda and Pharmacy, 12(3), 143–146. |
| 9 | `tomar-2024` | Tomar, Dr. V. S. (2024). Self Management Through Self Evaluation (1st ed., Vol. 1). Prabhat Prakashan Pvt. Ltd. |
| 10 | `shlokam-2025` | Online Resources: Shlokam.org \| DharmaWiki \| Sushruta Samhita (Sharirasthanam Adhyayam 4 Sutram 35): its link “Shlokam.org” |
|  | `dharmawiki` | the same line: its link “DharmaWiki” |
|  | `esushruta` | the same line: its link “Sushruta Samhita (Sharirasthanam Adhyayam 4 Sutram 35)” |

In-text citations that match none of these ids as written, noticed while mapping (check your own Concept’s text; fix by a listed edit or flag): “(Swaroop et al., 2017)”.

## Library pages

### `/text-books/` · Text Books

Under “Indian and Western Textbooks › Psychology Books”:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `hunt-ellis-2006` | Hunt, R. R., & Ellis, H.C. (2006). Fundamentals of Cognitive Psychology. |
| 2 | `kellogg-2007` | Kellogg, R.T. (2007). Cognitive Psychology. |
| 3 | `reed-2010` | Reed, S.K. (2010). Cognition: Theories and Applications. |
| 4 | `solso-2006` | Solso, R.L. (2006). Cognitive Psychology. |
| 5 | `sternberg-2009` | Sternberg, R.J. (2009). Applied Cognitive Psychology. |
| 6 | `cornelissen-2011` | Cornelissen, M. (2011). Foundations of Indian Psychology. |

Under “Indian Psychology & Philosophy Books”:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `cornelissen-2014` | Cornelissen, R. M. M., Misra, G., Varma, S. (2014). Foundations and Applications of Indian Psychology. |
| 2 | `rao-2008` | Rao, K. R., Paranjpe, A. C., Dalal, A. K. (2008). Handbook of Indian Psychology. |
| 3 | `rao-marwaha-2005` | Rao, K. R. & Marwaha, S. B. (2005). Towards a Spiritual Psychology: Essays in Indian Psychology. |
| 4 | `joshi-cornelissen-2004` | Joshi, K. & Cornelissen, M. (2004). Consciousness, Indian Psychology and Yoga. |
| 5 | `cornelissen-2001` | Cornelissen, M. (2001). Consciousness and its Transformation. |
| 6 | `misra-mohanty-2001` | Misra, G. & Mohanty, A. K. (2001). Perspectives on Indigenous Psychology. |
| 7 | `salagame-2011` | Salagame, K. K. K. (2011). Indian Indigenous Concepts and Perspectives. |

Under “Inspirational Books”:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `gupta-2013` | Gupta, M. (2013). The Gospel of Sri Ramakrishna. |
| 2 | `mascaro-1994-gita` | Mascaro, J. (1994). The Bhagavad Gita. |
| 3 | `mascaro-1994-upanisads` | Mascaro, J. (1994). The Upanishads. |
| 4 | `nisargadatta-2008` | Nisargadatta, Maharaj. (2008). I Am That. |
| 5 | `yogananda-1946-1975` | Yogananda, P. (1946/1975). Autobiography of a Yogi. |
| 6 | `gandhi-1993` | Gandhi, M. K. (1993). My Experiments with Truth. |
| 7 | `frankl-2008` | Frankl, V. (2008). Man’s Search for Meaning. |
| 8 | `khalil-2001` | Khalil, G. (2001). The Prophet. |

### `/text-books-2-2/` · Text Books

Under “Indian and Western Textbooks”:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `hunt-ellis-2006` | Hunt, R. R., & Ellis, H.C. (2006). Fundamentals of Cognitive Psychology. |
| 2 | `kellogg-2007` | Kellogg, R.T. (2007). Cognitive Psychology. |
| 3 | `reed-2010` | Reed, S.K. (2010). Cognition: Theories and Applications. |
| 4 | `solso-2006` | Solso, R.L. (2006). Cognitive Psychology. |
| 5 | `sternberg-2009` | Sternberg, R.J. (2009). Applied Cognitive Psychology. |
| 6 | `galotti-2008` | Galotti, K.M. (2008). Cognitive Psychology: Perception, Attention, and Memory. |
| 7 | `stillings-1987` | Stillings, N., et al. (1987). Cognitive Science: An Introduction. |
| 8 | `lopez-2021` | Lopez, S. J., et al. (2021). Positive Psychology. |
| 9 | `rao-paranjpe-2016` | Rao, K. R., & Paranjpe, A. C. (2016). Psychology in the Indian Tradition. |
| 10 | `parker-2015` | Parker, S. (2015). Clearing the Path. |
| 11 | `cornelissen-2011` | Cornelissen, M. (2011). Foundations of Indian Psychology. |

### `/indian-philosophy/` · Indian Philosophy

Under “Indian Psychology & Philosophy Books”:

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `cornelissen-2014` | Cornelissen, R. M. M., Misra, G., Varma, S. (2014). Foundations and Applications of Indian Psychology. |
| 2 | `rao-2008` | Rao, K. R., Paranjpe, A. C., Dalal, A. K. (2008). Handbook of Indian Psychology. |
| 3 | `rao-marwaha-2005` | Rao, K. R. & Marwaha, S. B. (2005). Towards a Spiritual Psychology: Essays in Indian Psychology. |
| 4 | `joshi-cornelissen-2004` | Joshi, K. & Cornelissen, M. (2004). Consciousness, Indian Psychology and Yoga. |
| 5 | `cornelissen-2001` | Cornelissen, M. (2001). Consciousness and its Transformation. |
| 6 | `misra-mohanty-2001` | Misra, G. & Mohanty, A. K. (2001). Perspectives on Indigenous Psychology. |
| 7 | `salagame-2011` | Salagame, K. K. K. (2011). Indian Indigenous Concepts and Perspectives. |

### `/positive-psychology/` · Positive Psychology

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `compton` | Introduction to Positive Psychology by William Compton |
| 2 | `boniwell` | Positive Psychology in a Nutshell: The Science of Happiness by Ilona Boniwell |

### `/inspirational-books/` · Inspirational Books

| # | Id | As the page writes it |
| --- | --- | --- |
| 1 | `gupta-2013` | Gupta, M. (2013). The gospel of Sri Ramakrishna. Chennai: Sri Ramakrishna Math. |
| 2 | `mascaro-1994-gita` | Mascaro, J. (1994). The Bhagavad Gita. New Delhi: Penguin Books India. |
| 3 | `mascaro-1994-upanisads` | Mascaro, J. (1994). The Upanisads. New Delhi: Penguin Books India. |
| 4 | `nisargadatta-2008` | Nisargadatta, Maharaj. (2008). I am That: Talks with Sri Nisargadatta Maharaja. (M. Frydman, Trans.). Mumbai: Chetana Publishing. |
| 5 | `yogananda-1946-1975` | Yogananda, P. (1946/1975). Autobiography of a yogi. Bombay: Jaico. |
| 6 | `nyinche-1999` | Nyinche, P. D. (1999). Awakening the sleeping Buddha: The Twelfth Tai Situpa. (L. Terhune, Ed.). Boston: Shambhala South Asia Editions. |
| 7 | `gandhi-1993` | Gandhi, M. K. (1993). My experiments with truth. New Delhi: Beacon Press. |
| 8 | `brunton-1934` | Brunton, P. (1934). A search into secret India. London: Random House. |
| 9 | `brunton-2009` | Brunton, P. (2009). The Maharshi and his message. Tiruvannamalai: Sri Ramanasramam. |
| 10 | `peck-1978` | Peck, S. M. (1978). The road less traveled: A new psychology of love, traditional values, and spiritual growth. New York: Simon & Schuster. |
| 11 | `khalil-2001` | Khalil, G. (2001). The prophet. New York: Alfred. A. Knopf Inc. |
| 12 | `bach-1977` | Bach, R. (1977). Illusions. London: Arrow Books. |
| 13 | `frankl-2008` | Frankl, V. (2008). Man’s search for meaning. RHUK, Exported Edition. |

## Every Reference

Each id once, with the forms the pages write it in (its `asCited`) and the pages that cite or list it. A record with no current-site page says where it came from.

| Id | Type | As cited | Cited or listed on |
| --- | --- | --- | --- |
| `adkoli-2022` | journal-article | Adkoli, B. (2022). S-5 formula for leadership development. Journal of Education Technology in Health Sciences, 8(3), 88–92. | `/sthitaprajna/` |
| `agrawal-aldons-2023` | journal-article | Agrawal, R., & Aldons, S. (2023). Bridging the Gap Between Western and Indian Concept of Truth. International Journal of Indian Psychology, 11(2), 1901–1910. | `/knowyourvaluessatyatruthfulnessprofiling/` |
| `aich-2013` | journal-article | Aich, T. (2013). Buddha philosophy and western psychology. Indian Journal of Psychiatry, 55(6), 165. | `/upavikshepaprofiling/` |
| `alam-2024` | journal-article | Alam, K. K., Gangwani, N., & Mohan, M. (2024). Perception and practice of the eight limbs of yoga in yoga teachers: A cross-sectional descriptive study. Journal of Family Medicine and Primary Care, 13(4), 1500–1506. | `/knowyourvaluesasteyanonstealingprofiling/` |
| `alter-1997` | journal-article | Alter, J. S. (1997). Seminal Truth: A modern science of male celibacy in North India. Medical Anthropology Quarterly, 11(3), 275–298. | `/knowyourvaluesbrahmacharya-profiling/` |
| `anderson-2016` | dictionary-entry | Anderson, C. S. (2016). Four Noble Truths. Oxford Research Encyclopedia of Religion. | `/upavikshepaprofiling/` |
| `apa-distraction` | dictionary-entry | APA Dictionary of Psychology. (n.d.-b). | `/vikshepa/` |
| `apa-emotional-intelligence` | dictionary-entry | APA Dictionary of Psychology. (n.d.). | `/sthitaprajna/` |
| `apa-perfectionism` | dictionary-entry | APA Dictionary of Psychology. (n.d.). | `/fivestepsofperfectionprofiling/` |
| `arshavidyananda-2021` | web-page | #149 Self-love in Vedanta – ArshaVidyAnanda. (2021, November 22). Arshavidyananda. | `/frienorfoeofself/` |
| `ayoola-2024` | journal-article | Adebola Racheal Ayoola, Adebayo Victor Ogunbadejo2, & Adedeji Matthew Adedayo. (2024). THE PRINCIPLE OF NON-VIOLENCE: A VERITABLE TOOL FOR SUSTAINABLE PEACE, SECURITY AND NATIONAL DEVELOPMENT IN NIGERIA. American Research Journal of Contemporary Issues, Vol. 2, Issue 2 (April-June, 2024)(Issue 2). | `/knowyourvaluesahimsanon-violenceprofiling/` |
| `bach-1977` | book | Bach, R. (1977). Illusions. London: Arrow Books. | `/inspirational-books/` |
| `barai-2018` | journal-article | Barai, A. K. (2018). The Gandhian Philosophy of Truth and Non-Violence: A Pathway to Global Peace. In Journal of Emerging Technologies and Innovative Research (JETIR), Journal of Emerging Technologies and Innovative Research (JETIR) (Vol. 5, Issue 1, pp. 364–365) [Journal-article]. | `/knowyourvaluesahimsanon-violenceprofiling/` |
| `bharadwaj-2024` | journal-article | Bharadwaj, N. M. K., Akolkar, N. a. H., & Azam, N. M. S. (2024). A comparative study of Indian philosophical human values with western philosophy. World Journal of Advanced Research and Reviews, 23(3), 2343–2351. | `/knowyourvaluesahimsanon-violenceprofiling/` |
| `bhattacharjee-2016` | journal-article | Bhattacharjee, A. (2016). Emotional maturity among young adults: A comparative study. Indian Journal of Psychological Science, 6(2), 73-79. | `/brahmavihara/` |
| `bhavanani-2012` | journal-article | Bhavanani, Y. D. A. B. (2012). OBSTACLES ON THE PATH OF YOGA. Yoga Life, 43, 3-9. | `/vikshepa/` |
| `boniwell` | book | Positive Psychology in a Nutshell: The Science of Happiness by Ilona Boniwell | `/positive-psychology/` |
| `bonshe-srivastava-2023` | journal-article | Bonshe, & Srivastava, M. (2023). Effect of Triguna on the self-esteem of young adults, Journal of Philosophy and Social Science, 8(2), 327–335. | `/triguna/` |
| `brunton-1934` | book | Brunton, P. (1934). A search into secret India. London: Random House. | `/inspirational-books/` |
| `brunton-2009` | book | Brunton, P. (2009). The Maharshi and his message. Tiruvannamalai: Sri Ramanasramam. | `/inspirational-books/` |
| `chakraborty-2020` | journal-article | Chakraborty, Asst. P. (2020). GANDHI’S PHILOSOPHY OF TRUTH: SATYAGRAHA VERSUS CONVENTIONAL TRUTH. Scholarly Research Journal for Interdisciplinary Studies, 8/63(2278–8808), SJIF 2019 = 6.380, www.srjis.com. | `/knowyourvaluessatyatruthfulnessprofiling/` |
| `chatterjee-2018` | journal-article | Chatterjee, R. (2018). The Social Significance of BrahmaVihara and its Relation to Nature. IJCRT, 6(1), 2320–2882. | `/brahmavihara/` |
| `choi-2020` | journal-article | Choi, S. H., McClintock, C. H., Lau, E., & Miller, L. (2020). The Dynamic Universal Profiles of Spiritual Awareness: A Latent Profile Analysis. Religions, 11(6), 288. | `/spiritualpractitionerprofiling/` |
| `chundawat-panda-2022` | journal-article | Chundawat, A., & Panda, S. K. (2022). Concept of Smriti (Memory), Influencing Factors and Enhancing Tools: a review. International Journal of Health Sciences and Research, 12(6), 140–146. | `/fivestepsofperfectionprofiling/` |
| `compton` | book | Introduction to Positive Psychology by William Compton | `/positive-psychology/` |
| `cornelissen-2001` | book | Cornelissen, M. (2001). Consciousness and its Transformation. | `/text-books/`, `/indian-philosophy/` |
| `cornelissen-2011` | book | Cornelissen, M. (2011). Foundations of Indian Psychology. | `/text-books/`, `/text-books-2-2/` |
| `cornelissen-2014` | book | Cornelissen, R. M. M., Misra, G., Varma, S. (2014). Foundations and Applications of Indian Psychology. | `/text-books/`, `/indian-philosophy/` |
| `coward-1983` | journal-article | Coward, H. G. (1983). Psychology and Karma. Philosophy East and West, 33(1), 49. | `/karta-2/` |
| `cucchi-qoronfleh-2025` | journal-article | Cucchi, A., & Qoronfleh, M. W. (2025). Cultural perspective on religion, spirituality and mental health. Frontiers in Psychology, 16. | `/momentumofspiritualpractice/` |
| `das-rai-2024` | journal-article | Das, A., & Rai, R. (2024). Exploring Mental Well-being from the Perspective of the Indian Knowledge System with Special Reference to… ResearchGate, 55(2), 119–137. | `/knowyourmind/` |
| `dharmawiki` | web-page | DharmaWiki | `/triguna/` |
| `dharwadkar-2021` | journal-article | Dharwadkar, S. R. (2021). The concept of Shraddha – unflinching faith for character building. HARIDRA, 2(06), 33–42. | `/fivestepsofperfectionprofiling/` |
| `dong-2022` | journal-article | Dong, M., Weststrate, N. M., & Fournier, M. A. (2022). Thirty years of Psychological Wisdom Research: What we know about the correlates of an ancient concept. Perspectives on Psychological Science, 18(4), 778–811. | `/fivestepsofperfectionprofiling/` |
| `dylan-muncaster-2021` | journal-article | Dylan, A., & Muncaster, K. (2021). The yamas and niyamas of ashtanga yoga: relevance to social work practice. Journal of Religion & Spirituality in Social Work Social Thought, 40(4), 420–442. | `/knowyourvaluesasteyanonstealingprofiling/`, `/knowyourvaluesbrahmacharya-profiling/` |
| `eaude-2024` | journal-article | Eaude, T. (2024). Barriers to young children’s spiritual growth – and some pointers to how these can be overcome. International Journal of Children S Spirituality, 1–16. | `/momentumofspiritualpractice/` |
| `epra-2019` | other | EPRA International Journal of Multidisciplinary Research (IJMR). (2019b). EPRA International Journal of Multidisciplinary Research (IJMR). | `/knowyourvaluesahimsanon-violenceprofiling/` |
| `esushruta` | web-page | Sushruta Samhita (Sharirasthanam Adhyayam 4 Sutram 35) | `/triguna/` |
| `fopka-kowalczyk-2022` | journal-article | Fopka-Kowalczyk, M., Best, M., & Krajnik, M. (2022). The Spiritual Supporter Scale as a new tool for assessing spiritual care competencies in professionals: design, validation, and psychometric evaluation. Journal of Religion and Health, 62(3), 2081–2111. | `/momentumofspiritualpractice/` |
| `ford-2021` | web-page | Ford, S. (2021, June 16). Yoga and Buddhist Philosophy: The Brahmaviharas and Patanjali’s Yoga Sutra 1.33. Integral Yoga San Francisco. | `/brahmavihara/` |
| `ford-2023` | journal-article | Ford, T., Lipson, J., & Miller, L. (2023). Spiritually grounded character: A latent profile analysis. Frontiers in Psychology, 13. | `/spiritualpractitionerprofiling/` |
| `frankl-2008` | book | Frankl, V. (2008). Man’s Search for Meaning.<br>Frankl, V. (2008). Man’s search for meaning. RHUK, Exported Edition. | `/text-books/`, `/inspirational-books/` |
| `galotti-2008` | book | Galotti, K.M. (2008). Cognitive Psychology: Perception, Attention, and Memory. | `/text-books-2-2/` |
| `gandhi-1993` | book | Gandhi, M. K. (1993). My Experiments with Truth.<br>Gandhi, M. K. (1993). My experiments with truth. New Delhi: Beacon Press. | `/text-books/`, `/inspirational-books/` |
| `gangasagre` | journal-article | Gangasagre, J. N. G. a. D. N. S. (n.d.). WJPMR \| Abstract. | `/fivestepsofperfectionprofiling/` |
| `geppert-2022` | journal-article | Geppert, C. (2022). The balance of Truth-Telling and respect for confidentiality: the ethics of case reports. Federal Practitioner, 39 (2). | `/knowyourvaluessatyatruthfulnessprofiling/` |
| `ghahramani-2025` | journal-article | Ghahramani, M., Memaryan, N., Ghahari, S., & Malakouti, K. (2025). When spirituality fades: a qualitative exploration of spiritual deficiencies in suicide ideation and attempt. Mental Health Religion & Culture, 1–22. | `/momentumofspiritualpractice/` |
| `gilbert-2015` | journal-article | Gilbert, P. (2015). The Evolution and Social Dynamics of Compassion. Social and Personality Psychology Compass, 9(6), 239–254. | `/brahmavihara/` |
| `gupta-1977` | book | Gupta. (1977). Madhusudana Sarasvati On The Bhagavad Gita: Being An English Translation Of His Commentary, Gudhartha Dipika. Motilal Banarsidass. | `/triguna/` |
| `gupta-2013` | book | Gupta, M. (2013). The Gospel of Sri Ramakrishna.<br>Gupta, M. (2013). The gospel of Sri Ramakrishna. Chennai: Sri Ramakrishna Math. | `/text-books/`, `/inspirational-books/` |
| `gurubhaktananda-2018` | book | Gurubhaktananda, S., Sri Sadananda Yogindra Saraswati, Swami Advayanandaji, Sri Sadananda Yogindra Saraswati, Swami Advayanandaji, Swami Sivananda, Swami Tapovanji, & Swami Chinmayananda. (2018). VEDANTA-SARA. | `/vikshepa/` |
| `hegde-nayak-2025` | journal-article | Hegde, K. P., & Nayak, V. (2025). Managing the Self: Lessons from the Bhagavad Gita on Personal Management and Development. Millah Journal of Religious Studies, 359–378. | `/frienorfoeofself/` |
| `hridaya-yoga-2024` | web-page | Hridaya Yoga. (2024, April 28). Kleshas the 5 Fundamental causes of Suffering. | `/panchkleshavikaarprofiling/` |
| `hunt-ellis-2006` | book | Hunt, R. R., & Ellis, H.C. (2006). Fundamentals of Cognitive Psychology. | `/text-books/`, `/text-books-2-2/` |
| `ias-express-2023` | web-page | IAS EXPRESS. (2023, September 10). 17.4 Klesas (Yoga) for UPSC. | `/panchkleshavikaarprofiling/` |
| `ignou-2017` | other | IGNOU. (2017). Unit-5 Brief History of Indian Metaphysics. Egyankosh.ac.in. | `/karta-2/` |
| `indurkar` | journal-article | Indurkar, P. C. D. P. (n.d.). Hindrances to Samadhi in the context of 21st century: A Comparative analysis of Vedic and later Vedic texts. International Journal of Science and Research (IJSR). | `/fivestepsofperfectionprofiling/` |
| `ivtzan-jegatheeswaran-2015` | journal-article | Ivtzan, I., & Jegatheeswaran, S. (2015). The Yoga Boom in Western Society: Practitioners’ Spiritual vs. Physical Intentions and Their Impact on Psychological Wellbeing. Journal of Yoga & Physical Therapy, 05(03). | `/spiritualpractitionerprofiling/` |
| `jain-diwakar-2019` | journal-article | Jain, R., & Diwakar, A. (2019). [Review study of obstacles in the path of yoga: Yog Pratibandhakar Bhav]. In International Journal of Yogic, Human Movement and Sports Sciences (Vol. 4, Issue 2, pp. 189–190) [Journal-article]. | `/vikshepa/` |
| `jakubczak-2004` | journal-article | Jakubczak, M. (2004). Towards Knowing ourselves: Classical yoga perspective. Journal of Human Values, 10(2), 111–116. | `/panchkleshavikaarprofiling/` |
| `jayasheela-salagame-2018` | journal-article | Jayasheela ., & K. Salagame, K. K. (2018). Triguņa and chitta bhũmike in Yoga practitioners. Indian Journal of Positive Psychology, 9(01).<br>Jayasheela & K. Salagame, K. K. (2018). Triguņa and chitta bhũmike in Yoga practitioners. Indian Journal of Positive Psychology, 9(01). | `/knowyourmind/`, `/triguna/` |
| `jayswal-2020` | journal-article | Jayswal, A. (2020). Fear and its solution in applied yoga psychology. International Journal of Indian Psychology, 8(3). | `/panchkleshavikaarprofiling/` |
| `jeste-vahia-2008` | journal-article | Jeste, D. V., & Vahia, I. V. (2008). Comparison of the Conceptualization of Wisdom in Ancient Indian Literature with Modern Views: Focus on the Bhagavad Gita. Psychiatry, 71(3), 197–209. | `/fivestepsofperfectionprofiling/` |
| `joshi-cornelissen-2004` | book | Joshi, K. & Cornelissen, M. (2004). Consciousness, Indian Psychology and Yoga. | `/text-books/`, `/indian-philosophy/` |
| `kaufman-2022` | journal-article | Kaufman, C. C., Berlin, K., Okwumabua, T., & Thurston, I. (2022). Spirituality and Religiosity Profiles among Diverse Young Adults: The Relationship with Meaning Making. Journal of Spirituality in Mental Health, 25(2), 83–103. | `/spiritualpractitionerprofiling/` |
| `kaundinya-2024` | journal-article | Kaundinya, N. (2024). HARMONIZING DHARMA AND DEMOCRACY: Prayagraj Law Review., 2(1), 43–51. | `/sthitaprajna/` |
| `kazmi-2019` | journal-article | Kazmi, S. S. H. (2019). Gandhian way of resilience and wellbeing. SSRN Electronic Journal. | `/knowyourvaluessatyatruthfulnessprofiling/` |
| `kellogg-2007` | book | Kellogg, R.T. (2007). Cognitive Psychology. | `/text-books/`, `/text-books-2-2/` |
| `khalil-2001` | book | Khalil, G. (2001). The Prophet.<br>Khalil, G. (2001). The prophet. New York: Alfred. A. Knopf Inc. | `/text-books/`, `/inspirational-books/` |
| `khanna-2013` | journal-article | Khanna, P., Singh, K., Singla, S., & Verma, V. (2013). Relationship between Triguna theory and well-being indicators. International Journal of Yoga – Philosophy, Psychology and Parapsychology, 1(2), 69. | `/triguna/` |
| `kp-2025` | journal-article | KP, N. D. S. (2025). STHITAPRAJNA IN MODERN WORK-LIFE BALANCE: INSIGHTS FROM THE BHAGAVAD GITA. International Journal of Research in Commerce and Management Studies, 07(01), 175–179. | `/sthitaprajna/` |
| `krishnananda-1996` | web-page | Nine Obstacles in Meditation – Darshan of Swami Krishnananda in 1996. (n.d.). | `/vikshepa/` |
| `krishnappa-2020` | journal-article | Durga Tanisandra Krishnappa, Sridhar, M. K., & Nagendra, H. R. (2020a). Concept of mind in Indian philosophy, Western philosophy, and psychology. Yoga Mimamsa, 52(1), 25–28.<br>Durga Tanisandra Krishnappa, Sridhar, M. K., & Nagendra, H. R. (2020b). Concept of mind in Indian philosophy, Western philosophy, and psychology. Yoga Mimamsa, 52(1), 25–28. | `/knowyourmind/` |
| `kshirsagar-2025` | journal-article | Kshirsagar, C. A., Dhimdhime, R. S., Shewale, Y., & Rajenimbalkar, A. (2025). Decoding Krodha: A Conceptual Study of anger in Ayurvedic and contemporary Perspectives. Journal of Emerging Technologies and Innovative Research, 12(6). | `/panchkleshavikaarprofiling/` |
| `kumar-2024` | journal-article | Kumar, M., Alha, S., & Baberwal, A. (2024). A review article on the importance of brahamcharya in healthy life of current era. In International Journal of Creative Research Thoughts (IJCRT), International Journal of Creative Research Thoughts (IJCRT) (Vol. 12, Issue 10, p. e674) [Journal-article]. | `/knowyourvaluesbrahmacharya-profiling/` |
| `kyeon-2010` | journal-article | Kyeon, Y., Cho, S., Hwang, H., & Lee, K. (2010). The Effects of Perfectionism on Academic Achievement in Medical Students. Korean Journal of Medical Education, 22(3), 205–214. | `/fivestepsofperfectionprofiling/` |
| `lau-2020` | journal-article | Lau, E., McClintock, C., Graziosi, M., Nakkana, A., Garcia, A., & Miller, L. (2020). Content analysis of spiritual life in contemporary USA, India, and China. Religions, 11(6), 286. | `/momentumofspiritualpractice/` |
| `lee-park-2025` | journal-article | Lee, Y., & Park, S. (2025). Advancements and challenges in spiritual care over the last decade. Holistic Nursing Practice. | `/momentumofspiritualpractice/` |
| `lopez-2021` | book | Lopez, S. J., et al. (2021). Positive Psychology. | `/text-books-2-2/` |
| `malviya-greenham-2025` | journal-article | Malviya, S., & Greenham, J. (2025). Exploration of roles and contribution of spiritual care practitioners in mental health: an Australian study. Journal of Religion and Health. | `/spiritualpractitionerprofiling/` |
| `manapat-2019` | journal-article | Manapat, P. D., Edwards, M. C., MacKinnon, D. P., Poldrack, R. A., & Marsch, L. A. (2019). A psychometric analysis of the brief Self-Control scale. Assessment, 28(2), 395–412. | `/knowyourvaluesbrahmacharya-profiling/` |
| `mandal-2024` | journal-article | Mandal, M. (2024). Analytical Study Of Brahmavihara In Buddhism And Vedanta Philosophy. International Journal of Creative Research Thoughts, 12(12), 2320–2882. | `/brahmavihara/` |
| `mandal-pal-2023` | journal-article | Mandal Pal, S. (2023). The Metaphysics of Ahimsa: Gandhi’s Non-Violence in a Philosophical Context. In International Journal of Research Publication and Reviews (Vol. 4, Issue 9, pp. 2037–2042). | `/knowyourvaluesahimsanon-violenceprofiling/` |
| `mascaro-1994-gita` | book | Mascaro, J. (1994). The Bhagavad Gita.<br>Mascaro, J. (1994). The Bhagavad Gita. New Delhi: Penguin Books India. | `/text-books/`, `/inspirational-books/` |
| `mascaro-1994-upanisads` | book | Mascaro, J. (1994). The Upanishads.<br>Mascaro, J. (1994). The Upanisads. New Delhi: Penguin Books India. | `/text-books/`, `/inspirational-books/` |
| `matko-2021` | journal-article | Matko, K., Sedlmeier, P., & Bringmann, H. C. (2021). Differential Effects of Ethical Education, Physical hatha Yoga, and Mantra Meditation on Well-Being and Stress in Healthy Participants—An Experimental Single-Case Study. Frontiers in Psychology, 12. | `/knowyourvaluesasteyanonstealingprofiling/` |
| `meher-2023` | journal-article | Meher, K., Panda, S. K., & Kumar, M. (2023). Importance of Brahmacharya for health in contemporary Times. International Journal of Health Sciences and Research, 13(9), 163–167. | `/knowyourvaluesbrahmacharya-profiling/` |
| `milner-2019` | journal-article | Milner, K., Crawford, P., Edgley, A., Hare-Duke, L., & Slade, M. (2019). The experiences of spirituality among adults with mental health difficulties: a qualitative systematic review. Epidemiology and Psychiatric Sciences, 29. | `/momentumofspiritualpractice/` |
| `misra-mohanty-2001` | book | Misra, G. & Mohanty, A. K. (2001). Perspectives on Indigenous Psychology. | `/text-books/`, `/indian-philosophy/` |
| `murthy-kiran-kumar-2007` | journal-article | K Murthy, P., & Kiran Kumar, S. K. (2007). Concept triguna: A critical analysis and synthesis. Psychological Studies, 2. | `/triguna/` |
| `nagar-2023` | journal-article | Nagar, D. P. (2023). Lessons on Self Realization from the Bhagavad Gita. Zenodo (CERN European Organization for Nuclear Research). | `/frienorfoeofself/` |
| `navare-pandey-2022` | journal-article | (no page; taken from research ticket 11) | [https://doi.org/10.1177/14705958221111239](https://doi.org/10.1177/14705958221111239) (research) |
| `nazari-2022` | journal-article | Nazari, N. (2022). Perfectionism and mental health problems: Limitations and directions for future research. World Journal of Clinical Cases, 10(14), 4709–4712. | `/fivestepsofperfectionprofiling/` |
| `neathery-2019` | journal-article | Neathery, M., He, Z., Taylor, E. J., & Deal, B. (2019). Spiritual perspectives, spiritual care, and knowledge of recovery among psychiatric mental health nurses. Journal of the American Psychiatric Nurses Association, 26(4), 364–372. | `/momentumofspiritualpractice/` |
| `nisargadatta-2008` | book | Nisargadatta, Maharaj. (2008). I Am That.<br>Nisargadatta, Maharaj. (2008). I am That: Talks with Sri Nisargadatta Maharaja. (M. Frydman, Trans.). Mumbai: Chetana Publishing. | `/text-books/`, `/inspirational-books/` |
| `nyinche-1999` | book | Nyinche, P. D. (1999). Awakening the sleeping Buddha: The Twelfth Tai Situpa. (L. Terhune, Ed.). Boston: Shambhala South Asia Editions. | `/inspirational-books/` |
| `padigapati-chandraiah-2020` | journal-article | Padigapati, N., & Chandraiah, K. (2020). An empirical study on spiritual intelligence and quality of life among sales trainers: mediating effect of self-efficacy. International Journal of Indian Psychology, 8(3). | `/spiritualpractitionerprofiling/` |
| `paikaray-2018` | journal-article | Paikaray, S., Kar, A. C., & Nathani, N. (2018). Effect of Preksha Meditation on efficiency of Respiration- A review. Ayurlog: National Journal of Research in Ayurved Science, 6(3). | `/upavikshepaprofiling/` |
| `pandey-dubey-2020` | journal-article | Pandey, S., & Dubey, A. (2020). Confluence of Triguna and PERMA Model: An Empirical Validation. Mind and Society, 10(03-04), 43–49. | `/triguna/` |
| `paranjpe-1996` | journal-article | Paranjpe, A. C. (1996). Some Basic Psychological Concepts from the Intellectual Tradition of India. Psychology and Developing Societies, 8(1), 7–27. | `/karta-2/` |
| `paranjpe-1998` | book | Paranjpe, A. C. (1998). Self And Identity In Modern Psychology And Indian Thought. Internet Archive. | `/karta-2/` |
| `paranjpe-2010` | journal-article | Paranjpe, A. C. (2010). Theories of Self and Cognition. Psychology and Developing Societies, 22(1), 5–48. | `/frienorfoeofself/` |
| `park-2011` | journal-article | Park, N. S., Lee, B. S., Sun, F., Klemmack, D. L., Roff, L. L., & Koenig, H. G. (2011). Typologies of Religiousness/Spirituality: Implications for Health and Well-Being. Journal of Religion and Health, 52(3), 828–839. | `/spiritualpractitionerprofiling/` |
| `parker-2015` | book | Parker, S. (2015). Clearing the Path. | `/text-books-2-2/` |
| `parmar-2014` | journal-article | Parmar, D. P. (2014). Non stealing (Asteya). PARIPEX – INDIAN JOURNAL OF RESEARCH, 3(12), 141. | `/knowyourvaluesasteyanonstealingprofiling/` |
| `patterson-2021` | journal-article | Patterson, H., Firebaugh, C. M., Zolnikov, T. R., Wardlow, R., Morgan, S. M., & Gordon, B. (2021). A systematic review on the psychological effects of perfectionism and accompanying treatment. Psychology, 12(01), 1–24. | `/fivestepsofperfectionprofiling/` |
| `peck-1978` | book | Peck, S. M. (1978). The road less traveled: A new psychology of love, traditional values, and spiritual growth. New York: Simon & Schuster. | `/inspirational-books/` |
| `pepper-henry-1991` | journal-article | Pepper, F. C., & Henry, S. L. (1991). An Indian Perspective of Self-Esteem. Canadian Journal of Native Education, 18(2). | `/frienorfoeofself/` |
| `potter-1967` | journal-article | Potter, K. H. (1967). Freedom and Determinism from an Indian Perspective. Philosophy East and West, 17(1/4), 113. | `/karta-2/` |
| `prabhu-bhat-2013` | journal-article | Aravinda Prabhu, H., & Bhat, P. (2013). Mind and consciousness in yoga – Vedanta: A comparative analysis with western psychological concepts. Indian Journal of Psychiatry, 55(6), 182. | `/knowyourmind/` |
| `praxis-2022` | other | Praxis International Journal of Social Science and Literature. (2022b). Praxis International Journal of Social Science and Literature. | `/panchkleshavikaarprofiling/` |
| `rao-1989` | journal-article | Rao, K. L. S. (1989). SRI AUROBINDO ON THE TYPES OF SHRADDHA (FAITH) IN THE “GITA.” Journal of South Asian Literature, 24(1), 168–178. | `/fivestepsofperfectionprofiling/` |
| `rao-2008` | book | Rao, K. R., Paranjpe, A. C., Dalal, A. K. (2008). Handbook of Indian Psychology. | `/text-books/`, `/indian-philosophy/` |
| `rao-marwaha-2005` | book | Rao, K. R. & Marwaha, S. B. (2005). Towards a Spiritual Psychology: Essays in Indian Psychology. | `/text-books/`, `/indian-philosophy/` |
| `rao-paranjpe-2016` | book | K Ramakrishna Rao & Paranjpe, A. C. (2016). Psychology in the Indian Tradition. New Delhi: Springer India.<br>Rao, K. R., & Paranjpe, A. C. (2016). Psychology in the Indian Tradition. | `/karta-2/`, `/text-books-2-2/` |
| `reed-2010` | book | Reed, S.K. (2010). Cognition: Theories and Applications. | `/text-books/`, `/text-books-2-2/` |
| `reinhardt-2022` | journal-article | Reinhardt, N., Trnka, L., & Reinhard, M. (2022). The correlation of honesty-humility and learning goals with academic cheating. Social Psychology of Education, 26(1), 211–226. | `/knowyourvaluessatyatruthfulnessprofiling/` |
| `reynolds-2025` | journal-article | Reynolds, C. J., Jayawickreme, E., Wheat, R., Stokes, E., Santos, C., Fleeson, W., & Furr, R. M. (2025). Honesty as truthfulness: New trait and state measures of truthfulness to advance research and theorizing on when and why people are honest. European Journal of Personality. | `/knowyourvaluessatyatruthfulnessprofiling/` |
| `reznik-2019` | journal-article | Reznik, S. V., Dekhnich, O. V., Kutomanov, S. A., Maidansky, M. A., & Filatova, Y. S. (2019). “AHIMSA” PRINCIPLE IN THE RELIGIOUS AND CULTURAL PRACTICES OF ANCIENT AND CONTEMPORARY INDIA. Humanities & Social Sciences Reviews, 7(5), 830–834. | `/knowyourvaluesahimsanon-violenceprofiling/` |
| `roche-2018` | journal-article | Roche, L. (2018). Yoga: A self-regulation process. Yoga Mimamsa, 50(1), 16. | `/panchkleshavikaarprofiling/` |
| `rodriguez-nieto-2021` | journal-article | Rodríguez-Nieto, G., Dewitte, M., Sack, A. T., & Schuhmann, T. (2021). Individual differences in testosterone and Self-Control predict compulsive sexual behavior proneness in young males. Frontiers in Psychology, 12. | `/knowyourvaluesbrahmacharya-profiling/` |
| `ryff-2021` | journal-article | Ryff, C. D. (2021). Spirituality and Well-Being: Theory, Science, and the Nature connection. Religions, 12(11), 914. | `/momentumofspiritualpractice/` |
| `sahu-2023` | journal-article | Sahu, S. K. (2023). Concept of Brahmacharya in Indian Philosophy. Zenodo (CERN European Organization for Nuclear Research). | `/knowyourvaluesbrahmacharya-profiling/` |
| `salagame-2011` | book | Salagame, K. K. K. (2011). Indian Indigenous Concepts and Perspectives. | `/text-books/`, `/indian-philosophy/` |
| `salagame-2014` | journal-article | Salagame, K. K. (2014). Positive Psychology and Indian Psychology: birds of the same feather. Psychological Studies, 59(2), 116–118. | `/upavikshepaprofiling/` |
| `samant` | journal-article | Samant, N. Eastern Philosophy and Western Science: A Parallel Study of the Bhagavad Gita and Western Theories. | `/sthitaprajna/` |
| `sandhya-vinodkumar-2021` | journal-article | Sandhya, M. R., & Vinodkumar, M. V. (2021). Critical insight in concept of Triguna: A review. International Journal of Research in Ayurveda and Pharmacy, 12(3), 143–146. | `/triguna/` |
| `saoji-2018` | journal-article | Saoji, A. A., Raghavendra, B., & Manjunath, N. (2018). Effects of yogic breath regulation: A narrative review of scientific evidence. Journal of Ayurveda and Integrative Medicine, 10(1), 50–58. | `/upavikshepaprofiling/` |
| `saraswati-2014` | web-page | Narsimha Saraswati. (2014, November 6). Our own Aatma (inner self) is our friend and enemy according to Shrimad Bhagawad Geeta. Speakingtree.in; Speaking Tree. | `/frienorfoeofself/` |
| `sargeant-yoxall-2023` | journal-article | Sargeant, S., & Yoxall, J. (2023). Psychology and Spirituality: Reviewing developments in history, method and practice. Journal of Religion and Health, 62(2), 1159–1174. | `/momentumofspiritualpractice/` |
| `sarkar-2019` | journal-article | Sarkar, B. K. (2019). Buddhists Concept of Brahma-Vihar: An Analysis of Morals. | `/brahmavihara/` |
| `schleim-2025` | journal-article | Schleim, S. (2025). How compatible are Western psychology and yoga psychology? Epistemology, concepts and localization. Frontiers in Psychology, 16. | `/vikshepa/` |
| `sekagya-2024` | journal-article | Sekagya, Y. H. K., Muchunguzi, C., Unnikrishnan, P., & Mulogo, E. M. (2024). An exploratory study on becoming a traditional spiritual healer among Baganda in Central Uganda. PLOS Global Public Health, 4(4), e0002581. | `/spiritualpractitionerprofiling/` |
| `sharma-1997` | journal-article | Sharma, A. (1997). Sankara on the Sthitaprajna. Nidan: International Journal for Indian Studies, 1997(9), 49-53. | `/sthitaprajna/` |
| `sharma-2021` | journal-article | Sharma, M. (2021). Indian Psychology- exploring the historical roots, emerging trends and future implications. International Journal of Indian Psychology, 9(2). | `/panchkleshavikaarprofiling/` |
| `sharma-pareek` | journal-article | Sharma, P., & Pareek, L. V. G. Interpretation of Vyādhi through Āyurveda Terminology. | `/vikshepa/` |
| `shlokam-2020-sadhana-panchakam` | web-page | Shlokam.org. (2020, November 22). Sādhana Panchakam Verses in Sanskrit, English with Commentary. Shlokam. | `/spiritualpractitionerprofiling/` |
| `shlokam-2020-yogasutra` | web-page | Shlokam.org. (2020, November 22). Yogasutra Verses in Sanskrit, English with Commentary. Shlokam.<br>Yogasutra Verses – Patanjali’s Yogasutra. (2020, November 22). | `/momentumofspiritualpractice/`, `/karta-2/` |
| `shlokam-2020-yogasutra-1-2` | web-page | Yogasutra- Verse 1.2 – Yogasutra-1.2-yogaścittavṛttinirodhaḥ – In Sanskrit with English Transliteration, Translation, Meaning and Commentary by Swami Vivekananda. (2020, October 19). Shlokam. | `/knowyourmind/` |
| `shlokam-2020-yogasutra-1-20` | web-page | Shlokam.org. (2020, October 19). Yogasutra- Verse 1.20 – Yogasutra-1.20-Śraddhāvīryasmṛti. Shlokam. | `/fivestepsofperfectionprofiling/` |
| `shlokam-2020-yogasutra-1-31` | web-page | Shlokam.org. (2020, October 19). Yogasutra- Verse 1.31 – Yogasutra-1.31-Duḥkhadaurmana. Shlokam. | `/upavikshepaprofiling/`, `/panchkleshavikaarprofiling/` |
| `shlokam-2020-yogasutra-2-30` | web-page | Shlokam.org. (2020a, October 19). Yogasutra- Verse 2.30 – Yogasutra-2.30-Ahiṃsāsatyā. Shlokam. | `/knowyourvaluesahimsanon-violenceprofiling/`, `/knowyourvaluessatyatruthfulnessprofiling/`, `/knowyourvaluesasteyanonstealingprofiling/`, `/knowyourvaluesbrahmacharya-profiling/` |
| `shlokam-2020-yogasutra-2-32` | web-page | Shlokam.org. (2020b, October 19). Yogasutra- Verse 2.32 – Yogasutra-2.32-Śaucasaṃtoṣat. Shlokam. | `/knowyourvaluesahimsanon-violenceprofiling/`, `/knowyourvaluessatyatruthfulnessprofiling/`, `/knowyourvaluesasteyanonstealingprofiling/`, `/knowyourvaluesbrahmacharya-profiling/` |
| `shlokam-2020-yogasutra-2-35` | web-page | Shlokam.org. (2020c, October 19). Yogasutra- Verse 2.35 – Yogasutra-2.35-Ahiṃsāpratiṣṭhāyāṃ. Shlokam. | `/knowyourvaluesahimsanon-violenceprofiling/` |
| `shlokam-2020-yogasutra-2-36` | web-page | Shlokam.org. (2020, October 19). Yogasutra- Verse 2.36 – Yogasutra-2.36-Satyapratiṣṭhāyāṃ. Shlokam. | `/knowyourvaluessatyatruthfulnessprofiling/` |
| `shlokam-2021` | web-page | Gita Ch 18 – Moksha Sanyasa Yoga – Shlokam. (2021, September 8). | `/karta-2/` |
| `shlokam-2024-gita-17-15` | web-page | Shlokam.org. (2024, May 7). Bhagavad Gita Chapter 17 – Verse 15 – 17.15 anudvegakaram vakyam. Shlokam. | `/knowyourvaluessatyatruthfulnessprofiling/` |
| `shlokam-2024-gita-2-54` | web-page | Shlokam.org. (2024a, May 7). Bhagavad Gita Chapter 2 – Verse 54 – 2.54 sthita-prajnasya. Shlokam. | `/knowyourvaluesbrahmacharya-profiling/` |
| `shlokam-2024-gita-2-55` | web-page | Shlokam.org. (2024b, May 7). Bhagavad Gita Chapter 2 – Verse 55 – 2.55 prajahati. Shlokam. | `/knowyourvaluesbrahmacharya-profiling/` |
| `shlokam-2024-gita-2-56` | web-page | Shlokam.org. (2024c, May 7). Bhagavad Gita Chapter 2 – Verse 56 – 2.56 duhkheshv. Shlokam. | `/knowyourvaluesbrahmacharya-profiling/` |
| `shlokam-2024-gita-2-57` | web-page | Shlokam.org. (2024d, May 7). Bhagavad Gita Chapter 2 – Verse 57 – 2.57 yah sarvatranabhi. Shlokam. | `/knowyourvaluesbrahmacharya-profiling/` |
| `shlokam-2024-gita-2-58` | web-page | Shlokam.org. (2024e, May 7). Bhagavad Gita Chapter 2 – Verse 58 – 2.58 yada sanharate. Shlokam. | `/knowyourvaluesbrahmacharya-profiling/` |
| `shlokam-2024-gita-2-68` | web-page | Shlokam.org. (2024f, May 7). Bhagavad Gita Chapter 2 – Verse 68 – 2.68 tasmad yasya. Shlokam. | `/knowyourvaluesbrahmacharya-profiling/` |
| `shlokam-2024-gita-6-17` | web-page | Shlokam.org. (2024, May 7). Bhagavad Gita Chapter 6 – Verse 17 – 6.17 yuktaharaviharasya. Shlokam. | `/knowyourvaluesbrahmacharya-profiling/` |
| `shlokam-2024-gita-6-5` | web-page | Bhagavad Gita Chapter 6 – Verse 5 – 6.5 uddharedatmanatmanam – All Bhagavad Gita (Geeta) Verses in Sanskrit, English, Transliteration, Word Meaning, Translation, Audio, Shankara Bhashya, Adi Sankaracharya Commentary and Links to Videos by Swami Chinmayananda and others. (2024, May 7). Shlokam. | `/frienorfoeofself/` |
| `shlokam-2025` | web-page | Shlokam.org. (2025, July 2). Hindu shlokas, Bhagavad gita, Upanishads, granthas, mantras. Shlokam.<br>Hindu Shlokas, Bhagavad Gita, Upanishads, Granthas, Mantras. (2025, March 22). Shlokam.<br>Shlokam.org | `/vikshepa/`, `/sthitaprajna/`, `/brahmavihara/`, `/triguna/` |
| `singh-2020` | journal-article | Singh, S. P. (2020). Indian perspective of Freud’s Psychoanalysis Theory. Journal of Emerging Technologies and Innovative Research, 7(9), 265–267. | `/panchkleshavikaarprofiling/` |
| `sivakumar-rajini-2022` | journal-article | Sivakumar, K. S., & Rajini, G. (2022). A study on Bhagavad Gita’s approach to stress management. International Journal of Indian Psychology, 10(4), 1985-1991. | `/sthitaprajna/` |
| `skandhan-2021` | journal-article | Skandhan, K., Antony Jose, & Prasad BS. (2021). BRAHMACHARYA (CELIBACY) PROLONGS LIFE SPAN BY REDUCING THE AGEING PROCESS [Ayurveda]. GLOBAL JOURNAL FOR RESEARCH ANALYSIS, 10(07), X 15GJRA-GLOBAL JOURNAL FOR RESEARCH ANALYSIS. | `/knowyourvaluesbrahmacharya-profiling/` |
| `solso-2006` | book | Solso, R.L. (2006). Cognitive Psychology. | `/text-books/`, `/text-books-2-2/` |
| `sridhar-nagendra-2021` | journal-article | Sridhar, M., & Nagendra, H. (2021). Consciousness in Indian philosophy and modern physics. International Journal of Yoga – Philosophy, Psychology and Parapsychology, 9(2), 53. | `/knowyourmind/` |
| `srinivasan-2016` | journal-article | Srinivasan, T. M. (2016). From Yama to Samyama. International Journal of Yoga, 9(2), 95. | `/knowyourvaluesahimsanon-violenceprofiling/`, `/knowyourvaluessatyatruthfulnessprofiling/`, `/knowyourvaluesasteyanonstealingprofiling/`, `/knowyourvaluesbrahmacharya-profiling/` |
| `staples-2022` | journal-article | Staples, B. A., Shaheen, M., Mayhew, M. J., & Rockenbach, A. N. (2022). Challenge and Support: Worldview Champions promote Spiritual wellness. Journal of College and Character, 23(4), 313–332. | `/momentumofspiritualpractice/` |
| `sternberg-2009` | book | Sternberg, R.J. (2009). Applied Cognitive Psychology. | `/text-books/`, `/text-books-2-2/` |
| `stillings-1987` | book | Stillings, N., et al. (1987). Cognitive Science: An Introduction. | `/text-books-2-2/` |
| `sudrajat-2017` | chapter | Sudrajat, D. & Universitas Pendidikan Indonesia. (2017). Adaptation of Teenage Nonviolence Test to measure the peacefulness of senior high school students. In Proceedings of the 1st International Conference on Educational Sciences (ICES 2017) – Volume 1 (pp. 127–132) [Conference-proceeding]. SCITEPRESS – Science and Technology Publications, Lda. | `/knowyourvaluesahimsanon-violenceprofiling/` |
| `surti-ganga-2021` | journal-article | Surti, N., & Ganga, V. (2021). Emotional Intelligence: A Study of its Evolution. Journal of Education: Rabindrabharati University, 133-141. | `/sthitaprajna/` |
| `swamij-1-30` | web-page | Yoga Sutras of Patanjali 1.30-1.32: Obstacles and solutions. (n.d.-b). | `/vikshepa/` |
| `swaroop-2016` | journal-article | R. Swaroop, Salagame, K. K. K., & Archana Bhat Kallahalla. (2016). Triguna: A Conceptual Study and the Development and Validation of AHS Scale. Indian Journal of Positive Psychology, 7(4), 380–389. | `/triguna/` |
| `tamil-siddhas` | book | The philosophy of the Tamil Siddhas. (n.d.). Google Books. | `/spiritualpractitionerprofiling/` |
| `tandon-singh-2013` | journal-article | Tandon, A., & Singh, V. (2013). Impact of Mahatma Gandhi′s concepts on mental health: Reflections. Indian Journal of Psychiatry, 55(6), 231. | `/knowyourvaluessatyatruthfulnessprofiling/` |
| `teasdale-chaskalson-2011` | journal-article | Teasdale, J. D., & Chaskalson, M. (2011). How does mindfulness transform suffering? I: the nature and origins of dukkha. Contemporary Buddhism, 12(1), 89–102. | `/upavikshepaprofiling/` |
| `testoni-2020` | journal-article | Testoni, I., Wieser, M. A., Kapelis, D., Pompele, S., Bonaventura, M., & Crupi, R. (2020). Lack of Truth-Telling in Palliative Care and Its Effects among Nurses and Nursing Students. Behavioral Sciences, 10(5), 88. | `/knowyourvaluessatyatruthfulnessprofiling/` |
| `thapliyal-2023` | journal-article | Thapliyal, V., Tyagi, P., Jaiswal, G., & Thakur, G. S. (2023). Role of Yama-Niyama in socio-personal development of an individual in the postCOvid era. Journal of Mountain Research, 18(2). | `/knowyourvaluesahimsanon-violenceprofiling/`, `/knowyourvaluessatyatruthfulnessprofiling/`, `/knowyourvaluesasteyanonstealingprofiling/`, `/knowyourvaluesbrahmacharya-profiling/` |
| `tomar-2024` | book | Tomar, V. S. (2024). Self management through self evaluation. Prabhat Prakashan.<br>Tomar, Dr. V. S. (2024). Self Management Through Self Evaluation (1st ed., Vol. 1). Prabhat<br>Tomar, Dr. V. S. (2024). Self Management Through Self Evaluation. Prabhat Prakashan.<br>Tomar, V. S. (2024). Self Management Through Self Evaluation. Prabhat Prakashan.<br>Tomar, Dr. V. S. (2024). Self Management Through Self Evaluation (1st ed., Vol. 1). Prabhat Prakashan Pvt. Ltd. | `/vikshepa/`, `/upavikshepaprofiling/`, `/panchkleshavikaarprofiling/`, `/knowyourmind/`, `/sthitaprajna/`, `/fivestepsofperfectionprofiling/`, `/momentumofspiritualpractice/`, `/spiritualpractitionerprofiling/`, `/brahmavihara/`, `/knowyourvaluesahimsanon-violenceprofiling/`, `/knowyourvaluessatyatruthfulnessprofiling/`, `/knowyourvaluesasteyanonstealingprofiling/`, `/knowyourvaluesbrahmacharya-profiling/`, `/frienorfoeofself/`, `/karta-2/`, `/triguna/` |
| `vivekavani-2015` | web-page | VivekaVani. (2015, July 10). Dhammapada, Verse 160 – One Is One’s Best Saviour – VivekaVani. VivekaVani. | `/frienorfoeofself/` |
| `warber-2015` | journal-article | Warber, S. L., Bruyere, R. L., Weintrub, K., & Dieppe, P. (2015). A consideration of the Perspectives of Healing Practitioners on Research into Energy Healing. Global Advances in Health and Medicine, 4(1_suppl). | `/spiritualpractitionerprofiling/` |
| `wisdomlib-2022` | web-page | www.wisdomlib.org. (2022b, October 14). 6. Sthitaprajna (a true Yogin). | `/sthitaprajna/` |
| `wisdomlib-2025-absorption` | web-page | www.wisdomlib.org. (2025, May 12). Absorption (Samadhi) according to the Yoga-Upanishads [Part 3.8]. | `/fivestepsofperfectionprofiling/` |
| `wisdomlib-2025-prajna` | web-page | www.wisdomlib.org. (2025b, August 17). Prajna: Significance and symbolism. | `/fivestepsofperfectionprofiling/` |
| `yoga-sutras-patanjali` | book | Yoga Sutras of Patanjali. (n.d.). Google Books. | `/upavikshepaprofiling/` |
| `yogananda-1946-1975` | book | Yogananda, P. (1946/1975). Autobiography of a Yogi.<br>Yogananda, P. (1946/1975). Autobiography of a yogi. Bombay: Jaico. | `/text-books/`, `/inspirational-books/` |
| `yogapedia` | web-page | Yogapedia. (n.d.). Yogapedia. | `/panchkleshavikaarprofiling/` |
| `yogapedia-2023-angamejayatva` | web-page | Yogapedia. (2023a, December 21). Angamejayatva. Yogapedia. | `/upavikshepaprofiling/` |
| `yogapedia-2023-shvasa-prashvasa` | web-page | Yogapedia. (2023b, December 21). Shvasa prashvasa. Yogapedia. | `/upavikshepaprofiling/` |
| `yogitim-2024` | web-page | Yogitim. (2024, August 20). The cause of suffering: The 5 Kleshas • Yoga Basics • Yoga Basics. Yoga Basics. | `/panchkleshavikaarprofiling/` |
| `zahedi-2011` | journal-article | Zahedi, F. (2011, December 27). The challenge of truth telling across cultures: a case study. | `/knowyourvaluessatyatruthfulnessprofiling/` |
| `zeng-2015` | journal-article | Zeng, X., Chiu, C. P. K., Wang, R., Oei, T. P. S., & Leung, F. Y. K. (2015). The effect of loving-kindness meditation on positive emotions: a meta-analytic review. Frontiers in Psychology, 6(1693). | `/brahmavihara/` |

