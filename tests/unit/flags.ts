import { type Features, readFeatures } from '@/config/features'

/** Every flag on, as a local run or a Vercel preview builds them. */
export const ON: Features = readFeatures({})

/** Every flag off, as Vercel production builds them. */
export const OFF: Features = readFeatures({ VERCEL_ENV: 'production' })
