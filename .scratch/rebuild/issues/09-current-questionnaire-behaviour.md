# How the KarmaYoga Scale and Dosha Survey work now

Type: research
Mode: AFK
Track: Questionnaires
Status: open
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
