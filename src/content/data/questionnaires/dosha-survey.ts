import { defineQuestionnaire } from '@/content/schema'

// The current site's Dosha Survey, a form of 12 questions. It is kept as a coming-later
// Questionnaire (D16): its questions are stored word for word but never offered as a form, and
// its author, rights and scoring are unknown. Its link to triguṇa, set by content-v1 ticket 12
// once that Concept existed, places its card in the temperament topic (design notes B3).
export default defineQuestionnaire({
  kind: 'questionnaire',
  slug: 'dosha-survey',
  title: 'Dosha Survey',
  sourceTitle: 'Dosha Survey',
  status: 'coming-later',
  concepts: ['triguna'],
  form: {
    responseSets: {
      q1: [
        'I have some difficulty remembering things',
        'I have a good memory in general',
        'I have a good memory, I can recall things others can’t',
      ],
      q2: [
        'It is easy for me to get distracted',
        'I focus when something is logical',
        'I have no trouble concentrating',
      ],
      q3: [
        'I don’t get angry, I adapt easily',
        'I don’t like it, but I adjust if logical',
        'I don’t like changes to my plans',
      ],
      q4: [
        'Overthinking & second-guessing',
        'Someone logically convinces me',
        'If a loved one asks me to reconsider',
      ],
      q5: [
        'My stories are detailed & wander into topics',
        'I tell only the necessary details',
        'I provide vivid descriptions',
      ],
      q6: ['Work in bursts of energy', 'Follow a proper schedule', 'Work at a consistent pace'],
      q7: ['I get distracted often', 'I follow a strict routine', 'I start slow but pick up later'],
      q8: [
        'Almost every night',
        'Occasionally, but very vivid',
        'Rarely, and they are slow & detailed',
      ],
      q9: [
        'Fear & overthinking possible scenarios',
        'I look for ways to prove myself',
        'I resist and prefer things as they were',
      ],
      q10: ['I fit in with any group', 'I am tough but fair', 'I treat my team like family'],
      q11: [
        'I jump in with both feet',
        'I need convincing first',
        'I plan every detail before starting',
      ],
      q12: [
        'I figure things out as I go',
        'I like structured planning',
        'I take many opinions before deciding',
      ],
    },
    parts: [
      {
        id: 'dosha-survey',
        title: 'Dosha Survey',
        instructions: '',
        items: [
          {
            id: 'q1',
            text: '(Memory) Which of the following best describes your memory?',
            responseSet: 'q1',
          },
          {
            id: 'q2',
            text: '(Concentration) How easy is it for you to focus on something for an extended period?',
            responseSet: 'q2',
          },
          {
            id: 'q3',
            text: '(Changes to Plans) How do you react to sudden schedule changes?',
            responseSet: 'q3',
          },
          {
            id: 'q4',
            text: '(Appeal to Change) What convinces you to change your mind?',
            responseSet: 'q4',
          },
          { id: 'q5', text: '(Storytelling Style) How do you tell stories?', responseSet: 'q5' },
          { id: 'q6', text: '(Work Style) How do you prefer to work?', responseSet: 'q6' },
          { id: 'q7', text: '(Learning Style) How do you learn new things?', responseSet: 'q7' },
          { id: 'q8', text: '(Dreams) How often do you dream?', responseSet: 'q8' },
          {
            id: 'q9',
            text: '( First Reaction to Something New) How do you react to a new or strange situation?',
            responseSet: 'q9',
          },
          {
            id: 'q10',
            text: '(Leadership Style) How do you interact with a team?',
            responseSet: 'q10',
          },
          {
            id: 'q11',
            text: '(Starting Something New) How easily do you start new projects?',
            responseSet: 'q11',
          },
          { id: 'q12', text: '(Planning Style) How do you prefer to plan?', responseSet: 'q12' },
        ],
      },
    ],
  },
  scoring: {
    status: 'pending',
    reason:
      'No scoring rule exists for it on the current site, whose form can only show everyone the same fixed message, or in any web archive (planning tickets 09 and 10). Planning tickets 26 and 28 decide the rules, and the Psychology expert approves them (FR-05).',
  },
  heldBack: [],
  rights: {
    status: 'permission-needed',
    holder: 'Unknown',
    note: 'No published source was found for the survey (research ticket 11), so who wrote it, and who holds its rights, is unknown.',
  },
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [{ url: 'https://care4mind.org/dosha-survey/', retrieved: '2026-10-27' }],
    edits: [
      'Form chrome left out: each question’s number, from “Question 1:” to “Question 12:”, and its “*” required mark, the form’s five hidden fields and its “Submit” button.',
      'Left out: the text field labelled “learn to you” after question 9, which is the hidden anti-spam field the form plugin adds, not a question.',
    ],
    flags: [
      {
        for: 'psychology-expert',
        note: 'Question 9’s topic label is kept as the page spaces it, “( First Reaction to Something New)”, where the other eleven have no space inside the bracket. Nothing was changed.',
        ticket: 26,
      },
      {
        for: 'psychology-expert',
        note: 'After question 9 the saved form has a text field labelled “learn to you”. It is the hidden anti-spam field the form plugin adds (visitors never see it, and its label changes from load to load), not a lost question, so the record leaves it out. All 12 of the survey’s questions are kept.',
        ticket: 26,
      },
      {
        for: 'psychology-expert',
        note: 'The survey’s page says nothing about what it measures, so no purpose is stored, and none was written. The current homepage’s “Dosha” card, left out with the homepage’s other questionnaire cards, describes it: “The Dosha Survey helps identify your unique mind-body type based on the three Ayurvedic principles — Vāta (air & space), Pitta (fire & water), and Kapha (earth & water)..”. Decide whether that sentence becomes its purpose, or approve leaving it out.',
        ticket: 26,
      },
      {
        for: 'project-owner',
        note: 'No published source was found for the Dosha Survey (research ticket 11), so its author and rights holder are unknown. Its questions are stored but not offered as a form; permission is needed before they are published.',
        ticket: 1,
      },
      {
        for: 'project-owner',
        note: 'The current Dosha Survey page links no Concept. The record names triguṇa as its Concept, which places the survey’s card in the temperament topic, as the design notes do (B3): a structure call, not something the page says. Confirm the placement, or choose another topic or none.',
        ticket: 13,
      },
    ],
  },
})
