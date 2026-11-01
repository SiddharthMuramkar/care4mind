import type { CarriedOver } from '@/content'

const CURRENT_SITE = /^https?:\/\/(?:www\.)?care4mind\.org\//

/** The separator before item `index` of `count`: "a", "a and b", "a, b and c". */
const before = (index: number, count: number) =>
  index === 0 ? '' : index === count - 1 ? ' and ' : ', '

/** Words listed in a sentence: "a", "a and b", "a, b and c". */
const listed = (words: readonly string[]) =>
  words.map((word, index) => `${before(index, words.length)}${word}`).join('')

/**
 * Where a record's text came from and whether anyone has reviewed it, as one sentence: the
 * words before its sources, each source with its separator and label, and the words after.
 */
export function provenanceSentence({ provenance, reviewStatus }: CarriedOver) {
  const { sources, drafted = [] } = provenance
  const review =
    reviewStatus === 'reviewed' ? 'Reviewed.' : 'Not yet reviewed by the Research editor.'
  if (sources.length === 0) return { opening: '', sources: [], closing: review }
  const fromCurrentSite = sources.every((source) => CURRENT_SITE.test(source.url))
  const dates = [...new Set(sources.map((source) => source.retrieved))].sort()
  const draftedNote =
    drafted.length > 0
      ? `; its ${listed(drafted)} ${drafted.length === 1 ? 'was' : 'were'} drafted for the new site`
      : ''
  return {
    opening: fromCurrentSite
      ? `Carried over from the current site’s ${sources.length === 1 ? 'page' : 'pages'} `
      : 'Taken from ',
    sources: sources.map((source, index) => ({
      url: source.url,
      label: source.url.replace(/^https?:\/\//, ''),
      before: before(index, sources.length),
    })),
    closing: `, read on ${listed(dates)}${draftedNote}. ${review}`,
  }
}
