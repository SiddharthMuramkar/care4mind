import type { ConceptRecord } from './concept'
import type { GlossaryEntryRecord } from './glossary'
import type { HomepageRecord } from './home'
import type { PageRecord } from './page'
import type { PassageRecord } from './passage'
import type { QuestionnaireRecord } from './questionnaire'
import type { ReferenceRecord } from './reference'
import type { ResourceListRecord } from './resource-list'
import type { TopicRecord } from './topic'
import type { WorkRecord } from './work'

/** Every record the content module stores, one kind per type. */
export type ContentRecord =
  | ConceptRecord
  | TopicRecord
  | WorkRecord
  | PassageRecord
  | ReferenceRecord
  | QuestionnaireRecord
  | GlossaryEntryRecord
  | ResourceListRecord
  | PageRecord
  | HomepageRecord

export type ContentKind = ContentRecord['kind']

export type RecordOf<K extends ContentKind> = Extract<ContentRecord, { kind: K }>

/** The folder under `src/content/data/` that holds each kind's files, one record per file. */
export const KIND_FOLDERS = {
  concept: 'concepts',
  topic: 'topics',
  work: 'works',
  passage: 'passages',
  reference: 'references',
  questionnaire: 'questionnaires',
  glossary: 'glossary',
  'resource-list': 'resource-lists',
  page: 'pages',
  home: 'home',
} as const satisfies Record<ContentKind, string>

export const CONTENT_KINDS = Object.keys(KIND_FOLDERS) as readonly ContentKind[]

const NON_TEXT_FIELDS: ReadonlySet<string> = new Set([
  // ids and anchors
  'kind',
  'slug',
  'id',
  'anchor',
  'locator',
  // links between records
  'topics',
  'references',
  'passage',
  'questionnaire',
  'concepts',
  'candidateSource',
  'concept',
  'work',
  'topic',
  'reference',
  'target',
  'responseSet',
  // URLs
  'url',
  'doi',
  // kinds of thing and statuses
  'type',
  'scheme',
  'role',
  'style',
  'language',
  'status',
  'reviewStatus',
  // meta fields
  'provenance',
  'heldBack',
  'scoring',
  'rights',
  'noStableLink',
])

// A Questionnaire's `source` names a Reference; a translation's `source` is carried-over text.
const NON_TEXT_FIELDS_IN: Partial<Record<ContentKind, readonly string[]>> = {
  questionnaire: ['source'],
}

/** The fields that never hold carried-over text in a record of this kind, wherever they appear. */
export function nonTextFields(kind: ContentKind): ReadonlySet<string> {
  const extra = NON_TEXT_FIELDS_IN[kind]
  return extra ? new Set([...NON_TEXT_FIELDS, ...extra]) : NON_TEXT_FIELDS
}

/**
 * A record's id, unique within its kind: its slug, a passage's `work/locator`,
 * a Reference's id, or `home`. Its file name, under its kind's folder, is the same.
 */
export function idOf(record: ContentRecord): string {
  switch (record.kind) {
    case 'passage':
    case 'reference':
      return record.id
    case 'home':
      return 'home'
    case 'concept':
    case 'topic':
    case 'work':
    case 'questionnaire':
    case 'glossary':
    case 'resource-list':
    case 'page':
      return record.slug
    default: {
      const unreachable: never = record
      throw new Error(`No id for a record of kind “${(unreachable as ContentRecord).kind}”.`)
    }
  }
}
