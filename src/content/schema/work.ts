import type { Provenance, SanskritName, Slug } from './common'

/** A traditional text the site quotes, made of passages (D08). */
export interface WorkRecord {
  kind: 'work'
  slug: Slug
  title: SanskritName & { english?: string }
  /** Sanskrit unless stated: `pi` for Pali (the Dhammapada). */
  language?: 'sa' | 'pi'
  /** Who the pages say composed it, as they say it. */
  attribution?: string
  /** What the pages call one of its numbered units, such as "Sutra" or "Verse". */
  locatorLabel: string
  editions?: readonly string[]
  provenance: Provenance
}

/** Type-checks a work record file; returns it unchanged. */
export function defineWork(record: WorkRecord): WorkRecord {
  return record
}
