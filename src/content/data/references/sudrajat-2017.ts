import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'sudrajat-2017',
  type: 'chapter',
  authors: 'Sudrajat, D. & Universitas Pendidikan Indonesia',
  year: '2017',
  title:
    'Adaptation of Teenage Nonviolence Test to measure the peacefulness of senior high school students',
  container:
    'Proceedings of the 1st International Conference on Educational Sciences (ICES 2017) – Volume 1',
  publisher: 'SCITEPRESS – Science and Technology Publications, Lda.',
  pages: '127–132',
  url: 'https://www.scitepress.org/Papers/2017/70371/70371.pdf',
  asCited: [
    'Sudrajat, D. & Universitas Pendidikan Indonesia. (2017). Adaptation of Teenage Nonviolence Test to measure the peacefulness of senior high school students. In Proceedings of the 1st International Conference on Educational Sciences (ICES 2017) – Volume 1 (pp. 127–132) [Conference-proceeding]. SCITEPRESS – Science and Technology Publications, Lda.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluesahimsanon-violenceprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Pages split out of “(pp. 127–132)”.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page lists “Universitas Pendidikan Indonesia” as a second author; it may be the first author’s university. Kept as given; nothing was looked up.',
        decidedBy: 'references',
      },
    ],
  },
})
