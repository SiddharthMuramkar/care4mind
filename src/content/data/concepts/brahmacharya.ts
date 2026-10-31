import { defineConcept } from '@/content/schema'

// The /knowyourvaluesbrahmacharya-profiling/ page, carried over as the Concept brahmacarya. Its
// yama–niyama section, which all four values pages print, is stored once as the values topic's
// introduction and shown here by a topic-intro block. The page's score section is held back with
// its Questionnaire.
export default defineConcept({
  kind: 'concept',
  slug: 'brahmacharya',
  name: {
    // Split out of the page's Yoga Sūtra 2.30 compound; the title gives no gloss (see the flags).
    term: { iast: 'brahmacarya', devanagari: 'ब्रह्मचर्य', ascii: ['Brahmacharya'] },
  },
  summary:
    'Brahmacharya entails living life in a manner aligned with the principles of Brahman, the ultimate reality, embodying spiritually-oriented behaviour.',
  keywords: ['self-control', 'restraint', 'senses', 'energy', 'celibacy', 'discipline', 'values'],
  topics: { primary: 'values' },
  verses: [
    {
      passage: 'yoga-sutra/2.30',
      translation: 'knowyourvaluesahimsanon-violenceprofiling',
      meaning:
        'This sutra lists the five Yamas, fundamental ethical principles in Yoga: non-violence (ahimsa), truthfulness (satya), non-stealing (asteya), chastity or control over sensuality (brahmacharya), and non-possessiveness or non-acceptance of gifts (aparigraha). Swami Vivekananda explains that a true Yogi must rise above bodily identifications, including sex ideas, because the soul is beyond gender. Indulging in such thoughts binds the mind to the material plane. Similarly, accepting gifts can weaken mental independence because the receiver often becomes influenced or obligated by the giver, leading to loss of freedom and purity of mind. These disciplines help a Yogi remain self-controlled, detached, and free from external domination, creating the foundation for higher spiritual growth.',
    },
    {
      passage: 'yoga-sutra/2.32',
      translation: 'knowyourvaluesahimsanon-violenceprofiling',
      meaning:
        'This sutra explains the five Niyamas, or personal disciplines, for a Yogi: purity (shaucha), contentment (santosha), austerity (tapas), self-study (svadhyaya), and surrender to God (Ishvara pranidhana). Vivekananda emphasizes that purity is both external and internal. External purity means keeping the body and surroundings clean, but this alone is not enough. Internal purity, cultivating virtues like kindness, clarity, and peace, is even more important. Without inner cleanliness of thoughts and emotions, outer cleanliness has little value. Together, these practices help develop a disciplined, content, and spiritually focused life, which is essential for progress in Yoga.',
    },
    {
      passage: 'bhagavad-gita/6.17',
      translation: 'knowyourvaluesbrahmacharya-profiling',
      meaning:
        'This verse from the Bhagavad Gita (6.17) emphasizes balance and moderation as the key to well-being and spiritual progress. It says that yoga, understood here as a disciplined way of living and connecting with the self, becomes a destroyer of suffering when a person practices moderation in all aspects of life. One should neither overindulge nor deprive themselves whether in food, recreation, work, sleep, or wakefulness. By living with balance and restraint, the body and mind remain steady, making it possible to overcome restlessness, fatigue, and inner conflict. This harmony paves the way for peace and freedom from sorrow.',
    },
    {
      passage: 'bhagavad-gita/2.54',
      translation: 'sthitaprajna',
      meaning:
        'In this verse from the Bhagavad Gita (2.54), Arjuna asks Krishna to explain the qualities of a person who has attained sthitaprajña, a steady and unwavering wisdom. He wants to know how such a realized person is recognized: what is their state of mind, how do they speak, how do they sit, and how do they act in the world? Arjuna’s question reflects a deep curiosity about the outward signs of inner realization. He is essentially asking: when someone is firmly established in peace and self-knowledge, what does their daily life look like, and how do they carry themselves in thought, word, and action? This sets the stage for Krishna’s teaching on the qualities of an enlightened person.',
    },
    {
      passage: 'bhagavad-gita/2.55',
      translation: 'sthitaprajna',
      meaning:
        'In this verse (2.55), Krishna begins to answer Arjuna’s question about the qualities of a sthitaprajña, one with steady wisdom. He explains that such a person is free from all desires that arise in the mind. Instead of seeking satisfaction in external things, they find complete contentment within their own Self. Their happiness is not dependent on possessions, achievements, or approval from others, but flows from an inner connection with their true nature. This inner fulfillment makes them unshaken and self-sufficient, and it is this state of being that marks the beginning of true wisdom and spiritual steadiness.',
    },
    {
      passage: 'bhagavad-gita/2.56',
      translation: 'sthitaprajna',
      meaning:
        'This verse (2.56) describes the emotional stability of a sthitaprajña, a person of steady wisdom. Such a person remains calm and unshaken even in the face of suffering, and does not become overly attached or greedy when experiencing happiness. Their mind is free from the pull of attachment, the grip of fear, and the impulse of anger. Because they are not swayed by the ups and downs of life, they live with inner balance and clarity. This evenness of mind, regardless of circumstances, is what makes them a true sage with steady wisdom.',
    },
    {
      passage: 'bhagavad-gita/2.57',
      translation: 'sthitaprajna',
      meaning:
        'In this verse (2.57), Krishna explains that a person of steady wisdom is free from clinging or attachment in all situations. Whether they encounter something pleasant or unpleasant, auspicious or inauspicious, they do not get carried away by joy nor sink into hatred or aversion. Their mind remains balanced and even, untouched by extremes of reaction. Such inner detachment does not mean indifference, but a deep steadiness that allows them to face life’s changes with equanimity. This unshaken state shows that their wisdom is firmly established.',
    },
    {
      passage: 'bhagavad-gita/2.58',
      translation: 'sthitaprajna',
      meaning:
        'In this verse (2.58), Krishna uses the image of a tortoise to describe self-mastery. Just as a tortoise pulls its limbs inward for protection, a wise person can withdraw their senses from external attractions and distractions whenever needed. Instead of being controlled by sights, sounds, tastes, or other sensory temptations, they remain inwardly centered and self-disciplined. This ability to turn away from sense-objects and not be ruled by them is what makes their wisdom steady and firmly established. It shows inner strength, restraint, and true freedom.',
    },
    {
      passage: 'bhagavad-gita/2.68',
      translation: 'sthitaprajna',
      meaning:
        'In this verse (2.68), Krishna tells Arjuna that true steadiness of wisdom comes when a person has complete control over their senses. One who does not allow the senses to be dragged outward by temptations or distractions, but keeps them disciplined and directed, is firmly established in knowledge. Such restraint is not about suppression but about mastery, where the mind guides the senses, not the other way around. This self-control creates inner clarity, showing that their wisdom is steady and rooted.',
    },
  ],
  sections: [
    {
      // The shared section's place: its heading and text are the values topic's introduction.
      id: 'raja-yoga-foundations-yama-niyama',
      heading: 'Raja Yoga Foundations: Yama-Niyama',
      blocks: [{ kind: 'topic-intro', topic: 'values' }],
    },
    {
      id: 'brahmacharya-profiling',
      heading: 'Brahmacharya Profiling',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Brahmacharya entails living life in a manner aligned with the principles of Brahman, the ultimate reality, embodying spiritually-oriented behaviour. It involves approaching every aspect of daily life- eating, drinking, sleeping, and waking up- with a consciousness focused on the Supreme Truth, prioritising the eternal over the transient. It is expanding our energies on activities that are conducive to the attainment of self-realisation. What is a goal-oriented behaviour asking every moment from self, ‘Is this behavior taking me towards my spiritual goal?’(Tomar, 2024).',
        },
        {
          kind: 'paragraph',
          text: '“Brahmacharya is the restraint of the sex organ and other senses.” – Vyasa Maharaj',
        },
        {
          kind: 'paragraph',
          text: 'Brahmacharya is often understood as the mindful and balanced use of sexual energy, which closely relates to maintaining ethical boundaries in professional practice. In social work, this includes avoiding inappropriate behavior with service users and respecting their personal boundaries. Beyond sexual conduct, Brahmacharya also points toward moderation in all forms of sensual pleasure. It connects with broader ethical frameworks of duty and outcomes but also goes deeper by emphasizing personal virtue and relational integrity.',
        },
        {
          kind: 'paragraph',
          text: 'Seen through this lens, Brahmacharya encourages greater awareness of sexual energy, recognizing it as a natural, passing force rather than something to be feared or obsessed over. This perspective allows social workers to engage more openly and compassionately with sexual diversity, understanding sexual energy not only as part of personal identity but also as a form of authentic self-expression.',
        },
        {
          kind: 'paragraph',
          text: 'By approaching sexual energy with wisdom and mindfulness, social workers can better challenge restrictive social norms and patriarchal structures that harm marginalized groups, particularly queer, trans, and female individuals. Practicing Brahmacharya in this way also highlights the importance of creating safer, more inclusive spaces where people are free from the constant anxieties caused by discrimination and violence. Ultimately, in a social work context, Brahmacharya can be viewed as a commitment to sexual integrity, promoting dignity, safety, and acceptance for people of all sexual orientations and identities (Dylan & Muncaster, 2021).',
        },
      ],
    },
    {
      id: 'consequences-of-brahmacharya',
      heading: 'Consequences of Brahmacharya',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Brahmacharya is one of the three foundational pillars of health in Ayurveda alongside diet and sleep. Brahmacharya has self-control over the senses, particularly sexual activity, to maintain physical, mental, and social well-being. The practice conserves vital energy (Shukra Dhatu) which supports strength, intellect, and longevity. Brahmacharya’s role across life stages, classifications, and its psychosomatic mechanisms that prevent depletion of essential nutrients to the nervous system. It stresses rigorous adherence to Brahmacharya for sustaining health and outlines recommended supportive routines after sexual activity for maintaining well-being (Meher et al., 2023). Brahmacharya as a practice beyond celibacy, involving mental and verbal restraint regarding sexual thoughts and actions. Traditional Hindu and Ayurvedic teachings link Brahmacharya with increased vitality, intellectual clarity, and spiritual power by conserving sexual energy. Biological and evolutionary perspectives on aging, citing mechanisms by which sexual activity impacts energy expenditure and hormone function, which may accelerate aging. Preservation of semen (Shukra) in Ayurveda is crucial for longevity, supported by scientific insights into metabolic and hormonal changes with sexual activity and aging (Skandhan et al., 2021).',
        },
      ],
    },
    {
      id: 'limitations-of-brahmacharya',
      heading: 'Limitations of Brahmacharya',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Brahmacharya involves rigorous control over senses and faculties, which if practiced imprudently or without proper training can cause psychological disturbances. Excessive repression of natural urges such as seminal discharge is cautioned against due to possible unforeseen physical and mental consequences. Balanced practice tailored to life stages and seasons, warning that extreme or rigid abstinence without understanding may lead to mental health issues. Proper regulation, moderation, and adherence to guidelines are essential for safe practice. Suppressing natural bodily urges (Vegadharana) excessively can disturb the body’s doshas, especially Vata, which governs the mind and body coordination. This can lead to homeostatic imbalance and various disorders. Brahmacharya must be practiced with awareness of individual physical constitution and life circumstances, as unwise control may impair nervous system and brain functioning, contrary to its intended benefits. Without proper mental preparation and meditative focus, Brahmacharya may induce frustration or emotional imbalance. The intense demand for purity of thought, word, and deed is difficult to maintain fully, which may lead to feelings of guilt or internal conflict if norms are breached. Complete celibacy, especially lifelong, is viewed by some modern scholars and practitioners as difficult and potentially isolating if not aligned with personal, social, or cultural contexts. Some argue that for spiritual progress, Brahmacharya must be coupled with devotion, moral integrity, and balanced living; otherwise, the practice may be seen as ineffective or wasted effort (Kumar et al., 2024).',
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
            'Comparison of the Indian and Western concepts of Brahmacharya Alter (1997) and Sahu (2023).',
          columns: ['Aspect', 'Indian Concept of Brahmacharya', 'Western Concept of Brahmacharya'],
          rows: [
            {
              head: 'Scope',
              cells: [
                'Broad spiritual discipline encompassing physical, mental, and spiritual self-control',
                'Narrowly focused on sexual abstinence and moral purity',
              ],
            },
            {
              head: 'Purpose',
              cells: [
                'Preservation of vital energy for spiritual growth and intellectual clarity',
                'Maintaining male identity and health within sociocultural morality frameworks',
              ],
            },
            {
              head: 'Sexuality',
              cells: [
                'Moderate sexual activity allowed, controlled by life stages and purpose',
                'Primarily seen as celibacy, sexual abstinence as moral ideal',
              ],
            },
            {
              head: 'Conceptual Approach',
              cells: [
                'Integrated with Dharma (righteousness) and spiritual liberation',
                'Emphasizes psychological and somatic health related to sexual behavior',
              ],
            },
            {
              head: 'Cultural Context',
              cells: [
                'Embedded in religious, philosophical, and Ayurvedic traditions',
                'Viewed through Western medicine, psychology, and social norms',
              ],
            },
            {
              head: 'Underlying Philosophy',
              cells: [
                'Emphasizes Dharma, Viveka (discernment), Vichara Sakti (power of discrimination)',
                'Influenced by Western philosophical critiques of sexuality (e.g., Foucault)',
              ],
            },
          ],
        },
      ],
    },
  ],
  references: [
    'alter-1997',
    'dylan-muncaster-2021',
    'kumar-2024',
    'manapat-2019',
    'meher-2023',
    'rodriguez-nieto-2021',
    'sahu-2023',
    'shlokam-2020-yogasutra-2-30',
    'shlokam-2020-yogasutra-2-32',
    'shlokam-2024-gita-6-17',
    'shlokam-2024-gita-2-54',
    'shlokam-2024-gita-2-55',
    'shlokam-2024-gita-2-56',
    'shlokam-2024-gita-2-57',
    'shlokam-2024-gita-2-58',
    'shlokam-2024-gita-2-68',
    'skandhan-2021',
    'srinivasan-2016',
    'thapliyal-2023',
    'tomar-2024',
  ],
  questionnaire: 'brahmacharya',
  reviewStatus: 'drafted-not-reviewed',
  provenance: {
    drafted: ['keywords'],
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluesbrahmacharya-profiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Keywords drafted from the page’s own words, for search; a keyword never names a modern construct or a condition.',
      'Headword split out of the compound in the page’s Yoga Sūtra 2.30 verse, “ahiṃsāsatyāsteyabrahmacaryāparigrahā” and “अहिंसासत्यास्तेयब्रह्मचर्यापरिग्रहा”, in its dictionary form: “brahmacarya”, “ब्रह्मचर्य”. The page’s own spelling, “Brahmacharya”, is its ASCII spelling. The page title gives no gloss, so the Concept has no English name (flagged).',
      'The page title, “Know Your Values: Brahmacharya Profiling”, is its Questionnaire’s title; the Concept is named by its headword.',
      'Verse headings dropped: “Shloka for Know Your Values – Yama from Chapter 2, Sutra 30”, “Shloka for Know Your Values – Niyama from Chapter 2, Sutra 32”, “Shloka for Know Your Values – Brahmacharya: Chapter 6, Verse 17”, and “Shloka for Know Your Values – Brahmacharya: Chapter 2, Verse 54” and its like for verses 55, 56, 57, 58 and 68. Each verse shows its work and number, as the census assigned them: the Yoga Sūtra for the first two, the Bhagavad Gītā for the rest.',
      'The page’s “Raja Yoga Foundations: Yama-Niyama” section, with its sub-headings “Yama” and “Niyama”, is the values topic’s introduction: all four Know Your Values pages print it, so it is stored once there and shown here, where the page had it, by a topic-intro block. The values topic lists how the four copies differ, and the two inline DharmaWiki links this page’s copy carries (“Yama”, “Niyama”), dropped.',
      'The sub-heading “Brahmacharya Profiling”, under “Raja Yoga Foundations: Yama-Niyama” on the page, starts a section of its own: its text defines brahmacarya, the Concept itself, and is not part of the shared yama–niyama text.',
      'Typo fixed, and the space after the opening quote dropped: ““ Brahmacharya is the restaurant of the sex organ and other senses.”” → ““Brahmacharya is the restraint of the sex organ and other senses.””.',
      'The page gives its table no caption of its own; it takes the heading set just above it: “Comparison of the Indian and Western concepts of Brahmacharya Alter (1997) and Sahu (2023).”. The table’s first row (“Aspect”, “Indian Concept of Brahmacharya”, “Western Concept of Brahmacharya”) gives its columns.',
      'Interface text dropped: the “Introduction” and “References” labels, and the “Translation:” and “Meaning:” labels before the verses’ translations and readings.',
      'Left out: the page’s “Overall Score Indicator” section, which belongs to its Questionnaire and is listed there as held back.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Brahmacharya values page writes its headword “Brahmacharya”. The record’s IAST and Devanagari, “brahmacarya” and “ब्रह्मचर्य”, are split out of the compound in the page’s own Yoga Sūtra 2.30 verse, in their dictionary form. Confirm them; nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The Brahmacharya values page’s title, “Know Your Values: Brahmacharya Profiling”, gives no English gloss, so the Concept has no English name. The page glosses the term only in passing: “chastity or control over sensuality (brahmacharya)” in its reading of Yoga Sūtra 2.30, and “Brahmacharya (sense control or celibacy)” in the shared yama–niyama section. Choose a gloss or confirm none; nothing was written for it.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The Brahmacharya values page heads its nine verses with chapter and number only (“Chapter 2, Sutra 30”, “Chapter 2, Sutra 32”, “Chapter 6, Verse 17”, and “Chapter 2, Verse 54” to “Chapter 2, Verse 68”), naming no work. The first two are stored under the Yoga Sūtra, and the rest under the Bhagavad Gītā, which the page’s reading of 6.17 names (“the Bhagavad Gita (6.17)”) and whose 2.54–2.68 the Sthitaprajna page also quotes. Confirm the attribution.',
        ticket: 16,
      },
      {
        for: 'research-editor',
        note: 'Left as the Brahmacharya values page prints them: four sentences with no main verb, which read like notes on the papers cited (“Brahmacharya’s role across life stages, classifications, and its psychosomatic mechanisms that prevent depletion of essential nutrients to the nervous system.”, “Brahmacharya as a practice beyond celibacy, involving mental and verbal restraint regarding sexual thoughts and actions.” and “Biological and evolutionary perspectives on aging, citing mechanisms by which sexual activity impacts energy expenditure and hormone function, which may accelerate aging.” under “Consequences of Brahmacharya”, and “Balanced practice tailored to life stages and seasons, warning that extreme or rigid abstinence without understanding may lead to mental health issues.” under “Limitations of Brahmacharya”). Nothing was changed.',
      },
    ],
  },
})
