import { Transliterated } from '@/components/script'
import type { TopicRef } from '@/content'
import { cx } from '@/lib/cx'

import styles from './TopicChip.module.css'

/**
 * A topic named in words, never by colour alone: ink text on the paper, with a dot drawn in
 * the topic's hue. A label, not a link: the page's trail already leads to the topic, and on a
 * card the card's own action leads where it leads.
 */
export function TopicChip({ topic, className }: { topic: TopicRef; className?: string }) {
  return (
    <span className={cx(styles.chip, className)} data-topic={topic.slug}>
      <Transliterated text={topic.name} />
    </span>
  )
}
