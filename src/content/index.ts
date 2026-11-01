/**
 * The content module's public interface: the only way pages read content (`@/content`).
 *
 * Under it, one content source supplies records (today the generated registry of the files in
 * `data/`; later a CMS) and the graph resolves every link between them once. Pages get views:
 * plain, serialisable data shaped for a page.
 */
// A browser-only helper without 'use client' slips past the lint; this fails its build instead.
import 'server-only'

import type { Route } from 'next'

import { features } from '@/config/features'

import { localSource } from './source'
import type { HrefTarget } from './types'
import { createContent } from './views'
import { hrefFor as pathFor } from './views/href'

export type * from './types'
export { RELATION_STRENGTH } from './types'
export { asciiSpellings, displayName } from './names'

/**
 * The path of a page, or of an anchor on one, with its trailing slash: every internal link on
 * the site is made here. Typed as a route for Next's Link, whose own route types know no
 * trailing slashes.
 */
export const hrefFor = pathFor as (target: HrefTarget) => Route

/** The site's own content: the local source's records, with this build's feature flags. */
const content = createContent(localSource, features)

/** Concepts: `get(slug)` gives a page's view; `list(q?)` gives cards, by topic, work or Reference. */
export const concepts = content.concepts
/** Topics: each with its Concepts, the verses they quote and its introduction, where it has one. */
export const topics = content.topics
/** Traditional texts: each work with every verse the site quotes from it. */
export const works = content.works
/** References: every one once, by type or by the Concept citing it. */
export const references = content.references
/** Questionnaires: `form(slug)` gives a form only for one that can be taken in this build. */
export const questionnaires = content.questionnaires
/** The Library: its reading lists and its pages. */
export const library = content.library
/** The homepage. */
export const home = content.home
/**
 * What the site derives from its content, one derivation file each: the route registry, the
 * breadcrumb trail, each page's name and description, the A–Z, the search documents and the
 * Concept map's data.
 */
export const site = content.site
