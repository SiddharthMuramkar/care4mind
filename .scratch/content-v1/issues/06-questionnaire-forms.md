# 06: Questionnaire forms

Status: resolved
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

- [x] **KarmaYoga parts** follow the settings' `question_ids` order, not the page markup's:
  - steps 58, 59, 61 and 63 become parts 1 to 4, with 12, 6, 9 and 18 items;
  - each part's title ("Everyday Experience - 1" through "Experience Related to Work - 2") and instructions are its step's own text;
  - the page's different order is listed and flagged for the Psychology expert.
- [x] **KarmaYoga items:**
  - 45 items, each with the source's question id as its id and its text verbatim;
  - 21 use the frequency options (Always to Never: parts 1 and 3) and 24 the agreement options (Strongly Disagree to Strongly Agree: parts 2 and 4);
  - each option list is stored once, in the source's order.
- [x] **Reversed options:** the nine agreement items with ids 34–42 list their options from Strongly Agree. They are marked `reversed`, which records display order only, and flagged for the Psychology expert. They are never reordered.
- [x] **Rights:** "permission needed", held by Navare & Pandey (2022) (© the authors, with reuse through the publisher). The note adds that some of its reward items also appear in Mulla & Krishnan (2014), © Springer (research ticket 11).
- [x] **Held back, described, never quoted:** the answer key (one option per item marked correct), the three result bands and their messages, the percentage result and the "average score" line, each with where it was. No band limit, message or key appears anywhere.
- [x] **Scoring:** pending, with the reason that the quiz scored by per-option points held only in the current site's database (planning ticket 09), and that planning tickets 26 and 28 decide the rules.
- [x] **Unchanged:** status "preview", the intro fields, and the legacy snapshot test. The quiz's description line ("Answer the following from your Everyday experience") is kept if a field fits it, otherwise listed as left out.
- [x] **Dosha Survey** (`dosha-survey`, status "coming later"):
  - one part of 12 items, each with its own three options in the page's order;
  - item text verbatim, with its topic label ("(Memory) Which of the following best describes your memory?"); "Question N:" and the "*" required marks are form chrome, listed as dropped; odd spacing kept and flagged ("( First Reaction to Something New)");
  - the field labelled "learn to you" after question 9 is the hidden anti-spam field WPForms adds (docs/current-site.md), not a question. It is left out, listed, and flagged for the Psychology expert so that nobody mistakes it for a lost item;
  - rights "permission needed", holder unknown, since research ticket 11 found no published source; flagged for the Project owner;
  - scoring pending, because no rule exists on the site or in any archive (planning tickets 09 and 10);
  - its link to triguṇa, which places its card in the temperament topic, waits for ticket 12; note it in Comments.
- [x] **Ticket test** (`tests/unit/content-questionnaire-forms.test.ts`):
  - KarmaYoga has four parts of 12, 6, 9 and 18 items: 45 in all, 21 frequency and 24 agreement, with exactly ids 34–42 reversed;
  - `questionnaires.form('karmayoga-scale')` returns all 45 with `questionnairePreview` on, and null with it off;
  - the Dosha Survey has 12 items of three options, and `questionnaires.form('dosha-survey')` returns null.
- [x] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs questionnaire/karmayoga-scale questionnaire/dosha-survey`. No Playwright run: pages don't change.

## Comments

- **Built (2026-10-28).** The KarmaYoga Scale's form, rights, held-back list and a new scoring reason, added to `karmayoga-scale.ts` with the intro fields untouched; the Dosha Survey as a new coming-later record, `dosha-survey.ts`; and the ticket test, 16 tests in `tests/unit/content-questionnaire-forms.test.ts`, at two seams: the content source (what each record stores) and `createContent(localSource, flags)` (what `questionnaires.form()`, `get()` and `list()` give). 221 unit tests pass (10 completeness checks still wait for ticket 12). Verify passes both records, with 65 and 51 strings checked; with no arguments it passes all 24 records. A scratch comparison with the extract outline (not committed) also confirmed the order of every part, statement and option.
- **Counts:** KarmaYoga: 4 parts (steps 58, 59, 61 and 63) of 12, 6, 9 and 18 statements, 45 in all; 21 rated by frequency (parts 1 and 3) and 24 by agreement (parts 2 and 4); 2 option lists; 9 marked `reversed` (ids 34–42); 4 held-back items. Dosha Survey: 1 part of 12 questions, each with its own list of 3 options; nothing held back, since its page has no score or result text.
- **Decisions the spec left open:**
  - Slug `dosha-survey`, as the ticket names it (the page's own address); its title and source title are the page's, "Dosha Survey".
  - KarmaYoga part ids are their titles' words (`everyday-experience-1` to `experience-related-to-work-2`); the option lists are named `frequency` and `agreement`.
  - Dosha Survey item ids are `q1` to `q12`, from the page's own numbering ("Question 1" to "Question 12"), because the form plugin's field ids aren't in the outline. Each question's option list is named after its item. Its one part takes the page's heading, "Dosha Survey", as its title, and its instructions are empty because the page gives none.
  - The quiz's description line ("Answer the following from your Everyday experience") is listed as left out, and flagged: no field fits it. The intro fields stay as the foundation wrote them (the legacy snapshot pins them), and each part's instructions are its step's own text. A form-level description field in `src/content/schema/questionnaire.ts` (ticket 01's file, not this ticket's) would let a later ticket keep it.
  - The quiz's own start-page title, "Karma Yoga Scale", is listed as left out; the record keeps the post's title.
  - The held-back items say where each was on the current site, never what it said. No band limit, message, percentage or key detail is written anywhere, and the ticket test fails if a percentage figure reaches either record.
  - Rights flags name planning ticket 01, whose question list asks the client about permission to reproduce a published scale; flags about items name planning ticket 26.
  - The foundation's three edits are kept word for word. Its first ("the items themselves are not copied here") is about the purpose and format; a new edit says the form carries the statements word for word.
- **Flags raised:**
  - Psychology expert: the settings' order against the page markup's; the reversed options of items 34–42; two statements kept with apparent slips (29's mid-sentence "If", 30's "it s"); the description line left out; the Dosha Survey's "( First Reaction to Something New)" spacing; the "learn to you" anti-spam field left out, so nobody takes it for a lost question.
  - Research editor: the attribution of the KarmaYoga statements to Navare & Pandey (2022), which comes from research ticket 11, not the page (ticket 02 left this flag to this ticket).
  - Project owner: the KarmaYoga rights (Navare & Pandey 2022, with Mulla & Krishnan 2014 for some reward items), and the Dosha Survey's unknown author and rights holder.
- **For ticket 12:** set the Dosha Survey's `concepts` to the triguṇa Concept's slug (ticket 11 chooses it) once that Concept exists. That link places its card in the temperament topic (settled rule 12); until then `concepts` is empty and the card has no topic.
- **Left over:** nothing else in scope. No census ids were needed: neither record cites a Reference or passage beyond `navare-pandey-2022`, which ticket 01 created.
