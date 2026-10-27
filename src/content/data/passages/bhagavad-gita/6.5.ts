import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'bhagavad-gita/6.5',
  work: 'bhagavad-gita',
  locator: '6.5',
  order: [6, 5],
  devanagari: [
    'उद्धरेदात्मनात्मानं नात्मानमवसादयेत् ।',
    'आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः',
  ],
  transliteration: {
    lines: [
      'uddharedātmanātmānaṃ nātmānamavasādayet',
      'ātmaiva hyātmano bandhurātmaiva ripurātmanaḥ',
    ],
    scheme: 'iast',
  },
  translations: [],
  provenance: {
    sources: [{ url: 'https://care4mind.org/frienorfoeofself/', retrieved: '2026-10-27' }],
    edits: [
      'The verse number after the last line is left out, since the locator holds it: “ ॥ ६-५॥” → “” and “ 6-5” → “”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page that quotes this verse gives no line labelled “Translation”: its English line is labelled “Meaning” and stays on that page’s quote. No translation is stored, and none was looked up.',
        ticket: 16,
      },
    ],
  },
})
