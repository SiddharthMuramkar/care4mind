import type { ReferenceView } from '@/content'

// The citation style is still to be chosen. Until then a Reference follows the APA-like pattern
// the current site uses.

export type CitationSource = Pick<
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

export interface CitationLink {
  href: string
  label: string
}

/** The runs a citation prints: the lead, the title, what follows it, and its link. */
export interface CitationParts {
  before: string
  title: string
  after: string
  link: CitationLink | null
}

/** A part that already ends in a stop keeps it, so "Inc." is not printed "Inc..". */
function withStop(part: string): string {
  return /[.?!]$/.test(part) ? part : `${part}.`
}

function linkFor(reference: CitationSource): CitationLink | null {
  if (reference.doi)
    return { href: `https://doi.org/${reference.doi}`, label: `doi:${reference.doi}` }
  if (reference.url)
    return { href: reference.url, label: new URL(reference.url).hostname.replace(/^www\./, '') }
  return null
}

/** Container, then volume and issue, pages, then publisher: both a chapter's homes, where it has them. */
function publicationOf(reference: CitationSource): string {
  const volume =
    reference.volume === undefined || reference.issue === undefined
      ? reference.volume
      : `${reference.volume}(${reference.issue})`
  const published = [reference.container, volume, reference.pages, reference.publisher]
    .filter((part) => part !== undefined)
    .join(', ')
  return published ? withStop(published) : ''
}

/**
 * One Reference split into the runs the citation prints. The author run ends with a stop, so a
 * Reference with no year doesn't run the author into the title.
 */
export function citationParts(reference: CitationSource): CitationParts {
  const authors = reference.authors ? withStop(reference.authors) : ''
  const year = reference.year ? withStop(`(${reference.year})`) : ''
  const before = [authors, year].filter(Boolean).join(' ')
  const edition = reference.edition ? ` (${reference.edition})` : ''
  const titleStop = /[.?!]$/.test(`${reference.title}${edition}`) ? '' : '.'
  const publication = publicationOf(reference)
  const body = publication ? `${edition}${titleStop} ${publication}` : `${edition}${titleStop}`
  const link = linkFor(reference)
  return {
    before,
    title: reference.title,
    after: body || link ? `${body} ` : '',
    link,
  }
}

/** The citation as one line, the trailing space before a missing link left off. */
export function citationText(reference: CitationSource): string {
  const { before, title, after, link } = citationParts(reference)
  return `${before ? `${before} ` : ''}${title}${after}${link?.label ?? ''}`.trimEnd()
}
