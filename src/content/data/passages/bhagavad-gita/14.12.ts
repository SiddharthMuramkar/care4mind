import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'bhagavad-gita/14.12',
  work: 'bhagavad-gita',
  locator: '14.12',
  order: [14, 12],
  devanagari: ['लोभः प्रवृत्तिरारम्भः कर्मणामशमः स्पृहा ।', 'रजस्येतानि जायन्ते विवृद्धे भरतर्षभ'],
  transliteration: {
    lines: [
      'Lobhaḥ pravṛttirārambhaḥ karmaṇāmaśamaḥ spṛhā |',
      'Rajasyetāni jāyante vivṛddhe bharatarṣabha',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'triguna',
      text: 'Greed, activity, undertaking of actions, restlessness, and longing arise when Rajas is predominant, O best of the Bharata family.',
    },
  ],
  provenance: {
    sources: [{ url: 'https://care4mind.org/triguna/', retrieved: '2026-10-27' }],
    edits: [
      'Work assigned: the Triguna page heads this verse “Guna Predominance” and names no work there; it is stored as Bhagavad Gītā 14.12, which its text and number are, in the chapter the page heads “Bhagavad Gita – Gunatraya Vibhaga (Chapter 14)”.',
      'The page gives the English line under the verse no label; it is stored as the translation.',
      'The quotation marks around the translation are left out.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ १४-१२॥” → “” and “ || 14-12 ||” → “”.',
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
