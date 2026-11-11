import type { ArtRecord } from '@/art'

/**
 * The name of the control that opens a picture whole in the lightbox: what it does, then which
 * picture, by its caption or, where it has none, its alt.
 */
export function openWholeLabel({ caption, alt }: Pick<ArtRecord, 'caption' | 'alt'>): string {
  return `Open whole: ${caption ?? alt}`
}
