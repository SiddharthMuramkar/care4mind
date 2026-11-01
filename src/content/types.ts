/**
 * The view types: what pages receive from the content module's public interface, `@/content`.
 *
 * A view is plain, serialisable data shaped for one page, with every id already resolved and
 * every link already a path. It holds no `undefined`, Map, Date or function, so it survives a
 * JSON round trip unchanged and a server component can hand it to a client island as it is.
 */
import type {
  ContentKind,
  HomepageHero,
  Inline,
  Provenance,
  QuestionnaireStatus,
  ReferenceType,
  ReviewStatus,
  SanskritName,
  Slug,
} from './schema/index'

/** The record schema's plain types that views use, for pages to name. */
export type { HomepageHero, Inline, QuestionnaireStatus, ReferenceType, SanskritName, Slug }

// Links and names

/** The pages of the site map (design B2) that no record holds. */
export type FixedPage =
  | 'home'
  | 'concepts'
  | 'concept-map'
  | 'texts'
  | 'questionnaires'
  | 'library'
  | 'references'
  | 'search'
  | 'proposals'
  | 'start'

/**
 * What `hrefFor` turns into a path: a record (by its kind and id, with an anchor inside it where
 * its page has one) or a fixed page. A Questionnaire's path depends on its status, and `flow`
 * asks for the page that takes it.
 */
export type HrefTarget =
  | { kind: 'concept' | 'topic' | 'resource-list' | 'page'; id: Slug; anchor?: Slug }
  | { kind: 'work'; id: Slug }
  | { kind: 'passage'; id: string }
  | { kind: 'questionnaire'; id: Slug; status: QuestionnaireStatus; flow?: boolean }
  | { kind: 'glossary'; id: Slug }
  | { kind: 'reference'; id: string }
  | { page: FixedPage }

/** The language tag of a transliterated name or verse: Sanskrit, or Pali for the Dhammapada. */
export type LatinScript = 'sa-Latn' | 'pi-Latn'

/** A link to a Concept's page, named by its display name; `lang` is set when that name is IAST. */
export interface ConceptRef {
  slug: Slug
  name: string
  lang?: 'sa-Latn'
  href: string
}

/** A link to a topic's page, named by its English name. */
export interface TopicRef {
  slug: Slug
  name: string
  href: string
}

/** A link to a work's page, named by its title in IAST. */
export interface WorkRef {
  slug: Slug
  title: string
  lang: LatinScript
  href: string
}

/** A link to a record that cites a Reference or quotes a passage, named as its page names it. */
export interface RecordRef {
  kind: 'concept' | 'topic' | 'questionnaire' | 'resource-list' | 'page'
  id: string
  title: string
  lang?: 'sa-Latn'
  href: string
}

/** Where a carried-over record's text came from, the old address included, and every change made. */
export type ProvenanceView = Provenance

/** Whether anyone has checked a record's text: carried over, drafted or reviewed. */
export type ContentReviewStatus = ReviewStatus

/** What every view of a carried-over record carries. */
export interface CarriedOver {
  provenance: ProvenanceView
  reviewStatus: ContentReviewStatus
}

// Text: sections and their blocks

/**
 * A verse as a record quotes it: the foundation's `Shloka` (source, verse, Devanagari,
 * transliteration, translation and meaning), plus the passage it is, a chip for its work and a
 * link to its anchor on the work's page. `translation` is empty where the quote names none.
 */
export interface VerseView {
  /** Work and locator: "Yoga Sūtra 1.30". */
  source: string
  /** The locator: "1.30". */
  verse: string
  devanagari: readonly string[]
  transliteration: readonly string[]
  transliterationScheme: 'iast' | 'informal'
  translation: string
  /** Where the translation came from, where the page names it. */
  translationSource?: string
  /** The page's own reading of the verse, kept apart from the translation. */
  meaning?: string
  /** The passage's id: `yoga-sutra/1.30`. */
  passage: string
  work: WorkRef
  /** The verse's anchor on its work's page: `/texts/yoga-sutra/#1-30`. */
  href: string
}

/** A table row's heading cell: plain text, or a Sanskrit term with its display name and gloss. */
export type TableRowView = {
  head?: Inline | { term: SanskritName; name: string; gloss?: string }
  cells: readonly Inline[]
}

