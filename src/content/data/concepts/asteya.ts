import { defineConcept } from '@/content/schema'

// The /knowyourvaluesasteyanonstealingprofiling/ page, carried over as the Concept asteya. Its
// yama–niyama section, which all four values pages print, is stored once as the values topic's
// introduction and shown here by a topic-intro block. The page's score section is held back with
// its Questionnaire.
export default defineConcept({
  kind: 'concept',
  slug: 'asteya',
  name: {
    // Split out of the page's Yoga Sūtra 2.30 compound (see the flags); the title glosses it.
    term: { iast: 'asteya', devanagari: 'अस्तेय', ascii: ['Asteya'] },
    english: 'Non-Stealing',
  },
  summary:
    'In broader terms, the principle of refraining from taking or appropriating anything without permission, whether through thoughts, words, or actions, is known as ‘Asteya’ in the ethical framework.',
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
  ],
  sections: [
    {
      // The shared section's place: its heading and text are the values topic's introduction.
      id: 'raja-yoga-foundations-yama-niyama',
      heading: 'Raja Yoga Foundations: Yama-Niyama',
      blocks: [{ kind: 'topic-intro', topic: 'values' }],
    },
    {
      id: 'asteya-non-stealing-profiling',
      heading: 'Asteya (Non-Stealing) Profiling',
      blocks: [
        {
          kind: 'paragraph',
          text: '“With the freedom from desire, refusal for any improper appropriation of oneself, for others’ things.” – Vyasa Maharaj.',
        },
        {
          kind: 'paragraph',
          text: 'In broader terms, the principle of refraining from taking or appropriating anything without permission, whether through thoughts, words, or actions, is known as ‘Asteya’ in the ethical framework. Within societal structures, all resources are typically owned by individuals or entities. Hence, respecting their ownership and refraining from taking anything without explicit consent from the rightful owner constitutes the practice of ‘Asteya’.',
        },
        {
          kind: 'paragraph',
          text: '“Stealing cannot exist in those whose desire has been cut off.” – Adi Shankaracharya (Tomar, 2024).',
        },
        {
          kind: 'paragraph',
          text: 'Asteya, often understood as not taking what is not freely given, goes beyond avoiding theft to include recognizing and responsibly using unearned privilege. While traditional rule-based ethics help explain the idea of not stealing, understanding systemic oppression and privilege calls for virtue and consequential ethics. In social work, this means challenging exploitation and social injustice through actions like policy change, advocacy, and organizing to promote equity. On a personal level, asteya encourages social workers to resist oppressive power dynamics, maintain egalitarian and dialogical relationships with service users, and avoid using their work for self-promotion or professional gain. It also involves practicing humility, letting go of attachment to recognition, and not overworking in ways that harm both oneself and those served. Overall, asteya deepens social work ethics by fostering fairness, self-awareness, and a commitment to social justice (Dylan & Muncaster, 2021).',
        },
      ],
    },
    {
      id: 'consequences-of-asteya-non-stealing',
      heading: 'Consequences of Asteya (Non-Stealing)',
      blocks: [
        {
          kind: 'paragraph',
          text: 'An ethical education group, which practiced Asteya as part of its core curriculum, showed the greatest improvements in psychological well-being, gratitude, and self-restraint. Practicing Asteya directly strengthens feelings of abundance and reduces anxiety caused by fear of loss or covetousness. Asteya supports a more positive sense of self-worth and increases harmony in social interactions because it diminishes competitive and possessive tendencies (Matko et al., 2021). Another study also reveals that practicing Asteya leads to emotional stability, lowers stress, promotes healthy, trusting relationships, reducing envy and greed, making individuals feel more content and less anxious. It also promotes group cohesion and ethical awareness in communities by reinforcing respect for others’ boundaries (Alam et al., 2024).',
        },
      ],
    },
    {
      id: 'absence-of-asteya-non-stealing',
      heading: 'Absence of Asteya (Non-Stealing)',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The absence of asteya, in Gandhi’s view, shows up as any form of selfish taking, misuse, or overconsumption. It includes openly or secretly taking what belongs to others, using common property for personal gratification, or even claiming something that seems ownerless. It also extends to indulging in unnecessary commodities, extravagance, or waste beyond what is needed for a simple and natural life. When a person lives without humility, vigilance, and simplicity, allowing greed or self-interest to guide their actions, they fall into the absence of asteya. Its absence increases anxiety, distrust, a decline in moral standards, leading to widespread social distrust, increased hostility, and loss of interpersonal harmony. Ethical norms break down, resulting in the deterioration of social values and escalation of criminal or deceitful behaviors. In professional settings, neglecting Asteya fosters environments of competition, exploitation, and mental distress (Parmar, 2014).',
        },
      ],
    },
  ],
  references: [
    'alam-2024',
    'dylan-muncaster-2021',
    'matko-2021',
    'parmar-2014',
    'shlokam-2020-yogasutra-2-30',
    'shlokam-2020-yogasutra-2-32',
    'srinivasan-2016',
    'thapliyal-2023',
    'tomar-2024',
  ],
  questionnaire: 'asteya',
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluesasteyanonstealingprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Headword split out of the compound in the page’s Yoga Sūtra 2.30 verse, “ahiṃsāsatyāsteyabrahmacaryāparigrahā” and “अहिंसासत्यास्तेयब्रह्मचर्यापरिग्रहा”, in its dictionary form: “asteya”, “अस्तेय”. The page’s own spelling, “Asteya”, is its ASCII spelling, and its English name is the gloss the page title gives, “Non-Stealing”.',
      'The page title, “Know Your Values: Asteya (Non-Stealing) Profiling”, is its Questionnaire’s title; the Concept is named by its headword and gloss.',
      'Verse headings dropped: “Shloka for Know Your Values – Yama from Chapter 2, Sutra 30” and “Shloka for Know Your Values – Niyama from Chapter 2, Sutra 32”. Each verse shows its work and number, the Yoga Sūtra the census assigned.',
      'The page’s “Raja Yoga Foundations: Yama-Niyama” section, with its sub-headings “Yama” and “Niyama”, is the values topic’s introduction: all four Know Your Values pages print it, so it is stored once there and shown here, where the page had it, by a topic-intro block. Its text is this page’s copy; the values topic lists how the four copies differ.',
      'The sub-headings under “Asteya (Non-Stealing) Profiling”, “Consequences of Asteya (Non-Stealing)” and “Absence of Asteya (Non-Stealing)”, each start a section of their own, in the page’s order.',
      'Typo fixed: the page closes ‘Asteya with a double quote, written " here, where a single one is meant: “‘Asteya" in the” → “‘Asteya’ in the”.',
      'Interface text dropped: the “Introduction” and “References” labels, and the “Translation:” and “Meaning:” labels before the verses’ translations and readings.',
      'Left out: the page’s “Overall Score Indicator” sub-section, the last under “Asteya (Non-Stealing) Profiling”, which belongs to its Questionnaire and is listed there as held back.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Asteya values page writes its headword “Asteya”, and its IAST only in passing (“non-stealing (asteya)”). The record’s IAST and Devanagari, “asteya” and “अस्तेय”, are split out of the compound in the page’s own Yoga Sūtra 2.30 verse, in their dictionary form. Confirm them; nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The Asteya values page heads its two verses with chapter and sutra only (“Chapter 2, Sutra 30”, “Chapter 2, Sutra 32”), naming no work; they are stored under the Yoga Sūtra, which their text is. Confirm the attribution.',
        ticket: 16,
      },
    ],
  },
})
