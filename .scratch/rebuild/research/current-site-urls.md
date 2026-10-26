# Every URL and hostname the current site serves: research findings

Ticket: [Every URL and hostname the current site serves](../issues/03-current-site-urls.md) · Researched 2026-10-26 · Branch: research/current-site-urls

## Summary

- **Web archives hold very little of the current site.** The Wayback Machine has 79 captures of 14 addresses: the home page (in its http, https and www forms), 12 other sitemap URLs, and the questionnaire app's home page. Common Crawl holds the same pages plus `/robots.txt`. archive.today holds none. No media file, feed, shortlink or search URL was ever captured on its own.
- **Links inside the 69 archived pages name more addresses**, but no old ones. Every page, post, category and author address found in them is still in today's sitemap, so the archives show no old slugs (a slug is the name part of an address, such as `vikshepa` in `/vikshepa/`). They do add these addresses:
  - 4 feeds
  - 11 `?p=` shortlinks
  - 67 media URLs: 25 files, mostly with their resized copies
  - REST API and oEmbed links (oEmbed is the address other sites use to embed a preview of a page)
  - hundreds of theme and plugin files
- **Two addresses changed what they point to.** `/concepts/` was WordPress page 294 until at least February 2025 and has been page 725 since April 2025. The home page was a list of posts until February 2025, then page 639, then page 1145, and has been page 1371 since May 2025. Their old shortlinks (`/?p=294` and so on) may now go somewhere else or nowhere.
- **The sitemap still lists exactly 43 URLs** (6 posts, 33 pages, 2 category archives, 2 author archives), the same as [current-site.md](../../../docs/current-site.md). No page was changed after 16 October 2025, and no post after 18 December 2023.
- **WordPress answers many more address forms than any archive shows**, because its code builds them for every post, page, author, category and image. Examples are feed variants, `/?p=ID` and `/?page_id=ID`, `/?s=` searches, attachment pages, date archives, embed URLs and up to six resized copies of each image. FR-07's redirect rules can be written per class of address rather than per URL.
- **Hostnames:**
  - `care4mind.org` points at two Namecheap EasyWP addresses (EasyWP is Namecheap's managed WordPress hosting), cached for 60 seconds.
  - `www.care4mind.org` is an alias of `care4mind.org`, and WordPress sends www visitors to `https://care4mind.org/` with a permanent redirect.
  - `questionnaire.care4mind.org` points at one DigitalOcean server, cached for 1,799 seconds. Its app ran on port 8020 over plain HTTP. By January 2026 its home page linked to `/login-user` and 17 `/login/N` pages.
- **The domain:**
  - Registered at Namecheap on 13 Sep 2023; expires 13 Sep 2027.
  - Locked against transfer, and the owner's details are hidden by a privacy service.
  - Its DNS runs on Namecheap PremiumDNS, a paid add-on.
- **Email and security records:**
  - Mail goes to Namecheap's free email forwarding.
  - The one SPF record authorises only EasyWP's mail servers. SPF is a DNS record listing who may send mail for the domain.
  - There is no DMARC record (DMARC tells receivers what to do with mail that fails those checks).
  - There is no CAA record (CAA limits which companies may issue the site's HTTPS certificates).
  - There is no DNSSEC (DNS signing).

## Findings

Unless a line says otherwise, every source was read on 2026-10-26. Author usernames are written as `<username>`.

### Archived URLs

#### What the archives hold

| Archive | What was asked | What came back |
| --- | --- | --- |
| Wayback Machine capture index ("CDX API", the Internet Archive's list of every page copy it holds) | Every capture for `care4mind.org` and all its subdomains (`matchType=domain`, which the [CDX server docs](https://github.com/internetarchive/wayback/blob/master/wayback-cdx-server/README.md) define as "host archive.org and all subhosts") | 79 captures of 14 addresses, Sep 2023 to Jun 2026 ([query](https://web.archive.org/cdx/search/cdx?url=care4mind.org&matchType=domain&output=json&fl=urlkey,timestamp,original,mimetype,statuscode,digest,length)). Prefix queries for `care4mind.org/*` and `www.care4mind.org/*` each returned the same 76 non-questionnaire rows. |
| Wayback Machine page copies | The 69 distinct page copies, fetched unchanged (`id_` mode), to read their links | All 69 read; links extracted by a script. Nothing in them was run. |
| Common Crawl index (a non-profit's monthly web crawl) | `*.care4mind.org` in each of the 34 monthly crawls from Sep 2023 to Oct 2026 ([crawl list](https://index.commoncrawl.org/collinfo.json)) | 20 crawls hold captures, 6 hold none, and 8 timed out after three tries (see Gaps). The captures match the Wayback ones, with the same timestamps. On top of those, Common Crawl has:<br>• `/robots.txt` (200, 20 captures from Aug 2024 to Sep 2026)<br>• `questionnaire.care4mind.org:8020/robots.txt` (404)<br>• a `/dosha-survey/` capture from 17 Aug 2026<br>• an `/institutes/` capture from 12 Sep 2026 |
| archive.today | Its list of copies for `https://care4mind.org/`, `http://care4mind.org/` and `http://questionnaire.care4mind.org:8020/` | "The archive has no Mementos for the requested URI" for all three ([example](https://archive.ph/timemap/https://care4mind.org/)). Its whole-domain search returned a CAPTCHA, so it wasn't read. |

Wayback captures by address, from the [CDX query](https://web.archive.org/cdx/search/cdx?url=care4mind.org&matchType=domain&output=json&fl=urlkey,timestamp,original,mimetype,statuscode,digest,length):

| Address | Captures | First | Last | Notes |
| --- | --- | --- | --- | --- |
| `https://care4mind.org/` | 22 | 2024-08-11 | 2026-06-14 | 21 × 200, 1 duplicate ("revisit") |
| `http://care4mind.org/` | 4 | 2023-09-24 | 2025-07-19 | all 301; the Sep 2023 and Jul 2025 ones lead to `https://care4mind.org/` (the other two share a timestamp with an https copy, so their target couldn't be read) |
| `http://www.care4mind.org/` | 3 | 2023-10-31 | 2024-09-08 | 301; in Oct 2023 to `https://care4mind.org/`, in Sep 2024 to `https://www.care4mind.org/` |
| `https://www.care4mind.org/` | 2 | 2024-09-08 | 2024-09-08 | 200: in Sep 2024 www served the page itself instead of redirecting |
| `/concepts/` | 6 | 2024-08-11 | 2026-05-17 | |
| `/teertha-yatra-quiz/` | 5 | 2024-08-11 | 2026-03-16 | |
| `/karmayoga-scale/` | 4 | 2024-08-11 | 2025-10-16 | |
| `/category/uncategorized/`, `/dosha-survey/`, `/institutes/`, `/text-books/`, `/text-books-2-2/`, `/triguna/` | 4 each | 2025-04-18 | 2026-06-14 | |
| `/author/<username>/` | 2 | 2025-04-18 | 2025-09-07 | one of the two author archives |
| `/methods/`, `/resources/` | 2 each | 2025-12-07 | 2026-05-17 | |
| `http://questionnaire.care4mind.org:8020/` | 3 | 2025-04-21 | 2026-01-15 | see [The questionnaire host](#the-questionnaire-host) |

Of the 43 sitemap URLs, 13 were captured directly. Another 11 appear only as links in captured pages. The other 19 appear in no archive: 18 pages and one of the two author archives. The 18 pages are `/home/`, `/home-2/`, `/surveys/`, `/karta-2/`, `/brahmavihara/`, `/frienorfoeofself/`, `/sthitaprajna/`, `/vikshepa/`, `/knowyourmind/`, `/momentumofspiritualpractice/` and the eight "Profiling" pages.

#### URL classes, with counts and examples

"Linked" means the address appears in the HTML of an archived page. "Captured" means the archive holds a copy of the address itself. Counts are distinct addresses.

| Class | In the archives | Count | Examples | What WordPress also answers (source) |
| --- | --- | --- | --- | --- |
| Front page | captured; linked from every page | 1 (+ `https://care4mind.org` without the slash in 2024 links) | `/` | — |
| Pages and posts (other than the front page) | 10 captured, 20 linked | 20; with the front page, 21 of the sitemap's 39 pages and posts | `/concepts/`, `/karmayoga-scale/`, `/atman/` | Every post and page at `/<slug>/` |
| Category archives | 1 captured, 2 linked | 2 | `/category/uncategorized/`, `/category/concepts/` | — |
| Author archives | 1 captured and linked | 1 of 2 | `/author/<username>/` | — |
| Main feed | linked from all 66 WordPress page copies, Aug 2024 to Jun 2026 | 1 | `/feed/` | Each feed also answers in `rdf`, `rss`, `rss2` and `atom` forms, e.g. `/feed/atom/` ([WP_Rewrite `$feeds`](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/class-wp-rewrite.php#L342); [WordPress Feeds](https://developer.wordpress.org/advanced-administration/wordpress/feeds/)) |
| Comment feed | linked from all 66 | 1 | `/comments/feed/` | as above |
| Category feeds | linked from the 4 category-archive copies | 1 | `/category/uncategorized/feed/` | `/category/concepts/feed/` too |
| Author feeds | linked from the 2 author-archive copies | 1 | `/author/<username>/feed/` | the second author's too |
| Per-post comment feeds | none | 0 | — | `/<post-slug>/feed/`. WordPress only advertises it in a page when comments or pings are open, or comments exist ([`feed_links_extra`](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/general-template.php#L3548-L3605)), so its absence from the archives doesn't mean it isn't served. |
| `/page/N/` pagination | none | 0 | — | Lists split into pages of 10 by default ([`posts_per_page` default](https://github.com/WordPress/WordPress/blob/7.1.3/wp-admin/includes/schema.php#L434)). With 6 posts, no list has a second page unless the setting was lowered, which can't be seen from outside. |
| Attachment pages (a WordPress page per uploaded file) | none | 0 | — | Probably still on; see [Attachment pages](#attachment-pages) |
| `?p=` shortlinks | linked from each page's `<link rel="shortlink">` | 11 | `/?p=294`, `/?p=1048` | `/?p=ID`, `/?page_id=ID` and `/?attachment_id=ID` all redirect to the item's address ([canonical.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/canonical.php#L149-L263)). The front page's shortlink is `/` ([`wp_get_shortlink`](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/link-template.php#L4186-L4196)). |
| `?page_id=` | none | 0 | — | as above |
| Search URLs | no search URL; one search box, on the 17 Mar 2025 home page, submitting `?s=` to `/` | 0 | — | `/?s=term` always works, as does `/search/term/` ([`$search_base`](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/class-wp-rewrite.php#L81)) |
| Media: original files | linked | 20 (17 images, 3 font files) | `/wp-content/uploads/2023/09/Karma-Yoga.png`, `/wp-content/uploads/2023/10/Shobhika-Regular.otf` | see [Media files](#media-files-and-their-size-variants) |
| Media: resized copies | linked | 45 | `/wp-content/uploads/2023/09/Karma-Yoga-300x207.png` | as above |
| Media: copies renamed after editing in WordPress | linked | 2 | `/wp-content/uploads/2024/05/Survey-1-e1715701729946.png` | as above |
| Files Elementor (the page builder) generates in the uploads folder | linked | 29 (12 per-page stylesheets, 8 font stylesheets, 9 thumbnails) | `/wp-content/uploads/elementor/css/post-1371.css`, `/wp-content/uploads/elementor/thumbs/Sculptor-3-qnpn….jpeg` | not content |
| REST API (the data interface) | linked | 17 | `/wp-json/`, `/wp-json/wp/v2/pages/1371`, `/wp-json/wp/v2/users/2` | the whole `/wp-json/` tree |
| oEmbed | linked | 22 (11 pages × JSON and XML) | `/wp-json/oembed/1.0/embed?url=https%3A%2F%2Fcare4mind.org%2F` | — |
| Other WordPress plumbing | linked | 4 | `/xmlrpc.php?rsd`, `/wp-admin/admin-ajax.php` | `/wp-login.php`, `/wp-admin/` |
| `robots.txt` (instructions for search engines) | captured by Common Crawl (200) | 1 | `/robots.txt` | The 14 Jun 2026 copy is 67 bytes: `User-agent: *`, `Disallow: /wp-admin/`, `Allow: /wp-admin/admin-ajax.php` ([Common Crawl record](https://data.commoncrawl.org/crawl-data/CC-MAIN-2026-25/segments/1780687573097.66/robotstxt/CC-MAIN-20260614092242-20260614122242-00679.warc.gz), bytes 422629–423332). It has no `Sitemap:` line, though WordPress's own robots.txt adds one for public sites ([`add_robots`](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/sitemaps/class-wp-sitemaps.php#L295-L301)). So it is probably a fixed file served by the host, or a plugin replaced it (inferred). |
| Theme, plugin and core files | linked | 477 (402 plugin, 11 theme, 64 core) | `/wp-content/plugins/…`, `/wp-includes/…` | not content |

Other addresses WordPress answers by default, none of them seen in any archive. All are from the WordPress 7.1.3 rewrite rules ([class-wp-rewrite.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/class-wp-rewrite.php#L1287-L1291)):

- **Date archives** of posts, such as `/2023/11/` and `/2023/11/16/`.
- **Embed versions** of each post or page, `/<slug>/embed/`.
- **Trackback addresses**, `/<slug>/trackback/`.
- **Comment pages**, `/<slug>/comment-page-N/`.
- **`/favicon.ico`**, which WordPress answers with the site icon.
- **`/sitemap.xml`**, which WordPress maps to its sitemap index.

#### Page and post numbers seen in the archives

Each WordPress item has a number (its ID). The archived pages show 15 of them, from their shortlink, REST link and page-body class:

| Address | ID | Seen |
| --- | --- | --- |
| `/` (front page) | none: a list of latest posts | Aug 2024 to Feb 2025 |
| `/` (front page) | page 639 | Mar 2025 |
| `/` (front page) | page 1145 | Apr 2025 |
| `/` (front page) | page 1371 | May 2025 to Jun 2026 |
| `/concepts/` | page 294 | Aug 2024 to Feb 2025 |
| `/concepts/` | page 725 | Apr 2025 to May 2026 |
| `/institutes/` | page 51 | |
| `/text-books-2-2/` | page 79 | |
| `/dosha-survey/` | page 899 | |
| `/text-books/` | page 972 | |
| `/triguna/` | page 1048 | |
| `/methods/` | page 1269 | |
| `/resources/` | page 1271 | |
| `/teertha-yatra-quiz/` | post 329 | |
| `/karmayoga-scale/` | post 431 | |
| `/category/uncategorized/` | category 1 | |
| `/author/<username>/` | user 2 | |

The IDs of the other 26 pages and posts aren't in any archive. The REST API listing in [Sample the current site](../issues/02-current-site-sample.md) gives them.

#### Feeds

- **Main feed and comment feed.** `/feed/` and `/comments/feed/` are announced in the page head of all 66 archived WordPress page copies, from Aug 2024 to Jun 2026.
- **Category and author feeds.** `/category/uncategorized/feed/` appears in the category-archive copies, and `/author/<username>/feed/` in the author-archive copies.
- **No feed was ever captured on its own,** so the archives don't show what any feed contained.
- **Other formats.** WordPress also answers each feed in four other formats ([`$feeds = array( 'feed', 'rdf', 'rss', 'rss2', 'atom' )`](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/class-wp-rewrite.php#L342)), and in the `/?feed=rss2` query form.
- **Per-post comment feeds.** It answers a comment feed for every post at `/<slug>/feed/` ([`get_post_comments_feed_link`](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/link-template.php)).
- **[current-site.md](../../../docs/current-site.md)** records that the main feed was fetched on 2026-10-26.

#### `/page/N/` pagination and attachment pages

- **Pagination.** No `/page/N/` address appears in any archive, and none could: WordPress splits lists into pages of 10 posts by default, and the site has 6 posts. Its actual setting can't be seen from outside.
  - Lists that could split are the post list (`/blog/`, or the front page when it listed posts until Feb 2025), the two category archives and the two author archives.
  - Long posts split with page breaks use `/<slug>/2/`. None was seen.
- <a id="attachment-pages"></a>**Attachment pages.** WordPress used to make a separate page for every uploaded file. None appears in any archive.
  - **The rule since 6.4.** From WordPress 6.4 these pages are off for new installs. Sites that existed before keep them on: "On existing sites, the option is set to `1` on upgrade, so that attachment pages continue to work as is" ([Changes to attachment pages](https://make.wordpress.org/core/2023/10/16/changes-to-attachment-pages/)). WordPress 6.4 came out on 6 Nov 2023 ([release page](https://wordpress.org/download/releases/6-4/)).
  - **This site predates 6.4.** Its domain was registered on 13 Sep 2023, its default "Sample Page" was last modified the same day (sitemap `lastmod`), and its posts date from Nov 2023.
  - **So they are probably on.** Unless someone switched them off, each of the 71 media items likely has an attachment page, reachable at least as `/?attachment_id=ID`, which WordPress redirects to the attachment page ([canonical.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/canonical.php#L229-L241)).
  - **Not confirmed.** Checking needs a request the current site isn't allowed here.

#### Shortlinks and search URLs

- **Shortlinks.** Every archived page and post announces a `?p=ID` shortlink in its head. Pages use `?p=` too, not `?page_id=`. The front page's shortlink is just `/`. This matches WordPress's code: "Return `?p=` link for all public post types", or `home_url( '/' )` for the static front page ([`wp_get_shortlink`](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/link-template.php#L4186-L4196)).
- **The 11 shortlinks seen:** `/?p=51`, `79`, `294`, `329`, `431`, `725`, `899`, `972`, `1048`, `1269` and `1271`.
- **Any ID works.** WordPress redirects `/?p=ID`, `/?page_id=ID` and `/?attachment_id=ID` for any published item to its normal address ([canonical.php, "Redirect ?page_id, ?p=, ?attachment_id= to their respective URLs"](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/canonical.php#L149-L150)). So on the current site, every page, post and media ID is also an address.
- **Search.** Of the 69 archived copies, only the 17 Mar 2025 home page had a search box. It sent searches to `/?s=…`. No search-results URL was captured. WordPress answers `/?s=term` and `/search/term/` whether or not a search box is shown.

#### Media files and their size variants

- **Nothing captured on its own.** No file under `/wp-content/uploads/` was ever captured by itself, so the archives hold none of the media.
- **25 files named in archived pages.** The archived pages link 67 media-library addresses, which belong to 25 distinct file names:
  - 21 images (11 PNG, 7 JPEG, 3 JPG) and one WebP logo. The site logo shows up as both a PNG and a WebP, which may be one upload, so it may be 24 uploads.
  - 3 font files: Samarkan normal and oblique (TTF) and Shobhika Regular (OTF). They are loaded by the site's stylesheets.
  - Upload months: Sep 2023 (4), Oct 2023 (3), Nov 2023 (2), May 2024 (15) and Mar 2025 (1).
  - [current-site.md](../../../docs/current-site.md) counts 71 media files, so about two thirds never appear in an archive. The full list comes from the REST API (`/wp-json/wp/v2/media`).
- **Resized copies.** When an image is uploaded, WordPress saves extra copies at standard sizes and names each `<name>-<width>x<height>.<ext>`. The defaults, all in [schema.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-admin/includes/schema.php#L485-L533) unless noted:
  - thumbnail: 150×150, cropped
  - medium: up to 300×300
  - medium_large: 768 wide
  - large: up to 1024×1024
  - up to 1536×1536 and 2048×2048 ([media.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/media.php#L5864-L5866))
  - Images bigger than 2560 px also get a `-scaled` copy that is used as the full size ([image.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-admin/includes/image.php#L285-L340); [big images in 5.3](https://make.wordpress.org/core/2019/10/09/introducing-handling-of-big-images-in-wordpress-5-3/)).
  - Themes and plugins can add more sizes.
- **Sizes seen in the archives:** 150×150 (13 files), 300×300 (7), 768×768 (5), and assorted proportional ones such as 300×207, 768×529, 1024×705, 1024×37 and 1536×56. No `-scaled` file was seen.
- **Edited images.** Editing an image inside WordPress saves a new file named `-e<timestamp>`. The original is kept ([image-edit.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-admin/includes/image-edit.php#L1001-L1015)). Two such files are linked:
  - `Survey-1-e1715701729946.png`
  - the site logo `cropped-Logo-with-frame-4-and-text-removebg-preview-e1742128192520.webp`, also in sizes 114×109, 161×153 and 300×286.
- **Site icon.** The icon browsers show in tabs is `/wp-content/uploads/2024/05/Mind-2-150x150.jpeg`, with `-300x300.jpeg` for 192×192 and Apple devices. It is linked from all 66 WordPress copies.
- **Elementor's generated files.** Elementor keeps generated files in `/wp-content/uploads/elementor/`:
  - per-page stylesheets `css/post-<ID>.css`, versioned with `?ver=`
  - locally stored Google Fonts stylesheets (Cormorant Garamond, Encode Sans Condensed, Instrument Serif, Inter, Inter Tight, Noto Sans Devanagari, Roboto, Roboto Slab)
  - custom-size thumbnails in `thumbs/`

  They are page plumbing, not media-library items.

#### Old slugs seen only in archives

- **None found.** Every page, post, category and author address in the archives, captured or linked, is still in the 2026-10-26 sitemap.
- **What did change is which item sits behind an address:**
  - `/concepts/` moved from page 294 to page 725 between 18 Feb and 18 Apr 2025.
  - The front page went from a post list to page 639 (Mar 2025), page 1145 (Apr 2025) and page 1371 (May 2025 on).
  - Elementor stylesheets named after pages 639 and 1145 (`post-639.css`, `post-1145.css`) appear in the Mar and Apr 2025 home-page copies, which backs up those IDs.
  - `/home/` and `/home-2/`, both titled "Home", were last modified on 5 Apr and 26 Apr 2025 (sitemap). They may be the former front pages 639 and 1145. That is unconfirmed: their IDs aren't in any archive.
- **Hidden old slugs.** WordPress remembers the old slugs of renamed posts and redirects them to the new address. It doesn't do this for pages, because "Do not attempt redirect for hierarchical post types" ([`wp_old_slug_redirect`](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/query.php#L1075-L1098)). So a renamed post could still answer at an old slug no archive saw. The stored list can't be read from outside.

#### The questionnaire host

- **Captures.** The only `questionnaire.care4mind.org` address in any archive is `http://questionnaire.care4mind.org:8020/`. The Wayback Machine has it on 2025-04-21, 2025-08-09 and 2026-01-15. Common Crawl has the same three, plus `/robots.txt` on the same host and port, which answered 404 each time.
- **Nothing on the standard ports.** Prefix queries for the host, with and without `:8020`, returned no other address.
- **A Python web app.** The archived response header reads `WSGIServer/0.2 CPython/3.8.10` in 2025 and `CPython/3.10.7` in Jan 2026.
- **Its home page linked to login pages that were never captured:**
  - `/login-user`
  - `/login/<N>`: 3 in Apr 2025 (6, 8, 9), 8 in Aug 2025, and 17 in Jan 2026 (6, 8, 9, 12, 13, 17, 20, 21, 27–32, 35, 36, 37)
  - 20 static files under `/static/`, including `/static/lib/img/care4mind_logo.png`
- **Links in from the current site.** The WordPress home page linked to it as both `http://questionnaire.care4mind.org:8020` and `…:8020/` from Apr 2025 to Jun 2026. [current-site.md](../../../docs/current-site.md) records it refusing connections on 2026-10-26.
- **What its pages contained** is for [Questionnaires in web archives](../issues/10-questionnaires-in-web-archives.md).

### The current sitemap

Fetched on 2026-10-26 with five requests to care4mind.org, at least eight seconds apart: the [index](https://care4mind.org/wp-sitemap.xml) and its four child sitemaps. A sixth request asked for the same index through `www` (see [How the hostnames behave](#how-the-hostnames-behave)).

| Child sitemap | URLs | `lastmod` range |
| --- | --- | --- |
| [wp-sitemap-posts-post-1.xml](https://care4mind.org/wp-sitemap-posts-post-1.xml) | 6 posts | 2023-11-16 to 2023-12-18 |
| [wp-sitemap-posts-page-1.xml](https://care4mind.org/wp-sitemap-posts-page-1.xml) | 33 pages | 2023-09-13 (`/sample-page/`) to 2025-10-16 (`/`) |
| [wp-sitemap-taxonomies-category-1.xml](https://care4mind.org/wp-sitemap-taxonomies-category-1.xml) | 2 categories | none given |
| [wp-sitemap-users-1.xml](https://care4mind.org/wp-sitemap-users-1.xml) | 2 author archives | none given |
| **Total** | **43** | |

- **Same list as before.** The 43 URLs are exactly the ones in [current-site.md](../../../docs/current-site.md): nothing added or removed. Times are in Indian Standard Time (+05:30).
- **Most recent changes:**
  - Last page changed: the front page, on 16 Oct 2025.
  - The eight "Profiling" pages and `/momentumofspiritualpractice/` were changed between 5 Aug and 30 Sep 2025.
  - Last post changed: `/karmayoga-scale/`, on 18 Dec 2023.
- **What the sitemap leaves out by design:**
  - Uploaded files: the post sitemap removes `attachment` from its list ([class-wp-sitemaps-posts.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/sitemaps/providers/class-wp-sitemaps-posts.php#L38)).
  - Authors without published posts ([class-wp-sitemaps-users.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/sitemaps/providers/class-wp-sitemaps-users.php#L157)).
  - Feeds, shortlinks and search.

  So the sitemap is a floor for FR-07, not the full list.
- **The sitemap files are addresses too.** The sitemap pages themselves (`/wp-sitemap.xml`, the four `wp-sitemap-*.xml` files and the stylesheet `/wp-sitemap-index.xsl`) are also addresses the site serves.
- **How the server answered.** Every response came from `nginx` and was a cache miss. The first took 18 s, the rest 1–2 s. The apex sends `strict-transport-security: max-age=15768000` (HSTS: browsers that have visited will insist on HTTPS for 182.5 days). It has no `includeSubDomains`, so the rule doesn't cover `questionnaire.`.

### Domain and DNS

#### Registration (RDAP)

RDAP is the official registry lookup that replaced WHOIS. The `.org` registry's RDAP address comes from [IANA's bootstrap file](https://data.iana.org/rdap/dns.json). Sources: [registry RDAP (Public Interest Registry)](https://rdap.publicinterestregistry.org/rdap/domain/care4mind.org) and [registrar RDAP (Namecheap)](https://rdap.namecheap.com/domain/care4mind.org).

| Field | Value |
| --- | --- |
| Registrar | NameCheap, Inc. (IANA registrar ID 1068) |
| Registered | 2023-09-13 13:43 UTC |
| Expires | 2027-09-13 13:43 UTC (registry and registrar agree) |
| Last changed | 2026-09-16 at the registry; 2025-09-12 at the registrar |
| Status | `client transfer prohibited`: the registrar lock that blocks transfers to another registrar ([ICANN EPP status codes](https://www.icann.org/resources/pages/epp-status-codes-2014-06-16-en)). Plus `auto renew period` at the registry: the registry recently extended the registration automatically when it expired, and the registrar can still delete it for a refund during this grace period (same ICANN page). The previous expiry was therefore probably 13 Sep 2026 (inferred). |
| Registrant | Hidden: "Privacy service provided by WITHHELD FOR PRIVACY LLC", Delaware, US |
| Nameservers | `pdns1.registrar-servers.com`, `pdns2.registrar-servers.com` |
| DNSSEC | Not signed (`delegationSigned: false`) |

Those nameservers are Namecheap **PremiumDNS**, its paid DNS service, as opposed to the free BasicDNS on `dns1/dns2.registrar-servers.com` ([How to find your domain's DNS provider](https://www.namecheap.com/support/knowledgebase/article.aspx/10837/93/how-to-find-your-domains-dns-provider/)).

- **Billing.** A PremiumDNS subscription is tied to one domain, and its term can't run past the domain's expiry.
- **If it expires.** "If the domain with expired PremiumDNS is registered at Namecheap – all the host records will be copied to BasicDNS, and the domain will be switched to them afterwards" ([What is PremiumDNS?](https://www.namecheap.com/support/knowledgebase/article.aspx/9654/2231/what-is-premiumdns)).
- **Who controls the records.** The domain's DNS records are edited in the Namecheap account's "Advanced DNS" tab. Whoever holds that account controls the cutover.

#### DNS records

- **How they were looked up.** These are public lookups through Google Public DNS ([dns.google](https://dns.google/resolve?name=care4mind.org&type=A)) and Cloudflare ([cloudflare-dns.com](https://cloudflare-dns.com/dns-query)), queried twice each over HTTPS. Plain DNS queries from this machine were answered by a local relay rather than the real servers, so they weren't used.
- **What a TTL is.** The TTL (time to live) is how many seconds resolvers may cache an answer, so it is how long a change takes to reach everyone.
- **How reliable the TTLs are.** A resolver shows the time left on its cached copy, which is at most the configured value. Both resolvers gave the same numbers on both rounds, so these are very likely the configured values.

| Name | Type | Value | TTL (s) |
| --- | --- | --- | --- |
| `care4mind.org` (the apex, the bare domain) | A (IPv4 address) | `63.250.43.138`, `63.250.43.139` | 60 |
| `care4mind.org` | AAAA (IPv6 address) | none | — |
| `www.care4mind.org` | CNAME (alias) | `care4mind.org.` | 60 |
| `questionnaire.care4mind.org` | A | `24.199.93.62` | 1799 |
| `questionnaire.care4mind.org` | AAAA, CNAME | none | — |
| `care4mind.org` | MX (where mail goes) | `10 eforward1.registrar-servers.com.`, `10 eforward2…`, `10 eforward3…`, `15 eforward4…`, `20 eforward5.registrar-servers.com.` | 1800 |
| `care4mind.org` | TXT (SPF) | `v=spf1 include:spf.easywp.com ~all` (the only TXT record) | 1800 |
| `_dmarc.care4mind.org` | TXT (DMARC) | none: the name doesn't exist (NXDOMAIN) | — |
| `care4mind.org`, `www.`, `questionnaire.` | CAA | none | — |
| `care4mind.org` | NS | `pdns1.registrar-servers.com.`, `pdns2.registrar-servers.com.` | 1800 |
| `care4mind.org` | SOA (zone settings) | `pdns1.registrar-servers.com. hostmaster.registrar-servers.com. 1792823552 43200 3600 604800 3601` | 3601 |
| `care4mind.org` | DS (DNSSEC link at `.org`) | none | — |
| `care4mind.org` | HTTPS (service record) | none | — |
| `zz-no-such-host-7q.care4mind.org` (an invented name) | A | NXDOMAIN, so there's no catch-all (wildcard) record | — |

What the records mean:

- **TTLs are already low on the website records.** The apex and www are cached for only 60 seconds. Mail and SPF are cached for 30 minutes, and `questionnaire.` for 1,799 seconds. Namecheap's default TTL is "30 minutes (5 minutes for ALIAS records)", shown as "Automatic" ([host records guide](https://www.namecheap.com/support/knowledgebase/article.aspx/434/2237/how-do-i-set-up-host-records-for-a-domain/)). So the apex and www were set well below the default; nothing public records who set them or why. The rest are at the default, or one second under it.
- **The SOA "minimum" of 3,601 s** is how long resolvers may remember that a name doesn't exist. Cloudflare reported 3,601 and Google capped it at 1,800.
- **The SOA serial, 1792823552,** reads as 24 Oct 2026 06:32 UTC if it's a Unix timestamp. Namecheap doesn't document that, so it may or may not mean the zone was edited then.
- **Mail.** The MX records `eforward1`–`5.registrar-servers.com` are the ones Namecheap sets when "Email Forwarding" is chosen. That service forwards mail to other inboxes, can't send, and allows up to 100 addresses ([How to set up Free Email Forwarding](https://www.namecheap.com/support/knowledgebase/article.aspx/308/2214/how-to-set-up-free-email-forwarding)). Which addresses forward where is visible only in the Namecheap account.
- **SPF.** The one SPF record authorises EasyWP's mail servers. `spf.easywp.com` itself lists `include:spf-sb.et.namecheap.tech include:spf.jellyfish.systems ~all`. That fits the WordPress site sending mail as the domain, such as form notifications. Namecheap's forwarding guide says forwarding comes with an SPF record that "is needed for free email forwarding to function". The published record names only EasyWP. Whether forwarding works wasn't tested.
- **No DMARC record and no DKIM checked.** DKIM, the mail-signing keys, needs a selector name to look up, so it wasn't checked.
- **No CAA record.** Any certificate authority may issue certificates for these names: CAA "does not restrict issuance" when no CAA record applies ([RFC 8659 §3](https://www.rfc-editor.org/rfc/rfc8659.html)).

#### Who runs each address

| Address | Network owner (ARIN RDAP) | Reverse DNS | Reading |
| --- | --- | --- | --- |
| `63.250.43.138`, `63.250.43.139` | Namecheap, Inc., block `NET-63-250-32-0-1` (63.250.32.0–63.250.47.255) ([RDAP](https://rdap.arin.net/registry/ip/63.250.43.138)) | both `ingress-fomalhaut.ewp.live.` | EasyWP. The `ewp.live` reverse name, the `spf.easywp.com` SPF entry, and Namecheap's own instructions to point a domain at EasyWP with two A records ([EasyWP: How to change domain](https://www.namecheap.com/support/knowledgebase/article.aspx/9923/2286/easywp-how-to-change-domain-for-a-website-video)) all agree. This confirms the "managed WordPress hosting" inference in current-site.md. |
| `24.199.93.62` | DigitalOcean, LLC, block `NET-24-199-64-0-1` (24.199.64.0–24.199.127.255) ([RDAP](https://rdap.arin.net/registry/ip/24.199.93.62)) | none (NXDOMAIN under `ns1.digitalocean.com`) | A DigitalOcean server running the questionnaire app on port 8020 |

#### How the hostnames behave

- **www now redirects to the apex.** A request for `https://www.care4mind.org/wp-sitemap.xml` on 2026-10-26 returned `301` to `https://care4mind.org/wp-sitemap.xml`, with `x-redirect-by: WordPress`. WordPress's canonical redirect swaps the requested host for the site's own (comment "www.example.com vs. example.com"), but only between the www and bare forms of the same name ("Only redirect no-www <=> yes-www") ([canonical.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/canonical.php#L601-L606), [lines 728–738](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/canonical.php#L728-L738)). The certificate on `www` was valid.
- **It didn't always.** On 8 Sep 2024 the Wayback Machine got a `200` page at `https://www.care4mind.org/`, and `http://www.` redirected to `https://www.`, not to the apex. At that time the site answered on both hostnames.
- **http goes to https.** All four archived `http://care4mind.org/` captures (Sep 2023 to Jul 2025) are 301 redirects. The two whose target could be read, from Sep 2023 and Jul 2025, lead to `https://care4mind.org/`. The current http behaviour wasn't checked: the request budget went on the sitemaps and the www check.
- **The questionnaire app** used plain HTTP on port 8020. Neither archive holds a copy of it on port 80 or 443.
- **No other hostname is known.** No other `*.care4mind.org` name appears in any archived page or capture, and there is no wildcard record. Any other names could only be found by guessing them or in certificate logs (see Gaps).

## Gaps and uncertainties

- **The archives are a thin sample.** 14 addresses were captured, 19 of the 43 sitemap URLs appear nowhere, and no media, feed or shortlink was captured. Addresses that real visitors or other sites use can only be seen in the hosting's access logs or the site's Google Search Console. Only the client can reach those. Reaching them would be a question for the client, not a step here.
- **Common Crawl was only partly read.** 8 of the 34 monthly indexes timed out (HTTP 502/504) on three tries spaced a few minutes apart: 2024-10, 2025-21, 2025-26, 2025-38, 2026-12, 2026-21, 2026-30 and 2026-43. The 26 that answered add no address beyond `/robots.txt`, so a large miss seems unlikely, but it isn't ruled out.
- **archive.today's whole-domain search** returned a CAPTCHA, so only three exact addresses were checked there.
- **Only one robots.txt copy was read,** from 14 Jun 2026. Whether it is a fixed file is inferred from its missing `Sitemap:` line, not confirmed.
- **Not visible from outside**, each needing the REST API (scrape) or the site admin:
  - whether attachment pages are on
  - the posts-per-page setting
  - which old post slugs WordPress has stored
  - the IDs of 26 pages and posts
  - what IDs 294, 639 and 1145 lead to now
  - whether `/home/` and `/home-2/` are the old front pages
- **TTLs are as public resolvers report them,** not read from Namecheap's servers. Plain DNS from this machine was intercepted. The TTL of the `.org` registry's pointer to Namecheap's nameservers (which matters if the nameservers change) wasn't read either.
- **Other hostnames.** Only the apex, `www`, `questionnaire` and one invented name were looked up. Certificate Transparency logs (public lists of every HTTPS certificate issued) would show any other hostnames that had certificates. The ticket limited this part to RDAP and DNS, so they weren't checked.
- **Email.** DKIM selectors weren't checked. Whether email forwarding is set up and working, and to which inboxes, is only visible in the Namecheap account.
- **The questionnaire app's other paths** (`/login-user`, `/login/<N>`, anything behind them) were never captured. Their behaviour is unknown.
- **Clock skew.** This machine's clock was about 5 h 20 min ahead. Times above come from the servers' own `Date` headers and RDAP, not the local clock.

## Sources

All read on 2026-10-26.

**Web archives**

- Wayback Machine CDX API, all captures for the domain: <https://web.archive.org/cdx/search/cdx?url=care4mind.org&matchType=domain&output=json&fl=urlkey,timestamp,original,mimetype,statuscode,digest,length>. Prefix queries used `url=care4mind.org/*`, `www.care4mind.org/*` and `questionnaire.care4mind.org:8020/`.
- Wayback CDX server documentation: <https://github.com/internetarchive/wayback/blob/master/wayback-cdx-server/README.md>
- The 69 distinct Wayback page copies, read unchanged via `https://web.archive.org/web/<timestamp>id_/<address>`. For example <https://web.archive.org/web/20260614102610/https://care4mind.org/> and <https://web.archive.org/web/20260115090416/http://questionnaire.care4mind.org:8020/>.
- Common Crawl crawl list <https://index.commoncrawl.org/collinfo.json>, and per-crawl index queries such as <https://index.commoncrawl.org/CC-MAIN-2026-39-index?url=*.care4mind.org&output=json>.
- The robots.txt copy, read as a byte range from <https://data.commoncrawl.org/crawl-data/CC-MAIN-2026-25/segments/1780687573097.66/robotstxt/CC-MAIN-20260614092242-20260614122242-00679.warc.gz> (offset 422629, length 704), located via <https://index.commoncrawl.org/CC-MAIN-2026-25-index?url=care4mind.org/robots.txt&output=json>.
- archive.today list of copies: <https://archive.ph/timemap/https://care4mind.org/>

**The current site** (six requests)

- <https://care4mind.org/wp-sitemap.xml>, <https://care4mind.org/wp-sitemap-posts-post-1.xml>, <https://care4mind.org/wp-sitemap-posts-page-1.xml>, <https://care4mind.org/wp-sitemap-taxonomies-category-1.xml>, <https://care4mind.org/wp-sitemap-users-1.xml>
- <https://www.care4mind.org/wp-sitemap.xml>, which wasn't followed past its redirect.

**Domain, DNS and IP lookups**

- IANA RDAP bootstrap: <https://data.iana.org/rdap/dns.json>
- Registry RDAP: <https://rdap.publicinterestregistry.org/rdap/domain/care4mind.org>
- Registrar RDAP: <https://rdap.namecheap.com/domain/care4mind.org>
- ARIN RDAP: <https://rdap.arin.net/registry/ip/63.250.43.138>, <https://rdap.arin.net/registry/ip/24.199.93.62>
- Google Public DNS JSON API (e.g. <https://dns.google/resolve?name=care4mind.org&type=MX>) and Cloudflare DNS JSON API (<https://cloudflare-dns.com/dns-query>). Each record above, plus the reverse (PTR) records and `spf.easywp.com`.

**Namecheap documentation**

- How to find your domain's DNS provider: <https://www.namecheap.com/support/knowledgebase/article.aspx/10837/93/how-to-find-your-domains-dns-provider/>
- What is PremiumDNS?: <https://www.namecheap.com/support/knowledgebase/article.aspx/9654/2231/what-is-premiumdns>
- How to set up Free Email Forwarding: <https://www.namecheap.com/support/knowledgebase/article.aspx/308/2214/how-to-set-up-free-email-forwarding>
- How do I set up host records for a domain? (default TTL): <https://www.namecheap.com/support/knowledgebase/article.aspx/434/2237/how-do-i-set-up-host-records-for-a-domain/>
- EasyWP: How to change domain for a website: <https://www.namecheap.com/support/knowledgebase/article.aspx/9923/2286/easywp-how-to-change-domain-for-a-website-video>

**Standards**

- ICANN, EPP Status Codes: <https://www.icann.org/resources/pages/epp-status-codes-2014-06-16-en>
- RFC 8659, DNS CAA Resource Record: <https://www.rfc-editor.org/rfc/rfc8659.html>

**WordPress 7.1.3 source** (the version the current site runs, from the official GitHub mirror)

- [wp-includes/link-template.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/link-template.php): `wp_get_shortlink`, `get_post_comments_feed_link`
- [wp-includes/canonical.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/canonical.php): `?p=`, `?page_id=` and `?attachment_id=` redirects, www handling, attachment pages
- [wp-includes/class-wp-rewrite.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/class-wp-rewrite.php): feed formats, search, author and pagination bases, `favicon.ico` and `sitemap.xml` rules
- [wp-admin/includes/schema.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-admin/includes/schema.php): default image sizes, posts per page, `wp_attachment_pages_enabled`
- [wp-includes/media.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/media.php): 1536 and 2048 sizes
- [wp-admin/includes/image.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-admin/includes/image.php): 2560 px threshold and `-scaled`
- [wp-admin/includes/image-edit.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-admin/includes/image-edit.php): `-e<timestamp>` names
- [wp-includes/sitemaps/providers/class-wp-sitemaps-posts.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/sitemaps/providers/class-wp-sitemaps-posts.php) and [class-wp-sitemaps-users.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/sitemaps/providers/class-wp-sitemaps-users.php)
- [wp-includes/sitemaps/class-wp-sitemaps.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/sitemaps/class-wp-sitemaps.php): robots.txt `Sitemap:` line
- [wp-includes/query.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/query.php): `wp_old_slug_redirect`
- [wp-includes/general-template.php](https://github.com/WordPress/WordPress/blob/7.1.3/wp-includes/general-template.php): `feed_links_extra`

**WordPress documentation**

- WordPress Feeds: <https://developer.wordpress.org/advanced-administration/wordpress/feeds/>
- Changes to attachment pages (6.4 dev note): <https://make.wordpress.org/core/2023/10/16/changes-to-attachment-pages/>
- Introducing handling of big images in WordPress 5.3: <https://make.wordpress.org/core/2019/10/09/introducing-handling-of-big-images-in-wordpress-5-3/>
- WordPress 6.4 release page: <https://wordpress.org/download/releases/6-4/>
