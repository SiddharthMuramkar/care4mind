# Front-end site: every public page

Status: ready-for-agent
Source: [Design notes](design.md), [Provisional structure decisions](decisions.md) (D01–D21), [Content model v1](../content-v1/spec.md), [Front-end foundation](../front-end-foundation/spec.md) (superseded in its Kolam parts by D21), [Design direction (planning ticket 21)](../rebuild/issues/21-design-direction.md)
Tickets: [issues/](issues/)

## Problem Statement

The developer has a foundation: four pages in the Press look (the homepage, one Concept page, the KarmaYoga Scale's intro page and the 404 page), with paper folios on indigo, printer's ornaments, ink, page turns, the reading thread and the script switch. The foundation blended Press with the Kolam direction's logo and drawings; on 2026-10-28 the developer dropped that blend (D21), so everything is Press, and ticket 16 replaces each Kolam element with its Press counterpart. Alongside the foundation, [content-v1](../content-v1/spec.md) carries everything worth keeping from the current site into one typed content module: 19 Concepts, five topics, the traditional texts and the verses the site quotes, the shared References, the glossary, the Library lists and 18 Questionnaire records.

Visitors can't reach most of that yet. The header has two links. There is no A–Z, no topic page, no texts, no Library, no search and no way to take a Questionnaire.

The developer wants the whole public front end now: every page type, "custom, rich in colour, and fun to explore, with motion and feedback on scroll and click" (the brief's design bar), and interactive enough to knock the client's socks off. That must not cost anyone access or speed, and it must meet every requirement it touches:

- **NFR-01:** WCAG 2.2 AA, including reduced motion.
- **NFR-02:** "good" Core Web Vitals on mobile. That means LCP ≤ 2.5 s (Largest Contentful Paint: when the main text appears), INP ≤ 200 ms (Interaction to Next Paint: how fast the page answers a tap or key) and CLS ≤ 0.1 (Cumulative Layout Shift: how much things jump about).
- **FR-01:** from any Concept page, its related Concepts, traditional texts, applications, References and Questionnaires are one click away. Every topic has a landing page, and every page shows breadcrumbs.
- **FR-03:** every Reference has a title and, where one exists, a DOI or stable URL, all in one citation style.
- **FR-04 and NFR-03:** search finds content by title, by a Concept's name in any spelling, by author, by traditional text and by keyword.
- **FR-05,** as far as it can go without scoring rules: purpose and limitations come before the start, and incomplete answers are refused. No Questionnaire has confirmed scoring rules yet, so no page may show a score.
- **FR-06:** everything works at every width from 360 to 1440 px.
- **NFR-04:** every page has a title, a description and a canonical address; an XML sitemap lists every public page; no internal link is broken.

Two more constraints shape the build:

- **The structure is provisional.** Planning tickets 13–20, 24 and 28 aren't answered yet. The agent decided their questions provisionally, in [decisions.md](decisions.md), and any of those decisions may change. A change must be cheap.
- **Many agents build at once.** The tickets run as parallel lanes on one machine. They must not edit the same files or disturb each other's tests.

## Solution

### The site map (D01, D02)

| Address | Page |
| --- | --- |
| `/` | Home |
| `/concepts/` | Concepts A–Z: every Concept, every term explained inside one, and every glossary entry |
| `/concepts/<slug>/` | A Concept (19 of them) |
| `/concepts/map/` | Concept map (Proposal) |
| `/topics/<slug>/` | A topic (5 of them) |
| `/texts/` and `/texts/<slug>/` | Traditional texts, and each work with the verses the site quotes |
| `/questionnaires/` | The KarmaYoga Scale (preview) and 17 Questionnaires coming later |
| `/questionnaires/karmayoga-scale/` | Its purpose and limitations |
| `/questionnaires/karmayoga-scale/take/` | The flow (preview, behind a flag) |
| `/library/` and its five pages | References, Textbooks, Inspirational books, Courses and Methods |
| `/search/` | Search results (search also opens anywhere with ⌘K) |
| `/proposals/` | Features proposed beyond the brief, for the Project owner's sign-off |

Every address ends with a slash. Every address the current site served leads to its new page in one hop, meaning one redirect and no chains.

### The look: Press only (D21)

Every page is set as a scholar's edition: Playfair at fixed weights with Tiro Devanagari Sanskrit, small capitals for labels, menus and buttons, IAST in italic; indigo, cream, paper, turmeric, vermilion and the ink wash; folios, the lotus Fleuron, OrnamentRule, a faintly ruled indigo hero, Devanagari numerals, contents with dotted leaders and verses set like a manuscript. Motion speaks the same language of ink, rules and paper. The [decision register](decisions.md#d21-press-replacements) lists the Press element that replaces each Kolam one.

### On every page

- **Header:** the Press wordmark (Care4Mind, with the 4 in a vermilion roundel), then Concepts · Texts · Questionnaires · Library · Search.
  - On a computer, Concepts opens a panel with the five topics, how many Concepts each has, the A–Z and the map. Library opens a panel with its five pages.
  - On a phone, a Menu button opens a sheet that slides in and can be swiped away.
  - Every link works without JavaScript.
- **Search anywhere:** ⌘K (Ctrl+K on Windows and Linux) opens a command palette: a search box over the page that lists results as you type. It finds any spelling, groups results by kind and shows which spelling matched.
- **Previews:** pointing at or focusing a link to a Concept, a citation or a verse shows a short preview card.
- **Feedback:** "Copy verse" and "Copy citation" confirm with a short message in the corner, called a toast.
- **Breadcrumbs** on every page below the homepage.
- **Motion:** Press's ornaments (the Fleuron drawn once, rules and leaders that ink in), ink, page turns and underlines everywhere, plus three additions:
  - card titles fly into page titles for topics, works and Questionnaires, as they already do for Concepts;
  - filtered lists glide into their new order;
  - the Questionnaire flow slides between parts.

  With "reduce motion" on, everything is still, and every feature still works.
- **Print:** reading pages and the flow's end screen print cleanly.

### Page by page

- **Home:** the foundation's opening folio stays. Below it:
  - a search box with sample spellings (vikshepa · विक्षेप · viksepa) that opens the palette filled in;
  - the Topics contents plate: the five topics set like a book's contents, with Devanagari numerals and dotted leaders, each row a link that lights as you point at it, its leader inking in;
  - one verse from each traditional text;
  - the KarmaYoga card and a shelf of Questionnaires coming later;
  - a row of book spines, set in type, leading to the Library;
  - a still picture of the Concept map, labelled Proposal.
- **Concepts A–Z:** one alphabetical list of every Concept, every term inside a Concept and every glossary entry.
  - A rail of letters jumps through it.
  - Filter chips narrow it by topic, by text, or to Concept pages only, and the list glides into its new order.
  - Glossary entries link to DharmaWiki, marked as another site.
- **Concept page:** everything the foundation built, plus:
  - a table of contents that stays in view and highlights the section you're reading;
  - a "Linked knowledge" panel that gathers the related Concepts (each with its reason), the texts quoted, the applications, the comparisons, the References and the Questionnaire, joined by cross-reference rules, dotted leaders that ink in as you scroll;
  - citations that jump to their Reference and open the list;
  - verse cards with "Copy verse";
  - tables whose first column stays in view;
  - previous and next links within the topic.
- **Topic page:** the topic's Concepts set as a contents plate, like a book's contents, and a card lights its row when you point at or focus it, the row's leader inking in. Below come the verses its Concepts quote. The values topic also shows its shared yama–niyama introduction.
- **Texts:** each work is shown like a manuscript: every verse the site quotes, in order, in Devanagari and IAST, with its translations attributed and chips linking to the Concepts that quote it. A rail of verse numbers stays in view, and each verse has its own link, such as `/texts/yoga-sutra/#1-30`.
- **Questionnaires:** the KarmaYoga Scale is featured as a preview. The 17 coming later are grouped by topic, and every status is written in words.
- **The KarmaYoga flow (preview):**
  - purpose and limitations first;
  - then four parts, one per screen, with large answer buttons and a tally of short rules that inks in as you answer;
  - incomplete parts are refused without losing anything;
  - a review step, then an end screen that says plainly the scoring isn't confirmed yet;
  - nothing stored or sent anywhere.
- **Library:** References with filters, an author A–Z, "cited in" chips and "Copy citation"; books as a shelf of typographic spines with their notes; course cards; the Methods tables.
- **Search page:** results grouped by kind, showing the spelling that matched. It works without JavaScript, and refines as you type when JavaScript is on.

### Proposals (D20)

Both are built behind feature flags and labelled Proposal:

- **Concept map:** the 19 Concepts round a circle, one sector per topic, on a printed plate: hairline curves join them for a shared verse, a shared work or a rarely cited shared Reference, each kind in its own line style. Pointing at a Concept lights its neighbours. A "Connections" list says the same in words, and it is what phones show first.
- **Site-wide "Devanagari first":** one choice puts Devanagari before IAST on every page and remembers it, with no flash on load.

`/proposals/` lists them for sign-off, with one more idea that is described but not built: audio pronunciation.

### Behind the scenes

- One route registry lists every public page. The tests, the sitemap and a link crawler all read it, so they can't drift apart.
- Lanes test on their own ports and queue their heavy runs.
- Speed budgets fail CI if a page gets slow or heavy.

## User Stories

### Visitors (general public)

1. As a first-time visitor, I want the homepage to show the five topics set like a book's contents, so that I see at a glance what the site covers and can step into any part of it.
2. As a visitor, I want a search box on the homepage that suggests spellings like "vikshepa · विक्षेप · viksepa" and opens search already filled in, so that I learn I can type a term however I know it.
3. As a visitor, I want one verse from each traditional text on the homepage, so that I meet the texts before I go looking for them.
4. As a visitor, I want the homepage to show the KarmaYoga Scale and a shelf of Questionnaires coming later, so that I know what I can try now and what is on its way.
5. As a visitor, I want the Library shown as a shelf of book spines set in type, so that browsing books feels like standing at a real shelf.
6. As a visitor, I want the same five sections in the header on every page (Concepts, Texts, Questionnaires, Library, Search), so that I always know where I can go.
7. As a visitor on a computer, I want the Concepts menu to open a panel with the five topics, how many Concepts each has, the A–Z and the map, so that I can jump straight into a topic.
8. As a visitor on a phone, I want a Menu button that opens a sheet I can swipe away, and that closes when I pick a page, so that the navigation fits my screen.
9. As a visitor, I want breadcrumbs on every page below the homepage, so that I always know where I am and can step back up (FR-01).
10. As a visitor reading a Concept, I want one panel that gathers its related Concepts, the texts it quotes, its applications, its comparisons, its References and its Questionnaire, each one click away, so that I can follow the idea wherever it leads (FR-01).
11. As a visitor, I want each related Concept to say why it's related ("Both quote Yoga Sūtra 2.30"), so that I know what I'll find before I click.
12. As a visitor reading a long Concept page, I want a table of contents beside the text that highlights the section I'm in, so that I can find my way round.
13. As a visitor, I want "previous" and "next" links to the Concepts on either side in the same topic, turning the page as I go, so that I can read a topic like a book.
14. As a visitor, I want each topic to have its own page, with its Concepts set as a contents plate whose row lights up when I point at a card, so that a topic feels like one whole (FR-01).
15. As a visitor, I want one A–Z of every Concept, every term explained inside a Concept and every glossary entry, so that I can find any term the site covers.
16. As a visitor, I want to filter the A–Z by topic, by text, or to Concept pages only, and see the list glide into its new order, so that I can narrow it without losing my place.
17. As a visitor, I want glossary entries that lead to DharmaWiki to say so, so that I'm not surprised to land on another site.
18. As a visitor, I want a short preview when I point at or focus a link to a Concept, so that I can decide whether to follow it.
19. As a visitor, I want "Copy verse" and "Copy citation" to confirm with a short message, so that I know the copy worked.
20. As a visitor, I want the Questionnaires page to say in words which Questionnaire I can try, which is a preview and which come later, so that I'm never sent into something that doesn't work.
21. As a visitor with an old care4mind.org bookmark, such as `/vikshepa/`, I want to land straight on its new page, so that my links keep working (FR-07).
22. As a visitor, I want the site to answer every scroll and click (rules inking in, ink spreading, pages turning) while the text I'm reading stays still, so that it's fun to explore and easy to read.
23. As a visitor, I want to print a Concept page without the menus and decoration, so that I can read it on paper.

### Students and educators

24. As a student, I want to search for a term in the spelling I know (vikshepa, viksepa, vikṣepa or विक्षेप) and get the same Concept first, so that spelling never stops me (FR-04, NFR-03).
25. As a student, I want each result to show which spelling matched ("matched Sanshay"), so that I learn the standard form.
26. As a student, I want a search for a term inside a Concept, such as saṃśaya, to take me to its place on the Vikṣepa page, so that I find terms that don't have pages of their own.
27. As a student, I want a typo such as "vikshpa" still to find Vikṣepa, so that I don't have to spell perfectly.
28. As a student, I want every verse shown in Devanagari and IAST, with its translation and where the translation came from, so that I can study the original.
29. As a student, I want each term inside a Concept (each of the five kleśas, say) to have its own heading and address, so that I can link straight to it.
30. As a student learning Devanagari, I want to choose "Devanagari first" once and have it apply on every page (Proposal), so that I read in the script I'm learning.
31. As an educator, I want addresses that never change, so that the links in my course notes keep working.
32. As an educator, I want the "Indian vs Western" tables to work on a phone, with the first column staying in view, so that I can use them in class.
33. As an educator, I want to copy a verse with its locator in one click, so that I can paste it into my notes accurately.

### Researchers

34. As a researcher, I want a References page that lists every source once, with its full details and its DOI or stable link, so that I can survey the evidence (FR-03).
35. As a researcher, I want to filter References by type and topic, and jump to authors by letter, so that I find a source fast.
36. As a researcher, I want each Reference to list the Concepts that cite it, so that I can see where a source is used.
37. As a researcher, I want to search for an author such as "Tomar" and find both the Reference and the Concepts that cite it, so that I can trace an author's influence (FR-04).
38. As a researcher, I want an in-text citation such as "(Tomar, 2024)" to take me to its entry in the page's References and open the list, so that I can check a source without losing my place.
39. As a researcher, I want each traditional text to have a page showing every verse the site quotes, in order, with links to the Concepts that quote it, so that I can see how the site uses a text.
40. As a researcher, I want to search "YS 1.30" or "Yoga Sutra 1.30" and land on that verse, so that I can look a passage up by its locator.
41. As a researcher, I want stable links to single verses, such as `/texts/yoga-sutra/#1-30`, so that I can cite a passage precisely.
42. As a researcher, I want comparisons with Western psychology labelled as comparisons, never as equivalences, so that the site doesn't overclaim (D05).
43. As a researcher, I want every content page to say where its text came from and whether anyone has reviewed it, so that I can judge how far to trust it.
44. As a researcher, I want related Concepts computed from shared verses, works and References rather than guessed, so that the links are evidence (D06).

### People taking the KarmaYoga Scale (preview)

45. As someone about to take the KarmaYoga Scale, I want to read its purpose and limitations before Start, so that I know what it is and what it isn't (FR-05).
46. As someone taking it, I want one part per screen, each opening with its own instructions, so that 45 statements don't overwhelm me.
47. As someone taking it on a phone, I want large answer buttons with their labels in words, so that I don't pick the wrong one by accident.
48. As someone taking it, I want to see "Part 2 of 4 · 14 of 45 answered" and a tally of short rules that inks in as I answer, so that I know how far I've come.
49. As someone taking it, I want "Next" to refuse a part I haven't finished and point me to each statement I missed, without losing the answers I gave, so that I can finish quickly (FR-05).
50. As someone taking it, I want the browser's Back button to take me to the previous part with my answers still there, so that I can change my mind.
51. As someone taking it, I want to review every statement and my answer before I finish, with a way to change any of them, so that I can check my answers.
52. As someone taking it, I want the end screen to say plainly that scoring isn't confirmed yet and show no number or band, so that I never mistake a placeholder for a result.
53. As someone taking it, I want to retake it (after confirming) or print my answers, so that I can start again or keep a copy.
54. As someone taking it, I want my answers never to leave my device, be saved or appear in the address bar, so that my privacy is safe (D16).
55. As someone taking it, I want a warning before I close the page with answers given, so that I don't lose them by accident.
56. As someone taking it, I want no celebration or flashy motion at the end, so that a subject close to mental health is treated with care.

### Keyboard users

57. As a keyboard user, I want ⌘K or Ctrl+K to open search and Escape to close it with focus back where I was, and no single-key shortcuts I could set off by accident, so that search is quick and safe (WCAG 2.1.4).
58. As a keyboard user, I want to move through search results with the arrow keys and open one with Enter, so that I never need a mouse to search.
59. As a keyboard user, I want the A–Z letters to take one Tab stop, with the arrow keys moving between letters, so that I don't tab through 26 links.
60. As a keyboard user, I want the Concepts and Library panels to open from the keyboard and close with Escape, returning focus to where I was, so that the menu never traps me.
61. As a keyboard user, I want link previews to appear on focus without covering what I'm focused on, and to close with Escape, so that previews help rather than hide (WCAG 2.4.11, 1.4.13).
62. As a keyboard user, I want to finish the whole KarmaYoga flow with the keyboard alone, so that I can take it at all.
63. As a keyboard user, I want the error summary to take focus and link to each statement I missed, so that I can fix them quickly.
64. As a keyboard user, I want the Concept map's points to be ordinary links I can tab through, with their neighbours highlighted as I go, so that the map isn't for mouse users only.
65. As a keyboard user, I want the phone menu to keep my focus inside it while it's open and give it back to the Menu button when it closes, so that I never lose my place.

### Screen-reader users

66. As a screen-reader user, I want search to announce how many results it found, so that I know whether my search worked.
67. As a screen-reader user, I want each statement in the flow read as a group with the statement as its label, so that I know what each answer belongs to.
68. As a screen-reader user, I want progress read as words ("Part 2 of 4, 14 of 45 answered"), so that I don't have to work it out from a percentage.
69. As a screen-reader user, I want the Concept map's "Connections" list to tell me everything the picture shows, so that I miss nothing.
70. As a screen-reader user, I want "Copied" confirmations announced politely without moving my focus, so that I know the copy worked and keep my place.
71. As a screen-reader user, I want IAST and Devanagari tagged with their language everywhere, so that my reader pronounces them (WCAG 3.1.2).
72. As a screen-reader user, I want decorative ornaments, rules, leaders and tallies to stay silent while their links are properly named, so that I hear only what matters.
73. As a screen-reader user, I want filter results announced ("12 entries") when I change a filter, so that I know the list changed (WCAG 4.1.3).
74. As a screen-reader user submitting a search on the results page, I want focus moved to the results heading, so that I know the results arrived.
75. As a screen-reader user, I want links that leave the site to say so, so that I know before I go.

### People who reduce motion

76. As someone whose device asks to reduce motion, I want every new ornament (the contents plates' leaders, the cross-reference rules, the progress tally, the map's plate) to appear finished and still, so that nothing moves.
77. As someone who reduces motion, I want filtered lists, title morphs, part changes, menus and page turns to change instantly, so that nothing slides or fades.
78. As someone who reduces motion, I want every feature to keep working without its movement, so that I lose the animation, never the feature.

### Phones, slow devices, other browsers and no JavaScript

79. As a visitor on a cheap phone, I want every page's text to appear within 2.5 seconds and every tap to respond within 200 ms, including search, filters, answers, the script toggle and the menu, so that the site never feels broken (NFR-02).
80. As a visitor on a slow connection, I want search and the phone menu to download only when I'm about to use them, so that the page I came for loads first.
81. As a visitor on a 360 px phone, I want every page and the flow to fit without sideways scrolling, with wide tables scrolling inside their own frame, so that the site works on my screen (FR-06).
82. As someone who zooms to 400%, I want long Devanagari verses to wrap at 320 px rather than run off the screen, so that I can read them large (WCAG 1.4.10).
83. As a Firefox or Safari user, I want every page to work and look finished, even where my browser lacks the newest effects, so that I'm not punished for my browser.
84. As a visitor with JavaScript off, I want to read every page, follow every link, reach the menu and search through the results page, so that interaction is an enhancement, not a requirement.
85. As a visitor facing a long list (the A–Z, the References), I want it to appear quickly and not jump while it loads, so that I can start reading at once.

### The Psychology expert

86. As the Psychology expert, I want the end of the flow to be an obvious placeholder with no numbers or bands, so that nothing implies scoring I haven't approved.
87. As the Psychology expert, I want the held-back score texts kept off every page and out of search, so that nothing I haven't reviewed is published.
88. As the Psychology expert, I want the flow switched off in production unless someone turns it on, so that the unreviewed instrument isn't public.
89. As the Psychology expert, I want the KarmaYoga statements shown exactly as the source wrote them, in the source's option order, so that I review the real instrument.
90. As the Psychology expert, I want the draft limitations marked as not yet reviewed by me, so that visitors know they're a draft.

### The Research editor

91. As the Research editor, I want every Reference in one style, with the pages that cite it, so that I can check sources page by page (FR-03).
92. As the Research editor, I want each page's provenance and review status shown, so that I can see what I still have to check.
93. As the Research editor, I want each Concept's primary topic visible in its breadcrumbs and on its topic page, so that I can review the topic list in place (D03).

### The Project owner and the Client

94. As the Project owner, I want a Proposals page listing what the design suggests beyond the brief (the Concept map, site-wide Devanagari first and audio pronunciation), so that I can accept or refuse each one in the sign-off pack.
95. As the Project owner, I want every provisional structure decision in one register with the planning ticket that confirms it, so that I can sign them off together.
96. As the Project owner, I want a refused proposal to switch off without code changes, so that saying no costs nothing.
97. As the Client, I want the site kept out of search engines until launch, even with titles, canonical addresses and a sitemap in place, so that it isn't confused with the current site.

### Content editors

98. As a Content editor, I want a new Concept, verse, Reference or Questionnaire to appear everywhere it belongs (the A–Z, its topic, search, the sitemap, related links) without anyone touching page code, so that adding content is all I have to do.
99. As a Content editor, I want pages to get their breadcrumbs, previews and motion from their type, so that I never set them up by hand.
100. As a Content editor, I want a link to a page that doesn't exist to fail the build, so that visitors never meet it.

### The developer and the agents

101. As the developer, I want every public page listed once, in a route registry, so that the tests, the sitemap and the crawler can't drift apart.
102. As the developer, I want a crawler that starts at the homepage, follows every internal link and checks every `#anchor`, so that "no broken links" (NFR-04) is proved, not hoped.
103. As the developer, I want each lane to test on its own port and never reuse another lane's server, so that parallel agents don't test each other's work.
104. As the developer, I want heavy test runs to queue behind one lock, so that the machine isn't overloaded and tests don't time out.
105. As the developer, I want one `pnpm check` command for every fast check, so that every agent finishes the same way.
106. As the developer, I want tests to wait until the page is interactive before they click, so that they don't fail at random under load.
107. As the developer, I want each ticket to own its own files, with shared tokens and slots added once, so that parallel lanes merge without conflicts.
108. As the developer, I want every internal link made by `hrefFor()`, so that changing an address happens in one place.
109. As the developer, I want proposals and the preview behind one feature-flag module, so that switching one is a single setting.
110. As the developer, I want Lighthouse budgets on eight representative pages and interaction checks on the five busiest controls, so that a slowdown fails CI.
111. As the developer, I want script-size budgets, so that the JavaScript stays small as features land.
112. As the developer, I want `pnpm shots` to screenshot every page type at 360 and 1440 px, so that I can review the look without running the site.
113. As the developer, I want a list of what I must still check by hand (screen reader, keyboard, zoom, a real phone), so that automated checks aren't mistaken for the whole story.
114. As an agent, I want one conventions doc for motion, links, files and slots, and a place in my ticket's Comments to ask for anything I don't own, so that I never break another lane.
115. As the developer, I want one look, Press, with no Kolam trace left in the code, the tests or the docs, so that every agent builds in the same vocabulary of ink, rules and paper (D21).

## Implementation Decisions

### How the work is split

- **Sixteen tickets.** They start once foundation ticket 05 is resolved and content-v1 is merged into the integration branch, `SiddharthMuramkar/frontend`. Ticket 16 came later, with D21.
- **Order:**
  - 01 makes testing safe for parallel lanes.
  - Then 03 (every route) and 04 (the shell) run side by side.
  - 16 (Press only, D21) needs only 03. 04 merges it before finishing, and removes its own Kolam uses.
  - 02 (route tests and crawler) needs 03 and 16, and 14 (redirects) needs only 03.
  - 05–10 and 12 need 03 and 04, and run in parallel.
  - 11 waits for 06, 09 and 10; 13 waits for 05 and 06; 15 waits for all the others.
- **Lanes.** Each ticket runs in its own git worktree (a second working copy of the repo) on its own branch, cut from the integration branch. Lanes never push. A merger merges them one at a time and runs the full checks after each.
- **File ownership.** Each ticket lists the files and folders it owns, and its lane creates or edits only those.
  - The colour and motion tokens and the root layout belong to ticket 04 alone; the one exception is ticket 16, which removes the kolam tokens. Later tickets style their parts in their own CSS Modules (stylesheets scoped to one component) and ask in their ticket's Comments if a token is missing.
  - The foundation's shared parts (the logo, folio, ornaments, breadcrumbs, cards, citation and verse) are read-only once ticket 03 has adapted them, unless a ticket's Owns list names one.
  - Some files are written early and owned later. Ticket 03 writes the first plain version of the prose renderer, which ticket 05 then owns. Ticket 04 writes the slot stubs, each owned afterwards by the ticket that fills it.
  - The content module belongs to content-v1. A site ticket may adjust only the one derived-data file its Owns list names. It keeps `@/content`'s interface and the content tests unchanged, and asks in Comments for anything else.
  - Each end-to-end spec file tests one page type or one shared part, and belongs to the ticket that owns it.

### Reading content

- **One interface.** Pages read content only through `@/content`, content-v1's public interface:
  - `concepts`, `topics`, `works`, `references`, `questionnaires`, `library` and `home`;
  - `site.routes()`, `site.trail()`, `site.azIndex()`, `site.searchDocuments()` and `site.graph()`;
  - the pure helpers `hrefFor()`, `displayName()` and `asciiSpellings()`.

  Ticket 03 deletes the foundation's legacy adapter.
- **Server first.** Pages are server components: their HTML is built on the server, so it works before and without JavaScript. Interactive parts are small client islands, components that run in the browser. A client island may import `@/content` for types only, and the existing lint rule enforces it.
- **Real text only.** Content comes only from `@/content`, and the agent writes nothing that passes for content. Labels, buttons, empty states and help text are interface text and live in components.
- **Held back means absent.** Score-band texts and the KarmaYoga answer key aren't in the content module, so no page and no search index can show them. Content-v1's guard test proves it.
- **Provenance shows.** Every content page shows where its text came from and its review status, as the foundation's Concept page does.

### Addresses, metadata and breadcrumbs

- **Trailing slash.** Every address ends with `/` (D02), as the current site's do, so each old address redirects in one hop.
- **Built ahead.** Every route is statically generated, meaning built into HTML once at build time, and unknown slugs return 404. The exception is `/search/`, which renders on each request because it reads the query.
- **`hrefFor()` everywhere.** `hrefFor(target)` makes every internal link. A lint rule rejects internal paths typed by hand into an `href`, so a changed address changes in one place.
- **Metadata (D19):**
  - The title is "{name} · Care4Mind". The homepage keeps "Care4Mind: Indian psychology".
  - The description is the page's summary. Index pages, which have none, use one sentence of interface text.
  - The canonical address is an absolute URL: `site.url` plus the path. A canonical address tells search engines which address is the page's real one. `site.url` is the production origin, https://care4mind.org, which the brief keeps. Tests compare it as text and never request it.
  - Until launch, every page still tells search engines not to list it (noindex), in a header and in a meta tag.
- **Sitemap and robots.** The sitemap is an XML file listing every public page for search engines. It lists every route in the registry that is switched on. robots.txt, the file that tells crawlers what they may fetch, names the sitemap. Until launch it doesn't block crawling: the noindex header and tag keep pages out of search, and a crawler has to fetch a page to see them.
- **Breadcrumbs (D15).** They come from `site.trail(path)`, as design B6 lays out:

  | Page | Trail |
  | --- | --- |
  | Concept | Home › Concepts › {primary topic} › {Concept} |
  | Topic | Home › Concepts › {topic} |
  | Concept map | Home › Concepts › Concept map |
  | Work | Home › Texts › {work} |
  | Questionnaire | Home › Questionnaires › {title} |
  | Questionnaire flow | Home › Questionnaires › {title} › Take it |
  | Library page | Home › Library › {page} |
  | Search, Proposals | Home › {page} |

  The last crumb is the current page and carries `aria-current="page"`. Index pages get the short trail (Home › Concepts). Breadcrumb links turn the page back.
- **Redirects (D17).** One table lists every redirect, and the app's config reads it. Each is a 301, a permanent "moved here" answer that browsers follow and search engines remember, straight to the final address. Ticket 03 adds `/topics/` → `/concepts/`, and ticket 14 adds the current site's addresses.

### Feature flags

- **Three flags,** in one module called `features`: `questionnairePreview`, `conceptMap` and `devanagariFirst`. A feature flag is an on/off setting that switches a feature without changing code.
- **Defaults.** Each flag is on in local runs and Vercel previews and off in Vercel production. Each can be forced either way by its own environment variable. They are read at build time.
- **Off means absent.** A switched-off feature's routes return 404 and drop out of the route registry, the sitemap, the navigation, search and every link. `/proposals/` is on while either proposal flag is on.
- **The preview gate.** `questionnaires.form()` returns a preview Questionnaire's form only while `questionnairePreview` is on. Where the flag is off, the KarmaYoga Scale shows as "Coming soon", with the foundation's disabled Start.

### The shell (ticket 04)

- **Header.** The logo, then Concepts · Texts · Questionnaires · Library · Search, as server-rendered links.
  - On wide screens, a Base UI NavigationMenu, a menu bar whose items open panels:
    - the Concepts panel lists the five topics with their Concept counts, the A–Z and, when switched on, the Concept map;
    - the Library panel lists its five pages.
  - On narrow screens, a Menu button opens a Base UI Drawer, a sheet that slides in from the edge. It loads only when needed, swipes away and closes when a link is followed.
  - Without JavaScript, Menu is a link to the full navigation in the footer.
- **Footer.** The full navigation, the wordmark, tagline, credit and preview notice, and a link to `/proposals/` while it's switched on.
- **Toasts.** One Base UI Toast provider for the whole site.
- **Slots.** A slot is a component whose interface is fixed now and whose inside a later ticket fills. Ticket 04 adds every slot once, so no later ticket edits the header, the layout or the head:

  | Slot | What ticket 04's stub does | Filled by |
  | --- | --- | --- |
  | SearchTrigger | a link to `/search/` | 09: opens the palette, ⌘K |
  | ScriptPreference | renders nothing | 13: the site-wide toggle |
  | HeadScript | renders nothing | 13: the tiny script that applies the stored choice before first paint |
  | ScriptPair | IAST then Devanagari, each with its `lang` tag | 13: order set by the preference, in CSS |
  | ProposalNote | a working "Proposal" label linking to `/proposals/` | 12: wording and style |
  | LinkPreview and its root | a plain link | 05: the preview card |

- **Tokens, once.** Ticket 04 adds every new design token the later tickets need:
  - topic hues;
  - Questionnaire status colours;
  - the Proposal label;
  - surfaces for the toast, Drawer, palette and previews;
  - the scroll shadow;
  - the offset that keeps sticky parts below the header;
  - layering (z-index);
  - durations for morphs and reordering.

  Every new colour pair joins the contrast test: 4.5:1 for text, 3:1 for graphics and focus rings.

### Press only (ticket 16, D21)

- **Replacements built now.** Each Kolam element the foundation built becomes its Press counterpart, as the [decision register](decisions.md#d21-press-replacements) lists:
  - the logo becomes the Press wordmark, Care4Mind with the 4 in a vermilion roundel. It keeps its export name, its accessible name "Care4Mind home" and its 48 px target, and loses its redraw;
  - the homepage hero's frame and drift become the lotus Fleuron, drawn once on the faintly ruled indigo hero, with no parallax;
  - the homepage's section bands become OrnamentRules inking in from the centre, and the Contents knots plain Devanagari numerals;
  - the 404 page's drawing becomes the Fleuron;
  - the References knot becomes a plus that folds into a minus;
  - the script switch runs on a printer's-rule track with a vermilion roundel knob.
- **Replacements built later,** each by the ticket that owns its page: the contents plate (06 and 11), cross-reference rules (05), the progress tally (10) and the Concept map's printed plate (12).
- **Removed.** The kolam generator and component, their tests, the kolam colours and timings, and the "Kolam of your reading path" proposal. No Kolam trace stays in the code, tests or docs.
- **Kept.** The interactions that never used Kolam code: ink spread, page turns, the card-to-title morph, underlines drawing in, press-in, the reading thread and the script swap.

### Site-wide interactions

- **Base UI 1.9 only** (design C1), following its bundled docs and recipes. `filter-dropdown` isn't exported, so don't use it. No new dependency.
- **Command palette.**
  - It opens with ⌘K or Ctrl+K, never a single key (WCAG 2.1.4), or from the header's Search.
  - It is a Dialog holding an Autocomplete set to `open`, `inline`, `autoHighlight="always"` and `keepHighlight`, with `filter={null}` so the site's own search does the matching, plus a ScrollArea.
  - Results are grouped by kind, with a "matched *Sanshay*" chip when another spelling hit.
  - Devanagari input works.
  - `Autocomplete.Status` announces the count.
  - The empty state suggests real search terms.
  - Closing returns focus to whatever opened it.
- **Link previews.**
  - One PreviewCard root per page, with detached triggers (`createHandle` with a typed payload), on Concept links, glossary entries that have a Concept page, in-text citations and verse links.
  - A preview is supplementary: everything in it is also reachable by following the link.
  - It never covers the focused element (WCAG 2.4.11), closes with Escape and can be hovered (WCAG 1.4.13), and shows nothing on touch.
  - Its text comes from data the page already has, so it never waits on the network.
- **Toasts** confirm "Copy verse" and "Copy citation" politely, without moving focus.
- **External links** say so in words, not only with an icon.
- **Print.** A print stylesheet serves the reading pages and the flow's end screen.

### Motion

- **The foundation's language applies everywhere, in Press (D21):**
  - Press ornaments, finished by default: the Fleuron drawing itself once on load, and rules and dotted leaders inking in on scroll or as a row is pointed at;
  - ink spread, opted into with a data attribute and handled by one delegated listener;
  - page turn, underline draw and the reading thread.
- **Page-turn types.** Links get a page-turn type through Next's `Link` and its `transitionTypes`:
  - forward for links that go deeper or onward: cards, related links, "next", search results, A–Z entries, contents-plate rows, map points and Start;
  - back for breadcrumbs and "previous";
  - none for header, footer and menu links, so moving between sections doesn't feel like reading on;
  - browser Back and Forward stay untyped and don't animate.
- **Morphs.** A card's title flies into the page title for Concepts (already built), topics, works and Questionnaires. The view-transition names are `concept-title-<slug>`, `topic-title-<slug>`, `work-title-<slug>` and `questionnaire-title-<slug>`. A view transition is the browser animating from one state of the page to the next.
- **Reordering.** Filters reorder lists with a view transition. Only the first 40 items shown get view-transition names.
- **Questionnaire part changes** use a view transition. There is no celebratory motion anywhere in the flow.
- **Active section.** The table of contents and the A–Z rail highlight the section in view with CSS only. Use `scroll-target-group` and `:target-current` where the browser supports them, otherwise a `timeline-scope` scroll-driven animation (an animation the browser ties to scrolling, with no JavaScript), otherwise no highlight.
- **What may move.** No scroll or resize listeners, no observers (such as IntersectionObserver) and no new uses of Motion. Only transform, opacity, clip-path and SVG stroke offsets animate, plus the foundation's link-underline exception.
- **Reduced motion:** everything is still, and every feature still works.

### Pages

- **Home (ticket 11).**
  - The foundation's hero stays, and its heading stays the LCP element.
  - The search entry's sample spellings open the palette pre-filled; without JavaScript they link to `/search/?q=…`.
  - The Topics contents plate's rows are real links; their numerals and leaders are decoration.
  - One verse per work.
  - The KarmaYoga card and the coming-later shelf.
  - Book spines leading to the Library.
  - A still Concept-map teaser, labelled Proposal, shown while `conceptMap` is on.
  - The homepage areas link to their remapped pages.
- **Concepts A–Z (ticket 06).**
  - The list comes from `site.azIndex()`: Concepts, their terms and glossary entries, de-duplicated and sorted.
  - The letter rail is a Base UI Toolbar of letter links with roving focus: one Tab stop, with arrow keys moving between letters.
  - The filter chips are a ToggleGroup: topics, works, and "Concept pages / glossary". The filter state lives in the address's query string, and the count is announced. Without JavaScript the chips are hidden and the full list shows.
  - Long lists use `content-visibility: auto` with an intrinsic size, which lets the browser skip drawing off-screen entries without anything jumping.
- **Concept (ticket 05).**
  - The foundation's features stay.
  - Every block kind renders: paragraph, list, term (anchored at its own id), table, verse and the shared topic introduction.
  - The sticky table of contents.
  - The Linked knowledge panel (FR-01).
  - Citations link to `#ref-<id>` and open the References accordion. Without JavaScript they still reach the entry.
  - Verse cards with "Copy verse".
  - Tables have a sticky first column and scroll shadows, in CSS.
  - Previous and next within the primary topic.
  - A print stylesheet.
- **Topic (ticket 06).**
  - The contents plate has one row per Concept, with a Devanagari numeral and a dotted leader. Hovering or focusing a card lights its row through CSS `:has()`, a selector that styles an element by what it contains, and the row's leader inks in.
  - Computed facts and the verses the topic's Concepts quote.
  - The values introduction, stored once.
  - No other topic description is written (design B3), and the page adds no JavaScript of its own.
- **Texts (ticket 07).**
  - The manuscript view: passages in the work's order, Devanagari and IAST, attributed translations, "quoted in" chips.
  - A sticky locator rail.
  - Anchors from locators (`#1-30`).
  - No JavaScript of its own, and long lines reflow at 320 px.
- **Questionnaires (ticket 10).** The index, the intro and the flow (below). Status is always written in words, never shown by colour alone (WCAG 1.4.1).
- **Library (ticket 08).**
  - The Library home.
  - References in one style (D09), with filters by type and topic, an author A–Z rail, "cited in" chips, "Copy citation" and anchors that match `hrefFor()`.
  - Typographic spines with annotations for the two book lists, course cards and the Methods tables. No images (D18).
- **Search (ticket 09).** Server-rendered results grouped by kind, showing the matched spelling. A refine-as-you-type island. After a submit, focus moves to the results heading.
- **Proposals (tickets 12 and 13).** See below.

### Search (ticket 09)

- **The engine** is pure TypeScript with no new dependency.
  - `buildIndex(docs)` makes a compact JSON index.
  - `query(index, q)` returns hits shaped as in design A4:

    ```ts
    type SearchHit = {
      id: string
      kind: string
      title: string
      href: string
      matched: { field: string; variant: string }
      parent?: string
      score: number
    }
    ```

- **The corpus** is `site.searchDocuments()`: about 330 documents of these kinds: concept, term, glossary, work, passage, reference, library item, questionnaire, topic and page. The fields are weighted:
  - names (every spelling, Devanagari included) 10;
  - title 8;
  - keywords (the gloss, the topic, work names and locators such as "YS 1.30" or "Yoga Sutra 1.30") 4;
  - people (authors) 4;
  - a text excerpt of at most 300 characters 1.
- **Normalisation:**
  - NFC, lower case, Latin diacritics stripped;
  - a phonetic key: sh, ṣ and ś → s; ch → c; aa → a; ee and ii → i; oo and uu → u; ri → r; w → v; doubled letters collapsed; a final a or h dropped;
  - Devanagari: an anusvāra and a nasal plus virāma before a consonant count as one form (पंच = पञ्च), and zero-width joiners are removed.
- **Matching order:** exact, then prefix, then phonetic, then fuzzy (one edit for words of 5–7 letters, two for 8 or more). Results are grouped by kind.
- **Where it runs:**
  - The index is a static route, built once with the site, and stays at most 45 kB gzipped.
  - The browser loads it lazily, only on intent (⌘K, or hover or focus on the trigger) or when the browser is idle.
  - `/search/?q=` is rendered on the server with the same engine, so it works without JavaScript.
- **The seam (D10).** The palette and the results page reach the engine only through one function that returns `SearchHit`s. A content back end can later answer it from Postgres (with `unaccent` and `pg_trgm`) without changing either page (planning tickets 18 and 23).

### The KarmaYoga flow (ticket 10)

- **Purpose and limitations come first,** on the intro page. Start leads to the flow.
- **Address and history.**
  - The step is reflected in the address as `?step=part-2`, through pushState (changing the address without loading a new page), so browser Back and Forward move between parts.
  - Answers never appear in the address.
  - Reloading with no answers in memory returns to the first part.
- **One part per screen.**
  - Four parts of 12, 6, 9 and 18 statements, in the settings order, each opening with its real instruction text.
  - Each statement is a native fieldset whose legend is the statement, with five native radio buttons styled as pills at least 44 px tall.
  - Options appear in the source's order. Items 34–42 run Strongly Agree → Strongly Disagree, as the source has them, and are flagged for the Psychology expert.
  - Choosing an answer never moves on by itself (WCAG 3.2.2), and there are no single-key shortcuts.
- **Progress.** A decorative tally of 45 short rules, in four groups of 12, 6, 9 and 18, inks in one rule per statement answered. Beside it, the text "Part 2 of 4 · 14 of 45 answered" sits inside a Base UI Progress element with `aria-valuetext`, not a live region.
- **Refusing incomplete parts.**
  - Next on an unfinished part shows an error summary at the top and moves focus to it.
  - Each error links to its statement, which gets `aria-invalid` and a text message.
  - Answers already given stay, and Back keeps everything.
- **Review.** Every statement with its answer, grouped by part. Each has a "Change" link that returns to its part with focus on that statement.
- **End screen.**
  - A placeholder, labelled as one: "The KarmaYoga Scale's scoring rules are with the Psychology expert; your result appears here once they are confirmed."
  - No numbers and no bands.
  - The "not a diagnosis" limitation, the visitor's answers and the source citation.
  - Retake, confirmed in a Base UI AlertDialog; Print; links to related Concepts.
- **State in memory only.**
  - The flow keeps its state in a reducer.
  - A warning appears before leaving the page while answers are given and the end screen isn't reached.
  - Nothing goes to storage, cookies or any server.
  - `scoreQuestionnaire(form, answers)` returns `{ status: 'pending' }` for every complete answer set, and the code holds no key, points or bands.
- **No JavaScript.** The flow needs JavaScript, because answers may go neither into the address nor to a server. Without it, the page says so and links back to the intro.
- **Gate.** The flow's route exists for a live Questionnaire, and for a preview one only while `features.questionnairePreview` is on.
- This builds what planning ticket 12 asked to prototype. The developer reacts to it there.

### Proposals (tickets 12 and 13)

- **Concept map.**
  - The layout is computed at build time, so the browser runs no layout code: a circle with one sector per topic.
  - The edges form a printed plate: hairline curves, typed as shared passage (solid), shared work (dashed) or rarely cited shared Reference (dotted), and inked once on load. Tomar (2024) is left out, because it would connect everything. Each type is told apart without colour, by line style and a legend.
  - The points are HTML links over an SVG layer of edges.
  - Hovering or focusing a point lights its neighbours through `:has()` rules generated at build time.
  - A ToggleGroup filters by connection type and topic.
  - A "Connections" list states every link and its reason. Below about 600 px it shows first, with the map a tap away.
- **Site-wide "Devanagari first".**
  - An inline script of about 200 bytes in the page's head reads the stored choice from localStorage (a small store in the browser) and sets `html[data-script]` before first paint, so nothing flashes or shifts.
  - The foundation's per-page switch becomes the global one, and the header gets a toggle.
  - ScriptPair orders the two scripts with CSS on every page.
  - The DOM order, and with it what a screen reader hears, never changes.
- **`/proposals/`** lists the two built proposals with how to try them, plus audio pronunciation, described but not built. Each entry says what it adds and what it costs.
- **Every proposal surface** carries a ProposalNote.

### Guardrails, site-wide

- No new dependencies.
- No scroll or resize listeners and no observers; scroll effects are CSS.
- No layout shift: animations never change layout, and drawings reserve their box.
- Text paints first, and decoration never delays it. The homepage hero stays the LCP element.
- The search index, the palette and the Drawer load on intent or when idle.
- `content-visibility` on long lists.
- Decoration is hidden from assistive technology; every link has a name.
- Colours exist only as tokens in the global stylesheet.
- Every internal link comes from `hrefFor()`.
- IAST and Devanagari always carry their `lang` tags (`sa-Latn`, `sa-Deva`).
- Every page stays noindex until launch.

### Lane-safe testing and the route registry (tickets 01 and 02)

- **Ports.** Ports come from the environment: `E2E_PORT` (default 3100; lanes use 3110, 3120 and 3130) and `LHCI_PORT` (default 3200; lanes use 3210, 3220 and 3230).
- **No reuse.** A test run starts its own server. It reuses one only with `E2E_REUSE=1`.
- **Knobs:**
  - `E2E_WORKERS`, default 4;
  - `E2E_RETRIES`, default 0 locally and 1 in CI, keeping a trace of each retry;
  - `E2E_SCOPE`: `sample` runs every spec but loops only over the registry's sample routes, one per kind, while `full`, the default, loops over every route;
  - `E2E_ONLY`, which limits a run to the named spec files.
- **Heavy-step lock.** A wrapper script runs Playwright and Lighthouse under `flock` on one shared lock file. `flock` is a Linux command that makes jobs wait their turn, so only one heavy run happens at a time.
- **Two commands.**
  - `pnpm check` runs the content registry check, lint, format check, typecheck, unit tests and the production build.
  - `pnpm check:e2e` runs the browser tests against that build.
- **Hydration marker.** Hydration is the moment React attaches its handlers to the server's HTML. After it, `<html>` gets `data-hydrated`, and a `gotoReady()` test helper waits for it, so no test clicks too early.
- **The route registry.** `site.routes()` returns one entry per public page, as in design A3:

  ```ts
  type RouteEntry = { path: string; kind: string; pattern: string; title: string; sample?: true; proposal?: true }
  ```

  - The end-to-end suite reads its routes from it.
  - A unit test maps every page file's route pattern to a registry entry, and back.
  - The sitemap is built from it.
- **The crawler** starts at `/` and reads the server-rendered HTML. It proves that:
  - every internal link returns 200, without needing a redirect;
  - every `#fragment` exists on its page;
  - every registry route is reached, so there are no orphan pages;
  - the sitemap matches the registry.

  It never requests another site.

### The conventions doc

Ticket 01 writes a front-end conventions doc for agents, next to the content-migration doc. It records:

- the page-turn types and how links get them;
- `data-ink`;
- the Press ornaments and the "finished by default" rule (ticket 16 rewrote this section for D21);
- no scroll listeners, observers or new uses of Motion;
- what may animate;
- colours only as tokens;
- `hrefFor()` for every internal link;
- `@/content` only, with types only in client islands;
- file ownership and asking in Comments;
- the slots and the feature flags;
- the view-transition names;
- the lane commands: ports, the lock and scopes.

Lanes don't edit the doc. They leave notes in their Comments, and ticket 15 folds them in.

## Testing Decisions

- **What a good test is.** It asserts what a person sees and can do: roles, names, states, where a click lands, what is announced, and whether anything moves. It never asserts class names, keyframe names or internal state. Computed styles are checked only where the behaviour is visual, such as a drawing being finished under reduced motion.
- **Seams.** The highest seam is the route registry: one list drives the end-to-end checks at every width, the crawler, the sitemap and the sampling. Below it sit pure modules with unit tests: the search engine, the flow's reducer and scoring stub, the redirect table, the feature flags, and the metadata and breadcrumb helpers. No other new seams.
- **Every route (ticket 02),** at 360, 768 and 1440 px in Chromium:
  - status 200 and exactly one h1;
  - no sideways scroll;
  - axe (an automated accessibility checker) at WCAG 2.2 AA, with the `wcag22aa` tags;
  - noindex in the header and the meta tag;
  - a title, a description and a canonical link.
- **Crawler (ticket 02):** as described above. It checks links in the server-rendered HTML, so it also proves the site works without JavaScript.
- **Reflow, motion and other browsers:**
  - every route reflows at 320 px (WCAG 1.4.10);
  - under reduced motion nothing moves on load, on scroll or after a click;
  - Firefox renders every route with finished drawings, no page errors and no sideways scroll;
  - WebKit runs the same smoke test in CI only, because Playwright's WebKit can't run on Fedora.
- **FR-01 one-click test (ticket 05).** For each Concept (the sample, or all 19 in the full scope), every related Concept, work, application, comparison, Reference and Questionnaire in its view is a link on the page, and each target returns 200.
- **Search (ticket 09).** The test cases from design A4 run as unit tests on the real corpus, and a subset runs end to end through the palette and `/search/`:
  - vikshepa, viksepa, vikṣepa and विक्षेप all rank the Vikṣepa Concept first;
  - "Sanshay" finds the saṃśaya term inside Vikṣepa;
  - panch klesha, pancha klesha and pañca kleśa all find Pañca kleśa;
  - "brahma vihara" and "brahmavihara" both find Brahmavihāra;
  - "YS 1.30" finds the passage;
  - "Tomar" finds the Reference and the Concepts citing it;
  - पंच matches पञ्च;
  - "vikshpa" finds Vikṣepa;
  - an empty query returns nothing.
- **The flow (ticket 10)** covers FR-05 as far as it applies without scoring:
  - purpose and limitations come before Start;
  - an incomplete part is refused, the error summary takes focus and links to each missed statement, and every given answer is still selected;
  - Back, both the button and the browser's, keeps every answer;
  - the review lists all 45 answers, and Change returns focus to the statement;
  - the end screen shows the placeholder, with no number, percentage or band;
  - the whole flow can be completed with the keyboard alone;
  - nothing leaks: after finishing, storage and cookies hold nothing the flow wrote, the address never held an answer, and no request carried answers, used a method other than GET or went to another site;
  - the scoring stub returns "pending" for every complete answer set.

  FR-05's "every possible result" can't be tested until scoring rules exist (planning tickets 26 and 28).
- **Press only (ticket 16).** Tests of Kolam-only behaviour go with the Kolam. Tests that checked Press behaviour through a Kolam element (the hero's text and LCP, the section bands, the Contents numerals, nothing shifting, the logo's name, finished drawings, the References control) are rewritten against its Press replacement, and each new Press behaviour gets a test of its own. No other test is weakened.
- **Redirects (ticket 14).** Every old address answers one 301 to a page that returns 200. Fragment targets exist. A unit test cross-checks the table against the registry and the content's provenance.
- **Flags.** Unit tests cover the defaults and overrides (ticket 04). One CI job builds with every flag off and checks that switched-off features are absent (ticket 15).
- **Speed (ticket 15):**
  - Interaction checks in Chromium at 4× CPU slowdown, which makes the test browser run four times slower, like a cheap phone. They use the Event Timing API, the browser's own measure of how long an interaction took, on opening and typing in the palette, a filter chip, choosing an answer, the script toggle and opening the Drawer. Each must be under 200 ms.
  - Lighthouse, Google's lab test of speed and accessibility, runs on eight representative routes: `/`, `/concepts/`, `/concepts/vikshepa/`, `/topics/mind/`, `/texts/yoga-sutra/`, `/library/references/`, `/questionnaires/karmayoga-scale/take/` and `/concepts/map/`. It runs three times each on the mobile profile, with LCP ≤ 2.5 s, CLS ≤ 0.1, Total Blocking Time ≤ 200 ms and accessibility ≥ 0.95 as errors.
  - Script-size budgets per route.
- **Prior art:**
  - the foundation's end-to-end specs: the per-page checks (status, h1, axe, noindex, title), the Concept and Questionnaire specs, the reduced-motion check, reflow, the Firefox and WebKit smoke run, the axe helper and the interaction-latency check;
  - the unit tests for Sanskrit, content and contrast.

  Extend them; never weaken them.
- **Every ticket's done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes with `E2E_SCOPE=sample` on the lane's port, under the heavy-step lock;
  - the merger runs `E2E_SCOPE=full` after each merge;
  - tickets 01 and 15 also run Lighthouse, and ticket 16 runs it once as advice.

## Out of Scope

- Real scoring: results, bands and interpretation for any Questionnaire. They wait on planning tickets 26 and 28 and the Psychology expert.
- Taking any Questionnaire other than the KarmaYoga Scale preview. The Dosha Survey's 12 items are stored but not shown as a form.
- The content back end and editing (FR-02), and logins, backups and restores (FR-08).
- The production domain, DNS and the launch switch.
- Analytics, and social-sharing preview images (planning ticket 25).
- Building audio pronunciation. It appears on `/proposals/` only.
- Anything in the Kolam style (D21).
- Curated related links and links to modern constructs (planning ticket 14).
- Pages for people, journals or single passages.
- Redirects for media files, `?p=` shortlinks, attachment pages and search URLs, which planning ticket 24 decides.
- New content, rewritten content, and media from the current site (D18).
- Changes to GLOSSARY.md or new ADRs. The decisions here are provisional.
- Anything on care4mind.org: no requests, no changes.

## Further Notes

- **Ticket numbers.** These tickets are 01–16; the design notes call the first fifteen S01–S15, and ticket 16 came later, with D21. "Planning ticket NN" always means a ticket in the [rebuild map](../rebuild/map.md), whose numbers overlap these. Ticket 10, for example, builds what planning ticket 12 asked for.
- **Machine and lanes.** The machine has 8 CPUs and 15 GB of memory, enough for at most three heavy lanes and three light ones. Site lanes merge into `SiddharthMuramkar/frontend`, one at a time.
- **Sign-off.** The Project owner sees the decision register, the proposals and the placeholder flow in the sign-off pack (planning ticket 29). Nothing here is final until then.
- **Captures.** The saved copies of the current site never enter the repo, and no test or script requests care4mind.org.
- **Real text only.** If a page needs words that aren't content, they are interface text, written plainly and kept in components.
