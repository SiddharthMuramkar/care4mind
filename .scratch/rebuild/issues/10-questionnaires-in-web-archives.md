# Questionnaires in web archives

Type: research
Mode: AFK
Track: Questionnaires
Status: resolved
Blocked by: none
Map: [Care4Mind.org rebuild](../map.md)

## Question

What do web archives hold of the questionnaire app and the Questionnaire pages?

Search the Wayback Machine (including its CDX index), archive.today and Common Crawl for:

- `questionnaire.care4mind.org`, including its `:8020` address
- `/surveys/` and `/teertha-yatra-quiz/`
- `/karmayoga-scale/` and `/dosha-survey/`
- the 16 pages that describe a Questionnaire

For each capture with Questionnaire content, list the questions, options, scoring, result text or app scripts, with capture URLs and dates. Use the archives only: send nothing to the current site or the app.

Nobody decides here. The facts feed [Questionnaire launch scope and scoring sources](28-questionnaire-launch-scope.md).

## Answer

Researched 2026-10-26. Full findings: [`questionnaires-in-web-archives.md`](https://github.com/SiddharthMuramkar/care4mind/blob/research/questionnaires-in-web-archives/.scratch/rebuild/research/questionnaires-in-web-archives.md) on branch `research/questionnaires-in-web-archives` (pushed, never merged; commit `01b696f`).

- Every Wayback capture was imported from Common Crawl; archive.today has none. Only the app front page, `/karmayoga-scale/`, `/dosha-survey/`, `/teertha-yatra-quiz/` and `/triguna/` were ever captured.
- KarmaYoga Scale: four captures (Aug 2024 – Oct 2025) have the same 45 items, answer key and three result bands. The points per option are in no capture.
- Dosha Survey: five captures (Apr 2025 – Aug 2026) show the same 12 questions with 3 options each. No capture holds a scoring rule, dosha mapping or result text.
- The questionnaire app was a Django project on the development server with debug on. Its front page listed 3, then 8, then 17 Questionnaire cards; no questions or scripts were archived.
- 15 of the 16 description pages match an app card by name; Friend/Foe has none. Only `/triguna/` was archived, with High/Moderate/Low text but no cut-offs.

**Gaps** (all listed in the findings): The settings don't say whether the 0–100 bands are percent or points. The Memento aggregator couldn't be reached, so other national archives weren't checked. The app's questions, scoring and result pages were never archived.
