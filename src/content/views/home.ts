import type { ContentGraph } from '../graph'
import type { HomepageRecord, Target } from '../schema'
import type { HomepageView } from '../types'
import { carriedOver, must } from './common'
import { hrefFor } from './href'

/** The path a record's target names. A Questionnaire's depends on its status. */
export function targetHref(target: Target, graph: ContentGraph): string {
  if ('index' in target) return hrefFor({ page: target.index })
  switch (target.kind) {
    case 'concept':
    case 'topic':
    case 'resource-list':
    case 'page':
      return hrefFor({ kind: target.kind, id: target.id, anchor: target.anchor })
    case 'questionnaire':
      return hrefFor({
        kind: 'questionnaire',
        id: target.id,
        status: must(graph, 'questionnaire', target.id).status,
      })
    case 'work':
    case 'passage':
    case 'glossary':
    case 'reference':
      // The graph refuses an anchor these pages don't have, so the id alone names the place.
      return hrefFor({ kind: target.kind, id: target.id })
  }
}

/** The homepage, each area's target turned into a path; an area without a real one has none. */
export function homepageView(record: HomepageRecord, graph: ContentGraph): HomepageView {
  return {
    tagline: record.tagline,
    shloka: { ...record.shloka },
    hero: { ...record.hero },
    sectionIntros: { ...record.sectionIntros },
    intro: record.intro,
    areas: record.areas.map((area) => ({
      title: area.title,
      text: area.text,
      ...(area.target === undefined ? {} : { href: targetHref(area.target, graph) }),
    })),
    closing: record.closing,
    helpLine: record.helpLine,
    ...carriedOver(record),
  }
}
