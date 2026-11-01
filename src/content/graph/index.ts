/**
 * The graph: every record from a content source, with every link between them resolved once.
 * A dangling id throws, naming the record, the field and the missing id, so a broken link can't
 * build. It sits below the views and the derivations and imports nothing from them.
 */
export { buildGraph, contentGraph, graphFor, type ContentGraph, type Quotation } from './build'
export type { Citation } from './citations'
export { DanglingIdError, type RecordKey } from './links'
export type { Relation } from './relations'
