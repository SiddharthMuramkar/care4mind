/**
 * The art module's public interface: the only way pages read the picture registry (`@/art`).
 *
 * Error pages are client components, so they take the Emblem from `@/art/emblem` instead.
 */
import 'server-only'

import { features } from '@/config/features'

import { ART, type ArtId } from './registry'
import { createArt } from './resolve'

export type * from './types'
export type { ArtId }
export type { ArtTarget, OwnArtTarget } from './resolve'

const pictures = createArt(ART, features)

/** The record of the picture with this id. */
export const art = pictures.art
/** The picture for a page head or a topic's card, following the Interim pictures. */
export const artFor = pictures.artFor
/** A Concept's, Questionnaire's or Traditional text's own picture for its card, or nothing. */
export const ownArt = pictures.ownArt
