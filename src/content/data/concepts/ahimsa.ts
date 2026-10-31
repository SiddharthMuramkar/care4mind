import { defineConcept } from '@/content/schema'

// The /knowyourvaluesahimsanon-violenceprofiling/ page, carried over as the Concept ahiṃsā. Its
// yama–niyama section, which all four values pages print, is stored once as the values topic's
// introduction and shown here by a topic-intro block. The page's score section is held back with
// its Questionnaire.
export default defineConcept({
  kind: 'concept',
  slug: 'ahimsa',
  name: {
    // Split out of the page's Yoga Sūtra 2.30 compound (see the flags); the title glosses it.
    term: { iast: 'ahiṃsā', devanagari: 'अहिंसा', ascii: ['Ahimsa'] },
    english: 'Non-Violence',
  },
  summary:
    'Non-violence entails refraining from causing harm to any living being through one’s thoughts, words, or actions.',
  keywords: [
    'non-violence',
    'violence',
    'harm',
    'compassion',
    'kindness',
    'calm',
    'values',
    'ethics',
  ],
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
      passage: 'yoga-sutra/2.35',
      translation: 'knowyourvaluesahimsanon-violenceprofiling',
      meaning:
        'This sutra means that when a person is deeply and firmly established in ahimsa (non-violence), their presence radiates such peace and compassion that all hostility around them naturally disappears. Even beings that are normally aggressive or violent become calm in their company. Swami Vivekananda illustrates this with the image of a tiger and a lamb coexisting peacefully before such a Yogi. True non-violence is not just refraining from harm in action; it is a profound state of being where one’s very presence influences others toward harmony. Only when this transformation happens effortlessly do we know we are truly grounded in ahimsa.',
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
      id: 'ahimsa-non-violence-profiling',
      heading: 'Ahimsa (Non-Violence) Profiling',
      blocks: [
        {
          kind: 'paragraph',
          text: '“Non-violence is the absence of any tendency to hurt or injure any living being in any manner at all the circumstances”, by Vyasa Maharaj. Non-violence entails refraining from causing harm to any living being through one’s thoughts, words, or actions. Even harbouring negative thoughts or intentions towards others constitutes violence. It also involves avoiding self-harm in any form, whether through thought, speech, or action. While some may refrain from harming others, they may still engage in self-destructive behaviours (Tomar, 2024). The issues of violence and non-violence in religious traditions are primarily based on prerequisites connected with religion and world views resulting from concepts concerning the beginnings of life. Hinduism emerged from concepts of Universal sacrifice as the origin of being, that is why its interpretation of violence and nonviolence is different from that in monotheistic religious traditions (Reznik et al., 2019).',
        },
      ],
    },
    {
      id: 'consequences-of-ahimsa',
      heading: 'Consequences of Ahimsa',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Ahimsa fosters peaceful conflict resolution, reduces violence, and helps build cooperative, multicultural societies, contributing to national development and sustainable peace. Practicing Ahimsa is linked with the development of compassion, forgiveness, and ethical conduct, supporting improved interpersonal relationships and psychological well-being (Barai, 2018). Ahimsa’s rejection of violence aids in preventing loss of life and property, discourages exploitation, and supports the humane treatment of all living beings. Adoption of Ahimsa in policy and community interactions is shown to foster unity across ethnic, religious lines, accelerating national development and often extends to veganism/vegetarianism and environmental protection, promoting sustainable living practices (Adebola Racheal Ayoola et al., 2024).',
        },
      ],
    },
    {
      id: 'limitations-of-ahimsa',
      heading: 'Limitations of Ahimsa',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Strict adherence to Ahimsa can lead to complex ethical dilemmas in modern contexts, especially regarding animal products, resource use, and unavoidable harm. Misconceptions and challenges in practicing Ahimsa as a way of life are documented, notably in areas like food, industry, and community rituals where avoidable harm is difficult to eliminate entirely (Jain & Prakrit Bharati academy, JaiPur, 2016). Practical social transformation may at times require strategies beyond non-violence, and reason alone may not suffice in all situations (“EPRA International Journal of Multidisciplinary Research (IJMR),” 2019b).',
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
            'Comparative table summarizing the Indian vs Western concept of Ahimsa (Non-Violence) Bharadwaj et al. (2024); Mandal Pal (2023).',
          columns: [
            'Conceptual Dimension',
            'Indian Concept of Ahimsa',
            'Western Concept of Non-Violence',
          ],
          rows: [
            {
              head: 'Foundational Philosophy',
              cells: [
                'Based on spiritual, metaphysical tradition (Jainism, Hinduism, Buddhism); emphasizes dharma, karma, moksha, and compassion',
                'Grounded in ethical rationalism, justice, autonomy, and civil rights',
              ],
            },
            {
              head: 'Scope of Non-Violence',
              cells: [
                'Holistic: includes thought, word, deed, and emotional/psychological harm; restraint and forgiveness are vital',
                'Primarily addresses physical/political violence; centered on social reform and legal context',
              ],
            },
            {
              head: 'Social Application',
              cells: [
                'Mass movements and personal transformation; Gandhi’s reinterpretation for social justice and activism',
                'Civil resistance, justice movement, legal reform (e.g., MLK Jr., Tolstoy)',
              ],
            },
            {
              head: 'Motivation and Rationale',
              cells: [
                'Spiritual liberation (moksha), universal love, and ethical living are guiding ideals',
                'Justice, equity, individual freedom; less focus on spiritual or metaphysical aims',
              ],
            },
            {
              head: 'Emotional/Spiritual Dimension',
              cells: [
                'Integral: non-harm viewed as prerequisite to spiritual growth and emotional equanimity',
                'Typically absent; focus is on rational ethics and practical solutions',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'absence-of-ahimsa',
      heading: 'Absence of Ahimsa',
      blocks: [
        {
          kind: 'paragraph',
          text: 'In traditions like Jainism, the absence of Ahimsa erodes the fundamental spiritual ethos, leading to weakened ethical commitment and dilution of core teachings. Ancient Indian thought warns that actions devoid of Ahimsa generate severe negative consequences for individual fate and communal harmony (Reznik et al., 2019b). When not taught, discussed, or embodied in daily life, Ahimsa becomes simply a word, without value or effect, causing ethical anomie even in traditionally nonviolent cultures (Jain & Prakrit Bharati academy, JaiPur, 2016).',
        },
      ],
    },
  ],
  references: [
    'ayoola-2024',
    'barai-2018',
    'bharadwaj-2024',
    'epra-2019',
    'mandal-pal-2023',
    'reznik-2019',
    'shlokam-2020-yogasutra-2-30',
    'shlokam-2020-yogasutra-2-32',
    'shlokam-2020-yogasutra-2-35',
    'srinivasan-2016',
    'sudrajat-2017',
    'thapliyal-2023',
    'tomar-2024',
  ],
  questionnaire: 'ahimsa',
  reviewStatus: 'drafted-not-reviewed',
  provenance: {
    drafted: ['keywords'],
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluesahimsanon-violenceprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Headword split out of the compound in the page’s Yoga Sūtra 2.30 verse, “ahiṃsāsatyāsteyabrahmacaryāparigrahā” and “अहिंसासत्यास्तेयब्रह्मचर्यापरिग्रहा”, in its dictionary form: “ahiṃsā”, “अहिंसा”. The page’s own spelling, “Ahimsa”, is its ASCII spelling, and its English name is the gloss the page title gives, “Non-Violence”.',
      'The page title, “Know Your Values: Ahimsa (Non-Violence) Profiling”, is its Questionnaire’s title; the Concept is named by its headword and gloss.',
      'Verse headings dropped: “Shloka for Know Your Values – Yama from Chapter 2, Sutra 30”, “Shloka for Know Your Values – Niyama from Chapter 2, Sutra 32” and “Shloka for Know Your Values – Ahimsa from Chapter 2, Sutra 35”. Each verse shows its work and number, the Yoga Sūtra the census assigned.',
      'The page’s “Raja Yoga Foundations: Yama-Niyama” section, with its sub-headings “Yama” and “Niyama”, is the values topic’s introduction: all four Know Your Values pages print it, so it is stored once there and shown here, where the page had it, by a topic-intro block. The values topic lists how the four copies differ, and the two inline DharmaWiki links this page’s copy carries (“Yama”, “Niyama”), dropped.',
      'The sub-heading “Ahimsa (Non-Violence) Profiling”, under “Raja Yoga Foundations: Yama-Niyama” on the page, starts a section of its own: its text defines ahiṃsā, the Concept itself, and is not part of the shared yama–niyama text.',
      'Typo fixed: “Vasaya Maharaj” → “Vyasa Maharaj”, as the other values pages write the name.',
      'The page gives its table no caption of its own; it takes the heading set just above it: “Comparative table summarizing the Indian vs Western concept of Ahimsa (Non-Violence) Bharadwaj et al. (2024); Mandal Pal (2023).”. The table’s first row (“Conceptual Dimension”, “Indian Concept of Ahimsa”, “Western Concept of Non-Violence”) gives its columns.',
      'Interface text dropped: the “Introduction” and “References” labels, and the “Translation:” and “Meaning:” labels before the verses’ translations and readings.',
      'Left out: the page’s “Overall Score indicator” section, which belongs to its Questionnaire and is listed there as held back.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Ahimsa values page writes its headword only as “Ahimsa”. The record’s IAST and Devanagari, “ahiṃsā” and “अहिंसा”, are split out of the compound in the page’s own Yoga Sūtra 2.30 verse, in their dictionary form. Confirm them; nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The Ahimsa values page heads its three verses with chapter and sutra only (“Chapter 2, Sutra 30”, “Chapter 2, Sutra 32”, “Chapter 2, Sutra 35”), naming no work; they are stored under the Yoga Sūtra, which their text is. Confirm the attribution.',
        ticket: 16,
      },
      {
        for: 'research-editor',
        note: 'The Ahimsa values page cites “(Jain & Prakrit Bharati academy, JaiPur, 2016)” twice, and its reference list has no such entry. Kept as written; nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'The Ahimsa values page cites “(Reznik et al., 2019b)” under “Absence of Ahimsa” and “(Reznik et al., 2019)” in its definition; its reference list has one Reznik et al. (2019) entry, with no letter. Kept as written; nothing was looked up.',
        ticket: 17,
      },
    ],
  },
})
