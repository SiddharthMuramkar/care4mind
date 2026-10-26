# Questionnaires in web archives: research findings

Ticket: [Questionnaires in web archives](../issues/10-questionnaires-in-web-archives.md) · Researched 2026-10-26 · Branch: research/questionnaires-in-web-archives

## Summary

- **The archives hold little, and nearly all of it comes from one crawler.** A web archive stores copies ("captures") of pages as they looked on a given day. Every Wayback Machine capture used here was imported from Common Crawl, a non-profit that crawls the web about once a month, so the two archives hold the same copies. archive.today holds nothing for care4mind.org. Of the ticket's targets, only five were ever captured: the questionnaire app's home page (3 times) and `/karmayoga-scale/`, `/dosha-survey/`, `/teertha-yatra-quiz/` and `/triguna/` (4 to 5 times each). `/surveys/` and 15 of the 16 pages that describe a Questionnaire were never captured.
- **KarmaYoga Scale: the archives hold its full item set and more of its scoring than the current site's notes record.** All four captures (August 2024 to October 2025) show the same 45 statements, the same options and the same option marked "correct" for each. The pages also carry the plugin's settings for this Questionnaire, stored as encoded text. Those settings define **three result bands, each with a message**: 0–35 "Not bad but not good either!", 36–75 "Good but still there is scope for improvement!", 76–100 "Great! you are on right path. Continue to get the ultimate!". [current-site.md](../../../docs/current-site.md) says no bands are in the HTML; the archived HTML has them.
- **The KarmaYoga Scale's scoring is still only partly recoverable.** Its settings say the score is calculated "by points" and shown as a percentage, with the score itself hidden. The points each option is worth are not in any capture.
- **Dosha Survey: questions only.** All five captures (April 2025 to August 2026) show the same 12 required questions with 3 options each. No capture holds a scoring rule, a mapping of options to doshas, or any result text.
- **The questionnaire app was a separate Python (Django) application, and the archives hold only its front page.** That page lists the app's Questionnaires as cards: 3 in April 2025, 8 in August 2025 and 17 in January 2026. A card has a title, a picture and a short description, and an "Add to dashboard" button that leads to a login. No question, scoring rule, result text or app script was ever archived.
- **15 of the 16 description pages have a card with the same or a similar name in the app.** The exception is "Are you a Friend/Foe of Yourself?". The app also listed the KarmaYoga Scale ("Karmayoga") and an "Entrepreneurship Orientation - Svabhāvas" research study that has no page on the current site. So the 16 pages' questions most likely lived in the app, but their content is not in any archive.
- **The app ran in a development configuration.** It used Django's built-in test server with debug mode on, which Django's documentation says must never happen in production. In that mode the app's error page revealed its list of routes (the addresses it answers to): `admin/`, `login/<id>`, `login-user`, `questionnaire-view/<id>`, `assessments` and `api/`. None of those addresses was ever captured.
- **For [Questionnaire launch scope and scoring sources](../issues/28-questionnaire-launch-scope.md):** from the archives, only the KarmaYoga Scale has items plus a partial scoring setup. The Dosha Survey has items and no scoring. For the 16 profile Questionnaires, the archives hold only the app's short card descriptions and the Triguna page's High/Moderate/Low table: no items and no scoring. The capture tables below give dates and links.

## Findings

Every source below was read on 2026-10-26. Nothing was sent to care4mind.org or questionnaire.care4mind.org: every page here was read from an archive. Capture times are in UTC. Author names and login usernames that appear in some captures are left out of this file.

### How the archives were searched

Some terms first:

- **Capture:** one archived copy of one address on one date.
- **CDX index:** the Wayback Machine's list of every capture, with its address, time and status.
- **WARC file:** the standard archive file format. Common Crawl stores captures in large WARC files, and its index gives each capture's file name and position, so a single capture can be read on its own.

