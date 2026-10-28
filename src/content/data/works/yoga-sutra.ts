import { defineWork } from '@/content/schema'

export default defineWork({
  kind: 'work',
  slug: 'yoga-sutra',
  title: { iast: 'Yoga Sūtra', ascii: ['Yoga Sutra'] },
  // As the pages name him: “Patanjali’s Yoga Sutra”, “Maharishi Patanjali”.
  attribution: 'Patanjali',
  locatorLabel: 'Sutra',
  provenance: {
    sources: [
      { url: 'https://care4mind.org/vikshepa/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/upavikshepaprofiling/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/panchkleshavikaarprofiling/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/knowyourmind/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/fivestepsofperfectionprofiling/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/momentumofspiritualpractice/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/brahmavihara/', retrieved: '2026-10-27' },
      {
        url: 'https://care4mind.org/knowyourvaluesahimsanon-violenceprofiling/',
        retrieved: '2026-10-27',
      },
      {
        url: 'https://care4mind.org/knowyourvaluessatyatruthfulnessprofiling/',
        retrieved: '2026-10-27',
      },
      {
        url: 'https://care4mind.org/knowyourvaluesasteyanonstealingprofiling/',
        retrieved: '2026-10-27',
      },
      {
        url: 'https://care4mind.org/knowyourvaluesbrahmacharya-profiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: ['Title in IAST: “Yoga Sutra” → “Yoga Sūtra”.'],
    flags: [
      {
        for: 'research-editor',
        note: 'The title is written in IAST as “Yoga Sūtra”; the pages write “Yoga Sutra”. Confirm the form.',
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
