import { defineHome } from '@/content/schema'

export default defineHome({
  kind: 'home',
  shloka: {
    devanagari: 'यद् भावं तद् भवति',
    iast: 'yad bhāvaṃ tad bhavati',
    translation: 'As are the thoughts, so are the manifestations.',
  },
  intro:
    'The Bharatiya way of philosophic analysis starts with the reflection on the inner Self of man with the ultimate goal, of all mental training, being attainment of Moksha.',
  // Each area's target is set by ticket 07, where the new site has a real destination for it.
  areas: [
    {
      title: 'Concepts',
      text: 'Explore the rich spiritual traditions of India to understand the unique concepts of ancient Indian psychology.',
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
  closing: 'Open the doors to your inner potential.',
  provenance: {
    sources: [{ url: 'https://care4mind.org/', retrieved: '2026-10-27' }],
    edits: [
      // The front-end foundation's edits (planning ticket 21), kept as it wrote them.
      'Ellipsis and spacing tidied in the shloka’s English line and the area texts; “Ancient Indian Psychology” lower-cased mid-sentence; stray “,and” fixed.',
      'Closing line “Open the doors to your inner potential !!!” ends with a full stop.',
      'Left out: the four placeholder “Questionaire” cards, which repeat one text, and the survey placeholders.',
      // Listed when the record was re-homed into content v1.
      'Shloka translation: “thoughts…so” → “thoughts, so”.',
      'Concepts area: “unique concepts of Ancient Indian Psychology” → “unique concepts of ancient Indian psychology.”.',
      'Resources area: “to mentor the mind” → “to mentor the mind.”.',
      'Research area: “create ,and host” → “create and host”.',
      'Closing line: “potential !!!” → “potential.”.',
      'Interface text dropped: each area’s link label (“Concepts...”, “Methods...”, “Resources...”, “Persepctives...”, “Applications...”, “Opportunities...”) and the “-” under each area’s text.',
      'Left out: the “Psychology” heading above the areas, the “Karma Yoga: An Indian Perspective of Work” heading, and the closing “Ancient Indian Wisdom” link to DharmaWiki’s main page.',
    ],
    flags: [],
  },
})
