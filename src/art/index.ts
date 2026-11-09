/**
 * The art module's public interface: the only way pages read the picture registry (`@/art`).
 *
 * Error pages are client components, so they take the Emblem from `@/art/emblem` instead.
 */
import 'server-only'

import { ART, type ArtId } from './registry'
import type { ArtRecord } from './types'

export type * from './types'
export type { ArtId }

const BY_ID: ReadonlyMap<string, ArtRecord> = new Map(ART.map((record) => [record.id, record]))

/** The record of the picture with this id. */
export function art(id: ArtId): ArtRecord {
  const record = BY_ID.get(id)
  if (!record) throw new Error(`No picture has the id “${id}”.`)
  return record
}
