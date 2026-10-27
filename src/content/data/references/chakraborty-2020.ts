import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'chakraborty-2020',
  type: 'journal-article',
  authors: 'Chakraborty, Asst. P.',
  year: '2020',
  title: 'Gandhi’s philosophy of truth: Satyagraha versus conventional truth',
  container: 'Scholarly Research Journal for Interdisciplinary Studies',
  volume: '8/63',
  issue: '2278–8808',
  url: 'https://www.srjis.com/downloadPdf/40_%20GANDHIS%20PHILOSOPHY%20OF%20TRUTH%20SATYAGRAHA%20VERSUS.pdf/8257/169',
  asCited: [
    'Chakraborty, Asst. P. (2020). GANDHI’S PHILOSOPHY OF TRUTH: SATYAGRAHA VERSUS CONVENTIONAL TRUTH. Scholarly Research Journal for Interdisciplinary Studies, 8/63(2278–8808), SJIF 2019 = 6.380, www.srjis.com.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluessatyatruthfulnessprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Title in sentence case: “GANDHI’S PHILOSOPHY OF TRUTH: SATYAGRAHA VERSUS CONVENTIONAL TRUTH” → “Gandhi’s philosophy of truth: Satyagraha versus conventional truth”.',
      'Volume and issue split out of “8/63(2278–8808), SJIF 2019 = 6.380, www.srjis.com”; the rest is left out of the fields.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'After the journal the page gives “8/63(2278–8808), SJIF 2019 = 6.380, www.srjis.com”. The record keeps volume 8/63 and issue 2278–8808 as written; 2278–8808 reads like the journal’s ISSN, and the rest like an impact-factor note. The author is written “Chakraborty, Asst. P.”, where “Asst.” may be a title. Nothing was changed or looked up.',
        ticket: 17,
      },
    ],
  },
})
