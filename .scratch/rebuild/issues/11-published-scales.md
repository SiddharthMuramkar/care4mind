# Published scales behind the Questionnaires

Type: research
Mode: AFK
Track: Questionnaires
Status: resolved
Blocked by: none
Map: [Care4Mind.org rebuild](../map.md)

## Question

Is each Questionnaire candidate based on a published scale? The candidates are:

- the KarmaYoga Scale and the Dosha Survey
- the 16 pages that describe a Questionnaire: Triguna, Brahma Vihara, Sthitaprajna, Karta and the others

Start from each page's own references. Read them through the public REST API in one or two requests (`?slug=…&_fields=slug,title,content`). Then look for each scale in journals and open copies, with no paywall workarounds.

For each match, record:

- the citation
- where its items, scoring key, cut-offs and interpretation are published
- how they differ from what the current site shows
- the terms for reproducing the items: copyright, licence, author permission

Nobody decides here. Whether a published key counts as a scoring source is the Psychology expert's call. Without one, the brief's fallback allows only the documented current scoring.

## Answer

Researched 2026-10-26. Full findings: [`published-scales.md`](https://github.com/SiddharthMuramkar/care4mind/blob/research/published-scales/.scratch/rebuild/research/published-scales.md) on branch `research/published-scales` (pushed, never merged; commit `cc8e0b0`).

- The KarmaYoga Scale's 45 items come from Navare & Pandey's 2022 KYM scale. The paper is paywalled, the authors hold the copyright, and no scoring key or cut-offs were seen.
- All 16 description pages cite Tomar (2024), a commercial handbook of questionnaires; 14 match its contents by name. It scores each question 0–10, gives a percentage and uses 20-point bands.
- The current site shows only High/Moderate/Low text with no numbers, and credits it to other sources (mostly blogs or conceptual papers), none of which gives bands or cut-offs.
- No published source was found for the Dosha Survey. Published dosha questionnaires exist (Mysore Tridosha Scale, Brief Prakriti Inventory), but their wording differs.
- Sthitaprajna and Five Steps of Perfection weren't found in the book's searchable text, so their source is unknown.

Whether the Navare or Tomar keys count is the Psychology expert's call; without one, the brief's fallback allows only the documented current scoring.

**Gaps** (all listed in the findings): Tomar's book was seen only through search snippets, and Navare & Pandey (2022) only through excerpts, so neither's full scoring or norms were seen. Who wrote the Dosha Survey, and how the book's author relates to the client, are questions for the client.
