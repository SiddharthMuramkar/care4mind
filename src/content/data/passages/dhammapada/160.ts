import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'dhammapada/160',
  work: 'dhammapada',
  locator: '160',
  order: [160],
  devanagari: [],
  transliteration: {
    lines: [
      'attā hi attano nātho kohi nātho paro siyā |',
      'attan’āva sudantena nāthaṃ labhati dullabhaṃ',
    ],
    scheme: 'iast',
  },
  translations: [],
  provenance: {
    sources: [{ url: 'https://care4mind.org/frienorfoeofself/', retrieved: '2026-10-27' }],
    edits: [
      'The verse number after the last line is left out, since the locator holds it: “ || 160 ||” → “”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'No page gives this verse in Devanagari. The list is left empty; nothing was filled from elsewhere.',
        ticket: 16,
      },
      {
        for: 'research-editor',
        note: 'The page that quotes this verse gives no line labelled “Translation”: its English line is labelled “Meaning” and stays on that page’s quote. No translation is stored, and none was looked up.',
        ticket: 16,
      },
    ],
  },
})
