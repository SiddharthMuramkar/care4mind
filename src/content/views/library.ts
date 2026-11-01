import type { ContentGraph } from '../graph'
import type { PageRecord, ResourceListRecord } from '../schema/index'
import type { LibraryCard, PageView, ResourceListView } from '../types'
import { sectionViews, tocOf, type Owner } from './blocks'
import { carriedOver, must, present } from './common'
import { hrefFor } from './href'
import { referenceView } from './reference'

/** A Library page in brief: a reading list with how many items it holds, or a page. */
export function libraryCard(record: ResourceListRecord | PageRecord): LibraryCard {
  const href = hrefFor({ kind: record.kind, id: record.slug })
  return record.kind === 'resource-list'
    ? {
        kind: record.kind,
        slug: record.slug,
        title: record.title,
        href,
        itemCount: record.groups.reduce((count, group) => count + group.items.length, 0),
      }
    : { kind: record.kind, slug: record.slug, title: record.title, href, summary: record.summary }
}

/** A reading list, each book resolved to its Reference. */
export function resourceListView(
  record: ResourceListRecord,
  graph: ContentGraph,
): ResourceListView {
  return {
    kind: 'resource-list',
    slug: record.slug,
    title: record.title,
    href: hrefFor({ kind: 'resource-list', id: record.slug }),
    groups: record.groups.map((group) => ({
      id: group.id,
      heading: group.heading,
      href: hrefFor({ kind: 'resource-list', id: record.slug, anchor: group.id }),
      items: group.items.map((item) =>
        item.type === 'reference'
          ? {
              type: 'reference' as const,
              reference: referenceView(must(graph, 'reference', item.reference), graph),
              ...present({ annotation: item.annotation }),
            }
          : {
              type: 'course' as const,
              provider: item.provider,
              name: item.name,
              ...present({ description: item.description, url: item.url }),
            },
      ),
    })),
    ...carriedOver(record),
  }
}

/** A page of text in the Library, such as Methods. */
export function pageView(record: PageRecord, graph: ContentGraph): PageView {
  const owner: Owner = { kind: 'page', id: record.slug }
  return {
    kind: 'page',
    slug: record.slug,
    title: record.title,
    summary: record.summary,
    href: hrefFor({ kind: 'page', id: record.slug }),
    sections: sectionViews(record.sections, owner, graph),
    toc: tocOf(record.sections, owner),
    ...carriedOver(record),
  }
}
