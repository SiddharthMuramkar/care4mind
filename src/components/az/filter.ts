/**
 * The A–Z's filters: which chips are pressed, as the address keeps them (`?topic=mind,self`) and
 * as a CSS selector picks out the entries they leave showing. The page's entries carry their facets as
 * attributes (`data-topics`, `data-works`, `data-kind`), so a filter needs no data of its own.
 * Values are slugs, which need no escaping in a selector.
 */

export type FilterGroup = 'topic' | 'text' | 'kind'

export const GROUPS: readonly FilterGroup[] = ['topic', 'text', 'kind']

/** The values pressed in each group: an entry shows if it has one of each group's, or the group has none (kind always has some). */
export type Selection = Readonly<Record<FilterGroup, readonly string[]>>

/** What a plain address shows: the Concept pages. A kind group is never empty; none pressed is this. */
export const DEFAULT_KINDS: readonly string[] = ['concept']

export const DEFAULT_SELECTION: Selection = { topic: [], text: [], kind: DEFAULT_KINDS }

const sameKinds = (kinds: readonly string[]) =>
  kinds.length === DEFAULT_KINDS.length && DEFAULT_KINDS.every((kind) => kinds.includes(kind))

const withKinds = (kinds: readonly string[]) => (kinds.length > 0 ? kinds : DEFAULT_KINDS)

const ATTRIBUTE: Readonly<Record<FilterGroup, string>> = {
  topic: 'data-topics',
  text: 'data-works',
  kind: 'data-kind',
}

/** A chip's value in the ToggleGroup, which holds every group's: `topic:mind`. */
export const chipValue = (group: FilterGroup, value: string) => `${group}:${value}`

/** Whether a selection is the plain address's: no topic or text, and only the Concept pages. */
export const isDefault = (selection: Selection) =>
  selection.topic.length === 0 && selection.text.length === 0 && sameKinds(selection.kind)

/** The selection an address asks for, keeping only the values this page has chips for. */
export function readSelection(
  search: string,
  known: Readonly<Record<FilterGroup, ReadonlySet<string>>>,
): Selection {
  const params = new URLSearchParams(search)
  const read = (group: FilterGroup) => [
    ...new Set(
      (params.get(group) ?? '')
        .split(',')
        .filter((value) => value !== '' && known[group].has(value)),
    ),
  ]
  return { topic: read('topic'), text: read('text'), kind: withKinds(read('kind')) }
}

/** The query string that keeps a selection: `?topic=mind,self&kind=concept,term`, or none. */
export function writeSelection(selection: Selection): string {
  const kept = (group: FilterGroup) =>
    selection[group].length > 0 && !(group === 'kind' && sameKinds(selection.kind))
  const parts = GROUPS.filter(kept).map((group) => `${group}=${selection[group].join(',')}`)
  return parts.length > 0 ? `?${parts.join('&')}` : ''
}

/** The selection a ToggleGroup's pressed values make. */
export function fromChips(values: readonly string[]): Selection {
  const selection = { topic: [] as string[], text: [] as string[], kind: [] as string[] }
  for (const value of values) {
    const at = value.indexOf(':')
    const group = value.slice(0, at) as FilterGroup
    if (GROUPS.includes(group)) selection[group].push(value.slice(at + 1))
  }
  return { ...selection, kind: withKinds(selection.kind) }
}

export const toChips = (selection: Selection) =>
  GROUPS.flatMap((group) => selection[group].map((value) => chipValue(group, value)))

/** A CSS selector for the entries a selection leaves showing. */
export function shownEntries(selection: Selection): string {
  const clauses = GROUPS.filter((group) => selection[group].length > 0).map(
    (group) =>
      `:is(${selection[group].map((value) => `[${ATTRIBUTE[group]}~="${value}"]`).join(', ')})`,
  )
  return `[data-entry]${clauses.join('')}`
}
