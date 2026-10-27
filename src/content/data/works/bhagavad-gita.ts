import { defineWork } from '@/content/schema'

export default defineWork({
  kind: 'work',
  slug: 'bhagavad-gita',
  // The Devanagari is the Concepts page's, from its card “Bhagavad Gita (भगवद्गीता)”.
  title: {
    iast: 'Bhagavad Gītā',
    devanagari: 'भगवद्गीता',
    ascii: ['Bhagavad Gita', 'Bhagavat Gita'],
  },
  locatorLabel: 'Verse',
  provenance: {
    sources: [
      { url: 'https://care4mind.org/sthitaprajna/', retrieved: '2026-10-27' },
      {
        url: 'https://care4mind.org/knowyourvaluessatyatruthfulnessprofiling/',
        retrieved: '2026-10-27',
      },
      {
        url: 'https://care4mind.org/knowyourvaluesbrahmacharya-profiling/',
        retrieved: '2026-10-27',
      },
      { url: 'https://care4mind.org/frienorfoeofself/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/karta-2/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/triguna/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/concepts/', retrieved: '2026-10-27' },
    ],
    edits: [
      'Title in IAST: “Bhagavad Gita” → “Bhagavad Gītā”.',
      'The title’s Devanagari comes from the Concepts page, whose card reads “Bhagavad Gita (भगवद्गीता)”; no page that quotes a verse gives it.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The title is written in IAST as “Bhagavad Gītā”; the pages write “Bhagavad Gita”. Confirm the form.',
        ticket: 16,
      },
      {
        for: 'research-editor',
        note: 'No page names the translator or the source of the translations it gives for this work’s verses; none is stored, and none was looked up.',
        ticket: 16,
      },
    ],
  },
})
