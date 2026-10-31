import { defineConcept, type SanskritName } from '@/content/schema'

// The /knowyourmind/ page, carried over as the Concept citta-bhūmi: the five states of mind, which
// the page calls “chittabhumis”. Each state is a term block, with the IAST the page prints, and
// heads a row of its correlates table. The page's score section is held back with its
// Questionnaire.
const mudha: SanskritName = { iast: 'mūḍha', ascii: ['Mudha', 'Muddha'] }
const ksipta: SanskritName = { iast: 'kṣipta', ascii: ['Kshiptha', 'Kshipta'] }
const viksipta: SanskritName = { iast: 'vikṣipta', ascii: ['Vikshipta'] }
const ekagra: SanskritName = { iast: 'ekāgra', ascii: ['Ekagra'] }
const niruddha: SanskritName = { iast: 'niruddha', ascii: ['Niruddha'] }

export default defineConcept({
  kind: 'concept',
  slug: 'chittabhumi',
  name: {
    // The page writes only the plural, “chittabhumis”, glossed “states of mind” (see the flags).
    term: { iast: 'citta-bhūmi', ascii: ['Chittabhumis'] },
    english: 'state of mind',
  },
  summary:
    'Maharishi Patanjali outlines five progressive states of mind, known as chittabhumis, which chart the path toward a yogic and spiritually awakened consciousness.',
  keywords: [
    'mind',
    'states',
    'focus',
    'concentration',
    'awareness',
    'discipline',
    'consciousness',
  ],
  topics: { primary: 'mind' },
  verses: [
    {
      passage: 'yoga-sutra/1.2',
      meaning: 'Yoga is restraining the mind-stuff (Chitta) from taking various forms (Vrittis).',
    },
    {
      passage: 'yoga-sutra/1.30',
      meaning:
        'The obstacles of Samadhi are the results of distractions of the mind caused by the disease, dullness, doubt, negligence, sloth, over-indulgence, imaginary ideation, inability to reach the milestone and instability.',
    },
  ],
  sections: [
    {
      id: 'what-are-the-states-of-mind',
      heading: 'What are the States of Mind?',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Maharishi Patanjali outlines five progressive states of mind, known as chittabhumis, which chart the path toward a yogic and spiritually awakened consciousness. These states—Kshipta, Mudha, Vikshipta, Ekagra, and Niruddha—represent varying levels of mental discipline and awareness, ranging from restless distraction to profound inner stillness (Sharma et al., 2024). Beginning with the agitated and unfocused Kshipta, shaped by Rajas guna, and the lethargic Mudha, governed by Tamas guna, the mind gradually evolves through Vikshipta, a temporarily stable state infused with Sattva guna. With continued yogic discipline, one reaches Ekagra, a state of one-pointed concentration and conscious awareness, ultimately culminating in Niruddha—a state of complete mental restraint and transcendence. Recognizing and transcending these states through sustained yogic practice enables the practitioner to quiet the fluctuations of the mind (chittavrittis), attaining inner peace, self-realization, and a supra-conscious state.',
        },
      ],
    },
    {
      id: 'states-of-mind-according-to-patanjali-yoga-sutras',
      heading: 'States of Mind according to Patanjali Yoga Sutras',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Maharishi Patanjali, in the Yoga Sūtras, identifies five distinct states of the mind, known as Chittabhumis, each reflecting a specific degree of mental discipline and spiritual readiness. These stages—Mūḍha, Kṣipta, Vikṣipta, Ekāgra, and Niruddha—offer a progressive path toward samādhi and self-realization (Krishnappa et al, 2020).',
        },
        {
          kind: 'term',
          id: 'mudha',
          term: mudha,
          gloss: 'Forgetful',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Dominated by tamas guna, the mūḍha state is characterized by mental darkness, inertia, and confusion. The mind is clouded by ignorance, lacks discernment, and is unable to respond to stimuli with clarity or intention (Tomar, 2024). It is associated with lethargy, sadness, and a deep lack of motivation. As Prabhavananda (1977) emphasizes, individuals in this state are disconnected from higher consciousness and require disciplined yogic practices to begin their ascent toward mental clarity (Krishnappa et al., 2020).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'ksipta',
          term: ksipta,
          gloss: 'Fickle minded',
          blocks: [
            {
              kind: 'paragraph',
              text: 'The kṣipta mind is governed by rajas guna, marked by agitation, impulsivity, and a lack of focus. Constantly pulled by sensory desires and emotional turbulence, it flits from one thought to another without any sense of direction. Vivekananda (1950) likens this state to a “monkey mind” that resists discipline. It is unsuitable for meditative practice and reflects the typical mental state in fast-paced modern lifestyles (Krishnappa et al., 2020).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'viksipta',
          term: viksipta,
          gloss: 'Distracted',
          blocks: [
            {
              kind: 'paragraph',
              text: 'In the vikṣipta state, sattva guna begins to emerge, allowing for intermittent periods of clarity, calm, and focused awareness. Though the mind is still prone to distraction, it is capable of contemplation and engagement with higher truths. This state serves as a bridge between lower, uncontrolled mental states and higher, yogically prepared ones. With regular practice, individuals can strengthen sattva and progress toward one-pointed focus (Tomar, 2024).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'ekagra',
          term: ekagra,
          gloss: 'Focused',
          blocks: [
            {
              kind: 'paragraph',
              text: 'The ekāgra mind exhibits sustained concentration and mental stillness, essential for deep meditative absorption. It reflects the dominance of sattva guna and indicates a mind that is fully directed toward a single object of contemplation. As defined by Patanjali (Yoga Sūtra III.1), “Deśa-bandhaḥ cittasya dhāraṇā”, it is the first stage of samādhi. Vivekananda (1976) highlights this state as the mark of a disciplined yogi moving closer to enlightenment (Krishnappa et al., 2020).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'niruddha',
          term: niruddha,
          gloss: 'Restrained',
          blocks: [
            {
              kind: 'paragraph',
              text: 'The final and most refined state, niruddha, represents the complete cessation of all mental fluctuations (cittavṛttinirodhaḥ, PYS I.2). In this state, the mind becomes perfectly still, free from ego, desire, and sensory impressions. It no longer serves as an active agent but merges with puruṣha, the pure consciousness. This state of mental silence leads to kaivalya (liberation), the ultimate goal of Yoga (Tomar, 2024).',
            },
          ],
        },
      ],
    },
    {
      id: 'comparative-of-states-of-mind-in-western-and-indian-philosophies',
      heading:
        'Comparative of states of mind in Western and Indian philosophies (Krishnappa et al., 2020; Prabhu & Bhat, 2013)',
      role: 'comparison',
      blocks: [
        {
          kind: 'table',
          id: 'comparison',
          caption:
            'Comparative of states of mind in Western and Indian philosophies (Krishnappa et al., 2020; Prabhu & Bhat, 2013)',
          columns: ['Aspect', 'Indian Perspective', 'Western perspective'],
          rows: [
            {
              head: 'Nature of Mind',
              cells: [
                'Instrument for reflecting consciousness (manas)',
                'Conscious agent of thought and behaviour',
              ],
            },
            {
              head: 'Core concepts',
              cells: [
                'Ātman, Puruṣa, Guṇas, Citta, Buddhi, Ahaṃkāra',
                'Mind–body dualism, unconscious mind, ego structure',
              ],
            },
            {
              head: 'Mind-body relationship',
              cells: [
                'Mind and body as material; self is distinct',
                'Mind-body dualism (Descartes); interaction problem',
              ],
            },
            {
              head: 'Role of emotions',
              cells: [
                'Seen as disturbances of the mind to be transcended',
                'Explored as core aspects of behavior and motivation',
              ],
            },
            {
              head: 'Purpose of knowledge',
              cells: [
                'To transcend and realize the Self (Brahman)',
                'To understand and improve mental functioning',
              ],
            },
            {
              head: 'Ultimate goal',
              cells: [
                'Liberation from suffering and rebirth',
                'Psychological well being, self actualisation',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'correlates-of-five-states-of-mind',
      heading: 'Correlates of five states of mind (Jayasheela & Salagame, 2018)',
      blocks: [
        {
          kind: 'table',
          id: 'correlates',
          caption: 'Correlates of five states of mind (Jayasheela & Salagame, 2018)',
          columns: [
            'State of Mind',
            'Description',
            'Dominant Guna(s)',
            'Psychological Characteristics',
          ],
          rows: [
            {
              head: { term: mudha },
              cells: [
                'Lethargic, dull, lacks awareness',
                'Tamas',
                'Confusion, sluggishness, ignorance',
              ],
            },
            {
              head: { term: ksipta },
              cells: [
                'Restless, highly agitated, scattered thoughts',
                'Rajas',
                'Hyperactivity, impulsiveness, inability to focus',
              ],
            },
            {
              head: { term: viksipta },
              cells: [
                'Alternates between distraction and focus',
                'Rajas & Sattva',
                'Moments of clarity followed by distraction',
              ],
            },
            {
              head: { term: ekagra },
              cells: [
                'Deep concentration, mental steadiness',
                'Sattva',
                'Sharp focus, self-awareness, discipline',
              ],
            },
            {
              head: { term: niruddha },
              cells: [
                'Complete mental stillness and mastery',
                'Pure Sattva',
                'Absolute self-control, spiritual realization, inner peace',
              ],
            },
          ],
        },
      ],
    },
  ],
  references: [
    'prabhu-bhat-2013',
    'das-rai-2024',
    'krishnappa-2020',
    'jayasheela-salagame-2018',
    'sridhar-nagendra-2021',
    'tomar-2024',
    'shlokam-2020-yogasutra-1-2',
  ],
  questionnaire: 'chittabhumi',
  external: [
    {
      label: 'DharmaWiki',
      url: 'https://dharmawiki.org/index.php/Chitta_Bhumis_(%E0%A4%9A%E0%A4%BF%E0%A4%A4%E0%A5%8D%E0%A4%A4%E0%A4%AD%E0%A5%82%E0%A4%AE%E0%A4%AF%E0%A4%83)',
    },
  ],
  reviewStatus: 'drafted-not-reviewed',
  provenance: {
    drafted: ['keywords'],
    sources: [{ url: 'https://care4mind.org/knowyourmind/', retrieved: '2026-10-27' }],
    edits: [
      'Keywords drafted from the page’s own words, for search; a keyword never names a modern construct or a condition.',
      'IAST transliterated for the headword: “citta-bhūmi”, from the page’s plural “chittabhumis”, in the singular. The page prints no Devanagari for it or for the five states, so none is stored; the states’ IAST is the page’s own (“Mūḍha, Kṣipta, Vikṣipta, Ekāgra, and Niruddha”).',
      'Typo fixed: “Krishnappa el al.” → “Krishnappa et al.”.',
      'Verse headings dropped: “Yoga Sutra 1.2 Excerpt for States of Mind” and “Yoga Sutra 1.30 Excerpt”. Each verse shows its work and number. The page prints Yoga Sūtra 1.30 in a form of its own (one line, broken into words, with the anusvara written with a dot above, U+1E41); the verse shows the form stored on its passage, which lists this page’s.',
      'The sub-heading “States of Mind according to Patanjali Yoga Sutras” starts a section of its own, holding the five states as term blocks; the Roman numerals before their sub-headings (“I.” to “V.”) are left out.',
      'The page gives its two tables no captions of their own; each takes the heading above it, which is also its section’s heading: “Comparative of states of mind in Western and Indian philosophies (Krishnappa el al., 2020; Prabhu & Bhat, 2013)” and “Correlates of five states of mind (Jayasheela & Salagame, 2018)”.',
      'In the correlates table, each row is headed by its state of mind as a term, the same as its term block; the page’s spellings there (“Muddha”, “Kshiptha”) are kept as ASCII spellings.',
      'Inline DharmaWiki links dropped, their words kept: “Rajas”, “Tamas”, “Sattva”, “samādhi” and “puruṣha”.',
      'External link kept, labelled “DharmaWiki”: the Concept’s own DharmaWiki article, on the chitta bhumis, which the page links from “chittabhumis” in its first paragraph, and which the glossary card “Chitta Bhumis” on https://care4mind.org/concepts/ also links.',
      'The reference list names Krishnappa et al. (2020) twice, as 2020a and 2020b. The Reference krishnappa-2020 keeps both lines as cited, and is listed once, where it first appears.',
      'Interface text dropped: the “Introduction” and “References” labels, and the “Meaning:” labels before the verses’ readings.',
      'Left out: the page’s “Score- Based Indicators” section, which belongs to its Questionnaire and is listed there as held back.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page prints no IAST and no Devanagari for its headword: it writes only the plural, “chittabhumis” and “Chittabhumis”. The record’s IAST, “citta-bhūmi”, is transliterated from it in the singular, as is the slug, chittabhumi; its English name, “state of mind”, is the page’s gloss (“five progressive states of mind, known as chittabhumis”) in the singular. No Devanagari is stored for it, nor for the five states, which the page prints only in Latin letters. Confirm the forms; nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The text cites “(Sharma et al., 2024)”, which matches nothing on the page’s reference list. Kept as written; nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'The text names works its reference list doesn’t include: Prabhavananda (1977), Vivekananda (1950) and Vivekananda (1976). Kept as written; nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'The page lists the five states in two orders: “Kshipta, Mudha, Vikshipta, Ekagra, and Niruddha” in its first paragraph, and “Mūḍha, Kṣipta, Vikṣipta, Ekāgra, and Niruddha”, the order of its sub-headings and tables. Kept as written; nothing was changed.',
      },
    ],
  },
})
