import { defineConcept, type SanskritName } from '@/content/schema'

// Each obstacle's IAST and Devanagari come from the page's own shloka (Yoga Sūtra 1.30),
// which names all nine in one compound. The ASCII spellings are the page's headings.
const vyadhi: SanskritName = { iast: 'vyādhi', devanagari: 'व्याधि', ascii: ['Vyadhi'] }
const styana: SanskritName = { iast: 'styāna', devanagari: 'स्त्यान', ascii: ['Steyan', 'Styana'] }
const alasya: SanskritName = { iast: 'ālasya', devanagari: 'आलस्य', ascii: ['Alasya'] }
const samsaya: SanskritName = { iast: 'saṃśaya', devanagari: 'संशय', ascii: ['Sanshay', 'Samsaya'] }
const pramada: SanskritName = {
  iast: 'pramāda',
  devanagari: 'प्रमाद',
  ascii: ['Pramad', 'Pramada'],
}
const avirati: SanskritName = { iast: 'avirati', devanagari: 'अविरति', ascii: ['Avirati'] }
const bhrantidarsana: SanskritName = {
  iast: 'bhrāntidarśana',
  devanagari: 'भ्रान्तिदर्शन',
  ascii: ['Bhranti Darshan', 'Bhranti-darsana'],
}
const alabdhabhumikatva: SanskritName = {
  iast: 'alabdhabhūmikatva',
  devanagari: 'अलब्धभूमिकत्व',
  ascii: ['Alabdhi', 'Alabdha-bhumikatva'],
}
const anavasthitatva: SanskritName = {
  iast: 'anavasthitatva',
  devanagari: 'अनवस्थितत्व',
  ascii: ['Anvastitva', 'Anavasthitatva'],
}

