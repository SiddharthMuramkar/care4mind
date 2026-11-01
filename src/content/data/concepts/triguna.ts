import { defineConcept, type SanskritName } from '@/content/schema'

// The /triguna/ page, carried over as the Concept triguṇa, in the temperament topic. The three
// guṇas are term blocks; every verse sits inside a section, since the page sets none above them.
// The section “Triguna Profile Questionnaire” belongs to its Questionnaire (its title, its purpose
// and its held-back table), so its verse, Bhagavad Gītā 14.9, follows 14.8 here. The page's
// leftover test shortcode is dropped.
const sattva: SanskritName = { iast: 'sattva', devanagari: 'सत्त्व', ascii: ['Sattva'] }
const rajas: SanskritName = { iast: 'rajas', devanagari: 'रजस्', ascii: ['Rajas'] }
const tamas: SanskritName = { iast: 'tamas', devanagari: 'तमस्', ascii: ['Tamas'] }

export default defineConcept({
  kind: 'concept',
  slug: 'triguna',
  name: {
    term: { iast: 'triguṇa', ascii: ['Triguna'] },
  },
  summary:
    'Deriving the concept of Trigunas from ancient Indian texts, each represents a personality trait or characteristic in humans. The threefold characteristics—Sattva, Rajas, and Tamas—described in the Bhagavad Gita form the core of human nature and bind the Atman to the Sarira.',
  keywords: ['characteristics', 'purity', 'inertia', 'personality', 'nature'],
  topics: { primary: 'temperament' },
  verses: [],
  sections: [
    {
      id: 'trigunas',
      heading: 'Trigunas',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Deriving the concept of Trigunas from ancient Indian texts, each represents a personality trait or characteristic in humans. The threefold characteristics—Sattva, Rajas, and Tamas—described in the Bhagavad Gita form the core of human nature and bind the Atman to the Sarira. The term “Guna” describes a thread that metaphorically weaves the fabric of nature (Prakriti). Rajas represents passion or hyperactivity, Tamas represents passivity and inertia, and Sattva represents purity (Tomar, 2024).',
        },
        {
          kind: 'term',
          id: 'sattva',
          term: sattva,
          gloss: 'Purity',
          blocks: [
            {
              kind: 'paragraph',
              text: 'As described in the Bhagavad Gita, Sattva Guna is characterized by traits of enlightenment and purity, allowing individuals to perceive reality as it is (Gupta, 1977; Swaroop et al., 2016). It fosters mental clarity, wisdom, and long-term happiness. Individuals with high Sattva tend to be calm, introspective, and content, striving for knowledge and long-term well-being.',
            },
          ],
        },
        {
          kind: 'term',
          id: 'rajas',
          term: rajas,
          gloss: 'Passion or hyperactivity',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Rajas Guna involves an active and passionate nature, often drawing individuals toward pleasure and attachment. While it fuels ambition and desires, it also leads to restlessness and an insatiable craving for material pursuits (Swaroop et al., 2016). Associated with action arising from desires, people dominated by Rajas often seek pleasure, wealth, and attachment to materialistic goals but may struggle to find long-term fulfillment.',
            },
          ],
        },
        {
          kind: 'term',
          id: 'tamas',
          term: tamas,
          gloss: 'Passivity and inertia',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Tamas Guna is associated with inertia, ignorance, and self-destruction. It is born out of delusion and can lead to confusion, laziness, and resistance to change (Gupta, 1977; Swaroop et al., 2016). Linked to ignorance and delusion, those with high Tamas may struggle with self-awareness, feel disconnected, and exhibit tendencies toward laziness or self-destructive behaviors.',
            },
          ],
        },
        {
          kind: 'paragraph',
          text: 'In Ayurveda, these three Gunas define the characteristics of the mind, while in other Shastras, they represent the modes of material energy. A person’s temperament, behavior, emotions, and actions are shaped by the dominance of one of these Gunas at any given time.',
        },
      ],
    },
    {
      id: 'bhagavad-gita-gunatraya-vibhaga-chapter-14',
      heading: 'Bhagavad Gita – Gunatraya Vibhaga (Chapter 14)',
      blocks: [
        {
          kind: 'verse',
          quote: {
            passage: 'bhagavad-gita/14.5',
            meaning:
              'Purity, passion, and inertia—these Gunas, O mighty-armed, born of Prakriti, bind the indestructible Atman fast in the body.',
          },
        },
        {
          kind: 'paragraph',
          text: 'All three Gunas coexist in a person’s mind, constantly competing for dominance. Their dynamic interaction influences an individual’s thoughts, emotions, and actions, shaping their overall mental state. The dominance of one of these Trigunas at any given time affects personality, emotions, health, and life quality.',
        },
        { kind: 'verse', quote: { passage: 'bhagavad-gita/14.6', translation: 'triguna' } },
        { kind: 'verse', quote: { passage: 'bhagavad-gita/14.7', translation: 'triguna' } },
        { kind: 'verse', quote: { passage: 'bhagavad-gita/14.8', translation: 'triguna' } },
        { kind: 'verse', quote: { passage: 'bhagavad-gita/14.9', translation: 'triguna' } },
      ],
    },
    {
      id: 'guna-predominance',
      heading: 'Guna Predominance',
      blocks: [
        {
          kind: 'paragraph',
          text: 'In Shrimad Bhagavad Gita, the characteristics of a person having a certain Guna predominance are clearly outlined in Adhyaya 14.',
        },
        { kind: 'verse', quote: { passage: 'bhagavad-gita/14.11', translation: 'triguna' } },
        { kind: 'verse', quote: { passage: 'bhagavad-gita/14.12', translation: 'triguna' } },
        { kind: 'verse', quote: { passage: 'bhagavad-gita/14.13', translation: 'triguna' } },
      ],
    },
    {
      id: 'ayurvedic-perspectives',
      heading: 'Ayurvedic Perspectives',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Triguna in Ayurveda primarily discusses how a person’s psychological characteristics are formed, how personality traits are described, and how mental diseases (Rajas & Tamas Guna) predispose individuals to illness. The increase in Sattva Guna is considered essential for mental clarity and well-being (Sandhya & Vinodkumar, 2021).',
        },
        {
          kind: 'paragraph',
          text: 'Among the three, Sattva is the pure quality of the mind that fosters happiness, knowledge, and wisdom, whereas Rajas and Tamas negatively influence the person, leading to disturbances in mental and physical health.',
        },
        { kind: 'verse', quote: { passage: 'sushruta-samhita/4.35' } },
      ],
    },
    {
      id: 'psychology-perspectives',
      heading: 'Psychology Perspectives',
      role: 'comparison',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Studies have established that the Sattvika Guna aligns positively with all five components of PERMA (Positive Emotion, Engagement, Relationships, Meaning, and Accomplishment), contributing to human flourishing. In contrast, Rajasika and Tamasika Gunas negatively correlate with well-being, with Tamasika showing the strongest negative association (Pandey & Dubey, 2020).',
        },
        {
          kind: 'paragraph',
          text: 'Additionally, Trigunas have been studied alongside Eysenck’s Three-Factor Personality Model. Sattva corresponds to high extraversion and low neuroticism, Rajas aligns with high extraversion and high neuroticism, while Tamas resembles high neuroticism and low extraversion (Swaroop et al., 2017). This suggests that ancient Indian and modern Western psychological frameworks share common underlying structures.',
        },
      ],
    },
  ],
  references: [
    'bonshe-srivastava-2023',
    'gupta-1977',
    'jayasheela-salagame-2018',
    'murthy-kiran-kumar-2007',
    'khanna-2013',
    'pandey-dubey-2020',
    'swaroop-2016',
    'sandhya-vinodkumar-2021',
    'tomar-2024',
    'shlokam-2025',
    'dharmawiki',
    'esushruta',
  ],
  questionnaire: 'triguna',
  reviewStatus: 'drafted-not-reviewed',
  provenance: {
    drafted: ['keywords'],
    sources: [{ url: 'https://care4mind.org/triguna/', retrieved: '2026-10-27' }],
    edits: [
      'IAST written for the headword, which the page spells “Triguna” and “Trigunas”: “triguṇa”, with “guṇa” as the page’s Bhagavad Gītā 14.5 writes it (“guṇāḥ”). The page prints no Devanagari for it, so none is stored.',
      'The sub-headings “Sattva Guna”, “Rajas Guna” and “Tamas Guna” are term blocks for sattva, rajas and tamas, as the page writes them. Their Devanagari is split out of the page’s verses, in dictionary forms: “सत्त्व” (from “सत्त्वं”, 14.5 and 14.6), “रजस्” (from “रजस्तम इति”, 14.5) and “तमस्” (from “तमस्त्वज्ञानजं”, 14.8). Each one’s gloss is what the section’s first paragraph says it represents.',
      'The paragraph after “Tamas Guna” that speaks of all three guṇas (“In Ayurveda, these three Gunas define the characteristics of the mind…”) follows the term blocks in the section “Trigunas”.',
      'The sub-heading “Bhagavad Gita – Gunatraya Vibhaga (Chapter 14)” starts a section of its own.',
      'Verse headings dropped: “Sattva”, “Rajas” and “Tamas”, each heading one verse of chapter 14 and nothing else. Their verses, Bhagavad Gītā 14.6, 14.7 and 14.8, follow 14.5 in the section “Bhagavad Gita – Gunatraya Vibhaga (Chapter 14)”; each shows its work and number, and names its guṇa in its own words.',
      'The section “Triguna Profile Questionnaire” belongs to its Questionnaire: its heading is that record’s title, its first sentence that record’s purpose, and its lead-in and table are held back there. Its verse, Bhagavad Gītā 14.9, follows 14.8 in the section “Bhagavad Gita – Gunatraya Vibhaga (Chapter 14)”.',
      'The quotation marks around the Meaning of Bhagavad Gītā 14.5 are left out, as they are around the translations of 14.9 to 14.13.',
      'Interface text dropped: the “References” heading, the “Online Resources:” label in the reference list and the “Meaning:” label before 14.5’s reading; the horizontal rules under four headings are left out.',
      'Left out: the leftover test shortcode at the end of the page, after its reference list, which called a PHP snippet named “Mind”, and the test message it showed on the live page.',
      'Gloss in sentence case: “purity” → “Purity”.',
      'Gloss in sentence case: “passion or hyperactivity” → “Passion or hyperactivity”.',
      'Gloss in sentence case: “passivity and inertia” → “Passivity and inertia”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page writes its headword only as “Triguna” and “Trigunas”, with no IAST or Devanagari. The record’s IAST, “triguṇa”, writes that spelling with “guṇa” as the page’s Bhagavad Gītā 14.5 does (“guṇāḥ”), and no Devanagari is stored. Confirm the form; nothing was looked up.',
        decidedBy: 'sanskrit-terms',
      },
      {
        for: 'research-editor',
        note: 'The Devanagari of the three guṇas, “सत्त्व”, “रजस्” and “तमस्”, is split out of the page’s verses (“सत्त्वं”, “रजस्तम इति”, “तमस्त्वज्ञानजं”) in dictionary forms; their IAST, “sattva”, “rajas” and “tamas”, is the page’s own. Confirm them; nothing was looked up.',
        decidedBy: 'sanskrit-terms',
      },
      {
        for: 'research-editor',
        note: 'The page gives no English gloss for triguṇa: the nearest, “The threefold characteristics—Sattva, Rajas, and Tamas—”, names the three guṇas rather than glossing the term. The record has no English name. Supply one, or approve leaving it out; nothing was looked up.',
        decidedBy: 'sanskrit-terms',
      },
      {
        for: 'research-editor',
        note: 'The text cites “(Swaroop et al., 2017)”; the page’s reference list gives Swaroop et al. (2016), which it also cites as “(Swaroop et al., 2016)”. Kept as written; nothing was looked up.',
        decidedBy: 'references',
      },
      {
        for: 'research-editor',
        note: 'The Triguna page heads this verse without naming a work; its number belongs to chapter 14, which the page names as the Bhagavad Gita’s, and it is stored under the Bhagavad Gītā. Confirm the attribution.',
        decidedBy: 'traditional-texts',
      },
      {
        for: 'research-editor',
        note: 'The page numbers this verse “Sush Samh 4.35” and names it “Sushruta Samhita (Sharirasthanam Adhyayam 4 Sutram 35)” in its Online Resources; the locator 4.35 doesn’t name the section (sthāna). Confirm how the site should number it.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})
