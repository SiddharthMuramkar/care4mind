/**
 * Reading the feature flags from an environment. Apart from features.ts, which is server-only
 * and holds this build's flags, so next.config.ts can read them too.
 */

export interface Features {
  /** A Questionnaire with status "preview" can be taken (the KarmaYoga flow). */
  questionnairePreview: boolean
  /** Proposal: the Concept map at /concepts/map/. */
  conceptMap: boolean
  /** Proposal: the Start here page at /start/. */
  startHere: boolean
  /** Proposal: the "What's on your mind?" chips under the homepage hero. */
  whatsOnYourMind: boolean
  /** Sign up and Log in: Log in beside Search, the auth routes, and login before Start. */
  login: boolean
}

const VARIABLES = {
  questionnairePreview: 'FEATURE_QUESTIONNAIRE_PREVIEW',
  conceptMap: 'FEATURE_CONCEPT_MAP',
  startHere: 'FEATURE_START_HERE',
  whatsOnYourMind: 'FEATURE_WHATS_ON_YOUR_MIND',
  login: 'FEATURE_LOGIN',
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
    whatsOnYourMind: flag(VARIABLES.whatsOnYourMind),
    login: flag(VARIABLES.login),
  }
}
