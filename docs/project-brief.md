# Care4Mind.org rebuild: working brief

> This brief is the source of truth for planning and building the project. Where it differs from the client's original ([the client's brief](https://github.com/SiddharthMuramkar/care4mind/blob/505105015beb09f12a7532c9ed33377e131061cf/docs/client-brief.md)), this one wins. The biggest difference is the decision to rebuild ([ADR-0001](adr/0001-rebuild-instead-of-enhancing.md)). Facts about the current site, with sources, are in [the current site](https://github.com/SiddharthMuramkar/care4mind/blob/505105015beb09f12a7532c9ed33377e131061cf/docs/current-site.md). Concept, Reference, Questionnaire, Content editor, Research editor and Psychology expert are defined in [GLOSSARY.md](../GLOSSARY.md).

## Goal

Rebuild Care4Mind.org from scratch, with a new design, as a portal for Indian psychology. Concepts, traditional texts, References and Questionnaires link to one another instead of sitting on standalone pages. The content worth keeping comes over from the current site. The design, front-end code and structure are all new.

The design should look made by a dedicated team of human designers: custom, rich in colour, and fun to explore, with motion and feedback on scroll and click. It must still meet NFR-01 and NFR-02.

## Audiences

- **General public:** explore Concepts and their practical applications in plain language.
- **Students and educators:** structured explanations and References for learning and teaching.
- **Researchers:** find References, traditional texts and authors.
- **Content editors:** add and update content without a developer.

## Constraints

- **One developer, building with coding agents.** Coding agents design, write and test all the code, working from current library docs (through context7). The developer directs them and reviews the architecture, specs and results, but writes no code by hand. So the stack is chosen for what agents build well, not for the languages the developer knows (Docker and SQL).
- **No access** to the current site's code, database or admin login, or to the code of its separate questionnaire app. The content worth keeping is carried over by scraping the public site. Where Questionnaire questions and scoring rules come from is open (question 4).
- **The live site is the record of what exists.** The client brief is what the client first asked for; the rebuild's scope is this brief's Requirements and Out of scope. The live site is in worse shape than the client brief assumes: most questionnaires don't work, and several pages are empty or placeholders.
- **The current site stays live and untouched until launch.** Its upkeep stays with the client.
- **Subject-matter calls aren't the developer's.** Questionnaire scoring and interpretation belong to the Psychology expert; source accuracy belongs to the Research editor.
- **No estimates, schedule or fixed launch date yet.** Estimate once the [planning map](https://github.com/SiddharthMuramkar/care4mind/issues/6) is done.

## Roles

| Role | Who | Owns |
| --- | --- | --- |
| Project owner | _TBD (client)_ | priorities, approvals, launch sign-off |
| Developer | Siddharth Muramkar | design, build, testing, deployment and documentation, all done by coding agents the developer directs and reviews |
| Psychology expert | _TBD (client)_ | Questionnaire scoring, interpretation and limitations |
| Research editor | _TBD (client)_ | source checking, References, taxonomy review |

If no Psychology expert is named by the time an in-scope Questionnaire is built, it is rebuilt to match its documented current scoring exactly and covered by tests. Its stated limitations then include that the scoring is carried over unchanged and hasn't been reviewed for validity, and the site makes no claim of validity.

## What carries over

- **Kept:** the content worth keeping (which pages to keep, merge or drop is open question 5), the questions and scoring of each in-scope Questionnaire (which are in scope is open question 3), the domain care4mind.org, and every URL the current site serves (redirected where it changes; see FR-07).
- **Replaced:** the design, all front-end code, Elementor, Astra and WordPress itself ([ADR-0002](adr/0002-vercel-and-neon.md)).

## Requirements

Targets marked † are standard defaults, chosen where the client brief set no measurable target. The client confirms them (open question 11).

| ID | Requirement | Done when |
| --- | --- | --- |
| FR-01 | Linked knowledge | From any Concept page, a user reaches its related Concepts, traditional texts, applications, References and Questionnaires in one click. Every topic has a landing page listing its Concepts, and every page shows breadcrumbs. |
| FR-02 | Editing | A Content editor can create and update the supported content types without a developer; which types are supported is a planning decision. |
| FR-03 | References | Every Reference has a title and, where one exists, a DOI or stable URL. A Reference to a paper or book also has authors, publication and year. All References use one citation style, chosen during planning. |
| FR-04 | Search | Site search finds content by title, Concept name in any spelling (NFR-03), author, traditional text and keyword. |
| FR-05 | Questionnaires | Every in-scope Questionnaire shows its purpose and limitations before it starts, refuses incomplete answers, and ends on a results page giving the result its documented scoring rules produce. Automated tests cover every possible result and, where results come from score ranges, the lowest and highest score in each range. |
| FR-06 | Screen sizes | Navigation, content, search and Questionnaires work at every width from 360 to 1440 px.† |
| FR-07 | URLs | After launch, every URL the current site served returns 200, or a 301 to a URL that returns 200. None returns 404.† The URLs to test include at least the 43 in its sitemap (see [the current site](https://github.com/SiddharthMuramkar/care4mind/blob/505105015beb09f12a7532c9ed33377e131061cf/docs/current-site.md)), its 71 media files and its feed. |
| FR-08 | Security and recovery | Editing requires a login. Backups run automatically, and a restore has been tested and written up. |
| FR-09 | Handover | Code, configuration, content model and deployment steps are documented in the repo, plus a short guide for Content editors. The repo and every account the site runs on are handed over to the client. |
| NFR-01 | Accessibility | WCAG 2.2 AA.† |
| NFR-02 | Speed | Core Web Vitals "good" on mobile: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.† |
| NFR-03 | Sanskrit terms | Each Concept's Sanskrit term, where it has one, is stored in IAST (e.g. vikṣepa), in Devanagari where available (विक्षेप), and in every plain-ASCII spelling it goes by: at least IAST without diacritics (viksepa) and any spelling the current site uses (vikshepa). Search matches any stored form.† |
| NFR-04 | Findability | Every page has a title, description and canonical URL. An XML sitemap lists every public page. No internal link is broken. Analytics is set up (tool: open question 7). |

## Content model (starting point)

Taken from the client brief. The relationships and final fields are a planning decision.

| Type | Main fields |
| --- | --- |
| Concept | title, summary, full text, topic, Sanskrit term and variants, related Concepts, contributor, review status |
| Traditional text | title, section or passage, original-language text, translation, edition, translator, citation |
| Reference | title, authors, publication, year, abstract, keywords, DOI or stable URL, evidence type |
| Model or technique | framework, method, applications |
| Questionnaire | purpose, version, questions, scoring rules, interpretation, validation status, limitations |

- A Concept is never automatically treated as equivalent to a modern psychological construct. Each such link is stated and explained.
- The client also wants related Indian psychology websites, textbooks, authors and journals included (client brief P2). Websites and textbooks are References; how authors and journals are recorded is part of open question 10.

## Priorities

The client marked two things as critical: knowing what exists (now [the current site](https://github.com/SiddharthMuramkar/care4mind/blob/505105015beb09f12a7532c9ed33377e131061cf/docs/current-site.md)) and the knowledge architecture (content model and navigation). Questionnaires are a parallel track, so they never hold up the rest of the site.

## Out of scope

The client brief's exclusions, minus the rebuild:

- clinical diagnosis or treatment services
- new psychometric instruments or validation studies
- user accounts, personalised dashboards or saved Questionnaire histories, beyond what the requirements above need (such as the editing login in FR-08)
- journal publishing or peer review
- AI-generated psychological advice, or automated interpretation of anyone's mental-health data beyond the result a Questionnaire's documented scoring rules give (FR-05)
- rewriting, translating or scholarly checking of all existing content
- a mobile app

New ideas go on a later-phases list, not into this project.

## Open questions

This brief decides none of these. "(Client)" means the Project owner answers it. They are worked in the [planning map](https://github.com/SiddharthMuramkar/care4mind/issues/6). Once one is decided, it gets a one-line pointer here to where its answer lives.

1. **Platform and hosting.** What the site is built with and where it runs.
   - Hosting and data: decided in [ADR-0002](adr/0002-vercel-and-neon.md).
   - Framework: decided in [ADR-0003](adr/0003-nextjs-for-the-front-end.md) (Next.js).
   - Content back end and search: open, worked in the map's [Architecture review](https://github.com/SiddharthMuramkar/care4mind/issues/19), with what search finds in [What search finds](https://github.com/SiddharthMuramkar/care4mind/issues/14).
2. **Who runs the site after launch? (Client)** Who edits content, who keeps the site patched, and who pays for the hosting. The answer shapes what Content editors need to meet FR-02.
3. **Which Questionnaires are in scope?** Only two have questions on the site today: KarmaYoga Scale (45 questions) and Dosha Survey (12). Sixteen more pages describe a questionnaire and its High/Moderate/Low results but contain no questions: Triguna, the eight "Profiling" pages and seven others (listed in [the current site](https://github.com/SiddharthMuramkar/care4mind/blob/505105015beb09f12a7532c9ed33377e131061cf/docs/current-site.md)). The homepage also links to a separate questionnaire app, which refused connections on 2026-10-26; whether these questionnaires lived there is unknown.
4. **Where do each Questionnaire's questions and scoring rules come from?** For now: scrape what's public, then revisit. The public pages show only part of the scoring: the KarmaYoga Scale page flags one answer per question as correct and shows a percentage result, the sixteen pages above give no cut-offs, and nothing public shows how the Dosha Survey scores. Other possible sources are the client, whoever built the questionnaire app, and web archives. Without an in-scope Questionnaire's questions and scoring rules, it can't be rebuilt faithfully.
5. **Which pages to keep, merge or drop, and which topics matter most?** This includes the duplicate and empty pages listed in [the current site](https://github.com/SiddharthMuramkar/care4mind/blob/505105015beb09f12a7532c9ed33377e131061cf/docs/current-site.md).
6. **Does the Dosha Survey give a result?** Finding out from the public site means submitting the live form, which sends an entry to the current site. If it only collects answers, it isn't a Questionnaire as the glossary defines it, and what becomes of it is part of question 5.
7. **Analytics:** which tool, and what it may record.
8. **Privacy and consent for Questionnaires. (Client and advisers)** What is stored about the person answering, if anything, and for how long. Do past responses on the current site need keeping? Only the client can export them.
9. **Domain and DNS. (Client)** Who controls care4mind.org and questionnaire.care4mind.org, and how the switch to the new site happens at launch.
10. **Content model details:** what a topic is, traditional texts and their passages, models and techniques, how authors and journals are recorded, and how a Concept links to a modern construct.
11. **Client sign-off on the defaults marked †.**
12. **Who fills the roles marked TBD?** The client names the Project owner, Psychology expert and Research editor (see Roles). The questions marked (Client) go to the Project owner, so they wait on this one.

## Launch

The site launches when every requirement above passes, the content kept under open question 5 is on the new site, and the Project owner signs off. FR-05 applies to the Questionnaires that are ready; one that isn't doesn't hold up launch (see Priorities) and follows after it.
