import type { ReactNode } from 'react'

import { cx } from '@/lib/cx'

import { Breadcrumbs } from '../Breadcrumbs'
import { Folio } from '../Folio'
import { PageTurn, TitleMorph, type TitleMorphKind } from '../PageTurn'
import styles from './ReadingPage.module.css'

/** How wide the folio stands, named for what sits on it rather than for its measure. */
export type ReadingPageWidth =
  'reading' | 'library' | 'libraryContents' | 'shelf' | 'manuscript' | 'plate' | 'contents' | 'map'

const widthClass: Record<ReadingPageWidth, string | undefined> = {
  reading: undefined,
  library: styles.library,
  libraryContents: styles.libraryContents,
  shelf: styles.shelf,
  manuscript: styles.manuscript,
  plate: styles.plate,
  contents: styles.contents,
  map: styles.map,
}

interface ReadingPageProps {
  /** The page's own path, which its breadcrumb trail resolves. */
  path: string
  /** Pairs the folio's `aria-labelledby` with the title's id. Omit it only where the folio is no article. */
  titleId?: string
  title: ReactNode
  /** A long name is set a size down. */
  longTitle?: boolean
  titleClassName?: string
  /** The title flies in from its card: the kind of thing it names, and its slug. */
  titleMorph?: { kind: TitleMorphKind; slug: string }
  /** Set above the title, as the kicker is. */
  beforeTitle?: ReactNode
  kicker?: ReactNode
  /** The rest of the title page: a gloss, a summary, what the page holds. */
  afterTitle?: ReactNode
  headerClassName?: string
  /** Set inside the page's main, above the trail. */
  beforeTrail?: ReactNode
  width?: ReadingPageWidth
  /** Set on the page's main, beside the shell's own: a page's print rules key off it. */
  pageClassName?: string
  articleClassName?: string
  children: ReactNode
}

/**
 * The shell every page below the homepage is set in: the page turn, the skip link's target,
 * the breadcrumb trail and the paper folio opened by its title page, so the pair of
 * `aria-labelledby` and the title's id can never drift apart. A page renders it from its
 * own `page.tsx`, never from a layout, because a page turn needs the wrapper inside the page.
 */
export function ReadingPage({
  path,
  titleId,
  title,
  longTitle = false,
  titleClassName,
  titleMorph,
  beforeTitle,
  kicker,
  afterTitle,
  headerClassName,
  beforeTrail,
  width = 'reading',
  pageClassName,
  articleClassName,
  children,
}: ReadingPageProps) {
  const heading = (
    <h1
      {...(titleId ? { id: titleId } : {})}
      className={cx(styles.title, longTitle && styles.titleLong, titleClassName)}
    >
      {title}
    </h1>
  )
  return (
    <PageTurn>
      <main id="main" className={cx(styles.page, widthClass[width], pageClassName)}>
        {beforeTrail}
        <Breadcrumbs path={path} />
        <Folio
          variant="page"
          {...(titleId ? { as: 'article' as const, 'aria-labelledby': titleId } : {})}
          className={cx(styles.article, articleClassName)}
        >
          <header className={cx(styles.titlePage, headerClassName)}>
            {beforeTitle}
            {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
            {titleMorph ? (
              <TitleMorph kind={titleMorph.kind} slug={titleMorph.slug}>
                {heading}
              </TitleMorph>
            ) : (
              heading
            )}
            {afterTitle}
          </header>
          {children}
        </Folio>
      </main>
    </PageTurn>
  )
}
