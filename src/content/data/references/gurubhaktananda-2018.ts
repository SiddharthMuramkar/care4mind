import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'gurubhaktananda-2018',
  type: 'book',
  authors:
    'Gurubhaktananda, S., Sri Sadananda Yogindra Saraswati, Swami Advayanandaji, Swami Sivananda, Swami Tapovanji, & Swami Chinmayananda',
  year: '2018',
  title: 'Vedanta-sara',
  url: 'https://ampgc.ac.in/admin/upload/documents/econtent/vedantsar.pdf',
  asCited: [
    'Gurubhaktananda, S., Sri Sadananda Yogindra Saraswati, Swami Advayanandaji, Sri Sadananda Yogindra Saraswati, Swami Advayanandaji, Swami Sivananda, Swami Tapovanji, & Swami Chinmayananda. (2018). VEDANTA-SARA.',
  ],
  provenance: {
    sources: [{ url: 'https://care4mind.org/vikshepa/', retrieved: '2026-10-27' }],
    edits: [
      'One repeated run of authors removed: “Swami Advayanandaji, Sri Sadananda Yogindra Saraswati, Swami Advayanandaji,” → “Swami Advayanandaji,”.',
      'Title in sentence case: “VEDANTA-SARA” → “Vedanta-sara”.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'No publisher is given on the current site; not looked up.',
        decidedBy: 'references',
      },
    ],
  },
})
