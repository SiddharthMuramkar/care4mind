# URLs and redirects

Type: grilling
Mode: HITL
Track: site
Status: open
Blocked by: 01, 03, 19, 20
Waits on: [Send the client the question list](01-client-question-list.md), [Every URL and hostname the current site serves](03-current-site-urls.md), [Keep, merge or drop each current page](19-keep-merge-drop.md), [Site map and navigation](20-site-map-and-navigation.md)
Map: [Care4Mind.org rebuild](../map.md)

## Question

What addresses does the new site use, and how does every old URL keep working (FR-07)?

**Addresses**

- The URL pattern for each type and landing page: flat like today's `/vikshepa/`, or prefixed like `/concepts/viksepa/`.
- Slug rules: lowercase ASCII, trailing slash, never changed once published, and the spelling chosen in [Sanskrit terms: storage and display](15-sanskrit-terms.md).
- Whether kept pages keep their current URL where it fits the scheme: `/frienorfoeofself/`, `/karta-2/`, `/institutes/`.
- Whether media keep their `/wp-content/uploads/` paths.

**Redirects**

Set a rule for every URL class from [Every URL and hostname the current site serves](03-current-site-urls.md): dropped and merged pages, category and author archives, `/blog/`, feeds, attachment pages, shortlinks and media size variants. For each class, decide:

- where it points
- how redirect chains and slash or letter-case variants are avoided
- whether a placeholder returns 410, if the client agreed
- whether the new site has a feed
- how FR-07 is tested before launch and right after it, within the boundary the client signed off

The row-by-row redirect file is made during the build.