/** A block of a section, with every id resolved. */
export type BlockView =
  | { kind: 'paragraph'; text: Inline }
  | { kind: 'list'; style: 'bullet' | 'number'; items: readonly Inline[] }
  | {
      /** A sub-term (saṃśaya inside vikṣepa), anchored at its own id. */
      kind: 'term'
      id: Slug
      /** Its anchor on the page. */
      href: string
      /** The capitalised IAST term. */
      name: string
      term: SanskritName
      /** Its plain-keyboard spellings (asciiSpellings). */
      spellings: readonly string[]
      gloss?: string
      blocks: readonly BlockView[]
    }
  | {
      kind: 'table'
      id: Slug
      caption: Inline
      columns: readonly string[]
      rows: readonly TableRowView[]
    }
  | { kind: 'verse'; verse: VerseView }
  | {
      /** Shared text stored once on a topic (the yama–niyama introduction), resolved in place. */
      kind: 'topic-intro'
      topic: TopicRef
      sections: readonly SectionView[]
    }

export interface SectionView {
  id: Slug
  heading: Inline
  /** Applications and "Indian vs Western" comparisons are roles of a section (D05). */
  role?: 'applications' | 'comparison'
  /** Its anchor on the page. */
  href: string
  blocks: readonly BlockView[]
}

/** One line of a page's table of contents: a section, and the terms inside it. */
export interface TocEntry {
  id: Slug
  heading: Inline
  role?: 'applications' | 'comparison'
  href: string
  terms: readonly { id: Slug; name: string; href: string }[]
}

// References

/** A Reference with every field it records, its anchor, and every record that cites it. */
export interface ReferenceView extends CarriedOver {
  id: string
  type: ReferenceType
  authors?: string
  year?: string
  title: string
  container?: string
  publisher?: string
  volume?: string
  issue?: string
  pages?: string
  edition?: string
  doi?: string
  url?: string
  /** Why there is no DOI or stable URL (FR-03). */
  noStableLink?: string
  /** Each distinct way a source page wrote it. */
  asCited: readonly string[]
  /** In brief, as an in-text citation names it: "Jain & Diwakar (2019)". */
  label: string
  /** Its anchor, `ref-<id>`, on the References page and on every page that lists it. */
  anchor: string
  /** Its entry on the References page. */
  href: string
  citedIn: readonly RecordRef[]
}

/** A Reference in a page's own list, numbered in the page's order. */
export interface NumberedReference extends ReferenceView {
  number: number
}

// Concepts

/** A Concept in brief, for lists and cards. */
export interface ConceptCard extends ConceptRef {
  term?: SanskritName
  /** The English gloss the page gives, or the English title of a page with no Sanskrit headword. */
  english?: string
  summary: Inline
  /** Its primary topic (D03), which sets its breadcrumb. */
  topic: TopicRef
}

/** What relates two Concepts (D06): a shared passage, work, rarely cited Reference or topic. */
export type RelationKind = 'passage' | 'work' | 'reference' | 'topic'

/** The kinds of relation, strongest first: how related Concepts and the map's lines are ranked. */
export const RELATION_STRENGTH: readonly RelationKind[] = ['passage', 'work', 'reference', 'topic']

/** A related Concept, with each fact that relates it, strongest first. */
export interface RelatedConcept extends ConceptCard {
  reasons: readonly { kind: RelationKind; text: string }[]
}

/** A work a Concept quotes, with the passages it quotes from it, in the work's order. */
export interface LinkedWork extends WorkRef {
  passages: readonly { id: string; locator: string; label: string; href: string }[]
}

