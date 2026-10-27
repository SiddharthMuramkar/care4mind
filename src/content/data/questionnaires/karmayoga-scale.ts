import { defineQuestionnaire } from '@/content/schema'

export default defineQuestionnaire({
  kind: 'questionnaire',
  slug: 'karmayoga-scale',
  title: 'KarmaYoga Scale',
  sourceTitle: 'KarmaYoga Scale',
  status: 'preview',
  summary:
    'Statements about your everyday experience and your experience at work, rated by how often they apply and how far you agree.',
  purpose: [
    'The KarmaYoga Scale looks at karma yoga, an Indian perspective of work, through your own experience: first in everyday life, then at work.',
    'You read each statement and say how frequently or infrequently you have that experience, or how far you agree with it. Answer according to what really reflects your experience rather than what you think your experience should be, and treat each statement separately from every other.',
    'Its statements come from the Karma Yoga scale published by Navare and Pandey (2022).',
  ],
  format: [
    '45 statements in four parts: everyday experience (two parts) and experience related to work (two parts).',
    '21 statements are rated by how often they apply, from Always to Never.',
    '24 statements are rated by how far you agree, from Strongly Disagree to Strongly Agree.',
    'Every statement needs an answer before your result is shown.',
  ],
  concepts: ['vikshepa'],
  source: 'navare-pandey-2022',
  limitations: {
    items: [
      'This is a reflection exercise, not a clinical test. It does not diagnose anything and is not medical or psychological advice.',
      'Care4Mind makes no claim that this Questionnaire is valid for any purpose.',
      'Its scoring rules are still being confirmed. The Questionnaire opens here once they are, and its result will come only from those documented rules.',
      'If you are struggling, please talk to a qualified professional.',
    ],
    status: 'draft-pending-psychology-expert',
  },
  form: {
    responseSets: {
      frequency: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'],
      agreement: [
        'Strongly Disagree',
        'Disagree',
        'Neither agree nor disagree',
        'Agree',
        'Strongly Agree',
      ],
    },
    parts: [
      {
        id: 'everyday-experience-1',
        title: 'Everyday Experience - 1',
        instructions:
          'Upcoming is a collection of statements about your day to day experience. Using the rating scale given, please indicate how frequently or infrequently you currently have each experience. Please answer according to what really reflects your experience rather than what you think your experience should be. Please treat each item separately from every other item.',
        items: [
          {
            id: '15',
            text: 'I cannot stop myself from eating delicious and tempting but unhealthy food.',
            responseSet: 'frequency',
          },
          {
            id: '16',
            text: 'I find it difficult to resist my temptations (like eating, drinking, etc.).',
            responseSet: 'frequency',
          },
          {
            id: '17',
            text: 'I tend to buy fancy products even if they are of little use to me.',
            responseSet: 'frequency',
          },
          {
            id: '18',
            text: 'I spend too much money on things which are not useful to me.',
            responseSet: 'frequency',
          },
          {
            id: '19',
            text: 'It makes me angry if I don’t get to eat my favourite cuisines.',
            responseSet: 'frequency',
          },
          {
            id: '20',
            text: 'When it is impossible to fulfil my temptation, I keep thinking about it.',
            responseSet: 'frequency',
          },
          {
            id: '23',
            text: 'Unfavourable incidents disturb me immensely.',
            responseSet: 'frequency',
          },
          { id: '24', text: 'Failure makes me feel pessimistic.', responseSet: 'frequency' },
          { id: '25', text: 'Failure disturbs me internally.', responseSet: 'frequency' },
          {
            id: '26',
            text: 'While in stress, I find it difficult to differentiate between right and wrong.',
            responseSet: 'frequency',
          },
          {
            id: '27',
            text: 'During tough times, I generally take rash decisions.',
            responseSet: 'frequency',
          },
          {
            id: '28',
            text: 'When in tension, I cannot give a careful thought to the situation.',
            responseSet: 'frequency',
          },
        ],
      },
      {
        id: 'everyday-experience-2',
        title: 'Everyday Experience - 2',
        instructions:
          'Next is the collection of statements reflecting thoughts about everyday experience in general. Use the given scale to indicate your level of agreement or disagreement with each statement. Similar to the instruction given with the previous section please answer according to what really reflects your experience rather than what you think your experience should be.',
        items: [
          {
            id: '57',
            text: 'I see myself as a part of the natural system.',
            responseSet: 'agreement',
          },
          {
            id: '53',
            text: 'Whatever I do, I believe, has an impact on the larger social system.',
            responseSet: 'agreement',
          },
          {
            id: '54',
            text: 'I feel responsible towards the larger social system.',
            responseSet: 'agreement',
          },
          {
            id: '55',
            text: 'I feel that human beings, animals and trees are connected to each other.',
            responseSet: 'agreement',
          },
          {
            id: '56',
            text: 'I feel, all the living-beings in the nature are dependent on each other.',
            responseSet: 'agreement',
          },
          {
            id: '52',
            text: 'I see myself as a part of the larger social system.',
            responseSet: 'agreement',
          },
        ],
      },
      {
        id: 'experience-related-to-work-1',
        title: 'Experience Related to Work - 1',
        instructions:
          'Next is a collection of statements about your experience at workplace. Using the rating scale below, please indicate how frequently or infrequently you currently have each experience. Please treat each item separately from every other item. Similar to the previous section as advised, please answer according to what really reflects your experience rather than what you think your experience should be.',
        items: [
          {
            id: '21',
            text: 'I am unable to remain focused on my work for a long time and get easily carried away by other things.',
            responseSet: 'frequency',
          },
          {
            id: '22',
            text: 'Various temptations keep coming to my mind while I am working.',
            responseSet: 'frequency',
          },
          { id: '13', text: 'I am easily distracted during my work.', responseSet: 'frequency' },
          {
            id: '14',
            text: 'I find it difficult to concentrate on my work.',
            responseSet: 'frequency',
          },
          {
            id: '29',
            text: 'I feel extremely frustrated If I do not achieve my work targets.',
            responseSet: 'frequency',
          },
          {
            id: '30',
            text: 'I feel frustrated even if it s a small failure at work.',
            responseSet: 'frequency',
          },
          {
            id: '31',
            text: "When emotionally disturbed at work, generally I don't make good decisions.",
            responseSet: 'frequency',
          },
          {
            id: '32',
            text: 'I am unable to think of alternatives, when I am under stress at work.',
            responseSet: 'frequency',
          },
          {
            id: '33',
            text: 'I find it difficult to look at the problem from different perspectives during stressful situations at work.',
            responseSet: 'frequency',
          },
        ],
      },
      {
        id: 'experience-related-to-work-2',
        title: 'Experience Related to Work - 2',
        instructions:
          'Next is the collection of statements reflecting thoughts about your experience at work. Use the given scale to indicate your level of agreement or disagreement with each statement.',
        items: [
          {
            id: '34',
            text: 'I cherish the moments of results much more than the moments of efforts.',
            responseSet: 'agreement',
            reversed: true,
          },
          {
            id: '35',
            text: 'Desired results of my work are more important than efforts.',
            responseSet: 'agreement',
            reversed: true,
          },
          {
            id: '36',
            text: 'I insist on getting rewarded for my work at my desired time.',
            responseSet: 'agreement',
            reversed: true,
          },
          {
            id: '37',
            text: 'Getting credit of my work is extremely important for me.',
            responseSet: 'agreement',
            reversed: true,
          },
          {
            id: '38',
            text: 'When I do something well, I expect recognition from others.',
            responseSet: 'agreement',
            reversed: true,
          },
          {
            id: '39',
            text: 'While working, I keep thinking about what is in it for me.',
            responseSet: 'agreement',
            reversed: true,
          },
          {
            id: '40',
            text: 'I work only when I see that there is some personal benefit for me.',
            responseSet: 'agreement',
            reversed: true,
          },
          {
            id: '41',
            text: 'I cannot work, when I know that I will not get anything in return for myself.',
            responseSet: 'agreement',
            reversed: true,
          },
          {
            id: '42',
            text: 'When I am given a task, I first think about how I will benefit from it.',
            responseSet: 'agreement',
            reversed: true,
          },
          { id: '43', text: 'I experience joy in my work.', responseSet: 'agreement' },
          { id: '44', text: 'My spirit is energized by my work.', responseSet: 'agreement' },
          {
            id: '45',
            text: 'The work I do is connected with what I think is important in life.',
            responseSet: 'agreement',
          },
          {
            id: '46',
            text: 'My job helps me to understand my life’s purpose.',
            responseSet: 'agreement',
          },
          { id: '47', text: 'My work makes my life more meaningful.', responseSet: 'agreement' },
          {
            id: '48',
            text: 'I feel, my role in the society is a very essential part of my life.',
            responseSet: 'agreement',
          },
          {
            id: '49',
            text: 'I motivate my colleagues to take care of natural environment.',
            responseSet: 'agreement',
          },
          {
            id: '50',
            text: 'I try to convince my colleagues to become responsible towards nature and environment.',
            responseSet: 'agreement',
          },
          {
            id: '51',
            text: 'I try that my colleagues behave socially responsible.',
            responseSet: 'agreement',
          },
        ],
      },
    ],
  },
  scoring: {
    status: 'pending',
    reason:
      'The current quiz scored each answer by per-option points held only in the current site’s database (planning ticket 09), so there is no documented rule to carry over. Planning tickets 26 and 28 decide the rules, and the Psychology expert approves them (FR-05).',
  },
  heldBack: [
    {
      what: 'The answer key: one option of each statement marked as the correct answer',
      where: 'In the quiz’s encoded options, in the current page’s markup',
    },
    {
      what: 'Three result bands, each with its score range and its message',
      where: 'In the quiz’s settings, encoded in the current page’s markup',
    },
    {
      what: 'The percentage result shown when the quiz is finished',
      where: 'On the quiz’s results page',
    },
    {
      what: 'A line giving an average score',
      where: 'On the quiz’s results page',
    },
  ],
  rights: {
    status: 'permission-needed',
    holder: 'Navare & Pandey (2022): © the authors, with reuse through the publisher',
    note: 'The statements match the 45-item KYM scale published in Navare & Pandey (2022). No open licence covers it, and no permission for the current site’s use was found (research ticket 11). Some of its reward statements also appear in Mulla & Krishnan (2014), © Springer Science+Business Media Dordrecht.',
  },
  reviewStatus: 'drafted-not-reviewed',
  provenance: {
    sources: [{ url: 'https://care4mind.org/karmayoga-scale/', retrieved: '2026-10-27' }],
    edits: [
      // The front-end foundation's edits (planning ticket 21), kept as it wrote them.
      'Purpose and format are written from the current page’s four instruction steps and its 45 items; the items themselves are not copied here.',
      'The source citation comes from the planning map’s Published scales research (ticket 11), not from the current page, which cites no source.',
      'The limitations are a draft in the brief’s fallback wording. The Psychology expert owns them.',
      // Content-v1 ticket 06: the form, its rights and what it holds back.
      'The form carries the quiz’s 45 statements and their options word for word, with each part’s title and instructions from its step, in the order the quiz’s settings give (steps 58, 59, 61 and 63, each followed by its statements), not the order the page markup lists them in.',
      'Each option list is stored once, in the order the quiz lists it: the frequency options for parts 1 and 3, the agreement options for parts 2 and 4. Statements 34–42 list the agreement options in reverse, from Strongly Agree, and are marked reversed instead of having a list of their own.',
      'Left out: the quiz’s own title on its start page, “Karma Yoga Scale”; the record keeps the post’s title.',
      'Left out: the quiz’s description line on its start page, “Answer the following from your Everyday experience”. No field of the record fits it, and the intro fields stay as the front-end foundation wrote them.',
      'The rights come from the planning map’s Published scales research (ticket 11), not from the current page.',
    ],
    flags: [
      {
        for: 'psychology-expert',
        note: 'The summary, purpose, format and limitations were written by the front-end foundation from the quiz’s four instruction steps; none of it is on the current page. Approve or rewrite them.',
        ticket: 26,
      },
      {
        for: 'project-owner',
        note: 'Linked to the vikṣepa Concept for the preview only, because several of its statements are about distraction at work; the current page links no Concept. Planning ticket 14 decides its real links.',
        ticket: 14,
      },
      {
        for: 'psychology-expert',
        note: 'The quiz’s settings and its page markup list the 45 statements in different orders. The settings give four parts: steps 58, 59, 61 and 63, with 12, 6, 9 and 18 statements. The markup lists the four steps first, then the 21 statements rated by frequency (with 21, 22, 13 and 14 between 20 and 23) and the 24 rated by agreement (with 48–51 before 34–47). The record follows the settings; confirm which order the scale uses.',
        ticket: 26,
      },
      {
        for: 'psychology-expert',
        note: 'Statements 34–42, the first nine of part 4, list their options from Strongly Agree to Strongly Disagree, the reverse of the other 15 agreement statements. They keep that order and are marked reversed, which records the display order only and says nothing about scoring. Confirm whether the order matters.',
        ticket: 26,
      },
      {
        for: 'psychology-expert',
        note: 'Two statements are kept word for word with what look like slips: 29 has a capital “If” mid-sentence, and 30 reads “it s”, as if an apostrophe were lost. Nothing was changed or looked up; check them against the published scale.',
        ticket: 26,
      },
      {
        for: 'psychology-expert',
        note: 'The quiz’s start page has a description line, “Answer the following from your Everyday experience”, which the record leaves out because none of its fields fits it. Decide whether the flow shows it.',
        ticket: 26,
      },
      {
        for: 'research-editor',
        note: 'The current page cites no source for its statements. The record names Navare & Pandey (2022) as their source, and its drafted purpose says so, because the Published scales research (planning ticket 11) found six of them word for word in excerpts of the paper, with the same count and rating format. Confirm the attribution.',
        ticket: 11,
      },
      {
        for: 'project-owner',
        note: 'The statements match the published KYM scale of Navare & Pandey (2022), © the authors, with reuse through the publisher. No open licence covers them, and no permission for the current site’s use was found (research ticket 11). Some reward statements also appear in Mulla & Krishnan (2014), © Springer. Permission is needed before the statements are published.',
        ticket: 1,
      },
    ],
    drafted: ['summary', 'purpose', 'format', 'limitations'],
  },
})
