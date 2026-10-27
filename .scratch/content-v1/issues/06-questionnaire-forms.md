# 06: Questionnaire forms

Status: ready-for-agent
Blocked by: 02
Spec: [Content v1: the current site's content as typed records](../spec.md) · Decisions: D12, D16

**What to build:** the two instruments with real questions are stored word for word.

- The KarmaYoga Scale gets its 45 statements in the four parts its settings define, ready for the preview flow, with its rights and every oddity flagged.
- The Dosha Survey becomes a coming-later Questionnaire whose 12 questions are stored but never offered as a form.
- Neither carries any trace of an answer key, a band or a result.

## Owns

- `src/content/data/questionnaires/karmayoga-scale.ts`, from ticket 01: add the form, rights and held-back list, and leave the intro fields as they are
- `src/content/data/questionnaires/dosha-survey.ts` (new)
- `tests/unit/content-questionnaire-forms.test.ts` (new)

## Acceptance criteria

- [ ] **KarmaYoga parts** follow the settings' `question_ids` order, not the page markup's:
  - steps 58, 59, 61 and 63 become parts 1 to 4, with 12, 6, 9 and 18 items;
  - each part's title ("Everyday Experience - 1" through "Experience Related to Work - 2") and instructions are its step's own text;
  - the page's different order is listed and flagged for the Psychology expert.
- [ ] **KarmaYoga items:**
  - 45 items, each with the source's question id as its id and its text verbatim;
  - 21 use the frequency options (Always to Never: parts 1 and 3) and 24 the agreement options (Strongly Disagree to Strongly Agree: parts 2 and 4);
  - each option list is stored once, in the source's order.
- [ ] **Reversed options:** the nine agreement items with ids 34–42 list their options from Strongly Agree. They are marked `reversed`, which records display order only, and flagged for the Psychology expert. They are never reordered.
- [ ] **Rights:** "permission needed", held by Navare & Pandey (2022) (© the authors, with reuse through the publisher). The note adds that some of its reward items also appear in Mulla & Krishnan (2014), © Springer (research ticket 11).
- [ ] **Held back, described, never quoted:** the answer key (one option per item marked correct), the three result bands and their messages, the percentage result and the "average score" line, each with where it was. No band limit, message or key appears anywhere.
- [ ] **Scoring:** pending, with the reason that the quiz scored by per-option points held only in the current site's database (planning ticket 09), and that planning tickets 26 and 28 decide the rules.
- [ ] **Unchanged:** status "preview", the intro fields, and the legacy snapshot test. The quiz's description line ("Answer the following from your Everyday experience") is kept if a field fits it, otherwise listed as left out.
- [ ] **Dosha Survey** (`dosha-survey`, status "coming later"):
  - one part of 12 items, each with its own three options in the page's order;
  - item text verbatim, with its topic label ("(Memory) Which of the following best describes your memory?"); "Question N:" and the "*" required marks are form chrome, listed as dropped; odd spacing kept and flagged ("( First Reaction to Something New)");
  - the field labelled "learn to you" after question 9 is the hidden anti-spam field WPForms adds (docs/current-site.md), not a question. It is left out, listed, and flagged for the Psychology expert so that nobody mistakes it for a lost item;
  - rights "permission needed", holder unknown, since research ticket 11 found no published source; flagged for the Project owner;
  - scoring pending, because no rule exists on the site or in any archive (planning tickets 09 and 10);
  - its link to triguṇa, which places its card in the temperament topic, waits for ticket 12; note it in Comments.
- [ ] **Ticket test** (`tests/unit/content-questionnaire-forms.test.ts`):
  - KarmaYoga has four parts of 12, 6, 9 and 18 items: 45 in all, 21 frequency and 24 agreement, with exactly ids 34–42 reversed;
  - `questionnaires.form('karmayoga-scale')` returns all 45 with `questionnairePreview` on, and null with it off;
  - the Dosha Survey has 12 items of three options, and `questionnaires.form('dosha-survey')` returns null.
- [ ] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs questionnaire/karmayoga-scale questionnaire/dosha-survey`. No Playwright run: pages don't change.

## Comments
