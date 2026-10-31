import { defineConcept, type SanskritName } from '@/content/schema'

// The /fivestepsofperfectionprofiling/ page. It has no Sanskrit headword, so the Concept is
// named by its English title (flagged). Each step's IAST and Devanagari are split out of the
// compound in the page's own Yoga Sūtra 1.20; the ASCII spellings are the page's headings.
const sraddha: SanskritName = { iast: 'śraddhā', devanagari: 'श्रद्धा', ascii: ['Shraddha'] }
const virya: SanskritName = { iast: 'vīrya', devanagari: 'वीर्य', ascii: ['Virya', 'Viryam'] }
const smrti: SanskritName = { iast: 'smṛti', devanagari: 'स्मृति', ascii: ['Smriti'] }
const samadhi: SanskritName = { iast: 'samādhi', devanagari: 'समाधि', ascii: ['Samadhi'] }
const prajna: SanskritName = { iast: 'prajñā', devanagari: 'प्रज्ञा', ascii: ['Prajna'] }

export default defineConcept({
  kind: 'concept',
  slug: 'five-steps-of-perfection',
  name: { english: 'Five Steps of Perfection' },
  summary:
    'Many individuals may find it challenging to complete the journey to attain Samadhi. They may opt for the five steps towards Self-realisation, which are Faith, Strength, Memory, Absorption, and Wisdom (Tomar, 2024).',
  keywords: ['faith', 'strength', 'memory', 'absorption', 'wisdom', 'perfection', 'effort'],
  topics: { primary: 'practice' },
  verses: [
    {
      passage: 'yoga-sutra/1.20',
      translation: 'fivestepsofperfectionprofiling',
      meaning:
        'This sutra explains that for those who cannot attain Samadhi instantly, the path requires certain qualities: deep faith, persistent effort, clear memory of truth, focused concentration, and the wisdom to distinguish the real from the unreal. When these qualities are cultivated, the mind becomes steady, leading to higher states of realization and ultimately liberation, without attachment to power or celestial positions.',
    },
  ],
  sections: [
    {
      id: 'what-is-the-definition-of-perfection',
      heading: 'What is the definition of Perfection?',
      blocks: [
        { kind: 'paragraph', text: '(Faith, Strength, Memory, Absorption, Clarity)' },
        {
          kind: 'paragraph',
          text: 'The tendency to demand of others or of oneself an extremely high or even flawless level of performance is perfectionism (APA Dictionary of Psychology, n.d.). Many individuals may find it challenging to complete the journey to attain Samadhi. They may opt for the five steps towards Self-realisation, which are Faith, Strength, Memory, Absorption, and Wisdom (Tomar, 2024).',
        },
        {
          kind: 'term',
          id: 'sraddha',
          term: sraddha,
          gloss: 'Unconditional Faith',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Shraddha means unconditional faith in the scriptures, the guru and in oneself. True faith emerges from active inquiry and doubt, not mere belief. It is not the starting point but rather the culmination of the search for truth. Genuine faith is rooted in perfect knowledge, not in borrowed or imposed beliefs (Tomar, 2024).',
            },
            {
              kind: 'paragraph',
              text: 'Shraddha, from the Sanskrit root for faith or trust, is understood as a profound conviction involving sincerity, humility, devotion, and commitment to truth and spiritual practice. It is central to Sanatana Dharma (Hindu tradition) as a foundational virtue that shapes inner growth, ethical conduct, and spiritual discipline (Rao, 1989). The concept of Shraddha (unflinching faith) plays a vital role in character building, as emphasized in the Bhagavad Gita. It is considered the foundation for meaningful action and the attainment of life’s higher goals. Without Shraddha, efforts become futile, resulting in wasted time and energy. Scholars and spiritual leaders have long highlighted its transformative influence on individual life. Swami Vivekananda described Shraddha as an intense and unwavering determination to achieve one’s purpose, reiterating that every soul is divine and capable of greatness when guided by faith. Similarly, Shankaracharya defined Shraddha as trust in the truths revealed in the scriptures and the words of the Guru (Guruvakyam). The term, deeply rooted in Sanskrit literature, has been widely adopted in Indian philosophical traditions, underscoring its enduring relevance in shaping moral and spiritual character (Dharwadkar, 2021).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'virya',
          term: virya,
          gloss: 'Strength',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Viryam (energy or strength) is persistence of efforts in one’s sadhana. Shraddha leads to viryam. Liberation from external ideologies allows the awakening of independent thinking and inner energy. This newfound energy brings clarity and illumination, akin to a blind person gaining sight or a darkened room being flooded with light (Tomar, 2024).',
            },
            {
              kind: 'paragraph',
              text: 'The concept of Virya in Ayurveda refers to the potency or specific active quality of a substance (dravya), which influences its therapeutic effect. Virya is closely associated with gunas and complements rasa (taste). It is primarily classified into two types (Dwividha Virya): Shita (cold) and Ushna (hot), and into eight types (Ashtavidha Virya): Shita, Ushna, Snigdha (unctuous), Ruksha (dry), Guru (heavy), Laghu (light), Mridu (soft), and Tikshna (intense). Each type of Virya exhibits distinct physiological and pharmacological effects on the body and doshas. For example, Shita Virya pacifies Pitta and increases Kapha-Vata, while Ushna Virya pacifies Kapha-Vata and increases Pitta. Similarly, Snigdha Virya alleviates Vata, whereas Ruksha Virya dries excess moisture and increases Vata. These potencies also determine the biological actions of substances: Shita Virya induces contentment and longevity, while Ushna Virya promotes digestion, sweating, and purgation. Other potencies exhibit additional functions, such as wound healing, oleation, aphrodisiac effects, and tissue nourishment, making Virya a fundamental principle in Ayurvedic pharmacology and therapeutics (Gangasagre, n.d.).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'smrti',
          term: smrti,
          gloss: 'Memory',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Viryam leads to Purified memory. Purified memory is synonymous with self-remembrance. Liberation from the influence of past experiences enables true perception and self-knowledge to emerge, unobstructed by the veils of memory (Tomar, 2024).',
            },
            {
              kind: 'paragraph',
              text: 'Ayurvedic texts identify intellectual error (Prajnaparadha) as a major cause of diseases, particularly psychosomatic disorders, as explained in the Charaka Samhita. Smriti (memory) is regarded as a crucial faculty of the mind, responsible for recalling knowledge acquired through past experiences, and is considered one of the components of Pragya in Ayurveda. Its efficiency depends on factors such as Prakriti, age, diet (Ahara-Vihara), and repetition of events. Impairment in this faculty, termed Smritivibhransha, occurs when an individual fails to retain or recall present experiences. Ayurveda correlates memory with elements like dosha, sara, and prakriti, linking them to physiological and pathological aspects. Memory functions result from the collective action of Atma, Mana, Buddhi, and Medha; any disturbance in these components can lead to cognitive decline. Modern science defines memory as the ability to record, retain, and recall information, with deficits often associated with stress, aging, and lifestyle factors. Ayurvedic approaches emphasize herbo-mineral preparations and lifestyle modifications to preserve and enhance memory, making the understanding of these concepts essential for effective clinical practice (Chundawat & Panda, 2022).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'samadhi',
          term: samadhi,
          gloss: 'Absorption',
          blocks: [
            {
              kind: 'paragraph',
              text: 'True concentration entails unwavering steadfast focus at a single point, transcending the incessant movement of the mind. Unlike ordinary thinking or contemplation, concentration involves steadfast stillness of the mind (Tomar, 2024).',
            },
            {
              kind: 'paragraph',
              text: 'Samadhi, the final stage of Ashtanga Yoga, is described as a superconscious state achieved after sustained practice of concentration (Dharana) and meditation (Dhyana). It represents the union of Jivatman (individual self) and Paramatman (supreme self), resulting in complete absorption and transcendence of duality. The Yoga Upanishads define Samadhi as an equipoised state characterized by oneness and pure consciousness, beyond the distinctions of knower, knowledge, and known. Texts like the Yogatattva-upanishad and Amrtanada-upanishad emphasize its role in attaining Kaivalya (absolute liberation) and supreme bliss, while also prescribing techniques such as Omkara meditation to overcome obstacles like distraction, inertia, and desire. Unlike deep sleep (Susupti), Samadhi is marked by heightened awareness and realization of Brahman, leading to liberation from the cycle of birth and death. Ultimately, Samadhi culminates in the experience of non-duality and infinite bliss, establishing the yogin in the state of Brahmanhood (www.wisdomlib.org, 2025).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'prajna',
          term: prajna,
          gloss: 'Wisdom',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Realisation of truth lies beyond the realm of thought. Thoughts obscure the underlying reality like smoke concealing fire, leading to ignorance of existence’s true nature. Open-eyed discrimination, not blind belief, is essential for realizing the truth (Tomar, 2024).',
            },
            {
              kind: 'paragraph',
              text: 'Modern psychology views wisdom as a complex psychological trait integrating intellectual ability, experience, virtue, and emotional intelligence. Recent research papers, including meta-analyses, detail wisdom’s strong positive correlations with aspects of well-being, life satisfaction, emotional adjustment, and personal growth, distinguishing between phenomenological wisdom (personal perception of wisdom) and performative wisdom (objective wisdom measures). Psychological studies further examine wisdom’s structure, assessment, and impacts on mental health (Dong et al., 2022).',
            },
          ],
        },
      ],
    },
    {
      id: 'indian-vs-western-concept',
      heading: 'Indian vs Western concept',
      role: 'comparison',
      blocks: [
        {
          kind: 'table',
          id: 'comparison',
          caption:
            'Comparative table of Indian vs Western concepts for Prajna/Wisdom, Samadhi/Absorption, Smriti/Memory, Virya/Strength, and Shraddha/Unconditional Faith (Indurkar, n.d.; Jeste & Vahia, 2008)',
          columns: ['Concept', 'Indian Perspective', 'Western Perspective'],
          rows: [
            {
              head: { term: prajna, gloss: 'Wisdom' },
              cells: [
                'Focuses on spiritual insight, liberation, compassion and self-realization.',
                'Emphasizes intellectual ability, rationality, personal well-being, emotional regulation.',
              ],
            },
            {
              head: { term: samadhi, gloss: 'Absorption' },
              cells: [
                'Transcendental state beyond ego and distraction; spiritual self.',
                'Psychological integration, existential self-actualization, mindfulness.',
              ],
            },
            {
              head: { term: smrti, gloss: 'Memory' },
              cells: [
                'Remembrance for self-realization and flawless knowledge transmission.',
                'Abstraction, science of universal knowledge, retrieval of factual data.',
              ],
            },
            {
              head: { term: virya, gloss: 'Strength' },
              cells: [
                'Potency as a fundamental principle influencing health, vigor, and efficacy; linked to spiritual force.',
                'Physical capability, resilience, biomedical definitions of strength.',
              ],
            },
            {
              head: { term: sraddha, gloss: 'Unconditional Faith' },
              cells: [
                'Foundation for spiritual growth, epistemology, blends faith and rational inquiry (tarka).',
                'Faith largely separated from rational inquiry; more compartmentalized in philosophical debates.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'consequences-of-perfection',
      heading: 'Consequences of Perfection',
      blocks: [
        {
          kind: 'paragraph',
          text: 'A study demonstrates that academic achievement and emotional difficulties such as depression are determined by adaptive and maladaptive perfectionism, respectively, in medical students. Engagement had mediating effects on adaptive perfectionism and GPA, and burnout had mediating effects on maladaptive perfectionism and depression. Students who experienced academic failure had lower engagement than those who did not (Kyeon et al., 2010). Research on the consequences of perfectionism shows significant effects on mental health, well-being, and academic performance. Multiple studies report that perfectionism, especially maladaptive forms, is linked to heightened anxiety, depression, low self-esteem, and stress-related disorders among adolescents and adults. Perfectionism can lead to dissatisfaction and disappointment as individuals set unrealistically high standards for themselves and others, negatively affecting relationships and causing fear of failure and procrastination. Meta-analyses highlight how socially-prescribed perfectionism relates strongly to depression and diminished coping mechanisms such as self-compassion. Other research focuses on perfectionism’s detrimental impact on college students, identifying strong correlations between perfectionism, academic stress, and poorer psychological well-being, including reduced autonomy, personal growth, and positive relationships. The literature underscores the necessity for personalized therapeutic interventions targeting cognitive and emotional difficulties associated with perfectionism. Overall, perfectionism’s psychological and physical consequences are profound, with research emphasizing the complexity of its pathways and the importance of nuanced understanding for effective treatment (Nazari, 2022; Patterson et al., 2021).',
        },
      ],
    },
  ],
  references: [
    'apa-perfectionism',
    'chundawat-panda-2022',
    'dharwadkar-2021',
    'dong-2022',
    'gangasagre',
    'indurkar',
    'jeste-vahia-2008',
    'kyeon-2010',
    'nazari-2022',
    'patterson-2021',
    'rao-1989',
    'shlokam-2020-yogasutra-1-20',
    'tomar-2024',
    'wisdomlib-2025-absorption',
    'wisdomlib-2025-prajna',
  ],
  questionnaire: 'five-steps-of-perfection',
  reviewStatus: 'drafted-not-reviewed',
  provenance: {
    drafted: ['keywords'],
    sources: [
      { url: 'https://care4mind.org/fivestepsofperfectionprofiling/', retrieved: '2026-10-27' },
    ],
    edits: [
      'Keywords drafted from the page’s own words, for search; a keyword never names a modern construct or a condition.',
      'Named by its English title: the page title, “Five Steps of Perfection Profiling”, without “Profiling”, the word for its questionnaire. The page gives no Sanskrit headword (flagged).',
      'The heading over the verse, “Shlokas of Perfection from Chapter 1, Sutra 20”, is left out: the verse is shown with its work and number, Yoga Sūtra 1.20, which the heading doesn’t name (flagged).',
      'The sub-heading under “What is the definition of Perfection?”, “(Faith, Strength, Memory, Absorption, Clarity)”, is the first paragraph of its section.',
      'Each step’s heading (“Shraddha/Unconditional Faith”, “Virya/Strength”, “Smriti/Memory”, “Samadhi/Absorption” and “Prajna/Wisdom”) is a term block with the heading’s plain spelling and English gloss. Its IAST and Devanagari are split out of the compound in the page’s Yoga Sūtra 1.20: “śraddhā”, “vīrya”, “smṛti”, “samādhi”, “prajñā”, “श्रद्धा”, “वीर्य”, “स्मृति”, “समाधि” and “प्रज्ञा”.',
      'Typo fixed: “Sharaddha” → “Shraddha”.',
      'The comparison table’s caption is the paragraph above it (“Comparative table of Indian vs Western concepts for …”); its first row is its column headings, and its row heads (“Prajna / Wisdom” and the others) are the steps’ terms with their glosses.',
      'Held back in the Questionnaire five-steps-of-perfection, described and never quoted: the page’s “Score indicator” section, with a High, Moderate and Low “Score Wise Category Description” for each step, and its note on the sources they were referred from.',
      'Interface text dropped: the “Introduction” and “References” labels, and the “Meaning:” label before the verse’s reading.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page gives no Sanskrit headword: the Concept is named by its English title, “Five Steps of Perfection”, the page title without “Profiling”. Give it a headword, or confirm the English title. Nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The Five Steps of Perfection page heads this verse “Shlokas of Perfection from Chapter 1, Sutra 20” and names no work; it is stored as Yoga Sūtra 1.20, which its text is. Confirm the attribution.',
        ticket: 16,
      },
      {
        for: 'research-editor',
        note: 'The five steps’ IAST and Devanagari are split out of the compound in the page’s Yoga Sūtra 1.20: “śraddhā”, “vīrya”, “smṛti”, “samādhi” and “prajñā”. The page’s own text writes them only as “Shraddha”, “Virya”, “Smriti”, “Samadhi” and “Prajna”. Confirm the forms. Nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The sub-heading under “What is the definition of Perfection?” lists the five steps as “Faith, Strength, Memory, Absorption, Clarity”, while the paragraph below it and the fifth step’s heading call the fifth “Wisdom”. Left as the page has them; nothing was changed.',
      },
      {
        for: 'research-editor',
        note: 'The reference list includes www.wisdomlib.org (2025b), “Prajna: Significance and symbolism”, which only the held-back note on the score indicators cites. It stays on the Concept’s list; decide whether to keep it.',
        ticket: 17,
      },
    ],
  },
})
