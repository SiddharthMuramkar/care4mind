import type { ArtRecord } from './types'

// Plain data, away from the server-only registry entry point, because the error pages are client components and show the Emblem.

/** The licence of each kept picture until the client confirms it may be reused. */
export const PENDING_LICENCE = "The client's own picture; reuse confirmation pending"

export const EMBLEM_RING = {
  id: 'emblem-ring',
  family: 'emblem',
  src: '/art/emblem/emblem-ring.png',
  width: 740,
  height: 740,
  alt: "Care4Mind's emblem: a pink lotus whose petals form a brain, in a green ring of leaves",
  origin: {
    kind: 'care4mind',
    wpId: 604,
    oldPath: '/wp-content/uploads/2024/05/Logo-with-frame-4-and-text.png',
  },
  licence: PENDING_LICENCE,
  approved: true,
} as const satisfies ArtRecord

export const EMBLEM_MARK = {
  id: 'emblem-mark',
  family: 'emblem',
  src: '/art/emblem/emblem-mark.png',
  width: 703,
  height: 703,
  alt: 'A pink lotus whose petals form a brain, its stalk a brain stem',
  origin: {
    kind: 'care4mind',
    wpId: 498,
    oldPath: '/wp-content/uploads/2024/05/Logo-final-e1715691828178.png',
  },
  licence: PENDING_LICENCE,
  approved: true,
} as const satisfies ArtRecord
