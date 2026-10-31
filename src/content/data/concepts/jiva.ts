import { defineConcept } from '@/content/schema'

// The /jiva/ post, carried over whole. Its text may be adapted from DharmaWiki (it kept
// DharmaWiki's citation markers, linking into its Jiva article), so it is flagged for attribution
// and rights. It stops mid-citation: flagged, never completed.
export default defineConcept({
  kind: 'concept',
  slug: 'jiva',
  name: {
    // The headword is “Jiva (Samskrit: जीवः)”; the IAST is the page's own (“the term jīva”).
    term: { iast: 'jīva', devanagari: 'जीवः', ascii: ['Jiva'] },
    english: 'living being',
  },
  summary:
    'Jiva (Samskrit: जीवः), literally means a living being, in Indian philosophical thought it is a technical term closest to what is called “person” in contemporary psychology.',
  keywords: ['self', 'living', 'body', 'mind'],
  topics: { primary: 'self' },
  verses: [],
  sections: [
    {
      id: 'jiva',
      heading: 'Jiva',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Jiva (Samskrit: जीवः), literally means a living being, in Indian philosophical thought it is a technical term closest to what is called “person” in contemporary psychology. It is commonly conceived as a knower (jñātā), enjoyer/sufferer (bhoktā), and agent (kartā). Jiva is studied in various dimensions such as biological, physiological, intellectual, psychological and metaphysical levels. A Jiva has a distinct psychological identity different from the concepts of purusha and brahman simply because of the vrittis of the manas and the buddhi, both of which are unique to him, a human being. Human motives, attitudes and aptitudes, desires, wishes and longings, which are also sources of behavior, have roots beyond physiological factors. In addition to the psycho-physical side, humans have a psycho-spiritual side. Human functioning is a product of the two and not an exclusive outcome of one or the other.',
        },
      ],
    },
    {
      id: 'introduction',
      heading: 'परिचयः ॥ Introduction',
      blocks: [
        {
          kind: 'paragraph',
          text: 'In the Upanishads, we find that in the Indian concept self, the ātman appears to be closely associated with the concepts of purusha and jiva variously designating the individual person. Sometimes the term ātman is used in conjunction with other words that indicate the main features of the person:',
        },
        {
          kind: 'list',
          style: 'bullet',
          items: [
            'as a living self (jīvātmā)',
            'as embodied self (śārīra ātmā)',
            'material self (bhūtātmā)',
          ],
        },
        {
          kind: 'paragraph',
          text: 'These ideas provide the basis for the model of the person as a composite of body–mind–consciousness.',
        },
        {
          kind: 'paragraph',
          text: 'The Chāndogya Upanishad, uses the term jīva to designate a human being as an integral part of the cosmic order. A human being is not merely confined to the appearance it projects, that is, the physical contours and aspects of the body. It is a collection of three bodies (sthula, sukshma and karana shariras) encompassing the gross elements to the subtle layers of the mind (panchakoshas) that act as encasements for the true Self. The Taittiriya Upanishad presents the Vedic conceptualization of the mind-body complex, i.e., jiva. Put differently, a human being is defined based on the mind-body complex, which is not distinct, and exists on a continuum from gross to subtle levels.',
        },
      ],
    },
  ],
  references: [],
  external: [
    {
      label: 'DharmaWiki',
      url: 'https://dharmawiki.org/index.php/Jiva_(%E0%A4%9C%E0%A5%80%E0%A4%B5%E0%A4%83)',
    },
  ],
  reviewStatus: 'drafted-not-reviewed',
  provenance: {
    drafted: ['keywords'],
    sources: [{ url: 'https://care4mind.org/jiva/', retrieved: '2026-10-27' }],
    edits: [
      'The page has no heading before its first paragraph: it is a section headed by its title, “Jiva”.',
      'DharmaWiki citation markers dropped, with their links into DharmaWiki’s Jiva article: “[2]” → “”, twice.',
      'The text stops mid-citation; its last character, a lone “[” linking into DharmaWiki’s Jiva article, dropped: “levels.[” → “levels.”.',
      'Inline DharmaWiki links dropped, their words kept: “Indian concept self” (to its Indian Concept of Self article) and “purusha” (to its Purusha article).',
      'External link kept, labelled “DharmaWiki”: the Concept’s own DharmaWiki article, which the post’s citation markers link into, at the address the glossary card “Jiva (जीवः)” on https://care4mind.org/concepts/ links.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The post stops mid-citation: its last paragraph ends “from gross to subtle levels.[”. The lone “[” is dropped and nothing was added. Decide whether the text is complete. Nothing was looked up.',
      },
      {
        for: 'research-editor',
        note: 'The post’s text may be adapted from DharmaWiki: it carries DharmaWiki’s citation markers, which are dropped here. Decide how to credit DharmaWiki. Nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'project-owner',
        note: 'The post’s text may be adapted from DharmaWiki: it carries DharmaWiki’s citation markers. Decide whether the site may use it. Nothing was looked up.',
      },
    ],
  },
})
