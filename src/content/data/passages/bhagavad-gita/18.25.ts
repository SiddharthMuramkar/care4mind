import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'bhagavad-gita/18.25',
  work: 'bhagavad-gita',
  locator: '18.25',
  order: [18, 25],
  devanagari: ['अनुबन्धं क्षयं हिंसामनपेक्ष्य च पौरुषम् ।', 'मोहादारभ्यते कर्म यत्तत्तामसमुच्यते'],
  transliteration: {
    lines: [
      'anubandhaṃ kṣayaṃ hiṃsāmanapekṣya ca pauruṣam',
      'mohādārabhyate karma yattattāmasamucyate',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'karta-2',
      text: 'That action which is undertaken from delusion, without regard for the consequence, loss, injury, or ability, is declared to be Tamasic (dull).',
    },
  ],
  provenance: {
    sources: [{ url: 'https://care4mind.org/karta-2/', retrieved: '2026-10-27' }],
    edits: [
      'The page gives the English line under the verse no label; it is stored as the translation.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ १८-२५॥” → “” and “ 18-25” → “”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page prints the English line under this verse with no “Translation” or “Meaning” label; it is stored as the verse’s translation. Confirm it is a translation rather than the page’s own reading.',
        ticket: 16,
      },
    ],
  },
})
