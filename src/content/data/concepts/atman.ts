import { defineConcept } from '@/content/schema'

// The /atman/ post, carried over whole. Its text may be adapted from DharmaWiki (it kept one of
// DharmaWiki's citation markers), so it is flagged for attribution and rights.
export default defineConcept({
  kind: 'concept',
  slug: 'atman',
  name: {
    // The headword is “Atman (Samskrit: आत्मा)”; the page prints no IAST (see the flags).
    term: { iast: 'ātman', devanagari: 'आत्मा', ascii: ['Atman', 'Atma'] },
    english: 'Soul or Self',
  },
  summary:
    'Atman (Samskrit: आत्मा) is one of the primary teachings of the Upanishads along with Brahman, Maya, and Karma.',
  keywords: ['self', 'soul', 'consciousness', 'brahman', 'reality'],
  topics: { primary: 'self' },
  verses: [],
  sections: [
    {
      id: 'atman',
      heading: 'Atman',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Atman (Samskrit: आत्मा) is one of the primary teachings of the Upanishads along with Brahman, Maya, and Karma. The eternal questions about creation, reality, existence, and the mystery of death are solved by the Upanishads. They state that the inmost core of every person is not the body, mind, or ego, but Atman (referred to as Soul or Self). Atman is the adhyatmik essence in all creatures, their real innermost essential being. It is eternal and ageless. Atman is that which is described at the deepest level of one’s existence as per Indian traditions.',
        },
        {
          kind: 'paragraph',
          text: 'The ancient distinction between body and a principle, which is responsible for life and activity, is found commonly all over the world. While modern psychology banished this separate principle, in Indian psychology it has occupied a central place.',
        },
      ],
    },
    {
      id: 'introduction',
      heading: 'परिचयः ॥ Introduction',
      blocks: [
        {
          kind: 'paragraph',
          text: 'In addition to the visible gross body, the Upanishads talk about the Atma (Soul), which is distinct from, and independent of, the Indriyas (organs) sensory and motor, from the mind (in its two-fold aspect manas and buddhi) and from the Prana (vital force) with its different functions.',
        },
        {
          kind: 'paragraph',
          text: 'Here when Paramatama (परमात्मा) is addressed as Atman (आत्मन्), a confusion arises with regards to whether the discussion is about a living being or the supreme consciousness?',
        },
        {
          kind: 'paragraph',
          text: 'Brahma sutras, by Vedavyasa, (1-4-19 sutras) explain this as vakyanvayata (वाक्यन्वयत). “The word atma here has to be seen here as Paramatama (परमात्मा).”',
        },
      ],
    },
    {
      id: 'nature-of-atma',
      heading: 'आत्मतत्वम् ॥ Nature of Atma',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Different upanishads portray different aspects of the Atma that',
        },
        {
          kind: 'list',
          style: 'bullet',
          items: [
            'Atma is unchanged and independent of body (Sharira); only it manifests itself more and more through these bodies.',
            'It is distinct from the sense organs, manas and Prana (vital force)',
            'It has no origin, because it is immaterial and thus beyond space, time and causation under which everything material exists.',
            'It is indestructible, outlives the body and plays a chief role in punarjanma (reincarnation)',
            'It goes after death to different worlds, high and low, and according to its past work and knowledge may return to this world',
            'Its limitations are only for a particular time (until it is under the spell of Avidya as per the Advaita Vedantins)',
            'It is said to have three states having attributes – waking (in which it experiences the outside world), dream (it experiences the inner world of mind) and deep sleep (a blissful state)',
            'It is in reality omnipotent, omnipresent in the fourth state (turiya) when it is described as essentially identical with the Brahman (the unmanifested)',
          ],
        },
      ],
    },
  ],
  references: [],
  external: [
    {
      label: 'DharmaWiki',
      url: 'https://dharmawiki.org/index.php/Atman_(%E0%A4%86%E0%A4%A4%E0%A5%8D%E0%A4%AE%E0%A4%A8%E0%A5%8D)',
    },
  ],
  reviewStatus: 'drafted-not-reviewed',
  provenance: {
    drafted: ['keywords'],
    sources: [{ url: 'https://care4mind.org/atman/', retrieved: '2026-10-27' }],
    edits: [
      'The page has no heading before its first two paragraphs: they are a section headed by its title, “Atman”.',
      'The bilingual headings, each written as the first line of a paragraph, are section headings, kept as written: “परिचयः ॥ Introduction” and “आत्मतत्वम् ॥ Nature of Atma”.',
      'The eight lines after “Different upanishads portray different aspects of the Atma that” are a list.',
      'DharmaWiki citation marker dropped: “[1]” → “”.',
      'Typos fixed: “ominipotent” → “omnipotent”, “onmipresent” → “omnipresent”.',
      'IAST transliterated from the page’s Devanagari: “ātman”, from “आत्मन्”. The page prints no IAST.',
      'External link added, labelled “DharmaWiki”: the Concept’s own DharmaWiki article, at the address the glossary card “Atman (आत्मन्)” on https://care4mind.org/concepts/ links. The post itself has no links.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page prints no IAST for its headword, “Atman (Samskrit: आत्मा)”. The record’s IAST, “ātman”, is transliterated from the page’s “आत्मन्”, the form its spelling “Atman” follows; its Devanagari is the headword’s “आत्मा”. Confirm both. Nothing was looked up.',
        ticket: 15,
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
      {
        for: 'research-editor',
        note: 'Left as the page has them: “Paramatama” (twice, beside “परमात्मा”) and “वाक्यन्वयत” (beside “vakyanvayata”). Nothing was changed or looked up.',
      },
    ],
  },
})
