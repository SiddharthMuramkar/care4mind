import { defineConcept } from '@/content/schema'

// The /momentumofspiritualpractice/ page. It has no Sanskrit headword, so the Concept is named by
// its English title; saṃvega, from its Yoga Sūtra 1.21, is flagged as a possible headword. The
// definition section opens with a quotation, so the summary is a sentence of the page's Meaning
// of Yoga Sūtra 1.22.
export default defineConcept({
  kind: 'concept',
  slug: 'momentum-of-spiritual-practice',
  name: { english: 'Momentum of Spiritual Practice' },
  summary:
    'In short, the outcome of yoga is directly related to how deeply and earnestly a person engages with the path.',
  topics: { primary: 'practice' },
  verses: [
    {
      passage: 'yoga-sutra/1.21',
      translation: 'momentumofspiritualpractice',
      meaning:
        'This sutra from Patanjali’s Yoga Sutras means that progress toward the goal, whether it’s self-realization, mastery, or inner stability, happens quickly for those who have intense enthusiasm, determination, and commitment. The word tīvra-saṃvegānām refers to people who practice with strong urgency and unwavering effort. In contrast to those who approach the path casually or half-heartedly, individuals with deep passion and persistent drive reach their destination much faster. It highlights that the quality and intensity of effort matter more than the mere passage of time.',
    },
    {
      passage: 'yoga-sutra/1.22',
      translation: 'momentumofspiritualpractice',
      meaning:
        'This sutra explains that even among those who practice yoga, the speed and depth of progress vary depending on the intensity of their effort and commitment. Mṛdu, madhya, and adhimātra refer to mild, moderate, and intense levels of practice. Someone who practices casually (mild) will advance slowly, while one with consistent effort (moderate) progresses faster. Those who practice with great intensity and dedication (intense) achieve the highest and quickest results. In short, the outcome of yoga is directly related to how deeply and earnestly a person engages with the path.',
    },
  ],
  sections: [
    {
      id: 'what-is-the-momentum-of-spiritual-practice',
      heading: 'What is the Momentum of Spiritual Practice?',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Such a qualified pupil scorched with the fire of an endless round of birth, death, etc., should repair – just as one with one’s head on fire rushes to a lake – with presents in hand, to a Guru, learned in the Vedas and ever living in Brahman, and serve him – as the following and other Srutis say: “Let him order to understand this repair with fuel in his hand to a spiritual guide who is learned in the Vedas and lives entirely in Brahman” (Mundaka Upanishad 1-2-12). – Vedanta Saara 1.30 (Tomar, 2024).',
        },
        {
          kind: 'paragraph',
          text: 'Psychology and spirituality share a deep yet evolving relationship, as both seek to understand the human experience and meaning-making process. Traditionally, psychology, rooted in scientific paradigms, maintained a cautious stance toward spirituality. However, recent developments such as positive psychology, which focuses on growth, well-being, and strengths, have created space for spiritual constructs within psychological inquiry. Integrating spirituality into psychological frameworks enriches our understanding of resilience, adaptation, and purpose, making it a vital component of holistic health and therapeutic practice (Sargeant & Yoxall, 2023).',
        },
        {
          kind: 'paragraph',
          text: 'A study found that nurses’ spiritual perspectives and years of experience strongly influence how often they provide spiritual care, while knowledge of recovery-oriented practice does not. Nurses who identified as spiritual and religious offered such care more frequently, suggesting that fostering spiritual development may enhance mental health recovery support (Neathery et al., 2019).',
        },
      ],
    },
    {
      id: 'challenges',
      heading: 'Challenges',
      blocks: [
        {
          kind: 'paragraph',
          text: 'There is a significant challenge in providing spiritual care, including a notable gap between its perceived importance and actual practice. Major barriers identified were time constraints, insufficient education, and lack of organizational support, which hinder the integration of spirituality into healthcare settings. Additionally, cultural differences and diverse religious beliefs complicate the delivery of consistent spiritual care (Lee & Park, 2025). Students often face spiritual dissonance when transitioning to college, struggling to reconcile past beliefs with new perspectives. This conflict can be intensified for LGBTQ+ students and women confronting traditional norms. Many report feeling silenced in expressing spiritual views due to fear of judgment or lack of acceptance. Limited access to prayer spaces, dietary accommodations, and inclusive groups further restricts spiritual engagement on campus (Staples et al., 2022). Children’s spiritual growth is often hindered by multiple barriers. The first involves physical and emotional harm or constant stress, which undermines their sense of safety and belonging. Discrimination based on gender, race, class, poverty, disability, or religion further exacerbates these challenges. The second barrier stems from societal expectations and macro-cultural influences, such as materialism, consumerism, and unrealistic ideals of success and beauty, which discourage reflection and promote superficial values. School policies focused on performance and competitiveness narrow the curriculum, leaving little space for spiritual exploration. The third barrier is individual loss of curiosity and fear of embarrassment, often reinforced by overprotective or rigid adults who silence children’s voices (Eaude, 2024).',
        },
      ],
    },
    {
      id: 'solutions',
      heading: 'Solutions',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Findings highlight the need for standardized training, institutional backing, and culturally sensitive approaches to overcome these obstacles in the workplace (Lee & Park, 2025). Supportive faculty and staff address these issues through open conversations, inclusive spaces for prayer and reflection, and accommodations for religious practices. Interfaith dialogues, student-led initiatives, and role modeling by staff foster belonging and acceptance. Advocacy for policy changes and cultural sensitivity helps create an environment where students can explore and practice spirituality freely (Staples et al., 2022). Children can overcome these barriers and require environments that foster agency, resilience, empathy, and reflectiveness. Adults play a key role by creating inclusive, hospitable spaces where children feel safe and can explore big questions without fear. This involves challenging narrow cultural definitions of success and possession, allowing children to question assumptions and encouraging open dialogue. A relational and holistic approach, where adults guide rather than control, is essential. While structural barriers like societal attitudes and rigid policies are hardest to change, sensitive and flexible adults can minimize their impact by prioritizing emotional connection and opportunities for curiosity and critical thinking (Eaude, 2024).',
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
            'Comparative table of Indian vs Western concepts for Momentum of Spiritual Practice (Lau et al., 2020).',
          columns: ['Category/Themes', 'Western Perspective (USA)', 'Indian Perspective (India)'],
          rows: [
            {
              head: 'Religious Affiliation',
              cells: [
                '61% endorse a religious denomination; 48% identify as Christian.',
                '96% endorse a religious denomination; 63% identify as Hindu.',
              ],
            },
            {
              head: 'Spirituality Definition',
              cells: [
                'Personal interaction with the transcendent, life meaning, coping with hardship; distinction from formal religion.',
                'Emphasis on transcendence, universal connectedness, integration of faith into daily life.',
              ],
            },
            {
              head: 'Importance of Spirituality',
              cells: [
                'Over 20% report spirituality as highly important.',
                '50% report spirituality as highly important.',
              ],
            },
            {
              head: 'Religious Figures',
              cells: [
                'Focus on Christian figures (Jesus, angels).',
                'Frequent references to Hindu deities, Guru (spiritual master), and religious figures.',
              ],
            },
            {
              head: 'Rituals and Practices',
              cells: [
                'Contemplative practice common; prayer and meditation; nature and animals important; less mention of daily rituals.',
                'Daily rituals, prayer, fasting, temple visits, yoga, meditation, and spiritual professionals are central.',
              ],
            },
            {
              head: 'Metaphysical Experience',
              cells: [
                'High prevalence: extrasensory experiences (clairvoyance, precognition, apparitions); nature and animal-linked spiritual events.',
                'Common: extrasensory experiences; faith and energy healing, miracles, ancestral dreams and guidance.',
              ],
            },
            {
              head: 'Religious Conversion',
              cells: [
                'More prevalent (23%); individual choice and exploration; “spiritual marketplace”.',
                'Less prevalent (7%); collective, family-centered faith traditions; faith used for coping with adversity.',
              ],
            },
            {
              head: 'Role of Ancestors',
              cells: [
                'Frequent in dreams and as spiritual guides; omens and comfort during grief.',
                'Ancestors in dreams, guidance, rituals (less than in China); ancestral worship less common, but ancestor mentions present.',
              ],
            },
            {
              head: 'Pathways to Spirituality',
              cells: [
                'Personal experience, religious conversion, reading of holy texts, nature immersion, symbolic encounters.',
                'Personal experience, prayer, Guru’s guidance, ritual, faith healing, family and community influence.',
              ],
            },
            {
              head: 'Social Context',
              cells: [
                'Spirituality is often individualistic; influenced by secularization and culture of choice.',
                'Spirituality interwoven with family, community, tradition, and public religious practices.',
              ],
            },
            {
              head: 'Expressive Narrative Style',
              cells: [
                'Shorter responses; sometimes agnostic or non-religious; apologetic for sounding “too religious”.',
                'Richer, longer responses; spirituality intertwined with adversity, healing, and daily routines.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'absence-of-spirituality',
      heading: 'Absence of Spirituality',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Without spiritual nourishment, individuals may experience loss of meaning, existential distress, and become lost in materialism and worldliness. The soul can suffer neuroses and illnesses when cut off from a sense of connection to ultimate reality and nature (Ryff, 2021). Avoiding existential anxieties by disengaging from spirituality can increase feelings of isolation, alienation, and trap individuals in cycles of superficial achievements lacking deep meaning (Cucchi & Qoronfleh, 2025). Lack of spiritual beliefs or practices is linked to suicidal ideation and attempts, associated with feelings of aimlessness, poor relationships, lack of dignity, and burden of shame (Ghahramani et al., 2025). Spiritual struggles or lack of supportive spiritual frameworks can worsen mental health challenges, increase depression, anxiety, feelings of guilt, and stigma, and intertwine with psychiatric symptoms (Milner et al., 2019).',
        },
      ],
    },
  ],
  references: [
    'cucchi-qoronfleh-2025',
    'eaude-2024',
    'fopka-kowalczyk-2022',
    'ghahramani-2025',
    'lau-2020',
    'lee-park-2025',
    'milner-2019',
    'neathery-2019',
    'ryff-2021',
    'sargeant-yoxall-2023',
    'shlokam-2020-yogasutra',
    'staples-2022',
    'tomar-2024',
  ],
  questionnaire: 'momentum-of-spiritual-practice',
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [
      { url: 'https://care4mind.org/momentumofspiritualpractice/', retrieved: '2026-10-27' },
    ],
    edits: [
      'Named by its English title, the page title “Momentum of Spiritual Practice”. The page gives no Sanskrit headword; saṃvega, from its Yoga Sūtra 1.21, may be one (flagged).',
      'The heading over the verses, “Shloka for Momentum of Spiritual Practice from Chapter 1, Sutra 21,22”, is left out: each verse is shown with its work and number, Yoga Sūtra 1.21 and 1.22, which the heading doesn’t name (flagged). The transliterations the page prints as sub-headings are the passages’.',
      'Typo fixed: “ad ever living” → “and ever living”.',
      'Stray text removed from the comparison table, where two cells ended with a file name: “importantpaste.txt.” → “important.” (flagged).',
      'The heading over the comparison table, “Comparative table of Indian vs Western concepts for Momentum of Spiritual Practice (Lau et al., 2020).”, is its caption; the table’s first row is its column headings.',
      'Held back in the Questionnaire momentum-of-spiritual-practice, described and never quoted: the page’s “Overall Score indicator” section, with its High, Moderate and Low “Score Wise Category Description”, and its note on the source they were referred from.',
      'Interface text dropped: the “Introduction” and “References” labels, and the “Meaning:” labels before the verses’ readings.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page gives no Sanskrit headword: the Concept is named by its English title, “Momentum of Spiritual Practice”. A possible headword is saṃvega, from the page’s Yoga Sūtra 1.21 (“tīvrasaṃvegānāmāsannaḥ”), whose Meaning says “tīvra-saṃvegānām” “refers to people who practice with strong urgency and unwavering effort”. Decide whether to name the Concept by it. Nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The Momentum of Spiritual Practice page heads its two verses “Chapter 1, Sutra 21,22” and names no work there; they are stored as Yoga Sūtra 1.21 and 1.22, which their text is and which the page’s Meaning calls “Patanjali’s Yoga Sutras”. Confirm the attribution.',
        ticket: 16,
      },
      {
        for: 'research-editor',
        note: 'The quotation that opens “What is the Momentum of Spiritual Practice?” reads “Let him order to understand this repair with fuel in his hand”, which seems to lack a word. Left as the page has it; nothing was looked up.',
      },
      {
        for: 'research-editor',
        note: 'Two cells of the comparison table’s “Importance of Spirituality” row ended with a stray file name, “paste.txt”, removed as listed. The figures are as the page gives them; nothing was looked up.',
      },
      {
        for: 'research-editor',
        note: 'The reference list includes Fopka-Kowalczyk et al. (2022), which only the held-back note on the score indicators cites. It stays on the Concept’s list; decide whether to keep it.',
        ticket: 17,
      },
    ],
  },
})
