# Care4Mind

A knowledge and research portal for Indian psychology that connects concepts, traditional texts, research and questionnaires.

## Language

### Content

**Record**:
One piece of the site's content, of a single kind, such as a Concept or a Passage, that other records can point to.
_Avoid_: entry, item
_In code_: `ContentRecord`, one `ContentKind` each, held in `src/content/data/`

**Concept**:
A single idea from Indian psychology, such as guṇa or citta, usually named by its Sanskrit name.
_Avoid_: knowledge concept, knowledge page
_In code_: `concept` (`ConceptRecord`, `/concepts/`)

**Concept map**:
A proposed page that sets the Concepts round a circle by topic and draws what joins them — a verse, a text or a rarely cited Reference they share — with every connection in words beside it.
_Avoid_: graph
_In code_: `ConceptMap`, from `site.conceptMap()` (`/concepts/map/`)

**Section**:
One headed part of a Concept, a topic's introduction or a Text page, made of blocks. Applications and comparisons are roles a section can carry.
_Avoid_: chapter
_In code_: `Section`, shown as `SectionView`

**Block**:
One unit inside a Section: a paragraph, a list, a Term, a table, a Verse, or a topic's introduction brought in where the page had it.
_Avoid_: element, widget
_In code_: `Block`, shown as `BlockView`

**Term**:
A word explained inside a Concept or a topic's introduction, such as each of Vikṣepa's nine obstacles. It has no page of its own.
_Avoid_: sub-concept
_In code_: `TermBlock` (`kind: 'term'`)

**Sanskrit name**:
A word as the site stores it: in IAST, with its Devanagari and plain-ASCII spellings where they exist.
_Avoid_: Sanskrit term
_In code_: `SanskritName`, held in a field called `term`; the `SanskritName` component

**Gloss**:
The short English rendering given beside a Sanskrit name, such as Distraction for Vikṣepa.
_Avoid_: English meaning, English name, translation
_In code_: `english` on Concept, topic and traditional text names; `gloss` on Terms and table rows

**Keyword**:
A plain word for what a Concept itself says, such as doubt for Vikṣepa, so a reader can find it in their own words. It never names a Modern construct or a condition.
_Avoid_: tag, synonym
_In code_: `keywords`

**Modern construct**:
A concept of modern psychology, such as anxiety, that a Concept may sit alongside. It is never another name for the Concept.
_Avoid_: equivalent, diagnosis
_In code_: nothing yet

**Construct link**:
A stated, explained link between a Concept and a Modern construct, backed by References. It never claims the two are the same.
_Avoid_: equivalent, mapping
_In code_: nothing yet

**Topic**:
One of the five groups Concepts are filed under, such as Mind: states and obstacles. Each Concept has one main topic and may appear under others.
_Avoid_: category, section
_In code_: `topic` (`TopicRecord`, `/topics/`)

**Glossary entry**:
A word carried over from the current site's glossary, with a short definition and a link to DharmaWiki. It has no page on this site.
_Avoid_: DharmaWiki link
_In code_: `glossary` (`GlossaryEntryRecord`)

**Traditional text**:
A classical Indian work, such as the Yoga Sūtra or the Bhagavad Gītā, whose passages the site quotes.
_Avoid_: work, classic text, scripture, source
_In code_: `work` (`WorkRecord`, the `works` namespace, `/texts/`)

**Passage**:
One numbered unit of a traditional text, such as Yoga Sūtra 1.30, held once with its Devanagari, transliteration and translations for every page that quotes it.
_Avoid_: verse, shloka (for the record)
_In code_: `passage` (`PassageRecord`, id `work/locator`)

**Verse**:
A Passage as one page quotes it: the translation that page shows and, where the page gives one, its own reading of it, labelled Meaning.
_Avoid_: shloka
_In code_: `PassageQuote` in a record, shown as `VerseView` by the `Shloka` and `VerseCard` components

**Reference**:
One published work (a paper, book or website), recorded with its bibliographic details.
_Avoid_: research record, reference record, source
_In code_: `reference` (`ReferenceRecord`, `/library/references/`)

**Reading list**:
A Library page of recommendations in groups: books, each a Reference, or courses other institutions run.
_Avoid_: resource list
_In code_: `resource-list` (`ResourceListRecord`), which also holds the course list

**Text page**:
A page of prose in the Library about no single Concept, such as Therapy approaches, made of Sections.
_Avoid_: page (on its own)
_In code_: `page` (`PageRecord`, under `/library/`)

