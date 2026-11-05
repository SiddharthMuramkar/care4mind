import { hrefFor } from '@/content'
import { cx } from '@/lib/cx'

import cta from '@/components/Cta'
import styles from './SearchForm.module.css'

/**
 * The search box, as the search page and the 404 page set it: a plain form the server answers,
 * so it works without JavaScript. On a page whose one primary button is another link, its
 * button takes the secondary call.
 */
export function SearchForm({
  query = '',
  variant = 'primary',
  id = 'search-query',
}: {
  /** The words already searched for, left in the box. */
  query?: string
  variant?: 'primary' | 'secondary'
  /** The input's id, which its label names. */
  id?: string
}) {
  return (
    <form action={hrefFor({ page: 'search' })} role="search" className={styles.form}>
      <label htmlFor={id} className={styles.label}>
        A Concept, a term, a verse, a text or an author
      </label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={query}
        placeholder="Try: focus, anger, Gītā…"
        className={styles.input}
      />
      <button type="submit" className={cx(cta[variant], styles.button)}>
        Search
      </button>
    </form>
  )
}
