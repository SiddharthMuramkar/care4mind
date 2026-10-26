---
status: accepted
---

# Rebuild the site instead of enhancing the current one

The client's original brief ([client-brief.md](../client-brief.md)) asked for Care4Mind.org to be improved on its existing WordPress install, and excluded a rebuild unless explicitly approved. The client has approved one: a new site with a new design, carrying over the content worth keeping by scraping the public site. We chose to rebuild because:

- The brief's central requirement, Concepts, traditional texts, References and Questionnaires linked to one another, doesn't exist on the current site. None of its content is in custom content types: it's 33 pages, most built with Elementor, and six posts, so that layer has to be built from scratch either way.
- The existing content sits inside Elementor page layouts rather than structured fields, so it has to be extracted and restructured whichever path we take.
- The live site is in worse shape than the client brief assumes ([current-site.md](../current-site.md)). Its questionnaires are split across a quiz plugin, a form plugin and a separate app that no longer responds; several pages are empty or placeholders; its social links are empty.
- We have no access to the site's code, database or admin login.
- 33 pages and 6 posts is small enough to migrate deliberately, one at a time.
- A new design means every page template is new in either path.

The site's software is not old: WordPress 7.1.3, Elementor 4.3.5 and Astra 4.14.1 were all the latest releases in October 2026. The case rests on how the site is built and what we can reach, not its age.

## Consequences

- Every Questionnaire's scoring has to be re-implemented, so its scoring rules must be obtained before it can be rebuilt. Scraping recovers what the public sees, which may not include the rules.
- Content editors may lose the WordPress admin screens they know, unless WordPress stays on as the new site's content back end (an open decision).
- Whoever maintains the site after handover inherits the new stack, so choosing it depends on who that will be.
