import { defineGlossaryEntry } from '@/content/schema'

// Two cards on the page; this keeps the description of the one in its alphabetical place.
export default defineGlossaryEntry({
  kind: 'glossary',
  slug: 'anavrtti',
  name: { ascii: 'Anavrtti', devanagari: 'अनावृत्तिः' },
  definition: 'The state of non-return, often referring to liberation (Moksha) in Vedanta.',
  url: 'https://dharmawiki.org/index.php/Anavrtti_(%E0%A4%85%E0%A4%A8%E0%A4%BE%E0%A4%B5%E0%A5%83%E0%A4%A4%E0%A5%8D%E0%A4%A4%E0%A4%BF%E0%A4%83)',
  provenance: {
    sources: [{ url: 'https://care4mind.org/concepts/', retrieved: '2026-10-27' }],
    edits: [
      'Interface text dropped: the link label “Click to learn more”; the link is the entry’s url.',
      'Merged: the page has two “Anavrtti (अनावृत्तिः)” cards with the same link. The entry keeps the description of the card in its alphabetical place; the other card’s, earlier in the A list, is dropped: “Anavrtti (Sanskrit: अनावृत्ति) is a Vedic term which means – non-return to a body, final emancipation.” → “”.',
      'Dropped with that description: its inline link on “Vedic”, a DharmaWiki red link, https://dharmawiki.org/index.php?title=Vedic&action=edit&redlink=1.',
      'The page around the cards is not carried over: its image (D18), its heading “Categories”, its letter tabs, and the note “No information available at this time.” under each letter with no cards (D, E, F, H, L, O, Q, W, X, Y and Z).',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page has two “Anavrtti (अनावृत्तिः)” cards with two descriptions. The entry keeps “The state of non-return, often referring to liberation (Moksha) in Vedanta.”, from the card in its alphabetical place, and drops “Anavrtti (Sanskrit: अनावृत्ति) is a Vedic term which means – non-return to a body, final emancipation.”, from the card out of place, which carries an inline DharmaWiki red link on “Vedic”. Choose the description. Nothing was looked up.',
      },
      {
        for: 'project-owner',
        note: 'Glossary descriptions, taken from the cards on the current /concepts/ page, may be adapted from DharmaWiki, the site each card links to. Decide whether they may be used, and how DharmaWiki is credited. Nothing was looked up.',
      },
    ],
  },
})
