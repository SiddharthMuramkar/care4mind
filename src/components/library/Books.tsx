import type { Route } from 'next'
import Link from 'next/link'

import { turnForward } from '@/components/PageTurn'
import { Text } from '@/components/prose'
import type { Inline, ReferenceView, ResourceListView } from '@/content'

import styles from './books.module.css'
import { Shelf, Spine, toneAt } from './Shelf'
import { SourceLink } from './SourceLink'

type Group = ResourceListView['groups'][number]
type Book = { reference: ReferenceView; annotation?: Inline }

/** The authors as a spine names them: the label's names, without its year ("Hunt & Ellis"). */
const spineAuthors = (reference: ReferenceView) => reference.label.replace(/\s*\([^)]*\)\s*$/, '')

/** A book on the list: its title and authors set in type, its note, and where to find it. */
function BookEntry({ book, index }: { book: Book; index: number }) {
  const { reference, annotation } = book
  const details = [reference.year, reference.publisher, reference.edition].filter(Boolean)
  return (
    <li id={reference.anchor} className={styles.book} data-tone={toneAt(index)}>
      <h3 className={styles.title}>
        <cite>{reference.title}</cite>
      </h3>
      {reference.authors ? <p className={styles.authors}>{reference.authors}</p> : null}
      {details.length > 0 ? <p className={styles.details}>{details.join(' · ')}</p> : null}
      {annotation ? (
        <p className={styles.note}>
          <Text text={annotation} />
        </p>
      ) : null}
      <p className={styles.links}>
        <SourceLink reference={reference} />
        {/* The Reference's entry, made by hrefFor() in the content module. */}
        <Link href={reference.href as Route} transitionTypes={[...turnForward]} data-ink>
          In References
        </Link>
      </p>
    </li>
  )
}

/**
 * A reading list's group of books: their spines standing on a shelf (each a link to its entry
 * below), then each book with its note. On a phone only the list shows.
 */
export function BookGroup({ group }: { group: Group }) {
  const books = group.items.flatMap((item) =>
    item.type === 'reference'
      ? [{ reference: item.reference, ...(item.annotation ? { annotation: item.annotation } : {}) }]
      : [],
  )
  return (
    <section id={group.id} className={styles.group} aria-labelledby={`${group.id}-title`}>
      <h2 id={`${group.id}-title`} className={styles.groupTitle}>
        {group.heading}
      </h2>
      <Shelf label={`Shelf: ${group.heading}`} kind="books">
        {books.map(({ reference }, index) => (
          <Spine
            key={reference.id}
            href={`#${reference.anchor}`}
            name={reference.id}
            index={index}
            title={reference.title}
            {...(reference.authors ? { foot: spineAuthors(reference) } : {})}
          />
        ))}
      </Shelf>
      <ul className={styles.books}>
        {books.map((book, index) => (
          <BookEntry key={book.reference.id} book={book} index={index} />
        ))}
      </ul>
    </section>
  )
}
