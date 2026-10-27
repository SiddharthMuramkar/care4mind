import type { Homepage } from './types'

export const homepage: Homepage = {
  shloka: {
    devanagari: 'यद् भावं तद् भवति',
    iast: 'yad bhāvaṃ tad bhavati',
    translation: 'As are the thoughts, so are the manifestations.',
  },
  intro:
    'The Bharatiya way of philosophic analysis starts with the reflection on the inner Self of man with the ultimate goal, of all mental training, being attainment of Moksha.',
  areas: [
    {
      title: 'Concepts',
      text: 'Explore the rich spiritual traditions of India to understand the unique concepts of ancient Indian psychology.',
      href: '#concepts',
    },
    {
      title: 'Techniques',
      text: 'Emerging cross-cultural techniques in recent times armed the toolbox of caregivers in many ways.',
    },
    {
      title: 'Resources',
      text: 'Our self is our most important resource. An array of inward journey resources help us find ways to mentor the mind.',
    },
    {
      title: 'Tradition and Texts',
      text: 'Ancient Indian philosophical texts that deal with specific perspectives of each unique concept.',
    },
    {
      title: 'Applications',
      text: 'Reflect on applying knowledge of ancient Indian psychology in contemporary situations.',
    },
    {
      title: 'Research',
      text: 'Opportunities in Indian psychology research to create and host models related to Indian theories.',
    },
  ],
  questionnairesNote:
    'More Questionnaires from the current site follow once their questions and scoring rules are confirmed.',
  closing: 'Open the doors to your inner potential.',
  provenance: {
    url: 'https://care4mind.org/',
    retrieved: '2026-10-27',
    edits: [
      'Ellipsis and spacing tidied in the shloka’s English line and the area texts; “Ancient Indian Psychology” lower-cased mid-sentence; stray “,and” fixed.',
      'Closing line “Open the doors to your inner potential !!!” ends with a full stop.',
      'Left out: the four placeholder “Questionaire” cards, which repeat one text, and the survey placeholders.',
    ],
  },
}
