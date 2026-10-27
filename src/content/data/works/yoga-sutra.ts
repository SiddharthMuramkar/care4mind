import { defineWork } from '@/content/schema'

export default defineWork({
  kind: 'work',
  slug: 'yoga-sutra',
  title: { iast: 'Yoga Sūtra', ascii: ['Yoga Sutra'] },
  locatorLabel: 'Sutra',
  provenance: {
    sources: [{ url: 'https://care4mind.org/vikshepa/', retrieved: '2026-10-27' }],
    edits: ['Title in IAST: “Yoga Sutra” → “Yoga Sūtra”.'],
    flags: [
      {
        for: 'research-editor',
        note: 'The title is written in IAST as “Yoga Sūtra”; the pages write “Yoga Sutra”. Confirm the form.',
        ticket: 16,
      },
    ],
  },
})
