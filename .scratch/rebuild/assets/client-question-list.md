# Care4Mind.org rebuild: questions for Care4Mind

From Siddharth Muramkar · Sent 27 October 2026 · **Please reply by 10 November 2026**

## Why you are getting this

We are planning the new Care4Mind.org. Most planning decisions are ours to make, but the questions below can only be answered by Care4Mind.

We will contact you twice while we plan. This list is the first time. The second is a **sign-off pack**: one document with the plan's main choices for you to approve. Nothing else will come in between.

## How to reply

- Reply by email and quote each question's number, for example "B2: up to $40 a month is fine".
- Each question shows **our proposal**. If you agree, "agree" is enough.
- You can skip a question. We will go ahead on our proposal and list it in the sign-off pack, so you can still change it there.
- Questions marked **Written OK needed** are the exception. We wait for your reply before relying on our proposal.
- **Who answers** says who we think should answer. Please forward a question to that person if it isn't you.
- Section F is for your information only. It needs no reply.

> **How decisions get made**
>
> - **Who decides what.** The Project owner decides priorities, scope and launch. The Psychology expert decides how each Questionnaire scores and what its results mean. The Research editor checks sources and Sanskrit spellings. The developer decides technical and design matters.
> - **Written OK.** An email reply from the Project owner is enough. It is needed for three things: the scope and targets (A2 and A3), which Questionnaires launch and the privacy rule for them (D3 and D8), and the final launch.
> - **For comment, not approval.** The design direction and the list of pages we keep, merge or drop go in the sign-off pack for your comments.
> - **New ideas.** Any new request goes on a "later phases" list rather than into this project. You can swap an idea into this project through the sign-off pack, where we will show what it would push out.
> - **Until the roles are filled** (question A1):
>   - The person this list is addressed to acts as Project owner.
>   - Without a Research editor, we choose the citation style, the topic list and how pages link to one another. We mark them "not yet reviewed" in the sign-off pack.
>   - Without a Psychology expert, a Questionnaire is rebuilt to score exactly as it does today, with automated tests. It then states that its scoring was carried over unchanged and has not been reviewed for validity.

**Words used here**

- **Concept**: one idea from Indian psychology, such as guṇa or citta.
- **Reference**: one published work (a paper, book or website) with its details.
- **Questionnaire**: a set of questions with written scoring rules that gives the person answering a result.
- **Content editor**: someone who adds and updates the site's content after launch.
- **Vercel**: the company whose servers will run the new website.
- **Neon**: the company that will store the website's database.
- **DNS**: the internet's address book. It tells browsers which server care4mind.org lives on.
- **Redirect**: an old web address that automatically forwards visitors to its new address.

## A. Roles and scope

**A1. Who fills the roles?** We need names for:

- the **Project owner**, who approves scope and launch
- the **Psychology expert**, who owns Questionnaire scoring and interpretation
- the **Research editor**, who checks sources and spellings
- the **Content editors**, who keep content up to date after launch

**Our proposal:** you act as Project owner until one is named. The other roles stay open, and the fallbacks in the box above apply.

**Who answers:** Project owner

**A2. Scope.** _Written OK needed._ We are working from a working brief that updates your October brief. A one-page summary of the differences is at the end of this document. Please confirm the working brief as the project's scope, with the site in English only.

**Our proposal:** confirm.

**Who answers:** Project owner

**A3. Targets.** _Written OK needed._ Your brief set no measurable targets in several places, so we proposed standard ones (listed at the end). Please confirm them, including these details:

- a. **Which old addresses must keep working.** All public pages, posts, images, feeds, sitemaps, category and author listings, short links such as `care4mind.org/?p=123`, and the `http://` and `www.` versions of all of these. Not included: WordPress's admin, login and technical addresses, theme and plugin files, and the old questionnaire app on port 8020.
- b. **Placeholder pages are retired.** Pages with nothing on them, such as "Sample Page", will tell browsers and search engines "removed on purpose" instead of forwarding to another page.
- c. **How speed is measured.** By testing tools at launch, then from real visits after launch.
- d. **What the accessibility target covers.** The public pages. The editing screens will be made as accessible as practical.
- e. **The Sanskrit spelling rule stands as written.** Each term is stored in IAST, in Devanagari where available, and in every plain spelling it goes by. A search for any of these forms finds it.

**Our proposal:** confirm all five.

**Who answers:** Project owner

**A4. Is there a fixed date** the new site must be live by, such as an event, a course or a funding deadline?

