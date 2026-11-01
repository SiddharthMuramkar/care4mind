import { defineTopic } from '@/content/schema'

// Topics are provisional (D03; planning ticket 13 confirms them). Their names come from the
// design notes, B3. Content-v1 ticket 10 added this topic's introduction: the yama–niyama
// section the four values pages share, stored once here and shown on each values Concept where
// its page had it, so a correction is made in one place.
export default defineTopic({
  kind: 'topic',
  slug: 'values',
  name: { english: 'Values: yama and niyama' },
  order: 4,
  intro: {
    sections: [
      {
        id: 'raja-yoga-foundations-yama-niyama',
        heading: 'Raja Yoga Foundations: Yama-Niyama',
        blocks: [
          {
            kind: 'term',
            id: 'yama',
            term: { iast: 'yama', devanagari: 'यम', ascii: ['Yama'] },
            blocks: [
              {
                kind: 'paragraph',
                text: '‘Yama’ represents the foundational limb in Ashtanga Yoga. Yamas are intricately linked to moral duties and social responsibility, which lead to peace with surroundings. By diligently adhering to the principles of ‘Yama’, one not only nurtures their individual progress but also contributes to the creation of a more harmonious and ethical society. The primary aim of ‘Yama’ is to cultivate self-discipline by exercising restraint over the senses and achieving mastery over the mind. This concept, as elucidated by Sage Patanjali in Chapter 2, ‘Sadhana Pada,’ 30th Sutra of his seminal work, ‘Patanjali Yoga Sutras,’ encompasses five fundamental moral principles (Tomar, 2024).',
              },
              {
                kind: 'paragraph',
                text: 'Yama is the first limb of Patanjali’s Ashtanga Yoga and represents social or ethical discipline. It consists of five principles: Ahimsa (non-violence), Satya (truthfulness), Asteya (non-stealing), Brahmacharya (sense control or celibacy), and Aparigraha (non-possessiveness). These aim to transform negative human tendencies into positive traits and promote harmony in society and personal life (Srinivasan, 2016). Practicing Yama helps in developing virtues that influence both individual personality and social well-being. It restrains negative behaviors and thought patterns to foster a disciplined and ethical lifestyle. This contributes to personal growth as well as social harmony and ethical conduct (Srinivasan, 2016). Yama is critical for building a good society and is foundational for spiritual and moral development in yoga. The ethical practices involved in Yama lead to positive social and personal outcomes such as reducing hostility, increasing responsibility, and promoting peace and integrity. Yama in modern times, emphasizing that without practicing Yama, yoga practice is superficial. Yama fosters individual respect in society, reduces anxiety, and supports long, healthy, harmonious living.',
              },
            ],
          },
          {
            kind: 'term',
            id: 'niyama',
            term: { iast: 'niyama', devanagari: 'नियम', ascii: ['Niyama'] },
            blocks: [
              {
                kind: 'paragraph',
                text: 'In Ashtanga Yoga, the second limb is Niyama. Niyamas are intrapersonal observations that lead to internal improvement and peace with oneself. Niyamas cultivate a harmonious personality with purity, karma, happiness, determination, vision, and humility. Sage Patanjali outlined five niyamas in the 32nd sutra of the second chapter, Sadhanapada, in his book Patanjali Yoga Sutras.',
              },
              {
                kind: 'paragraph',
                text: 'Yamas and Niyamas entail the integration of these 10 principles into our daily lives with unwavering commitment. Any irregularity in their practice can gradually obscure the path of yoga. Adhering to the Yamas and Niyamas fosters both inner and outer harmony and peace, maintaining a steady and purposeful progression along the yogic journey, It is widely recognised that where there is steadiness, there is advancement (Tomar, 2024).',
              },
              {
                kind: 'paragraph',
                text: 'Niyama is the second limb of Patanjali’s Ashtanga Yoga, which comprises five key principles for building individual discipline and fostering spiritual development: Shauch (purity), Santosh (contentment), Tapas (austerity), Swadhyaya (self-study), and Ishwar Pranidhan (surrender to God) (Thapliyal et al., 2023).',
              },
            ],
          },
        ],
      },
    ],
    references: ['srinivasan-2016', 'thapliyal-2023', 'tomar-2024'],
    provenance: {
      sources: [
        {
          url: 'https://care4mind.org/knowyourvaluesahimsanon-violenceprofiling/',
          retrieved: '2026-10-27',
        },
        {
          url: 'https://care4mind.org/knowyourvaluessatyatruthfulnessprofiling/',
          retrieved: '2026-10-27',
        },
        {
          url: 'https://care4mind.org/knowyourvaluesasteyanonstealingprofiling/',
          retrieved: '2026-10-27',
        },
        {
          url: 'https://care4mind.org/knowyourvaluesbrahmacharya-profiling/',
          retrieved: '2026-10-27',
        },
      ],
      edits: [
        'The four Know Your Values pages each print this section under the same heading. It is stored once, here, as the Asteya page prints it, the only copy whose grammar the site itself corrected, and each values Concept shows it where its page had it.',
        'The four copies compared: the Ahimsa and Brahmacharya pages’ copies are identical; the Satya page’s has the same words and differs from them only in spacing, inside the quotes round ‘Yama’ and before one full stop; the Asteya page’s has the four wording changes listed next.',
        'Where the Ahimsa, Satya and Brahmacharya pages’ copies differ from the Asteya page’s, the record keeps the Asteya wording: “that leads to peace with surroundings” → “which lead to peace with surroundings”, “Niyamas intrapersonal observations for internal improvement, that leads to peace with self” → “Niyamas are intrapersonal observations that lead to internal improvement and peace with oneself”, “vision and humility” → “vision, and humility”, “Ashtanga Yoga, comprises” → “Ashtanga Yoga, which comprises”.',
        'Paragraphs as the Satya and Asteya pages break them: the Ahimsa and Brahmacharya pages print the three Niyama paragraphs as one.',
        'Inline DharmaWiki links dropped, their words kept: on the Ahimsa and Brahmacharya pages, “Yama” in the first Yama paragraph and “Niyama” in the Niyama paragraph link to DharmaWiki’s articles on them. The Satya and Asteya pages’ copies have no links.',
        'The sub-headings “Yama” and “Niyama” name Sanskrit terms, so each is a term block. Their IAST is the pages’ own spelling. Their Devanagari is split out of the Yoga Sūtra 2.30 and 2.32 verses all four pages quote, in its dictionary form: “यम” from “यमाः”, and “नियम” from “नियमाः”.',
        'Typo fixed: “Yanas and Niyamas” → “Yamas and Niyamas”.',
        'Its References are the three it cites, Srinivasan (2016), Thapliyal et al. (2023) and Tomar (2024), in the order the pages’ reference lists give them; each values page lists all three.',
      ],
      flags: [
        {
          for: 'research-editor',
          note: 'The four Know Your Values pages each print this yama–niyama section, and their copies differ (the edits list every difference). The record stores the Asteya page’s copy, the only one whose grammar the site itself corrected, with one typo fixed (“Yanas”), so the Ahimsa, Satya and Brahmacharya Concepts now show its wording. Confirm the choice; nothing else was changed or looked up.',
        },
        {
          for: 'research-editor',
          note: 'The yama–niyama section prints no Devanagari for “Yama” and “Niyama”: the record’s “यम” and “नियम” are split out of the Yoga Sūtra 2.30 and 2.32 verses the values pages quote (“यमाः”, “नियमाः”). The sub-headings give no English gloss, so the two term blocks have none. Confirm the forms, and supply glosses or confirm none; nothing was looked up.',
          decidedBy: 'sanskrit-terms',
        },
        {
          for: 'research-editor',
          note: 'Left as the values pages print them, in the yama–niyama section: the sentence fragment “Yama in modern times, emphasizing that without practicing Yama, yoga practice is superficial.”, and the comma before “It is widely recognised that where there is steadiness, there is advancement”. Nothing was changed.',
        },
      ],
    },
  },
})
