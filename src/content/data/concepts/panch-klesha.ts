import { defineConcept, type SanskritName } from '@/content/schema'

// The /panchkleshavikaarprofiling/ page, carried over as the Concept pañca kleśa. The five kleśas
// and the six enemies of the peaceful mind (the vikāras of its title) are term blocks, and head
// the rows of its two comparison tables. The kleśas' IAST is the page's own; their Devanagari is
// split out of its Yoga Sūtra 2.3 verse. The page's score section is held back with its
// Questionnaire.
const avidya: SanskritName = { iast: 'avidyā', devanagari: 'अविद्या', ascii: ['Avidya'] }
const asmita: SanskritName = { iast: 'asmitā', devanagari: 'अस्मिता', ascii: ['Asmita'] }
const raga: SanskritName = { iast: 'rāga', devanagari: 'राग', ascii: ['Raga'] }
const dvesa: SanskritName = { iast: 'dveṣa', devanagari: 'द्वेष', ascii: ['Dvesha'] }
const abhinivesa: SanskritName = {
  iast: 'abhiniveśa',
  devanagari: 'अभिनिवेश',
  ascii: ['Abhinivesha'],
}
const kama: SanskritName = { iast: 'kāma', ascii: ['Kama'] }
const krodha: SanskritName = { iast: 'krodha', ascii: ['Krodha'] }
const lobha: SanskritName = { iast: 'lobha', ascii: ['Lobha'] }
const moha: SanskritName = { iast: 'moha', ascii: ['Moha'] }
const mada: SanskritName = { iast: 'mada', ascii: ['Mada'] }
const matsarya: SanskritName = { iast: 'mātsarya', ascii: ['Matsarya'] }

