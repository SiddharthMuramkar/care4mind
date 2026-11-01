import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'bhagavad-gita/6.17',
  work: 'bhagavad-gita',
  locator: '6.17',
  order: [6, 17],
  devanagari: ['युक्ताहारविहारस्य युक्तचेष्टस्य कर्मसु ।', 'युक्तस्वप्नावबोधस्य योगो भवति दुःखहा'],
  transliteration: {
    lines: [
      'yuktāhāravihārasya yuktaceṣṭasya karmasu',
      'yuktasvapnāvabodhasya yogo bhavati duḥkhahā',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'knowyourvaluesbrahmacharya-profiling',
      text: 'YOGA becomes the destroyer of pain for him who is moderate in eating and recreation, who is moderate in his exertion during his actions, who is moderate in sleep and wakefulness.',
    },
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluesbrahmacharya-profiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Work assigned: the Brahmacharya values page heads this verse “Shloka for Know Your Values – Brahmacharya: Chapter 6, Verse 17” and names no work there; it is stored as Bhagavad Gītā 6.17, which its text and number are, and which the page’s Meaning calls “the Bhagavad Gita (6.17)”.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ ६-१७॥” → “” and “ 6-17” → “”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Brahmacharya values page heads this verse “Chapter 6, Verse 17” and names no work there; its Meaning calls it “the Bhagavad Gita (6.17)”, and it is stored as Bhagavad Gītā 6.17. Confirm the attribution.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})
