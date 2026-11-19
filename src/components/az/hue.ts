import type { CSSProperties } from 'react'

import type { FilterGroup } from './filter'

/**
 * A topic chip's hue, as the inline `--topic` its foot rule reads: never a `data-topic`, since a
 * Concept card's chip must stay the only one. Other chips take none.
 */
export function topicHue(group: FilterGroup, value: string): { style?: CSSProperties } {
  return group === 'topic'
    ? { style: { '--topic': `var(--color-topic-${value})` } as CSSProperties }
    : {}
}
