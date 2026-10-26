# Published scales behind the Questionnaires: research findings

Ticket: [Published scales behind the Questionnaires](../issues/11-published-scales.md) · Researched 2026-10-26 · Branch: research/published-scales

## Summary

- **The KarmaYoga Scale is a published scale.** Its 45 items are the 45-item KYM scale from Navare & Pandey (2022), *International Journal of Cross Cultural Management*. The article is behind a paywall and the authors hold the copyright. No scoring key or cut-offs were visible in the parts that can be read. The current site's answer key, which marks one "correct" option per item and shows a percentage, is not how a five-point rating scale is normally scored.
- **All 16 Questionnaire description pages cite one book: Tomar (2024), *Self Management Through Self Evaluation: A Practical Handbook of Questionnaires Inspired by Ancient Indian Wisdom*.** Its table of contents lists questionnaires under the same names as at least 14 of the 16 pages, from "Triguna Profile" to "Brahmacharya Profiling". The book contains the questions and scoring instructions: rate each question from 0 to 10, add up the ratings, and turn the total into a percentage. It then gives result bands 20 points wide, such as "0 to 20 % – Crawling".
- **That book is a self-help handbook, not a peer-reviewed or validated scale.** It is sold commercially (₹400 in print), and its preview shows only snippets. No open licence was found, so reproducing its questions would need the rights holder's permission. Whether the book's author is connected to the client is unknown.
- **The current site shows none of the book's questions or numbers.** Each page gives High, Moderate and Low descriptions with no cut-offs. Most pages say their descriptions were "referred from" some other source. Those sources are mostly blog posts, essays and conceptual papers. Four of them contain published scales, but for different things (spiritual-care skill, teenage nonviolence, self-control, sexual compulsivity), and none supplies the site's High/Moderate/Low text or any cut-off.
- **Sthitaprajna and Five Steps of Perfection** couldn't be found in the book's searchable text. Their source is unknown.
- **No published source was found for the Dosha Survey.** Exact-phrase searches found nothing, and the Tomar book has no "Dosha" entry. Published dosha questionnaires exist, such as the Mysore Tridosha Scale and the Brief Prakriti Inventory, but their wording differs.
- **Openly licensed scales exist for some of the same ideas** (Karma-Yoga, Triguna, dosha). They aren't what the current site uses, so they could only replace its Questionnaires if the Psychology expert chooses to.
- **Nobody decides here.** Whether a published key counts as a scoring source is the Psychology expert's call. Without one, the brief's fallback allows only the documented current scoring. Of all the candidates, only the KarmaYoga Scale has any (its answer key in the page HTML).

## Findings

Every source below was read on 2026-10-26. Some technical terms used throughout:

- **Scale (or instrument):** a published set of questions (items) with a defined way to score the answers.
- **Rating scale (Likert scale):** an item answered on graded options such as Strongly disagree … Strongly agree, or Never … Always.
- **Scoring key:** the rule that turns answers into numbers.
- **Cut-off:** the score at which one result band ends and the next begins.
- **Open access:** an article anyone can read free.
- **Paywalled:** an article you must pay to read.
- **Creative Commons (CC) licence:** a standard public licence for reuse.
  - **BY:** reuse is allowed with credit to the author.
  - **NC:** non-commercial use only.
  - **ND:** changed versions may not be shared.
  - **SA:** changed versions must be shared under the same licence.

### How the search was done

- **Current site, two requests.** The REST API is the current site's public data interface; it returns page content as structured data. Two requests went to care4mind.org, a few seconds apart. Nothing else was fetched from the site.
  - **Pages:** `/wp-json/wp/v2/pages?slug=…&per_page=20&_fields=slug,title,content`, with the 16 description pages plus `dosha-survey`. It returned all 17.
  - **Post:** `/wp-json/wp/v2/posts?slug=karmayoga-scale&_fields=slug,title,content`.

  Each page's References section, and any line saying where its "score indicators" came from, were read from these responses.
- **Each scale was then traced to its source.** This used publisher pages and DOI landing pages. A DOI is a permanent identifier for a published paper. Open copies on PubMed Central (a free archive of biomedical papers) were also read, along with Google Books' public search-inside snippets for the Tomar book. Paywalls weren't worked around. Where an article was paywalled, only its public abstract page and search-engine excerpts of its text were used. Those excerpts are labelled as such below.

### At a glance

