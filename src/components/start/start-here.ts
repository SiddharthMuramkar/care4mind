/**
 * The Start here page's own record: every word drafted for the new site, for the
 * Research editor to check, as its provenance says. The help line is the homepage record's.
 */
import type { ProvenanceView } from '@/content'

export interface StartHere {
  /** What Indian psychology is, in plain sentences. */
  about: readonly string[]
  /** How the site is organised, as three small cards. */
  organised: readonly { title: string; text: string }[]
  /** How to read Sanskrit names: the letter, then how it sounds, with the site's own spellings. */
  sounds: readonly { letters: string; text: string }[]
  /** The Concepts to read first, by slug, in order. */
  firstReads: readonly string[]
  provenance: ProvenanceView
}

export const startHere: StartHere = {
  about: [
    'Indian psychology is the study of the mind as India’s traditions of thought and practice describe it.',
    'It comes from texts such as the Yoga Sūtra and the Bhagavad Gītā, and from the practices that grew up around them.',
    'Its questions are close to modern psychology’s: what the mind is, why it is restless, and how a person grows steady.',
    'Care4Mind gathers its ideas, the texts they come from and the research about them in one place.',
  ],
  organised: [
    {
      title: 'Topics hold Concepts',
      text: 'Each topic, such as Mind or Self, gathers the Concepts that belong to it.',
    },
    {
      title: 'Concepts explain Terms',
      text: 'A Concept is one idea, named by its Sanskrit term, and explains the terms it uses.',
    },
    {
      title: 'Texts and the Library beside them',
      text: 'The traditional texts hold the verses the Concepts quote; the Library holds the References and reading lists.',
    },
  ],
  sounds: [
    { letters: 'ā, ī, ū', text: 'are long: held about twice as long as a, i and u.' },
    { letters: 'c', text: 'sounds “ch”: citta is “chitta”.' },
    { letters: 'ś, ṣ', text: 'sound “sh”: kleśa is “klesha”, vikṣepa is “vikshepa”.' },
    { letters: 'ṛ', text: 'sounds “ri”.' },
    { letters: 'ṃ', text: 'is a nasal, said through the nose.' },
  ],
  firstReads: ['vikshepa', 'chittabhumi', 'sthitaprajna'],
  provenance: {
    sources: [],
    edits: [],
    flags: [
      {
        for: 'research-editor',
        note: 'Every line here is drafted: check the account of Indian psychology, the site’s organisation and the pronunciation notes.',
      },
      {
        for: 'research-editor',
        note: 'Citta-bhūmi’s IAST is unconfirmed: its Concept record transliterated it from the old page’s plural “chittabhumis”, with no Devanagari. Confirm it before this page goes live.',
      },
    ],
    drafted: ['about', 'organised', 'sounds', 'firstReads'],
  },
}
