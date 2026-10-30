import type { Route } from 'next'
import Link from 'next/link'

import { turnForward } from '@/components/PageTurn'
import { LinkPreview, type PreviewPayload } from '@/components/preview/LinkPreview'
import { Text } from '@/components/prose'
import { ScriptPair } from '@/components/script/ScriptPair'
import type { AzEntry as Entry } from '@/content'

import styles from './az.module.css'

/** The sites glossary entries lead to, by the name a reader knows them by. */
const SITES: Readonly<Record<string, string>> = { 'dharmawiki.org': 'DharmaWiki' }

const siteOf = (href: string) => {
  const host = new URL(href).hostname.replace(/^www\./, '')
  return SITES[host] ?? host
}

/**
 * What an entry is, in words: a Concept page, a term explained in one or in a topic, or a
 * glossary entry. Plain text: the entry's own link already leads there, and a second link on
 * every term would weigh on a long page.
 */
function Kind({ entry, topicNames }: { entry: Entry; topicNames: ReadonlyMap<string, string> }) {
  if (entry.kind === 'concept') return <>Concept page</>
  if (entry.kind === 'glossary') return <>Glossary</>
  if (entry.concept)
    return (
      <>
        Term in{' '}
        <span
          className={styles.within}
          {...(entry.concept.lang ? { lang: entry.concept.lang } : {})}
        >
          {entry.concept.name}
        </span>
      </>
    )
  const [topic] = entry.topics
  const name = topic === undefined ? undefined : topicNames.get(topic)
  return name ? (
    <>
      Term in the introduction to <span className={styles.within}>{name}</span>
    </>
  ) : (
    <>Term</>
  )
}

/**
 * One entry of the A–Z, set like a dictionary's: its name in both scripts (ScriptPair), what it
 * is, and a glossary entry's own description. It carries its topics, works and kind for the
 * filter chips, and every glossary anchor it answers to (`/concepts/#<slug>`).
 */
export function AzEntry({
  entry,
  topicNames,
  preview,
}: {
  entry: Entry
  topicNames: ReadonlyMap<string, string>
  /** The preview a Concept's link shows (ticket 05's LinkPreview). */
  preview?: PreviewPayload
}) {
  const [anchor, ...more] = entry.anchors
  const name =
    entry.lang || entry.devanagari ? (
      <ScriptPair
        iast={entry.name}
        {...(entry.devanagari ? { devanagari: entry.devanagari } : {})}
        devanagariClassName={styles.deva}
      />
    ) : (
      <span>{entry.name}</span>
    )
  const href = entry.href
  let heading = name
  if (href && entry.external)
    heading = (
      <a href={href} className={styles.link}>
        {name}{' '}
        <span className={styles.away}>
          on {siteOf(href)}
          <span aria-hidden> ↗</span>
        </span>
      </a>
    )
  else if (href) {
    // An A–Z entry's page or anchor, made by hrefFor() in the content module.
    const link = (
      <Link href={href as Route} className={styles.link} transitionTypes={turnForward}>
        {name}
      </Link>
    )
    heading = preview ? <LinkPreview preview={preview}>{link}</LinkPreview> : link
  }

  return (
    <li
      {...(anchor ? { id: anchor } : {})}
      className={styles.entry}
      data-entry
      data-kind={entry.kind}
      {...(entry.topics.length > 0 ? { 'data-topics': entry.topics.join(' ') } : {})}
      {...(entry.works.length > 0 ? { 'data-works': entry.works.join(' ') } : {})}
    >
      {more.map((id) => (
        <span key={id} id={id} className={styles.anchor} />
      ))}
      <p className={styles.name}>{heading}</p>
      <p className={styles.meta}>
        {entry.gloss ? <span className={styles.gloss}>{entry.gloss} · </span> : null}
        <Kind entry={entry} topicNames={topicNames} />
      </p>
      {entry.definition ? (
        <p className={styles.definition}>
          <Text text={entry.definition} />
        </p>
      ) : null}
      {entry.spellings.length > 0 ? (
        <p className={styles.spellings}>
          Also spelled <span lang="sa-Latn">{entry.spellings.join(', ')}</span>
        </p>
      ) : null}
    </li>
  )
}
