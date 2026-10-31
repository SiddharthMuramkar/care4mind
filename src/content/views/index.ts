/**
 * The public interface's namespaces over one content source.
 *
 * `@/content` builds them once over the local source and this build's feature flags; tests build
 * them over made-up sources and flags, at the same seam. Every call reads the source's graph,
 * which is built once per source and refuses a dangling id.
 */
import type { Features } from '@/config/features'

import { azIndex } from '../derive/az-index'
import { conceptGraph } from '../derive/graph-data'
import { routes } from '../derive/routes'
import { searchDocuments } from '../derive/search-documents'
import { trail } from '../derive/trail'
import { graphFor } from '../graph'
import type { ReferenceType, Slug } from '../schema'
import type { ContentSource } from '../source'
import type {
  AzLetter,
  ConceptCard,
  ConceptGraph,
  ConceptView,
  Crumb,
  HomepageView,
  LibraryCard,
  PageView,
  QuestionnaireCard,
  QuestionnaireFormView,
  QuestionnaireView,
  ReferenceView,
  ResourceListView,
  RouteEntry,
  SearchDocument,
  TopicCard,
  TopicView,
  WorkCard,
  WorkView,
} from '../types'
import { byName } from './common'
import { conceptCard, conceptView } from './concept'
import { homepageView } from './home'
import { libraryCard, pageView, resourceListView } from './library'
import {
  canTake,
  questionnaireCard,
  questionnaireFormView,
  questionnaireView,
  STATUS_ORDER,
} from './questionnaire'
import { compareReferences, referenceView } from './reference'
import { topicCard, topicView } from './topic'
import { workCard, workView } from './work'

export function createContent(source: ContentSource, flags: Features) {
  const graph = () => graphFor(source)

  return {
    concepts: {
      /** A Concept's page, or null for an unknown slug. */
      async get(slug: Slug): Promise<ConceptView | null> {
        const read = await graph()
        const record = read.record('concept', slug)
        return record ? conceptView(record, read, flags) : null
      },
      /**
       * Every Concept as a card, by name with diacritics ignored: only those in a topic (as
       * primary or not), quoting a work or citing a Reference, when asked.
       */
      async list(
        q: { topic?: Slug; work?: Slug; reference?: string } = {},
      ): Promise<ConceptCard[]> {
        const read = await graph()
        const quoting = q.work === undefined ? undefined : read.conceptsQuotingWork(q.work)
        return read
          .records('concept')
          .filter(
            (concept) =>
              (q.topic === undefined ||
                concept.topics.primary === q.topic ||
                (concept.topics.also ?? []).includes(q.topic)) &&
              (quoting === undefined || quoting.includes(concept.slug)) &&
              (q.reference === undefined || concept.references.includes(q.reference)),
          )
          .map((concept) => conceptCard(concept, read))
          .sort((a, b) => byName(a.name, b.name))
      },
    },

    topics: {
      /** A topic's page, or null for an unknown slug. */
      async get(slug: Slug): Promise<TopicView | null> {
        const read = await graph()
        const record = read.record('topic', slug)
        return record ? topicView(record, read) : null
      },
      /** Every topic, in its order. */
      async list(): Promise<TopicCard[]> {
        const read = await graph()
        return [...read.records('topic')]
          .sort((a, b) => a.order - b.order)
          .map((topic) => topicCard(topic, read))
      },
    },

    works: {
      /** A work's page, or null for an unknown slug. */
      async get(slug: Slug): Promise<WorkView | null> {
        const read = await graph()
        const record = read.record('work', slug)
        return record ? workView(record, read) : null
      },
      /** Every work, by title with diacritics ignored. */
      async list(): Promise<WorkCard[]> {
        const read = await graph()
        return read
          .records('work')
          .map((work) => workCard(work, read))
          .sort((a, b) => byName(a.title, b.title))
      },
    },

    references: {
      /**
       * Every Reference once, by first author (or title) with diacritics ignored: only those of
       * a type, or cited by a Concept, when asked.
       */
      async list(q: { type?: ReferenceType; citedBy?: Slug } = {}): Promise<ReferenceView[]> {
        const read = await graph()
        const citing = q.citedBy === undefined ? undefined : read.record('concept', q.citedBy)
        return read
          .records('reference')
          .filter(
            (reference) =>
              (q.type === undefined || reference.type === q.type) &&
              (q.citedBy === undefined || (citing?.references.includes(reference.id) ?? false)),
          )
          .sort(compareReferences)
          .map((reference) => referenceView(reference, read))
      },
    },

    questionnaires: {
      /** A Questionnaire's page, or null for an unknown slug. */
      async get(slug: Slug): Promise<QuestionnaireView | null> {
        const read = await graph()
        const record = read.record('questionnaire', slug)
        return record ? questionnaireView(record, read, flags) : null
      },
      /** Every Questionnaire: live, then preview, coming soon and coming later, each by title. */
      async list(): Promise<QuestionnaireCard[]> {
        const read = await graph()
        return [...read.records('questionnaire')]
          .sort(
            (a, b) =>
              STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
              byName(a.title, b.title),
          )
          .map((questionnaire) => questionnaireCard(questionnaire, read, flags))
      },
      /**
       * Its form, or null unless it can be taken in this build: live, or preview while
       * `questionnairePreview` is on (D16). A form stored for one coming later stays null.
       */
      async form(slug: Slug): Promise<QuestionnaireFormView | null> {
        const record = (await graph()).record('questionnaire', slug)
        if (!record?.form || !canTake(record, flags)) return null
        return questionnaireFormView({ ...record, form: record.form })
      },
    },

    library: {
      /** A reading list or a page of the Library, or null for an unknown slug. */
      async get(slug: Slug): Promise<ResourceListView | PageView | null> {
        const read = await graph()
        const list = read.record('resource-list', slug)
        if (list) return resourceListView(list, read)
        const page = read.record('page', slug)
        return page ? pageView(page, read) : null
      },
      /** Its reading lists, then its pages, each by title. */
      async list(): Promise<LibraryCard[]> {
        const read = await graph()
        const byTitle = <T extends { title: string }>(records: readonly T[]) =>
          [...records].sort((a, b) => byName(a.title, b.title))
        return [...byTitle(read.records('resource-list')), ...byTitle(read.records('page'))].map(
          libraryCard,
        )
      },
    },

    home: {
      /** The homepage. Its record always exists: without it, this throws. */
      async get(): Promise<HomepageView> {
        const read = await graph()
        const record = read.record('home', 'home')
        if (!record) throw new Error('The content has no homepage record (data/home/home.ts).')
        return homepageView(record, read)
      },
    },

    /** What the site derives from its content: one derivation file each (`derive/`). */
    site: {
      /** One entry per public page, for the content present and this build's flags. */
      async routes(): Promise<RouteEntry[]> {
        return routes(await graph(), flags)
      },
      /** A page's breadcrumbs (design B6), the page itself last; none for a path that isn't one. */
      async trail(path: string): Promise<Crumb[]> {
        return trail(await graph(), flags, path)
      },
      /** The Concepts A–Z: every Concept, term and glossary entry, by letter. */
      async azIndex(): Promise<AzLetter[]> {
        return azIndex(await graph())
      },
      /** The search corpus: one document per thing search can find. */
      async searchDocuments(): Promise<SearchDocument[]> {
        return searchDocuments(await graph())
      },
      /** The Concept map's data: the Concepts and the facts that connect them. */
      async graph(): Promise<ConceptGraph> {
        return conceptGraph(await graph())
      },
    },
  }
}
