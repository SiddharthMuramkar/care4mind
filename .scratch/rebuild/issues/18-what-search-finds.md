# What search finds

Type: grilling
Mode: HITL
Track: site
Status: open
Blocked by: 05, 14, 15, 16, 17
Waits on: [Search and Sanskrit spellings on Neon Postgres](05-search-and-sanskrit-spellings.md), [Links between content, and links to modern constructs](14-content-links.md), [Sanskrit terms: storage and display](15-sanskrit-terms.md), [Traditional texts and passages](16-traditional-texts.md), [References, people and journals](17-references-people-journals.md)
Map: [Care4Mind.org rebuild](../map.md)

## Question

What exactly does site search do? Decide:

- which types and fields are searched: titles, summaries, full text, glosses, Reference authors, traditional texts and passages, keywords
- how results are ranked, grouped and filtered
- whether typos and Devanagari input are tolerated
- whether searching a modern term such as "anxiety" returns Concepts linked to that construct, and how those results are labelled so they never imply the two are equivalent
- how the results page behaves: results as you type, or on submit

End with concrete test cases. For example: vikshepa, viksepa, vikṣepa and विक्षेप all find the same Concept. The [Architecture review](23-architecture-review.md) picks a technology that passes them.
