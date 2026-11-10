import { artFor, type SectionKey } from '@/art'

import { Sticker } from './Sticker'
import styles from './Sticker.module.css'

/** The picture at a section page's head, or its Interim picture until its own is made. */
export function SectionSticker({ section }: { section: Exclude<SectionKey, 'notFound'> }) {
  return (
    <Sticker
      art={artFor({ kind: 'section', key: section })}
      size={112}
      firstScreen
      className={styles.head}
    />
  )
}
