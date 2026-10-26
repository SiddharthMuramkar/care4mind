# Editing trial

Type: prototype
Mode: HITL
Track: site
Status: open
Blocked by: 04, 14, 15, 17
Waits on: [App framework and content back end on Vercel and Neon](04-framework-and-content-back-end.md), [Links between content, and links to modern constructs](14-content-links.md), [Sanskrit terms: storage and display](15-sanskrit-terms.md), [References, people and journals](17-references-people-journals.md)
Map: [Care4Mind.org rebuild](../map.md)

## Question

Is editing in the recommended content back end good enough for Content editors who aren't developers (FR-02)?

First, write down the editing needs FR-02 implies, assuming one to three non-technical editors:

- which types they edit
- drafts and a review step
- preview and revision history
- typing IAST and Devanagari
- linking related content by picking it
- images with required alt text
- how soon a published change must appear

Then coding agents set up the recommended back end, plus the runner-up if it's close. Use a throwaway Vercel preview with a Neon branch, or a local install. Model a Concept, a Reference and a traditional text, linked as the content-model tickets define them. Add two or three sample items from [Sample the current site: content shape, navigation and brand](02-current-site-sample.md), including a term in its IAST, Devanagari and ASCII spellings.

The developer tries the editing and records a verdict. Nothing is kept, and nothing touches the current site.
