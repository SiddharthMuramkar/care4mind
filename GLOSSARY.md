# Care4Mind

A knowledge and research portal for Indian psychology that connects concepts, traditional texts, research and questionnaires.

## Language

### Content

**Concept**:
A single idea from Indian psychology, such as guṇa or citta, usually named by its Sanskrit name.
_Avoid_: knowledge concept, knowledge page
_In code_: `concept` (`ConceptRecord`, `/concepts/`)

**Term**:
A word explained inside a Concept or a topic's introduction, such as each of Vikṣepa's nine obstacles. It has no page of its own.
_Avoid_: sub-concept
_In code_: `TermBlock` (`kind: 'term'`)

**Sanskrit name**:
A word as the site stores it: in IAST, with its Devanagari and plain-ASCII spellings where they exist.
_Avoid_: Sanskrit term
_In code_: `SanskritName`, held in a field called `term`; the `SanskritTerm` component

**Gloss**:
The short English rendering given beside a Sanskrit name, such as Distraction for Vikṣepa.
_Avoid_: English meaning, English name, translation
_In code_: `english` on Concept, topic and traditional text names; `gloss` on Terms and table rows

**Keyword**:
A plain word for what a Concept itself says, such as doubt for Vikṣepa, so a reader can find it in their own words. It never names a modern construct or a condition.
_Avoid_: tag, synonym
_In code_: `keywords`

**Construct link**:
A stated, explained link between a Concept and a modern psychological construct, such as anxiety, backed by References. It never claims the two are the same.
_Avoid_: equivalent, mapping

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
One verse of a traditional text that the site quotes, named by its locator, such as Yoga Sūtra 1.30, with its Devanagari, transliteration and translations.
_Avoid_: verse, shloka (for the record)
_In code_: `passage` (`PassageRecord`, id `work/locator`); the `Shloka` and `VerseCard` components show one

**Reference**:
One published work (a paper, book or website), recorded with its bibliographic details.
_Avoid_: research record, reference record, source
_In code_: `reference` (`ReferenceRecord`, `/library/references/`)

**Reading list**:
A Library page of recommended books, each a Reference.
_Avoid_: resource list
_In code_: `resource-list` (`ResourceListRecord`), which also holds the course list

**Library page**:
The page at /library that gathers every Reference, the reading lists and the methods the site describes.
_Avoid_: resources page
_In code_: `src/app/library/`, `views/library.ts`

**Questionnaire**:
A set of questions with documented scoring rules that gives the person answering a result.
_Avoid_: assessment, quiz, test
_In code_: `questionnaire` (`QuestionnaireRecord`, `/questionnaires/`)

**Part**:
One section of a Questionnaire's form, with a title, instructions and its items in the source's order.
_Avoid_: section, page
_In code_: `form.parts`

**Item**:
One question of a Questionnaire, word for word as its source gives it. Visitors see it as a statement.
_Avoid_: question (in code), statement (in code)
_In code_: `parts[].items`

**Option**:
One answer a person can choose for an item, from the item's named response set.
_Avoid_: choice, answer
_In code_: a string in `form.responseSets`, named by an item's `responseSet`

**Questionnaire status**:
Whether a Questionnaire can be taken: live, preview (only where its flag is on), coming soon or coming later.
_Avoid_: state, availability
_In code_: `QuestionnaireStatus` (`'live' | 'preview' | 'coming-soon' | 'coming-later'`)

**Provenance**:
Where a record's words came from (carried over from the current site, or drafted new), how they were edited, and whether anyone has reviewed them.
_Avoid_: origin
_In code_: `Provenance`

**Help line**:
The notice on every page that the site is for learning and reflection, not treatment, with numbers to call for help now.
_Avoid_: disclaimer, crisis banner

**Proposal**:
A feature built behind a flag for the Project owner to try in previews before it's approved for launch.
_Avoid_: experiment, beta
_In code_: `Proposal`, `/proposals`

**Current site**:
The WordPress site at care4mind.org, which stays live until launch and is where the carried-over content comes from.
_Avoid_: old site, legacy site

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

**Sign-off pack**:
The decisions, assumptions and drafted words sent to the Project owner for approval before launch.
_Avoid_: approval list

**Later-phases list**:
Ideas kept for after launch, outside this project's scope.
_Avoid_: backlog, wishlist
