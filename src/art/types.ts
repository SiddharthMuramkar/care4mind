export type ArtFamily = 'emblem' | 'sticker' | 'plate'

export type ArtOrigin =
  /** The Care4Mind team's own picture, from the old site's media library. */
  | { kind: 'care4mind'; wpId: number; oldPath: string }
  /** Made for this site with an image tool, from the briefs in the pictures spec. */
  | { kind: 'generated'; tool: string; model: string; style?: string; prompt: string; made: string }
  /** Someone else's picture under a licence that allows it, with the credit it asks for. */
  | { kind: 'licensed'; credit: string; source: string }

export interface ArtRecord {
  /** kebab-case and never reused: a new version gets a new id. */
  id: string
  family: ArtFamily
  /** A file under public/. */
  src: `/art/${string}`
  /** The file's own pixel size; the unit test checks them. */
  width: number
  height: number
  /** What the picture shows, for wherever it stands alone. At most 125 characters. */
  alt: string
  /** A Plate's visible caption. */
  caption?: string
  origin: ArtOrigin
  /** Shown only on /credits/sources/, never beside the picture. Required for every picture. */
  licence: string
  /** A generated picture stays false until the client approves it, and while false renders only where the draftArt flag is on. The 22 kept pictures are true. */
  approved: boolean
}
