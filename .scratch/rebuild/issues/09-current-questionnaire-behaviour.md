# How the KarmaYoga Scale and Dosha Survey work now

Type: research
Mode: AFK
Track: Questionnaires
Status: resolved
Blocked by: none
Map: [Care4Mind.org rebuild](../map.md)

## Question

What exactly do the current KarmaYoga Scale and Dosha Survey do? Fetch `/karmayoga-scale/` and `/dosha-survey/` once each as page HTML, read-only. Submit nothing, and don't finish the quiz.

- **KarmaYoga Scale.** Decode the items, options and answer key in `window.quizOptions_3`. From the public source of Quiz Maker 8.7.8, work out:
  - how its percentage is computed (per-question weights, option order)
  - what the results screen shows
  - what "The average score is 65%" is computed from
  - whether finishing the quiz stores anything
- **Dosha Survey.** From the docs and source of WPForms Lite 2.0.3, find what a form can show on submit: a fixed message, a page or a redirect, and whether any calculation is possible. Then say what the form's settings in the page markup suggest it does.

Nobody decides here. The facts feed [Questionnaire launch scope and scoring sources](28-questionnaire-launch-scope.md).

## Answer

Researched 2026-10-26. Full findings: [`current-questionnaire-behaviour.md`](https://github.com/SiddharthMuramkar/care4mind/blob/research/current-questionnaire-behaviour/.scratch/rebuild/research/current-questionnaire-behaviour.md) on branch `research/current-questionnaire-behaviour` (pushed, never merged; commit `25ff11f`).

- The KarmaYoga Scale runs on the paid Quiz Maker 8.7.8 plugin. It scores "by points": points per option and weights per question live only in the site database, so the percentage can't be rebuilt from the page. The decoded "correct" flags aren't what gets summed.
- Its encoded settings hold three result bands (0–35, 36–75, 76–100) with messages. This corrects current-site.md, which said no bands are in the HTML.
- The "65% average" is the rounded mean of all stored results, frozen in the cached page. Each finish stores answers, score, times and probably the visitor's IP address.
- The Dosha Survey (WPForms Lite 2.0.3) can only show one fixed message, page or redirect, the same for everyone. Calculations are paid add-ons, and option values are just the label text.
- Lite keeps no entries in WordPress. Whether submissions are emailed, and which confirmation shows, can't be seen without submitting ([Try the two working Questionnaires on the current site](27-try-current-questionnaires.md)).

This bears on [Questionnaire launch scope and scoring sources](28-questionnaire-launch-scope.md): the answer key decoded from the page is not the documented current scoring; the per-option points are, and only the client's database holds them.

**Gaps** (all listed in the findings): Quiz Maker 8.7.8's code isn't public, so its scoring is inferred from the free plugin. The KarmaYoga percentage and band can't be reproduced without a client export or admin access. How the results screen renders, whether IP addresses are stored, and the Dosha Survey's confirmation all wait on [Try the two working Questionnaires on the current site](27-try-current-questionnaires.md) or the client.
