'use client'

import { Popover } from '@base-ui/react/popover'

import styles from './SpellingsPopover.module.css'

interface Props {
  iast: string
  spellings: readonly string[]
}

/** NFR-03: the plain-keyboard spellings a term also goes by, one click away. */
export function SpellingsPopover({ iast, spellings }: Props) {
  if (spellings.length === 0) return null
  return (
    <Popover.Root>
      <Popover.Trigger className={styles.trigger}>Also spelled</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={10} align="start" className={styles.positioner}>
          <Popover.Popup className={styles.popup}>
            <Popover.Arrow className={styles.arrow} />
            <Popover.Title className={styles.title}>
              Other spellings of <span lang="sa-Latn">{iast}</span>
            </Popover.Title>
            <ul className={styles.list}>
              {spellings.map((spelling) => (
                <li key={spelling} lang="sa-Latn">
                  {spelling}
                </li>
              ))}
            </ul>
            <Popover.Close className={styles.close}>Close</Popover.Close>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
