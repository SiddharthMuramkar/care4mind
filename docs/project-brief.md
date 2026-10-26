# Care4Mind.org — Project Brief

Indian Psychology Knowledge and Research Portal | October 2026

> Client brief, pasted into a Claude Code session on 2026-10-25. Tables and lists were rebuilt from the flattened paste; the wording is unchanged.

## 1. Objective

Transform Care4Mind.org into a comprehensive, accessible, and research-oriented digital portal for Indian psychology by improving the existing website and retaining its current content management system (CMS).

The project will connect traditional Indian psychological concepts, primary texts, contemporary research, practical applications, and existing questionnaires within a coherent digital knowledge environment.

The emphasis is on improving and extending the existing platform, not undertaking an unnecessary rebuild.

### Target audiences

- **General public:** Explore Indian psychology concepts and practical applications through accessible content.
- **Students and educators:** Find structured learning resources, explanations, and references.
- **Researchers and scholars:** Discover research papers, source texts, authors, and bibliographic references.
- **Content editors and administrators:** Maintain and expand the portal through a manageable publishing workflow.

## 2. Prioritised development scope

### P0 — Technical audit and stabilisation: Critical

Establish the current state of the CMS, website structure, hosting, integrations, questionnaires, and security before development begins.

- **Deliverables:** Technical audit, page and URL inventory, defect register, backup and recovery verification, baseline performance report, and prioritised development backlog.
- **Estimated effort:** 5–8 person-days

### P1 — Knowledge architecture and navigation: Critical

Create a consistent structure connecting concepts, psychological models, traditional texts, techniques, applications, research, and references.

- **Deliverables:** Approved taxonomy, revised navigation, reusable page templates, topic landing pages, breadcrumbs, related-content links, and an inventory of duplicate or misplaced content.
- **Estimated effort:** 8–12 person-days

### P2 — Structured knowledge and research repository

Make the portal useful as a connected research resource (include related Indian Psychology websites, Authors and textbooks, Journal links etc), not simply a collection of standalone articles.

- **Deliverables:** Structured content types, searchable reference records, author and publication metadata, source links, concept-to-text connections, research categories, and content-editor guidance.
- **Estimated effort:** 10–16 person-days

### P3 — Existing questionnaire improvement

Audit and repair existing assessments, improve their presentation, and make their behaviour reliable across devices.

- **Deliverables:** Questionnaire inventory, corrected links and labels, validated scoring rules, clear results pages, assessment limitations, consent and privacy notices where needed, and automated or documented test cases.
- **Estimated effort:** 8–15 person-days, subject to the number and complexity of assessments

### P4 — Usability, accessibility, and search visibility

Improve access to the portal for different audiences and make its resources easier to find through internal and external search.

- **Deliverables:** Responsive layouts, site-wide search, keyboard accessibility, accessible forms, page-speed improvements, metadata, XML sitemap, canonical URLs, broken-link remediation, and analytics configuration.
- **Estimated effort:** 8–12 person-days

### P5 — Quality assurance, security, and handover

Validate the integrated portal, protect existing content and URLs, and prepare it for sustainable ongoing management.

- **Deliverables:** Functional and regression test report, security checks, backup verification, deployment plan, administrator training, technical documentation, and launch sign-off.
- **Estimated effort:** 6–10 person-days

## 3. Functional requirements and acceptance criteria

The following requirements should form the basis of the development team's implementation and testing.

| ID    | Requirement              | Acceptance criterion                                                                                                  |
| ----- | ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| FR-01 | Knowledge navigation     | Users can navigate from a topic to its related concepts, texts, applications, and research.                           |
| FR-02 | Structured content       | Editors can create and update supported content types through the existing CMS.                                       |
| FR-03 | Research references      | Reference records contain consistent bibliographic details and links to original sources where available.            |
| FR-04 | Search                   | Users can search by title, concept, author, text, and relevant keywords.                                              |
| FR-05 | Questionnaires           | All in-scope assessments load correctly, validate answers, and produce results according to documented scoring rules. |
| FR-06 | Mobile usability         | Core navigation, content, search, and assessments work across agreed mobile and desktop viewports.                    |
| FR-07 | SEO and URL preservation | Existing indexed URLs are retained where practical; changed URLs have appropriate redirects.                          |
| FR-08 | Security and recovery    | Administrative access is protected, backups are verified, and a documented restoration procedure exists.              |
| FR-09 | Maintainability          | Source code, configuration, content models, and deployment instructions are documented and handed over.               |