| Archive | What was asked | What came back |
| --- | --- | --- |
| Wayback Machine CDX index | every capture under `care4mind.org` and all its subdomains ([query](http://web.archive.org/cdx/search/cdx?url=care4mind.org&matchType=domain&fl=timestamp,original,mimetype,statuscode,digest,length)); also each of the 16 page addresses, `/surveys/`, `/wp-json/` and the Quiz Maker plugin folder one by one | 79 captures (70 of them successful) of 14 addresses, counting the http, https and www forms of an address as one. The app has 3 captures, all of its front page. No capture of `/surveys/`, of `/wp-json/` (the WordPress REST API, the site's machine-readable content feed), or of 15 of the 16 pages. |
| Wayback Machine CDX index | the app's two server addresses (IP addresses, the numeric internet address of a server), on ports 80, 8020 and 8021 (a port is a numbered entry point on a server; the app used 8020 for pages and 8021 for pictures) | nothing |
| Common Crawl index | every monthly crawl from 2023 to October 2026 (CC-MAIN-2023-14 to CC-MAIN-2026-43) for `care4mind.org` and all subdomains ([index server](https://index.commoncrawl.org/); [list of crawls](https://index.commoncrawl.org/collinfo.json)) | 103 captures, first seen in August 2024 (CC-MAIN-2024-33). Each crawl from 2023 to July 2024 has none. The app appears in three crawls: April 2025, August 2025 and January 2026. Each time Common Crawl fetched its front page and its `/robots.txt` (a file that tells crawlers what they may fetch), which the app answered with an error page. |
| archive.today | the host `care4mind.org`, its subdomains, `questionnaire.care4mind.org`, and timemaps (archive.today's list of captures for one address) for the app and for `/karmayoga-scale/`, `/dosha-survey/`, `/triguna/` and `/surveys/` | "No results" for every host search; "TimeMap does not exists" for every address ([example](https://archive.ph/timemap/http://questionnaire.care4mind.org:8020/)). Two prefix searches were refused for sending too many requests (HTTP 429) and were not retried, because the host search already covers them. |

Every Wayback capture opened for this ticket carries an `x-archive-src` header naming a Common Crawl file (for example `CC-MAIN-2025-18-…`), which records that the Wayback Machine imported it from Common Crawl. Each capture also has a content fingerprint (a "digest", a short code computed from the page's bytes). Of the Wayback Machine's 70 successful captures of the site, 68 have the same timestamp and the same fingerprint as a Common Crawl capture, and none differs. The other two are September 2024 homepage captures, which hold no Questionnaire content (CDX and Common Crawl queries above). Common Crawl has some captures the Wayback Machine lacks, such as the August 2026 `/dosha-survey/` capture.

Captures were read in their raw form (the Wayback Machine's `id_` address form, which returns the page exactly as archived) and treated as data. No archived script was run.

### questionnaire.care4mind.org, including its `:8020` address

#### Captures

| Captured (UTC) | Capture | What it is | Server name (from the archived response); IP (from the Common Crawl record) |
| --- | --- | --- | --- |
| 2025-04-21 15:11 | [Wayback](https://web.archive.org/web/20250421151128/http://questionnaire.care4mind.org:8020/) · Common Crawl CC-MAIN-2025-18 | front page, 3 cards | `WSGIServer/0.2 CPython/3.8.10`, IP 134.122.25.72 |
| 2025-08-09 09:50 | [Wayback](https://web.archive.org/web/20250809095047/http://questionnaire.care4mind.org:8020/) · Common Crawl CC-MAIN-2025-33 | front page, 8 cards | `WSGIServer/0.2 CPython/3.8.10` |
| 2026-01-15 09:04 | [Wayback](https://web.archive.org/web/20260115090416/http://questionnaire.care4mind.org:8020/) · Common Crawl CC-MAIN-2026-04 | front page, 17 cards | `WSGIServer/0.2 CPython/3.10.7`, IP 24.199.93.62 |
| same three dates | Common Crawl only: `/robots.txt` in the April 2025 crawl (file `crawl-data/CC-MAIN-2025-18/segments/1744889135773.55/robotstxt/CC-MAIN-20250421131930-20250421161930-00889.warc.gz`, offset 190471, length 1574, at [data.commoncrawl.org](https://data.commoncrawl.org/)), and the same address in the August 2025 and January 2026 crawls (offsets 202577 and 292633 in the matching `robotstxt` files) | the app's "Page not found (404)" error page | as above |

There is no capture of any other app address: no question page, login page, picture or script. The three error-page captures have the same content fingerprint (`6MFBROV6XIHP44KMDHHQKWYHZPCH626V` in the Common Crawl index), so the app's list of routes did not change between April 2025 and January 2026.

The app moved servers between August 2025 and January 2026. In August 2025 its pictures still came from 134.122.25.72:8021; in January 2026 they came from 24.199.93.62:8021, and the app itself answered from that address (captures above). Both addresses are registered to DigitalOcean, LLC ([RDAP for 134.122.25.72](https://rdap.arin.net/registry/ip/134.122.25.72), [RDAP for 24.199.93.62](https://rdap.arin.net/registry/ip/24.199.93.62); RDAP is the internet registries' public lookup of who holds an address). That confirms current-site.md's inference that the app was on DigitalOcean.

#### What kind of app it was

- **A Django project named `care4mindqw`.** The archived error page says "Using the URLconf defined in `care4mindqw.urls`, Django tried these URL patterns" and "You're seeing this error because you have `DEBUG = True` in your Django settings file" (robots.txt captures above). Django is a Python web framework. DEBUG is its developer mode, which shows internal details on error pages.
- **Served by Django's development server.** The `WSGIServer/0.2 CPython/…` server name is what Python's built-in test web server sends: its source sets `server_version = "WSGIServer/" + __version__` with `__version__ = "0.2"` ([CPython `wsgiref/simple_server.py`](https://github.com/python/cpython/blob/3.10/Lib/wsgiref/simple_server.py)). Django's development server (`manage.py runserver`) is built on that server, and its source says "DON'T USE IT FOR PRODUCTION USE!" ([Django `basehttp.py`](https://github.com/django/django/blob/main/django/core/servers/basehttp.py)). Django's deployment checklist says "The runserver command is not designed for a production setting" and "You must never enable debug in production" ([Django deployment checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)).
- **Routes, in the order the error page lists them:** `admin/` (Django's admin screens), the front page, `login/<int:qid>`, `login-user`, `questionnaire-view/<int:rid>`, `assessments`, `api/`, and `^static/…` for files (robots.txt captures above). The front page's buttons go to `login/<card number>` ("Add to dashboard") and `/login-user` ("Are u a returning user? Login here") (front-page captures above). So it looks as if a visitor had to log in before seeing any questions, which would explain why a crawler that doesn't log in saw none. This is an inference from the route names and buttons.
- **Other details from the front page:** the page title is "Care 4 Mind". It loads Bootstrap (a common page-layout toolkit) and a bundled theme from `/static/lib/…`, jQuery 3.6.0 and SweetAlert2 from public CDNs (content delivery networks, which serve shared files to many sites), and two app scripts, `/static/lib/assets/js/main.js` and `/static/config/config.js`. Neither app script was captured. The app also sets a `csrftoken` cookie, Django's protection against forged form posts (front-page captures above).

#### The app's Questionnaire catalogue

The front page lists one card per Questionnaire, each with a number (the `qid` in `login/<qid>`), a title, a picture and a description. The table lists every card across the three captures. "First seen" is the earliest capture that shows it; the cards keep their wording in later captures, apart from whitespace.

| Card no. | Title on the card | First seen | Matching page on the current site | What the description says about the result |
| --- | --- | --- | --- | --- |
| 6 | Triguna Profile | Apr 2025 | `/triguna/` | "What is the percentage of these qualities in you?" (Sattva, Rajas, Tamas) |
| 8 | Karmayoga | Apr 2025 | `/karmayoga-scale/` (the Quiz Maker version) | "Assess your actions here by taking this test." |
| 9 | Karta (Doer) Profile | Apr 2025 | `/karta-2/` | "find out which kind of Karta you are": Satvik, Rajasik or Tamasik |
| 12 | Brahma Vihara Profile | Aug 2025 | `/brahmavihara/` | measures maitri, karuna, mudita and upeksha |
| 13 | Entrepreneurship Orientation - Svabhāvas | Jan 2026 | none | "This study aims to understand entrepreneurship orientation(EO)/entrepreneurial self-efficacy …" |
| 17 | Do you have a Stabilised Intellect (Sthitaprajna)? | Aug 2025 | `/sthitaprajna/` | "measures traits like discernment, detachment, and equanimity"; "It's not a test, it's a mirror." |
| 20 | Know Your State of Mind | Aug 2025 | `/knowyourmind/` ("Know Your Mind"; a match by name only) | "5 states of mind known as Chittabhumis" |
| 21 | Vikshepa (Distraction) Profiling | Aug 2025 | `/vikshepa/` | "where your mind loses its center" |
| 27 | Upa-Vikshepa Profiling | Aug 2025 | `/upavikshepaprofiling/` | outward signs of inner disturbance |
| 28 | Panch Klesha - Vikaar Profiling | Jan 2026 | `/panchkleshavikaarprofiling/` | "helps identify their presence in daily life" (the five kleshas) |
| 29 | Spiritual Practitioner Profiling | Jan 2026 | `/spiritualpractitionerprofiling/` | "give yourself marks as per the instructions for the questions given below … derived from Adi Sankaracharya' Sadhana Panchakam … It consists of 40 steps" |
| 30 | Five Steps of Perfection Profiling | Jan 2026 | `/fivestepsofperfectionprofiling/` | Faith, Strength, Memory, Absorption and Wisdom |
| 31 | Momentum of Spiritual Practice | Jan 2026 | `/momentumofspiritualpractice/` | cites "Vedanta Saara 1.30, Tomar, 2024" |
| 32 | Know Your Values: Ahimsa (Non-Violence) Profiling | Jan 2026 | `/knowyourvaluesahimsanon-violenceprofiling/` | "not a test but a mirror" |
| 35 | Know Your Values: Satya (Truthfulness) Profiling | Jan 2026 | `/knowyourvaluessatyatruthfulnessprofiling/` | "not a test but a mirror" |
| 36 | Know Your Values: Asteya (Non-Stealing) Profiling | Jan 2026 | `/knowyourvaluesasteyanonstealingprofiling/` | "not a test but a mirror" |
| 37 | Know Your Values: Brahmacharya Profiling | Jan 2026 | `/knowyourvaluesbrahmacharya-profiling/` | self-discipline and moderation |

Sources: the three front-page captures linked above. Card 13 is missing from the August 2025 capture, although it has a lower number than cards shown then. Card numbers skip 7, 10, 11, 14–16, 18, 19, 22–26, 33 and 34. Whether those were drafts, deleted Questionnaires or something else can't be told from the archives.

The descriptions give no numbers, cut-offs or scoring rules. The card pictures (`/media/uploads/questionnaire/Questionnaire_<no>.jpeg` or `.png` on port 8021) were never captured.

#### How the current site linked to the app

The archived homepages show how the homepage's Questionnaire links changed:

| Homepage capture | Questionnaire links |
| --- | --- |
| [2024-08-11](https://web.archive.org/web/20240811215326/https://care4mind.org/) and [2025-02-18](https://web.archive.org/web/20250218063720/https://care4mind.org/) | "Questionnaires…" → `/teertha-yatra-quiz/` (an empty post); "KarmaYoga Scale" → `/karmayoga-scale/` |
| [2025-03-17](https://web.archive.org/web/20250317050901/https://care4mind.org/) | "Questionnaires..." → `https://dharmawiki.org/index.php/Main_Page`; "Dosha Survey" → `/dosha-survey/` |
| [2025-04-18](https://web.archive.org/web/20250418194603/https://care4mind.org/) | "Applications..." and one "Click to begin...." → `http://questionnaire.care4mind.org:8020/`; three "Survey..." → `/dosha-survey/` |
| [2026-06-14](https://web.archive.org/web/20260614102610/https://care4mind.org/) | "Applications..." and three "Click to begin...." → `http://questionnaire.care4mind.org:8020/`; a fourth "Click to begin...." has no link; four "Survey..." → `/dosha-survey/` |

So the app link appeared between 17 March and 18 April 2025. Common Crawl first captured the app on 21 April 2025, in the same monthly crawl. In the 2026 capture, the four "Questionnaires & Surveys" cards are headed "Questionaire", "Questionaire -02", "Questionaire - 03" and "Questionaire -02", and all four repeat the same placeholder text about Triguna and Dosha self-assessment.

### `/surveys/` and `/teertha-yatra-quiz/`

- **`/surveys/`:** no capture in the Wayback Machine, Common Crawl or archive.today (searches above).
- **`/teertha-yatra-quiz/`:** five captures, all with an empty post body: no questions, no form and no embedded plugin. The plugins' stylesheets load on the page, but no Questionnaire is placed on it.

| Captured (UTC) | Capture |
| --- | --- |
| 2024-08-11 22:50 | [Wayback](https://web.archive.org/web/20240811225000/https://care4mind.org/teertha-yatra-quiz/) |
| 2024-09-18 02:51 | [Wayback](https://web.archive.org/web/20240918025109/https://care4mind.org/teertha-yatra-quiz/) |
| 2025-02-18 07:29 | [Wayback](https://web.archive.org/web/20250218072954/https://care4mind.org/teertha-yatra-quiz/) |
| 2025-08-10 14:00 | [Wayback](https://web.archive.org/web/20250810140052/https://care4mind.org/teertha-yatra-quiz/) |
| 2026-03-16 00:31 | [Wayback](https://web.archive.org/web/20260316003111/https://care4mind.org/teertha-yatra-quiz/) |

The post is dated 16 November 2023 in every capture.

### `/karmayoga-scale/`

#### Captures

| Captured (UTC) | Capture | Same items, options and key as August 2024? |
| --- | --- | --- |
| 2024-08-11 21:57 | [Wayback](https://web.archive.org/web/20240811215710/https://care4mind.org/karmayoga-scale/) (Common Crawl CC-MAIN-2024-33) | baseline |
| 2024-11-03 22:48 | [Wayback](https://web.archive.org/web/20241103224838/https://care4mind.org/karmayoga-scale/) (CC-MAIN-2024-46) | yes, identical |
| 2025-02-18 06:42 | [Wayback](https://web.archive.org/web/20250218064226/https://care4mind.org/karmayoga-scale/) (CC-MAIN-2025-08) | yes, identical |
| 2025-10-16 16:13 | [Wayback](https://web.archive.org/web/20251016161351/https://care4mind.org/karmayoga-scale/) (CC-MAIN-2025-43) | yes. Only typography differs: "–" became "-" in the four section headings, and "don’t" became "don't" in item id 31 (statement 25 below). |

The Questionnaire's settings (below) are also identical in all four captures.

#### How the page stores the Questionnaire

The page uses Quiz Maker (a WordPress plugin for quizzes and surveys), quiz number 3. The archived page holds three layers:

1. **The visible questions and options**, as ordinary page markup.
2. **The answer key**: one encoded entry per question in `window.quizOptions_3`, saying which option the plugin counts as "correct". The entries are base64, a way of writing data as plain letters and digits that anyone can decode.
3. **The Questionnaire's settings**: one base64 entry, `aysQuizOptions['3']`. Decoded, it holds 360 named settings, including the title, the scoring method, the result bands and the result message.

The settings record `quiz_version` 8.7.8, `core_version` 6.4.2 (the WordPress version when it was saved), `php_version` 8.0.25 and `create_date` "2023-11-29 11:15:31" (all four captures). Version 8.7.8 is a paid edition of Quiz Maker. The plugin maker's changelog for its "Business, Developer and Agency versions" lists "= 31.7.8 / 21.7.8 / 8.7.8 = (December 4, 2023)" ([Quiz Maker Pro changelog](https://ays-pro.com/changelog-for-quiz-maker-pro)), while the free plugin on WordPress.org is numbered 6.7.1.x ([WordPress.org plugin page](https://wordpress.org/plugins/quiz-maker/)).

#### Title, description and instructions

- **Title:** "Karma Yoga Scale". **Description:** "Answer the following from your Everyday experience". Buttons: "Start", "Prev", "Next", "See Result", "Restart quiz".
- **Four instruction screens**, each a heading plus text:
  - **Everyday Experience – 1:** "Upcoming is a collection of statements about your day to day experience. Using the rating scale given, please indicate how frequently or infrequently you currently have each experience. Please answer according to what really reflects your experience rather than what you think your experience should be. Please treat each item separately from every other item."
  - **Everyday Experience – 2:** "Next is the collection of statements reflecting thoughts about everyday experience in general. Use the given scale to indicate your level of agreement or disagreement with each statement. Similar to the instruction given with the previous section please answer according to what really reflects your experience rather than what you think your experience should be."
  - **Experience Related to Work – 1:** "Next is a collection of statements about your experience at workplace. Using the rating scale below, please indicate how frequently or infrequently you currently have each experience. Please treat each item separately from every other item. Similar to the previous section as advised, please answer according to what really reflects your experience rather than what you think your experience should be."
  - **Experience Related to Work – 2:** "Next is the collection of statements reflecting thoughts about your experience at work. Use the given scale to indicate your level of agreement or disagreement with each statement."
- **The page shows the questions in a different order from the one the author set.** The settings list the questions in authored order (`question_ids`): each instruction screen is followed by its own statements. The setting `enable_questions_ordering_by_cat` is "on", and the page markup puts all four instruction screens first, then the 45 statements numbered "1 / 45" to "45 / 45" in a different order. The table below uses the authored order and gives each statement's on-page number.
- **No question is required:** every one of the 45 is marked `data-required='false'` in the markup.

#### The 45 statements

Option sets:

- **F** = Always, Often, Sometimes, Rarely, Never
- **A** = Strongly Disagree, Disagree, Neither agree nor disagree, Agree, Strongly Agree
- **R** = the same five in reverse order, Strongly Agree first

"Marked correct" is the option the decoded answer key flags; every other option is flagged 0. Source: the four captures above; text from the August 2024 capture.

**Everyday Experience – 1**

| # | On page | Item id | Statement | Options | Marked correct |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 / 45 | 15 | I cannot stop myself from eating delicious and tempting but unhealthy food. | F | Never |
| 2 | 2 / 45 | 16 | I find it difficult to resist my temptations (like eating, drinking, etc.). | F | Never |
| 3 | 3 / 45 | 17 | I tend to buy fancy products even if they are of little use to me. | F | Never |
| 4 | 4 / 45 | 18 | I spend too much money on things which are not useful to me. | F | Never |
| 5 | 5 / 45 | 19 | It makes me angry if I don’t get to eat my favourite cuisines. | F | Never |
| 6 | 6 / 45 | 20 | When it is impossible to fulfil my temptation, I keep thinking about it. | F | Never |
| 7 | 11 / 45 | 23 | Unfavourable incidents disturb me immensely. | F | Never |
| 8 | 12 / 45 | 24 | Failure makes me feel pessimistic. | F | Never |
| 9 | 13 / 45 | 25 | Failure disturbs me internally. | F | Never |
| 10 | 14 / 45 | 26 | While in stress, I find it difficult to differentiate between right and wrong. | F | Never |
| 11 | 15 / 45 | 27 | During tough times, I generally take rash decisions. | F | Never |
| 12 | 16 / 45 | 28 | When in tension, I cannot give a careful thought to the situation. | F | Never |

**Everyday Experience – 2**

| # | On page | Item id | Statement | Options | Marked correct |
| --- | --- | --- | --- | --- | --- |
| 13 | 22 / 45 | 57 | I see myself as a part of the natural system. | A | Strongly Agree |
| 14 | 23 / 45 | 53 | Whatever I do, I believe, has an impact on the larger social system. | A | Strongly Agree |
| 15 | 24 / 45 | 54 | I feel responsible towards the larger social system. | A | Strongly Agree |
| 16 | 25 / 45 | 55 | I feel that human beings, animals and trees are connected to each other. | A | Strongly Agree |
| 17 | 26 / 45 | 56 | I feel, all the living-beings in the nature are dependent on each other. | A | Strongly Agree |
| 18 | 27 / 45 | 52 | I see myself as a part of the larger social system. | A | Strongly Agree |

**Experience Related to Work – 1**

| # | On page | Item id | Statement | Options | Marked correct |
| --- | --- | --- | --- | --- | --- |
| 19 | 7 / 45 | 21 | I am unable to remain focused on my work for a long time and get easily carried away by other things. | F | Never |
| 20 | 8 / 45 | 22 | Various temptations keep coming to my mind while I am working. | F | Never |
| 21 | 9 / 45 | 13 | I am easily distracted during my work. | F | Never |
| 22 | 10 / 45 | 14 | I find it difficult to concentrate on my work. | F | Never |
| 23 | 17 / 45 | 29 | I feel extremely frustrated If I do not achieve my work targets. | F | Never |
| 24 | 18 / 45 | 30 | I feel frustrated even if it s a small failure at work. | F | Never |
| 25 | 19 / 45 | 31 | When emotionally disturbed at work, generally I don’t make good decisions. | F | Never |
| 26 | 20 / 45 | 32 | I am unable to think of alternatives, when I am under stress at work. | F | Never |
| 27 | 21 / 45 | 33 | I find it difficult to look at the problem from different perspectives during stressful situations at work. | F | Never |

**Experience Related to Work – 2**

| # | On page | Item id | Statement | Options | Marked correct |
| --- | --- | --- | --- | --- | --- |
| 28 | 32 / 45 | 34 | I cherish the moments of results much more than the moments of efforts. | R | Strongly Disagree |
| 29 | 33 / 45 | 35 | Desired results of my work are more important than efforts. | R | Strongly Disagree |
| 30 | 34 / 45 | 36 | I insist on getting rewarded for my work at my desired time. | R | Strongly Disagree |
| 31 | 35 / 45 | 37 | Getting credit of my work is extremely important for me. | R | Strongly Disagree |
| 32 | 36 / 45 | 38 | When I do something well, I expect recognition from others. | R | Strongly Disagree |
| 33 | 37 / 45 | 39 | While working, I keep thinking about what is in it for me. | R | Strongly Disagree |
| 34 | 38 / 45 | 40 | I work only when I see that there is some personal benefit for me. | R | Strongly Disagree |
| 35 | 39 / 45 | 41 | I cannot work, when I know that I will not get anything in return for myself. | R | Strongly Disagree |
| 36 | 40 / 45 | 42 | When I am given a task, I first think about how I will benefit from it. | R | Strongly Disagree |
| 37 | 41 / 45 | 43 | I experience joy in my work. | A | Strongly Agree |
| 38 | 42 / 45 | 44 | My spirit is energized by my work. | A | Strongly Agree |
| 39 | 43 / 45 | 45 | The work I do is connected with what I think is important in life. | A | Strongly Agree |
| 40 | 44 / 45 | 46 | My job helps me to understand my life’s purpose. | A | Strongly Agree |
| 41 | 45 / 45 | 47 | My work makes my life more meaningful. | A | Strongly Agree |
| 42 | 28 / 45 | 48 | I feel, my role in the society is a very essential part of my life. | A | Strongly Agree |
| 43 | 29 / 45 | 49 | I motivate my colleagues to take care of natural environment. | A | Strongly Agree |
| 44 | 30 / 45 | 50 | I try to convince my colleagues to become responsible towards nature and environment. | A | Strongly Agree |
| 45 | 31 / 45 | 51 | I try that my colleagues behave socially responsible. | A | Strongly Agree |

Totals: 21 statements on scale F marked Never, 15 on scale A marked Strongly Agree, and 9 on scale R marked Strongly Disagree. These match current-site.md. Statements 28–36 run in the reverse direction to the rest: agreeing with them counts against the "correct" end.

#### Scoring settings

These come from the decoded `aysQuizOptions['3']`, the same in all four captures. What each setting means comes from the plugin maker's user manual ([Quiz Maker user manual](https://ays-pro.com/wordpress-quiz-maker-user-manual)), which describes the current Pro version, not 8.7.8 itself.

| Setting | Value | Meaning per the manual |
| --- | --- | --- |
| `calculate_score` | `by_points` | "By weight/points: The system will calculate the score based on answer points and question points" (2.4.1). The other choice, "By correctness", scores the percentage of correct answers. |
| `display_score` / `display_score_by` | `by_percentage` | the score is presented as a percentage (2.4.6) |
| `hide_score` | `on` | "Disable showing the user score on the results page" (2.4.5) |
| `show_interval_message` | `on` | "Enable the interval message to appear on the results page" (2.4.20) |
| `intervals` | three bands, below | per-range messages, given "By percentage", "By points" or "By keywords" (2.4.21) |
| `enable_average_statistical` | `on` | "Display the average score based on the results of all the users who have taken the quiz on the results page" (2.4.10) |
| `pass_score` | 0 | no pass mark |
| `disable_store_data` | `off` | storing results is not switched off |
| `send_results_admin`, `send_mail_to_site_admin` | `on` | admin email options switched on. `admin_mail` is `off`, so what actually reached the admin is a question for [How the KarmaYoga Scale and Dosha Survey work now](../issues/09-current-questionnaire-behaviour.md). |
| `send_results_user`, `user_mail` | `off` | user email options switched off |
| `information_form` | `disable` | no name or email form before or after |
| `enable_logged_users` | `off` | not limited to logged-in users |
| `apply_points_to_keywords`, `enable_top_keywords` | `off` | keyword results not used |

The result bands (`intervals`), exactly as stored:

| Min | Max | Message | Keyword |
| --- | --- | --- | --- |
| 0 | 35 | Not bad but not good either! | A |
| 36 | 75 | Good but still there is scope for improvement! | B |
| 76 | 100 | Great! you are on right path. Continue to get the ultimate! | C |

The bands carry no picture, redirect or product. A fourth keyword, D, is defined in `assign_keywords` but used by no band.

**The points each option is worth are not in any capture.** The answer key entries hold only a 0 or 1 "correct" flag per option (for example item 15 decodes to `{"question_answer":{"63":"0","64":"0","65":"0","66":"0","67":"1"}}`), and the hidden `ays_answer_correct[]` inputs are all 0. With `calculate_score` set to `by_points`, the score depends on answer points that the plugin keeps on the server. The settings also don't say whether the 0–100 bands are read as a percentage or as points. Working out what the plugin computes from these settings belongs to [How the KarmaYoga Scale and Dosha Survey work now](../issues/09-current-questionnaire-behaviour.md); this ticket only reports what the archives hold.

#### Result screen

- **The configured result message** (`final_result_text`), as stored:

  > Congratulations!
  > You completed the quiz!
  > avg_res_by_cats: %%avg_res_by_cats%%

  `%%avg_res_by_cats%%` is a plugin placeholder that the plugin fills in when the result is shown. Its name suggests average results by question category; the archives don't show the filled-in result. Changelog 8.7.5 added "The results by cats by average message variable" ([Quiz Maker Pro changelog](https://ays-pro.com/changelog-for-quiz-maker-pro)).
- **The results area in the page markup**, which is empty until the plugin fills it: a score-message slot, a message slot, "The average score is 65%", a progress bar starting at 0%, and a "Restart quiz" button. **"The average score is 65%" is identical in all four captures**, from August 2024 to October 2025.

### `/dosha-survey/`

#### Captures

| Captured (UTC) | Capture | WPForms version loaded | Questions and options as in April 2025? |
| --- | --- | --- | --- |
| 2025-04-18 19:43 | [Wayback](https://web.archive.org/web/20250418194303/https://care4mind.org/dosha-survey/) (CC-MAIN-2025-18) | 1.9.4.2 | baseline |
| 2025-06-23 00:06 | [Wayback](https://web.archive.org/web/20250623000640/https://care4mind.org/dosha-survey/) (CC-MAIN-2025-26) | 1.9.4.2 | yes |
| 2025-12-07 06:54 | [Wayback](https://web.archive.org/web/20251207065432/https://care4mind.org/dosha-survey/) (CC-MAIN-2025-51) | 1.9.6.1 | yes |
| 2026-03-15 23:49 | [Wayback](https://web.archive.org/web/20260315234946/https://care4mind.org/dosha-survey/) (CC-MAIN-2026-12) | 1.9.6.1 | yes |
| 2026-08-17 17:07 | Common Crawl only: CC-MAIN-2026-34, file `crawl-data/CC-MAIN-2026-34/segments/1786091673393.86/warc/CC-MAIN-20260817160715-20260817190715-00501.warc.gz`, offset 118142012, length 32411, at [data.commoncrawl.org](https://data.commoncrawl.org/) | 1.9.6.1 | yes |

The page holds WPForms form number 895. WPForms is a WordPress plugin for building forms, and the page loads it from the `wpforms-lite` plugin folder. The form has 12 required radio-button questions, a "Submit" button, and one extra text field, number 13. That field's label is different in every capture ("react easy schedule", "strange How do", "Plans) you", "a changes? team?", "do to for"), which matches current-site.md's description of the anti-spam honeypot field (a hidden trap field that only bots fill in). It is not part of the survey.

#### The 12 questions

Every option's stored value is its own label text. No option carries a number, a code or a dosha name. Source: the five captures above.

| No. | Topic (as labelled) | Question | Option 1 | Option 2 | Option 3 |
| --- | --- | --- | --- | --- | --- |
| 1 | Memory | Which of the following best describes your memory? | I have some difficulty remembering things | I have a good memory in general | I have a good memory, I can recall things others can’t |
| 2 | Concentration | How easy is it for you to focus on something for an extended period? | It is easy for me to get distracted | I focus when something is logical | I have no trouble concentrating |
| 3 | Changes to Plans | How do you react to sudden schedule changes? | I don’t get angry, I adapt easily | I don’t like it, but I adjust if logical | I don’t like changes to my plans |
| 4 | Appeal to Change | What convinces you to change your mind? | Overthinking & second-guessing | Someone logically convinces me | If a loved one asks me to reconsider |
| 5 | Storytelling Style | How do you tell stories? | My stories are detailed & wander into topics | I tell only the necessary details | I provide vivid descriptions |
| 6 | Work Style | How do you prefer to work? | Work in bursts of energy | Follow a proper schedule | Work at a consistent pace |
| 7 | Learning Style | How do you learn new things? | I get distracted often | I follow a strict routine | I start slow but pick up later |
| 8 | Dreams | How often do you dream? | Almost every night | Occasionally, but very vivid | Rarely, and they are slow & detailed |
| 9 | First Reaction to Something New | How do you react to a new or strange situation? | Fear & overthinking possible scenarios | I look for ways to prove myself | I resist and prefer things as they were |
| 10 | Leadership Style | How do you interact with a team? | I fit in with any group | I am tough but fair | I treat my team like family |
| 11 | Starting Something New | How easily do you start new projects? | I jump in with both feet | I need convincing first | I plan every detail before starting |
| 12 | Planning Style | How do you prefer to plan? | I figure things out as I go | I like structured planning | I take many opinions before deciding |

On the page each question appears as "Question N: (Topic) Question?", with small spacing differences (for example "Question 2:(Concentration)").

**No capture shows how the form scores or what it shows on submit.** The pages carry only WPForms' general validation messages (`wpforms_settings`, such as "This field is required."). They hold no confirmation message, redirect or calculation. In WPForms, a confirmation is "what your visitor sees on the page right after they submit your form": a message, another page, or a redirect, set in the form builder under Settings » Confirmations ([WPForms: confirmations vs notifications](https://wpforms.com/form-confirmations-vs-notifications-whats-the-difference/); [WPForms: setting up form confirmations](https://wpforms.com/docs/setup-form-confirmation-wpforms/)). The archives never captured a submission, so they hold no confirmation. The homepage card (2026-06-14 capture above) promises that it "helps identify your unique mind-body type based on the three Ayurvedic principles — Vāta (air & space), Pitta (fire & water), and Kapha (earth & water)", but nothing archived turns answers into a type.

### The 16 pages that describe a Questionnaire

| Page on the current site | In any archive? | Card in the app |
| --- | --- | --- |
| `/triguna/` | yes, 4 captures (below) | 6 Triguna Profile |
| `/brahmavihara/` | no | 12 Brahma Vihara Profile |
| `/frienorfoeofself/` | no | none in any capture |
| `/karta-2/` | no | 9 Karta (Doer) Profile |
| `/knowyourmind/` | no | 20 Know Your State of Mind (name match only) |
| `/momentumofspiritualpractice/` | no | 31 Momentum of Spiritual Practice |
| `/sthitaprajna/` | no | 17 Do you have a Stabilised Intellect (Sthitaprajna)? |
| `/vikshepa/` | no | 21 Vikshepa (Distraction) Profiling |
| `/upavikshepaprofiling/` | no | 27 Upa-Vikshepa Profiling |
| `/panchkleshavikaarprofiling/` | no | 28 Panch Klesha - Vikaar Profiling |
| `/spiritualpractitionerprofiling/` | no | 29 Spiritual Practitioner Profiling |
| `/fivestepsofperfectionprofiling/` | no | 30 Five Steps of Perfection Profiling |
| `/knowyourvaluesahimsanon-violenceprofiling/` | no | 32 Know Your Values: Ahimsa (Non-Violence) Profiling |
| `/knowyourvaluessatyatruthfulnessprofiling/` | no | 35 Know Your Values: Satya (Truthfulness) Profiling |
| `/knowyourvaluesasteyanonstealingprofiling/` | no | 36 Know Your Values: Asteya (Non-Stealing) Profiling |
| `/knowyourvaluesbrahmacharya-profiling/` | no | 37 Know Your Values: Brahmacharya Profiling |

Sources: the Wayback CDX and Common Crawl searches above (one CDX query per page address), and the app front-page captures.

#### `/triguna/` captures

| Captured (UTC) | Capture |
| --- | --- |
| 2025-04-18 19:51 | [Wayback](https://web.archive.org/web/20250418195118/https://care4mind.org/triguna/) |
| 2025-09-08 00:04 | [Wayback](https://web.archive.org/web/20250908000417/https://care4mind.org/triguna/) |
| 2025-12-07 07:03 | [Wayback](https://web.archive.org/web/20251207070341/https://care4mind.org/triguna/) |
| 2026-06-14 10:30 | [Wayback](https://web.archive.org/web/20260614103028/https://care4mind.org/triguna/) |

All four hold the same "Triguna Profile Questionnaire" section and no questions, form or embedded plugin. The section reads: "A Triguna Profile Questionnaire is a tool to estimate the high and low characteristics of Trigunas in a person. According to Murthy & Kumar (2007), the following characteristics indicate high and low traits in each parameter." A table of High, Moderate and Low characteristics follows:

| Guna | High | Moderate | Low |
| --- | --- | --- | --- |
| Sattva | Wise, calm, self-disciplined, introspective, ethical, emotionally stable, seeks knowledge, content, truthful. | Self-disciplined, emotionally stable, rational, moral clarity but may struggle with practicality. | Confused, impulsive, lacks moral clarity, struggles with self-awareness, reactive rather than reflective. |
| Rajas | Ambitious, energetic, competitive, seeks success and material gains, socially active, risk-taker, assertive. | Energetic, goal-driven, leadership qualities, proactive but may experience impatience and frustration. | Procrastination, lack of motivation, struggles to initiate tasks, passive, indifferent to achievement. |
| Tamas | Lazy, confused, emotionally unstable, helpless, fearful, disconnected, prone to depression and procrastination. | Steady, practical, routine-oriented, patient but reluctant to change or adopt new perspectives. | Mentally clear, motivated, self-confident, engaged in life, purposeful, emotionally stable. |

No capture gives numbers or cut-offs for High, Moderate or Low. All four captures also show the leftover line "Hello, Mind! This is dynamic PHP running via shortcode." that current-site.md reports, so it has been there since at least April 2025. No capture of this page links to the app.

### Where this differs from current-site.md

- current-site.md says of the KarmaYoga Scale: "No result bands or interpretation text are in the HTML." All four archived copies of the page (latest 16 October 2025) do contain three bands with messages, inside the encoded settings entry `aysQuizOptions['3']` (see Scoring settings). Whether today's live page still carries them wasn't checked: this ticket sends nothing to the current site. No ADR is contradicted.

## Gaps and uncertainties

- **Option points for the KarmaYoga Scale.** Its score is calculated "by points", and no capture holds the points. Without them, or the plugin's documented default for unset points, the exact percentage can't be reproduced from archives alone. Whether the 0–35 / 36–75 / 76–100 bands are read as percent or points, and what happens to scores between 35 and 36 or 75 and 76, is also not stated in the settings.
- **Quiz Maker 8.7.8 is a paid edition.** Its version number belongs to the paid line ([Quiz Maker Pro changelog](https://ays-pro.com/changelog-for-quiz-maker-pro)), and the free WordPress.org plugin is numbered 6.7.1.x. Its source may not be publicly available, which may matter to [How the KarmaYoga Scale and Dosha Survey work now](../issues/09-current-questionnaire-behaviour.md). This ticket didn't check where 8.7.8's code can be read.
- **The manual describes today's plugin.** The setting meanings above come from the current user manual, not one written for 8.7.8.
- **The Dosha Survey's result** is not in any archive. WPForms shows its confirmation only after a submission, and no archive captured one.
- **The questionnaire app's content.** Only its front page and error page were ever archived. Its questions, scoring, result pages, scripts and pictures are not in the Wayback Machine, Common Crawl or archive.today. Card 13 (Entrepreneurship Orientation) and the gaps in card numbers are unexplained.
- **"Know Your Mind" ↔ "Know Your State of Mind"** is matched by name only; `/knowyourmind/` was never archived, so its content couldn't be compared with the card.
- **Other archives** were not searched. The Memento Time Travel service, which would check many national archives at once (`timetravel.mementoweb.org`), could not be reached from here (its hostname did not resolve). Two archive.today prefix searches hit its rate limit (HTTP 429); the host-wide search had already returned nothing.
- **The archive indexes may lag.** Recent captures can take time to appear. The newest Common Crawl capture found for any care4mind.org address is from 11 October 2026 (CC-MAIN-2026-43).

## Sources

Read on 2026-10-26.

Archive indexes and services:

- Wayback Machine CDX server: [domain query](http://web.archive.org/cdx/search/cdx?url=care4mind.org&matchType=domain&fl=timestamp,original,mimetype,statuscode,digest,length), [app address query](http://web.archive.org/cdx/search/cdx?url=http%3A%2F%2Fquestionnaire.care4mind.org%3A8020%2F%2A); [CDX server documentation](https://github.com/internetarchive/wayback/blob/master/wayback-cdx-server/README.md)
- Common Crawl: [index server](https://index.commoncrawl.org/), [list of crawls](https://index.commoncrawl.org/collinfo.json), per-crawl queries of the form `https://index.commoncrawl.org/CC-MAIN-2026-04-index?url=care4mind.org&matchType=domain&output=json`, and single records read by byte range from [data.commoncrawl.org](https://data.commoncrawl.org/)
- archive.today: [host search](https://archive.ph/care4mind.org), [subdomain search](https://archive.ph/*.care4mind.org), [app timemap](https://archive.ph/timemap/http://questionnaire.care4mind.org:8020/)

Captures (Wayback Machine links; each was imported from the Common Crawl crawl named in the tables above):

- Questionnaire app: [2025-04-21](https://web.archive.org/web/20250421151128/http://questionnaire.care4mind.org:8020/), [2025-08-09](https://web.archive.org/web/20250809095047/http://questionnaire.care4mind.org:8020/), [2026-01-15](https://web.archive.org/web/20260115090416/http://questionnaire.care4mind.org:8020/); error pages from Common Crawl (files and offsets in the app's capture table)
- `/karmayoga-scale/`: [2024-08-11](https://web.archive.org/web/20240811215710/https://care4mind.org/karmayoga-scale/), [2024-11-03](https://web.archive.org/web/20241103224838/https://care4mind.org/karmayoga-scale/), [2025-02-18](https://web.archive.org/web/20250218064226/https://care4mind.org/karmayoga-scale/), [2025-10-16](https://web.archive.org/web/20251016161351/https://care4mind.org/karmayoga-scale/)
- `/dosha-survey/`: [2025-04-18](https://web.archive.org/web/20250418194303/https://care4mind.org/dosha-survey/), [2025-06-23](https://web.archive.org/web/20250623000640/https://care4mind.org/dosha-survey/), [2025-12-07](https://web.archive.org/web/20251207065432/https://care4mind.org/dosha-survey/), [2026-03-15](https://web.archive.org/web/20260315234946/https://care4mind.org/dosha-survey/), plus Common Crawl CC-MAIN-2026-34 (2026-08-17)
- `/teertha-yatra-quiz/`: [2024-08-11](https://web.archive.org/web/20240811225000/https://care4mind.org/teertha-yatra-quiz/), [2024-09-18](https://web.archive.org/web/20240918025109/https://care4mind.org/teertha-yatra-quiz/), [2025-02-18](https://web.archive.org/web/20250218072954/https://care4mind.org/teertha-yatra-quiz/), [2025-08-10](https://web.archive.org/web/20250810140052/https://care4mind.org/teertha-yatra-quiz/), [2026-03-16](https://web.archive.org/web/20260316003111/https://care4mind.org/teertha-yatra-quiz/)
- `/triguna/`: [2025-04-18](https://web.archive.org/web/20250418195118/https://care4mind.org/triguna/), [2025-09-08](https://web.archive.org/web/20250908000417/https://care4mind.org/triguna/), [2025-12-07](https://web.archive.org/web/20251207070341/https://care4mind.org/triguna/), [2026-06-14](https://web.archive.org/web/20260614103028/https://care4mind.org/triguna/)
- Homepage: [2024-08-11](https://web.archive.org/web/20240811215326/https://care4mind.org/), [2025-02-18](https://web.archive.org/web/20250218063720/https://care4mind.org/), [2025-03-17](https://web.archive.org/web/20250317050901/https://care4mind.org/), [2025-04-18](https://web.archive.org/web/20250418194603/https://care4mind.org/), [2026-06-14](https://web.archive.org/web/20260614102610/https://care4mind.org/)

Documentation, source code and registries:

- [Quiz Maker user manual](https://ays-pro.com/wordpress-quiz-maker-user-manual) (Ays Pro)
- [Quiz Maker Pro changelog](https://ays-pro.com/changelog-for-quiz-maker-pro) (Ays Pro; Business, Developer and Agency editions)
- [Quiz Maker on WordPress.org](https://wordpress.org/plugins/quiz-maker/) (free edition)
- [WPForms: setting up form confirmations](https://wpforms.com/docs/setup-form-confirmation-wpforms/) and [WPForms: confirmations vs notifications](https://wpforms.com/form-confirmations-vs-notifications-whats-the-difference/)
- [CPython `Lib/wsgiref/simple_server.py`, branch 3.10](https://github.com/python/cpython/blob/3.10/Lib/wsgiref/simple_server.py)
- [Django `django/core/servers/basehttp.py`](https://github.com/django/django/blob/main/django/core/servers/basehttp.py)
- [Django deployment checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- ARIN RDAP: [134.122.25.72](https://rdap.arin.net/registry/ip/134.122.25.72), [24.199.93.62](https://rdap.arin.net/registry/ip/24.199.93.62)
