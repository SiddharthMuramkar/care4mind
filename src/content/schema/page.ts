import type { Inline, Provenance, Section, Slug } from './common'

/** A page of text in the Library, such as Therapy approaches. */
export interface PageRecord {
  kind: 'page'
  slug: Slug
  title: string
  summary: Inline
  sections: readonly Section[]
  provenance: Provenance
}

/** Type-checks a page record file; returns it unchanged. */
export function definePage(record: PageRecord): PageRecord {
  return record
}