**Our proposal:** no fixed date. We set a schedule once planning is finished.

**Who answers:** Project owner

**A5. Who approves the design direction, and in what form?**

**Our proposal:** the Project owner comments on sample pages in the sign-off pack.

**Who answers:** Project owner

**A6. Do you expect live training** for Content editors, beyond a short written guide?

**Our proposal:** a written guide only. Live training, if you want it, goes on the later-phases list.

**Who answers:** Project owner

## B. Running the site after launch

The new site runs on Vercel and Neon instead of WordPress. We build it under the developer's accounts. At handover the accounts move to ones Care4Mind owns, and Care4Mind pays the bills from then on.

We estimate about **US$22–27 a month plus tax** (Vercel $20, Neon $2–7). It is about $40 if the database is kept awake all the time, and about $12–18 more for detailed speed reports from real visitors. Neon bills Care4Mind directly rather than through Vercel, so the database can be handed over cleanly.

**B1. Will Care4Mind take over the Vercel and Neon accounts and bills at handover?**

**Our proposal:** yes.

**Who answers:** Project owner

**B2. What monthly running cost is acceptable?**

**Our proposal:** up to US$40 a month.

**Who answers:** Project owner

**B3. Which country is Care4Mind legally based in?** And can it pay recurring card charges in US dollars? The country also decides which privacy rules apply.

**Our proposal:** we assume India, and that card payment in US dollars works.

**Who answers:** Project owner

**B4. Who will edit the content after launch?** How many people, how often, and how comfortable are they with web tools?

**Our proposal:** we assume 1–3 people, a few edits a month, comfortable with tools like Google Docs.

**Who answers:** Project owner

**B5. Who keeps the site updated and secure after handover?**

**Our proposal:** a technical person Care4Mind names. A maintenance arrangement with the developer can be discussed separately.

**Who answers:** Project owner

**B6. Which GitHub account receives the site's code?** (GitHub is a service that stores code and its history.)

**Our proposal:** a new GitHub organisation owned by Care4Mind. We help set it up at handover.

**Who answers:** Project owner

**B7. Which country do most visitors come from?** This decides where the servers are placed.

**Our proposal:** we assume India.

**Who answers:** Project owner

**B8. Login emails.** The new editing screens send emails, such as password resets. That needs an email-sending service and a few DNS records added to care4mind.org. Is that acceptable?

**Our proposal:** yes, added at launch. Your existing email forwarding stays unchanged.

**Who answers:** Project owner

## C. The domain and the old systems

care4mind.org is registered at Namecheap until **13 September 2027**. The current website is hosted at Namecheap and the questionnaire app on a separate DigitalOcean server. Email to @care4mind.org addresses is forwarded elsewhere, not stored at Namecheap.

**C1. Who holds the logins** for Namecheap (domain and hosting) and DigitalOcean? Does anyone use an @care4mind.org email address?

**Our proposal:** we assume Care4Mind holds all three logins, and that email forwarding stays unchanged at launch.

**Who answers:** Project owner

**C2. The questionnaire app** (questionnaire.care4mind.org) was not responding on 26 October. Is it retired? Who built it, and may we contact them?

**Our proposal:** it is retired. We contact nobody without your OK.

**Who answers:** Project owner

**C3. Will anyone edit the current site before the new one launches?**

**Our proposal:** small edits are fine until a short content freeze of about a week before launch.

**Who answers:** Project owner

**C4. A full backup of the current site.** Can Care4Mind take one before the old hosting ends? It should include:

- a WordPress export
- the uploaded files
- the Quiz Maker and WPForms entries
- the KarmaYoga quiz's own settings, which hold the points each answer scores. A normal WordPress export leaves them out.

**Our proposal:** yes, Care4Mind takes it before launch, using step-by-step instructions we send.

**Who answers:** Project owner, or whoever has the WordPress admin login

**C5. Visitor records.** Do you have access to Google Search Console, analytics history or server logs for the current site? They show which old addresses people actually visit.

**Our proposal:** we assume none, and rely on the sitemap and web archives.

**Who answers:** Project owner

## D. Questionnaires

What we found:

- **Only two Questionnaires have questions today:** the KarmaYoga Scale (45 questions) and the Dosha Survey (12).
- **Sixteen more pages describe a questionnaire** and its High/Moderate/Low results, but have no questions. The questionnaire app may have held them, but it is down and its questions were never saved by web archives.
- **KarmaYoga Scale.**
  - Its 45 questions appear to come from Navare & Pandey's 2022 Karma Yoga scale, whose authors hold the copyright.
  - Its score comes from points per answer that are stored only in the site's database.
  - Its settings define three result bands: 0–35, 36–75 and 76–100.
