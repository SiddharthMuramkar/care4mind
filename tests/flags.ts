import { readFeatures, type Features } from '@/config/features'

/** Every flag on, read as a local run reads them so a new flag needs no test edit, with overrides. */
export function flagsOn(overrides: Partial<Features> = {}): Features {
  return { ...readFeatures({}), ...overrides }
}

/** Every flag off, read as production reads them, with overrides. */
export function flagsOff(overrides: Partial<Features> = {}): Features {
  return { ...readFeatures({ VERCEL_ENV: 'production' }), ...overrides }
}