| Candidate | Based on a published scale? | Questions published in | Scoring key and cut-offs published in | Reuse terms |
| --- | --- | --- | --- | --- |
| KarmaYoga Scale | Yes: Navare & Pandey (2022), KYM scale | the paywalled article (Table 1) | Five-point agreement and frequency ratings. No key or cut-offs seen. | © The Author(s) 2022, no open licence |
| Dosha Survey | None found | – | – | – |
| 14 of the 16 description pages | Yes, a book: Tomar (2024). It is a handbook, not a validated scale. | the book (preview mostly hidden) | the book: 0–10 per question, total as a percentage, 20-point bands | a commercial book; no open licence found |
| Sthitaprajna, Five Steps of Perfection | Not found | – | – | – |

### KarmaYoga Scale

**Citation.** Navare, A., & Pandey, A. (2022). Karma Yoga: Scale development and studies of the impact on positive psychological outcomes at the workplace. *International Journal of Cross Cultural Management*, 22(2), 271–299. [doi:10.1177/14705958221111239](https://journals.sagepub.com/doi/abs/10.1177/14705958221111239)

**How it was matched.** Search-engine excerpts of the article's full text contain the current site's items word for word. Each one was searched as an exact phrase:

- "I cannot stop myself from eating delicious and tempting but unhealthy food" (site item 1), under "Manonigraha … Resistance for temptations"
- "I find it difficult to resist my temptations (like eating, drinking, etc.)" (item 2)
- "I see myself as a part of the natural system" (item 22)
- "I feel, my role in the society is a very essential part of my life" (item 28), under "Sense of responsibility"
- "My spirit is energized by my work" (item 42)
- "My job helps me to understand my life's purpose" (item 44)

These excerpts came from [Firecrawl search results for the SAGE full text](https://journals.sagepub.com/doi/10.1177/14705958221111239) and for the [ResearchGate record](https://www.researchgate.net/publication/361940233_Karma_Yoga_Scale_development_and_studies_of_the_impact_on_positive_psychological_outcomes_at_the_workplace). The same excerpts say:

- "Karma Yoga was measured by a 45-items KYM scale (reliability α = 0.92)". The current site also has 45 items.
- "A five-point Likert scale measuring agreeableness for some items and frequency for remaining items was used." The current site also uses five options, either Always … Never or Strongly Disagree … Strongly Agree.

Not every one of the 45 items was compared word for word, because the full item table is paywalled.

**What the scale measures.** The KYM model has five parts. A book chapter by Krishnan and Mulla summarises them from Navare's 2019 thesis ([rkvenkat.org chapter PDF](https://rkvenkat.org/zubin_bkch2022.pdf)):

- *manonigraha*: control of the mind and refraining from over-indulgence
- *samabuddhi*: a steady intellect in extreme situations
- *phalāśā tyāga*: giving up attachment to rewards
- *svadharma*: acting in line with one's own nature
- *lokasaṃgraha*: belonging and responsibility toward the larger social and natural system

The current site's items fall into the same groups in order. Items 1–10 are temptation and distraction, 11–21 steadiness under failure and stress, 22–31 connection and social responsibility, 32–40 attachment to rewards, and 41–45 meaning in work. This grouping is a reading of the item wording against those definitions; the paper's own item-to-factor table wasn't visible. One excerpt has a table note saying the items of some factors "are reverse-worded", and that some items were "adopted from Workplace [spirituality]…" measures. A reverse-worded item is phrased so that agreeing means *less* of the trait.

Several of the site's reward items are taken, nearly or exactly, from an older scale: the "indifference to rewards" subscale of Mulla & Krishnan (2014), *Journal of Business Ethics* 123, 339–351 ([doi:10.1007/s10551-013-1842-8](https://link.springer.com/article/10.1007/s10551-013-1842-8); its appendix is readable on the article page). For example, "I work only when I see that there is some personal benefit for me" and "When I do something well, I expect recognition from others" are identical in both. Mulla & Krishnan mark these items "negatively scored".

**Where the items, key, cut-offs and interpretation are published.**

- **Items:** in the article (its Table 1, "KYM scale items and factor analysis results (study 1)"), which is paywalled at $37.50 ([SAGE page](https://journals.sagepub.com/doi/abs/10.1177/14705958221111239)).
- **Scoring key:** the five-point rating format is stated (above). How the item ratings are combined (summed or averaged, per dimension or overall) wasn't visible.
- **Cut-offs and interpretation:** none seen. The article studies how KYM scores relate to mindfulness, thriving, burnout and similar measures (abstract). Nothing visible suggests it publishes result bands.

**How it differs from the current site.** For the site's answer key, see [current-site.md](../../../docs/current-site.md) and the separate ticket [How the KarmaYoga Scale and Dosha Survey work now](../issues/09-current-questionnaire-behaviour.md).

- **Scoring.** The current site's quiz marks one option per item as "correct": 21 × Never, 15 × Strongly Agree, 9 × Strongly Disagree. It then shows a percentage, and the results screen says "The average score is 65%". Those counts line up with the item groups:
  - items 1–21 are negatively worded frequency items, so "Never" is the answer most in keeping with Karma Yoga
  - items 22–31 and 41–45 are positively worded agreement items (15, "Strongly Agree")
  - items 32–40 are reward-seeking statements (9, "Strongly Disagree")

  A five-point rating scale normally gives every option a value, 1 to 5. If the quiz counts only the flagged option, a person answering "Rarely" instead of "Never" gets nothing for that item instead of 4 out of 5. Ticket 09 checks how Quiz Maker actually computes the percentage.
- **Option order.** On items 32–40 the current site lists the options in reverse (Strongly Agree first). On the other 15 agreement items it lists Strongly Disagree first. This was counted from the REST response. Whether the article does the same is unknown.
- **Result.** The current site shows a single percentage with no interpretation. No bands or interpretation were found in the article either.
- **Name.** The current site calls it "Karma Yoga Scale". The article calls it the KYM scale.

**Reproduction terms.** The article is "Restricted access", its rights line reads "© The Author(s) 2022", and reuse requests go through the publisher's "Re-use permissions" link to the Copyright Clearance Center ([SAGE page](https://journals.sagepub.com/doi/abs/10.1177/14705958221111239)). No open licence covers the items. The reward items borrowed from Mulla & Krishnan (2014) sit in an article whose permissions link names "Springer Science+Business Media Dordrecht" as copyright holder ([Springer page](https://link.springer.com/article/10.1007/s10551-013-1842-8)). No author permission for the current site's use was found.

**Other published Karma-Yoga scales, for comparison.** These are not what the current site uses.

- **Rastogi, Pati, Kumar & Dixit (2020)**, *IIMB Management Review* 32(4), 352–364: the Karma-Yoga Instrument (KYI-6, from a 10-item pool).
  - Open access under **CC BY-NC-ND 4.0**, with all items printed in its appendix.
  - Rated 1–7 from Never to Always. Two items are reverse-coded. The instrument covers absorption and service consciousness.
  - Its Table 1 also lists six earlier Karma-Yoga scales, with reliabilities mostly below 0.70 ([ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0970389617304731)).
- **Mulla & Krishnan (2014)**: 18 items across duty-orientation, indifference to rewards and equanimity. Items are on the Springer page; copyright Springer (above).

### Dosha Survey

**No published source was found.**

- Three distinctive option texts were searched as exact phrases on the open web, with no matching source:
  - "I have a good memory, I can recall things others can't"
  - "My stories are detailed" with "I tell only the necessary details"
  - "I treat my team like family" with "I am tough but fair"
- The general searches returned only commercial "dosha quiz" pages, whose wording didn't match in the results seen.
- The Tomar book has no match for "Dosha" ([Google Books search](https://books.google.com/books?id=PeYdEQAAQBAJ&q=Dosha)).

**What the current site shows.** The current site's form has 12 required questions, each with a topic label such as "(Memory)" or "(Leadership Style)", and three options each. There is no scoring, result text or reference on the page. The REST content also contains the hidden anti-spam field that current-site.md describes, which isn't part of the survey.

**Published dosha questionnaires, for comparison.** None of these uses the current site's wording.

- **Mysore Tridosha Scale.** Shilpa & Venkatesha Murthy (2011), *AYU* 32(3), 308–314 ([PubMed Central](https://pmc.ncbi.nlm.nih.gov/articles/PMC3326873/)). 157 self-rating items on the psychological side of Vata, Pitta and Kapha. It is open access on PubMed Central; its licence line wasn't captured.
- **The short version** has 45 items, 15 per dosha, with each dosha scored 0–45 ([AYU short report](https://journals.lww.com/aayu/fulltext/2023/44030/development_of_mysore_tridosha_scale___a_short.5.aspx)).
- **Brief Prakriti Inventory (BPI-21).** Holla, Bhargav et al., *Wellcome Open Research* 10:669, version 2, 2026 ([PubMed Central](https://pmc.ncbi.nlm.nih.gov/articles/PMC12780516/)).
  - Same shape as the Dosha Survey: each item has three options, one per dosha. The chosen dosha scores 1, the others 0, and each dosha's total is turned into a percentage.
  - Its items are long descriptions ("I grasp new information quickly but tend to forget it easily…"), not the current site's short phrases.
  - Its data are under CC BY 4.0, and the tool is free online. The article's own licence line wasn't captured.

### The 16 Questionnaire description pages

#### Their common source: Tomar (2024)

**Citation.** Tomar, V. S. (2024). *Self Management Through Self Evaluation: A Practical Handbook of Questionnaires Inspired by Ancient Indian Wisdom* (1st ed.). Prabhat Prakashan. ISBN 9789355628527. 192 pages.

- **Cited everywhere.** Every one of the 16 pages lists it in its References, and several link to its Google Books entry ([publisher page](https://www.prabhatbooks.com/self-management-through-self-evaluation-a-practical-handbook-of-questionnaires-inspired-by-ancient-indian-wisdom.htm); [Google Books](https://books.google.com/books?id=PeYdEQAAQBAJ)).
- **What the publisher says it is.** "Step-by-step questionnaires" for "deep self-evaluation across all areas of your life-mental, physical, emotional and spiritual".
- **The author.** The publisher's author page describes him as an educationist, author, trainer and management consultant, and director of Project Self Inc. USA-Bharat, UMS INDIA and Akshara Kids Academy ([author page](https://www.prabhatbooks.com/author/dr-vikrant-singh-tomar.htm), in Hindi). The book points readers to the author's videos on "the YouTube channel of United Consciousness".
- **Not a validated scale.** Nothing on the publisher's or Google's pages describes the questionnaires as validated or peer-reviewed. Validated means tested statistically for reliability and for measuring what they claim to.

**What it contains.** The [Google Books contents](https://books.google.com/books?id=PeYdEQAAQBAJ) has seven sections: Know Your Personality (p. 19), Know Your Mind (41), Know Your Struggle (59), Know Your Readiness (81), Know Your Values (98), Know Your Elevation (136) and Know Your Potential (154). Search-inside snippets of the contents pages (pp. 15–17) list the questionnaires inside each section. These snippets came from Google Books searches for [Triguna](https://books.google.com/books?id=PeYdEQAAQBAJ&q=Triguna), [Karta](https://books.google.com/books?id=PeYdEQAAQBAJ&q=Karta), [Vikshepa](https://books.google.com/books?id=PeYdEQAAQBAJ&q=Vikshepa), [Momentum](https://books.google.com/books?id=PeYdEQAAQBAJ&q=Momentum) and ["Know Your Elevation"](https://books.google.com/books?id=PeYdEQAAQBAJ&q=%22Know+Your+Elevation%22). Matched against the current site's pages:

| Current site page | In the book? | Where (book's own title, page) |
| --- | --- | --- |
| `/triguna/` | Yes | 1.1 "Triguna Profile – (Sattva Guna, Rajas Guna, Tama Guna)", p. 19 |
| `/karta-2/` | Yes | 1.2 "What Kind of Karta (Doer) are You? Profiling", p. 29 |
| `/brahmavihara/` | Yes | 1.3 "Brahama Vihara Profiling (Friendliness, Compassion, Kindness, Indifference)", p. 34 |
| `/knowyourmind/` | Yes | 2.1 "Know Your State of Mind", p. 41 |
| `/frienorfoeofself/` | Yes | 2.2 "Are you a friend or foe of yourself? Profiling", p. 48 |
| `/vikshepa/` | Yes | 3.1 "Vikshepa (Distraction) Profiling", p. 59 |
| `/upavikshepaprofiling/` | Yes | 3.2 "Upa-Vikshepa Profiling", p. 65 |
| `/panchkleshavikaarprofiling/` | Yes | 3.4 "Panch Klesha – Vikaar Profiling", p. 73 |
| `/spiritualpractitionerprofiling/` | Yes | 4.1 "Spiritual Practitioner…", from p. 81 |
| `/momentumofspiritualpractice/` | Yes | 4.3 "Momentum of Spiritual Practice", pp. 92–96 |
| `/knowyourvaluesahimsanon-violenceprofiling/` | Yes | 5.1 "Ahimsa (Non-Violence) Profiling", p. 100 |
| `/knowyourvaluessatyatruthfulnessprofiling/` | Yes | 5.2 "Satya (Truthfulness) Profiling", p. 104 |
| `/knowyourvaluesasteyanonstealingprofiling/` | Yes | 5.3 "Asteya (Non-Stealing) Profiling", p. 108 |
| `/knowyourvaluesbrahmacharya-profiling/` | Yes | 5.4 "Brahmacharya Profiling" (page cut off in the snippet) |
| `/sthitaprajna/` | Not found | No hits for "Sthitaprajna", "Sthita" or "steady wisdom" |
| `/fivestepsofperfectionprofiling/` | Not found | No hits for "Perfection" or "Shraddha" |

Two contents entries were cut off in the snippets: a third questionnaire in Know Your Mind (starting "3. Do …") and a second one in Know Your Readiness. Either could be Sthitaprajna or Five Steps of Perfection under another title. The Momentum page also opens with the same passage the book quotes on p. 93 ("Such a qualified pupil scorched with the fire of an endless round of birth, death…").

The book also has questionnaires the current site has no page for:

- Malin Chitta (six impurities of the mind)
- Aparigraha and the five Niyamas: Shaucha, Santosh, Tapah, Swadhyaya, Ishwar Pranidhana
- Karma Yogi, Jnana Yogi and Bhakta Profiling (pp. 136–153)
- seven chakra profilings (pp. 154–185)

Its Karma Yogi Profiling is a different questionnaire from the current site's KarmaYoga Scale. The site's items match Navare & Pandey (above), and the site's post (November 2023, per current-site.md) predates the book (30 Aug 2024 on Google Books).

**Where the items, key, cut-offs and interpretation are published.** All of the following is in the book, seen only as search-inside snippets. Google marks the book "a preview. The total pages displayed will be limited", and every snippet page showed "No preview available for this page". The snippets came from searches for ["Instructions of Scoring"](https://books.google.com/books?id=PeYdEQAAQBAJ&q=%22Instructions+of+Scoring%22) and ["Method for Calculation"](https://books.google.com/books?id=PeYdEQAAQBAJ&q=%22Method+for+Calculation%22).

- **Items:** printed with a blank for the reader's score. For example, Karta: "I don't have any attachment or aversion to any person or thing.______".
- **Scoring instructions** (pp. 31, 43, 66, 89, 139, 162): "You are required to score yourself on a scale of 0 to 10 for each question. a. Base your scoring on your actual actions rather than idealised response. b. Give scores according to alignment of your behaviour…"
- **Calculation.** For one 20-question profile: "Add the scores for all the 20 questions … total score of your profile out of 200 … % Score = Total Score × 100 / 200". For the Values profiles: "Add the scores for all the 10 questions … out of 100 … This is also your % score."
- **Subscales.** Brahma Vihara splits its 20 questions into four parts of five: Friendliness, Compassion, Kindness and Indifference. Each part is reported as its own percentage ("You have Friendliness …… %"). Know Your State of Mind reports a percentage for each of five states, from Forgetful (Mudha) to Restrained (Niruddha).
- **Result bands (cut-offs).**
  - Asteya, Aparigraha and Shaucha: "0 to 20 % – You are 'Crawling' on the path of …", then "21 to 40 …".
  - Momentum of Spiritual Practice: "61 to 80% – Moderately Fast", "81 to 100% – Very Fast".
  - The pattern implies five 20-point bands. The middle band (41–60) and the other labels weren't seen.
- **Interpretation:** each questionnaire ends with "Write your Action Plan for Self-Improvement". Whether the book has longer result descriptions wasn't visible.

**How it differs from the current site.**

- **Questions.** The current site shows none; the book prints them.
- **Bands.** The current site gives three bands (High, Moderate, Low) with no numbers. The book gives percentages with 20-point bands and its own labels ("Crawling", "Moderately Fast", "Very Fast"). Nothing found says how five bands map onto three.
- **Karta.** The current site says "Each Karta type—Sattvik, Rajasic, and Tamasic—is scored on a scale of 1 to 10". The book asks for 0 to 10 on each question.
- **Brahma Vihara.** The current site says "Further distinctions are made for each of the Brahma Vihara components based on section wise scores obtained", but gives none. The book scores the four components separately.
- **Where the band descriptions come from.** The current site credits its High/Moderate/Low descriptions to other sources (next section), not to the book. Whether its wording comes from the book can't be checked from the snippets.

**Reproduction terms.**

- No licence was found on the publisher's page, the author page or Google Books.
- The book is sold at ₹400 in print and as an eBook on Google Play.
- The copyright page wasn't visible in the preview, so the rights holder (author or publisher) isn't confirmed.
- No author permission for the current site's use was found.

#### Where each page says its descriptions came from

Most pages end their High/Moderate/Low section with a note such as "Score indicators for … were referred from …". These are the sources named, with what each one turned out to be:

| Page | Source the page names | What it is | A scale? | Terms |
| --- | --- | --- | --- | --- |
| Triguna | "According to Murthy & Kumar (2007), the following characteristics indicate high and low traits" | "Concept triguna: A critical analysis and synthesis", *Psychological Studies* 52, 103–113 ([APA PsycNet](https://psycnet.apa.org/record/2007-17987-001)) | No: a review and synthesis | not checked |
| Karta | No note. Levels are cited to Paranjpe (1996), Rao & Paranjpe (2016) and Tomar (2024). | conceptual works on Indian psychology | No | – |
| Brahma Vihara | "All score based indicators … are referred from Sarkar (2019)" | "Buddhists Concept of Brahma-Vihar: An Analysis of Morals", a 4-page philosophy article ([PDF](https://old.rrjournals.com/wp-content/uploads/2019/01/185-188_RRIJM190401037.pdf)) | No questionnaire in the parts read | journal footer "All Rights Reserved" |
| Sthitaprajna | "referred from www.wisdomlib.org, 2022b" | an essay, "6. Sthitaprajna (a true Yogin)" ([wisdomlib](https://www.wisdomlib.org/hinduism/essay/gita-ethics-critical-study/d/doc1146799.html)) | No | – |
| Know Your Mind | Indicators cite Krishnappa et al. (2020) | "Concept of mind in Indian philosophy, Western philosophy, and psychology", *Yoga Mimamsa* 52(1), 25–28, an exploratory essay ([doi:10.4103/ym.ym_24_19](https://doi.org/10.4103/ym.ym_24_19)) | No | open, Creative Commons (type not captured) |
| Friend or Foe | Indicators cite Hegde & Nayak (2025) | a textual analysis and literature review, *Millah* 24(1), 359–378 ([doi:10.20885/millah.vol24.iss1.art9](https://doi.org/10.20885/millah.vol24.iss1.art9)) | No | CC BY-SA 4.0 |
| Vikshepa | "Yoga Sutras of Patanjali 1.30-1.32: Obstacles and Solutions, n.d.-b" | a web page ([swamij.com](https://swamij.com/yoga-sutras-13032.htm)) | No | – |
| Upa-Vikshepa | "Yoga Sutras of Patanjali, n.d." | a Google Books entry with no author or translator | No | – |
| Panch Klesha – Vikaar | "Hridaya Yoga, 2024; Yogitim, 2024" | two yoga blog posts ([Hridaya](https://hridaya-yoga.com/kleshas-the-5-fundamental-causes-of-suffering/), [Yoga Basics](https://www.yogabasics.com/learn/the-cause-of-suffering-the-kleshas/)) | No | – |
| Spiritual Practitioner | "Ford et al. (2023)" | "Spiritually grounded character: A latent profile analysis", *Frontiers in Psychology* 13 ([doi:10.3389/fpsyg.2022.1061416](https://doi.org/10.3389/fpsyg.2022.1061416)). It groups 763 people into High, Evident, Limited and Low "spiritually grounded character" profiles, using existing scales (Delaney Spirituality Scale, VIA Inventory, PERMA Profiler). A latent profile analysis is a statistical method that sorts people into groups by their score patterns. | No scale of its own; groups come from statistics, not cut-offs | CC BY |
| Five Steps of Perfection | "www.wisdomlib.org, 2025b; Indurkar, n.d.; Samhita, 2024" | a wisdomlib glossary page, a journal abstract ([IJSR](https://www.ijsr.net/getabstract.php?paperid=SR24092115600)), and "Samhita, 2024", which isn't in the page's reference list | No | – |
| Momentum of Spiritual Practice | "Fopka-Kowalczyk et al. (2022)" | the Spiritual Supporter Scale, *Journal of Religion and Health* 62, 2081–2111 ([doi:10.1007/s10943-022-01608-3](https://doi.org/10.1007/s10943-022-01608-3)). 31 items rated 1–4 for agreement, in five subscales. It measures spiritual-care skills in professionals. Scores are converted to Sten scores (a 1–10 scale showing how a person compares with a reference group): 1–2 very low, 3–4 low, 5–6 medium, 7–8 high, 9–10 very high. | **Yes**, but for a different thing from "momentum of practice" | **CC BY 4.0**, items in its appendix |
| Ahimsa | "Sudrajat and Universitas Pendidikan Indonesia (2017)" | an Indonesian adaptation of Mayton's Teenage Nonviolence Test: 55 rating items in six dimensions, tested on 2,293 students ([SCITEPRESS PDF](https://www.scitepress.org/Papers/2017/70371/70371.pdf)) | **Yes**: nonviolence in teenagers | not checked |
| Satya | "(Agrawal & Aldons, 2023)" | "Bridging the Gap Between Western and Indian Concept of Truth", *International Journal of Indian Psychology* 11(2), which calls itself "This conceptual paper" ([IJIP](https://ijip.in/articles/bridging-the-gap-between-western-and-indian-concept-of-truth)) | No | open access (licence not captured) |
| Asteya | "Dylan & Muncaster, 2021; Parmar, 2014" | a paywalled social-work article on the yamas and niyamas ([doi:10.1080/15426432.2021.1912686](https://doi.org/10.1080/15426432.2021.1912686)), and a journal article "Non stealing (Asteya)". Neither was read in full. | Not shown by their titles | – |
| Brahmacharya | "Manapat et al. (2019) and Rodríguez-Nieto et al. (2021)" | Manapat: a psychometric analysis of the 13-item Brief Self-Control Scale, *Assessment* 28(2), 395–412 ([SAGE](https://doi.org/10.1177/1073191119890021)). Rodríguez-Nieto: a study of 69 young men using that scale (scores 13–65) and the Sexual Compulsivity Scale, with that scale's published cut-offs: under 18 none, 18–23 mild, 24–29 moderate, 30 and over high ([doi:10.3389/fpsyg.2021.723449](https://doi.org/10.3389/fpsyg.2021.723449)). | **Yes**: self-control and sexual compulsivity | Manapat © The Author(s) 2019, paywalled; Rodríguez-Nieto **CC BY** |

So the pages credit their High/Moderate/Low descriptions to sources that don't contain those descriptions as published bands. None of the 16 pages names a published cut-off. Four sources contain published scales: the Spiritual Supporter Scale, the Teenage Nonviolence Test adaptation, the Brief Self-Control Scale and the Sexual Compulsivity Scale. Each measures something other than the page's own idea, and none of their items appears on the current site.

#### Published scales for the same ideas, where checked

Only Triguna was checked, alongside the dosha scales above (one-session limit):

- **Mysore Triguna Scale.** Shilpa & Venkatesha Murthy (2012), *SAGE Open* 2. Open access under **CC BY 3.0**. Scores convert to stanines (a 1–9 standard scale) for classification ([SAGE](https://journals.sagepub.com/doi/10.1177/2158244012436564)).
- **Vedic Personality Inventory.** Wolf (1999), *Psychological Reports* 84(3), 1379–1390. 56 items, shortened from 90. Not open access ([PubMed](https://pubmed.ncbi.nlm.nih.gov/10477953)). A later open study describes its 7-point rating and its 15/19/22 split of items across Sattva, Rajas and Tamas ([PubMed Central](https://pmc.ncbi.nlm.nih.gov/articles/PMC8691444/)).
- **The Triguna page's own references** include Swaroop, Salagame & Bhat (2016), "Triguna: A Conceptual Study and the Development and Validation of AHS Scale" ([doi:10.15614/ijpp/2016/v7i4/133840](https://doi.org/10.15614/ijpp/2016/v7i4/133840)). That is a published scale, but the page doesn't present it as its source. Not checked.

### What this means for scoring sources (facts only)

- **Documented current scoring.** The KarmaYoga Scale has an answer key in its page HTML (current-site.md). The 16 description pages show no questions, key or cut-offs. The Dosha Survey shows no scoring at all.
- **Published keys.**
  - Navare & Pandey (2022) publishes the KarmaYoga items and a five-point format. No key or cut-offs were seen.
  - The Tomar book publishes items, a 0–10 key, percentages and 20-point bands for most of the 16 pages.
  - Under the ticket's rule, whether either counts as a scoring source is the Psychology expert's call. Until then, [Questionnaire launch scope](../issues/28-questionnaire-launch-scope.md) treats a published key as grounds for deferral.
- **Permission.** Using the KYM items or the book's items on the new site would rest on permission from the rights holders, since neither carries an open licence. The brief excludes legal advice, so this is only the fact pattern.

## Gaps and uncertainties

- **The Tomar book was seen only through search-inside snippets.**
  - Its questions, the full band labels, any longer result descriptions and its copyright page weren't visible.
  - Google Books returned "too many requests" errors (HTTP 429) on some searches, and its API quota was exhausted.
  - Whether the current site's High/Moderate/Low texts come from the book is unknown.
  - Buying the book (₹400 print, eBook on Google Play) or asking the client for it would settle this. That is a purchase or a client question, not a paywall workaround.
- **Sthitaprajna and Five Steps of Perfection weren't found** in the book's searchable text. Two cut-off contents entries ("3. Do …" in Know Your Mind, and item 2 of Know Your Readiness) are unaccounted for.
- **Navare & Pandey (2022) is paywalled.** The match rests on six items found word for word in search-engine excerpts, plus matching item count and format. The full item table, how scores are combined, any reverse scoring and any norms weren't seen. Navare's 2019 PhD thesis on Karma Yoga (listed on his [SPJIMR faculty page](https://www.spjimr.org/faculty/ajinkya-navare/)) wasn't found as an open copy.
- **How Quiz Maker turns the answer key into a percentage** is outside this ticket; see [ticket 09](../issues/09-current-questionnaire-behaviour.md).
- **The Dosha Survey's origin is unknown.** It may have been written in-house or come from the questionnaire app's builder. This is a question for the client.
- **Who the book's author is to the client** is unknown. It matters for permission, and is a question for the client.
- **Licences not captured:** the Mysore Tridosha Scale (AYU), the Sudrajat adaptation and Mayton's original test, Krishnappa et al. (the Creative Commons type), Agrawal & Aldons (IJIP), and the Brief Prakriti Inventory article itself.
- **Not checked:**
  - published scales for Brahma Vihara, Sthitaprajna, the kleshas, the yamas, the states of mind and the other ideas, beyond what each page cites
  - two references on the pages that may describe scales: Swaroop et al. (2016) on Triguna, and Jayasheela & Salagame (2018), "Triguna and chitta bhũmike in Yoga practitioners", on Know Your Mind
- **Interpretation of item groups.** Mapping the KarmaYoga items to the five KYM parts is a reading of the item wording against the published definitions. It is for the Psychology expert to confirm.

## Sources

All read on 2026-10-26.

**Current site** (REST API, two requests):
- https://care4mind.org/wp-json/wp/v2/pages (`slug` = the 16 description pages and `dosha-survey`, `_fields=slug,title,content`)
- https://care4mind.org/wp-json/wp/v2/posts (`slug=karmayoga-scale`, `_fields=slug,title,content`)

**KarmaYoga Scale:**
- Navare & Pandey (2022), SAGE abstract and rights: https://journals.sagepub.com/doi/abs/10.1177/14705958221111239
- Navare & Pandey (2022), full-text excerpts via search: https://journals.sagepub.com/doi/10.1177/14705958221111239 and https://www.researchgate.net/publication/361940233_Karma_Yoga_Scale_development_and_studies_of_the_impact_on_positive_psychological_outcomes_at_the_workplace
- Krishnan & Mulla, book chapter summarising Navare (2019): https://rkvenkat.org/zubin_bkch2022.pdf
- Mulla & Krishnan (2014): https://link.springer.com/article/10.1007/s10551-013-1842-8
- Rastogi, Pati, Kumar & Dixit (2020): https://www.sciencedirect.com/science/article/pii/S0970389617304731
- Navare, faculty page: https://www.spjimr.org/faculty/ajinkya-navare/

**Tomar (2024):**
- Publisher: https://www.prabhatbooks.com/self-management-through-self-evaluation-a-practical-handbook-of-questionnaires-inspired-by-ancient-indian-wisdom.htm
- Author page: https://www.prabhatbooks.com/author/dr-vikrant-singh-tomar.htm
- Google Books: https://books.google.com/books?id=PeYdEQAAQBAJ, with search-inside `&q=` Triguna, Karta, "Brahma Vihara", Sthitaprajna, Sthita, "steady wisdom", Vikshepa, Momentum, Perfection, Shraddha, Dosha, "Know Your Elevation", "Know Your Readiness", "Instructions of Scoring" and "Method for Calculation"

**Sources the pages name:**
- Murthy & Kumar (2007): https://psycnet.apa.org/record/2007-17987-001
- Sarkar (2019): https://old.rrjournals.com/wp-content/uploads/2019/01/185-188_RRIJM190401037.pdf
- Krishnappa et al. (2020): https://doi.org/10.4103/ym.ym_24_19
- Hegde & Nayak (2025): https://doi.org/10.20885/millah.vol24.iss1.art9
- Ford et al. (2023): https://doi.org/10.3389/fpsyg.2022.1061416
- Fopka-Kowalczyk et al. (2022): https://doi.org/10.1007/s10943-022-01608-3
- Sudrajat (2017): https://www.scitepress.org/Papers/2017/70371/70371.pdf
- Agrawal & Aldons (2023): https://ijip.in/articles/bridging-the-gap-between-western-and-indian-concept-of-truth
- Dylan & Muncaster (2021): https://doi.org/10.1080/15426432.2021.1912686
- Manapat et al. (2019): https://doi.org/10.1177/1073191119890021
- Rodríguez-Nieto et al. (2021): https://doi.org/10.3389/fpsyg.2021.723449

**Published Triguna and dosha scales:**
- Mysore Triguna Scale: https://journals.sagepub.com/doi/10.1177/2158244012436564
- Vedic Personality Inventory: https://pubmed.ncbi.nlm.nih.gov/10477953 and https://pmc.ncbi.nlm.nih.gov/articles/PMC8691444/
- Mysore Tridosha Scale: https://pmc.ncbi.nlm.nih.gov/articles/PMC3326873/
- Mysore Tridosha Scale, short version: https://journals.lww.com/aayu/fulltext/2023/44030/development_of_mysore_tridosha_scale___a_short.5.aspx
- Brief Prakriti Inventory: https://pmc.ncbi.nlm.nih.gov/articles/PMC12780516/

**In the repo:** [docs/current-site.md](../../../docs/current-site.md) (the KarmaYoga answer key and the post dates)
