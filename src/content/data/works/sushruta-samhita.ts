import { defineWork } from '@/content/schema'

export default defineWork({
  kind: 'work',
  slug: 'sushruta-samhita',
  title: { iast: 'Suśruta Saṃhitā', ascii: ['Sushruta Samhita'] },
  // The page's own word for one numbered unit: “Sharirasthanam Adhyayam 4 Sutram 35”.
  locatorLabel: 'Sutram',
  provenance: {
    sources: [{ url: 'https://care4mind.org/triguna/', retrieved: '2026-10-27' }],
    edits: [
      'Title in IAST: “Sushruta Samhita” → “Suśruta Saṃhitā”.',
      'The page also abbreviates the title “Sush Samh”, after its verse; that form is left out of the spellings.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The title is written in IAST as “Suśruta Saṃhitā”; the page writes “Sushruta Samhita” and “Sush Samh”. Confirm the form.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})
