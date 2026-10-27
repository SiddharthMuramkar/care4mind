import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'bhagavad-gita/18.24',
  work: 'bhagavad-gita',
  locator: '18.24',
  order: [18, 24],
  devanagari: ['यत्तु कामेप्सुना कर्म साहङ्कारेण वा पुनः ।', 'क्रियते बहुलायासं तद्राजसमुदाहृतम्'],
  transliteration: {
    lines: ['yattu kāmepsunā karma sāhaṅkāreṇa vā punaḥ', 'kriyate bahulāyāsaṃ tadrājasamudāhṛtam'],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'karta-2',
      text: 'That action which is done by one longing for desires or gain, done with egoism or with much effort, is declared to be Rajasic (Passionate).',
    },
  ],
  provenance: {
    sources: [{ url: 'https://care4mind.org/karta-2/', retrieved: '2026-10-27' }],
    edits: [
      'The page gives the English line under the verse no label; it is stored as the translation.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ १८-२४॥” → “” and “ 18-24” → “”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page prints the English line under this verse with no “Translation” or “Meaning” label; it is stored as the verse’s translation. Confirm it is a translation rather than the page’s own reading.',
        ticket: 16,
      },
    ],
  },
})
