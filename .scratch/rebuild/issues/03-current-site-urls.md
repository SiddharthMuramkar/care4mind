# Every URL and hostname the current site serves

Type: research
Mode: AFK
Track: site
Status: open
Blocked by: none
Map: [Care4Mind.org rebuild](../map.md)

## Question

Which URLs has the current site served beyond the 43 in its sitemap, and how are its hostnames set up? FR-07 promises that none of them returns 404 after launch, and the launch cutover changes DNS.

- **Archived URLs.** From the Wayback Machine's capture index (the CDX API) for care4mind.org and questionnaire.care4mind.org, list every URL class with counts and examples:
  - pages and posts
  - feeds: main, comment, category and author
  - `/page/N/` pagination and attachment pages
  - `?p=` and `?page_id=` shortlinks, and search URLs
  - media files and their size variants
  - old slugs seen only in archives
- **The current sitemap.** Confirm the current list from the sitemap and its child sitemaps. That takes a few requests to care4mind.org, spaced out.
- **Domain and DNS.** Using public RDAP and DNS lookups only, record:
  - the registrar, expiry date and nameservers
  - the apex, www, questionnaire, MX, SPF, DMARC and CAA records, with their TTLs

Nobody decides here. The facts feed [URLs and redirects](24-urls-and-redirects.md) and the launch cutover. Keep author usernames out of the committed findings.
