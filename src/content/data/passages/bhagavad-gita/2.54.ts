import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'bhagavad-gita/2.54',
  work: 'bhagavad-gita',
  locator: '2.54',
  order: [2, 54],
  devanagari: [
    'अर्जुन उवाच ।',
    'स्थितप्रज्ञस्य का भाषा समाधिस्थस्य केशव ।',
    'स्थितधीः किं प्रभाषेत किमासीत व्रजेत किम्',
  ],
  transliteration: {
    lines: [
      'arjuna uvāca',
      'sthitaprajñasya kā bhāṣā samādhisthasya keśava',
      'sthitadhīḥ kiṃ prabhāṣeta kimāsīta vrajeta kim',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'sthitaprajna',
      text: 'Arjuna said- What, O Keshava, is the description of him who has steady Wisdom and who is merged in the Superconscious state? How does one of steady Wisdom speak, how does he sit, how does he walk?',
    },
  ],
  provenance: {
    sources: [
      { url: 'https://care4mind.org/sthitaprajna/', retrieved: '2026-10-27' },
      {
        url: 'https://care4mind.org/knowyourvaluesbrahmacharya-profiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'The Brahmacharya values page heads this verse “Shloka for Know Your Values – Brahmacharya: Chapter 2, Verse 54”, naming no work; the Sthitaprajna page heads it, with its neighbours, “Shlokas from Bhagavad Gita (Chapter 2, Verse 54-58, 68)”.',
      'The Sthitaprajna and Brahmacharya values pages print this verse differently, so one form of each part is stored and the other listed here. Stored: the Devanagari, the same on both; the Brahmacharya page’s transliteration, in three lines that match the Devanagari; and the Sthitaprajna page’s translation. Not stored: the Sthitaprajna page’s transliteration, which runs the three lines into one, and the Brahmacharya page’s translation, which has “Arjuna said:” where the Sthitaprajna page has “Arjuna said-”.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ २-५४॥” → “” and “ 2-54” → “”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Brahmacharya values page heads this verse with its chapter and verse only, naming no work; the Sthitaprajna page heads the same verse as the Bhagavad Gita’s, and it is stored under the Bhagavad Gītā. Confirm the attribution.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})
