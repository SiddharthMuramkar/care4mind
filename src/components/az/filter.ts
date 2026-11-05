/**
 * The A–Z's filters: which chips are pressed, as the address keeps them (`?topic=mind,self`) and
 * as a CSS selector picks out the entries they leave showing. The page's entries carry their facets as
 * attributes (`data-topics`, `data-works`, `data-kind`, `data-concepts`), so a filter needs no data of its own.
 * Values are slugs, which need no escaping in a selector.
 */

export type FilterGroup = 'topic' | 'text' | 'kind' | 'concept'

export const GROUPS: readonly FilterGroup[] = ['topic', 'text', 'kind', 'concept']

/** The values pressed in each group: an entry shows if it has one of each group's, or the group has none. */
export type Selection = Readonly<Record<FilterGroup, readonly string[]>>

/**
 * What a plain address shows, by kind: the Concept pages. A list that opens on other kinds, or on
 * every kind, passes its own; none pressed reads as these, so the plain address stays plain.
 */
export const DEFAULT_KINDS: readonly string[] = ['concept']

export const DEFAULT_SELECTION: Selection = {
  topic: [],
  text: [],
  kind: DEFAULT_KINDS,
  concept: [],
}

const sameKinds = (kinds: readonly string[], defaultKinds: readonly string[]) =>
  kinds.length === defaultKinds.length && defaultKinds.every((kind) => kinds.includes(kind))

const withKinds = (kinds: readonly string[], defaultKinds: readonly string[]) =>
  kinds.length > 0 ? kinds : defaultKinds

const ATTRIBUTE: Readonly<Record<FilterGroup, string>> = {
  topic: 'data-topics',
  text: 'data-works',
  kind: 'data-kind',
  concept: 'data-concepts',
}

/** A chip's value in the ToggleGroup, which holds every group's: `topic:mind`. */
export const chipValue = (group: FilterGroup, value: string) => `${group}:${value}`

/** Whether a selection is the plain address's: nothing pressed but the kinds it opens on. */
export const isDefault = (selection: Selection, defaultKinds: readonly string[] = DEFAULT_KINDS) =>
  GROUPS.every((group) =>
    group === 'kind' ? sameKinds(selection.kind, defaultKinds) : selection[group].length === 0,
  )

/** The selection an address asks for, keeping only the values this page has chips for. */
export function readSelection(
  search: string,
  known: Readonly<Record<FilterGroup, ReadonlySet<string>>>,
  defaultKinds: readonly string[] = DEFAULT_KINDS,
): Selection {
  const params = new URLSearchParams(search)
  const read = (group: FilterGroup) => [
    ...new Set(
      (params.get(group) ?? '')
        .split(',')
        .filter((value) => value !== '' && known[group].has(value)),
    ),
  ]
  return {
    topic: read('topic'),
    text: read('text'),
    kind: withKinds(read('kind'), defaultKinds),
    concept: read('concept'),
  }
}

/** The query string that keeps a selection: `?topic=mind,self&kind=concept,term`, or none. */
export function writeSelection(
  selection: Selection,
  defaultKinds: readonly string[] = DEFAULT_KINDS,
): string {
  const kept = (group: FilterGroup) =>
    selection[group].length > 0 && !(group === 'kind' && sameKinds(selection.kind, defaultKinds))
  const parts = GROUPS.filter(kept).map((group) => `${group}=${selection[group].join(',')}`)
  return parts.length > 0 ? `?${parts.join('&')}` : ''
}

/** The selection a ToggleGroup's pressed values make. */
export function fromChips(
  values: readonly string[],
  defaultKinds: readonly string[] = DEFAULT_KINDS,
): Selection {
  const selection = {
    topic: [] as string[],
    text: [] as string[],
    kind: [] as string[],
    concept: [] as string[],
  }
  for (const value of values) {
    const at = value.indexOf(':')
    const group = value.slice(0, at) as FilterGroup
    if (GROUPS.includes(group)) selection[group].push(value.slice(at + 1))
  }
  return { ...selection, kind: withKinds(selection.kind, defaultKinds) }
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
