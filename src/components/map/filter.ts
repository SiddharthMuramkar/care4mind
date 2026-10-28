/**
 * The Concept map's filters: one kind of connection at a time, and any number of topics, kept in
 * the address (`?kind=passage&topic=mind,self`). A connection shows if it is of the chosen kind
 * and touches a chosen topic; with nothing chosen, everything shows, as it does without JavaScript.
 */
import { KINDS, type ConnectionKind } from './layout'

export interface Selection {
  kind: ConnectionKind | null
  topic: readonly string[]
}

export const NOTHING: Selection = { kind: null, topic: [] }

const isKind = (value: string): value is ConnectionKind =>
  (KINDS as readonly string[]).includes(value)

const values = (params: URLSearchParams, name: string) =>
  (params.get(name) ?? '').split(',').filter((value) => value !== '')

/** The selection an address asks for, keeping only this page's topics and one known kind. */
export function readSelection(search: string, topics: ReadonlySet<string>): Selection {
  const params = new URLSearchParams(search)
  return {
    kind: values(params, 'kind').find(isKind) ?? null,
    topic: [...new Set(values(params, 'topic').filter((topic) => topics.has(topic)))],
  }
}

/** The query string that keeps a selection, or none when nothing is chosen. */
export function writeSelection({ kind, topic }: Selection): string {
  const parts = [
    ...(kind ? [`kind=${kind}`] : []),
    ...(topic.length > 0 ? [`topic=${topic.join(',')}`] : []),
  ]
  return parts.length > 0 ? `?${parts.join('&')}` : ''
}

/** Whether a Concept in these topics keeps its full weight: no topic chosen, or one of its own. */
export const stands = (topics: readonly string[], { topic }: Selection) =>
  topic.length === 0 || topics.some((own) => topic.includes(own))

/** Whether a connection shows: of the chosen kind, touching a chosen topic. */
export const shows = (
  connection: { kind: ConnectionKind; topics: readonly string[] },
  selection: Selection,
) =>
  (selection.kind === null || connection.kind === selection.kind) &&
  stands(connection.topics, selection)

/** What the polite announcement says after a filter changes. */
export function countText(shown: number, total: number) {
  if (shown === 0) return 'No connection matches these filters'
  if (shown === total) return `Showing all ${total} connections`
  return `Showing ${shown} of ${total} connections`
}
