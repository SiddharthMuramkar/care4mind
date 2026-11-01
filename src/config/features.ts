/**
 * Feature flags (D16, D20): features that are built but not yet approved for launch.
 *
 * Each flag is on in local runs and Vercel previews, and off in Vercel production (`VERCEL_ENV`
 * is `production`), so nothing the Project owner hasn't approved goes live. Its own environment
 * variable forces it either way: `1` on, `0` off. Flags are read once, when the site builds, on
 * the server: hand a flag to a client component as a prop rather than importing this there.
 * The content module reads them through createContent(), the shell through this module.
 */
export interface Features {
  /** A Questionnaire with status "preview" can be taken (the KarmaYoga flow). */
  questionnairePreview: boolean
  /** Proposal: the Concept map at /concepts/map/. */
  conceptMap: boolean
  /** Proposal: the Start here page at /start/. */
  startHere: boolean
}

const VARIABLES = {
  questionnairePreview: 'FEATURE_QUESTIONNAIRE_PREVIEW',
  conceptMap: 'FEATURE_CONCEPT_MAP',
  startHere: 'FEATURE_START_HERE',
} as const satisfies Record<keyof Features, string>

type Environment = Readonly<Record<string, string | undefined>>

/** The flags for an environment such as `process.env`. */
export function readFeatures(env: Environment): Features {
  const byDefault = env.VERCEL_ENV !== 'production'
  const flag = (variable: string): boolean => {
    const value = env[variable]
    if (value === undefined || value === '') return byDefault
    if (value === '1') return true
    if (value === '0') return false
    throw new Error(`${variable} must be 1 (on) or 0 (off), not “${value}”.`)
  }
  return {
    questionnairePreview: flag(VARIABLES.questionnairePreview),
    conceptMap: flag(VARIABLES.conceptMap),
    startHere: flag(VARIABLES.startHere),
  }
}

/** This build's flags. */
export const features: Features = readFeatures(process.env)

/** The proposals page is on while any proposal is: it has no flag of its own. */
export function proposalsPageOn(flags: Features = features): boolean {
  return flags.conceptMap || flags.startHere
}
