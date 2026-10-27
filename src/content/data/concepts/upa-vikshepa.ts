import { defineConcept } from '@/content/schema'

// The /upavikshepaprofiling/ page, carried over as the Concept upa-vikṣepa. Its sub-headings name
// the companions of distraction that Yoga Sūtra 1.31 lists in one compound: each is a term block,
// its forms taken from the page's text and that verse. The page's score section is held back with
// its Questionnaire.
export default defineConcept({
  kind: 'concept',
  slug: 'upa-vikshepa',
  name: {
    // The page writes “Upa-Vikshepa” and “Upa Vikshepa”, and gives no gloss (see the flags).
    term: { iast: 'upa-vikṣepa', ascii: ['Upa-Vikshepa', 'Upa Vikshepa'] },
  },
  summary:
    'The previously mentioned term “Vikshepa” (distractions) includes both primary and secondary distractions, sometimes known as byproducts. The Patanjali Yoga Sutra 1.31 outlines these byproducts.',
  topics: { primary: 'mind' },
  verses: [
    {
      passage: 'yoga-sutra/1.31',
      translation: 'upavikshepaprofiling',
      meaning:
        'When the mind loses focus and becomes distracted, it brings along several signs like sadness, mental unrest, physical trembling, and irregular breathing. These aren’t separate problems, but symptoms that go hand-in-hand with a scattered, unfocused state. When concentration is disturbed, it affects both the body and mind. Noticing these signs can help us realize when we’ve lost our inner steadiness and need to return to a more centered state.',
    },
  ],
  sections: [
    {
      id: 'what-is-the-definition-of-upa-vikshepa',
      heading: 'What is the definition of Upa Vikshepa?',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Pain, Discomfort, Restlessness, Breath-Related Issues, Drowsiness.',
        },
        {
          kind: 'paragraph',
          text: 'The previously mentioned term “Vikshepa” (distractions) includes both primary and secondary distractions, sometimes known as byproducts. The Patanjali Yoga Sutra 1.31 outlines these byproducts. Sadness, pain, restlessness, and trouble breathing are the five sub-distractions that they present as (Tomar, 2024).',
        },
        {
          kind: 'term',
          id: 'duhkha',
          term: { iast: 'duḥkha', devanagari: 'दुःख', ascii: ['Duhkha'] },
          blocks: [
            {
              kind: 'paragraph',
              text: 'Three types of mental or physical sorrow can be distinguished: adhyatmika, or spiritual sorrow, which refers to mental and physical suffering; adhibhautika, or metaphysical sorrow, which arises from interactions with other people or animals; and Adhidaivika, or sorrow brought on by natural disasters like landslides, floods, or heat waves (Tomar, 2024). The foundational principles of Buddhist philosophy, particularly the Four Noble Truths, which conceptualize duḥkha (suffering) as an inherent part of life, with identifiable causes and a clear path to its cessation through the Eightfold Path (Aich, 2013). Mindfulness can develop insight into duḥkha, not just to relieve symptoms but to address the root insight associated with craving and identification (Teasdale & Chaskalson, 2011).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'daurmanasya',
          term: { iast: 'daurmanasya', devanagari: 'दौर्मनस्य', ascii: ['Daurmanasya'] },
          blocks: [
            {
              kind: 'paragraph',
              text: 'When desires are not met or situations do not fit expectations, feelings of sadness, misery, dejection Tomar (2024), frustration, dejection, or mental anguish Yogapedia (2023b), occur in the mind and cause physical and mental discomfort. It’s listed alongside symptoms such as suffering (duḥkha), tremors of the limbs (angamejayatva), and irregular breathing (śvāsapraśvāsa) as indicators of mental disturbance and distraction (Yogapedia, 2023b).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'angamejayatva',
          term: {
            iast: 'aṅgamejayatva',
            devanagari: 'अङ्गमेजयत्व',
            ascii: ['Anggamejayatva', 'angamejayatva'],
          },
          blocks: [
            {
              kind: 'paragraph',
              text: 'Restlessness, physical unsteadiness, and mental anxiousness (Tomar, 2024). It is identified as one of four symptomatic obstacles (upādhis) that disrupt meditation and spiritual progress. This term literally means “tremors or unsteadiness of the limbs,” and refers to involuntary physical agitation that arises when the mind is overly focused on external distractions rather than inner stillness. Closely related is Shvasa Prashvasa, a symptom describing uneven or irregular breathing, signaling mental disturbance or anxiety. According to Yogapedia, these conditions stem from preoccupation with external stimuli and can manifest as physiological symptoms of trembling, labored breath, or agitation, when the mind and body remain ungrounded. The text advises that practices like meditation and pranayama (regulated breathing) can help quell these symptoms by calming the mind and inducing internal balance (Yogapedia, 2023a).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'svasa',
          term: { iast: 'śvāsa', devanagari: 'श्वास', ascii: ['Shvasa', 'Svasa'] },
          blocks: [
            {
              kind: 'paragraph',
              text: 'Irregularities in the breath inhalation. Breathing problems are subsequently brought on by this restlessness, resulting in laboured breathing patterns (Tomar, 2024). Conscious and sustained practice of slow, deep breathing has been shown to influence the brain, particularly the respiratory centers located in the medulla oblongata. Over time, this leads to a reduction in the normal breathing rate, which in turn improves respiratory efficiency. Psychological benefits have also been observed, including reduced anger and anxiety, likely due to the calming effect of slowed respiration. This reduction in emotional reactivity contributes to decreased energy loss and enhanced concentration, ultimately supporting greater overall efficiency. In a study by Vyas et al., individuals who practiced both short-term and long-term meditation showed significantly higher values in vital capacity, tidal volume, and breath-holding duration compared to non-meditators. Notably, long-term meditators exhibited greater vital capacity and expiratory pressure than short-term practitioners. These findings support the idea that awareness and regulation of breath, especially slow and alternate breathing, can play a key role in enhancing respiratory function and mental stability (Paikaray et al., 2018).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'prasvasa',
          term: { iast: 'praśvāsa', devanagari: 'प्रश्वास', ascii: ['Prashvasa', 'Prasvasa'] },
          blocks: [
            {
              kind: 'paragraph',
              text: 'Irregularities in the way breath is exhaled. As a result of this restlessness, breathing becomes difficult, leading to laboured respiratory abnormalities, particularly breathing difficulties (Tomar, 2024). Anxiety, stress and a distracted mind (citta-vikshepa, or that which scatters the thoughts) can lead to irregular breathing, or shvasa prashvasa (Yogapedia, 2023b).',
            },
          ],
        },
        {
          kind: 'table',
          id: 'yogic-breathing-practices',
          caption: 'Procedures of various yogic breathing practices (Saoji et al., 2018).',
          columns: ['Name of the practice', 'Method of practice'],
          rows: [
            {
              head: 'Kapalabhati',
              cells: [
                'Sitting with the back and neck erect, one should inhale through both nostrils and exhale rapidly, flapping the abdomen during each exhalation at a pace of 60–120 breaths/min.',
              ],
            },
            {
              head: 'Bastrika (Bellow’s breath)',
              cells: [
                'One should inhale and exhale quickly and forcefully without straining by flapping the abdomen. This should be practiced for up to 100 breaths.',
              ],
            },
            {
              head: 'Nadishodhana/Nadishuddhi (Alternate nostril breathing)',
              cells: [
                'With the right thumb, close the right nostril and inhale through the left nostril. Closing the left nostril, exhale through the right, following which inhalation should be done through the right nostril. Closing the right nostril, breathing out through the left nostril. This is one round. The procedure is repeated for the desired number of rounds.',
              ],
            },
            {
              head: 'Suryanuloma Viloma (Right uninostril breathing)',
              cells: [
                'Closing the left nostril, both inhalation and exhalation should be done through the right nostril, without altering the normal pace of breathing.',
              ],
            },
            {
              head: 'Chandranuloma Viloma (Left uninostril breathing)',
              cells: [
                'Procedure similar to Suryanuloma Viloma, breathing is done through the left nostril alone, by closing the right nostril.',
              ],
            },
            {
              head: 'Suryabhedana (Right nostril-initiated breathing)',
              cells: [
                'Closing the left nostril, inhalation should be done through the right nostril. At the end of inhalation, close the right nostril and exhale through the left nostril. This is one round. The procedure is repeated for the desired number of rounds.',
              ],
            },
            {
              head: 'Ujjayi (Psychic Breath)',
              cells: [
                'Inhalation and exhalation are done through the nose at a normal pace, with partial contraction of the glottis, which produces a light snoring sound. One should be aware of the passage of breath through the throat during the practice.',
              ],
            },
            {
              head: 'Bhramari (Female honeybee humming breath)',
              cells: [
                'After a full inhalation, closing the ears using the index fingers, one should exhale, making a soft humming sound similar to that of a female honeybee.',
              ],
            },
          ],
        },
        {
          kind: 'paragraph',
          text: 'Recent reviews and experimental studies on yogic breathing practices such as alternate nostril breathing and Bhastrika have demonstrated benefits across multiple physiological and psychological domains.',
        },
        {
          kind: 'table',
          id: 'key-findings',
          caption: 'The table below summarizes key findings in this area (Saoji et al., 2018).',
          columns: ['Domain', 'Benefits'],
          rows: [
            {
              head: 'Neurocognitive',
              cells: [
                'Improved attention, reaction time, working memory, and executive functioning. EEG changes indicate increased alpha activity, suggesting a state of relaxed alertness.',
              ],
            },
            {
              head: 'Autonomic Regulation',
              cells: [
                'Increased heart rate variability (HRV), lowered blood pressure, reduced sympathetic overactivity, enhanced parasympathetic tone.',
              ],
            },
            {
              head: 'Respiratory & Metabolic',
              cells: [
                'Improved lung capacity (FVC, FEV1), better oxygen utilization, increased antioxidant levels, improved energy efficiency.',
              ],
            },
            {
              head: 'Clinical Applications',
              cells: [
                'Symptom relief in asthma, hypertension, type 2 diabetes, anxiety, depression, and chronic fatigue. Reported reductions in perceived stress and emotional reactivity.',
              ],
            },
          ],
        },
        {
          kind: 'paragraph',
          text: 'You have the innate right to embrace self-study, austerity, and the development of a single-minded, focused mind. The secret to overcoming these challenges is perseverance and dedication. Your consistent practice will help you overcome obstacles on your spiritual path, just as a river traverses and overcomes every obstacle in its path, continuously flowing towards its final destination. This dedication reduces distractions and promotes clarity, turning into a source of happiness, tranquility, and delight. Your life becomes a real life experience, and even your death becomes a meaningful experience as a doorway to the divine (Tomar, 2024).',
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
          text: 'Findings indicate that mid-20th-century dialogues between psychoanalysts and Buddhist scholars were pivotal in positioning Buddhism as a psychological system rather than strictly a religion or philosophy. Alan Watts’ interpretation reinforces this by characterizing Buddhism as more akin to psychotherapy than traditional Western categories. The Buddha’s approach to suffering and mental well-being has been increasingly recognized in contemporary psychological discourse, portraying him as a pioneering figure in therapeutic thought. These insights collectively support the understanding of Buddha’s teachings as a psychotherapeutic model with enduring relevance across cultural and historical contexts (Aich, 2013).',
        },
        {
          kind: 'table',
          id: 'comparison',
          caption:
            'Comparison Between Indian and Western Psychological Perspectives on Duḥkha, Daurmanasya, Svasa, Prasvasa.',
          columns: ['Concept', 'Indian Psychology Perspective', 'Western Psychology Perspective'],
          rows: [
            {
              head: 'Duḥkha (Suffering/Distress)',
              cells: [
                'Rooted in Buddhist philosophy, life is inherently unsatisfactory due to craving and ignorance (First Noble Truth). Overcome via the Eightfold Path, mindfulness, and insight (Anderson, 2016).',
                'Seen as psychological distress includes anxiety, depression, and emotional dysregulation. Treated using CBT, MBCT, ACT, and positive psychology approaches (Salagame, 2014).',
              ],
            },
            {
              head: 'Daurmanasya (Dejection/Frustration)',
              cells: [
                'Mentioned in Yoga Sutras (1.31) as a hindrance (antarāya) to mental clarity. Caused by raga-dvesha (attachment-aversion). Addressed through dhyana, breath control, and inner awareness.',
                'Corresponds to mood disturbances, sadness, frustration, and anhedonia, elements of depressive disorders. Managed with emotion-focused or cognitive behavioral therapies.',
              ],
            },
            {
              head: 'Śvāsā and Praśvāsā (Breathing patterns/Breath control)',
              cells: [
                'In Yoga and Ayurveda, irregular breathing reflects mental agitation. Controlled through pranayama to achieve calmness, balance, and focus in meditation.',
                'Breathing dysregulation is linked to panic, anxiety, and stress responses. Therapies use breathwork (e.g., slow breathing, diaphragmatic techniques) to improve vagal tone and reduce arousal.',
              ],
            },
          ],
        },
      ],
    },
  ],
  references: [
    'aich-2013',
    'anderson-2016',
    'paikaray-2018',
    'salagame-2014',
    'saoji-2018',
    'shlokam-2020-yogasutra-1-31',
    'teasdale-chaskalson-2011',
    'tomar-2024',
    'yoga-sutras-patanjali',
    'yogapedia-2023-angamejayatva',
    'yogapedia-2023-shvasa-prashvasa',
  ],
  questionnaire: 'upa-vikshepa',
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [{ url: 'https://care4mind.org/upavikshepaprofiling/', retrieved: '2026-10-27' }],
    edits: [
      'IAST transliterated for the headword: “upa-vikṣepa”, from the page’s “Upa-Vikshepa” and “Upa Vikshepa”, with vikṣepa as the Vikshepa page writes it. The page prints “Upa Vikṣepa” only in its held-back score section. It prints no Devanagari for the headword, so none is stored.',
      'Sub-term forms split out of compounds, in their dictionary forms: “aṅgamejayatva”, “śvāsa” and “praśvāsa” from the page’s “śvāsapraśvāsa” and the Yoga Sūtra 1.31 verse’s “duḥkhadaurmanasyāṅgamejayatvaśvāsapraśvāsā”, and the Devanagari “दुःख”, “दौर्मनस्य”, “अङ्गमेजयत्व”, “श्वास” and “प्रश्वास” from its “दुःखदौर्मनस्याङ्गमेजयत्वश्वासप्रश्वासा”. “duḥkha” and “daurmanasya” are printed on the page. The sub-headings’ spellings (“Duhkha”, “Daurmanasya”, “Anggamejayatva”, “Shvasa”, “Prashvasa”) are kept as ASCII spellings.',
      'Verse heading dropped: “Shloka from Chapter 1, Sutra 31”. The verse shows its work and number, Yoga Sūtra 1.31, the work the census assigned it.',
      'Inline DharmaWiki links dropped, their words kept: “Vikshepa” and “citta-vikshepa” (to the Chitta Vikshepa part of its Chitta article), “adhyatmika”, “adhibhautika” and “Adhidaivika” (to its Roga article), and in the breathing-practices table “Kapalabhati”, “Bastrika”, “Nadishodhana”, “Nadishuddhi”, “Chandranuloma Viloma” and “Bhramari” (to its Pranayama article).',
      'The two tables after the last sub-heading (“Prashvasa”), the paragraph between them and the closing paragraph stay in the definition section, after the term blocks: they speak of breathing practice and of the challenges as a whole, not of praśvāsa alone.',
      'The page gives its tables no captions of their own; each takes the heading set just above it: “Procedures of various yogic breathing practices (Saoji et al., 2018).”, “The table below summarizes key findings in this area (Saoji et al., 2018).” and “Comparison Between Indian and Western Psychological Perspectives on Duḥkha, Daurmanasya, Svasa, Prasvasa.”.',
      'Interface text dropped: the “Introduction” and “References” labels, and the “Meaning:” label before the verse’s reading.',
      'Left out: the page’s “Overall Score indicator” section, which belongs to its Questionnaire and is listed there as held back.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page prints no IAST and no Devanagari for its headword: it writes “Upa-Vikshepa” and “Upa Vikshepa”, and “Upa Vikṣepa” only in its held-back score section. The record’s IAST, “upa-vikṣepa”, is transliterated from those; no Devanagari is stored. Confirm the form; nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The page gives no English gloss for upa-vikṣepa: its text speaks of “secondary distractions”, “byproducts” and “sub-distractions”, but gives none of them as the term’s meaning, so the Concept has no English name. Its five sub-headings give no gloss either, so the term blocks have none; the text and the comparison table pair some of the terms with English (“duḥkha (suffering)”, “tremors of the limbs (angamejayatva)”, “Daurmanasya (Dejection/Frustration)”), which stay where the page has them. Supply glosses or confirm none; nothing was written for them.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'Sub-term forms the page doesn’t print as words of their own: “aṅgamejayatva”, “śvāsa” and “praśvāsa”, split out of “śvāsapraśvāsa” and the Yoga Sūtra 1.31 compound, and all five Devanagari forms, split out of that verse’s compound. Confirm them; nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The Upa-Vikshepa Profiling page heads this verse “Shloka from Chapter 1, Sutra 31” and names no work there; it is stored as Yoga Sūtra 1.31, which its text is and which the page’s body names. Confirm the attribution.',
        ticket: 16,
      },
      {
        for: 'research-editor',
        note: 'The definition opens with five words (“Pain, Discomfort, Restlessness, Breath-Related Issues, Drowsiness.”), then calls “Sadness, pain, restlessness, and trouble breathing” the five sub-distractions, naming four; the section’s sub-headings name five. Kept as written; nothing was changed.',
      },
      {
        for: 'research-editor',
        note: 'The text mentions “a study by Vyas et al.” with no year, and the page’s reference list has no Vyas; the paragraph ends citing Paikaray et al. (2018). Kept as written; nothing was looked up.',
        ticket: 17,
      },
    ],
  },
})
