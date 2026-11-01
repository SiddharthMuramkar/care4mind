import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'bhagavad-gita/14.6',
  work: 'bhagavad-gita',
  locator: '14.6',
  order: [14, 6],
  devanagari: ['तत्र सत्त्वं निर्मलत्वात्प्रकाशकमनामयम् ।', 'सुखसङ्गेन बध्नाति ज्ञानसङ्गेन चानघ'],
  transliteration: {
    lines: [
      'tatra sattvaṃ nirmalatvāt prakāśakamanāmayam sukhasaṅgena badhnāti jñānasaṅgena cānagha',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'triguna',
      text: 'Of these, Sattva which because of its stainlessness is luminous and healthy (unobstructive) binds by (creating) attachment to happiness and attachment to knowledge, O sinless one.',
    },
  ],
  provenance: {
    sources: [{ url: 'https://care4mind.org/triguna/', retrieved: '2026-10-27' }],
    edits: [
      'Work assigned: the Triguna page heads this verse “Sattva” and names no work there; it is stored as Bhagavad Gītā 14.6, which its text and number are, in the chapter the page heads “Bhagavad Gita – Gunatraya Vibhaga (Chapter 14)”.',
      'The transliteration runs the verse’s two lines into one and ends with the verse mark alone, with no number; that mark is left out with the Devanagari’s verse number: “cānagha ||” → “cānagha”.',
      'The page gives the English line under the verse no label; it is stored as the translation.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ १४-६॥” → “”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Triguna page heads this verse without naming a work; its number belongs to chapter 14, which the page names as the Bhagavad Gita’s, and it is stored under the Bhagavad Gītā. Confirm the attribution.',
        decidedBy: 'traditional-texts',
      },
      {
        for: 'research-editor',
        note: 'The page prints the English line under this verse with no “Translation” or “Meaning” label; it is stored as the verse’s translation. Confirm it is a translation rather than the page’s own reading.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})
