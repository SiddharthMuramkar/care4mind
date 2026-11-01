import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'bhagavad-gita/14.5',
  work: 'bhagavad-gita',
  locator: '14.5',
  order: [14, 5],
  devanagari: ['सत्त्वं रजस्तम इति गुणाः प्रकृतिसम्भवाः ।', 'निबध्नन्ति महाबाहो देहे देहिनमव्ययम्'],
  transliteration: {
    lines: [
      'Sattvaṃ rajastama iti guṇāḥ prakṛtisambhavāḥ |',
      'Nibadhnanti mahābāho dehe dehinamavyayam',
    ],
    scheme: 'iast',
  },
  translations: [],
  provenance: {
    sources: [{ url: 'https://care4mind.org/triguna/', retrieved: '2026-10-27' }],
    edits: [
      'The verse number after the last line is left out, since the locator holds it: “ ॥ १४-५॥” → “” and “ || 14-5 ||” → “”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page that quotes this verse gives no line labelled “Translation”: its English line is labelled “Meaning” and stays on that page’s quote. No translation is stored, and none was looked up.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})
