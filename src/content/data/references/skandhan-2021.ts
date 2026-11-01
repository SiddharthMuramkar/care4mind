import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'skandhan-2021',
  type: 'journal-article',
  authors: 'Skandhan, K., Antony Jose, & Prasad BS',
  year: '2021',
  title: 'Brahmacharya (celibacy) prolongs life span by reducing the ageing process [Ayurveda]',
  container: 'GLOBAL JOURNAL FOR RESEARCH ANALYSIS',
  volume: '10',
  issue: '07',
  url: 'https://doi.org/10.36106/gjra',
  asCited: [
    'Skandhan, K., Antony Jose, & Prasad BS. (2021). BRAHMACHARYA (CELIBACY) PROLONGS LIFE SPAN BY REDUCING THE AGEING PROCESS [Ayurveda]. GLOBAL JOURNAL FOR RESEARCH ANALYSIS, 10(07), X 15GJRA-GLOBAL JOURNAL FOR RESEARCH ANALYSIS.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluesbrahmacharya-profiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Title in sentence case: “BRAHMACHARYA (CELIBACY) PROLONGS LIFE SPAN BY REDUCING THE AGEING PROCESS [Ayurveda]” → “Brahmacharya (celibacy) prolongs life span by reducing the ageing process [Ayurveda]”.',
      'Volume and issue split out of “10(07), X 15GJRA-GLOBAL JOURNAL FOR RESEARCH ANALYSIS”; the rest is left out of the fields.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'After the volume and issue the page gives “X 15GJRA-GLOBAL JOURNAL FOR RESEARCH ANALYSIS” where its pages would be, left out of the fields; and its link is the journal’s DOI (https://doi.org/10.36106/gjra), not the paper’s, kept as its URL. Give the pages and the paper’s own DOI; nothing was looked up.',
        decidedBy: 'references',
      },
    ],
  },
})
