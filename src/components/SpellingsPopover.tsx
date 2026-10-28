import { useId } from 'react'

import styles from './SpellingsPopover.module.css'

interface Props {
  iast: string
  spellings: readonly string[]
}

/**
 * NFR-03: the plain-keyboard spellings a term also goes by, one click away.
 * A native popover, so it needs no JavaScript: the button opens and closes it,
 * and Escape or a press elsewhere closes it. Focus stays on the button, the
 * popover's Close comes next in the tab order, and closing it from inside
 * hands focus back to the button.
 */
export function SpellingsPopover({ iast, spellings }: Props) {
  const id = useId()
  if (spellings.length === 0) return null
  const popup = `${id}spellings`
  const title = `${id}title`
  return (
    <>
      <button type="button" popoverTarget={popup} className={styles.trigger}>
        Also spelled
      </button>
      <div id={popup} popover="auto" role="dialog" aria-labelledby={title} className={styles.popup}>
        <h2 id={title} className={styles.title}>
          Other spellings of <span lang="sa-Latn">{iast}</span>
        </h2>
        <ul className={styles.list}>
          {spellings.map((spelling) => (
            <li key={spelling} lang="sa-Latn">
              {spelling}
            </li>
          ))}
        </ul>
        <button
          type="button"
          popoverTarget={popup}
          popoverTargetAction="hide"
          className={styles.close}
        >
          Close
        </button>
      </div>
    </>
  )
}
