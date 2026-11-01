import { defineConcept } from '@/content/schema'

// The /spiritualpractitionerprofiling/ page. It has no Sanskrit headword, so the Concept is
// named by its English title (flagged). Its five verses are the Sādhana Pañcakam's, which the
// page attributes to Adi Sankaracharya: the work's record keeps that attribution.
export default defineConcept({
  kind: 'concept',
  slug: 'spiritual-practitioner',
  name: { english: 'Spiritual practitioner' },
  summary:
    'Mastery in any endeavour is attained through consistent practice. By repeatedly engaging in a specific practice, it gradually transitions from conscious effort to becoming ingrained in the unconscious mind.',
  keywords: ['spirituality', 'practice', 'sadhana', 'growth', 'wellbeing', 'community'],
  topics: { primary: 'practice' },
  verses: [
    {
      passage: 'sadhana-panchakam/1',
      translation: 'spiritualpractitionerprofiling',
      meaning:
        'The verse teaches a simple path for inner growth: keep studying the scriptures, perform your duties as an offering to the divine, and let go of desires for rewards. Purify your mind by avoiding harmful actions and recognize that worldly pleasures are fleeting and mixed with sorrow. With steady effort, turn inward to seek the true Self, and free yourself from worldly attachments to move closer to liberation.',
    },
    {
      passage: 'sadhana-panchakam/2',
      translation: 'spiritualpractitionerprofiling',
      meaning:
        'This verse advises: keep the company of wise and noble people, strengthen your devotion to God, and cultivate virtues like peace and self-control. Give up selfish, desire-driven actions, and seek guidance from a true teacher, serving him with humility. Meditate on the sacred syllable Om, and listen carefully to the teachings of the Upanishads to gain knowledge of the ultimate truth.',
    },
    {
      passage: 'sadhana-panchakam/3',
      translation: 'spiritualpractitionerprofiling',
      meaning:
        'This verse guides us to reflect deeply on the teachings of the Upanishads and rely on their vision of truth. Avoid fruitless debates and wrong logic, instead follow reasoning that aligns with scripture. Hold firmly to the awareness “I am Brahman,” let go of pride, drop the false idea that the body is the Self, and refrain from arguing with the wise.',
    },
    {
      passage: 'sadhana-panchakam/4',
      translation: 'spiritualpractitionerprofiling',
      meaning:
        'This verse teaches simplicity and endurance: treat hunger like an illness and accept food received as alms without craving for taste. Be content with whatever comes by fate, bear heat, cold, and other opposites with patience, avoid idle talk, cultivate detachment, and neither depend on nor react strongly to others’ kindness or harshness.',
    },
    {
      passage: 'sadhana-panchakam/5',
      translation: 'spiritualpractitionerprofiling',
      meaning:
        'This verse advises: live happily in solitude, steady the mind in the Supreme, and realize the all-pervading Self while seeing the world as unreal before it. Let past karmas dissolve, avoid creating new ones through wisdom, accept and exhaust whatever prarabdha karma unfolds, and finally remain established in the awareness “I am Brahman.”',
    },
  ],
  sections: [
    {
      id: 'what-is-the-definition-of-spiritual-practitioner-profiling',
      heading: 'What is the definition of Spiritual Practitioner Profiling?',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Mastery in any endeavour is attained through consistent practice. By repeatedly engaging in a specific practice, it gradually transitions from conscious effort to becoming ingrained in the unconscious mind. Once integrated into the unconscious, it operates effortlessly from that deep reservoir. Focus, persistence, dedication, and sincerity are essential qualities for effective practice. One continues to practise till reaching a point of no return, where the practice becomes an inherent part of one’s being (Tomar, 2024).',
        },
        {
          kind: 'paragraph',
          text: 'Findings suggest that spirituality and character go hand in hand, that higher levels of the conjoint spirituality and character or “spiritually grounded character” correspond to greater wellbeing and may be generated or supported by a formal religious identification, practice, and community (Ford et al., 2023). Such profiling not only illuminates the psychological, ethical, and behavioral characteristics of spiritual practitioners but also contextualizes their influence on community well-being, inter-personal relationships, and holistic health (Sekagya et al., 2024). A study identified five spiritual profiles: non-seeking, socially disconnected, spiritual emergence, virtuous humanist, and spiritually integrated, across China, India, and the U.S. Higher existential engagement but lower personal growth and purpose predicted spiritual emergence, while higher growth and purpose predicted spiritual integration. Spiritually integrated individuals showed the lowest depression, anxiety, and substance dependence, along with the highest positive psychology. In contrast, spiritual emergence was linked to the highest depression, anxiety, and substance dependence, suggesting that struggle may be a developmental stage on the path toward mature spiritual well-being (Choi et al., 2020). More engaged religiousness/spirituality profiles showed better mental health indicators, providing an empirical basis to profile spiritually active populations and anticipate associated health patterns (Park et al., 2011). Individuals with stronger daily spiritual experiences and communal practice showed higher presence of meaning, informing youth-focused profiling for education or campus services (Kaufman et al., 2022).',
        },
      ],
    },
    {
      id: 'applications',
      heading: 'Applications',
      role: 'applications',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Spiritual practitioners find applications in counseling, spiritual direction, healthcare, and community organization. For example, integrative therapy programs assess spiritual competencies to align patient care with practitioner strengths (Malviya & Greenham, 2025). In traditional contexts, profiling informs community acceptance and the division of spiritual labor (Sekagya et al., 2024). Psychometric, such as the use of the Spiritual Orientation Inventory or VIA Character Strengths survey, supports developmental feedback for continued practitioner growth (Padigapati & Chandraiah, 2020).',
        },
      ],
    },
    {
      id: 'absence-of-spiritual-practitioner-profiling',
      heading: 'Absence of Spiritual Practitioner Profiling',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Lack of robust profiling can contribute to role confusion, ethical lapses, or superficial spiritual engagement. The absence of systematic assessment may hinder practitioner legitimacy, dilute traditional knowledge, and create barriers to interdisciplinary collaboration. Without standardized profiling, practitioners may be inadequately recognized or supported, resulting in reduced service quality and diminished community trust (Warber et al., 2015).',
        },
      ],
    },
    {
      id: 'indian-vs-western-views',
      heading: 'Indian vs Western Views',
      role: 'comparison',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Indian views on spiritual practitioners are deeply rooted in ancient philosophical traditions, with the practitioner often envisioned as someone seeking union with the divine, maintaining balance, and realizing the inner self through ritual, meditation, and ethical living. The “embodied self” concept dominates Indian thought, where spirituality is not divorced from everyday existence, the body is perceived as a facilitator, not a hindrance, for spiritual evolution toward moksha (liberation), as seen in the teachings of the Sā Khya and Siddar schools (Inbadas, 2017). Indian practitioners, such as yogis, gurus, and healers, are regarded as both transmitters of spiritual wisdom and community guides, embodying transcendence, karma, and dharma (The Philosophy of the Tamil Siddhas, n.d.).',
        },
        {
          kind: 'paragraph',
          text: 'Conversely, Western views of spiritual practitioners have evolved from primarily religious roles to encompass broader psychological and holistic approaches. In the West, spirituality is often framed as a quest for personal meaning, self-actualization, and wellbeing, sometimes detached from organized religion. For example, Western yoga practitioners are so frequently motivated by physical or emotional benefits that their intentions may begin more materialistically; however, research shows that, with sustained practice, spiritual intentions and psychological wellbeing increase, suggesting that Western spirituality can develop along a continuum from physical to transcendent aims. Western spiritual practitioners, such as mindfulness coaches, counselors, or spiritual directors, emphasize practices like meditation, ethical living, and existential reflection, focusing on individual growth and societal wellbeing rather than union with the divine (Ivtzan & Jegatheeswaran, 2015).',
        },
        {
          kind: 'paragraph',
          text: 'This contrast reveals that while Indian spirituality centers on transcending the self and aligning with cosmic or divine principles, Western spirituality foregrounds personal experience, psychological integration, and holistic wellbeing. Over time, Western societies have also adopted and adapted Indian spiritual practices, creating new hybrid forms that blend physical, meditative, and transformative dimensions.',
        },
      ],
    },
  ],
  references: [
    'choi-2020',
    'ford-2023',
    'ivtzan-jegatheeswaran-2015',
    'kaufman-2022',
    'malviya-greenham-2025',
    'padigapati-chandraiah-2020',
    'park-2011',
    'sekagya-2024',
    'shlokam-2020-sadhana-panchakam',
    'tamil-siddhas',
    'tomar-2024',
    'warber-2015',
  ],
  questionnaire: 'spiritual-practitioner',
  reviewStatus: 'drafted-not-reviewed',
  provenance: {
    drafted: ['keywords'],
    sources: [
      { url: 'https://care4mind.org/spiritualpractitionerprofiling/', retrieved: '2026-10-27' },
    ],
    edits: [
      'English name in sentence case: “Spiritual Practitioner” → “Spiritual practitioner”.',
      'Named by its English title: the page title, “Spiritual Practitioner Profiling”, without “Profiling”, the word for its questionnaire. The page gives no Sanskrit headword (flagged).',
      'The heading over the verses, “Shlokas from Adi Sankaracharya’ Sadhana Panchakam”, is left out: each verse is shown with its work and number, and the Sādhana Pañcakam’s record keeps the page’s attribution to Adi Sankaracharya.',
      'Typo fixed: “Absence of Spirituality Practitioner Profiling” → “Absence of Spiritual Practitioner Profiling”.',
      'Held back in the Questionnaire spiritual-practitioner, described and never quoted: the page’s “Overall Score indicator” section, with its High, Moderate and Low indicators, and its note on the source they were referred from.',
      'Interface text dropped: the “Introduction” and “References” labels, and the “Meaning:” labels before the verses’ readings.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page gives no Sanskrit headword: the Concept is named by its English title, “Spiritual Practitioner”, the page title without “Profiling”. Give it a headword, or confirm the English title. Nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The text cites “(Inbadas, 2017)”, which isn’t on the page’s reference list. Not changed, and nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'The text names “the Sā Khya and Siddar schools”: “Sā Khya” looks like a spelling with a letter lost between “Sā” and “Khya”. Left as the page has it; nothing was looked up.',
      },
      {
        for: 'research-editor',
        note: 'A sentence under “Applications” begins “Psychometric, such as the use of the Spiritual Orientation Inventory…”, which seems to lack a word. Left as the page has it; nothing was looked up.',
      },
    ],
  },
})
