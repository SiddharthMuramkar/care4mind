import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'sharma-pareek',
  type: 'journal-article',
  authors: 'Sharma, P., & Pareek, L. V. G.',
  title: 'Interpretation of Vyādhi through Āyurveda terminology',
  url: 'https://www.ijhsr.org/IJHSR_Vol.9_Issue.10_Oct2019/44.pdf',
  asCited: [
    'Sharma, P., & Pareek, L. V. G. Interpretation of Vyādhi through Āyurveda Terminology.',
  ],
  provenance: {
    sources: [{ url: 'https://care4mind.org/vikshepa/', retrieved: '2026-10-27' }],
    edits: [
      'Title in sentence case: “Āyurveda Terminology” → “Āyurveda terminology”.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'No year or journal (container) is given on the current site; not looked up. The address of its link suggests IJHSR, volume 9, issue 10 (October 2019).',
        ticket: 17,
      },
    ],
  },
})
