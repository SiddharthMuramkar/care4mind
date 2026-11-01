import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'yoga-sutra/1.22',
  work: 'yoga-sutra',
  locator: '1.22',
  order: [1, 22],
  devanagari: ['मृदुमध्याधिमात्रत्वात् ततोऽपि विशेषः'],
  transliteration: {
    lines: ['mṛdumadhyādhimātratvāt tato’pi viśeṣaḥ'],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'momentumofspiritualpractice',
      text: 'The success of Yogis differs according as the means they adopt are mild, medium, or intense.',
    },
  ],
  provenance: {
    sources: [
      { url: 'https://care4mind.org/momentumofspiritualpractice/', retrieved: '2026-10-27' },
    ],
    edits: [
      'Work assigned: the Momentum of Spiritual Practice page heads this verse “Shloka for Momentum of Spiritual Practice from Chapter 1, Sutra 21,22” and names no work there; it is stored as Yoga Sūtra 1.22, which its text and number are.',
      'The page prints the transliteration as a sub-heading; it is stored as the verse’s transliteration.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ १.२२॥” → “” and “ .. 1.22..” → “”.',
      'The verse number before the translation is left out: “22. The” → “The”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Momentum of Spiritual Practice page heads its two verses “Chapter 1, Sutra 21,22” and names no work there; they are stored as Yoga Sūtra 1.21 and 1.22, which their text is and which the page’s Meaning calls “Patanjali’s Yoga Sutras”. Confirm the attribution.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})
