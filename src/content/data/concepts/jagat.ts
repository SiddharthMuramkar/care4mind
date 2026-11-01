import { defineConcept } from '@/content/schema'

// The /jagat/ post, carried over whole: two paragraphs and no headings.
export default defineConcept({
  kind: 'concept',
  slug: 'jagat',
  name: {
    // The headword is “जगत || jagat”: the page's own Devanagari and transliteration.
    term: { iast: 'jagat', devanagari: 'जगत', ascii: ['Jagat'] },
    english: 'Cosmos',
  },
  summary:
    'The Cosmos is dynamic in nature. Hindu scriptures call it जगत || jagat where गत || gat indicates the ever changing – सदैव गच्छति || sadaiv gachati (ever changing) nature of cosmos.',
  keywords: ['world', 'universe', 'cosmos', 'nature', 'changing'],
  topics: { primary: 'self' },
  verses: [],
  sections: [
    {
      id: 'jagat',
      heading: 'Jagat',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The Cosmos is dynamic in nature. Hindu scriptures call it जगत || jagat where गत || gat indicates the ever changing – सदैव गच्छति || sadaiv gachati (ever changing) nature of cosmos. We as जीव || jiva experience the cosmos & often feel insecure with this uncertainty and always search for something which is certain and changeless. We unknowingly want an anchor in our lives which is reliable and can help us in coping up with the dynamic nature of cosmos. Hindu scriptures say it can be only ईश्वर || ishwar (God) which is eternal, changeless and hence can help us as an anchor to the world. We can understand जगत || jagat as a field of experience, जीव || jiva as experiencer and ईश्वर || ishwar as an anchor in totality, also known as त्रिपुति || triputi.',
        },
        {
          kind: 'paragraph',
          text: 'The Universe of our experience i.e. Cosmos or जगत || jagat is composed of the five basic elements also known as पञ्चमहाभूताः॥ pancha mahabhutas.',
        },
      ],
    },
  ],
  references: [],
  external: [
    {
      label: 'DharmaWiki',
      url: 'https://dharmawiki.org/index.php/Jagat_(%E0%A4%9C%E0%A4%97%E0%A4%A4%E0%A5%8D)',
    },
  ],
  reviewStatus: 'drafted-not-reviewed',
  provenance: {
    drafted: ['keywords'],
    sources: [{ url: 'https://care4mind.org/jagat/', retrieved: '2026-10-27' }],
    edits: [
      'The page has no headings: its two paragraphs are a section headed by its title, “Jagat”.',
      'External link added, labelled “DharmaWiki”: the Concept’s own DharmaWiki article, at the address the glossary card “Jagat (जगत्)” on https://care4mind.org/concepts/ links. The post itself has no links.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The headword’s Devanagari is “जगत”, as the page writes it (“जगत || jagat”), without the virāma of the glossary card’s “जगत्”. Kept as the page has it; confirm the form. Nothing was looked up.',
        decidedBy: 'sanskrit-terms',
      },
    ],
  },
})
