import type { ConceptGraphEdge } from '@/content'

export type ConnectionKind = ConceptGraphEdge['kind']

/** Strongest first, as the content module ranks them: the list's order, and the plate's top layer. */
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
