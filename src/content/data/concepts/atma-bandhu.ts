import { defineConcept, type SanskritName } from '@/content/schema'

// The /frienorfoeofself/ page, “Are you a Friend/Foe of Yourself?”, carried over as the Concept
// ātma-bandhu, in the self topic. Its pair, ātma-ripu, is a term block in the section whose
// heading names both. The page writes them only as “Atma Bandhu” and “Aatmaripu”, and glosses
// neither outside its score section, which is held back with its Questionnaire (see the flags).
const atmaRipu: SanskritName = { iast: 'ātma-ripu', ascii: ['Aatmaripu'] }

export default defineConcept({
  kind: 'concept',
  slug: 'atma-bandhu',
  name: {
    term: { iast: 'ātma-bandhu', ascii: ['Atma Bandhu'] },
  },
  summary:
    'The Bhagavad Gita, emphasizes that we are our biggest enemy as well as the best capable to uplift our mind, hence underscoring the potential for growth in oneself through an individualistic journey guided by the right mentor or guru (Tomar, 2024).',
  keywords: ['friend', 'enemy', 'self', 'identity', 'desires', 'conflict'],
  topics: { primary: 'self' },
  verses: [
    {
      passage: 'bhagavad-gita/6.5',
      meaning:
        'Let a man lift himself by his own Self alone, and let him not lower himself; for, this Self alone is the friend of oneself, and this Self is the enemy of oneself.',
    },
    {
      passage: 'dhammapada/160',
      meaning:
        'Oneself is refuge of oneself, who else indeed could refuge be? By good training of oneself one gains a refuge hard to gain. The saviour of one’s self is one’s own self. What other person could be your saviour? This is a difficult kind of help–being your own saviour. It can be achieved only through self-discipline.',
    },
  ],
  sections: [
    {
      id: 'what-is-the-concept-of-being-ones-own-friend-or-foe',
      heading: 'What is the Concept of Being One’s Own Friend or Foe?',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The Bhagavad Gita, emphasizes that we are our biggest enemy as well as the best capable to uplift our mind, hence underscoring the potential for growth in oneself through an individualistic journey guided by the right mentor or guru (Tomar, 2024).',
        },
        {
          kind: 'paragraph',
          text: 'According to the Indian perspective, the growth of self-esteem is intricately linked to relationships and situational contexts, shaped by family, educational, and community experiences (Pepper & Henry, 1991). It is not just a personal characteristic but an ongoing interaction with one’s surroundings. For instance, a lack of belonging or insufficient role models can lead children to feel isolated or ineffective, resulting in low self-confidence and disengagement. On the other hand, when children experience cultural continuity, mutual respect, and chances to contribute, they are more likely to cultivate a robust and resilient sense of self. This highlights the importance of social belonging, autonomy, personal significance, and culturally relevant role models. Any disturbance in these areas can result in reduced self-worth and effectiveness, which in turn affects behavior, identity, and academic outcomes, particularly for children (Pepper & Henry, 1991).',
        },
      ],
    },
    {
      id: 'contrast-with-western-psychology',
      heading: 'Contrast with Western Psychology',
      role: 'comparison',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The notion of self, when assessed from Indian and Western viewpoints, reveals deeply contrasting interpretations of identity, purpose, and realization. In the Western psychological framework, self-esteem and self-actualization are viewed as achievements centered on the individual. Theories proposed by Maslow and Rogers depict self-actualization as the peak of personal development, where individuals aim to realize their inherent potential after satisfying basic needs and cultivating a positive self-image, which includes self-esteem (Nagar, 2023). This viewpoint underscores autonomy, personal agency, and a self-motivated quest for meaning and happiness. Conversely, the Indian standpoint, influenced by indigenous customs and the Bhagavad Gita, perceives the self not as a separate entity but as fundamentally linked to a broader cosmic structure. Self-realization is articulated as the acknowledgment of the atman (true self) and its connection with the supreme consciousness (paramatman), attained through dharma (duty), karma (selfless action), bhakti (devotion), and jñāna (wisdom) (Nagar, 2023). The Medicine Wheel framework describes self-esteem as the result of balanced relationships and cultural identity—emphasizing interconnectedness, power, individuality, and exemplification—rather than being an individual characteristic (Pepper & Henry, 1991). Therefore, while the Western model prioritizes personal achievement and internal fulfillment, the Indian model situates the self within a relational and spiritual continuum, perceiving self-realization as a liberation from the ego and material desires.',
        },
        {
          kind: 'table',
          id: 'comparison',
          caption:
            'Comparative of states of mind in Western and Indian philosophies (Krishnappa et al., 2020; Prabhu & Bhat, 2013)',
          columns: ['Aspect', 'Western Perspective', 'Indian perspective'],
          rows: [
            {
              head: 'Core Concept of Self',
              cells: [
                'Individual-centered identity',
                'Interconnected self linked to cosmic and spiritual reality',
              ],
            },
            {
              head: 'Self Development Goal',
              cells: [
                'Self-actualization – fulfilling personal potential',
                'Self-realization – realizing the true self (atman) and its unity with the divine',
              ],
            },
            {
              head: 'Means to Self fulfilment',
              cells: [
                'Autonomy, achievement, personal growth',
                'Dharma (duty), Karma (selfless action), Bhakti (devotion), Jñāna (knowledge)',
              ],
            },
            {
              head: 'View on Self Esteem',
              cells: [
                'Developed through self-concept and personal success',
                'Emerges from balanced relationships and cultural-spiritual harmony',
              ],
            },
            {
              head: 'Sources of Disharmony',
              cells: [
                'Incongruence between ideal self and self-image (leads to low self-esteem)',
                'Detachment from spiritual self and dharma, lack of attempt to understand and leverage self for growth (leads to suffering and inner conflict)',
              ],
            },
            {
              head: 'Ultimate goal/aim',
              cells: [
                'Personal happiness and psychological well-being',
                'Liberation (moksha) from ego, desires, and cycle of rebirth',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'disruptions-in-atma-bandhu-aatmaripu',
      heading: 'Disruptions in Atma Bandhu & Aatmaripu',
      role: 'comparison',
      blocks: [
        {
          kind: 'term',
          id: 'atma-ripu',
          term: atmaRipu,
          blocks: [
            {
              kind: 'paragraph',
              text: 'Disturbances in the development of self can profoundly change an individual’s relationship with themselves, affecting whether a person becomes their own supporter or opponent. In the Western perspective, such disturbances—such as a mismatch between self-image and ideal self—can result in low self-worth, internal conflict, and emotional distress, turning the self into a source of doubt and self-sabotage (Nagar, 2023). Carl Rogers highlights that individuals can only attain self-worth and operate effectively when there is harmony between these aspects. From the Indian philosophical standpoint, with a focus on teachings of the Bhagavad Gita, a troubled or ego-focused self (ahamkara) becomes disconnected from the higher self (atman), causing inner conflict, confusion, and a bondage to desires and consequences. This disconnection makes the individual their own adversary. As Lord Krishna propounds, “the self is the friend of the self for one who has conquered the mind; but for one who has not, the self remains the enemy” (Bhagavad Gita 6.6; Nagar, 2023). However, in both perspectives, self-awareness and inner harmony are vital to becoming one’s own guide rather than a foe.',
            },
          ],
        },
      ],
    },
    {
      id: 'critical-theoretical-connections-in-indian-philosophy',
      heading: 'Critical Theoretical Connections in Indian Philosophy',
      blocks: [
        {
          kind: 'paragraph',
          text: 'In the Advaita Vedānta tradition, the notion of Ātman—the unchanging self—is viewed as the supreme reality and the source of pure consciousness. When an individual aligns with their true Self (Ātman), they cultivate a sense of friendship with themselves. This alignment is accomplished through introspective methods such as discrimination (viveka) and detachment (vairāgya), which assist in differentiating the eternal Self from the ephemeral ego (ahaṃkāra). (Paranjape, 2010). The Advaitic perspective considers the ego’s mistaken identification with mutable traits (roles, emotions, possessions) to be the root cause of internal conflict and dissatisfaction. This misidentification, fueled by ignorance (avidyā), leads to an internal fragmentation where the self becomes its own adversary. The ego’s relentless pursuit of fulfillment through external validation produces a cycle of discontent, while the realization of the Self fosters inner tranquility and self-compassion.',
        },
        {
          kind: 'paragraph',
          text: 'In contrast, the Buddhist viewpoint rejects the notion of an everlasting self (anantta) and instead highlights the dynamic and composite essence of identity (Paranjape, 2010). Nevertheless, its primary goal remains consistent: alleviating suffering through the deconstruction of the ego and the dissolution of attachments. From this standpoint, being a friend to oneself involves recognizing the transience of all phenomena, including personal identity. Individuals who cling to desires, identity frameworks, and self-conceptions ultimately become their own adversaries, perpetuating dukkha (suffering). Practicing ethical conduct, mindfulness, and meditative insight nurtures compassion and selflessness, enabling the self to become its own supporter.',
        },
        {
          kind: 'paragraph',
          text: 'Therefore, within the Indian psychological context, the friend-foe dynamic of the self is not an outward conflict but a journey into oneself. The foe is not an external entity but rather the distorted perception clouded by the ego that obscures the truth. The friend embodies the clarified awareness that recognizes either the reality of non-self (Buddhism) or the essence of the Self (Advaita). This journey necessitates diligent self-examination, ethical practice, and meditative insight, which aligns with the broader Indian ethos that liberation (mokṣha) represents an internal transformation where one ultimately becomes their own closest companion.',
        },
      ],
    },
    {
      id: 'self-management-strategies-propounded-by-bhagavat-gita',
      heading: 'Self Management Strategies Propounded by Bhagavat Gita',
      blocks: [
        {
          kind: 'paragraph',
          text: 'At the core of the Bhagavad Gita lies the teaching that the mind has the power to elevate or diminish an individual. This concept is closely linked to the psychological understanding of internal conflict—where one’s thoughts, attachments, and desires can become self-defeating forces. Being adversarial towards oneself is reflected in unrestrained impulses, emotional volatility, neglect of responsibilities, and excessive identification with fleeting results. To address this, the Gita presents several interconnected strategies that promote self-control and integrity (Hegde & Nayak, 2024).',
        },
        {
          kind: 'list',
          style: 'bullet',
          items: [
            'Firstly, the development of self-awareness and detachment is crucial. The Gita stresses that one should perform actions without being attached to their outcomes (karma-phala-tyāga). This mindset alleviates stress, curtails emotional instability, and improves clarity—thereby diminishing the internal dichotomy that makes one one’s own enemy. Through the practice of Karma Yoga, individuals are taught to dedicate their actions as offerings (verse 5.10), freeing themselves from concerns of personal gain and ego.',
            'Secondly, the notion of self-effort and self-elevation (verse 6.5) emphasizes that change must begin within. The real adversary is not the external environment but the complacency of one’s own mind when it remains unrefined. This realization aligns with contemporary personal development techniques like structured introspection and goal-setting. The focus on determination reflects current psychological concepts such as grit and resilience.',
            'A third vital principle is the idea of moderation and balance (verses 6.16–6.17), which provides practical advice for managing physical habits like eating, sleeping, and leisure. This kind of moderation stabilizes the body-mind connection, facilitating sustained focus and ethical behavior—qualities essential for being one’s own ally.',
            'The Gita also promotes purpose-driven actions, urging individuals to pursue their svadharma (verse 18.46)—their duty in accordance with their true nature—without succumbing to fear or being sidetracked by desires. A life grounded in dharma fosters a sense of meaning and responsibility, counteracting the sense of aimlessness that often leads to self-defeating actions.',
            'Finally, the Gita underscores the significance of devotion, humility, and ethical intentions in all undertakings (verse 9.27), which refines motives and nurtures compassion. This corresponds to being a friend to oneself—not through indulgence, but by exercising wise and compassionate self-governance.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'In conclusion, the Bhagavad Gita offers a cohesive framework for self-management, directly addressing the dual nature of being a friend or foe to oneself. These ancient teachings resonate profoundly with modern psychological principles of self-regulation, well-being, and individual mastery, presenting a rich Indian guide for self-transcendence.',
        },
      ],
    },
  ],
  references: [
    'arshavidyananda-2021',
    'shlokam-2024-gita-6-5',
    'hegde-nayak-2025',
    'nagar-2023',
    'saraswati-2014',
    'paranjpe-2010',
    'pepper-henry-1991',
    'tomar-2024',
    'vivekavani-2015',
  ],
  questionnaire: 'atma-bandhu',
  reviewStatus: 'drafted-not-reviewed',
  provenance: {
    drafted: ['keywords'],
    sources: [{ url: 'https://care4mind.org/frienorfoeofself/', retrieved: '2026-10-27' }],
    edits: [
      'IAST transliterated for the headword and its pair, which the page writes “Atma Bandhu” and “Aatmaripu”: “ātma-bandhu” and “ātma-ripu”. The page prints no Devanagari for either, so none is stored.',
      'The page’s first heading repeats its title, “Are you a Friend/Foe of Yourself?”, and heads no text of its own; it is left out here, and is its Questionnaire’s title.',
      'Verse headings dropped: “Bhagavad Gita Shloka (Chapter 6, Verse 5)” and “Buddhist Dhammapada Verse 160”. Each verse shows its work and number.',
      'Typo fixed, so that the citation reads as one: “(Tomar, 20204)” → “(Tomar, 2024)”.',
      'Typo fixed: “Krishnappa el al.” → “Krishnappa et al.”.',
      'The page gives its table no caption of its own; it takes the sub-heading set just above it: “Comparative of states of mind in Western and Indian philosophies (Krishnappa el al., 2020; Prabhu & Bhat, 2013)”. The table stays in the section “Contrast with Western Psychology”, which takes the comparison role.',
      'The sub-headings “Disruptions in Atma Bandhu & Aatmaripu” and “Critical Theoretical Connections in Indian Philosophy”, under “Contrast with Western Psychology”, each start a section of their own. The first, which sets the Western and Indian views of the same disturbances side by side, also takes the comparison role, and holds ātma-ripu, the term its heading names beside the headword, as a term block around its paragraph.',
      'Inline DharmaWiki links dropped, their words kept: “karma” (twice), “bhakti”, “ahamkara”, “atman”, “Ātman” and “mokṣha”.',
      'Interface text dropped: the “Introduction” and “References” labels, and the “Meaning:” labels before the verses’ readings.',
      'Left out: the page’s “Scoring Continuum” section, with its High, Moderate and Low Indicators, which belongs to its Questionnaire and is listed there as held back.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page writes its headword and the term paired with it only as “Atma Bandhu” and “Aatmaripu” (its only IAST forms, “ātmabandhu” and “ātmaripu”, are in its held-back score section). The record’s IAST, “ātma-bandhu” and “ātma-ripu”, is written from those spellings, with the vowels of the page’s Bhagavad Gītā 6.5 (“ātmano bandhur”, “ripur ātmanaḥ”). The page prints no Devanagari for either, and none is stored. Confirm the forms; nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The page gives no English gloss for ātma-bandhu or ātma-ripu outside its held-back score section: its title asks “Are you a Friend/Foe of Yourself?”, and its reading of Bhagavad Gītā 6.5 calls the Self “the friend of oneself” and “the enemy of oneself”, but neither glosses the terms. The record has no English name and the term no gloss. Supply them, or approve leaving them out; nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'research-editor',
        note: 'The table’s caption is the sub-heading set above it, “Comparative of states of mind in Western and Indian philosophies (Krishnappa et al., 2020; Prabhu & Bhat, 2013)”, word for word the heading of a table on the Know Your Mind page. Here the table compares Western and Indian views of the self, not states of mind, and neither Krishnappa et al. (2020) nor Prabhu & Bhat (2013) is on this page’s reference list. Kept as written, with “el al.” corrected; nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'The text cites “(Paranjape, 2010)” twice; the page’s reference list spells the author Paranjpe, A. C. (2010), as do the citations in its held-back score section. Kept as written; nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'The text cites “(Hegde & Nayak, 2024)”; the page’s reference list gives Hegde & Nayak (2025), and its held-back score section cites them as 2025. Kept as written; nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'Left as the page has it: “anantta”, written for the Buddhist idea of non-self (“the notion of an everlasting self (anantta)”). Nothing was changed or looked up.',
      },
    ],
  },
})