/** A Concept, as a page shows it. */
export interface ConceptView extends ConceptCard, CarriedOver {
  /** Its term's plain-keyboard spellings (asciiSpellings); none without a term. */
  spellings: readonly string[]
  /** The topics it is also in. */
  secondaryTopics: readonly TopicRef[]
  /** The verses at the top of the page, in source order. */
  verses: readonly VerseView[]
  sections: readonly SectionView[]
  toc: readonly TocEntry[]
  /** The page's reference list, numbered in its order. */
  references: readonly NumberedReference[]
  /** Each in-text citation, as written inside its parentheses ("Tomar, 2024"), to its Reference id. */
  citations: Readonly<Record<string, string>>
  /** What the page links to (FR-01). */
  linked: {
    /**
     * Related Concepts (D06): those sharing a passage, then a work, then a rarely cited
     * Reference, then only a topic, each group by name.
     */
    related: readonly RelatedConcept[]
    /** The works it quotes, in the order the page first quotes each. */
    works: readonly LinkedWork[]
    /** Its own Questionnaire, then any other that lists it. */
    questionnaires: readonly QuestionnaireCard[]
    /** Its applications and comparison sections (D05). */
    sections: readonly {
      id: Slug
      heading: Inline
      role: 'applications' | 'comparison'
      href: string
    }[]
  }
  /** The Concepts before and after it in its primary topic, alphabetically for now. */
  previous?: ConceptCard
  next?: ConceptCard
  /** Links that leave the site, such as its own DharmaWiki article. */
  external: readonly { label: string; url: string }[]
}

// Topics

/** A topic in brief: its name, its place among the topics and how many Concepts it has. */
export interface TopicCard extends TopicRef {
  term?: SanskritName
  order: number
  /** How many Concepts have it as their primary topic. */
  conceptCount: number
}

/** A topic's shared introduction (the values topic's yama–niyama text), stored once. */
export interface TopicIntroView extends CarriedOver {
  sections: readonly SectionView[]
  toc: readonly TocEntry[]
  references: readonly NumberedReference[]
  citations: Readonly<Record<string, string>>
}

/** A topic's page. Topics get no description of their own beyond an introduction (design B3). */
export interface TopicView extends TopicCard {
  /** The Concepts whose primary topic it is, by name. */
  concepts: readonly ConceptCard[]
  /** The Concepts that are also in it, by name. */
  secondaryConcepts: readonly ConceptCard[]
  /** The works its Concepts quote, each with the verses quoted from it, in the work's order. */
  works: readonly QuotedWork[]
  intro?: TopicIntroView
}

/** A work, with the verses a page's Concepts quote from it. */
export interface QuotedWork extends WorkRef {
  verses: readonly PassageView[]
}

// Traditional texts

/** A translation of a passage, attributed to its source and to the records whose quote shows it. */
export interface TranslationView {
  id: string
  text: Inline
  /** Where the translation came from, where a page names it. */
  source?: string
  quotedIn: readonly RecordRef[]
}

/** A passage as its work's page shows it, with every record that quotes it. */
export interface PassageView extends CarriedOver {
  /** `yoga-sutra/1.30`. */
  id: string
  work: WorkRef
  locator: string
  /** "Yoga Sūtra 1.30". */
  label: string
  /** Its anchor on the work's page: the locator with dots as hyphens, `1-30`. */
  anchor: string
  href: string
  /** Lines as a page gives them; empty, and flagged, when no page gives any. */
  devanagari: readonly string[]
  transliteration?: { lines: readonly string[]; scheme: 'iast' | 'informal' }
  translations: readonly TranslationView[]
  quotedIn: readonly RecordRef[]
}

/** A work in brief: its title in each form, and how many of its verses the site quotes. */
export interface WorkCard extends WorkRef {
  /** Its title as a Sanskrit (or Pali) name: IAST, Devanagari where a page gives it, ASCII. */
  term: SanskritName
  english?: string
  /** Who the pages say composed it, as they say it. */
  attribution?: string
  /** Sanskrit, or Pali for the Dhammapada. */
  language: 'sa' | 'pi'
  /** How many of its verses the site quotes: one passage each. */
  passageCount: number
}

/** A work's page: every verse the site quotes from it, in the work's order (D08). */
export interface WorkView extends WorkCard, CarriedOver {
  /** What the pages call one numbered unit: "Sutra", "Verse". */
  locatorLabel: string
  editions?: readonly string[]
  passages: readonly PassageView[]
}

// Questionnaires

