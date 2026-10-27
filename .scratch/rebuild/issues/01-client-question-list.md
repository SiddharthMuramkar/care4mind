# Send the client the question list

Type: task
Mode: HITL
Track: site and Questionnaires
Status: open
Blocked by: none
Map: [Care4Mind.org rebuild](../map.md)

## Question

What does the client say to the questions only they can answer? Draft one plain-language question list, agree it with the developer, send it to the client contact with a reply-by date about two weeks out, and record the replies.

This is the first of two client contacts while the map is open. The second is [Send the client the sign-off pack](29-client-sign-off-pack.md), so tell the client one final pack will follow. Fold in facts from research tickets that have already resolved; wait for none.

Before drafting, settle with the developer the approval rules the list proposes:

- which decisions need the Project owner's written OK
- how change requests go to the later-phases list
- fallbacks for unfilled roles. Propose these:
  - The contact stands in as Project owner until one is named.
  - With no Research editor, the developer's choices of citation style, topics and relation types are marked "not yet reviewed" and listed in the sign-off pack.
  - With no Psychology expert, the brief's Roles fallback applies.

Give each item a proposed default and name the role that answers it.

**A. Roles and scope (OQ11, OQ12)**

- Who are the Project owner, Psychology expert, Research editor and Content editors?
- Confirm the working brief as the scope, in English only. Attach a one-page summary of how it differs from the client brief.
- Sign off the † targets, with these proposals:
  - The FR-07 boundary covers public pages, posts, media, feeds, sitemaps, category and author archives, `?p=` shortlinks, and the http and www variants of all of them. It excludes `/wp-json/`, `/wp-admin/`, `/wp-login.php`, `xmlrpc.php`, theme and plugin files, and the questionnaire app on port 8020.
  - Pure placeholders return 410 ("gone on purpose") instead of a redirect.
  - NFR-02 is measured in the lab at launch, and from real visits after it.
  - NFR-01 covers public pages; the editing screens are best effort.
  - The NFR-03 spelling-variant rule stands as written.
- Is there a fixed date?
- Who approves the design direction, and in what form?
- Is live training expected beyond FR-09's short guide? If so, it goes on the later-phases list.

**B. Running the site (OQ2, FR-09)**

- The new site runs on Vercel and Neon, not WordPress ([ADR-0002](../../../docs/adr/0002-vercel-and-neon.md)). It is built under the developer's accounts, and the projects move to client-owned accounts at handover.
  - Confirm the client takes over the Vercel and Neon bills from then.
  - Roughly what monthly cost is acceptable?
- Which country is Care4Mind legally based in? Can it pay recurring card charges in US dollars?
- How many people will edit, how often, and how comfortable are they with web tools?
- Who keeps the site patched after handover?
- Which GitHub account receives the repo?
- Which country do most visitors come from?

**C. Domain and old systems (OQ9)**

- Who holds the registrar, DNS, Namecheap and DigitalOcean logins? Does the domain carry email?
- Is the questionnaire app retired? Who built it, and may we contact them?
- Will anyone edit the current site before launch?
- Can the client take a full backup of the current site before the old hosting ends: a WordPress export, the uploads, and the Quiz Maker and WPForms entries? It must include the KarmaYoga quiz's own settings, which hold the points each answer scores; a WordPress export leaves them out ([How the KarmaYoga Scale and Dosha Survey work now](09-current-questionnaire-behaviour.md)).
- Is there any Search Console access, analytics history or server log?

**D. Questionnaires (OQ3, OQ4, OQ6, OQ8)**

- Does the client hold any questions, scoring rules, result texts or source papers?
- Which Questionnaires matter most?
- Do we have permission to reproduce any published scale?
- May we submit one Dosha Survey test entry and finish the KarmaYoga Scale once? ([Try the two working Questionnaires on the current site](27-try-current-questionnaires.md) does this.)
- May the High/Moderate/Low descriptions stay public without a working Questionnaire? This is the Psychology expert's call.
- Is the privacy default "store nothing, show the result on screen only" acceptable?
- Must past responses be kept?
- Who are the client's advisers, and who supplies the privacy-notice text?

**E. Content and identity (OQ5, OQ7, OQ10)**

- May the developer decide keep, merge or drop for placeholders and duplicates, with calls on real content confirmed in the sign-off pack?
- Which topics matter most? Must any page stay or go? For example, which Text Books page is current?
- Who wrote the content? Are contributors named publicly? Must a Research editor approve before publishing?
- Who supplies and checks the IAST and Devanagari?
- What did "applications" and "Journal links" mean in the client brief? Are commentaries wanted?
- Is any source material kept outside the site: documents, reference lists, a Zotero library?
- What are the rights to the 71 media files and the quoted translations?
- How far should existing references be completed? Default: carry them over as shown and flag the incomplete ones.
- Site name, tagline, logo (keep, refresh or replace), colours, social accounts and contact address.
- Is there any current analytics? Are there limits on what analytics may record?

**F. For information only**

- The current site lists AI-agent (MCP) and Abilities API endpoints; whether they need a login wasn't tested.
- Its sitemap's author archives can reveal login usernames.
- The homepage links to the questionnaire app over plain HTTP.

The developer sends the list and records the replies word for word under `## Answer`. Then add a one-line pointer under each open question in the brief that a reply answers.

The ticket resolves when the replies arrive or the reply-by date passes. Its answer lists any unanswered items, so each waiting ticket can decide whether to go ahead on a written-down assumption.
