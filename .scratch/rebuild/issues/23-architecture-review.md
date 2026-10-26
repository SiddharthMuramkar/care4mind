# Architecture review

Type: grilling
Mode: HITL
Track: site
Status: open
Blocked by: 04, 05, 06, 08, 18, 22
Waits on: [App framework and content back end on Vercel and Neon](04-framework-and-content-back-end.md), [Search and Sanskrit spellings on Neon Postgres](05-search-and-sanskrit-spellings.md), [Front-end interaction stack and quality checks](06-front-end-interaction-stack.md), [Running on Vercel and Neon: backups, environments, handover and costs](08-running-on-vercel-and-neon.md), [What search finds](18-what-search-finds.md), [Editing trial](22-editing-trial.md)
Map: [Care4Mind.org rebuild](../map.md)

## Question

Does the developer accept the architecture the research recommends? Settle the rest of open question 1 in one ADR (ADR-0003):

- the framework and the content back end
- static, server-rendered or mixed pages
- where media lives
- the search technology that passes the test cases from [What search finds](18-what-search-finds.md), and how its index stays current
- editor login
- environments: preview deploys paired with Neon branches, and production
- how coding agents build and test it: context7 for docs, and CI checks for FR-05, FR-06, FR-07, NFR-01, NFR-02 and NFR-04
- the expected monthly running cost the client takes over

Confirm the FR-02 list of editable types against the client's answers on who will edit (OQ2). If those answers are late, go ahead on a written-down assumption.

Leave room for a small server endpoint and database table in case a Questionnaire ever needs one, but wait on no Questionnaire ticket.

The agents propose; the developer verifies and decides.
