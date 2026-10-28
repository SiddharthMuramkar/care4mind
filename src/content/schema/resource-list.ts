import type { Inline, Provenance, Slug } from './common'

/** A book (a Reference id) or a course on a reading list. */
export type ResourceItem =
  | { type: 'reference'; reference: string; annotation?: Inline }
  | { type: 'course'; provider: string; name: string; description?: Inline; url?: string }

/** A reading list in the Library (D13), such as Text Books. */
export interface ResourceListRecord {
  kind: 'resource-list'
  slug: Slug
  title: string
  groups: readonly { id: Slug; heading: string; items: readonly ResourceItem[] }[]
  provenance: Provenance
}

/** Type-checks a reading list record file; returns it unchanged. */
export function defineResourceList(record: ResourceListRecord): ResourceListRecord {
  return record
}