**Library page**:
The page at /library that gathers every Reference, the reading lists and the Text pages.
_Avoid_: resources page
_In code_: `src/app/library/`, `views/library.ts`

**Homepage**:
The site's front page: its promise, the Concepts it features, and the ways into Concepts, Traditional texts and Questionnaires.
_Avoid_: home page, landing page
_In code_: `home` (`HomepageRecord`, `/`)

**Questionnaire**:
A set of questions with documented scoring rules that gives the person answering a result.
_Avoid_: assessment, quiz, test
_In code_: `questionnaire` (`QuestionnaireRecord`, `/questionnaires/`)

**Form**:
A Questionnaire's questions as its source gives them: its Parts in order, every Item word for word, and the Response sets their Options come from.
_Avoid_: questionnaire (for the questions alone)
_In code_: `QuestionnaireForm` (`form`), shown as `QuestionnaireFormView`

**Part**:
One section of a Questionnaire's Form, with a title, instructions and its items in the source's order.
_Avoid_: section, page
_In code_: `form.parts`

**Item**:
One question of a Questionnaire, word for word as its source gives it. Visitors see it as a statement.
_Avoid_: question (in code), statement (in code)
_In code_: `parts[].items`

**Response set**:
One named list of options in a Questionnaire's Form, in the source's order, that Items draw their Options from.
_Avoid_: scale, choices
_In code_: `form.responseSets`, named by an item's `responseSet`

**Option**:
One answer a person can choose for an item, from the item's Response set.
_Avoid_: choice, answer
_In code_: a string in `form.responseSets`, named by an item's `responseSet`

**Questionnaire status**:
Whether a Questionnaire can be taken: live, preview (only in previews), coming soon or coming later.
_Avoid_: state, availability
_In code_: `QuestionnaireStatus` (`'live' | 'preview' | 'coming-soon' | 'coming-later'`)

**Provenance**:
Where a record's words came from (carried over from the Current site, or drafted new), every change made on the way, and the Flags left on them.
_Avoid_: origin
_In code_: `Provenance`

**Flag**:
A question noted alongside a record for a named person — the Research editor, the Psychology expert or the Project owner — to settle, where the words can't be finished without their answer.
_Avoid_: TODO, issue
_In code_: `Flag`, inside a record's `Provenance`

**Review status**:
Whether a person has checked a record's words: carried over but not reviewed, drafted new but not reviewed, or reviewed.
_Avoid_: status (on its own)
_In code_: `ReviewStatus`

**Help line**:
The notice on every page that the site is for learning and reflection, not treatment, with numbers to call for help now.
_Avoid_: disclaimer, crisis banner

**Proposal**:
A feature put to the Project owner for sign-off before launch: built ones are switched on only in previews, behind their own flag, and one is described but not built. Not every flag is a Proposal.
_Avoid_: experiment, beta
_In code_: `Proposal`, listed by `proposalsFor()` for `/proposals`; a built Proposal's routes are marked `proposal`

**Current site**:
The WordPress site at care4mind.org, which stays live until launch and is where the carried-over content comes from.
_Avoid_: old site, legacy site

**Questionnaire app**:
A separate app the Current site links to, where its Questionnaires could be taken. It is no part of the Current site itself.
_Avoid_: current site (for the app)

### People

**Client**:
Care4Mind, the organisation the site is built for and handed over to.
_Avoid_: customer, owner

**Project owner**:
The person at the client who approves scope, priorities and launch.
_Avoid_: client (for a person), stakeholder

**Client contact**:
The person at the client the developer writes to. They act as Project owner until one is named.
_Avoid_: client (for a person)

**Content editor**:
Someone who adds and updates the site's content after launch.
_Avoid_: editor (on its own), administrator

**Research editor**:
The subject-matter person who checks the accuracy of References and of the site's subject-matter words, such as glosses, Devanagari and keywords.
_Avoid_: editor (on its own), subject expert

**Psychology expert**:
The subject-matter person responsible for each Questionnaire's scoring, interpretation and stated limitations, and for the help line's wording.
_Avoid_: assessment expert, assessment owner

### Process

**Launch**:
The new site taking over care4mind.org from the Current site.
_Avoid_: go-live, release

**Sign-off pack**:
The decisions, assumptions and drafted words sent to the Project owner for approval before launch.
_Avoid_: approval list

**Later-phases list**:
Ideas kept for after launch, outside this project's scope.
_Avoid_: backlog, wishlist
