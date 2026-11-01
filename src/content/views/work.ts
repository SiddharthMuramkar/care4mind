import type { ContentGraph } from '../graph'
import type { WorkRecord } from '../schema/index'
import type { WorkCard, WorkView } from '../types'
import { carriedOver, nameCopy, present } from './common'
import { compareOrder, passageView, workRef } from './passage'

/** The passages of a work, in its own order. */
function passagesOf(work: WorkRecord, graph: ContentGraph) {
  return graph
    .records('passage')
    .filter((passage) => passage.work === work.slug)
    .sort((a, b) => compareOrder(a.order, b.order))
}

/** A work in brief: its title in each form, and how many of its verses the site quotes. */
export function workCard(record: WorkRecord, graph: ContentGraph): WorkCard {
  return {
    ...workRef(record),
    term: nameCopy(record.title),
    ...present({ english: record.title.english, attribution: record.attribution }),
    language: record.language ?? 'sa',
    passageCount: passagesOf(record, graph).length,
  }
}

/** A work's page: every verse the site quotes from it, in its order, with "quoted in". */
export function workView(record: WorkRecord, graph: ContentGraph): WorkView {
  return {
    ...workCard(record, graph),
    locatorLabel: record.locatorLabel,
    ...(record.editions === undefined ? {} : { editions: [...record.editions] }),
    passages: passagesOf(record, graph).map((passage) => passageView(passage, graph)),
    ...carriedOver(record),
  }
}
