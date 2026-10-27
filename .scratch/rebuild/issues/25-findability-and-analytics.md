# Findability: page metadata, sitemap, link checks and analytics

Type: grilling
Mode: HITL
Track: site
Status: open
Blocked by: 01, 20, 23
Waits on: [Send the client the question list](01-client-question-list.md), [Site map and navigation](20-site-map-and-navigation.md), [Architecture review](23-architecture-review.md)
Map: [Care4Mind.org rebuild](../map.md)

## Question

How does every page meet NFR-04?

**Page metadata and links**

- How titles and descriptions are produced, and the title format.
- Each page's canonical URL.
- What the XML sitemap includes.
- How internal links stay unbroken: links made by picking content, a link check before each deploy, and migrated links rewritten.
- Social sharing previews.

**Analytics (open question 7)**

- Which tool. Vercel Web Analytics is the default to beat.
- What it may record: page views, referrers, search terms, and Questionnaire starts and completions. Never answers or results.
- Whether a consent banner is needed where the client is based.
- How Search Console is set up, and who owns it.