- **Dosha Survey.** The form can only show the same message to everyone, so as built it gives no personal result.
- **The sixteen description pages** match a 2024 handbook of questionnaires by Tomar.

A Questionnaire whose questions and scoring rules can't be found is not dropped. It follows after launch, once they arrive, and it never delays the rest of the site.

**D1. Does Care4Mind hold any questions, scoring rules, result texts or source papers** for any Questionnaire?

**Our proposal:** we assume none. Questionnaires without them follow after launch.

**Who answers:** Project owner, Psychology expert

**D2. The KarmaYoga scoring.** Could someone with the WordPress admin login export the KarmaYoga quiz from Quiz Maker and send it to us now? And are its bands (0–35, 36–75, 76–100) percentages or points?

**Our proposal:** the KarmaYoga Scale is rebuilt once we have the export.

**Who answers:** Project owner (export), Psychology expert (bands)

**D3. Which Questionnaires matter most?** _Written OK needed for the final launch list._

**Our proposal:** the KarmaYoga Scale first, then the Dosha Survey. The others follow as their questions and rules arrive.

**Who answers:** Project owner, Psychology expert

**D4. Permission to reproduce published scales.** Does Care4Mind have permission to show Navare & Pandey's questions, or a contact with the authors? How does Tomar, the handbook's author, relate to Care4Mind?

**Our proposal:** we carry over only what the current site already shows, and mark the permission as unconfirmed in the sign-off pack.

**Who answers:** Project owner

**D5. Sources we couldn't find.** Who wrote the Dosha Survey? Where do the Sthitaprajna and Five Steps of Perfection pages come from?

**Our proposal:** we treat them as Care4Mind's own work.

**Who answers:** Project owner, Psychology expert

**D6. May we try the two working Questionnaires once?** That means finishing the KarmaYoga Scale and sending one Dosha Survey entry on the current site, to see what visitors see at the end. Each adds one entry to your site's records, which we mark as a test.

**Our proposal:** yes, one of each, marked "TEST – developer".

**Who answers:** Project owner

**D7. May the High/Moderate/Low descriptions stay public** while their Questionnaire has no working questions?

**Our proposal:** yes, as description pages marked "questionnaire coming later".

**Who answers:** Psychology expert

**D8. Privacy.** _Written OK needed._ Is this rule acceptable: store nothing about the person answering, and show the result on screen only?

**Our proposal:** yes.

**Who answers:** Project owner, with Care4Mind's advisers

**D9. Past responses.** Must the responses stored on the current site be kept? Only Care4Mind can export them.

**Our proposal:** no. If yes, Care4Mind exports them before the old hosting ends.

**Who answers:** Project owner

**D10. Advisers and the privacy notice.** Who are Care4Mind's legal or privacy advisers, and who supplies the privacy notice text?

**Our proposal:** Care4Mind's advisers supply the text. We give them a plain description of what the site collects.

**Who answers:** Project owner

## E. Content and identity

**E1. Placeholders and duplicates.** May the developer decide which placeholder and duplicate pages to keep, merge or drop (such as "Sample Page" and the two extra "Home" pages)? Decisions about real content would be shown in the sign-off pack.

**Our proposal:** yes.

**Who answers:** Project owner

**E2. Which topics matter most?** Must any page stay or go? For example, the site has two "Text Books" pages with different lists (24 items and 11 books). Which is current?

**Our proposal:** keep every page with real content, and merge the two Text Books pages into one list.

**Who answers:** Project owner, Research editor

**E3. Authors and review.** Who wrote the content? Should contributors be named publicly? Must the Research editor approve a page before it is published?

**Our proposal:** name the contributor where known. Pages publish without approval, but each shows whether it has been reviewed.

**Who answers:** Project owner, Research editor

**E4. Sanskrit spellings.** Who supplies and checks the IAST and Devanagari forms (for example vikṣepa and विक्षेप)? The current site mixes scripts and spellings, sometimes on one page. Who checks that Devanagari conjuncts display correctly in the chosen fonts?

**Our proposal:** we draft the forms, and the Research editor checks them. Until then they are marked "not yet reviewed".

**Who answers:** Research editor

