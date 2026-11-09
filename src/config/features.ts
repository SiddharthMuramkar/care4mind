/**
 * Feature flags: features that are built but not yet approved for launch.
 *
 * Each flag is on in local runs and Vercel previews, and off in Vercel production (`VERCEL_ENV`
 * is `production`), so nothing the Project owner hasn't approved goes live. Its own environment
 * variable forces it either way: `1` on, `0` off. Flags are read once, when the site builds, on
 * the server: hand a flag to a client component as a prop rather than importing this there.
 * The content module reads them through createContent(), the shell through this module.
 */
import 'server-only'

import { readFeatures, type Features } from './read-features'

export { readFeatures, type Features }

/** This build's flags. */
export const features: Features = readFeatures(process.env)

/** The proposals page is on while any built proposal is: it has no flag of its own. */
export function proposalsPageOn(flags: Features = features): boolean {
  return flags.conceptMap || flags.startHere || flags.whatsOnYourMind
}
