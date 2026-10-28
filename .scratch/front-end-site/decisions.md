# Provisional structure decisions

Status: provisional (2026-10-27; D21 added 2026-10-28)
Used by: [design notes](design.md), [front-end-site spec](spec.md), [content-v1 spec](../content-v1/spec.md)

On 2026-10-27 the developer asked for the whole public front end to be built now, before the planning map's structure tickets are answered, and delegated those structure decisions to the agent. The agent made the twenty decisions below that day, so the build could start.

D21 came a day later: the developer's own design decision of 2026-10-28, recorded here because the pages follow it in the same way. Its replacements are listed [below the table](#d21-press-replacements).

Every decision here is provisional:

- The planning ticket named beside it confirms or changes it later. Until then, the code follows this register.
- The Project owner sees every decision in the sign-off pack ([planning ticket 29](../rebuild/issues/29-client-sign-off-pack.md)). Items for the Research editor are marked for them.
- Changing one should cost little. Structure lives in the content module, the route registry and the redirect table, so pages follow without being rewritten.

The numbers in the last column are planning tickets in [the rebuild map](../rebuild/map.md), not front-end-site tickets. "OQ" numbers are the [brief's open questions](../../docs/project-brief.md).

| ID | Decision | Confirmed or changed by |
| --- | --- | --- |
| D01 | **Site map and labels.** The site has the pages and labels in design B2: Home, Concepts (with the topics and the Concept map), Texts, Questionnaires, Library, Search and Proposals. The main navigation reads Concepts · Texts · Questionnaires · Library · Search, and search also opens with ⌘K (Ctrl+K on Windows and Linux). | [20](../rebuild/issues/20-site-map-and-navigation.md), then the Project owner in [29](../rebuild/issues/29-client-sign-off-pack.md) |
| D02 | **Addresses.** Every address starts with its type and ends with a slash, as in `/concepts/vikshepa/`. The slug is the current site's ASCII spelling of the headword, or else the hyphenated English title, and it never changes once published. | [24](../rebuild/issues/24-urls-and-redirects.md), [15](../rebuild/issues/15-sanskrit-terms.md) |
| D03 | **Topics.** There are five flat topics: self, mind, practice, values and temperament (design B3). Each Concept has exactly one primary topic, which sets its breadcrumb, and may also belong to others. | [13](../rebuild/issues/13-content-types-and-topics.md); the Research editor in [29](../rebuild/issues/29-client-sign-off-pack.md) |
| D04 | **Content types.** The types are Concept, Topic, Work, Passage, Reference, Glossary entry, Resource list, Page, Questionnaire and Homepage. Model or technique is not a type yet, and a Concept keeps its sub-terms (the five kleśas of pañca kleśa, say) as anchored term blocks on its own page rather than as separate Concepts. | [13](../rebuild/issues/13-content-types-and-topics.md) |
| D05 | **Applications and comparisons.** Applications are sections of a Concept page marked with the role "applications", not a type with pages of their own. "Indian vs Western" sections are marked "comparison": they state how two ideas compare and never say they are equivalent. | [13](../rebuild/issues/13-content-types-and-topics.md), [14](../rebuild/issues/14-content-links.md) |
| D06 | **Related Concepts.** Related Concepts are computed from a shared passage, a shared work, a rarely cited shared Reference (one cited by at most 3 Concepts; Tomar (2024) never counts) or the same topic, and each shows its reason as a fact, such as "Both quote Yoga Sūtra 2.30". Curated links, each with an editor's note, come later. | [14](../rebuild/issues/14-content-links.md) |
| D07 | **Names in headings.** Headings lead with the IAST term, capitalised, with the Devanagari beneath it and the English gloss in small capitals. Pages without a Sanskrit headword use their English title, and other spellings sit in the "Also spelled" popover. | [15](../rebuild/issues/15-sanskrit-terms.md) |
| D08 | **Traditional texts.** A traditional text is a Work made of Passages, and each Passage is an anchor on its work's page (`/texts/yoga-sutra/#1-30`) rather than a page of its own. Where pages translate a verse differently, every translation is kept and attributed; commentaries are out. | [16](../rebuild/issues/16-traditional-texts.md) |
| D09 | **References.** References are shared records, de-duplicated across pages. Authors are free text, and each record keeps every way a page wrote it (`asCited`). They use the current site's APA-like style until the Research editor picks a CSL style, and the Library's books are References too. | [17](../rebuild/issues/17-references-people-journals.md) |
| D10 | **Search.** Search works as design A4 describes: an index built with the site and searched in the browser, matching any spelling, with a results page that also works without JavaScript. The engine for the content back end is chosen later and plugs in behind the same interface. | [18](../rebuild/issues/18-what-search-finds.md), [23](../rebuild/issues/23-architecture-review.md) |
| D11 | **Keep, merge or drop.** Each of the current site's 39 pages and posts is kept, merged or dropped as design B4 lists. Every dropped or merged page redirects to its nearest new page. | [19](../rebuild/issues/19-keep-merge-drop.md); the Project owner in [29](../rebuild/issues/29-client-sign-off-pack.md) |
| D12 | **The 16 description pages.** Each page that describes a questionnaire becomes a Concept page plus a "coming later" Questionnaire record. Its score-band texts (High, Moderate and Low, and the like) are held back for the Psychology expert and shown nowhere. | [19](../rebuild/issues/19-keep-merge-drop.md), [28](../rebuild/issues/28-questionnaire-launch-scope.md) |
| D13 | **Library.** The Library holds Textbooks, Inspirational books, Courses and Methods, plus the full list of References. | [17](../rebuild/issues/17-references-people-journals.md), [19](../rebuild/issues/19-keep-merge-drop.md), [20](../rebuild/issues/20-site-map-and-navigation.md) |
| D14 | **Glossary.** The 83 cards on the current `/concepts/` page become glossary entries in the Concepts A–Z, without pages of their own, and keep their DharmaWiki links. Duplicates are merged, and descriptions that belong to another entry are removed and flagged for the Research editor. | [13](../rebuild/issues/13-content-types-and-topics.md), [19](../rebuild/issues/19-keep-merge-drop.md) |
| D15 | **Breadcrumbs.** Breadcrumbs follow design B6, for example Home › Concepts › {primary topic} › {Concept} and Home › Texts › {work}. | [20](../rebuild/issues/20-site-map-and-navigation.md) |
| D16 | **Questionnaire statuses.** A Questionnaire is live, preview, coming soon or coming later. A preview can be taken only where the preview flag is on, which it isn't in production unless someone switches it on. Nothing anyone answers is stored: not on a server, not in the browser and not in the address. | [12](../rebuild/issues/12-questionnaire-flow-prototype.md), [26](../rebuild/issues/26-questionnaire-record-and-tests.md), [28](../rebuild/issues/28-questionnaire-launch-scope.md), OQ8 |
| D17 | **Redirects.** Every old address redirects to its new page in one hop. Author archives are matched by pattern, so no username is ever written down, and the category archives and the feed are mapped too. | [24](../rebuild/issues/24-urls-and-redirects.md) |
| D18 | **Media.** No images or other media files from the current site are carried over. | [19](../rebuild/issues/19-keep-merge-drop.md) |
| D19 | **Page metadata.** Each page's title is "{name} · Care4Mind", its description is its summary, and its canonical address is built from the site's one address setting, `site.url`. | [25](../rebuild/issues/25-findability-and-analytics.md) |
| D20 | **Proposals.** The Concept map and the site-wide "Devanagari first" setting are built behind feature flags and labelled Proposal, so the Project owner can accept or refuse each one. | [21](../rebuild/issues/21-design-direction.md), [29](../rebuild/issues/29-client-sign-off-pack.md) |
| D21 | **Press only.** The developer decided on 2026-10-28 that everything is Press, dropping the earlier blend with the Kolam direction. Kolam's whole look goes: the kolam logo, the line-and-dot drawings, the kolam generator and component, knots, rosettes, threads, the progress kolam, and the kolam colours and timings. The interactions that never used Kolam code stay, restyled in Press's own vocabulary of ink, rules and paper: ink spread, page turns, the card-to-title morph, underlines drawing in, press-in, the reading thread and the script swap. Each Kolam element has a Press replacement ([below](#d21-press-replacements)); [front-end-site ticket 16](issues/16-press-only-remove-kolam.md) builds those that exist today and removes every Kolam trace. | [21](../rebuild/issues/21-design-direction.md), then the Project owner in [29](../rebuild/issues/29-client-sign-off-pack.md) |

## D21: Press replacements

Press is the scholar's edition from the style tiles (`git show d99c935:src/app/directions/press/PressParts.tsx`, `press.module.css` and `src/app/directions/_shared/directions.ts`):

- **Type:** Playfair at fixed weights, Tiro Devanagari Sanskrit, small capitals for labels, menus and buttons, and IAST in italic.
- **Colour:** indigo `#151a3d`, cream `#f3ecdc`, paper `#eadbb6`, turmeric, vermilion `#c8342a` and the ink wash.
- **Ornament:** the folio, the lotus Fleuron, OrnamentRule, a faintly ruled indigo hero, Devanagari numerals, contents with dotted leaders, and verses set like a manuscript.

| Kolam element | Press replacement | Built by |
| --- | --- | --- |
| The logo, in the header and the footer | The Press wordmark "Care4Mind", with the 4 in a vermilion roundel, restored from `git show 427c135:src/components/Wordmark.tsx` and its CSS Module. It keeps the export name `Logo`, the accessible name "Care4Mind home" and its 48 px target; the `redraw` prop goes. | 16 |
| The homepage hero's frame, and its slow drift as the page scrolls | The lotus Fleuron draws itself once on the faintly ruled indigo hero (the `draw` prop of `git show 427c135:src/components/Fleuron.tsx`). No parallax. | 16 |
| The bands between the homepage's sections | OrnamentRule, inking in from the centre as it scrolls into view | 16 |
| The knots round the homepage's Contents numerals | Plain Devanagari numerals | 16 |
| The 404 page's drawing | The Fleuron, as in `git show 427c135:src/app/not-found.tsx` | 16 |
| The References knot on a Concept page | A plus that folds into a minus: two vermilion rules, from `.icon` in `git show 427c135:src/components/ReferenceList.module.css`, keyed on `.root[open]` | 16 |
| The track of the "Devanagari first" switch | A printer's-rule track with a vermilion roundel for its knob, each at least 3:1 against the paper | 16 |
| The topic rosette (topic pages and the homepage) | The Topics contents plate: entries set like a book's contents, with Devanagari numerals and dotted leaders (the five topics on the homepage, a topic's Concepts on its page). `:has()` lights the row being pointed at or focused, and its leader inks in. | 06, 11 |
| The threads of the Concept page's Linked knowledge panel | Cross-reference rules: dotted leaders that ink in on scroll, finished and still in print and under reduced motion | 05 |
| The 9×5 progress drawing of the KarmaYoga flow | A tally of 45 short rules in four groups (12, 6, 9 and 18) that ink in as statements are answered. It is decorative (`aria-hidden`) and sits beside the Progress element. | 10 |
| The Concept map's edges | A printed plate: hairline curves typed by line style (solid for a shared passage, dashed for a shared work, dotted for a rarely cited Reference), inked once on load | 12 |
| The proposal "Kolam of your reading path" | Deleted | 16 (the entry on `/proposals/`), 12 |

Every replacement follows the motion rules that already held: finished by default, animated only when the visitor hasn't asked to reduce motion, its box reserved, and hidden from assistive technology when it is decoration.

## Changing a decision

When a planning ticket answers differently:

1. Update the decision's row here. Keep its ID, and add the date and a link to the ticket's answer.
2. Change the content module, the route registry or the redirect table, whichever holds the decision. The pages follow.
3. Before launch, addresses can still change freely. After launch, a changed address needs a redirect from the old one, because published addresses never change (D02).
