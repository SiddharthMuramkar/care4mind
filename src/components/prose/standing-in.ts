import type { SectionView } from '@/content'

/**
 * The topic introduction a section stands in for: a section holding nothing but a shared topic
 * introduction whose own section has the same id and heading (the values Concepts' yama–niyama
 * section). Drawn in the section's place, its heading shows once and its anchor stays unique.
 */
export function standingIn(section: SectionView) {
  const [only, ...rest] = section.blocks
  if (only?.kind !== 'topic-intro' || rest.length > 0) return undefined
  const own = only.sections.find(
    (inner) => inner.id === section.id && inner.heading === section.heading,
  )
  return own && { own, others: only.sections.filter((inner) => inner !== own), topic: only.topic }
}
