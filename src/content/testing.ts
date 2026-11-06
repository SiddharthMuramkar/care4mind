/**
 * The one entry tests may use to reach content internals (`@/content/testing`).
 *
 * Tests build made-up sources, check the graph and sweep the real records, so they need the
 * record schema, the sources, the graph, the view builder and the shared naming. They take
 * all of it here, and lint stops a test importing any other internal (the content boundary):
 * what tests may reach is decided in this list, once. Nothing in `src` imports this file:
 * pages read content through `@/content` alone.
 */
export {
  CONTENT_KINDS,
  defineConcept,
  defineGlossaryEntry,
  defineHome,
  definePage,
  definePassage,
  defineQuestionnaire,
  defineReference,
  defineResourceList,
  defineTopic,
  defineWork,
  idOf,
  isSlug,
  KIND_FOLDERS,
  PLANNING_ISSUES,
  type Block,
  type ConceptRecord,
  type ContentRecord,
  type Flag,
  type FlagCitation,
  type FlagMissing,
  type FlagRole,
  type GlossaryEntryRecord,
  type HomepageRecord,
  type PassageQuote,
  type PassageRecord,
  type Provenance,
  type QuestionnaireForm,
  type QuestionnaireRecord,
  type RecordOf,
  type ReferenceRecord,
  type SanskritName,
  type Section,
  type TableBlock,
  type TermBlock,
  type TopicRecord,
} from './schema'
export { localSource, memorySource, registrySource, type ContentSource } from './source'
export { buildGraph, contentGraph, DanglingIdError, graphFor, type ContentGraph } from './graph'
export { asciiSpellings, conceptName, displayName } from './names'
export { createContent } from './views'