/** A Questionnaire in brief, for lists and cards. */
export interface QuestionnaireCard {
  slug: Slug
  title: string
  /** The page title as the current site published it. */
  sourceTitle: string
  /** As its record has it: live, preview, coming soon or coming later. */
  status: QuestionnaireStatus
  /** The status a visitor sees in this build: a preview is coming soon while its flag is off. */
  shownStatus: QuestionnaireStatus
  /** Its flow, present only where it can be taken in this build. */
  takeHref?: string
  summary?: Inline
  /** Its anchor on the Questionnaires page, which lists the coming-later ones. */
  anchor: string
  /** Its own page, or its anchor on the Questionnaires page when it is coming later. */
  href: string
  concepts: readonly ConceptRef[]
  /** The primary topics of its Concepts, for grouping. */
  topics: readonly TopicRef[]
}

/**
 * A Questionnaire's page (FR-05): what it is for, its format, its limitations with their status,
 * and its sources. Nothing held back and no scoring reach a view.
 */
export interface QuestionnaireView extends QuestionnaireCard, CarriedOver {
  /** Its Concepts as cards, by name. */
  concepts: readonly ConceptCard[]
  purpose?: readonly Inline[]
  format?: readonly Inline[]
  limitations?: {
    items: readonly Inline[]
    status: 'draft-pending-psychology-expert' | 'approved'
  }
  /** The published source of its items. */
  source?: ReferenceView
  /** A published source its items may come from (research ticket 11). */
  candidateSource?: ReferenceView
}

/**
 * A Questionnaire's form, for the flow: its parts in order, each with its instructions, and each
 * item verbatim with its options in the order the source lists them. Nothing about scoring.
 */
export interface QuestionnaireFormView {
  slug: Slug
  title: string
  parts: readonly {
    id: Slug
    title: string
    instructions: Inline
    items: readonly { id: string; text: string; options: readonly string[] }[]
  }[]
}

// The Library and the homepage

/** A Library page in brief: a reading list with how many items it holds, or a page of text. */
export type LibraryCard =
  | { kind: 'resource-list'; slug: Slug; title: string; href: string; itemCount: number }
  | { kind: 'page'; slug: Slug; title: string; href: string; summary: Inline }

/** An item on a reading list: a book, resolved to its Reference, or a course. */
export type ResourceItemView =
  | { type: 'reference'; reference: ReferenceView; annotation?: Inline }
  | {
      type: 'course'
      /** The institution that offers it. */
      provider: string
      /** Where the institution is, where the page says. */
      city?: string
      name: string
      description?: Inline
      url?: string
    }

/** A reading list in the Library, grouped under the pages' own headings. */
export interface ResourceListView extends CarriedOver {
  kind: 'resource-list'
  slug: Slug
  title: string
  href: string
  groups: readonly {
    id: Slug
    heading: string
    /** The group's anchor on the list's page. */
    href: string
    items: readonly ResourceItemView[]
  }[]
}

/** A page of text in the Library, such as Therapy approaches. */
export interface PageView extends CarriedOver {
  kind: 'page'
  slug: Slug
  title: string
  summary: Inline
  href: string
  sections: readonly SectionView[]
  toc: readonly TocEntry[]
}

/** The homepage: its own text, each area linking to its new page where it has one. */
export interface HomepageView extends CarriedOver {
  tagline: string
  shloka: { devanagari: string; iast: string; translation: string }
  hero: HomepageHero
  sectionIntros: { concepts: string; questionnaires: string }
  intro: Inline
  areas: readonly { title: string; text: Inline; href?: string }[]
  closing: Inline
  helpLine: Inline
}

// Site derivations (`site`)

/** What kind of page a route is: one per page type in design B2. */
export type RouteKind =
  | 'home'
  | 'concepts'
  | 'concept'
  | 'concept-map'
  | 'topic'
  | 'texts'
  | 'work'
  | 'questionnaires'
  | 'questionnaire'
  | 'questionnaire-flow'
  | 'library'
  | 'references'
  | 'resource-list'
  | 'page'
  | 'search'
  | 'proposals'
  | 'start'

/** One public page in the route registry. */
export interface RouteEntry {
  /** Its address, with its trailing slash. */
  path: string
  kind: RouteKind
  /** Its page file's route pattern: `/concepts/[slug]/`. */
  pattern: string
  /** The page's name, as the last crumb of its trail shows it. */
  title: string
  /** The record the page shows, on a route whose pattern has `[slug]`: its id is the slug. */
  record?: { kind: ContentKind; id: Slug }
  /** One representative route per kind, for sampled end-to-end runs. */
  sample?: true
  /** A Proposal awaiting the Project owner's decision (D20): the Concept map and `/proposals/`. */
  proposal?: true
}

