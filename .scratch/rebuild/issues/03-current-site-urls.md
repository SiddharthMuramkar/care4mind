# Every URL and hostname the current site serves

Type: research
Mode: AFK
Track: site
Status: resolved
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

## Answer

Researched 2026-10-26. Full findings: [`current-site-urls.md`](https://github.com/SiddharthMuramkar/care4mind/blob/research/current-site-urls/.scratch/rebuild/research/current-site-urls.md) on branch `research/current-site-urls` (pushed, never merged; commit `1fd8ef3`).

- The live sitemap lists exactly 43 URLs. Archives hold only 79 captures of 14 addresses, all still in the sitemap, so there are no old slugs to redirect. `/concepts/` moved from page 294 to 725.
- WordPress also serves feeds, `?p=`/`?page_id=` IDs, search, likely attachment pages and resized images, so redirects can be set per URL class.
- care4mind.org: two Namecheap EasyWP IPs, TTL 60 s; `www` is an alias that WordPress 301s to the apex. `questionnaire`: one DigitalOcean IP, TTL 1799 s, app on port 8020.
- Domain: Namecheap, expires 2027-09-13, transfer-locked, on PremiumDNS, no DNSSEC.
- Mail uses Namecheap forwarding (MX TTL 1800). SPF names only EasyWP. No DMARC or CAA record.

**Gaps** (all listed in the findings): 8 Common Crawl indexes timed out; http-to-https wasn't tested live; real visitor URLs (access logs, Search Console) only the client has.
