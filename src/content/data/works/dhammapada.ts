import { defineWork } from '@/content/schema'

export default defineWork({
  kind: 'work',
  slug: 'dhammapada',
  title: { iast: 'Dhammapada', ascii: ['Dhammapada'] },
  // The Friend/Foe page quotes verse 160 in Pali.
  language: 'pi',
  locatorLabel: 'Verse',
  provenance: {
    sources: [{ url: 'https://care4mind.org/frienorfoeofself/', retrieved: '2026-10-27' }],
    edits: [],
    flags: [],
  },
})
