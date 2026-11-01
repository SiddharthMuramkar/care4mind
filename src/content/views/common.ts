/**
 * Small helpers every view mapper shares.
 */
import { stripDiacritics } from '@/lib/sanskrit'

import type { ContentGraph } from '../graph'
import type { ContentKind, Provenance, RecordOf, ReviewStatus, SanskritName } from '../schema/index'
import type { CarriedOver, ProvenanceView } from '../types'

/**
 * A record the graph has already checked exists. The graph refuses dangling ids when it is
 * built, so this throws only if a mapper asks for an id no record links to.
 */
export function must<K extends ContentKind>(graph: ContentGraph, kind: K, id: string): RecordOf<K> {
  const record = graph.record(kind, id)
  if (!record) throw new Error(`No ${kind} “${id}” in the content graph.`)
  return record
}

type Present<T> = { [K in keyof T]?: Exclude<T[K], undefined> }

/**
 * The entries whose value is defined. A view never holds `undefined`, which a JSON round trip
 * would drop: an absent field is left out instead.
 */
export function present<T extends Record<string, unknown>>(value: T): Present<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, inner]) => inner !== undefined),
  ) as Present<T>
}

/** A copy of a Sanskrit name, so a view never shares an object with a record. */
export function nameCopy(name: SanskritName): SanskritName {
  return { iast: name.iast, ...present({ devanagari: name.devanagari }), ascii: [...name.ascii] }
}

/** For sorting by name with diacritics and case ignored: `Ātman` sorts as `atman`. */
export function sortKey(text: string): string {
  return stripDiacritics(text.normalize('NFC')).toLowerCase()
}

/** Compares two names with diacritics and case ignored, then as written, so the order is stable. */
export function byName(a: string, b: string): number {
  const [x, y] = [sortKey(a), sortKey(b)]
  if (x !== y) return x < y ? -1 : 1
  return a < b ? -1 : a > b ? 1 : 0
}

/** A record's provenance as its view carries it: a copy, with nothing left undefined. */
export function provenanceView(provenance: Provenance): ProvenanceView {
  return {
    sources: provenance.sources.map((source) => ({ ...source })),
    edits: [...provenance.edits],
    flags: provenance.flags.map((flag) => ({ ...flag })),
    ...(provenance.drafted === undefined ? {} : { drafted: [...provenance.drafted] }),
  }
}

/**
 * What every view of a carried-over record carries: its provenance and its review status. A kind
 * that stores no status hasn't been reviewed: it is "drafted, not reviewed" if it declares
 * drafted fields (settled rule 4), else "carried over, not reviewed".
 */
export function carriedOver(record: {
  provenance: Provenance
  reviewStatus?: ReviewStatus
}): CarriedOver {
  const drafted = (record.provenance.drafted ?? []).length > 0
  return {
    provenance: provenanceView(record.provenance),
    reviewStatus:
      record.reviewStatus ?? (drafted ? 'drafted-not-reviewed' : 'carried-over-not-reviewed'),
  }
}
