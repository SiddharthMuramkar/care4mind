# Current site snapshot, 2026-10-26

What care4mind.org showed the public on 2026-10-26, gathered read-only from its pages, REST API and sitemap. Nothing was logged into or submitted; we have no access to the code, database or admin. This file is the record of what exists. The client's original brief ([client-brief.md](client-brief.md)) describes what's wanted, and assumes more works than does.

## Software

| Part | What it is | Version on the site | Latest release |
| --- | --- | --- | --- |
| WordPress | the content management system the site runs on | 7.1.3 | 7.1.3, 6 Oct 2026 |
| Elementor (free) | drag-and-drop page builder | 4.3.5 | 4.3.5, 13 Oct 2026 |
| Astra | theme (base look and layout) | 4.14.1 | 4.14.1, 15 Oct 2026 |

All three are up to date. The site runs on nginx with a full-page cache; uncached pages are sometimes slow (one request timed out after 40 s; a retry took 2.5 s). Judging by IP addresses, the WordPress site is on Namecheap's managed WordPress hosting and the questionnaire app is on a separate DigitalOcean server (inferred, not confirmed).

Plugins visible from outside: Header Footer Elementor 2.9.5, Quiz Maker 8.7.8, Quiz Maker User Dashboard 1.0.2, Survey Maker 7.1.6, Chart Builder 20.0.6, TablePress 3.4.1, Menu Icons 0.13.25, WPForms Lite 2.0.3, Advanced Accordion Block, Icon Block and Starter Templates. The REST API also shows Forminator, Ninja Tables, WP Rollback, ZipWP, Custom Fonts and an MCP adapter. Plugins that load nothing on public pages can't be seen, so this list may be incomplete. Only two plugins hold any content: Quiz Maker (one quiz) and WPForms (one form).

## Content

