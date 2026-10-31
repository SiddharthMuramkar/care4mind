import { defineConcept, type SanskritName } from '@/content/schema'

// The /brahmavihara/ page. Its slug follows the page's own spelling of its headword, “Brahma
// Vihara”. Each component's IAST and Devanagari are split out of the compound in the page's own
// Yoga Sūtra 1.33; the ASCII spellings are the page's headings and text.
const maitri: SanskritName = { iast: 'maitrī', devanagari: 'मैत्री', ascii: ['Maitra', 'Maitri'] }
const karuna: SanskritName = { iast: 'karuṇā', devanagari: 'करुणा', ascii: ['Karuna'] }
const mudita: SanskritName = { iast: 'muditā', devanagari: 'मुदिता', ascii: ['Mudita'] }
const upeksa: SanskritName = { iast: 'upekṣā', devanagari: 'उपेक्षा', ascii: ['Upeksha'] }

export default defineConcept({
  kind: 'concept',
  slug: 'brahma-vihara',
  // The page prints no IAST, Devanagari or English gloss for its headword (see the flags).
  name: { term: { iast: 'brahmavihāra', ascii: ['Brahma Vihara', 'Brahmavihara'] } },
  summary:
    'Brahma Vihara as a construct is directly implicated to social and emotional intelligence that is vital for moral uprightness in society, emotional cultivation for well being of others thus setting a strong foundation for spiritual practice and attitudes towards life in general (Sarkar, 2019).',
  keywords: ['kindness', 'compassion', 'joy', 'equanimity', 'love', 'meditation'],
  topics: { primary: 'practice' },
  verses: [
    {
      passage: 'yoga-sutra/1.33',
      translation: 'brahmavihara',
      meaning:
        'Consciousness settles as one radiates friendliness, compassion, delight, and equanimity toward all things, whether pleasant or painful, good or bad. In relationships, the mind becomes purified by cultivating feelings of friendliness towards those who are happy, compassionate, kind, virtuous and indifferent towards those perceived as wicked or evil (Tomar, 2024).',
    },
  ],
  sections: [
    {
      id: 'importance-of-brahma-vihara',
      heading: 'Importance of Brahma Vihara',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Brahma Vihara as a construct is directly implicated to social and emotional intelligence that is vital for moral uprightness in society, emotional cultivation for well being of others thus setting a strong foundation for spiritual practice and attitudes towards life in general (Sarkar, 2019). Each of the brahma vihara components are essential and to be practiced in unity and has profound implications for interpersonal, intrapersonal and collectivistic relationships. Rooted in ethical conduct and emotional balance, these four ‘sublime states’ are more than personal characteristic virtues but social tools for fostering peace and harmony (Chatterjee, 2018).',
        },
        {
          kind: 'paragraph',
          text: 'Friendliness, through a western perspective, refers to a dispositional trait characterised by kindness and concern towards all beings. The same is relevant in terms of ‘maitri’ referring to unconditional loving-kindness towards fellow beings and that which is cultivated through self-introspection, deep thinking, meditation and ethical practices (Zeng et al., 2015).',
        },
        {
          kind: 'paragraph',
          text: 'Compassion, according to contemporary psychology, refers to a sensitivity to suffering in self and others with a mental commitment to attempt to prevent and alleviate the same, whereas ‘karuna’ refers to empathetic concern for alleviating pain and suffering (Gilbert & Choden, 2013). Thus, karuna can be seen as a spiritual parallel of compassion.',
        },
        {
          kind: 'paragraph',
          text: 'Kindness refers to selflessly uplifting others, while providing moral and emotional support in times of need, directly correlating to the foundation of mudita or capacity to feel joy in one’s own and other’s well being (Mishra & Kumar, 2020). Kindness, thus, has proven to result in increased psychological well being, deeper interpersonal bonds and altruistic actions.',
        },
        {
          kind: 'paragraph',
          text: 'Emotional maturity refers to the ability of an individual to manage and express their emotions appropriately and effectively including ability to face reality, relating positively with life experiences and integration of emotions, thoughts and actions; which can also be correlated to ‘upeksha’ or equanimity of the mind in times of adversity and difficulties (Bhattacharjee, 2024). Both emotional maturity and ‘upeksha’ emphasize self regulation, especially in response to emotionally charged situations.',
        },
      ],
    },
    {
      id: 'components-of-brahma-vihara',
      heading: 'Components of Brahma Vihara',
      blocks: [
        {
          kind: 'term',
          id: 'maitri',
          term: maitri,
          gloss: 'Loving-kindness or Benevolence',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Maitra from a Buddhist perspective refers to the unconditional wish for happiness of all beings, opposing ill will and transcending any attachment or bias (Sarkar, 2019). However, the Vedantic perspective views this quality as universal love rooted in understanding the atman or self in all living being i.e belief that all is Brahman (Mandal, 2024). Maitri, here also is not just limited to individual bond, but extends to one’s ability to attentively listen, asking relevant questions, effective communication, having positive and constructive thoughts all of which is rooted in love and a wish for general well being of all (Tomar, 2024).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'karuna',
          term: karuna,
          gloss: 'Compassion',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Karuna, according to the Buddhist perspective arises from kindness, and seeks to alleviate suffering of others (Sarkar, 2019). It can refer to empathetically engaging with others in pain without being personally affected by their suffering or sorrow. Karuna, in the Vedanta perspective emerges as a natural expression of compassion that is spontaneous by the knower of truth or jyani, one who has realised the non-duality of existence or Advaitha (Mandal, 2024). Empathy and compassion here, are transformative processes through which individuals practice non judgement of others, and themselves, transcend sensory experiences and gain sensitivity towards feelings and emotions of oneself and others (Tomar, 2024).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'mudita',
          term: mudita,
          gloss: 'Altruistic Joy',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Mudita, also referred to as sympathetic joy, according the Buddhist ideology refers to the feeling of gladness for others’ success and well being, as opposed to comparison and jealousy (Sarkar, 2019). In the context of Vedantic teachings, mudita refers to the joy of recognising divine consciousness in others and feeling happy in their material and emotional upliftment (Mandal, 2024). Further, mudita can be paralleled to the joy and pride of parents in the success and well being of their children, and the replication of these feelings in persons for their fellow beings (Tomar, 2024). This requires individuals to not compare themselves with the achievements of others, understand everyone’s journeys are different, and be content and fulfilled in one’s own achievements and pursuits in life.',
            },
          ],
        },
        {
          kind: 'term',
          id: 'upeksa',
          term: upeksa,
          gloss: 'Equanimity or Inner Balance',
          blocks: [
            {
              kind: 'paragraph',
              text: '‘Upeksha’, referring to equanimity of the mind, refers to a balanced and impartial mindset, essential for sustaining the other three components of friendliness, compassion and sympathetic joy without causing burnout for the individual (Sarkar, 2019). However, the Vedantic perspective views upeksha as corresponding to vairagya (detachment) and not grounded in indifference or even midness grounded in understanding of the transient nature of worldly phenomena (Mandal, 2024). Further, it is viewed as being disinterested in criticizing others, having an attitude of indifference towards ups and downs in people’s lives (Tomar, 2024). Possessing a mindset and maturity that ‘I am not perfect’ and allowing the benefit of doubt to others before judging them, and that each person’s action is guided by their own understanding of time and circumstances, and a worldview devoid of ego and criticism are characteristics of ‘upeksha’.',
            },
          ],
        },
      ],
    },
    {
      id: 'summative-table-core-functions-interpretations-of-brahma-vihara-components',
      heading: 'Summative Table: Core Functions & Interpretations of Brahma Vihara Components',
      blocks: [
        {
          kind: 'table',
          id: 'summative-table',
          caption: 'Summative Table: Core Functions & Interpretations of Brahma Vihara Components',
          columns: ['Component', 'Synonymous Term', 'Core Function', 'Interpretation'],
          rows: [
            {
              head: { term: maitri },
              cells: [
                'Loving-kindness or Benevolence',
                'Unconditional goodwill and sincere wish for the happiness of all beings.',
                'Opposes hatred, selfish love, and ill will; cultivated through meditation.',
              ],
            },
            {
              head: { term: karuna },
              cells: [
                'Compassion',
                'Deep empathy and the desire to alleviate suffering in others.',
                'Arises when Maitrī meets suffering; avoids both apathy and emotional overwhelm.',
              ],
            },
            {
              head: { term: mudita },
              cells: [
                'Altruistic Joy',
                'Rejoicing in the success and well-being of others, without envy.',
                'Antidote to envy and jealousy; cultivated joy independent of self-benefit.',
              ],
            },
            {
              head: { term: upeksa },
              cells: [
                'Equanimity or Inner Balance',
                'Mental calmness, impartiality, even-mindedness amidst ups and downs.',
                'Balances other three virtues; neither apathy nor cold detachment.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'disturbances-in-brahma-vihara',
      heading: 'Disturbances in Brahma Vihara',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Disturbances in the Brahma Vihara indicate of inner ethical and emotional challenges or reflecting mental defilements (kilesas) in Buddhism perspective and ignorance (avidya) in Vedantic perspectives (Mandal, 2024). Kilesas are mental impurities that cloud thinking, preventing the arousal of the wholesome state of mind and are thus rooting in dukkha or suffering (Sarkar, 2019; Mandal, 2024). The primary kilesas are ‘lobha’ or greed, ‘dosha’ or hatred and ‘moha’ or delusion. The secondary kilesas are jealousy (icha), apathy (thina-middha) and conceit and restlessness (mana and uddhacca). Meanwhile, ‘Avidya’ refers to fundamental ignorance of the true nature of atman and its unity with the Brahman. They are characterised by perceiving non dualism of self and Brahman, clinging to impermanent identities and attachment to ‘maya’ or illusion (Mandal, 2024). Thus, avidya may lead to selfishness, pride, envy and self comparison with others, and creates a mental climate of insecurity and fear.',
        },
      ],
    },
  ],
  references: [
    'bhattacharjee-2016',
    'chatterjee-2018',
    'ford-2021',
    'gilbert-2015',
    'shlokam-2025',
    'mandal-2024',
    'sarkar-2019',
    'tomar-2024',
    'zeng-2015',
  ],
  questionnaire: 'brahma-vihara',
  reviewStatus: 'drafted-not-reviewed',
  provenance: {
    drafted: ['keywords'],
    sources: [{ url: 'https://care4mind.org/brahmavihara/', retrieved: '2026-10-27' }],
    edits: [
      'Keywords drafted from the page’s own words, for search; a keyword never names a modern construct or a condition.',
      'Headword IAST: “brahmavihāra”, the design notes’ form. The page prints no IAST or Devanagari for its headword, which it writes “Brahma Vihara” (flagged).',
      'The heading over the verse, “Shlokas from Patanjali’s Yoga Sutra (Chapter 1, Sutra 33)”, is left out: the verse is shown with its work and number, Yoga Sūtra 1.33.',
      'The components’ headings, “I. Maitra”, “II. Karuna”, “III. Mudita” and “IV. Upeksha”, are term blocks, without their numbers. Their IAST and Devanagari are split out of the compound in the page’s Yoga Sūtra 1.33, in their dictionary forms: “maitrī”, “karuṇā”, “muditā”, “upekṣā”, “मैत्री”, “करुणा”, “मुदिता” and “उपेक्षा”. Their glosses are the summative table’s “Synonymous Term” column.',
      'The table under “Summative Table: Core Functions & Interpretations of Brahma Vihara Components” takes that heading as its caption. Its first row is its column headings, and its row heads, written “Maitri”, “Karuna”, “Mudita” and “Upeksha”, are the components’ terms.',
      'Typos fixed: “emotinal” → “emotional”, “restlesness” → “restlessness”, “chacterisied” → “characterised”, “impermenant” → “impermanent”, “brhaman” → “Brahman”, “self- introspection” → “self-introspection”, “non- duality” → “non-duality”, “thina- middha” → “thina-middha”.',
      'Inline DharmaWiki links dropped, their words kept: “Brahman”, “Vedanta”, “kilesas” and “maya”. The page’s other DharmaWiki links are on “Chitta”, in the verse’s translation, which the passage holds, and on “Moksha”, in the held-back score text.',
      'Held back in the Questionnaire brahma-vihara, described and never quoted: the page’s “Score- Based Indicators” section, with its High, Moderate and Low indicators, its line about section-wise scores, and its note on the source they were referred from.',
      'Interface text dropped: the “Introduction” and “References” labels, and the “Meaning:” label before the verse’s reading.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page prints no IAST and no Devanagari for its headword, which it writes “Brahma Vihara” (also “BrahmaVihara”, and “Brahmavihara” in a cited title). The record’s IAST, “brahmavihāra”, is the design notes’ form; no Devanagari is stored. Confirm the IAST and give the Devanagari. Nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The page gives no English gloss for its headword, so none is stored. It calls the four components “these four ‘sublime states’”. Decide whether that, or another gloss, names the Concept. Nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The four components’ IAST and Devanagari are split out of the compound in the page’s Yoga Sūtra 1.33 (“मैत्रीकरुणामुदितोपेक्षणां”), in their dictionary forms: maitrī, karuṇā, muditā and upekṣā (मैत्री, करुणा, मुदिता, उपेक्षा). The page’s text writes them “Maitra” or “Maitri”, “Karuna”, “Mudita” and “Upeksha”, and its table once “Maitrī”. Confirm the forms. Nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The text cites “(Gilbert & Choden, 2013)”, “(Mishra & Kumar, 2020)” and “(Bhattacharjee, 2024)”, which match no entry on the page’s reference list; it lists Gilbert (2015) and Bhattacharjee (2016). Not changed, and nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'Left as the page has them: “according the Buddhist ideology” (a word missing); “not grounded in indifference or even midness” (“midness” unclear); “jealousy (icha)”, a term to confirm; and “perceiving non dualism of self and Brahman” as a mark of avidya, which may say the opposite of what is meant. Nothing was changed or looked up.',
      },
    ],
  },
})
