import type { ArtFamily } from './types'

/** A new picture named before it exists: placements can name it, and until it has a record it counts as absent. */
interface ArtSlot {
  /** The id its record will take. */
  id: string
  /** A Pothi is a Sticker, so it files under that family. */
  family: Exclude<ArtFamily, 'emblem'>
  /** Where it goes. */
  placement: string
}

/**
 * One slot per brief in the pictures spec.
 *
 * The Dosha Survey's Plate waits until the Survey has a page, so it has no slot yet. That is a
 * default, reversed by adding one here.
 */
export const SLOTS = [
  { id: 'sticker-self', family: 'sticker', placement: 'topic: self' },
  { id: 'sticker-values', family: 'sticker', placement: 'topic: values' },
  { id: 'sticker-gunas', family: 'sticker', placement: 'topic: temperament' },
  { id: 'sticker-library', family: 'sticker', placement: 'section: library' },
  { id: 'sticker-book-lotus', family: 'sticker', placement: 'section: inspirational-books' },
  { id: 'sticker-palm-leaf', family: 'sticker', placement: 'section: references' },
  { id: 'pothi-bhagavad-gita', family: 'sticker', placement: 'text: bhagavad-gita' },
  { id: 'pothi-dhammapada', family: 'sticker', placement: 'text: dhammapada' },
  { id: 'pothi-sadhana-panchakam', family: 'sticker', placement: 'text: sadhana-panchakam' },
  { id: 'pothi-sushruta-samhita', family: 'sticker', placement: 'text: sushruta-samhita' },
  { id: 'pothi-vedanta-sara', family: 'sticker', placement: 'text: vedanta-sara' },
  { id: 'pothi-yoga-sutra', family: 'sticker', placement: 'text: yoga-sutra' },
  { id: 'plate-404', family: 'plate', placement: 'page: 404' },
  { id: 'plate-ahimsa', family: 'plate', placement: 'concept: ahimsa' },
  { id: 'plate-asteya', family: 'plate', placement: 'concept: asteya' },
  { id: 'plate-atma-bandhu', family: 'plate', placement: 'concept: atma-bandhu' },
  { id: 'plate-atman', family: 'plate', placement: 'concept: atman' },
  { id: 'plate-brahma-vihara', family: 'plate', placement: 'concept: brahma-vihara' },
  { id: 'plate-brahmacharya', family: 'plate', placement: 'concept: brahmacharya' },
  { id: 'plate-chittabhumi', family: 'plate', placement: 'concept: chittabhumi' },
  {
    id: 'plate-five-steps-of-perfection',
    family: 'plate',
    placement: 'concept: five-steps-of-perfection',
  },
  { id: 'plate-jagat', family: 'plate', placement: 'concept: jagat' },
  { id: 'plate-jiva', family: 'plate', placement: 'concept: jiva' },
  { id: 'plate-karta', family: 'plate', placement: 'concept: karta' },
  {
    id: 'plate-momentum-of-spiritual-practice',
    family: 'plate',
    placement: 'concept: momentum-of-spiritual-practice',
  },
  { id: 'plate-panch-klesha', family: 'plate', placement: 'concept: panch-klesha' },
  { id: 'plate-satya', family: 'plate', placement: 'concept: satya' },
  {
    id: 'plate-spiritual-practitioner',
    family: 'plate',
    placement: 'concept: spiritual-practitioner',
  },
  { id: 'plate-sthitaprajna', family: 'plate', placement: 'concept: sthitaprajna' },
  { id: 'plate-triguna', family: 'plate', placement: 'concept: triguna' },
  { id: 'plate-upa-vikshepa', family: 'plate', placement: 'concept: upa-vikshepa' },
  { id: 'plate-vikshepa', family: 'plate', placement: 'concept: vikshepa' },
] as const satisfies readonly ArtSlot[]

/** The id of a slot, so a typo fails the typecheck. */
export type SlotId = (typeof SLOTS)[number]['id']
