/**
 * The plain renderer for content text: a record's sections and blocks, running text with its
 * Devanagari tagged and its citations linked, and where the text came from.
 */
export { Blocks, Sections } from './Blocks'
export { Provenance } from './Provenance'
export { RecordLink } from './RecordLink'
export { citationLinks, Text, type CitationLinks, type CitedEntry } from './Text'
export { VerseCard } from './VerseCard'
export { citedIn, parenthesised } from './in-text-citations'
export { provenanceSentence } from './provenance-sentence'
export { standingIn } from './standing-in'
export { verseAsText } from './verse-text'
