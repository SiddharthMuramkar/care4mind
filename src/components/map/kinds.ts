import type { ConceptGraphEdge } from '@/content'

export type ConnectionKind = ConceptGraphEdge['kind']

/**
 * The kinds of connection, strongest first: the list's order, and the plate's top layer first.
 * Written out rather than read from `@/content`, which client code may import only for types; a
 * unit test holds it to the content module's `RELATION_STRENGTH`.
 */
export const KINDS: readonly ConnectionKind[] = ['passage', 'work', 'reference']

/** How each kind is named: on its filter button, in the legend, and over its part of the list. */
export const KIND_WORDS: Readonly<
  Record<ConnectionKind, { button: string; legend: string; heading: string }>
> = {
  passage: {
    button: 'Shared verse',
    legend: 'Solid: a verse both quote',
    heading: 'A verse both quote',
  },
  reference: {
    button: 'Rarely cited Reference',
    legend: 'Dotted: a rarely cited Reference both cite',
    heading: 'A rarely cited Reference both cite',
  },
  work: {
    button: 'Shared text',
    legend: 'Dashed: a text both quote',
    heading: 'A text both quote',
  },
}