These criteria should be confirmed during discovery and expanded into detailed test cases before development begins.

## 4. Content and data model

The central architectural requirement is to connect knowledge records rather than treat every page as an isolated article. Hyperlink pages where appliable and interconnect the concepts.

- **Knowledge concept:** Definition · terminology · context · related concepts
- **Primary sources:** Texts, passages, translations, commentaries
- **Research records:** Papers, authors, journals, findings
- **Models and techniques:** Frameworks, methods, applications
- **Assessments:** Questionnaires, methodology, scoring

_Proposed logical content model; relationships and terminology are to be finalised during the content audit._

### Required metadata

Each content type should have only the fields relevant to it, with shared metadata where appropriate:

- **Knowledge pages:** title, summary, full content, topic, terminology, related concepts, author or contributor, and review status.
- **Primary sources:** text title, section or passage, original-language text where applicable, translation, edition, translator, and source citation.
- **Research records:** paper title, authors, publication, year, abstract, keywords, DOI or stable URL where available, and evidence type.
- **Assessment records:** assessment purpose, version, question set, scoring method, interpretation, validation status, and applicable limitations.

Sanskrit terminology should support consistent transliteration and spelling variants. Relationships between traditional concepts and modern psychological constructs should be explicitly documented rather than automatically treated as equivalent.

## 5. Dependencies and prerequisites

The project can begin with discovery, but the following inputs are needed to deliver the later phases reliably.

| Dependency                                 | Needed from                         | Why it matters                                                                  |
| ------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------- |
| CMS and hosting access                     | Website administrator               | Determines available development options and deployment constraints.           |
| Existing source code and integrations      | Current technical maintainer        | Identifies technical debt, dependencies, and questionnaire integration issues.  |
| Content inventory and editorial priorities | Content team                        | Establishes migration scope, duplicate content, and high-priority topics.       |
| Authoritative source material              | Subject experts and researchers     | Ensures references, quotations, and interpretations are accurate.               |
| Questionnaire documentation                | Assessment owners                   | Required to validate scoring, interpretation, and assessment limitations.       |
| Privacy and consent decisions              | Project owner and relevant advisers | Determines what assessment data may be collected, stored, and analysed.         |
| Design and scope approval                  | Project owner                       | Prevents repeated redesign and uncontrolled expansion of deliverables.          |

**Critical dependency:** The CMS and questionnaire audit must establish whether the existing platform can support the intended changes through configuration and extensions or needs targeted custom development. This decision should precede significant coding.

## 6. Indicative schedule and effort

The estimates below are preliminary person-day estimates, not a fixed-price commitment.

| Workstream                             | Effort                |
| -------------------------------------- | --------------------- |
| P0 — Audit and stabilisation           | 5–8 days              |
| P1 — Knowledge architecture            | 8–12 days             |
| P2 — Knowledge and research repository | 10–16 days            |
| P3 — Questionnaire improvements        | 8–15 days             |
| P4 — UX, accessibility, and SEO        | 8–12 days             |
| P5 — QA, security, and handover        | 6–10 days             |
| **Total estimated effort**             | **45–73 person-days** |

**Planning estimate**

- **9–14 weeks:** Indicative calendar duration
- **2.25–3.65:** Person-months at 20 days/month

Calendar duration assumes some workstreams overlap and the required personnel and approvals are available. Content rewriting, large-scale reference verification, extensive questionnaire redevelopment, and unexpected legacy-code issues could increase the estimate.

### Proposed delivery sequence

| When        | Phase                                 | Activities                                                                                                  |
| ----------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Weeks 1–2   | Discovery and technical stabilisation | Confirm the platform, document existing functionality, establish backups, and approve the backlog.          |
| Weeks 2–5   | Architecture and user experience      | Approve navigation, content relationships, templates, and the search approach.                              |
| Weeks 4–9   | Core development                      | Implement content models, research references, search, responsive improvements, and questionnaire repairs. |
| Weeks 9–12  | Integration and validation            | Test content migration, search, questionnaire results, accessibility, security, and SEO.                    |
| Weeks 12–14 | Launch and handover                   | Resolve critical defects, deploy approved changes, train administrators, and complete documentation.        |