- 33 published pages, all top level, and 6 published posts (15–29 Nov 2023).
- 2 categories (Concepts, Uncategorized), no tags, 71 media files.
- No custom content types for content: only WordPress's built-in types plus Elementor's template library.
- The sitemap ([wp-sitemap.xml](https://care4mind.org/wp-sitemap.xml)) lists 43 URLs: the 33 pages and 6 posts in the table below, the category archives `/category/concepts/` and `/category/uncategorized/`, and 2 author archives (`/author/<username>/`; the usernames are left out here, see the sitemap).
- The site title is blank in WordPress settings. The tagline is "Indic ways to invoke a perfect balanced mind".

| URL | Title | Notes |
| --- | --- | --- |
| `/` | Home_TH1 | the front page |
| `/home/` | Home | duplicate home page, not the front page |
| `/home-2/` | Home | duplicate home page, not the front page |
| `/sample-page/` | Sample Page | WordPress's default placeholder, still published |
| `/blog/` | Blog | lists the posts |
| `/concepts/` | Concepts | |
| `/triguna/` | Triguna | describes a "Triguna Profile Questionnaire" but contains none; shows a leftover test message |
| `/methods/` | Methods | |
| `/resources/` | Resources | |
| `/text-books/` | Text Books | same title as `/text-books-2-2/`, different content |
| `/text-books-2-2/` | Text Books | same title as `/text-books/`, different content |
| `/inspirational-books/` | Inspirational Books | |
| `/webpages-and-av-material/` | Webpages and AV material | |
| `/indian-philosophy/` | Indian Philosophy | |
| `/positive-psychology/` | Positive Psychology | |
| `/institutes/` | Courses | address doesn't match the title |
| `/surveys/` | Surveys | empty |
| `/dosha-survey/` | Dosha Survey | WPForms form (see Questionnaires) |
| `/karta-2/` | Karta | |
| `/brahmavihara/` | Brahma Vihara | |
| `/frienorfoeofself/` | Are you a Friend/Foe of Yourself? | misspelled address |
| `/sthitaprajna/` | Sthitaprajna | |
| `/vikshepa/` | Vikshepa (Distraction) | |
| `/knowyourmind/` | Know Your Mind | |
| `/momentumofspiritualpractice/` | Momentum of Spiritual Practice | |
| `/upavikshepaprofiling/` | Upa-Vikshepa Profiling | article only, no questionnaire |
| `/panchkleshavikaarprofiling/` | Panch Klesha – Vikaar Profiling | article only, no questionnaire |
| `/spiritualpractitionerprofiling/` | Spiritual Practitioner Profiling | article only, no questionnaire |
| `/fivestepsofperfectionprofiling/` | Five Steps of Perfection Profiling | article only, no questionnaire |
| `/knowyourvaluesahimsanon-violenceprofiling/` | Know Your Values: Ahimsa (Non-Violence) Profiling | article only, no questionnaire |
| `/knowyourvaluessatyatruthfulnessprofiling/` | Know Your Values: Satya (Truthfulness) Profiling | article only, no questionnaire |
| `/knowyourvaluesasteyanonstealingprofiling/` | Know Your Values: Asteya (Non-Stealing) Profiling | article only, no questionnaire |
| `/knowyourvaluesbrahmacharya-profiling/` | Know Your Values: Brahmacharya Profiling | article only, no questionnaire |
| `/atman/` | Atman | post, category Concepts |
| `/jiva/` | Jiva | post, category Concepts |
| `/jagat/` | Jagat | post, category Concepts |
| `/anubandha-chatushtaya/` | Anubandha Chatushtaya | post, category Concepts |
| `/karmayoga-scale/` | KarmaYoga Scale | post; Quiz Maker quiz (see Questionnaires) |
| `/teertha-yatra-quiz/` | Teertha yatra quiz | post; empty, no quiz |

The "article only" pages each have a shloka, an introduction and references.

## Questionnaires

The questionnaires are spread across three places, and most don't work:

| Where | What | State |
| --- | --- | --- |
| `/karmayoga-scale/` | "Karma Yoga Scale": Quiz Maker quiz no. 3. 45 single-choice questions with 5 options each (Always … Never, or Strongly Disagree … Strongly Agree), plus 4 instruction steps. | Loads for anonymous visitors; finishing it wasn't tested. Questions and options are in the page HTML, and so is an answer key: one option per question is flagged as correct (21 × Never, 15 × Strongly Agree, 9 × Strongly Disagree), base64-encoded in `window.quizOptions_3`. The results screen shows a percentage and "The average score is 65%". The encoded settings also hold three result bands with messages, and the score comes from per-option points kept only in the site database, not from the flagged answers (see [How the KarmaYoga Scale and Dosha Survey work now](../.scratch/rebuild/issues/09-current-questionnaire-behaviour.md)). |
| `/dosha-survey/` | "Dosha Survey": WPForms Lite form no. 895. 12 required questions with 3 options each, plus a hidden anti-spam (honeypot) field that WPForms adds; visitors never see it, its label changes from load to load, and it isn't part of the survey. | Loads. Unknown whether it shows a result; finding out means submitting the live form. |
| `http://questionnaire.care4mind.org:8020` | A separate app outside WordPress, on a different server. The homepage's "Questionnaires & Surveys" cards and its "Applications…" button link here; the card text mentions Triguna and Dosha self-assessments. | Down: the connection was refused on 2026-10-26. Linked over unencrypted HTTP. We have no code for it. |

Also:

- Survey Maker is installed and loads on every page, but no survey is embedded anywhere.
- Sixteen pages describe a questionnaire but contain none: the eight "Profiling" pages, `/triguna/`, `/brahmavihara/`, `/frienorfoeofself/`, `/karta-2/`, `/knowyourmind/`, `/momentumofspiritualpractice/`, `/sthitaprajna/` and `/vikshepa/`. Each gives High/Moderate/Low result descriptions but no questions or numeric cut-offs; `/karta-2/` says each Karta type "is scored on a scale of 1 to 10".
- One homepage "Click to begin…" button has no link at all.

## Broken or messy

- The Twitter and Facebook icons in the header have empty links on every page, desktop and mobile.
- `/triguna/` shows a leftover test message: "Hello, Mind! This is dynamic PHP running via shortcode."
- Two extra "Home" pages, two "Text Books" pages that share a title but not content (`/text-books-2-2/` lists five books `/text-books/` lacks), and WordPress's default "Sample Page" are still published.
- Some addresses don't match their pages: `/institutes/` is "Courses", `/frienorfoeofself/` is misspelled, `/karta-2/` has a stray suffix.
- Quiz Maker, Survey Maker and Chart Builder load their admin-only stylesheets on public pages.
- `/teertha-yatra-quiz/`, `/surveys/` and `/resources/` are empty, though the homepage's "Resources…" button links to `/resources/`. `/webpages-and-av-material/` has only three unlinked headings, and the post `/anubandha-chatushtaya/` is a one-sentence stub linking to dharmawiki.org.

## For the scrape

The REST API (`/wp-json/wp/v2/pages`, `/posts` and `/media`) is open and returns fresh, structured content. Page HTML comes from a cache that can be about two days old, and at least one form label already differs between the two, so the REST API is the more reliable source.

## Worth telling the client

These are problems with the current site, which stays the client's responsibility until launch.

- The public REST API index lists AI-agent (MCP) endpoints: the `mcp` namespace with `/mcp/mcp-adapter-default-server`, `elementor-mcp-composer/v1.0.19`, `/elementor/v1/mcp-proxy` and `/hfe/v1/mcp-abilities`, plus the WordPress Abilities API (`wp-abilities/v1`). These let AI tools act on a site. Whether they require a login wasn't tested.
- The sitemap lists two author archives, which can reveal login usernames.
- The homepage links to the questionnaire app over plain HTTP, so if the app comes back, answers sent to it may travel unencrypted.

## Sources

- REST API: [/wp-json/](https://care4mind.org/wp-json/), plus `/wp-json/wp/v2/` types, pages, posts, categories, tags and media
- Page HTML: the [homepage](https://care4mind.org/) and [feed](https://care4mind.org/feed/) (version tags, asset versions, social links), plus the HTML of 13 individual pages
- The [sitemap](https://care4mind.org/wp-sitemap.xml) and its four child sitemaps
- Latest releases: [WordPress releases](https://wordpress.org/download/releases/), [Elementor](https://wordpress.org/plugins/elementor/), [Astra](https://wordpress.org/themes/astra/)
- Hosting: DNS and IP ownership lookups
- Questionnaire app: a direct connection attempt to `questionnaire.care4mind.org` on port 8020
