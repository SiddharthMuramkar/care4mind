import type { ReferenceView } from '@/content'

// The site's citation style is still to be chosen. Until then
// References follow the APA-like pattern the current site uses.

/** What a citation prints of its Reference. */
export type Cited = Pick<
  ReferenceView,
  | 'authors'
  | 'year'
  | 'title'
  | 'edition'
  | 'container'
  | 'publisher'
  | 'volume'
  | 'issue'
  | 'pages'
  | 'doi'
  | 'url'
>

/** A Reference's citation, part by part, each part ending in its own stop. */
export interface CitationParts {
  /** Its authors and year: "IGNOU. (2017).". */
  authorship?: string
  title: string
  /** What follows the title: its edition and the title's stop, " (2nd ed.).". */
  titleEnd: string
  /** Where it was published: container, volume(issue), pages, then publisher. */
  publication?: string
  link?: { href: string; label: string }
}

/** The part, with a full stop unless it already ends in one. */
const stopped = (part: string) => (/[.?!]$/.test(part) ? part : `${part}.`)

function linkFor(reference: Cited): CitationParts['link'] {
  if (reference.doi)
    return { href: `https://doi.org/${reference.doi}`, label: `doi:${reference.doi}` }
  if (reference.url)
    return { href: reference.url, label: new URL(reference.url).hostname.replace(/^www\./, '') }
  return undefined
}

/** One Reference's citation, part by part. */
export function citationParts(reference: Cited): CitationParts {
  const volume =
    reference.volume === undefined || reference.issue === undefined
      ? reference.volume
      : `${reference.volume}(${reference.issue})`
  const authorship = [
    reference.authors && stopped(reference.authors),
    reference.year && `(${reference.year}).`,
  ]
    .filter(Boolean)
    .join(' ')
  const titled = `${reference.title}${reference.edition ? ` (${reference.edition})` : ''}`
  const publication = [reference.container, volume, reference.pages, reference.publisher]
    .filter((part) => part !== undefined)
    .join(', ')
  return {
    authorship: authorship || undefined,
    title: reference.title,
    titleEnd: stopped(titled).slice(reference.title.length),
    publication: publication ? stopped(publication) : undefined,
    link: linkFor(reference),
  }
}
