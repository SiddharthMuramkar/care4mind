import { defineConcept } from '@/content/schema'

// The /sthitaprajna/ page, carried over as the Concept sthitaprajña, in the mind topic and also in
// self. Its six verses are Bhagavad Gītā 2.54–2.58 and 2.68, which the Brahmacharya values page
// also quotes; the readings here are this page's. Its score section is held back with its
// Questionnaire.
export default defineConcept({
  kind: 'concept',
  slug: 'sthitaprajna',
  name: {
    // The page writes “Sthitaprajna”; its IAST and Devanagari come from verse 2.54 (see the flags).
    term: {
      iast: 'sthitaprajña',
      devanagari: 'स्थितप्रज्ञ',
      ascii: ['Sthitaprajna', 'sthita-prajna'],
    },
    english: 'Person of steady wisdom',
  },
  summary:
    'As mentioned in Bhagavad Gita, Sthitaprajna means a state of stable intellect, mind, living devoid of desires, stable mental resilience in spite of any physical suffering or unfavourable situations, unaffected by others opinions, devoid of attachments and maintains equilibrium (Tomar, 2024).',
  topics: { primary: 'mind', also: ['self'] },
  verses: [
    {
      passage: 'bhagavad-gita/2.54',
      translation: 'sthitaprajna',
      meaning:
        'Arjuna, now calmer and more engaged, asks Krishna how a person of steady wisdom (sthita-prajna) lives both inwardly in meditation (samadhi) and outwardly in the world. Though his questions about how such a person speaks, sits, or walks, may seem superficial, they reflect a deep curiosity about how spiritual realization shows up in real life. Arjuna wants clarity before committing to the path of Karma Yoga. Arjuna’s question has two parts: one about the inner state of a realized being, and the other about how that inner state influences external actions. It’s a practical concern from someone trying to understand whether spiritual mastery can coexist with worldly life.',
    },
    {
      passage: 'bhagavad-gita/2.55',
      translation: 'sthitaprajna',
      meaning:
        'Krishna begins his response by explaining that a person of steady wisdom is one who has completely let go of all desires, having found deep satisfaction in the Self alone. Letting go of desires doesn’t mean becoming passive or lifeless. Rather, it shows that such a person has moved beyond ignorance and ego, and lives in the bliss of direct Self-realization. Just as we outgrow childhood toys, the wise outgrow worldly cravings. Their joy is no longer dependent on external things they are fulfilled in their own being. The verse thus presents a positive vision of spiritual maturity: not emptiness, but fullness and freedom.',
    },
    {
      passage: 'bhagavad-gita/2.56',
      translation: 'sthitaprajna',
      meaning:
        'This verse describes a wise person as someone who stays calm in both joy and sorrow, free from attachment, fear, and anger. These emotions are all linked; attachment leads to fear, and fear leads to anger. But a steady-minded person, no longer driven by desire, remains undisturbed even in pain or crisis. Their peace comes from within, not from external things.',
    },
    {
      passage: 'bhagavad-gita/2.57',
      translation: 'sthitaprajna',
      meaning:
        'This verse describes the wise person as someone who lives in the world without clinging to its ups and downs. True detachment isn’t about running away from life, but about facing both joy and sorrow with inner balance. Real wisdom lies in meeting all experiences pleasant or unpleasant without getting swayed. Such a person sees things clearly, without reacting based on personal likes or dislikes. They remain rooted in the eternal Self, not caught up in the fleeting changes of the world.',
    },
    {
      passage: 'bhagavad-gita/2.58',
      translation: 'sthitaprajna',
      meaning:
        'A person of steady wisdom has the ability to consciously withdraw their senses from external distractions, much like a tortoise pulls in its limbs for protection. This self-control doesn’t come from force or illness, but from deep understanding. Such a person chooses not to be disturbed by the fleeting attractions of the world because they see their limited value. This withdrawal is not repression it’s a natural result of inner clarity and contentment.',
    },
    {
      passage: 'bhagavad-gita/2.68',
      translation: 'sthitaprajna',
      meaning:
        'True wisdom involves not just avoiding sense pleasures, but losing the craving for them altogether. A wise person doesn’t destroy their senses or reject life they simply aren’t overwhelmed by external temptations. Their inner peace stays steady, even when sense objects are present. Unlike most people, who are ruled by their senses, the wise live with awareness and self-mastery, free from inner disturbance.',
    },
  ],
  sections: [
    {
      id: 'what-is-the-definition-of-sthitaprajna',
      heading: 'What is the definition of Sthitaprajna?',
      blocks: [
        {
          kind: 'paragraph',
          text: 'As mentioned in Bhagavad Gita, Sthitaprajna means a state of stable intellect, mind, living devoid of desires, stable mental resilience in spite of any physical suffering or unfavourable situations, unaffected by others opinions, devoid of attachments and maintains equilibrium (Tomar, 2024).',
        },
        {
          kind: 'paragraph',
          text: 'Kaundinya (2024), states that practitioners of Nishkam Karma are known as Sthitaprajna, individuals who have mastered their minds and risen above the pull of pleasure and pain, success and failure. They remain unaffected by the highs and lows that come with bodily experiences, viewing them both with the same calm detachment. A Sthitaprajna lives with quiet steadiness neither sinking into sorrow after a loss nor getting carried away with joy after a gain. This mindset allows them to lead a life of true balance and inner peace.',
        },
        {
          kind: 'paragraph',
          text: 'Bhagavad Gita presents Sthitaprajna as a state of calm, self-control, and equanimity, Shankara interprets it through the lens of Advaita Vedanta, especially in the Vivekachudamani, where Sthitaprajna becomes synonymous with the realization of pure, objectless consciousness (Sharma, 1977).',
        },
        {
          kind: 'paragraph',
          text: 'The concept of moksha (liberation) as articulated in the Bhagavad Gita, identifying it as the ultimate spiritual goal characterized by transcendence of ego, detachment from material desires, and union with the divine (Brahman/Krishna). It outlines the Gita’s threefold path: karma-yoga, jnana-yoga, and bhakti-yoga as integrated routes to liberation. The Sthitaprajna (person of steady wisdom) is portrayed as the ideal liberated individual, who remains unshaken by pleasure or pain and attains inner equilibrium, spiritual insight, and freedom from karmic bondage.',
        },
      ],
    },
    {
      id: 'applications-of-sthitaprajna',
      heading: 'Applications of Sthitaprajna',
      role: 'applications',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Bhagavad Gita’s concept of Sthitaprajna serves as a timeless and practical framework for cultivating emotional balance, ethical discernment, and resilience in contemporary life. It argues that integrating these principles into daily practice can enhance work-life balance and mental well-being. Defining traits of a Sthitaprajna: detachment, emotional regulation, and self-mastery, contribute to effective stress management, adaptive coping, ethical decision-making, and composure under pressure. These ideas align with contemporary psychological practices such as mindfulness and cognitive reframing (KP, 2025).',
        },
        {
          kind: 'paragraph',
          text: 'A study by Adkoli (2022) states that within the S-5 Formula for Leadership Development, the final stage: Surrender (Samarpan) is conceptually aligned with the notion of Sthitaprajna as articulated in the Bhagavad Gita. This stage emphasizes the leader’s ability to relinquish ego and attachment to outcomes, embodying a state of equanimity and inner stability. The leader functions as an instrument of change, grounded in humility and selfless service. This study interprets Sthitaprajna, not merely as a philosophical ideal, but as the culmination of a developmental journey wherein leadership is expressed through detached action, ethical clarity, and a deep sense of responsibility to society.',
        },
        {
          kind: 'paragraph',
          text: 'The Bhagavad Gita presents Sthitaprajna as the ideal state of emotional stability, where the individual remains calm, detached, and unaffected by pleasure, pain, desire, or fear (Gita II.55–72). According to Sivakumar and Rajini (2022), a Sthitaprajna embodies full control over the senses, desires, anger, and the mind, resulting in deep inner peace. This state is not just self-control but a spiritual maturity where the mind is steady and undisturbed. The Gita views this as the ultimate form of stress management, offering a timeless model for mental resilience and equanimity.',
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
          text: 'Modern psychological theories of Emotional Intelligence (EI), a type of intelligence that involves the ability to process emotional information and use it in reasoning and other cognitive activities, proposed by U.S. psychologists Peter Salovey and John D. Mayer (APA Dictionary of Psychology, n.d.), have gained prominence in recent decades, the roots of these ideas can be traced back to ancient Indian literature. Notably, the Bhagavad Gita presents a rich, philosophical understanding of emotional regulation and stability through the concept of Sthitaprajna, a person of steady intellect.',
        },
      ],
    },
    {
      id: 'similarities',
      heading: 'Similarities',
      role: 'comparison',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Gayathri (2015) draws clear parallels between the emotionally intelligent individual and the Sthitaprajna as described by Krishna in the Gita. The emotionally intelligent person, according to Mayer and Salovey, possesses the ability to understand and manage emotions. This aligns with the Sthitaprajna, who, through devotion (Bhakti), knowledge (Gnana), and selfless duty (Karma), attains a state of emotional balance, remaining unaffected by pleasure or pain (sama-dukha-sukham dheeram). Krishna emphasizes the control of emotions such as desire and anger, which mirrors the EI concept of emotional regulation.',
        },
      ],
    },
    {
      id: 'differences',
      heading: 'Differences',
      role: 'comparison',
      blocks: [
        {
          kind: 'paragraph',
          text: 'However, while both concepts advocate emotional regulation, their underlying frameworks differ. EI, as formulated in contemporary psychology, focuses on competencies and skills related to identifying, understanding, and managing emotions for better interpersonal and intrapersonal functioning. It is often applied in secular, performance-oriented contexts such as leadership, education, and therapy.',
        },
        {
          kind: 'paragraph',
          text: 'In contrast, Sthitaprajna is deeply spiritual in nature. Emotional regulation here is not just for psychological wellbeing, but a step toward spiritual liberation and union with the supreme self. Thus, while the vocabulary and framing differ, the essence of emotional maturity, self-awareness, and empathy links both constructs. As Chauhan (2017) highlights, Chapter II, verse 15 of the Gita captures the core of emotional intelligence: one must remain calm in both joy and sorrow to attain enduring peace. Indian philosophy, therefore, not only anticipated but deepened the discourse on emotional intelligence, providing a timeless blueprint for emotional stability through Sthitaprajna (Surti et al., 2021).',
        },
        {
          kind: 'table',
          id: 'comparison',
          caption: 'Comparison between Sthitaprajna and Emotional Intelligence (Samant, 2023).',
          columns: [
            'Aspect',
            'Sthitaprajna (Eastern Philosophy)',
            'Emotional Intelligence (Western Science)',
          ],
          rows: [
            {
              head: 'Definition',
              cells: [
                'A person of steady wisdom; enlightened and emotionally undisturbed',
                'The ability to perceive, understand, manage, and use emotions effectively',
              ],
            },
            {
              head: 'Source',
              cells: [
                'Bhagavad Gita – Ancient Indian spiritual text',
                'Developed by modern psychologists; popularized by Daniel Goleman in 1995',
              ],
            },
            {
              head: 'Core Qualities',
              cells: [
                'Detachment, inner peace, emotional balance, unaffected by pain/pleasure',
                'Self-awareness, empathy, emotional regulation, adaptability',
              ],
            },
            {
              head: 'Response to Emotions',
              cells: [
                'Transcends desire, fear, anger; remains stable and unaffected',
                'Recognizes, labels, and manages emotions constructively',
              ],
            },
            {
              head: 'Purpose',
              cells: [
                'Attaining self-realization and liberation (moksha)',
                'Enhancing personal and social functioning',
              ],
            },
            {
              head: 'Behaviour in Adversity',
              cells: [
                'Calm, undisturbed, does not crave or grieve',
                'Uses emotional awareness to cope and make decisions',
              ],
            },
            {
              head: 'Spiritual Dimension',
              cells: [
                'Deeply spiritual; grounded in self-knowledge and unity with Brahman',
                'Primarily psychological, though can be integrated with personal meaning',
              ],
            },
            {
              head: 'Ultimate Goal',
              cells: [
                'Liberation from the cycle of birth and death; union with the self/God',
                'Effective functioning in life, well-being, and social success',
              ],
            },
            {
              head: 'Philosophical Basis',
              cells: [
                'Vedic metaphysics: Purusha–Prakriti, Guna theory, detachment from material illusions',
                'Psychological theories on cognition, behavior, and affect',
              ],
            },
            {
              head: 'Comparison Summary',
              cells: [
                'Sthitaprajna is a transcendent state of being rooted in detachment and wisdom',
                'Emotional Intelligence is a psychological skillset focused on recognizing and regulating emotions',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'absence-of-sthitaprajna',
      heading: 'Absence of Sthitaprajna',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The absence of Sthitaprajna leads to a chain reaction of psychological disturbance: attachment gives rise to desire, desire to anger, anger to delusion, delusion to memory loss, and memory loss to the fall of discriminative intelligence, ultimately causing personal downfall (Gita II.62–63; Sivakumar & Rajini, 2022). This sequence illustrates how unregulated emotions and lack of inner control contribute to mental distress and poor decision-making. Without Sthitaprajna, the mind becomes vulnerable to emotional instability, impulsive reactions, and attachment-driven choices. Individuals may be easily swayed by praise or criticism, overwhelmed by desires, and unable to maintain composure in the face of stress or suffering. Sensory indulgence, anxiety, and fear tend to dominate, leading to restlessness, weakened emotional resilience, and compromised judgment. This lack of inner grounding not only disrupts focus but also strains relationships and hinders overall well-being in both personal and professional spheres.',
        },
      ],
    },
  ],
  references: [
    'adkoli-2022',
    'apa-emotional-intelligence',
    'kaundinya-2024',
    'kp-2025',
    'samant',
    'sharma-1997',
    'shlokam-2025',
    'sivakumar-rajini-2022',
    'surti-ganga-2021',
    'tomar-2024',
    'wisdomlib-2022',
  ],
  questionnaire: 'sthitaprajna',
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [{ url: 'https://care4mind.org/sthitaprajna/', retrieved: '2026-10-27' }],
    edits: [
      'Headword forms split out of the inflected words of Bhagavad Gītā 2.54: the IAST “sthitaprajña” from “sthitaprajñasya”, and the Devanagari “स्थितप्रज्ञ” from “स्थितप्रज्ञस्य”. The page’s spellings, “Sthitaprajna” and, in a verse’s reading, “sthita-prajna”, are kept as ASCII spellings.',
      'Verse heading dropped: “Shlokas from Bhagavad Gita (Chapter 2, Verse 54-58, 68)”. Each verse shows its work and number.',
      'The sub-headings “Similarities” and “Differences” under “Indian vs Western concept” each start a section of their own, and all three sections take the comparison role.',
      'The page gives its table no caption of its own; it takes the heading set just above it: “Comparison between Sthitaprajna and Emotional Intelligence (Samant, 2023).”.',
      'Inline DharmaWiki links dropped, their words kept: “Nishkam Karma”, “moksha”, “karma-yoga”, “bhakti-yoga”, “Bhakti” and “Karma”.',
      'Interface text dropped: the “Introduction” and “References” labels, and the “Meaning:” labels before the verses’ readings.',
      'Left out: the page’s “Overall Score indicator” section, which belongs to its Questionnaire and is listed there as held back.',
      'Name gloss in sentence case: “person of steady wisdom” → “Person of steady wisdom”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page writes its headword only as “Sthitaprajna” (and “sthita-prajna”). The record’s IAST, “sthitaprajña”, and Devanagari, “स्थितप्रज्ञ”, are split out of Bhagavad Gītā 2.54’s “sthitaprajñasya” and “स्थितप्रज्ञस्य”. Confirm them; nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The text cites “(Sharma, 1977)”; the only Sharma on the page’s reference list is Sharma, A. (1997), “Sankara on the Sthitaprajna”. Kept as written; nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'The table’s caption cites “(Samant, 2023)”; the page’s reference list gives Samant with no year, so the citation resolves to no Reference. Kept as written; nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'The text cites “(Surti et al., 2021)” for Surti & Ganga (2021), a paper by two authors. Kept as written; nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'The text names works its reference list doesn’t include: Gayathri (2015) and Chauhan (2017). Kept as written; nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'The paragraph beginning “The concept of moksha (liberation) as articulated in the Bhagavad Gita” has no main verb in its first sentence, and cites no source though its next sentence (“It outlines the Gita’s threefold path”) reads as a summary of one. Kept as written; nothing was changed or looked up.',
      },
    ],
  },
})
