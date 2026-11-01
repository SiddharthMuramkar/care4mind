import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'bhagavad-gita/14.8',
  work: 'bhagavad-gita',
  locator: '14.8',
  order: [14, 8],
  devanagari: [
    'तमस्त्वज्ञानजं विद्धि मोहनं सर्वदेहिनाम् ।',
    'प्रमादालस्यनिद्राभि स्तन्निबध्नाति भारत',
  ],
  transliteration: {
    lines: [
      'tamastvajñānajaṃ viddhi mohanaṃ sarvadehinām',
      'pramādālasyanidrābhi stannibadhnāti bhārata',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'triguna',
      text: 'Know that Tamas is born of ignorance, deluding all beings, it binds fast, O Bharata, by heedless-ness, indolence and sleep.',
    },
  ],
  provenance: {
    sources: [{ url: 'https://care4mind.org/triguna/', retrieved: '2026-10-27' }],
    edits: [
      'Work assigned: the Triguna page heads this verse “Tamas” and names no work there; it is stored as Bhagavad Gītā 14.8, which its text and number are, in the chapter the page heads “Bhagavad Gita – Gunatraya Vibhaga (Chapter 14)”.',
      'The page gives the English line under the verse no label; it is stored as the translation.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ १४-८॥” → “” and “ 14-8” → “”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Triguna page heads this verse without naming a work; its number belongs to chapter 14, which the page names as the Bhagavad Gita’s, and it is stored under the Bhagavad Gītā. Confirm the attribution.',
        decidedBy: 'traditional-texts',
      },
      {
        for: 'research-editor',
        note: 'The page prints the English line under this verse with no “Translation” or “Meaning” label; it is stored as the verse’s translation. Confirm it is a translation rather than the page’s own reading.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})
