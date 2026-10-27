import { defineGlossaryEntry } from '@/content/schema'

// The /anubandha-chatushtaya/ post, a single sentence, merges into this entry (design B4).
export default defineGlossaryEntry({
  kind: 'glossary',
  slug: 'anubandha-chatushtaya',
  name: { ascii: 'Anubandha Chatushtaya', devanagari: 'अनुबन्धचतुष्टयम्' },
  definition:
    'The fourfold requisites for studying Vedanta: subject, purpose, connection, and eligibility. Anubandha Chatushtaya (Samskrit: अनुबन्धचतुष्टयम्) literally means four connections, with which all shastras are begun with.',
  url: 'https://dharmawiki.org/index.php/Anubandha_Chatushtaya_(%E0%A4%85%E0%A4%A8%E0%A5%81%E0%A4%AC%E0%A4%A8%E0%A5%8D%E0%A4%A7%E0%A4%9A%E0%A4%A4%E0%A5%81%E0%A4%B7%E0%A5%8D%E0%A4%9F%E0%A4%AF%E0%A4%AE%E0%A5%8D)',
  provenance: {
    sources: [
      { url: 'https://care4mind.org/concepts/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/anubandha-chatushtaya/', retrieved: '2026-10-27' },
    ],
    edits: [
      'Interface text dropped: the link label “Click to learn more”; the link is the entry’s url.',
      'Merged: the post https://care4mind.org/anubandha-chatushtaya/, a single sentence, joins this card. The description is the card’s, then the post’s sentence: “The fourfold requisites for studying Vedanta: subject, purpose, connection, and eligibility. Anubandha Chatushtaya (Samskrit: अनुबन्धचतुष्टयम्) literally means four connections, with which all shastras are begun with.”',
      'Interface text dropped from the post: “(Read more…)”, twice, linking to the DharmaWiki article this entry links to.',
      'The page around the cards is not carried over: its image (D18), its heading “Categories”, its letter tabs, and the note “No information available at this time.” under each letter with no cards (D, E, F, H, L, O, Q, W, X, Y and Z).',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The post’s sentence, now the end of this entry’s description, may be adapted from DharmaWiki: the post wraps it in “(Read more…)” links to DharmaWiki’s Anubandha Chatushtaya article. Decide how to credit DharmaWiki. Nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'project-owner',
        note: 'Glossary descriptions, taken from the cards on the current /concepts/ page, may be adapted from DharmaWiki, the site each card links to. Decide whether they may be used, and how DharmaWiki is credited. Nothing was looked up.',
      },
    ],
  },
})
