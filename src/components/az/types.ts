import type { ComponentType } from 'react'

import type { LatinScript } from '@/content'

import type { FilterGroup } from './filter'

/** A letter of the rail: a link to its section while it has entries, plain text otherwise. */
export interface RailLetter {
  letter: string
  /** Its section's id: `letter-a`, and `letter-other` for names starting otherwise. */
  id: string
  filled: boolean
}

/** A chip; `V` names the values its row takes, such as an entry's kinds. */
export interface Chip<V extends string = string> {
  value: V
  label: string
  /** Set when the label is a transliteration, such as a work's title. */
  lang?: LatinScript
}

/** One row of chips: the topics, the works, or what kind of entry. */
export interface ChipGroup<V extends string = string> {
  group: FilterGroup
  label: string
  chips: readonly Chip<V>[]
}

export interface RailProps {
  letters: readonly RailLetter[]
  /** The ids of the letters a filter leaves showing; null while nothing is filtered. */
  showing: ReadonlySet<string> | null
}

export interface ChipsProps {
  groups: readonly ChipGroup[]
  /** The pressed chips' values (`topic:mind`). */
  pressed: readonly string[]
  onPress: (pressed: string[]) => void
}

/** The rail and the chips with Base UI's keyboard handling: one Tab stop each, arrows between. */
export interface KeyboardParts {
  Rail: ComponentType<RailProps>
  Chips: ComponentType<ChipsProps>
}
