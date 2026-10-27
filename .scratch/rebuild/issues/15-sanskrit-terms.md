# Sanskrit terms: storage and display

Type: grilling
Mode: HITL
Track: site
Status: open
Blocked by: 02, 05, 07, 13
Waits on: [Sample the current site: content shape, navigation and brand](02-current-site-sample.md), [Search and Sanskrit spellings on Neon Postgres](05-search-and-sanskrit-spellings.md), [Typefaces for IAST and Devanagari](07-typefaces-iast-devanagari.md), [Content types, topics and shared fields](13-content-types-and-topics.md)
Map: [Care4Mind.org rebuild](../map.md)

## Question

How are Sanskrit terms stored and shown?

**Storage**

- Which records carry Sanskrit forms: Concept terms only, or also traditional-text titles, topic names and people's names?
- The canonical form: IAST, NFC-normalised.
- Which ASCII spellings are generated, and which are typed by hand?
- Is Devanagari generated or entered?
- Language tags: Sanskrit, Hindi, Pali.
- Where does the English gloss live?
- Which spelling forms the URL slug?

**Display**

- Which form leads in headings, page titles, navigation and links: IAST, the gloss, or both, as in today's "Vikshepa (Distraction)"?
- Where does Devanagari appear?
- Are the ASCII spellings shown?
- How are `lang` attributes set?

The developer decides. The client signs off the NFR-03 rule as a † item and says who checks the IAST and Devanagari, both through [Send the client the question list](01-client-question-list.md). This ticket doesn't wait for that reply.
