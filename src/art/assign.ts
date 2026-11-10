import type { ArtId } from './registry'
import type { SlotId } from './slots'

// Which picture goes where. Pictures attach to content here, never in the content's own files.

/** A picture a placement can name: one in the registry, or a slot that may not have a record yet. */
export type PictureId = ArtId | SlotId

/** The pages that take a section's picture. The proposals page has none. */
export type SectionKey =
  | 'concepts'
  | 'map'
  | 'texts'
  | 'questionnaires'
  | 'library'
  | 'textbooks'
  | 'inspirational-books'
  | 'courses'
  | 'methods'
  | 'references'
  | 'start'
  | 'search'
  | 'notFound'

/** A picture for a page head. A slot must say what stands in for it until it has a record. */
type SectionPicture = { art: ArtId; interim?: never } | { art: SlotId; interim: ArtId }

/** A topic's Sticker, for its card, and the Plate shown as its Frontispiece. */
export type TopicPicture = { frontispiece: ArtId } & (
  { sticker: ArtId; interim?: never } | { sticker: SlotId; interim: ArtId }
)

export const sectionArt: Readonly<Record<SectionKey, SectionPicture>> = {
  concepts: { art: 'sticker-cosmos' },
  map: { art: 'sticker-cosmos' },
  texts: { art: 'sticker-book-ornate' },
  questionnaires: { art: 'sticker-clipboard' },
  library: { art: 'sticker-library', interim: 'sticker-book-clasp' },
  textbooks: { art: 'sticker-book-clasp' },
  'inspirational-books': { art: 'sticker-book-lotus', interim: 'sticker-book-clasp' },
  courses: { art: 'sticker-gear' },
  methods: { art: 'sticker-mind-tools' },
  references: { art: 'sticker-palm-leaf', interim: 'sticker-book-clasp' },
  start: { art: 'sticker-cosmos' },
  search: { art: 'sticker-mind-dome' },
  notFound: { art: 'plate-404', interim: 'emblem-mark' },
}

/** Whether `key` names a section with a picture, such as a Library page's slug. */
export function isSectionKey(key: string): key is SectionKey {
  return Object.hasOwn(sectionArt, key)
}

export const topicArt: Readonly<Record<string, TopicPicture>> = {
  self: {
    sticker: 'sticker-self',
    interim: 'sticker-cosmos',
    frontispiece: 'plate-sage-lights-mind',
  },
  mind: { sticker: 'sticker-mind-swirl', frontispiece: 'plate-sage-paints-mind' },
  practice: { sticker: 'sticker-meditation', frontispiece: 'plate-painter-bowl' },
  values: {
    sticker: 'sticker-values',
    interim: 'sticker-book-ornate',
    frontispiece: 'plate-tree-of-mind',
  },
  // The gear, not Cosmos, so Cosmos does not appear twice in the topic row.
  temperament: { sticker: 'sticker-gunas', interim: 'sticker-gear', frontispiece: 'plate-farmers' },
}

export const conceptArt: Readonly<Record<string, PictureId>> = {
  ahimsa: 'plate-ahimsa',
  asteya: 'plate-asteya',
  'atma-bandhu': 'plate-atma-bandhu',
  atman: 'plate-atman',
  'brahma-vihara': 'plate-brahma-vihara',
  brahmacharya: 'plate-brahmacharya',
  chittabhumi: 'plate-chittabhumi',
  'five-steps-of-perfection': 'plate-five-steps-of-perfection',
  jagat: 'plate-jagat',
  jiva: 'plate-jiva',
  karta: 'plate-karta',
  'momentum-of-spiritual-practice': 'plate-momentum-of-spiritual-practice',
  'panch-klesha': 'plate-panch-klesha',
  satya: 'plate-satya',
  'spiritual-practitioner': 'plate-spiritual-practitioner',
  sthitaprajna: 'plate-sthitaprajna',
  triguna: 'plate-triguna',
  'upa-vikshepa': 'plate-upa-vikshepa',
  vikshepa: 'plate-vikshepa',
}

export const workArt: Readonly<Record<string, PictureId>> = {
  'bhagavad-gita': 'pothi-bhagavad-gita',
  dhammapada: 'pothi-dhammapada',
  'sadhana-panchakam': 'pothi-sadhana-panchakam',
  'sushruta-samhita': 'pothi-sushruta-samhita',
  'vedanta-sara': 'pothi-vedanta-sara',
  'yoga-sutra': 'pothi-yoga-sutra',
}

/** Only a Questionnaire with a picture made for it. The Dosha Survey's Plate waits for its page. */
export const questionnaireArt: Readonly<Record<string, PictureId>> = {
  'karmayoga-scale': 'plate-karma-yoga',
}

/** The Plate viewer's paintings, in order. */
export const heroPlates = [
  'plate-jeweller',
  'plate-sculptor',
  'plate-farmers',
  'plate-jeweller-woman',
  'plate-painter-bowl',
  'plate-painter-birds',
  'plate-karma-yoga',
] as const satisfies readonly ArtId[]
