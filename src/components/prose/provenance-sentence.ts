import type { CarriedOver } from '@/content'
import { listSeparator, wordList } from '@/lib/text'

const CURRENT_SITE = /^https?:\/\/(?:www\.)?care4mind\.org\//

/**
 * Where a record's text came from and whether anyone has reviewed it, as one sentence: the
 * words before its sources, each source with its separator and label, and the words after.
 */
export function provenanceSentence({ provenance, reviewStatus }: CarriedOver) {
  const { sources, drafted = [] } = provenance
  const review =
    reviewStatus === 'reviewed' ? 'Reviewed.' : 'Not yet reviewed by the Research editor.'
  if (provenance.origin === 'written') {
    const by = provenance.writtenBy ? ` by ${provenance.writtenBy}` : ''
    const on = provenance.writtenOn ? ` on ${provenance.writtenOn}` : ''
    return { opening: `Written for this site${by}${on}. `, sources: [], closing: review }
  }
  if (sources.length === 0) return { opening: '', sources: [], closing: review }
  const fromCurrentSite = sources.every((source) => CURRENT_SITE.test(source.url))
  const dates = [...new Set(sources.map((source) => source.retrieved))].sort()
  const draftedNote =
    drafted.length > 0
      ? `; its ${wordList(drafted)} ${drafted.length === 1 ? 'was' : 'were'} drafted for the new site`
      : ''
  return {
    opening: fromCurrentSite
      ? `Carried over from the current site’s ${sources.length === 1 ? 'page' : 'pages'} `
      : 'Taken from ',
    sources: sources.map((source, index) => ({
      url: source.url,
      label: source.url.replace(/^https?:\/\//, ''),
      before: listSeparator(index, sources.length),
    })),
    closing: `, read on ${wordList(dates)}${draftedNote}. ${review}`,
  }
}
