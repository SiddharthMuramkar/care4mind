import { defineConcept } from '@/content/schema'

// The /knowyourvaluessatyatruthfulnessprofiling/ page, carried over as the Concept satya. Its
// yama–niyama section, which all four values pages print, is stored once as the values topic's
// introduction and shown here by a topic-intro block. The page's score section is held back with
// its Questionnaire.
export default defineConcept({
  kind: 'concept',
  slug: 'satya',
  name: {
    // Split out of the page's Yoga Sūtra 2.30 compound (see the flags); the title glosses it.
    term: { iast: 'satya', devanagari: 'सत्य', ascii: ['Satya'] },
    english: 'Truthfulness',
  },
  summary: 'Truth should be upheld in both thought, speech, and action.',
  keywords: ['truth', 'truthfulness', 'honesty', 'speech', 'values'],
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
      passage: 'yoga-sutra/2.36',
      translation: 'knowyourvaluessatyatruthfulnessprofiling',
      meaning:
        'This sutra highlights the transformative power of truthfulness. When a person becomes deeply rooted in truth, their words and intentions align perfectly with reality. Such purity of thought, speech, and action brings a natural potency to whatever they say, because there is no contradiction or falsehood within them. Their speech carries the force of truth itself, and thus what they utter manifests as reality, whether it is blessing, healing, or the fulfillment of a promise. In this state, truth is no longer just a moral discipline but a profound source of power that shapes outcomes directly.',
    },
    {
      passage: 'bhagavad-gita/17.15',
      translation: 'knowyourvaluessatyatruthfulnessprofiling',
      meaning:
        'This verse highlights the ideal way to use speech as a form of self-discipline. Words should never cause unnecessary agitation or hurt; instead, they should be calm, thoughtful, and measured. At the same time, speech must be rooted in truth, honest and authentic, while also being pleasant and beneficial to others, rather than harsh or self-serving. Along with this, the verse emphasizes the importance of regularly engaging in self-study and reflection, such as studying sacred texts or wisdom that uplifts the mind. Together, these practices form the “austerity of speech,” reminding us that the power of our words lies not just in truth, but in the way truth is expressed with kindness, usefulness, and respect.',
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
      id: 'satya-truthfulness-profiling',
      heading: 'Satya (Truthfulness) Profiling',
      blocks: [
        {
          kind: 'paragraph',
          text: 'When once words and thoughts are in exact correspondence to the fact that is, to whatever is known through seeing, inferring, or heard on the authority is Satya. – Vyasa Maharaj.',
        },
        {
          kind: 'paragraph',
          text: 'Truth should be upheld in both thought, speech, and action. When an individual becomes firmly rooted in the practice of truthfulness, their actions yield positive outcomes, and the impact of their truthful conduct extends beneficially to other living beings. It is essential to recognise the unity of mind, speech, and actions in adhering to truthfulness.',
        },
        {
          kind: 'paragraph',
          text: '“Speech is for the transferral of one’s knowledge to others and should not be deceitful, misleading, or devoid of value. It should benefit and never harm any being, otherwise it is sinful.” – Vyasa Maharaj (Tomar, 2024).',
        },
        {
          kind: 'paragraph',
          text: 'Gandhi’s conception of truth (Satya) stands in sharp contrast to conventional notions of truth. For Gandhi, truth was not limited to factual correctness or pragmatic utility but was a profound moral and spiritual principle inseparably linked to non-violence (Ahimsa) and embodied through Satyagraha, the “force of truth and love.” While conventional truth is often context-dependent, flexible, and shaped by social or political needs, Gandhi’s truth was universal, unchanging, and demanded ethical self-discipline, sacrifice, and moral courage. Satyagraha represented the practical application of this philosophy, emphasizing nonviolent resistance, self-suffering, and moral persuasion aimed at transforming both self and opponent rather than overpowering them. Unlike conventional truth, which functions mainly as a means to achieve accuracy or utility, Gandhi regarded truth as an end in itself and a way of life, requiring lifelong commitment and introspection. The findings underscore that Gandhi’s philosophy continues to hold relevance today, offering a framework for justice, nonviolent activism, and personal integrity in an era where truth is often compromised by political, social, and economic pressures (Chakraborty, 2020).',
        },
      ],
    },
    {
      id: 'consequences-of-satya-truthfulness',
      heading: 'Consequences of Satya (Truthfulness)',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Gandhi’s concept of Satya (truthfulness), along with nonviolence and self-control, promotes psychological strength, mental resilience, positive coping strategies in life, enhanced conflict resolution, emotional wellbeing, and trust-building in relationships (Tandon & Singh, 2013). Satya, as a core Gandhian value, is linked to resilience, the ability to adapt to stress and recover from adversity, by fostering clarity, inner strength, and willpower (Kazmi, 2019).',
        },
      ],
    },
    {
      id: 'limitations-of-satya-truthfulness',
      heading: 'Limitations of Satya (Truthfulness)',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Telling the unvarnished truth can strain relationships, cause hurt feelings, or even emotional trauma when sensitive or threatening information is disclosed without care. While honesty benefits long-term psychological well-being, blunt or insensitive truth-telling has a risk of undermining social and relational stability (Zahedi, 2011). In some cultures, strict truth-telling is not always valued and may even be considered inappropriate if it conflicts with greater values like harmony, respect, or collective well-being. The context (culture, relationship, specific situation) must be carefully considered before practicing absolute truthfulness, as rigid application may lead to unintended negative consequences (Geppert, 2022). Trait truthfulness varies, and people often modulate honesty to fit social goals or avoid negative outcomes, such as disapproval or conflict (Reynolds et al., 2025).',
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
            'Comparison of the Indian and Western concepts of truth (Agrawal & Aldons, 2023).',
          columns: ['Aspect', 'Indian Concept of Truth', 'Western Concept of Truth'],
          rows: [
            {
              head: 'Definition',
              cells: [
                'Realization of consciousness; ultimate reality (Atman, Brahman); includes moral code (dharma) and eternal truth; holistic, experiential',
                'Based on correspondence (Aristotle), coherence, semantic, pragmatic, and deflationary theories; primarily objective, rational, and empirical',
              ],
            },
            {
              head: 'Approach',
              cells: [
                'Subjective experience, intuition, spiritual insight; involves inner realization, detachment, meditation',
                'Objective evidence, rationality, empirical facts; systematic inquiry, logical reasoning',
              ],
            },
            {
              head: 'Key Theories',
              cells: [
                'Paramartha-satya (absolute), Vyavaharika-satya (social/moral); rooted in Bhagavad Gita',
                'Correspondence, Pragmatism (James, Dewey), Coherence (Kant, Peirce, Bradley), Semantic (Tarski, Davidson), Deflationary (Field, Kirkham)',
              ],
            },
            {
              head: 'Role of Self',
              cells: [
                'Realization through self-awareness, detachment from ego (Ahamkara); Atman is metaphysical self',
                'Truth as intentional mental state; examined via underlying principles and rational analysis',
              ],
            },
            {
              head: 'Means of Realization',
              cells: [
                'Yoga, meditation, self-enquiry; union with divine aspects (Adhibhuta, Adhidaiva, Adhiyajna); ongoing process',
                'Scientific methods, cognitive processes; inquiry, skepticism, personal experience and logic',
              ],
            },
            {
              head: 'Faith vs Reason',
              cells: [
                'Faith integrated with intuition and experience, supporting reasoning',
                'Faith often viewed as separate from evidence and reasoning; stands apart from rational inquiry',
              ],
            },
            {
              head: 'Relationship to Consciousness',
              cells: [
                'Truth expands consciousness; unity leads to ultimate realization (Brahman)',
                'Reason and logic prioritized; less emphasis on consciousness-unity connection',
              ],
            },
            {
              head: 'Limitations',
              cells: [
                'Difficult to empirically investigate; interpretation bias due to varied philosophical sources',
                'Challenges of abstractness and definitional complexity; disputed by deflationary and pragmatic views',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'absence-of-satya-truthfulness',
      heading: 'Absence of Satya (Truthfulness)',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The absence of truthfulness creates emotional distress, loss of trust, worse health outcomes, and increased anxiety, affecting both professionals and clients. Lack of commitment to truthfulness leads to logical errors, susceptibility to misinformation, and reduced societal trust. Dishonesty creates negative work morale, loss of productivity, incompetence, and damage to economic systems; unethical behavior spreads through organizations and society. Dishonesty correlates with greater acceptance of immoral behavior and undermines integrity in workplaces and communities (Testoni et al., 2020). Absence of truthfulness (dishonesty) leads to poor academic performance, emotional instability, social stigma, and disciplinary action. Lower honesty-humility traits strongly predict increased academic cheating and dishonest behaviors, which negatively impact integrity and outcomes. Widespread absence of honesty creates negative impacts for students, instructors, educational environments, and society as a whole (Reinhardt et al., 2022).',
        },
      ],
    },
  ],
  references: [
    'agrawal-aldons-2023',
    'chakraborty-2020',
    'geppert-2022',
    'kazmi-2019',
    'reinhardt-2022',
    'reynolds-2025',
    'shlokam-2024-gita-17-15',
    'shlokam-2020-yogasutra-2-36',
    'shlokam-2020-yogasutra-2-30',
    'shlokam-2020-yogasutra-2-32',
    'srinivasan-2016',
    'tandon-singh-2013',
    'testoni-2020',
    'thapliyal-2023',
    'tomar-2024',
    'zahedi-2011',
  ],
  questionnaire: 'satya',
  reviewStatus: 'drafted-not-reviewed',
  provenance: {
    drafted: ['keywords'],
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluessatyatruthfulnessprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Headword split out of the compound in the page’s Yoga Sūtra 2.30 verse, “ahiṃsāsatyāsteyabrahmacaryāparigrahā” and “अहिंसासत्यास्तेयब्रह्मचर्यापरिग्रहा”, in its dictionary form: “satya”, “सत्य”. The page’s own spelling, “Satya”, is its ASCII spelling, and its English name is the gloss the page title gives, “Truthfulness”.',
      'The page title, “Know Your Values: Satya (Truthfulness) Profiling”, is its Questionnaire’s title; the Concept is named by its headword and gloss.',
      'Verse headings dropped: “Shloka for Know Your Values – Yama from Chapter 2, Sutra 30”, “Shloka for Know Your Values – Niyama from Chapter 2, Sutra 32”, “Shloka for Know Your Values – Satya from Chapter 2, Sutra 36” and “Shloka for Know Your Values – Satya from Chapter 17, Verse 15”. Each verse shows its work and number, as the census assigned them: the Yoga Sūtra for the first three, the Bhagavad Gītā for the last.',
      'The page’s “Raja Yoga Foundations: Yama-Niyama” section, with its sub-headings “Yama” and “Niyama”, is the values topic’s introduction: all four Know Your Values pages print it, so it is stored once there and shown here, where the page had it, by a topic-intro block. The values topic lists how the four copies differ.',
      'The sub-headings under “Satya (Truthfulness) Profiling”, from “Consequences of Satya (Truthfulness)” to “Absence of Satya (Truthfulness)”, each start a section of their own, in the page’s order.',
      'Typo fixed, a full stop before a citation: “relational stability. (Zahedi, 2011).” → “relational stability (Zahedi, 2011).”.',
      'The page gives its table no caption of its own; it takes the heading set just above it: “Comparison of the Indian and Western concepts of truth (Agrawal & Aldons, 2023).”. The table’s first row (“Aspect”, “Indian Concept of Truth”, “Western Concept of Truth”) gives its columns.',
      'Interface text dropped: the “Introduction” and “References” labels, and the “Translation:” and “Meaning:” labels before the verses’ translations and readings.',
      'Left out: the page’s “Overall Score Indicator” section, which belongs to its Questionnaire and is listed there as held back.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Satya values page writes its headword “Satya”, and its IAST only in passing (“truthfulness (satya)”). The record’s IAST and Devanagari, “satya” and “सत्य”, are split out of the compound in the page’s own Yoga Sūtra 2.30 verse, in their dictionary form. Confirm them; nothing was looked up.',
        decidedBy: 'sanskrit-terms',
      },
      {
        for: 'research-editor',
        note: 'The Satya values page heads its four verses with chapter and number only (“Chapter 2, Sutra 30”, “Chapter 2, Sutra 32”, “Chapter 2, Sutra 36”, “Chapter 17, Verse 15”), naming no work. The first three are stored under the Yoga Sūtra and the last under the Bhagavad Gītā, which their text is; the page’s reference list cites Shlokam’s “Bhagavad Gita Chapter 17 – Verse 15”. Confirm the attribution.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})
