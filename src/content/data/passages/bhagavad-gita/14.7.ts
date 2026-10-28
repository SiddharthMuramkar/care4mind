import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'bhagavad-gita/14.7',
  work: 'bhagavad-gita',
  locator: '14.7',
  order: [14, 7],
  devanagari: [
    'रजो रागात्मकं विद्धि तृष्णासङ्गसमुद्भवम् ।',
    'तन्निबध्नाति कौन्तेय कर्मसङ्गेन देहिनम्',
  ],
  transliteration: {
    lines: [
      'rajo rāgātmakaṃ viddhi tṛṣṇāsaṅgasamudbhavam',
      'tannibadhnāti kaunteya karmasaṅgena dehinam',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'triguna',
      text: 'Know that Rajas (is) of the nature of passion, the source of thirst and attachment; it binds fast O Kaunteya the embodied one by attachment to action.',
    },
  ],
  provenance: {
    sources: [{ url: 'https://care4mind.org/triguna/', retrieved: '2026-10-27' }],
    edits: [
      'Work assigned: the Triguna page heads this verse “Rajas” and names no work there; it is stored as Bhagavad Gītā 14.7, which its text and number are, in the chapter the page heads “Bhagavad Gita – Gunatraya Vibhaga (Chapter 14)”.',
      'The page gives the English line under the verse no label; it is stored as the translation.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ १४-७॥” → “” and “ 14-7” → “”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Triguna page heads this verse without naming a work; its number belongs to chapter 14, which the page names as the Bhagavad Gita’s, and it is stored under the Bhagavad Gītā. Confirm the attribution.',
        ticket: 16,
      },
      {
        for: 'research-editor',
        note: 'The page prints the English line under this verse with no “Translation” or “Meaning” label; it is stored as the verse’s translation. Confirm it is a translation rather than the page’s own reading.',
        ticket: 16,
      },
    ],
  },
})