**E5. Words in your brief.** What did "applications" and "Journal links" mean? Do you want commentaries on the traditional texts?

**Our proposal:**

- "Applications" means practical uses of a Concept, shown on its page.
- "Journal links" means a list of relevant journals with links.
- Commentaries are not part of this project.

**Who answers:** Project owner, Research editor

**E6. Source material outside the site.** Is any kept elsewhere, such as documents, reference lists or a Zotero library?

**Our proposal:** we assume none.

**Who answers:** Research editor

**E7. Rights and image descriptions.**

- Who holds the rights to the site's 71 images, and to the translations quoted on it?
- Only one image has a text description for people using screen readers. Who writes the rest?
- The current site uses a shareware font, Samarkan, with an unknown licence.

**Our proposal:**

- We assume Care4Mind may use all 71 images and the quoted translations, credited where the source is shown.
- We draft image descriptions, and a Content editor approves them.
- Samarkan is not reused.

**Who answers:** Project owner

**E8. Completing References.** Some References lack details such as a DOI, and ten reference links go nowhere. How far should we complete them?

**Our proposal:** carry them over as shown and flag the incomplete ones.

**Who answers:** Research editor

**E9. Name and identity.** The site name, the tagline ("Indic ways to invoke a perfect balanced mind"), the logo (keep, refresh or replace), the colours (now green to gold), social accounts and a contact address. The header's Twitter and Facebook icons currently link nowhere.

**Our proposal:**

- Keep the name and tagline.
- Refresh the logo and colours as part of the new design.
- Show social icons only for accounts you give us.
- Use the contact address you name.

**Who answers:** Project owner

**E10. Analytics.** Is there any analytics on the current site now? Are there limits on what analytics may record?

**Our proposal:** simple visit counts that use no cookies (Vercel's own analytics), subject to your advisers' view.

**Who answers:** Project owner, with Care4Mind's advisers

## F. For your information (no reply needed)

The current site stays Care4Mind's responsibility until launch. We noticed these while looking at it from the outside and did not test them further:

- **AI-agent access points.** The site's public technical index lists access points (MCP and Abilities API) that let AI tools act on a website. We did not test whether they require a login. Your web person may want to check.
- **Usernames.** The sitemap's author listings can reveal login usernames.
- **Unencrypted link.** The homepage links to the questionnaire app over plain `http://`. If the app came back, answers sent to it could travel unencrypted.
- **Email spoofing.** care4mind.org has no DMARC record. This setting helps stop others from sending email that pretends to come from your domain.

## Attachment: how the working brief differs from your October brief

Your October brief stays the record of what Care4Mind asked for. The working brief is what we plan and build against. Where they differ, the working brief wins. A2 asks you to confirm it.

- **Rebuild instead of improving WordPress.** You approved a new site with a new design. The content worth keeping is copied from the public site, because we have no access to its code, database or admin login. The linked structure your brief asks for doesn't exist on the current site and would have to be built either way.
- **WordPress is replaced.** The site runs on Vercel and Neon, and Content editors get new editing screens. The accounts move to Care4Mind at handover.
- **Measurable targets added.** Where your brief had none, we proposed standard ones (A3):
  - accessibility to WCAG 2.2 AA, the common international standard
  - Google's "good" speed scores on mobile
  - everything works at screen widths from 360 to 1440 pixels
  - every old address keeps working or forwards to its new address
  - each Sanskrit term is findable in every spelling
- **No separate audit report.** Your brief began with a technical audit, a defect register and a speed report on the current site. Since all of its code is replaced, a written snapshot of the current site takes their place. Backing up the old site stays with Care4Mind (C4).
- **Questionnaires run as a separate track.** A Questionnaire is rebuilt only from its written scoring rules. One without them follows after launch, and none is invented or re-scored.
- **One developer working with AI coding agents.** Your brief suggested a team of six. Here, AI coding agents write and test all the code. The developer directs them and checks every result. Care4Mind supplies the Project owner, Psychology expert and Research editor.
- **A new estimate.** Your brief's 45–73 person-days and 9–14 weeks are replaced by an estimate made once planning is finished.
- **Training.** A short written guide for Content editors. Live training would come later (A6).
- **English only.** Translation into other languages is not part of this project.
- **Same exclusions.** These remain excluded:
  - clinical services
  - new instruments or validation studies
  - visitor accounts and saved results
  - journal publishing
  - AI advice
  - rewriting or checking all content
  - a mobile app

  The only change is that a custom-built platform is now in scope.