The final schedule should be baselined after the audit. A phased release is preferable to delaying the entire portal until every secondary enhancement is complete.

## 7. Risk register and mitigation

| Risk                                  | Impact                                                       | Mitigation                                                                                                      |
| ------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Legacy CMS limitations                | Customisation takes longer than expected                     | Audit the current CMS and extensions before selecting an implementation approach.                               |
| Inconsistent or duplicate content     | Search results and knowledge relationships become unreliable | Establish editorial standards, canonical records, and a content review process.                                 |
| Inaccurate research references        | Reduced academic credibility                                 | Assign source verification to a designated subject expert or research editor.                                  |
| Questionnaire scoring errors          | Misleading results and loss of user trust                    | Document scoring rules, independently verify expected outcomes, and test boundary cases.                        |
| Sensitive assessment data exposure    | Privacy and reputational harm                                | Minimise data collection, restrict access, define retention rules, and assess privacy obligations before launch. |
| Broken URLs or loss of SEO visibility | Reduced traffic and inaccessible resources                   | Preserve established URLs, configure redirects, and monitor indexing after deployment.                          |
| Scope expansion                       | Delays and increased costs                                   | Use a prioritised backlog, written change approvals, and separate estimates for new features.                   |
| Insufficient ongoing maintenance      | Security and content quality deteriorate                     | Assign platform ownership, schedule updates, and document recurring maintenance tasks.                          |

## 8. Recommended team and responsibilities

A small team can deliver the initial scope, provided responsibilities are clearly assigned.

| Role                            | Indicative involvement                                          |
| ------------------------------- | --------------------------------------------------------------- |
| Project owner                   | Scope approval, priorities, acceptance, and decisions           |
| Technical lead / CMS developer  | Audit, architecture, development, deployment                    |
| UI/UX designer                  | Navigation, page templates, accessibility-oriented design       |
| Research/content editor         | Taxonomy, references, content quality, source verification      |
| QA specialist                   | Functional, regression, accessibility, and cross-device testing |
| Psychology or assessment expert | Questionnaire methodology, scoring, and interpretation          |

The developer and assessment expert should collaborate on questionnaire implementation, but scientific validity must remain a subject-matter responsibility.

## 9. Explicit exclusions from the initial project

To protect the timeline and budget, the following should be treated as separate future phases unless explicitly approved:

- A complete CMS migration or custom-built platform.
- A new clinical diagnostic or treatment service.
- Development of new psychometric instruments or formal validation studies.
- User accounts, personalised dashboards, or saved assessment histories beyond existing requirements.
- A full academic journal publishing or peer-review management system.
- AI-based psychological recommendations or automated interpretation of individual mental-health data.
- Large-scale rewriting, translation, or scholarly verification of all existing content.
- A dedicated mobile application.

These may be valuable later, but they are not prerequisites for establishing a stronger knowledge and research portal.

## 10. Launch readiness checklist

- [ ] Technical audit and backlog approved
- [ ] Navigation and content taxonomy approved
- [ ] Core content templates implemented
- [ ] Research references and search tested
- [ ] Existing questionnaires and scoring validated
- [ ] Mobile and accessibility checks completed
- [ ] Security, backup, and recovery checks passed
- [ ] URL redirects and SEO checks completed
- [ ] Administrator documentation and training delivered
- [ ] Project owner approves production launch

## 11. Final recommendation

Implement the project as an enhancement of the existing CMS, organised around a structured knowledge repository and searchable research references. Repair the current questionnaires as a parallel workstream, rather than allowing assessment redevelopment to delay the core portal.

The first formal milestone should be a technical discovery report that confirms the CMS, hosting environment, content inventory, integrations, and actual questionnaire requirements. This will allow the project owner to approve a firm delivery schedule, budget, and implementation backlog based on evidence rather than assumptions.

The intended outcome is a sustainable digital resource that serves the public, educators, students, and researchers while preserving the integrity of Indian psychological traditions and supporting rigorous scholarly engagement.