export default defineConcept({
  kind: 'concept',
  slug: 'panch-klesha',
  name: {
    // The page writes “Panch Klesha” in its title and headings, “Pancha Klesha” over three verses.
    term: { iast: 'pañca kleśa', ascii: ['Panch Klesha', 'Pancha Klesha', 'Panchklesha'] },
    english: 'fivefold miseries',
  },
  summary:
    'In the Yoga Sutra of Patanjali 2.3, the concept of five kleshas (fivefold miseries) is presented as the foundational causes of human suffering. These kleshas act as formidable obstacles on the path to spiritual liberation (moksha).',
  topics: { primary: 'mind' },
  verses: [
    {
      passage: 'yoga-sutra/2.3',
      translation: 'panchkleshavikaarprofiling',
      meaning:
        'This verse says that suffering comes from five causes: ignorance, ego, attachment, aversion, and fear of death. At the root is ignorance, mistaking who we truly are. Because of that, we cling, resist, fear, and suffer. But our real nature is peaceful; suffering comes only from not seeing clearly.',
    },
    {
      passage: 'yoga-sutra/2.5',
      translation: 'panchkleshavikaarprofiling',
      meaning:
        'This verse defines ignorance as the confusion between what is real and what is not. It means mistaking the temporary for permanent, the impure for pure, the painful for pleasurable, and the non-self (like the body or mind) for the true Self. This confusion is the root of all misunderstanding and suffering.',
    },
    {
      passage: 'yoga-sutra/2.7',
      translation: 'panchkleshavikaarprofiling',
      meaning:
        'This verse explains that attachment arises from lingering on pleasurable experiences. Wherever we’ve felt pleasure before, the mind naturally gravitates back, creating a pull or desire toward those things.',
    },
    {
      passage: 'yoga-sutra/2.9',
      translation: 'panchkleshavikaarprofiling',
      meaning:
        'This verse says that the fear of death, or clinging to life, is deeply ingrained—even in those who are wise and know the truth. It’s not just a conscious fear but something instinctive, carried by past experiences and impressions. It’s so embedded in our nature that it operates automatically, below the level of awareness, influencing our thoughts and actions without us realizing it.',
    },
  ],
  sections: [
    {
      id: 'what-is-the-definition-of-panch-klesha-vikaar-profiling',
      heading: 'What is the definition of Panch Klesha – Vikaar Profiling?',
      blocks: [
        {
          kind: 'paragraph',
          text: 'In the Yoga Sutra of Patanjali 2.3, the concept of five kleshas (fivefold miseries) is presented as the foundational causes of human suffering. These kleshas act as formidable obstacles on the path to spiritual liberation (moksha). A profound understanding of their nature is indispensable for those seeking to traverse the spiritual landscape (Tomar, 2024).',
        },
        {
          kind: 'paragraph',
          text: 'The impact of five kleshas, can be reduced through the practice of Kriya Yoga (Tomar, 2024):',
        },
        {
          kind: 'term',
          id: 'avidya',
          term: avidya,
          gloss: 'Ignorance',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Avidya represents a fundamental spiritual forgetfulness, positing ignorance as the root from which other kleshas spring. It embodies the misapprehension or absence of knowledge regarding our true nature. Avidya is the veil that obscures truth and casts the projection of illusion, mistaking the ephemeral for the permanent, superficial for the profound, pain for the pleasure (Tomar, 2024). Avidyā is the root of all mental afflictions, recognizing it is the first step in transformation. Avidyā manifests through habitual identification with transient emotions, desires, and social roles, which fosters ego-centric behaviour and obstructs growth. While such self-knowledge may provide confidence, it can hinder intellectual, personal, and spiritual development unless recognized as provisional and transcendable. The yoga path addresses this through disciplined cultivation of detachment (vairāgya), meditation, and moral foundations (yama and niyama), which include virtues like non-violence, truthfulness, contentment, and devotion (Jakubczak, 2004).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'asmita',
          term: asmita,
          gloss: 'Egoism',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Emerging from avidya, when we forget our true nature, we assume a different false nature, it is called Asmita. Everything we write on our resume is Asmita. This misidentification complicates the distinction between the atman and its external environment, making us believe that our superficial identities define us (Tomar, 2024). Asmita is identified as the second klesha, egoism or misidentifying with the “I” sense. Alongside the other roles of kleshas, this review emphasizes how introspective self-awareness through yoga dismantles such false identifications, aiding self-regulation across body, mind, and environment (Roche, 2018).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'raga',
          term: raga,
          gloss: 'Attachment',
          blocks: [
            {
              kind: 'paragraph',
              text: 'It is an obsession to reexperience pleasure again and again or repeatedly, absence of which creates misery. We feel attached to everything which endorses our ego or limited identity-Asmita (Tomar, 2024). Rāga is an attachment born from past pleasures, which binds the mind and sustains craving. This links it to Western ideas like conditioned preference and reinforcement learning but, unlike the generally neutral Western view, the Yoga tradition sees all attachment as a cause of disturbance (Jakubczak, 2004).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'dvesa',
          term: dvesa,
          gloss: 'Aversion',
          blocks: [
            {
              kind: 'paragraph',
              text: 'It is an obsession to avoid the possibility of re-experiencing the pain, failing which creates misery. We are averse to anything which threatens our false identity-Asmita (Tomar, 2024). Dveṣa is an aversion or repulsion that stems from past unpleasant experiences. In the Yoga view, it’s the mirror image of rāga, just as attachment binds us to pleasure, aversion binds us to pain by keeping negative memories and resistance alive. This relates it to Western concepts like avoidance learning and negative reinforcement but points out that Western psychology often treats aversion as adaptive for survival, whereas the Indian perspective sees it as another mental affliction that disturbs inner balance and perpetuates suffering (Jakubczak, 2004).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'abhinivesa',
          term: abhinivesa,
          gloss: 'Fear of Death',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Characterised by an existential dread of death and a tenacious cling to life, abhinivesha haunts individuals, obscuring the understanding that death is a natural culmination of life, a mystery to be embraced rather than feared. Recognising the non-separation between life and death dispels this fear, revealing the path to wisdom (Tomar, 2024). Abhiniveśa is the deep-rooted clinging to life and fear of death, seen in Yoga philosophy as a universal instinct, even in the wise. It’s tied to the ego’s survival drive and is considered one of the most persistent kleshas. This compares it to Western views on the survival instinct, death anxiety, and theories like Terror Management Theory. The key difference is that while Western psychology often frames this fear as natural or even motivating, the Indian perspective treats it as a subtle bondage that must be transcended to achieve liberation (Jakubczak, 2004).',
            },
          ],
        },
      ],
    },
    {
      id: 'consequences-of-panch-klesha',
      heading: 'Consequences of Panch Klesha',
      blocks: [
        {
          kind: 'paragraph',
          text: 'These kleshas give rise to six enemies of the peaceful mind: lust (Kama), anger (Krodha), greed (Lobha), delusion (Moha), pride (Mada), and envy (Matsarya), each a manifestation of the turmoil produced by these fundamental affiliations (Tomar, 2024).',
        },
        {
          kind: 'term',
          id: 'kama',
          term: kama,
          gloss: 'lust',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Kāma is the force of sensory and mental longing for pleasure, ranging from sexual attraction to any aesthetic or material enjoyment. In classical Hindu thought it is one of the four legitimate aims of life (puruṣārthas) when pursued in harmony with dharma, artha, and mokṣa, yet it becomes an “enemy” when it overrides moral restraint and clarity of mind (Yogapedia, n.d.).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'krodha',
          term: krodha,
          gloss: 'anger',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Krodha is an agitated mental state that erupts when desire is obstructed, escalating ordinary displeasure (pratigha) into a readiness to harm. Listed among the twenty secondary unwholesome mental factors in Buddhist Abhidharma and among the six ripus in Hindu texts, it clouds judgment and propels violent or harsh action (Yogapedia, n.d.).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'lobha',
          term: lobha,
          gloss: 'greed',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Lobha denotes grasping attachment to objects, status, or experience, an insatiable urge to acquire and hoard beyond need. Both Hindu Dharmaśāstra and Buddhist psychology class it as a root defilement that fetters the mind and fuels unethical speech and conduct (Yogapedia, n.d.).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'moha',
          term: moha,
          gloss: 'delusion',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Moha is the dull ignorance that veils the true nature of self and reality. Identified as one of the three poisons in Buddhism and a ripus in Hinduism, it fosters misperception, wrong decisions, and the cycle by which unmet desire leads from anger to further bewilderment (Bhagavad Gītā 2.62-63) (Yogapedia, n.d.).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'mada',
          term: mada,
          gloss: 'pride',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Mada is intoxicating self-inflation, excessive pride in youth, wealth, learning, caste, or any worldly advantage. Texts describe it as a tamasic mental state that breeds complacency, disdain for others, and ultimately spiritual downfall; Buddhists classify it as “mental inflation,” a basis for other defilements (Yogapedia, n.d.).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'matsarya',
          term: matsarya,
          gloss: 'envy',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Matsarya is the inability to rejoice in another’s success or to share one’s own possessions, clinging so tightly that one begrudges others’ happiness. Hindu Purāṇas treat it as a form of mental pain, while Buddhist Abhidharma defines it as stinginess rooted in passionate attachment (Yogapedia, n.d.).',
            },
          ],
        },
        {
          kind: 'paragraph',
          text: 'Today’s generation has the most significant issue of stress-related problems that destroy human life. People generally feel stressed every day. In Patanjali, the yoga sutra has classified the cause of Stress in five broad segments known as panchklesha. Patanjali has given five reasons for Stress in the form of Panchklesha. If any person is in the Klesha’s influence, they will be troubled by anxiety or stress-related issues. If anyone has Stress, then the Klesha is present (“Praxis International Journal of Social Science and Literature,” 2022b).',
        },
      ],
    },
    {
      id: 'solutions-for-panch-klesha',
      heading: 'Solutions for Panch Klesha',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Fear (Abhiniveśa) arises from ignorance and attachment to one’s identity, which in turn reinforces the other kleshas. The proposed yogic intervention focuses on Kriya Yoga (PYS 2.1), comprising tapas (self-discipline), svādhyāya (self-study), and Īśvarapraṇidhāna (devotion/surrender), as a comprehensive method to refine consciousness and dissolve the root impurities rather than treating symptoms alone. Tapas develops mental steadiness amidst change, svādhyāya cultivates discernment by reducing unproductive mental activity, and Īśvarapraṇidhāna fosters detachment from ego-centered outcomes. By integrating these practices, the interplay of the five kleshas is weakened, leading to greater clarity, equanimity, and resilience in the face of external stressors (Jayswal, 2020). In the Patanjali yoga sutra, the solution of overcoming the Panchklesha is Chittaprasadanupay, “Maitri, karuna, mudita, upeksha”. By following this, we overcome Klesha and automatically overcome Stress (“Praxis International Journal of Social Science and Literature,” 2022b).',
        },
      ],
    },
    {
      id: 'indian-vs-western-concept',
      heading: 'Indian vs Western concept',
      role: 'comparison',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Both Western and Indian philosophical traditions emphasize self-understanding. Western thought has historically leaned toward theoretical inquiry, whereas yoga prioritizes practical transformation of behaviour and consciousness (Jakubczak, 2004).',
        },
        {
          kind: 'table',
          id: 'panch-klesha-and-western-concepts',
          caption: 'Comparison of Panch Klesha with Western Concepts (IAS EXPRESS, 2023).',
          columns: ['Klesha (Yoga)', 'Indian/Yogic Understanding', 'Western Conceptual Parallel'],
          rows: [
            {
              head: { term: avidya, gloss: 'Ignorance' },
              cells: [
                'Fundamental misperception of reality; mistaking the impermanent, impure, painful, and non-self as permanent, pure, pleasurable, and self. Root of all other kleshas.',
                'Plato’s Allegory of the Cave: Ignorance of the true world',
              ],
            },
            {
              head: { term: asmita, gloss: 'Egoism' },
              cells: [
                'False identification of self with mind/body/intellect; “I-am-ness” that strengthens separateness.',
                'Cartesian Dualism: Distinctness of mind and body',
              ],
            },
            {
              head: { term: raga, gloss: 'Attachment' },
              cells: [
                'Craving or desire for pleasurable experiences based on memory of past enjoyment.',
                'Hedonism: Pursuit of pleasure and intrinsic goods',
              ],
            },
            {
              head: { term: dvesa, gloss: 'Aversion' },
              cells: [
                'Avoidance rooted in memory of past pain or discomfort; the flip side of rāga.',
                'Stoicism: Indifference to pain or pleasure',
              ],
            },
            {
              head: { term: abhinivesa, gloss: 'Fear of Death' },
              cells: [
                'Clinging to life; deep-rooted fear of losing existence, even in the wise.',
                'Existentialism: Fear of the meaningless and transient nature of life',
              ],
            },
          ],
        },
        {
          kind: 'table',
          id: 'six-enemies-and-western-concepts',
          caption:
            'Comparison of six enemies of the peaceful mind with Western Concepts (Singh, 2020; Kshirsagar et al., 2025; Sharma, 2021).',
          columns: ['Concept', 'Indian Perspective', 'Western Psychological', 'Key Differences'],
          rows: [
            {
              head: { term: kama, gloss: 'Lust/Desire' },
              cells: [
                'Fundamental drive for pleasure and sensory enjoyment; broader than just sexual impulse; can be a legitimate life pursuit (Purushartha) but becomes problematic when unchecked.',
                'Freudian libido—primarily seen as sexual energy driving behavior; also covers motivation and pleasure seeking.',
                'Indian view is holistic, including aesthetic/material pleasure; Western focus is more on sexuality and drive mechanisms.',
              ],
            },
            {
              head: { term: krodha, gloss: 'Anger' },
              cells: [
                'Agitated state from obstructed desire; linked to Pitta dosha and Rajas guna; can lead to spiritual downfall; treated by balancing doshas and cultivating equanimity.',
                'Environmental triggers, cognitive appraisals, neurobiological processes; regulated via therapy and coping.',
                'Indian treatment uses spiritual, dietary, and behavioral remedies; Western relies on psychotherapy and medication.',
              ],
            },
            {
              head: { term: lobha, gloss: 'Greed' },
              cells: [
                'Insatiable craving for possessions or status; root cause of suffering and mental bondage; fosters attachment and selfishness.',
                'Materialism, consumerism, compulsive behaviors; studied through behavioral economics and addiction frameworks.',
                'The Indian perspective sees greed as a major spiritual obstacle; Western view is secular and often economic.',
              ],
            },
            {
              head: { term: moha, gloss: 'Delusion' },
              cells: [
                'Fundamental ignorance veiling reality; causes misperception and wrong decisions; considered a root poison in both Hinduism and Buddhism.',
                'Cognitive biases, systematic errors, denial, and delusional thinking; studied in cognitive psychology and psychopathology.',
                'Indian view is metaphysical (obscuring reality/truth); Western view is primarily mental/cognitive error.',
              ],
            },
            {
              head: { term: mada, gloss: 'Pride' },
              cells: [
                'Intoxication of self-importance; derives from various sources like wealth, youth, power; leads to arrogance and spiritual blockage.',
                'Narcissism, self-esteem, hubris, and overconfidence; studied as personality disorders and traits.',
                'The Indian lens emphasizes spiritual danger and humility; Western lens focuses on personality structure and pathology.',
              ],
            },
            {
              head: { term: matsarya, gloss: 'Envy' },
              cells: [
                'Inability to rejoice in others’ success; stems from attachment; causes social and spiritual discord.',
                'Social comparison, schadenfreude, malicious envy; evolutionary psychology and social theory.',
                'The Indian view stresses spiritual and relational damage; Western view focuses on social behavior and competition.',
              ],
            },
          ],
        },
      ],
    },
  ],
  references: [
    'hridaya-yoga-2024',
    'ias-express-2023',
    'jakubczak-2004',
    'jayswal-2020',
    'kshirsagar-2025',
    'praxis-2022',
    'roche-2018',
    'sharma-2021',
    'shlokam-2020-yogasutra-1-31',
    'singh-2020',
    'tomar-2024',
    'yogapedia',
    'yogitim-2024',
  ],
  questionnaire: 'panch-klesha',
  external: [
    {
      label: 'DharmaWiki',
      url: 'https://dharmawiki.org/index.php/Kleshas_(%E0%A4%95%E0%A5%8D%E0%A4%B2%E0%A5%87%E0%A4%B6%E0%A4%BE%E0%A4%83)',
    },
  ],
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [
      { url: 'https://care4mind.org/panchkleshavikaarprofiling/', retrieved: '2026-10-27' },
    ],
    edits: [
      'IAST transliterated for the headword: “pañca kleśa”, from the page’s “Panch Klesha” and “Pancha Klesha”, with kleśa as its Yoga Sūtra 2.3 verse writes it (“kleśāḥ”). The page prints no Devanagari for the headword, so none is stored.',
      'The kleśas’ Devanagari split out of the compound in the page’s Yoga Sūtra 2.3 verse, in their dictionary forms: “अविद्या”, “अस्मिता”, “राग”, “द्वेष” and “अभिनिवेश”. Their IAST is the page’s own (“Avidyā”, “Asmitā”, “Rāga”, “Dveṣa”, “Abhiniveśa”), and the sub-headings’ spellings are kept as ASCII spellings.',
      'IAST transliterated for the sixth enemy of the peaceful mind: “mātsarya”, from the page’s “Matsarya”. The page prints no Devanagari for the six, so none is stored.',
      'Typo fixed: “Patanjalii” → “Patanjali”.',
      'Bare reference numbers dropped from the paragraph on stress: “every day. 1-3 In” → “every day. In”, “issues. 3 If” → “issues. If”.',
      'Verse headings dropped: “Shlokas for Panch Klesha – Vikaar Profiling” over the four verses, and “Panch Klesha: Chapter 2, Sutra 3”, “Pancha Klesha: Chapter 2, Sutra 5”, “Pancha Klesha: Chapter 2, Sutra 7” and “Pancha Klesha: Chapter 2, Sutra 9” over each. Each verse shows its work and number, the Yoga Sūtra the census assigned. The sub-heading “sukhānuśayī rāgaḥ .. 2.7..” is Yoga Sūtra 2.7’s transliteration, stored on that passage.',
      'The Roman numerals before the sub-headings (“I.” to “VI.”) are left out; the term blocks keep the page’s order.',
      'The paragraph after the last sub-heading (“VI. Matsarya (envy)”), on stress and the kleshas, stays in its section after the term blocks: it is about the five kleshas, not about envy.',
      'The page gives its tables no captions of their own; each takes the heading set just above it: “Comparison of Panch Klesha with Western Concepts (IAS EXPRESS, 2023).” and “Comparison of six enemies of the peaceful mind with Western Concepts (Singh, 2020; Kshirsagar et al., 2025; Sharma, 2021).”.',
      'In the two comparison tables, each row is headed by its kleśa or enemy as a term, the same as its term block, with the row’s own parenthetical (“Ignorance”, “Lust/Desire”) as its gloss.',
      'Inline DharmaWiki links dropped, their words kept: “Avidya”, “Asmita”, “Rāga”, “Dveṣa” and “abhinivesha” (to parts of its Kleshas article), and “moksha”, “yama”, “niyama”, “Krodha”, “Matsarya” and “dharma” (to their own articles).',
      'External link kept, labelled “DharmaWiki”: the Concept’s own DharmaWiki article, on the kleshas, which the page links from “kleshas” in its first paragraph.',
      'Interface text dropped: the “Introduction” and “References” labels, and the “Meaning:” labels before the verses’ readings.',
      'Left out: the page’s “Score indicator” section, which belongs to its Questionnaire and is listed there as held back.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page prints no IAST and no Devanagari for its headword: it writes “Panch Klesha” (its title and headings), “Pancha Klesha” (three verse headings) and “panchklesha”. The record’s IAST, “pañca kleśa”, is transliterated from those, and the slug follows the page’s “Panch Klesha”; no Devanagari is stored. Confirm the form; nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'Sub-term forms the page doesn’t print as words of their own: the five kleśas’ Devanagari, split out of the Yoga Sūtra 2.3 verse’s compound (“अविद्या”, “अस्मिता”, “राग”, “द्वेष”, “अभिनिवेश”), and the IAST “mātsarya”, transliterated from the page’s “Matsarya”. Confirm them; nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The Panch Klesha page heads this verse with its chapter and sutra only, naming no work; it is stored under the Yoga Sūtra, which its text is. Confirm the attribution.',
        ticket: 16,
      },
      {
        for: 'research-editor',
        note: 'The paragraph on the six enemies calls the kleshas “these fundamental affiliations”, where afflictions may be meant. Kept as written; nothing was changed.',
      },
      {
        for: 'research-editor',
        note: 'The paragraph on stress, which cites the Praxis International Journal of Social Science and Literature (2022b) as a whole, carried the bare numbers “1-3” and “3”, apparently reference numbers from the paper it was taken from. They are dropped (listed). Identify the paper and how to credit it; nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'The reference list cites Shlokam’s page on Yoga Sūtra 1.31, a verse this page doesn’t quote; its verses are Yoga Sūtra 2.3, 2.5, 2.7 and 2.9. Kept as listed; nothing was looked up.',
        ticket: 17,
      },
    ],
  },
})
