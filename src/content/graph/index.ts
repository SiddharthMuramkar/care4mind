/**
 * The graph: every record from a content source, with every link between them resolved once.
 *
 * It is built once per source (a memoised promise) and refuses a broken link: a dangling id
 * throws, naming the record, the field and the missing id, so a broken link can't build. It also
 * holds what is computed rather than stored: the reverse links ("cited by", "quoted in", the
 * Concepts per topic and per work), each record's in-text citations, and the facts that relate
 * one Concept to another (D06).
 */
export { buildGraph, contentGraph, graphFor } from './build'
export {
  DanglingIdError,
  type Citation,
  type ContentGraph,
  type Quotation,
  type RecordKey,
  type Relation,
} from './types'