/** What a public page says about itself, for its title and its description. */
export interface PageDescription {
  /** Its address in the route registry, with its trailing slash: its canonical path. */
  path: string
  kind: RouteKind
  /** The name the page goes by in its title. */
  name: string
  /**
   * Its summary, or a sentence about what its page holds. Absent for a page that holds no
   * content of its own (the homepage and the fixed lists), whose sentence the site supplies.
   */
  description?: string
}

/** One step of a page's breadcrumb trail (D15). The last is the page itself. */
export interface Crumb {
  label: string
  href: string
  /** Set when the label is a transliteration (a Concept's IAST name, a work's title). */
  lang?: LatinScript
}

/** One entry of the Concepts A–Z (D14): a Concept, a term inside one, or a glossary entry. */
export interface AzEntry {
  kind: 'concept' | 'term' | 'glossary'
  /** The leading name: the capitalised IAST, else the English title or the glossary's name. */
  name: string
  /** Set when the leading name is IAST. */
  lang?: 'sa-Latn'
  /** The other names it goes by: plain-keyboard spellings, and a merged glossary entry's names. */
  spellings: readonly string[]
  devanagari?: string
  /** The English gloss a Concept or term page gives. */
  gloss?: string
  /** A glossary entry's own description. */
  definition?: Inline
  /** Its page or anchor, or a glossary entry's article; none for an entry with neither. */
  href?: string
  /** Whether the link leaves the site (a DharmaWiki article). */
  external: boolean
  /** The glossary anchors the entry carries on the A–Z page (`/concepts/#<slug>`). */
  anchors: readonly string[]
  /** A term's Concept. */
  concept?: ConceptRef
  /** For the filter chips: the topics and the works of its Concept. */
  topics: readonly Slug[]
  works: readonly Slug[]
}

/** One letter of the A–Z, with its entries by name (diacritics ignored). */
export interface AzLetter {
  letter: string
  entries: readonly AzEntry[]
}

/** What a search document is (design A4). */
export type SearchKind =
  | 'concept'
  | 'term'
  | 'glossary'
  | 'work'
  | 'passage'
  | 'reference'
  | 'library-item'
  | 'questionnaire'
  | 'topic'
  | 'page'

/**
 * One thing the site's search can find (design A4). The search engine weighs its fields: names
 * 10, title 8, keywords 4, people 4, excerpt 1.
 */
export interface SearchDocument {
  /** Unique across kinds: `concept:vikshepa`, `term:vikshepa#samsaya`. */
  id: string
  kind: SearchKind
  title: string
  /** Set when the title is a transliteration. */
  lang?: LatinScript
  href: string
  /** What it sits in: a term's Concept, a passage's work, a library item's list. */
  parent?: string
  /** Every spelling of its name, Devanagari included. */
  names: readonly string[]
  /** Its gloss, topics, work names and locators ("YS 1.30", "Yoga Sutra 1.30"). */
  keywords: readonly string[]
  /** Authors: a Reference's own, or for a Concept those of every Reference it cites. */
  people: readonly string[]
  /** At most 300 characters of its real text. */
  excerpt: string
}

/** A Concept on the Concept map. */
export interface ConceptGraphNode extends ConceptRef {
  /** Its primary topic: the map's sector it sits in. */
  topic: Slug
  /** Every topic it is in, the primary first. */
  topics: readonly Slug[]
}

/** A connection on the Concept map, with the fact behind it (D06). */
export interface ConceptGraphEdge {
  source: Slug
  target: Slug
  /** A shared passage, a shared work, or a rarely cited shared Reference. */
  kind: 'passage' | 'work' | 'reference'
  /** The shared passage, work or Reference, by its id. */
  via: string
  /** "Both quote Yoga Sūtra 2.30". */
  reason: string
}

/** The Concept map's data (D20): its nodes by topic and name, and its edges. */
export interface ConceptGraph {
  nodes: readonly ConceptGraphNode[]
  edges: readonly ConceptGraphEdge[]
}
