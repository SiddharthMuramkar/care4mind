import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { site } from '@/content'
import { cx } from '@/lib/cx'

import { Breadcrumbs } from '@/components/breadcrumbs/Breadcrumbs'
import { Folio } from '@/components/folio/Folio'
import { PageTurn } from '@/components/page-turn'
import styles from './ReadingPage.module.css'

/** The folio is named by its title, and a page has one of each. */
const TITLE_ID = 'page-title'

/**
 * How wide a page's folio may grow: a reading measure; wide, for columns or a plate beside the
 * cards; contents, wide only where the contents fit beside the text; plate, for the Concept map.
 */
export type PageWidth = 'reading' | 'wide' | 'contents' | 'plate'

const widths: Record<PageWidth, string | undefined> = {
  reading: undefined,
  wide: styles.wide,
  contents: styles.contents,
  plate: styles.plate,
}

interface PageMainProps {
  width?: PageWidth
  className?: string | undefined
  children: ReactNode
}

/** The page's main landmark, the skip link's target, inside the page turn. */
export function PageMain({ width = 'reading', className, children }: PageMainProps) {
  return (
    <PageTurn>
      <main id="main" className={cx(styles.page, widths[width], className)}>
        {children}
      </main>
    </PageTurn>
  )
}

interface ReadingPageProps extends PageMainProps {
  /** The page's own address, whose trail leads to it from Home. */
  path: string
  articleClassName?: string | undefined
  /** What stands above the trail, outside the folio. */
  lead?: ReactNode
}

/**
 * A page below the homepage: its trail, then one folio of paper named by its title. Each page
 * renders it itself, never a layout, so that the page turn takes the whole page. A path the route
 * registry doesn't list, such as a switched-off feature's, is not found, so the page answers 404.
 */
export async function ReadingPage({
  path,
  articleClassName,
  lead,
  children,
  ...main
}: ReadingPageProps) {
  const bare = path.replace(/[?#].*$/, '')
  if (!(await site.routes()).some((route) => route.path === bare)) notFound()
  return (
    <PageMain {...main}>
      {lead}
      <Breadcrumbs path={path} />
      <Folio
        as="article"
        className={cx(styles.article, articleClassName)}
        aria-labelledby={TITLE_ID}
      >
        {children}
      </Folio>
    </PageMain>
  )
}

/** The title page: the folio's centred head, which holds its title. */
export function TitlePage({ className, children }: { className?: string; children: ReactNode }) {
  return <header className={cx(styles.titlePage, className)}>{children}</header>
}

interface PageTitleProps {
  /** A long name (a topic, an English-titled page), set a size down. */
  long?: boolean
  className?: string | undefined
  children: ReactNode
}

/** The page's one h1, which names its folio. */
export function PageTitle({ long = false, className, children }: PageTitleProps) {
  return (
    <h1 id={TITLE_ID} className={cx(styles.title, long && styles.long, className)}>
      {children}
    </h1>
  )
}
