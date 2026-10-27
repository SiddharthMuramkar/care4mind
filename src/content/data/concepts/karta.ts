import { defineConcept, type SanskritName } from '@/content/schema'

// The /karta-2/ page, carried over as the Concept kartā, in the temperament topic and also in
// self. Its three types of doer are term blocks, each holding the verse the page sets under it
// (Bhagavad Gītā 18.23–18.25). The page writes them only in plain spellings: the IAST comes from
// the page's own verses (see the flags). Its score section is held back with its Questionnaire.
const sattvikaKarta: SanskritName = { iast: 'sāttvika kartā', ascii: ['Sattvik Karta'] }
const rajasaKarta: SanskritName = { iast: 'rājasa kartā', ascii: ['Rajasic Karta'] }
const tamasaKarta: SanskritName = { iast: 'tāmasa kartā', ascii: ['Tamasic Karta'] }

export default defineConcept({
  kind: 'concept',
  slug: 'karta',
  name: {
    term: { iast: 'kartā', ascii: ['Karta'] },
    // The page's own gloss: “The Bhagavad Gita describes ‘karta’ or doer…”.
    english: 'doer',
  },
  summary:
    'The Bhagavad Gita describes ‘karta’ or doer as one of the five factors of action and a person is called a ‘karta’ when he or she is the agent of activity influenced by the gunas namely sattva, rajas and tamas (Bhagavad Gita 18.13-18).',
  topics: { primary: 'temperament', also: ['self'] },
  verses: [],
  sections: [
    {
      id: 'bhagavad-gita-types-of-karta',
      heading: 'Bhagavad Gita – Types of Karta',
      blocks: [
        {
          kind: 'term',
          id: 'sattvika-karta',
          term: sattvikaKarta,
          blocks: [
            { kind: 'verse', quote: { passage: 'bhagavad-gita/18.23', translation: 'karta-2' } },
          ],
        },
        {
          kind: 'term',
          id: 'rajasa-karta',
          term: rajasaKarta,
          blocks: [
            { kind: 'verse', quote: { passage: 'bhagavad-gita/18.24', translation: 'karta-2' } },
          ],
        },
        {
          kind: 'term',
          id: 'tamasa-karta',
          term: tamasaKarta,
          blocks: [
            { kind: 'verse', quote: { passage: 'bhagavad-gita/18.25', translation: 'karta-2' } },
          ],
        },
      ],
    },
    {
      id: 'introduction-what-is-karma-and-karta',
      heading: 'Introduction: What is Karma and Karta?',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Karma, according to Patanjali’s Yoga Sutras, is an action—both physical and mental—that creates consequences across lifetimes (Coward, 1983). It is a psychological process, leaving samskara (memory traces) in the unconscious mind (chitta), shaping future behavior (vasanas). Karma is transcended through meditation, ethical living, and self-discipline. The Bhagavad Gita describes ‘karta’ or doer as one of the five factors of action and a person is called a ‘karta’ when he or she is the agent of activity influenced by the gunas namely sattva, rajas and tamas (Bhagavad Gita 18.13-18). It distinguishes between the Sattvik Karta, guided by discipline and free of ego; the Rajasic Karta driven by desire and the Tamasic Karta who is often deluded. The Nyaya Sutras further describe ‘Karta’ as the self which caused cognition and volition (Nyaya Sutras 1.10). Unlike Sankhya Nyasa, it accepts personal agency and free will of the self.',
        },
      ],
    },
    {
      id: 'gyata-kartutvam-bhokta-connection',
      heading: 'Gyata-kartutvam-Bhokta connection',
      blocks: [
        {
          kind: 'paragraph',
          text: 'In Indian philosophy, the Jnata or knower, Karta or doer and Bhokta or experiencer have a triadic relationship that articulates the multifaceted nature of self or atman in relation to knowledge, action and experience. The Vishistha advaita or non dualistic perspective states that the atman is inherently the ‘jnata’, ‘karta’ and ‘bhokta’ and that of possessing the ‘I- consciousness’ connected to the divine or ‘Brahman’. The self, despite connectedness with the supreme god, is independent in the sense of ethical action and spiritual evolution. Thus it experiences the result (Karma – phala) of its own actions and knowledge. The Bhokta arises due to action of the pleasure or pain from the karma, the kata arises due to initiated action and gnats because its the substratum of cognition and knowledge.',
        },
      ],
    },
    {
      id: 'comparative-table-indian-vs-western-perspectives-of-karma-determinism',
      heading: 'Comparative Table: Indian vs. Western Perspectives of Karma & Determinism',
      role: 'comparison',
      blocks: [
        {
          kind: 'table',
          id: 'comparison',
          caption: 'Comparative Table: Indian vs. Western Perspectives of Karma & Determinism',
          columns: [
            'Concept',
            'Indian Philosophical Perspective',
            'Western Psychological Perspective',
          ],
          rows: [
            {
              head: 'Unconscious Traces',
              cells: [
                'Samskara – impressions stored in the unconscious (chitta).',
                'Neural energy patterns; archetypes (Jung) & personal unconscious.',
              ],
            },
            {
              head: 'Habit Formation',
              cells: [
                'Samskara leads to Vasana—deep habitual tendencies.',
                'Repetition forms neural pathways; instincts shaped by archetypes.',
              ],
            },
            {
              head: 'Motivation',
              cells: [
                'Actions driven by vasanas formed over multiple lives.',
                'Actions result from unconscious drives, often denying free will.',
              ],
            },
            {
              head: 'Free Will',
              cells: [
                'Exists despite karmic influence; moral agency is preserved.',
                'Denied or constrained by unconscious forces or conditioning.',
              ],
            },
            {
              head: 'Karta (Doer)',
              cells: [
                'Eternal Atman is Karta, Bhokta (Experiencer), and Jnata (Knower).',
                'Self as psychological construct; lacks inherent moral freedom.',
              ],
            },
            {
              head: 'Nature of Determinism',
              cells: [
                'Karmic consequences unfold over lifetimes; not mechanical.',
                'Causal/mechanistic determinism—rooted in physical cause-effect.',
              ],
            },
            {
              head: 'Self/Atman',
              cells: [
                'Eternal, evolving through karma; retains moral choice.',
                'Influenced by unconscious forces; sometimes fragmented.',
              ],
            },
            {
              head: 'Agency & Liberation',
              cells: [
                'Ethical actions purify samskara, allowing moksha (liberation).',
                'Focused on individuation/coping rather than metaphysical freedom.',
              ],
            },
            {
              head: 'Karma Typology',
              cells: [
                'Distinguishes physical, emotional & intentional karma.',
                'Actions not ethically graded by intention across lifetimes.',
              ],
            },
          ],
        },
      ],
    },
  ],
  references: [
    'coward-1983',
    'shlokam-2021',
    'ignou-2017',
    'rao-paranjpe-2016',
    'paranjpe-1996',
    'paranjpe-1998',
    'potter-1967',
    'tomar-2024',
    'shlokam-2020-yogasutra',
  ],
  questionnaire: 'karta',
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [{ url: 'https://care4mind.org/karta-2/', retrieved: '2026-10-27' }],
    edits: [
      'IAST written for the headword, which the page spells “Karta” and ‘karta’: “kartā”. The page prints no Devanagari for it, so none is stored.',
      'IAST for the three types, which the page spells “Sattvik Karta”, “Rajasic Karta” and “Tamasic Karta”: each adjective split out of the verse the page sets under that type, in its dictionary form (“sāttvikam” in 18.23, “rājasam” in 18.24, “tāmasam” in 18.25), with the headword: “sāttvika kartā”, “rājasa kartā” and “tāmasa kartā”. The page’s spellings are kept as the terms’ ASCII spellings; no Devanagari is stored, since the page prints none for kartā.',
      'The page’s first heading, “Karta Profile Introduction”, heads no text of its own: it names the page’s questionnaire, whose record takes “Karta Profile” as its title, and is left out here.',
      'The heading “Bhagavad Gita – Types of Karta”, which opens the page above its “Introduction” label, heads a section that keeps its three sub-headings as term blocks, each holding the verse set under it. So the Concept has no verses of its own above its sections.',
      'Typo fixed: “self-discipline.The” → “self-discipline. The”.',
      'The page gives its table no caption of its own; it takes the heading above it, which is also its section’s heading: “Comparative Table: Indian vs. Western Perspectives of Karma & Determinism”. The section takes the comparison role.',
      'Inline DharmaWiki links dropped, their words kept: “Karma” and “chitta”.',
      'Interface text dropped: the “Introduction” and “References” labels.',
      'Left out: the page’s “Karta Score-Based Indicators” section, which belongs to its Questionnaire and is listed there as held back.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page writes its headword only as “Karta” and ‘karta’, with no IAST or Devanagari, and none of its verses holds the word. The record’s IAST, “kartā”, is written from that spelling, and no Devanagari is stored. Confirm the form; nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The page writes the three types of doer only as “Sattvik Karta”, “Rajasic Karta” and “Tamasic Karta”. The record’s IAST, “sāttvika kartā”, “rājasa kartā” and “tāmasa kartā”, takes each adjective from the verse the page sets under that type (“sāttvikam”, 18.23; “rājasam”, 18.24; “tāmasam”, 18.25), in its dictionary form, with the headword. No Devanagari is stored. Confirm the forms; nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The page glosses the three types of doer only in the sub-headings of its held-back score section, so their term blocks have no gloss. Supply them, or approve leaving them out; nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The page heads Bhagavad Gītā 18.23–18.25 “Bhagavad Gita – Types of Karta”, and each verse “Sattvik Karta”, “Rajasic Karta” or “Tamasic Karta”, but the verses’ own words (“karma”) and the English lines under them (“An action which…”, “That action which…”) speak of types of action rather than of the doer. Kept as the page has them; nothing was changed or looked up.',
        ticket: 16,
      },
      {
        for: 'research-editor',
        note: 'Left as the page has them, in the section “Gyata-kartutvam-Bhokta connection”: “the kata arises” and “gnats because its the substratum”, which read like garbled “karta” and “jnata”; the heading’s “Gyata” beside the text’s “Jnata”; and “The Vishistha advaita or non dualistic perspective”. In the introduction: “Unlike Sankhya Nyasa”. Nothing was changed or looked up.',
      },
    ],
  },
})
