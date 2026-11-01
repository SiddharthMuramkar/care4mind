import { defineWork } from '@/content/schema'

export default defineWork({
  kind: 'work',
  slug: 'sadhana-panchakam',
  title: { iast: 'Sādhana Pañcakam', ascii: ['Sadhana Panchakam'] },
  attribution: 'Adi Sankaracharya',
  locatorLabel: 'Shloka',
  provenance: {
    sources: [
      { url: 'https://care4mind.org/spiritualpractitionerprofiling/', retrieved: '2026-10-27' },
    ],
    edits: ['Title in IAST: “Sadhana Panchakam” → “Sādhana Pañcakam”.'],
    flags: [
      {
        for: 'research-editor',
        note: 'The title is written in IAST as “Sādhana Pañcakam”; the page writes “Sadhana Panchakam”, and “Sādhana Panchakam” in its reference list. Confirm the form.',
        decidedBy: 'traditional-texts',
      },
      {
        for: 'research-editor',
        note: 'No page names the translator or the source of the translations it gives for this work’s verses; none is stored, and none was looked up.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})
