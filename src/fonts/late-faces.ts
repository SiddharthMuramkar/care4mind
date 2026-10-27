/**
 * A font face the first paint does without (ticket 05). Its text is painted
 * first in what stands in for it, the regular slanted or thickened or a system
 * font, and the face is added once that text is on screen (LateFonts).
 */
export interface LateFace {
  family: string
  /** The face's file, imported as an asset. */
  url: string
  // TypeScript's DOM types don't list size-adjust yet; every browser the site supports takes it.
  descriptors: FontFaceDescriptors & { sizeAdjust?: string }
  /**
   * Fetched only by pages with text it covers (its unicode range). A face that
   * joins a family already on the page is loaded before it is added instead,
   * so that its text never falls back to the next font in the stack meanwhile.
   */
  onDemand?: boolean
}
