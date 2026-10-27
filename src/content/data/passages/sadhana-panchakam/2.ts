import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'sadhana-panchakam/2',
  work: 'sadhana-panchakam',
  locator: '2',
  order: [2],
  devanagari: [
    'सङ्गः सत्सु विधीयतां भगवतो भक्तिर्दृढाऽऽधीयतां',
    'शान्त्यादिः परिचीयतां दृढतरं कर्माशु सन्त्यज्यताम् ।',
    'सद्विद्वानुपसृप्यतां प्रतिदिनं तत्पादुका सेव्यतां',
    'ब्रह्मैकाक्षरमर्थ्यतां श्रुतिशिरोवाक्यं समाकर्ण्यताम्',
  ],
  transliteration: {
    lines: [
      'saṅgaḥ satsu vidhīyatāṃ bhagavato bhaktirdṛḍhā’’dhīyatāṃ',
      'śāntyādiḥ paricīyatāṃ dṛḍhataraṃ karmāśu santyajyatām .',
      'sadvidvānupasṛpyatāṃ pratidinaṃ tatpādukā sevyatāṃ',
      'brahmaikākṣaramarthyatāṃ śrutiśirovākyaṃ samākarṇyatām',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'spiritualpractitionerprofiling',
      text: 'Seek companionship with Men of Wisdom. Be established in firm devotion to the Lord. Cultivate the virtues such as Shanti etc., Eschew all desire-ridden actions. Take shelter at a Perfect Master (Sat-Guru). Everyday serve His Lotus feet. Worship “Om” the Immutable. Listen in depth, the Upanishadic declarations.',
    },
  ],
  provenance: {
    sources: [
      { url: 'https://care4mind.org/spiritualpractitionerprofiling/', retrieved: '2026-10-27' },
    ],
    edits: [
      'The verse number after the last line is left out, since the locator holds it: “ ॥ २॥” → “” and “ .. 2..” → “”.',
      'The page prints the double avagraha (ऽऽ) of the first line as a closing double quotation mark; it is written as two apostrophes, as the transliteration writes a single avagraha: “saṅgaḥ satsu vidhīyatāṃ bhagavato bhaktirdṛḍhā’’dhīyatāṃ”.',
    ],
    flags: [],
  },
})
