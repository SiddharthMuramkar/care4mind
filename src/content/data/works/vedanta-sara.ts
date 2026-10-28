import { defineWork } from '@/content/schema'

export default defineWork({
  kind: 'work',
  slug: 'vedanta-sara',
  title: { iast: 'Vedānta Sāra', ascii: ['Vedanta Sara'] },
  locatorLabel: 'Shloka',
  provenance: {
    sources: [
      { url: 'https://care4mind.org/vikshepa/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/momentumofspiritualpractice/', retrieved: '2026-10-27' },
    ],
    edits: ['Title in IAST: “Vedanta Sara” → “Vedānta Sāra”.'],
    flags: [
      {
        for: 'research-editor',
        note: 'The title is written in IAST as “Vedānta Sāra”; the page writes “Vedanta Sara”. Confirm the form.',
        ticket: 16,
      },
      {
        for: 'research-editor',
        note: 'No page names the translator or the source of the translations it gives for this work’s verses; none is stored, and none was looked up.',
        ticket: 16,
      },
      {
        for: 'research-editor',
        note: 'The Momentum of Spiritual Practice page quotes in English, inside a paragraph, a passage it labels “Vedanta Saara 1.30”, citing Tomar 2024. It gives no verse text and labels no translation, so the quotation stays in that page’s prose and is not stored as a passage. Confirm, or ask for it to become one.',
        ticket: 16,
      },
    ],
  },
})
