import type { Features } from '@/config/features'

import type { ContentGraph } from '../graph'
import type { HomepageRecord, Target } from '../schema'
import type { HomepageView } from '../types'
import { carriedOver, must } from './common'
import { conceptCard } from './concept'
import { hrefFor } from './href'
import { conceptRef } from './refs'

/** The path a record's target names. A Questionnaire's depends on its status. */
export function targetHref(target: Target, graph: ContentGraph) {
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
    default: {
      const kind: never = target.kind
      throw new Error(`No address for a record of kind “${kind}”.`)
    }
  }
}

/**
 * The homepage, each area's target turned into a path; an area without a real one has none.
 * The "What's on your mind?" starting points reach the view only while their flag is on.
 */
export function homepageView(
  record: HomepageRecord,
  graph: ContentGraph,
  flags: Features,
): HomepageView {
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
    // Each featured card carries the reading time its Concept's page shows, counted in conceptCard.
    featured: record.featured.map((slug) => conceptCard(must(graph, 'concept', slug), graph)),
    onYourMind: flags.whatsOnYourMind
      ? record.onYourMind.map(({ label, concept }) => ({
          label,
          concept: conceptRef(must(graph, 'concept', concept)),
        }))
      : [],
    howItWorks: record.howItWorks,
    whoBehind: record.whoBehind,
    closing: record.closing,
    helpLine: record.helpLine,
    footerQuestionnaires: record.footerQuestionnaires,
    ...carriedOver(record),
  }
}
