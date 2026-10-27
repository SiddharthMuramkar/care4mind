import { defineWork } from '@/content/schema'

export default defineWork({
  kind: 'work',
  slug: 'vedanta-sara',
  title: { iast: 'Vedānta Sāra', ascii: ['Vedanta Sara'] },
  locatorLabel: 'Shloka',
  provenance: {
    sources: [{ url: 'https://care4mind.org/vikshepa/', retrieved: '2026-10-27' }],
    edits: ['Title in IAST: “Vedanta Sara” → “Vedānta Sāra”.'],
    flags: [
      {
        for: 'research-editor',
        note: 'The title is written in IAST as “Vedānta Sāra”; the page writes “Vedanta Sara”. Confirm the form.',
        ticket: 16,
      },
    ],
  },
})
