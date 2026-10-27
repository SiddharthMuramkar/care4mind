import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'yoga-sutra/1.33',
  work: 'yoga-sutra',
  locator: '1.33',
  order: [1, 33],
  devanagari: ['मैत्रीकरुणामुदितोपेक्षणां सुखदुःखपुण्यापुण्यविषयाणां भावनातश्चित्तप्रसादनम्'],
  translations: [
    {
      id: 'brahmavihara',
      text: 'Friendship, mercy, gladness and indifference, being thought of in regard to subjects, happy, unhappy, good and evil respectively, pacify the Chitta.',
    },
  ],
  provenance: {
    sources: [{ url: 'https://care4mind.org/brahmavihara/', retrieved: '2026-10-27' }],
    edits: [
      'The verse number after the last line is left out, since the locator holds it: “ II 1.33 II” → “”.',
      'Inline DharmaWiki link dropped, its word kept: “Chitta”, in the translation.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'No page gives a transliteration of this verse; none is stored, and none was made.',
        ticket: 16,
      },
    ],
  },
})