export default defineConcept({
  kind: 'concept',
  slug: 'vikshepa',
  name: {
    term: { iast: 'vikṣepa', devanagari: 'विक्षेप', ascii: ['Vikshepa'] },
    english: 'Distraction',
  },
  summary:
    'The challenges a seeker encounters on the path to liberation. The Yoga Sūtra names nine obstacles, or diversions, on the yoga path.',
  topics: { primary: 'mind' },
  verses: [
    {
      passage: 'yoga-sutra/1.30',
      translation: 'vikshepa',
      meaning:
        'The obstacles that disturb the mind and hinder the path of Yoga include physical illness, mental dullness, doubt, carelessness, laziness, attachment to sensual pleasures, distorted or false understanding, failure to reach a deeper state of concentration, and an inability to remain steady once that state is reached. These distractions shake the mind and become barriers to inner stillness.',
    },
    {
      passage: 'vedanta-sara/5.211',
      translation: 'vikshepa',
      meaning:
        'When the mind doesn’t stay anchored in the undivided, absolute reality (Akhanda Vastu), and instead leans on something else like passing thoughts, desires, or external support that shift is called vikshepa, or distraction. It’s the tendency of the mind to move away from the Self and get pulled toward other objects or concerns. This unsteadiness is what interrupts deep focus and keeps one from resting fully in the truth of non-dual awareness.',
    },
  ],
  sections: [
    {
      id: 'what-is-viksepa',
      heading: 'What is vikṣepa?',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Vikshepa refers to the challenges a seeker encounters on his path to achieving his ultimate objective, “liberation” (Tomar, 2024). According to Yoga Sutra 1.30–1.32, there are nine obstacles, or diversions, in the yoga path. These include illness, procrastination, doubt, negligence, mental laziness, craving, misperception, failure, and instability. Furthermore, these obstacles have the following five consequences: self-pain for self-growth, substantial pain stemming from external sources such as natural disasters, and irregularities in breathing patterns (Bhavanani, 2012).',
        },
        {
          kind: 'paragraph',
          text: '“Obstacles in the path” of yoga mentioned in Zen proverb, are not merely barriers to be removed but can be seen as essential parts of the journey. They often bring discomfort and distraction, slowing down progress toward mental stillness and self-realization. However, these challenges also offer valuable opportunities for self-discovery, inner growth, and transformation. Just as the saying “the obstacle is the path” suggests, facing and working through these difficulties can lead to greater resilience, awareness, and strength. Instead of trying to eliminate them outright, the yogic approach encourages us to accept these impediments as part of life and develop the insight and discipline needed to navigate them. In doing so, they become not just hurdles, but meaningful steps toward a deeper connection with the Self (Tomar, 2024).',
        },
        {
          kind: 'paragraph',
          text: 'Distraction is the act of diverting focus from the job of primary interest by means of a stimulus or objective (APA Dictionary of Psychology, n.d.-b).',
        },
      ],
    },
    {
      id: 'distraction-at-the-body-level',
      heading: 'Distraction at the body level',
      blocks: [
        {
          kind: 'term',
          id: 'vyadhi',
          term: vyadhi,
          gloss: 'Illness',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Vyadhi is the term for illness brought on by an imbalance of the body’s elements and vital fluids. Illness or sickness may cause our body to fail to support us. We will be unable to practise yoga; therefore, we must always maintain a healthy diet, get regular exercise, and get enough sleep (Tomar, 2024).',
            },
            {
              kind: 'paragraph',
              text: 'Vyadhi arises due to the vitiation of Doṣas, and its understanding requires detailed examination of factors such as causative agents (prakopaṇam), origin (yoni), site (adhiṣṭhānam), symptoms (ātmanam), complications (upadrava), and prognosis (udarkam), among others (Sharma et al.).',
            },
          ],
        },
      ],
    },
    {
      id: 'distractions-at-both-body-and-mental-level',
      heading: 'Distractions at both body and mental level',
      blocks: [
        {
          kind: 'term',
          id: 'styana',
          term: styana,
          gloss: 'Dullness',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Mental and physical dullness, the incapacity to carry out a task even when one is willing to do it. You should always be learning something new in order to get past this. Your resume should be updated every six months if you are employed. For your own personal development, you should also study new things. Try to complete a difficult task in less time, especially if you are skilled at it (Tomar, 2024).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'alasya',
          term: alasya,
          gloss: 'Laziness',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Incapacity to carry out desired acts due to physical and mental fatigue. Exercise every day to overcome inertia or lethargy. Avoid sleeping for extended periods of time during the day, get up and take a few steps, and avoid sitting still for longer than twenty minutes (Tomar, 2024).',
            },
          ],
        },
      ],
    },
    {
      id: 'distractions-at-the-mental-level',
      heading: 'Distractions at the mental level',
      blocks: [
        {
          kind: 'term',
          id: 'samsaya',
          term: samsaya,
          gloss: 'Doubt',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Indecision or uncertainty about our own abilities and potential. We naturally begin to doubt ourselves when we don’t do something important. Either fulfil the promise you made to yourself or make a commitment to yourself and then follow through on it to get rid of it. A deadline indicates that I’m either dead or on that side of the queue. Talking to yourself will boost your self-esteem. Take note of how you sit and speak. Sit with your back straight at all times. Your mental mood is profoundly impacted by your physical posture (Tomar, 2024).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'pramada',
          term: pramada,
          gloss: 'Negligence',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Not working hard enough for the greater good. You may lessen this by creating a schedule, giving each task a specific amount of time, and living your life in accordance with it (Tomar, 2024).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'avirati',
          term: avirati,
          gloss: 'Cravings',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Distractions brought on by object attachment. You should use your senses as little as possible to prevent this. See, hear, and consume just that which advances our objective. Engage in mental fasting; for example, if you frequently check your phone, fast from it. Similarly, if you enjoy eating sweets, fast from them (Tomar, 2024).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'bhrantidarsana',
          term: bhrantidarsana,
          gloss: 'Misconception',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Considering the incorrect path to be the correct way and the correct path to be the incorrect path. Seek a guru’s assistance to get rid of this. If you don’t have a guru, read literature and surround yourself with nice people (Tomar, 2024).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'alabdhabhumikatva',
          term: alabdhabhumikatva,
          gloss: 'Failure',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Failing to accomplish higher stages of the exercise. Eliminating the above-stated destruction will lower the risks of failure (Tomar, 2024).',
            },
          ],
        },
        {
          kind: 'term',
          id: 'anavasthitatva',
          term: anavasthitatva,
          gloss: 'Instability',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Inability to sustain, once acquired, a level of practice or excellence. A person will be more steady in maintaining a degree of practice or perfection if all of the above-mentioned devastation is eliminated (Tomar, 2024).',
            },
          ],
        },
      ],
    },
    {
      id: 'consequences-of-these-obstacles',
      heading: 'Consequences of these obstacles',
      blocks: [
        {
          kind: 'paragraph',
          text: 'These obstacles are described as natural and expected on the path of inner development. They begin as distractions (chitta-vikshepa), diverting attention away from the chosen object of focus, and if allowed to persist, they deepen into more entrenched obstacles (antarayah), interfering with mental steadiness and progress.',
        },
        {
          kind: 'paragraph',
          text: 'Four psychological and physiological consequences typically accompany these obstacles. These include mental or physical pain (duhkha), sadness, frustration, or despair (daurmanasya), restlessness or unsteadiness of the body (angamejayatva), and irregularities in the breath (shvasa-prashvasa). These symptoms act as surface indicators of deeper internal disturbances. While the nine obstacles may remain subtle and harder to observe, the four consequences are often easier to notice, making them useful signs for identifying when the mind has drifted from its path. Their presence points to an underlying loss of focus, and they serve as practical cues for self-awareness and corrective action (Yoga Sutras of Patanjali 1.30-1.32: Obstacles and Solutions, n.d.-b).',
        },
        {
          kind: 'paragraph',
          text: 'These are not just casual distractions but structural challenges of the mind, rooted in samskāras (latent impressions). The absence of inner discipline and persistent ego involvement are seen as fueling these obstacles (Nine Obstacles in Meditation – Darshan of Swami Krishnananda in 1996, n.d.).',
        },
      ],
    },
    {
      id: 'solution-one-pointedness-of-mind',
      heading: 'Solution: one-pointedness of mind',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The central solution to both the obstacles and their consequences: the cultivation of one-pointedness (eka-tattva-abhyasa). This practice involves training the mind to consistently return to a single chosen object, idea, or truth whether a mantra, breath, philosophical principle, or meaningful image. By anchoring the mind, this focused attention helps to prevent distraction and disintegration of mental energy. One-pointedness is not merely a meditation technique but a foundational orientation that supports psychological stability, emotional clarity, and spiritual insight. It also complements the foundational yogic principles of sustained practice (abhyasa) and non-attachment (vairagya), working together to create the conditions for deeper self-awareness and meditative absorption (Yoga Sutras of Patanjali 1.30-1.32: Obstacles and Solutions, n.d.-b).',
        },
        {
          kind: 'paragraph',
          text: 'These states can be addressed through steady practice (abhyāsa) and non-attachment (vairāgya), offering a traditional therapeutic lens to modern mental distractions (Jain & Diwakar, 2019). Cultivating viveka (discriminative knowledge) is key to overcoming these blockages (Nine Obstacles in Meditation – Darshan of Swami Krishnananda in 1996, n.d.).',
        },
      ],
    },
    {
      id: 'indian-and-western-concepts',
      heading: 'Indian and Western concepts',
      role: 'comparison',
      blocks: [
        {
          kind: 'paragraph',
          text: 'While both Indian and Western psychologies address similar experiential phenomena, their underlying frameworks differ. Yoga psychology sees these obstacles as barriers to spiritual liberation, rooted in metaphysical ignorance, whereas Western psychology views them as mental or behavioral dysfunctions to be treated for psychological well-being (Schleim, 2025).',
        },
        {
          kind: 'table',
          id: 'comparison',
          caption:
            'Comparison between Indian and Western concepts related to vikṣepa and its associated obstacles (Schleim, 2025).',
          columns: [
            'Obstacle',
            'Indian psychology',
            'Western psychology',
            'Key conceptual difference',
          ],
          rows: [
            {
              head: { term: vyadhi, gloss: 'Illness' },
              cells: [
                'Physical or mental disease that obstructs spiritual practice',
                'Physical illness, mental disorders (e.g., depression, anxiety)',
                'Seen as a distraction from sādhanā (practice); not merely a clinical issue',
              ],
            },
            {
              head: { term: styana, gloss: 'Mental stagnation' },
              cells: [
                'Inertia or dullness of mind preventing concentration',
                'Apathy, lack of motivation, procrastination',
                'Considered a result of tamas (inertia) disrupting mental clarity',
              ],
            },
            {
              head: { term: samsaya, gloss: 'Doubt' },
              cells: [
                'Intellectual confusion or lack of conviction in the practice or the path',
                'Indecision, self-doubt, low self-efficacy',
                'Rooted in avidyā (ignorance); treated with clarity and śraddhā (faith)',
              ],
            },
            {
              head: { term: pramada, gloss: 'Negligence' },
              cells: [
                'Carelessness or loss of mindfulness in practice',
                'Distraction, lack of discipline',
                'Opposed to smṛti (remembrance); seen as dangerous to progress',
              ],
            },
            {
              head: { term: alasya, gloss: 'Laziness' },
              cells: [
                'Laziness of body and mind due to dominance of tamas',
                'Fatigue, low energy, low motivation',
                'Yoga views it as an internal obstacle requiring willful counteraction',
              ],
            },
            {
              head: { term: avirati, gloss: 'Craving, sensuality' },
              cells: [
                'Attachment to sensory pleasures; inability to detach from indulgence',
                'Addiction, impulsivity, hedonistic drives',
                'Linked to rāga (attachment); seen as a barrier to inner focus',
              ],
            },
            {
              head: { term: bhrantidarsana, gloss: 'Misconception' },
              cells: [
                'False knowledge or misunderstanding of reality',
                'Cognitive distortions, delusional beliefs',
                'Rooted in incorrect perception (viparyaya); corrected through viveka (discernment)',
              ],
            },
            {
              head: { term: alabdhabhumikatva, gloss: 'Non-attainment' },
              cells: [
                'Failure to reach or maintain a state of progress in practice',
                'Skill failure, plateau in performance, imposter syndrome',
                'Not just performance failure, but a deeper block in sādhanā due to inner obstacles',
              ],
            },
            {
              head: { term: anavasthitatva, gloss: 'Instability' },
              cells: [
                'Inability to remain in a stable state of concentration or realization',
                'Regression, relapse, lack of consistency',
                'Seen as a wavering mind; stability (sthiti) is a spiritual milestone',
              ],
            },
          ],
        },
      ],
    },
  ],
  references: [
    'apa-distraction',
    'bhavanani-2012',
    'gurubhaktananda-2018',
    'jain-diwakar-2019',
    'krishnananda-1996',
    'schleim-2025',
    'sharma-pareek',
    'shlokam-2025',
    'tomar-2024',
    'swamij-1-30',
  ],
  questionnaire: 'vikshepa',
  reviewStatus: 'drafted-not-reviewed',
  provenance: {
    sources: [{ url: 'https://care4mind.org/vikshepa/', retrieved: '2026-10-27' }],
    edits: [
      // The front-end foundation's edits (planning ticket 21), kept as it wrote them.
      'The first shloka was headed “Bhagavad Gita (Chapter 1, Sutra 30)”; its text and verse number are Yoga Sūtra 1.30, as the page’s own body says. Relabelled; the Research editor should confirm.',
      'Obstacle names in IAST and Devanagari are taken from the page’s Yoga Sūtra 1.30 shloka. The page’s headings used other forms (for example “Steyan- Steya”, “Alabdhi- Alābdhi”, “Anvastitva- Anavasthitva”); those are kept as ASCII spellings.',
      'Anusvara written with a dot above (U+1E41) normalised to ṃ, as in saṃśaya.',
      'Typos fixed: “Negliegence” → “Negligence”, “Yogi Sutra” → “Yoga Sutra”, “above- stated” → “above-stated”, “consequences that typically” → “consequences typically”.',
      'Left out: the page’s High, Moderate and Low score indicators, which belong to its Questionnaire, and its inline links to dharmawiki.org.',
      'Reference list: one duplicated author run removed from Gurubhaktananda (2018); the Tomar (2024) Google Books link shortened to the book id; the APA link moved to https.',
      'The link to the KarmaYoga Scale is added for this preview (several of its items are about distraction at work); the current page has none, and the content-links ticket decides real links.',
      'Not changed, for the Research editor: the first paragraph says “five consequences” and lists three; the Vedānta Sāra shloka has “वास्तु” where vastu may be meant; Sharma & Pareek has no year or journal.',
      // Listed when the record was re-homed into content v1.
      'Heading shortened: “What is the definition of Vikshepa- Vikṣepa (Distraction) ?” → “What is vikṣepa?”.',
      'Heading reworded: “Indian vs Western concept” → “Indian and Western concepts”.',
      'Table caption: “related to Vikshepa and its associated obstacles” → “related to vikṣepa and its associated obstacles”.',
      'Table row gloss: “Craving/Sensuality” → “Craving, sensuality”.',
      'Obstacle names split out of the compound in the page’s Yoga Sūtra 1.30 shloka, in their dictionary forms: “आलस्य”, “अविरति”, “अलब्धभूमिकत्व”, “अनवस्थितत्व”, “bhrāntidarśana” and “alabdhabhūmikatva”.',
      'Interface text dropped: the “Introduction” and “References” labels.',
      // Listed when verify first checked the record (ticket 02): a fix the foundation made.
      'Typo fixed: “above- mentioned” → “above-mentioned”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The summary was condensed by the front-end foundation from the page’s first paragraph, not taken from it word for word. Approve it, or replace it with the page’s own sentences.',
      },
      {
        for: 'research-editor',
        note: 'The first paragraph says “five consequences” and lists three; not changed.',
      },
      {
        for: 'research-editor',
        note: 'The text cites “(Sharma et al.)” for Sharma & Pareek, a paper by two authors with no year; not changed.',
        ticket: 17,
      },
    ],
    drafted: ['summary'],
  },
})
