/**
 * The record schema: the storage shape, one type per kind, each with an identity helper that
 * exists only to type-check a record file. Record files import from here; pages never do.
 */
export type * from './common'
export * from './concept'
export * from './glossary'
export * from './home'
export * from './kinds'
export * from './links'
export * from './page'
export * from './passage'
export * from './questionnaire'
export * from './reference'
export * from './resource-list'
export * from './text'
export * from './topic'
export * from './work'
