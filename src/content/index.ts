/**
 * The content module's public interface: the only way pages read content (`@/content`).
 *
 * Under it, one content source supplies records (today the generated registry of the files in
 * `data/`; later a CMS) and the graph resolves every link between them once. Pages get views:
 * plain, serialisable data shaped for a page. Until the front-end-site spec moves the pages, the
 * foundation's functions and types come from the legacy adapter, unchanged.
 */
import { features } from '@/config/features'

import { localSource } from './source'
import { createContent } from './views'

export type {
  Block,
  Comparison,
  Concept,
  Homepage,
  Provenance,
  Questionnaire,
  Reference,
  ReviewStatus,
  SanskritTerm,
  Section,
  Shloka,
} from './legacy'
export {
  getConcept,
  getHomepage,
  getQuestionnaire,
  listConcepts,
  listQuestionnaires,
} from './legacy'

export type * from './types'
export { hrefFor } from './views/href'
export { asciiSpellings, displayName } from './views/names'

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
 * breadcrumb trail, the A–Z, the search documents and the Concept map's data.
 */
export const site = content.site
