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

/** Every record the content module stores, one kind per type (D04). */
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

/**
 * A record's id, unique within its kind (settled rule 1): its slug, a passage's `work/locator`,
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
      const unnamed: never = record
      return (unnamed as { slug: string }).slug
    }
  }
}
