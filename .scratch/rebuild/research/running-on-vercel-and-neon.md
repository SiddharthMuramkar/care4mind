# Running on Vercel and Neon: backups, environments, handover and costs: research findings

Ticket: [Running on Vercel and Neon: backups, environments, handover and costs](../issues/08-running-on-vercel-and-neon.md) · Researched 2026-10-26 · Branch: research/running-on-vercel-and-neon

## Summary

- **Database backups are built in, but only for the database.** Neon, the hosted Postgres database, keeps a rolling change history. The Launch plan lets you rewind ("instant restore") up to 7 days; Scale allows 30. Paid plans also take scheduled snapshots (daily, weekly or monthly, kept up to 35 days) and unlimited-lifetime manual ones. A restore rewinds the whole database, editor logins included. It does **not** rewind uploaded media in either Vercel Blob or Neon Object Storage, and neither file store documents a backup or undelete feature. Media needs its own copy, and so does any backup the client wants kept outside Neon (a nightly `pg_dump` file).
- **Preview sites can each get their own copy of the database.** Neon's Vercel integration makes a database branch, an instant copy-on-write clone, for every preview deploy, and hands it the connection details automatically. Production uses one fixed branch. Secrets live in Vercel's encrypted environment variables; a "Secret" variable cannot be read back after it is saved.
- **Handover works, but the route has to be chosen before the build starts.** Vercel projects move between teams in one step, with no downtime. Integrations, Blob stores and the Git connection must be redone or moved separately. Neon projects move with a 24-hour claim link, keeping the same connection string. The catch: **Neon's own transfer does not work for a database bought through the Vercel Marketplace** (the "Vercel-Managed" integration). That kind moves only through Vercel. Vercel's resource transfer requires the developer to be a member of both teams. Whether an ordinary project transfer carries the database along is documented inconsistently. A simpler alternative is to build in a dedicated Vercel team and Neon organisation from day one, then hand ownership of both to the client.
- **Expected running cost: about US$22–27 a month plus tax, or about $40 if the database never sleeps.** Vercel Pro is $20 a month, which includes one seat that can deploy and $20 of usage credit; a low-traffic 40-page site should fit inside that credit. Neon Launch has no minimum fee and should come to roughly $2–7 a month if the database sleeps when idle, or about $20 if it never sleeps. Transactional email for a small editing team fits a free tier, for example Resend's 3,000 emails a month. **Vercel's Hobby plan is not an option:** its terms bar any site whose builder is paid.
- **Sending editor invite and password-reset emails needs an email service and DNS records on care4mind.org.** Vercel sends no email. Neon's managed login service has a shared sender that Neon says suits development only. It does not yet offer two-factor login ("coming soon"). Content-management systems such as Payload need an email adapter, or emails are only written to a log.
- **Vercel Web Analytics sets no cookies, and both it and Speed Insights say they record nothing tied to an individual visitor.** Neither vendor page says whether a consent banner is needed. EU guidance treats any script that makes the browser send data as covered by the consent rule, cookies or not. India's data-protection law reaches full force around May 2027. The client's jurisdiction isn't recorded, so the answer belongs to the client's advisers. Free Speed Insights shows only a summary score; the separate LCP, INP and CLS figures cost $10 per project per month (corrected on verification: plus $0.65 per 10,000 events, with no events included on Pro, so roughly $12–18 a month at the assumed traffic; the free tier's 10,000 events per 30 days would likely run out and pause, see Analytics).
- **Redirects are not a constraint.** FR-07 needs roughly 115 old URLs to resolve. Vercel allows 2,048 redirects in `vercel.json` and 1,000 "bulk redirects" on Pro (up to 1,000,000 with paid capacity). Vercel's `permanent: true` sends a **308**, not the 301 FR-07 names; `statusCode: 301` gives a 301.
- **Verification (2026-10-26):** the claims above were re-checked against live sources. Several details were corrected (marked "corrected on verification" below); none changes a recommendation. See [Verification](#verification).

## Findings

Every source below was read on 2026-10-26. Prices are in US dollars and exclude tax.

**Two terms used throughout:**

- **Vercel** hosts the website: it builds the code, serves pages through its CDN (content delivery network, a worldwide set of caching servers) and runs small server functions.
- **Neon** hosts the Postgres database. Neon now describes itself as "cloud backend primitives built around Lakebase Postgres … from Databricks" and also sells login, file storage and functions ([Neon pricing](https://neon.com/pricing)). Neon's plans are Free, Launch and Scale. Launch and Scale are pay-as-you-go with "no monthly minimum", and a plan applies to a whole Neon **organisation** (an account that groups projects and members) ([Neon pricing](https://neon.com/pricing); [Neon plans](https://neon.com/docs/introduction/plans)).

### Backups and restore (FR-08)

#### Neon's point-in-time restore ("instant restore")

- **What it is.** Neon records every change to the data as Postgres write-ahead log (WAL) records. The **history window** is how long it keeps them. Within that window you can rewind a branch to any moment, "down to the millisecond" ([History window](https://neon.com/docs/postgres/backup-restore/history-window); [Instant restore](https://neon.com/docs/postgres/backup-restore/branch-restore)).
- **How long each plan keeps it** ([History window](https://neon.com/docs/postgres/backup-restore/history-window); [Neon plans](https://neon.com/docs/introduction/plans)):

  | Plan | Default window | Maximum window | Cost of the kept history |
  | --- | --- | --- | --- |
  | Free | 6 hours | 6 hours, capped at 1 GB of history | none |
  | Launch | 1 day | 7 days | $0.20 per GB-month |
  | Scale | 1 day | 30 days | $0.20 per GB-month |

  The window is one project-wide setting, so a 7-day window has to be switched on deliberately; it is not the default. Neon's production checklist suggests 7 days, so that mistakes nobody notices for a few days can still be undone ([History window](https://neon.com/docs/postgres/backup-restore/history-window)).
- **What a restore does** ([Instant restore](https://neon.com/docs/postgres/backup-restore/branch-restore)):
  - It works only on **root branches**: the main branch, not the copies made from it.
  - It is a complete overwrite, not a merge. It replaces every database on the branch, including the `neon_auth` schema that holds Neon's managed login data, and "there is no way to exclude `neon_auth` from a restore". Rewinding content would therefore also rewind Content editor accounts and passwords.
  - "Object Storage is not part of the database timeline, so a database restore does not revert its contents."
  - Neon automatically keeps the pre-restore state as a backup branch named `<branch>_old_<timestamp>`.
  - Open connections drop briefly, but the connection details don't change, and Neon says the operation takes "a few seconds".
- **Checking before restoring.** **Time Travel Assist** runs read-only queries against any moment inside the window, and Schema Diff compares structures. Both help pick the right moment before overwriting anything ([Instant restore](https://neon.com/docs/postgres/backup-restore/branch-restore)).

#### Neon snapshots

A snapshot is a saved copy of a branch at a moment in time ([Backup & restore](https://neon.com/docs/guides/backup-restore)).

| | Free | Launch | Scale |
| --- | --- | --- | --- |
| Manual snapshots | 1 | 100 | 100 |
| Scheduled snapshots | not available | yes | yes |

- **Manual snapshots** "never expire unless you give them an expiration".
- **Scheduled snapshots:**
  - They run daily, weekly or monthly at a chosen hour (UTC), on root branches only.
  - They are kept 35 days by default, which is also the maximum (settable from 1 hour).
  - While a schedule is active, its latest snapshot is never deleted.
  - They don't count against the 100-snapshot limit.
- **Cost.** All snapshot storage costs $0.09 per GB-month. A manual snapshot is charged at full size. A schedule's first snapshot is charged at full size and later ones only for what changed since the previous one.
- **Restoring a snapshot.** There are two ways:
  - **One-step:** the branch is replaced at once. It keeps its name and connection string; the old state becomes `<branch> (old)`.
  - **Multi-step:** the snapshot becomes a new branch you can inspect first. You then "finalize", which moves the original branch's compute, name, backup schedule and protection onto the restored branch, so the application's connection string keeps working.
- **Limitations** Neon lists:
  - Point-in-time restore is "currently not supported on branches created from a snapshot restore".
  - Child branches can't "reset from parent" for up to 24 hours after their parent is restored from a snapshot.

#### Restoring into a new branch and switching over

Neon documents three ways. In each, the Vercel site keeps working without new connection settings:

1. **Multi-step snapshot restore, then finalize** (above). Finalizing swaps the restored branch in under the original name and connection string ([Backup & restore](https://neon.com/docs/guides/backup-restore)).
2. **Restore from another branch.** A root branch can be restored from the latest state or an earlier moment of *another* root branch ([Instant restore](https://neon.com/docs/postgres/backup-restore/branch-restore)).
3. **Point Vercel at a different branch.** With either Neon–Vercel integration, Production uses a "production branch" chosen in Neon's integration settings. You can change it and redeploy production "so it picks up the new branch's credentials". The chosen branch must have a read-write compute and no expiry date ([Neon-Managed integration](https://neon.com/docs/guides/neon-managed-vercel-integration); [Vercel-Managed integration](https://neon.com/docs/guides/vercel-managed-integration)).

Two related safety nets:

- **Deleted projects** can be recovered within 7 days ([Manage projects](https://neon.com/docs/manage/projects); [Recover a deleted project API](https://neon.com/docs/reference/api/projects/recover-project)).
- **Code mistakes** are handled on Vercel's side. **Instant Rollback** returns production to any earlier production deployment on Pro (Hobby: only the immediately previous one). It does not touch the database ([Instant Rollback](https://vercel.com/docs/instant-rollback)). Pro keeps production deployments for 1 year and previews for 180 days by default ([Deployment retention](https://vercel.com/docs/deployment-retention)).

#### Copies kept outside Neon

Neon describes `pg_dump` exports for "business continuity, disaster recovery, or compliance". `pg_dump` is Postgres's standard tool for writing a database to a file. Neon publishes a two-part guide for a nightly `pg_dump` to an AWS S3 bucket run by GitHub Actions, with a retention policy. It warns to use the unpooled (direct) connection string, not the pooled one ([Backup strategies](https://neon.com/docs/postgres/backup-restore/backups); [Automate pg_dump backups](https://neon.com/docs/manage/backup-pg-dump-automate)).

If that job runs on GitHub Actions:

- Scheduled workflows run only from the repository's default branch ([GitHub: events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)).
- On public repositories, GitHub disables them after 60 days without repository activity. This repository is private, so that rule doesn't apply.
- A GitHub Free account includes 2,000 Actions minutes a month for private repositories ([GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)).

#### How media is backed up in the two likely stores

The [App framework and content back end](../issues/04-framework-and-content-back-end.md) ticket decides where media lives. What each store offers:

| | Vercel Blob | Neon Object Storage |
| --- | --- | --- |
| What it is | Vercel's file store, built on Amazon S3 ([Vercel Blob](https://vercel.com/docs/vercel-blob)) | File storage inside the Neon project, reached through an S3-style API ([Object Storage overview](https://neon.com/docs/storage/overview)) |
| Durability | 99.999999999% durability and 99.99% availability, inherited from S3 | Not stated as a figure on the pages read |
| Versioning or undelete | None documented. `vercel blob empty-store` "is permanent and cannot be undone", and overwriting needs an explicit `allowOverwrite` option ([Vercel Blob](https://vercel.com/docs/vercel-blob); [Vercel CLI: blob](https://vercel.com/docs/cli/blob)) | "Versioning stored but not enforced" and "lifecycle rules stored but not enforced". `DeleteObject` "soft-deletes the object on the current branch", but no undelete or restore of a soft-deleted object is documented ([S3 compatibility](https://neon.com/docs/storage/s3-compatibility)) |
| Covered by the database restore? | No (separate product) | No: "a database restore does not revert its contents" ([Instant restore](https://neon.com/docs/postgres/backup-restore/branch-restore)) |
| Branching | No | Each Neon branch sees the parent's files as of the moment it was made, copy-on-write. Changes on a child branch don't affect the parent ([Buckets](https://neon.com/docs/storage/buckets)). "Reset from parent" now also rolls back a branch's files, in Ohio and Frankfurt only ([Neon changelog 2026-09-25](https://neon.com/docs/changelog/2026-09-25)) |
| Tools for making your own copy | CLI `list`, `get`, `copy`. Listing and copying are billed "advanced operations" ($5 per million) ([Vercel CLI: blob](https://vercel.com/docs/cli/blob); [Vercel pricing](https://vercel.com/pricing)) | Any S3 tool (AWS CLI, AWS SDKs) pointed at the branch's endpoint ([Object Storage overview](https://neon.com/docs/storage/overview)) |
| Regions | 19 regions, chosen when the store is created and fixed afterwards ([Vercel Blob](https://vercel.com/docs/vercel-blob)) | 4 regions: N. Virginia, Ohio, Frankfurt, Singapore ([Regions](https://neon.com/docs/introduction/regions)) |
| Maturity | Established product | Generally available since mid-September 2026, after a beta ([Neon changelog 2026-09-25](https://neon.com/docs/changelog/2026-09-25); [Neon backend beta post](https://neon.com/blog/neon-backend-is-beta)) |

Neither store gives a point-in-time media restore. The current site has 71 media files of about 37 MB, so a scheduled copy of every file to a second place costs almost nothing in storage or operations. Neon's GitHub Actions + S3 pattern for `pg_dump` would extend to media. That is an inference from the tools listed, not a documented Vercel or Neon feature.

#### What a tested restore would look like

These steps are assembled from the documented features above. Picking the drill is left to the map's "Not yet specified" section.

1. **Before:** note row counts or checksums for the content tables, and the list of media files.
2. **Database, point in time.** Use Time Travel Assist to query the state at a chosen moment. Then run instant restore, or, to avoid touching production, restore a snapshot multi-step into a new branch. Inspect the restored branch, finalize or discard it, and record how long each step took ([Instant restore](https://neon.com/docs/postgres/backup-restore/branch-restore); [Backup & restore](https://neon.com/docs/guides/backup-restore)).
3. **Database, from the outside copy.** Load the latest `pg_dump` file into a fresh Neon project or branch with `pg_restore`, and compare it with step 1 ([Backups with pg_dump](https://neon.com/docs/manage/backup-pg-dump)).
4. **Media.** Delete a test file and put it back from the second copy.
5. **Site.** Point a preview deployment at the restored branch and check that pages render. Static pages that Vercel already generated won't show restored data until they are rebuilt or revalidated. That is an inference from how cached pages work, to confirm during the drill.
6. **Clean up.** Delete the drill branches. Restore backup branches and preview branches count toward Launch's 10 included branches; extra ones cost $1.50 per branch-month ([Neon plans](https://neon.com/docs/introduction/plans)). (corrected on verification: not every drill branch can be deleted. When a root branch is restored *from another branch*, the backup branch it leaves (the original root) cannot be deleted, and nor can a backup branch with children; its databases can only be dropped to free storage. Backup branches from restoring a branch to its own history can be deleted. A drill that uses "restore from another branch" on production therefore leaves a permanent extra branch ([Instant restore: deleting backup branches](https://neon.com/docs/postgres/backup-restore/branch-restore#deleting-backup-branches)).)

### Environments

#### Vercel's environments

Vercel has three built-in environments: **Local** (Development), **Preview** and **Production** ([Environments](https://vercel.com/docs/deployments/environments)).

- **Production:** a push to the production branch (usually `main`) creates a production deployment.
- **Preview:** a push to any other branch creates a preview deployment with its own URL.
- **Custom environments** (for example `staging`) are Pro features. One is included per project; more cost $50 a month for each pack of five, up to 16 per project ([Pricing on Vercel](https://vercel.com/docs/pricing)).

Previews can be kept private with **Deployment Protection**:

- "Standard Protection" covers every URL except the production domains and is available on all plans ([Deployment Protection](https://vercel.com/docs/deployment-protection)).
- With the "Vercel Authentication" method, visitors must log in to Vercel as a team or project member, or hold a shareable link ([Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication)).
- Pro adds unlimited free read-only "Viewer" seats, so reviewers can open protected previews without a paid seat ([Pro plan](https://vercel.com/docs/plans/pro-plan)).
- Password protection is a $20 per project per month add-on.

#### Pairing preview deploys with Neon branches

Neon offers three ways to connect a Vercel project ([Integrating Neon with Vercel](https://neon.com/docs/guides/vercel-overview)):

| | Vercel-Managed integration | Neon-Managed integration | Manual connection |
| --- | --- | --- | --- |
| How it's installed | Vercel Marketplace, "Native Integration" | Vercel Marketplace, "Connectable Account" | You copy connection strings into environment variables |
| Who bills for Neon | Vercel, on its invoice | Neon | Neon |
| A database branch per preview | Yes | Yes | No (build it yourself in CI) |
| When preview branches are deleted | When the last Vercel deployment for that Git branch is deleted, which follows Vercel's retention policy and can take months (corrected on verification: or never. Vercel's retention exceptions keep the last 10 deployments and the last 20 ready preview deployments, so on a low-activity project like this one Neon says preview branches may never be deleted automatically, and calls the GitHub Action below "the reliable path") | When the Git branch is gone, checked at the next preview deployment (corrected on verification: only when the "Automatically delete obsolete Neon branches" option is switched on at setup; Neon recommends it, but it is an option, and nothing is cleaned up while no new previews are deployed) | n/a |
| Neon's own project transfer | Not allowed | Allowed after disconnecting the integration | Allowed |

How the paired branches behave ([Neon-Managed integration](https://neon.com/docs/guides/neon-managed-vercel-integration); [Vercel-Managed integration](https://neon.com/docs/guides/vercel-managed-integration); [Preview branch cleanup](https://neon.com/docs/guides/vercel-branch-cleanup)):

- **Per preview.** Each preview deployment gets a Neon branch named `preview/<git-branch>`, copied from the project's default branch. Its `DATABASE_URL` and related variables are injected for that deployment only.
  - Database structure changes (migrations) run as part of the Vercel build command.
  - With the Vercel-Managed integration, those per-preview variables can't be seen in Vercel's settings.
- **The copies hold real data.** A preview branch starts as a copy of production data. If Neon's managed login is enabled, it is "automatically provisioned on preview branches too" with its own copy of users and sessions. Previews therefore contain live content and Content editor accounts, which is a reason to keep previews behind Deployment Protection.
- **Cleanup.** Neon recommends a GitHub Action that deletes the `preview/…` branch when a pull request closes; it works with both integrations. Branches older than 14 days that have been inactive for 24 hours are archived to cheaper storage but still count toward the branch limit.
- **Constraints.** Each Neon project connects to exactly one Vercel project, and the two integrations can't be mixed in one Vercel project.

#### Production

Production deployments use the fixed "production branch" chosen in the integration. While the integration is connected, that branch can't be deleted ([Neon-Managed integration](https://neon.com/docs/guides/neon-managed-vercel-integration)). Neon's Launch plan adds **protected branches**, a safeguard for critical branches ([Neon plans](https://neon.com/docs/introduction/plans)). A Neon project's region is fixed when it is created ([Regions](https://neon.com/docs/introduction/regions)).

#### How secrets are kept

- **Vercel environment variables.** Encrypted at rest. Each one is either **Config** (stays readable to members with access) or **Secret** (write-only after saving; redacted from build logs when 32 characters or longer). A change applies only to new deployments, never to ones already built. Preview variables can be overridden per Git branch ([Environment variables](https://vercel.com/docs/environment-variables); [Config and Secret environment variables](https://vercel.com/docs/environment-variables/sensitive-environment-variables)).
  - The old "Enforce Sensitive Environment Variables" team policy is deprecated. A team Owner can now turn on "Separate Production Secret Values".
  - Limits: 1,000 variables per environment, 64 KB in total per deployment ([Limits](https://vercel.com/docs/limits)).
- **Database password rotation.** With the Neon-Managed integration, rotating the database role's password in Neon syncs the new credentials to Vercel automatically ([Neon-Managed integration](https://neon.com/docs/guides/neon-managed-vercel-integration)).
- **CI keys.** Jobs such as backups or branch cleanup need a Neon API key stored as a CI secret. Neon distinguishes personal keys from **organisation keys** and **project-scoped organisation keys**; the latter give Editor access to a single project ([Organizations API](https://neon.com/docs/manage/orgs-api)). A personal key belongs to the developer's account, which matters at handover.

### Editor login and email

The content back end, and with it the editor login, is chosen in the [App framework and content back end](../issues/04-framework-and-content-back-end.md) ticket. Whatever it is, invite and password-reset emails need three things.

**1. An email-sending service.** Vercel doesn't send application email. The options documented:

- **Neon's managed login (Managed Better Auth).**
  - It sends verification codes, magic links and password-reset emails from a shared address, `auth@mail.myneon.app`. Neon calls that "suitable for development and testing", "rate-limited", and unable to send verification *links*. It recommends your own SMTP server (the standard protocol for handing email to a mail server) for production ([Auth production checklist](https://neon.com/docs/auth/production-checklist)).
  - Custom SMTP changes the sender but keeps Neon's templates. Fully branded emails need a webhook to your own sending code ([Customize emails](https://neon.com/docs/auth/guides/customize-emails)).
  - Invitations go through its "Organization" plugin, which is only partly supported. It fires an `organization.invitation.created` webhook for "custom invitation emails" ([Webhooks](https://neon.com/docs/auth/guides/webhooks); [Roadmap](https://neon.com/docs/auth/roadmap)).
  - **Two-factor login ("MFA support") is listed as "coming soon"**, not available ([Roadmap](https://neon.com/docs/auth/roadmap)). The map's open item on editor two-factor depends on this.
  - Auth is included on Launch up to 1 million monthly active users ([Neon pricing](https://neon.com/pricing)).
- **A CMS with its own login (for example Payload, a ticket 04 candidate).** Payload needs an email adapter, either Resend or Nodemailer/SMTP. Without one, Payload warns at startup that "Email will be written to console", and "any `sendEmail` call will simply log the To address and subject" ([Payload source, via context7](https://github.com/payloadcms/payload/blob/main/packages/payload/src/index.ts); [Payload v3 migration guide](https://github.com/payloadcms/payload/blob/main/docs/migration-guide/v3.mdx); [Payload email docs](https://github.com/payloadcms/payload/blob/main/docs/email/overview.mdx)).
- **A transactional email provider**, used by either of the above. Resend is one example; its Free plan covers 3,000 emails a month, 100 a day and 3 domains, and Pro is $20 a month for 50,000 ([Resend pricing](https://resend.com/pricing)). A handful of Content editors stays far inside the free tier.

**2. A verified sending domain.** The provider checks with DNS records (SPF and DKIM, plus optional DMARC) on care4mind.org; DNS is the internet's address book for a domain. Resend recommends sending from a subdomain such as `updates.example.com` to keep its reputation separate ([Resend: verified domains](https://resend.com/docs/dashboard/domains/introduction)). Adding records must leave the domain's existing email (MX) records alone, which the map already notes for launch.

**3. Allowed return addresses.** For Neon's login, the production domain must be added as a "trusted domain" so links in emails can return to the site, and "Allow Localhost" switched off ([Auth production checklist](https://neon.com/docs/auth/production-checklist)).

### Handover (FR-09)

#### Moving the Vercel project

There are two documented routes.

**Route 1: Project transfer.** This moves the project to another team "with zero downtime" ([Transferring a project](https://vercel.com/docs/projects/overview/transferring-projects)).

- **Who can do it.** You must be an Owner of the source team and a member of the target team. Alternatively, the REST API creates a transfer request whose code, or claim URL (`vercel.com/claim-deployment?code=…`), the other team accepts within 24 hours ([Create project transfer request](https://vercel.com/docs/rest-api/projects/create-project-transfer-request); [Accept project transfer request](https://vercel.com/docs/rest-api/projects/accept-project-transfer-request)).
- **Prerequisite.** The target team needs a valid payment method first.
- **What moves:** deployments, environment variables (except those written in `vercel.json`), configuration, domains and aliases, the Git repository link, security settings, cron jobs, Web Analytics and Speed Insights.
- **What doesn't move:**
  - integrations, which "must be added again"
  - Vercel Blob and Global Config stores, which have a separate transfer
  - logs, monitoring data and log drains
  - usage, which is reset
- **Domains.** A project's apex domain moves to the target team. A subdomain is only *delegated*, so the root domain stays with the original team.
- **Blob stores** move with Storage → Settings → Transfer Store to "a destination account or team" ([Vercel storage](https://vercel.com/docs/storage)).
- **Marketplace resources:**
  - Transferring a single Marketplace resource (such as a Vercel-Managed Neon database) requires being "an Owner or Member on both the source and destination teams". The destination must already have the integration installed, and all projects must be disconnected first ([Native integrations](https://vercel.com/docs/integrations/install-an-integration/product-integration)).
  - Moving a whole integration installation has the same disconnect rule. "New deployments fail until you reconnect the projects", though production keeps running ([Transferring an integration](https://vercel.com/docs/integrations/install-an-integration/transferring-an-integration)).
  - Connectable Accounts, which is what the Neon-Managed integration is, "cannot use this flow".

**Route 2: Hand over the whole team.** If the site lives in its own Vercel team, the developer can make the client an **Owner**, then demote or remove themselves. Owner changes aren't allowed during a Pro trial, and the last Owner can't leave ([Vercel KB: transfer team ownership](https://vercel.com/kb/guide/how-do-i-transfer-ownership-of-a-vercel-team)). The KB doesn't say how the payment method changes hands (see Gaps). A separate Pro team costs its own $20 a month during the build ([Pro plan](https://vercel.com/docs/plans/pro-plan)).

#### Moving the Neon project

- **Neon-Managed or manual connection.** "Transferring a project does not change its credentials or connection string" ([Transfer projects](https://neon.com/docs/manage/orgs-project-transfer)). The steps:
  - A **claim link**, valid 24 hours (corrected on verification: Neon says the link "expires after 24 hours by default"), hands the project to a different Neon account, which picks one of its organisations.
  - Integrations (GitHub, Vercel) must be **disconnected first**; the client then reconnects Neon to their own Vercel project.
  - The destination organisation's plan must be the **same tier or higher**, so a project built on Launch can't move to Free.
  - The developer needs the Admin role in the source organisation.
- **Vercel-Managed.**
  - The Neon project sits in an organisation named `Vercel: <team>` that only Vercel controls. "Projects can't be transferred into or out of Vercel-managed organizations", even after removing integrations ([Transfer projects](https://neon.com/docs/manage/orgs-project-transfer)).
  - Instead, Neon says that when "you transfer a Vercel project to another team, the linked Neon project automatically moves to the new team's Neon organization", prompting an upgrade if the destination plan is lower ([Vercel-Managed integration](https://neon.com/docs/guides/vercel-managed-integration)). Vercel's own transfer page says integrations are not transferred; see Gaps.
  - Membership mirrors the Vercel team, and most Vercel roles become Neon Admins.
  - Vercel's spend limits don't cover Marketplace charges ([Spend management](https://vercel.com/docs/spend-management)).
- **Whole-organisation handover.** A Neon organisation's billing is Admin-only. An Admin can invite the client as Admin and then leave; the only Admin can't leave. Admins can also require two-factor login for everyone in the organisation ([Manage organizations](https://neon.com/docs/manage/orgs-manage)).

#### What stays tied to the developer unless moved deliberately

- **The Git repository.** It sits on the developer's personal GitHub account and is private. Vercel's Git connection needs the person connecting to be the repository Owner (personal repositories), or a Member of the owning GitHub organisation with access to the repository; outside collaborators can't connect it ([Vercel for GitHub](https://vercel.com/docs/git/vercel-for-github)). Moving the repository is part of FR-09.
- **Personal API keys and tokens** used in CI: Neon personal keys, Vercel access tokens. Neon organisation keys survive a change of people ([Organizations API](https://neon.com/docs/manage/orgs-api)).
- **Accounts outside Vercel and Neon** created for the build: the email provider, any OAuth apps for social login ([Auth production checklist](https://neon.com/docs/auth/production-checklist)), and the S3 bucket or other place that holds outside backups.
- **Alert recipients.** Spend notifications and alerts go to whoever set them up.
- **History.** Runtime and build logs don't transfer with a Vercel project ([Transferring a project](https://vercel.com/docs/projects/overview/transferring-projects)).

#### Attaching the domain on Vercel

- **Steps.** Add the domain under the project's Settings → Domains, then set DNS at the domain's current DNS host ([Add a domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain)):
  - the **apex** (`care4mind.org`): an **A record**. Vercel's KB gives `76.76.21.21` "or your domain card's value"; the dashboard shows the exact value ([Vercel KB: A records](https://vercel.com/kb/guide/a-record-and-caa-with-vercel)).
  - **subdomains** such as `www`: a **CNAME** to a project-specific target like `d1d4fc829fe7bc7c.vercel-dns-017.com`.
- **Nameservers.** Moving the whole domain's DNS to Vercel is optional. Vercel warns to copy MX (email) and TXT records across first, and notes that changing only the website's A or CNAME record "does not require moving the rest of your DNS records".
- **Verification.** If the domain is in use by another Vercel account or team, Vercel asks for a TXT record at `_vercel.care4mind.org` to prove access.
- **www and apex.** When both are added, a redirect from one to the other is set in the Domains settings ([Set up a custom domain](https://vercel.com/docs/domains/set-up-custom-domain)).

### Cost

#### Which plans the client would take over

- **Vercel Pro.**
  - $20 a month, including one paid seat that can deploy and $20 of usage credit; unused credit expires at month end ([Pro plan](https://vercel.com/docs/plans/pro-plan)).
  - Each extra Owner or Member seat is $20 a month; Viewer seats are free. Content editors log in to the site's own editing screens, not to Vercel, so they need no Vercel seat. That is an inference from the roles described.
  - **Hobby is ruled out.** Vercel's fair-use terms count "receiving payment to create, update, or host the site" as commercial use, which Hobby forbids ([Fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)).
- **Neon Launch.** Pay-as-you-go with no minimum; "invoices under $0.50 are not collected" ([Neon plans](https://neon.com/docs/introduction/plans)). Free lacks scheduled snapshots and keeps only 6 hours of history, and Neon won't transfer a project from a Launch organisation into a Free one ([Transfer projects](https://neon.com/docs/manage/orgs-project-transfer)).

#### Rates that matter for this site

| Item | Rate | Source |
| --- | --- | --- |
| Vercel CDN requests and data transfer | Pro includes the lowest Flat Rate CDN tier: 1 million requests and 1 TB a month. Above that, the next cycle moves to $20/month (10 million requests) | [Flat Rate CDN](https://vercel.com/docs/pricing/flat-rate-cdn) |
| Vercel functions | Active CPU from $0.128/hour, memory from $0.0106/GB-hour, $0.60 per million invocations | [Vercel pricing](https://vercel.com/pricing) |
| Vercel builds | Elastic build machines (default for new Pro teams) bill from $0.0035 per CPU-minute. A 3-minute build on 4 vCPUs is 12 CPU-minutes, about $0.04 | [Managing builds](https://vercel.com/docs/builds/managing-builds) |
| Vercel Deployment Storage | $0.10 per GB-month for kept build output, which follows the retention policy | [Deployment storage](https://vercel.com/docs/deployment-storage) |
| Vercel Image Optimization | Transformations from $0.05 per 1,000 | [Vercel pricing](https://vercel.com/pricing) |
| Vercel Blob | $0.023/GB-month storage; data transfer is covered by Flat Rate CDN | [Vercel pricing](https://vercel.com/pricing) |
| Vercel Web Analytics | $0.03 per 1,000 events on Pro, with none included | [Web Analytics pricing](https://vercel.com/docs/analytics/limits-and-pricing) |
| Neon compute | $0.106 per CU-hour on Launch. A CU (compute unit) is about 4 GB of RAM plus CPU; the smallest size is 0.25 CU. No charge while scaled to zero, which happens after 5 idle minutes | [Neon plans](https://neon.com/docs/introduction/plans) |
| Neon storage, history, snapshots | $0.35, $0.20 and $0.09 per GB-month respectively | [Neon pricing](https://neon.com/pricing) |
| Neon branches | 10 per project included on Launch, then $1.50 per branch-month | [Neon plans](https://neon.com/docs/introduction/plans) |
| Neon Object Storage | $0.023/GB-month, no per-operation charge | [Neon plans](https://neon.com/docs/introduction/plans) |

#### Expected monthly cost

**Assumptions** (not measured):

- the database stays under 1 GB;
- media stays around 40 MB;
- around 20,000 page views a month;
- about 60 builds a month;
- a 7-day history window and daily snapshots;
- pages are mostly pre-built, so the database is woken mainly by editing, builds and backups.

| Line | Low | If the database never sleeps |
| --- | --- | --- |
| Vercel Pro platform fee (1 deploying seat) | $20.00 | $20.00 |
| Vercel usage (builds ≈ $2.50, analytics ≈ $0.60, storage and functions small) | inside the $20 credit | inside the $20 credit |
| Neon compute (0.25 CU: 60 h/month vs 730 h/month) | $1.59 | $19.35 |
| Neon storage, history and snapshots (under 1 GB each) | ≈ $0.50 | ≈ $0.50 |
| Email (free tier) | $0 | $0 |
| **Total before tax** | **≈ $22** | **≈ $40** |

A middle case of about 8 awake hours a day puts Neon near $7 and the total near $27. Vercel and Neon prices exclude tax, which depends on the billing address ([Pro plan](https://vercel.com/docs/plans/pro-plan)). The domain's registration stays with the client's registrar and isn't counted.

#### What pushes it up

- **Vercel seats.** $20 a month for each extra deploying seat, for example if the developer stays on the client's team as a Member.
- **Vercel add-ons:**
  - Speed Insights Plus: $10 per project per month, plus $0.65 per 10,000 events
  - Web Analytics Plus: $10 a month
  - Password Protection: $20 per project per month
  - Observability Plus: $1.20 per million events

  ([Pro plan](https://vercel.com/docs/plans/pro-plan))
- **Vercel usage past the $20 credit:**
  - pages rendered on every request instead of pre-built, which adds function CPU and invocations
  - many builds
  - long deployment retention, which adds Deployment Storage
  - heavy crawler or bot traffic
  - outgrowing the 1-million-request CDN tier (added on verification: every request to Vercel counts as a CDN request, including scripts, styles, fonts, optimised images and prefetches, not just page views ([Vercel pricing FAQ](https://vercel.com/pricing)). At the assumed 20,000 page views, the site stays inside the tier only while an average page view makes fewer than 50 requests to Vercel that the browser hasn't cached. An asset-heavy, highly interactive front end could approach that. Going over moves the next cycle to the $20 tier)
- **Neon compute that never sleeps:**
  - turning scale-to-zero off
  - uptime monitors, cron jobs or per-request database queries that keep it awake
  - a larger autoscaling maximum
- **Neon storage and branches:**
  - many preview or backup branches over the 10 included
  - a longer history window on a write-heavy database
  - manual snapshots that never expire

  ([Neon pricing](https://neon.com/pricing))
- **Email** past 100 a day or 3,000 a month on Resend's free tier ([Resend pricing](https://resend.com/pricing)).

#### Spend controls

- **Vercel.**
  - New teams get a $200 on-demand spend notification by default.
  - Spend Management can email at 50, 75 and 100%, call a webhook, or pause all production deployments, which then return a 503 error. Checks run every few minutes, so a pause can lag ([Spend management](https://vercel.com/docs/spend-management)).
  - Seats, add-ons and Marketplace integrations are not covered.
- **Neon.**
  - Launch has spending notifications at 80% and 100% of a threshold.
  - A cap on the autoscaling size is the hard ceiling on compute spend ([Neon plans](https://neon.com/docs/introduction/plans); [Neon pricing](https://neon.com/pricing)).

### Analytics

#### What Vercel Web Analytics records

**What each data point holds** ([Web Analytics privacy](https://vercel.com/docs/analytics/privacy-policy)):

- timestamp
- URL and the route pattern (dynamic path)
- referrer
- filtered query parameters
- geolocation (country, region, city)
- operating system and browser, with versions
- device type
- script version

**How visitors are counted:**

- No cookies. A visitor is "identified by a hash created from the incoming request" that "is valid for a single day" and then reset, so visitors "can't be tracked between different days or different websites" ([Web Analytics](https://vercel.com/docs/analytics)).
- Vercel says data points are anonymous and not tied to any individual or IP address.
- URLs that might contain personal data can be redacted with a `beforeSend` function.

**On Pro** ([Web Analytics pricing](https://vercel.com/docs/analytics/limits-and-pricing)):

- custom events with up to 2 properties, which [Findability and analytics](../issues/25-findability-and-analytics.md) could use for Questionnaire starts and completions
- a 12-month reporting window (24 with Web Analytics Plus)
- billing per event

#### What Vercel Speed Insights records

**What each data point holds** ([Speed Insights privacy](https://vercel.com/docs/speed-insights/privacy-policy)):

- route and URL
- network speed
- browser
- device type and operating system
- country
- the Web Vital measured, and which page element it came from
- SDK version
- time received

Vercel says the data can't reconstruct a browsing session or identify a user.

**Free tier versus Plus** ([Speed Insights pricing](https://vercel.com/docs/speed-insights/limits-and-pricing)):

- The free tier gives 10,000 events per rolling 30 days per team, and shows only the **Real Experience Score** summary.
- When the free limit is reached, collection pauses for at least 14 days.
- The individual Core Web Vitals (FCP, LCP, INP, CLS, TTFB) and full breakdowns need **Speed Insights Plus**. NFR-02 targets LCP, INP and CLS directly.
- (corrected on verification: Plus is **$10 per project per month plus $0.65 per 10,000 events**, and Pro includes no Plus events ([Speed Insights pricing](https://vercel.com/docs/speed-insights/limits-and-pricing)).) Vercel says "up to 6 data points can be potentially tracked per visit", 3–6 on average, collected on hard navigations; in a Next.js app that is only the first page view of a session ([Speed Insights metrics](https://vercel.com/docs/speed-insights/metrics)). At the assumed 20,000 page views, that is likely 30,000–120,000 events a month, depending on how many page views are hard navigations. The free tier's 10,000 events would then run out and pause collection, unless `sampleRate` is lowered to about 0.1–0.3. Plus would cost roughly $12–18 a month. These figures are estimates from the stated rates, not measurements.

#### Does either need a consent banner?

- **Vercel's position.** Vercel describes Web Analytics as "designed … to align with leading data protection authority guidance" and cookie-free ([Web Analytics privacy](https://vercel.com/docs/analytics/privacy-policy)). Neither Vercel page says a banner is or isn't needed.
- **EU rule.** For visitors in the EU, Article 5(3) of the ePrivacy Directive requires consent, or a listed exemption, for "the storing of information, or the gaining of access to information already stored" on a visitor's device. The European Data Protection Board's Guidelines 2/2023 (final, 7 October 2024) say this covers "JavaScript code, where the accessing entity instructs the browser of the user to send asynchronous requests with the targeted information", not only cookies. The Board leaves the exemptions to a case-by-case review under each country's own law ([EDPB Guidelines 2/2023 v2.0](https://www.edpb.europa.eu/system/files/documents/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf)).
- **India.** If the client is in India, the Digital Personal Data Protection Act 2023 applies to "personal data", meaning data about an identifiable individual ([DPDP Act 2023](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf)). Its core obligations (sections 3–5 and most of 6) take effect 18 months after 13 November 2025 ([DPDP Act on India Code, with commencement notes](https://indiacode.gov.in/server/api/core/bitstreams/52f9ecbb-b927-4ba6-ae6f-ca2fac50d4df/content); [DPDP Rules 2025](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)). That is about 13 May 2027.
- **Who decides.** The project brief doesn't record where the client is, and legal advice on privacy is out of scope for the map. The question goes to the client's advisers with these facts.

### Redirects

| Method | Limit | Status codes | Source |
| --- | --- | --- | --- |
| `redirects` in `vercel.json` | 2,048 redirects; `source` and `destination` up to 4,096 characters each. Each redirect, rewrite or header also counts toward 2,048 "routes created per deployment", and frameworks add routes of their own | `permanent: true` gives 308. `statusCode` can be set to 301, 302, 303, 307 or 308 | [Configuration redirects](https://vercel.com/docs/routing/redirects/configuration-redirects); [Limits](https://vercel.com/docs/limits); [vercel.json reference](https://vercel.com/docs/project-configuration/vercel-json) |
| Next.js `redirects` in `next.config` (if Next.js is chosen) | Next.js docs say Vercel's limit is 1,024, which conflicts with Vercel's 2,048 | `permanent` gives 307 or 308. The Next.js source also accepts a `statusCode` of 301 (corrected on verification: this is documented as well, not only in the source. The Next.js `redirects` reference says `statusCode` can be used "instead of the `permanent` property, but not both") | [Next.js redirecting guide, via context7](https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/redirecting.mdx); [Next.js redirect-status source](https://github.com/vercel/next.js/blob/canary/packages/next/src/lib/redirect-status.ts) |
| Bulk redirects (Pro and Enterprise) | 1,000 per project included; extra capacity in packs of 25,000; at most 1,000,000 per project. No wildcards or header matching. Editable at runtime without redeploying; processed before every other route | 301, 302, 303, 307 or 308 | [Bulk redirects](https://vercel.com/docs/routing/redirects/bulk-redirects); [Vercel pricing](https://vercel.com/pricing) |
| Routing Middleware (code run before each matching request), optionally reading a Global Config store | No count limit stated. It runs code on every matched request, which "adds latency and cost", and Vercel recommends static rules when no code is needed | Any | [Redirects](https://vercel.com/docs/routing/redirects); [Routing Middleware](https://vercel.com/docs/routing-middleware) |
| Domain redirects (for example `www` to the apex) | Set in Domains settings | Permanent | [Redirects](https://vercel.com/docs/routing/redirects) |

FR-07 covers the 43 sitemap URLs, 71 media files and the feed, about 115 URLs, so every method fits.

- **301 versus 308.** FR-07 asks for a **301**, but Vercel's and Next.js's default "permanent" redirect is a 308. A 301 has to be requested explicitly with `statusCode: 301`.
- **URL normalisation.** Vercel's CDN rewrites URLs containing double slashes (`//`) with a 308 before any redirect rules run. That matters when testing old URLs ([Redirects](https://vercel.com/docs/routing/redirects)).

## Gaps and uncertainties

- **Vercel-Managed Neon at handover.** Neon's docs say a Vercel project transfer carries the linked Neon project to the new team's organisation. Vercel's project-transfer page says integrations are not transferred. Vercel's resource-transfer page requires membership of both teams. Untested; only a trial transfer would settle it. (added on verification: the response of Vercel's "Accept project transfer request" API includes `partnerCalls` (integration installation and resource IDs), `resourceTransferErrors` and `transferredStoreIds`. That suggests the claim-code route does try to move Marketplace resources and stores with the project, which fits Neon's account, but no Vercel page says so in prose ([Accept project transfer request](https://vercel.com/docs/rest-api/projects/accept-project-transfer-request)).)
- **Blob store transfer to a team the developer doesn't belong to.** The docs describe "Transfer Store" for moving between one's own plans and teams. They don't say whether the target can be a team the developer isn't on.
- **Payment method at a Vercel team-ownership handover.** The KB article doesn't cover it.
- **Neon claim links and plan tiers.** It isn't stated whether the "same tier or higher" rule applies to claim links as well as organisation-to-organisation transfers. Assume it does.
- **Neon Object Storage recovery.** Not documented:
  - whether a soft-deleted object can be recovered on a root branch;
  - whether snapshots include Object Storage;
  - whether a child branch keeps files the parent deletes after the fork. Copy-on-write suggests yes, but no page says so.

  Neon publishes no durability figure for Object Storage on the pages read.
- **Price conflicts:**
  - Bulk-redirect extra capacity: Vercel's pricing page says "$50 / month per 25K redirects", while two docs pages say "$0.002/month per additional 25,000". (corrected on verification: the Bulk redirects page, last updated 21 September 2026, now also says "$50/month per additional 25,000". Only the "Pricing on Vercel" docs page still says $0.002, so $50 is the likely price.) Irrelevant at this site's size.
  - Next.js's docs give Vercel's redirect limit as 1,024; Vercel's own docs give 2,048.
- **Neon prices through the Vercel Marketplace.** The Neon listing on Vercel says only "Plans starting at $0" and links to Neon's pricing; it isn't confirmed that the rates are identical.
- **The cost estimate is assumption-based.** Builds, function use, Deployment Storage and Neon awake-hours depend on the framework and rendering choices (tickets 04 and 23) and on real traffic. The rate rows are verified; the totals are not. Neon's shared email sender's rate limit is not quantified.
- **Consent banner.** The client's location and audience aren't recorded, and only the EU and Indian texts were read. National EU exemptions, such as audience-measurement exemptions, weren't researched.
- **Not chased:**
  - Resend's availability on the Vercel Marketplace
  - GitHub's repository-transfer mechanics
  - Vercel function-region versus Neon-region latency (Neon's nearest region to India is Singapore)

## Verification

An independent check on 2026-10-26, against live primary sources: Neon's documentation server, Vercel's docs and pricing pages (fetched directly and through Vercel's documentation search), context7 for Next.js, and the publishers' own pages for the rest. Nothing was created or changed in any Vercel or Neon account.

| # | Claim checked | Source re-read | Outcome |
| --- | --- | --- | --- |
| 1 | Neon history window: Free 6 h (1 GB cap), Launch 1-day default and 7-day maximum, Scale 30 days; $0.20/GB-month; one project-wide setting | [History window](https://neon.com/docs/postgres/backup-restore/history-window); [Neon plans](https://neon.com/docs/introduction/plans) | Confirmed |
| 2 | Snapshots: 1/100/100 manual; scheduled only on paid plans, kept 35 days by default and at most, latest kept while a schedule is active, outside the 100 limit; $0.09/GB-month; full then incremental billing; one-step and multi-step restore; the two limitations | [Backup & restore](https://neon.com/docs/guides/backup-restore) | Confirmed |
| 3 | Instant restore: root branches only, full overwrite including `neon_auth`, Object Storage not reverted, `_old_` backup branch, connection details unchanged | [Instant restore](https://neon.com/docs/postgres/backup-restore/branch-restore) | Confirmed. Added that some backup branches can't be deleted (drill step 6) |
| 4 | Neon project transfer: unchanged connection string, claim link, disconnect integrations first, same tier or higher, Admin in source, Vercel-managed organisations excluded even after removing integrations | [Transfer projects](https://neon.com/docs/manage/orgs-project-transfer) | Confirmed. Claim link is 24 h "by default" (wording corrected) |
| 5 | Vercel-Managed integration: billed by Vercel, `preview/<git-branch>` branches, hidden per-preview variables, project moves with a Vercel project transfer, retention-based cleanup | [Vercel-Managed integration](https://neon.com/docs/guides/vercel-managed-integration); [Preview branch cleanup](https://neon.com/docs/guides/vercel-branch-cleanup) | Confirmed. Corrected: cleanup can be never on low-activity projects, because of retention exceptions |
| 6 | Neon-Managed integration: Git-branch cleanup, password-rotation sync, one Neon project per Vercel project, can't mix with Vercel-Managed | [Neon-Managed integration](https://neon.com/docs/guides/neon-managed-vercel-integration) | Confirmed. Corrected: automatic cleanup is an opt-in setting |
| 7 | Vercel Pro: $20 a month with 1 deploying seat and $20 usage credit; extra Owner or Member seats $20; Viewers free; add-on prices; prices exclude tax | [Pro plan](https://vercel.com/docs/plans/pro-plan) (updated 2026-09-15) | Confirmed |
| 8 | Hobby is barred because "receiving payment to create, update, or host the site" is commercial use | [Fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines) | Confirmed |
| 9 | Neon Launch rates: $0.106/CU-hour, 0.25 CU minimum, scale to zero after 5 min, storage $0.35, 10 branches then $1.50/branch-month, no minimum, invoices under $0.50 not collected; Object Storage $0.023/GB-month; Auth up to 1M MAU; spending notifications at 80%/100% | [Neon plans](https://neon.com/docs/introduction/plans) | Confirmed. Cost arithmetic recomputed: $1.59, $19.35, about $6.4 for the middle case, about $0.04 per build. All correct |
| 10 | Flat Rate CDN: Pro includes 1M requests and 1 TB; the next tier is $20 for 10M | [Flat Rate CDN](https://vercel.com/docs/pricing/flat-rate-cdn); [Vercel pricing](https://vercel.com/pricing) | Confirmed. Added that every file request counts, with the 50-requests-per-page-view arithmetic |
| 11 | Web Analytics: no cookies, daily request hash, listed data points; Pro $0.03 per 1,000 events with none included, 12-month window, 2 custom-event properties | [Web Analytics](https://vercel.com/docs/analytics); [privacy](https://vercel.com/docs/analytics/privacy-policy); [pricing](https://vercel.com/docs/analytics/limits-and-pricing) | Confirmed |
| 12 | Speed Insights: free tier of 10,000 events per rolling 30 days, Real Experience Score only, pause of at least 14 days; Plus needed for individual Core Web Vitals | [Speed Insights pricing](https://vercel.com/docs/speed-insights/limits-and-pricing) (updated 2026-09-23); [metrics](https://vercel.com/docs/speed-insights/metrics) | Partly wrong: the Summary gave Plus as $10 a month and left out the $0.65 per 10,000 events. Corrected, with a usage estimate |
| 13 | Redirects: 2,048 in `vercel.json`, 4,096-character strings, 2,048 routes per deployment, `statusCode: 301`; bulk redirects 1,000 included on Pro, 1,000,000 maximum, no wildcards; the Next.js docs still say 1,024 | [Configuration redirects](https://vercel.com/docs/routing/redirects/configuration-redirects); [Limits](https://vercel.com/docs/limits); [Bulk redirects](https://vercel.com/docs/routing/redirects/bulk-redirects); vercel.json reference; Next.js via context7 | Confirmed. The bulk-redirect price conflict is now mostly resolved at $50 (Gaps corrected); Next.js documents `statusCode` (row corrected) |
| 14 | Neon managed login: MFA "Coming soon"; shared sender `auth@mail.myneon.app` for development and testing, rate-limited, no verification links; Organization plugin partial | [Roadmap](https://neon.com/docs/auth/roadmap); [Auth production checklist](https://neon.com/docs/auth/production-checklist) | Confirmed |
| 15 | Resend: Free plan 3,000 emails a month, 100 a day, 3 domains; Pro $20 for 50,000 | [Resend pricing](https://resend.com/pricing) | Confirmed |
| 16 | Vercel project transfer: what moves and what doesn't, owner of source and member of target, payment method on the target, 24-hour claim code; resource and integration transfer rules; team-ownership KB (Pro-trial rule, last Owner, silent on payment method) | [Transferring a project](https://vercel.com/docs/projects/overview/transferring-projects); [Create transfer request](https://vercel.com/docs/rest-api/projects/create-project-transfer-request); [Native integrations](https://vercel.com/docs/integrations/install-an-integration/product-integration); [Transferring an integration](https://vercel.com/docs/integrations/install-an-integration/transferring-an-integration); [KB](https://vercel.com/kb/guide/how-do-i-transfer-ownership-of-a-vercel-team) (updated 2026-10-02) | Confirmed. Added API-response evidence to the Vercel-Managed handover gap |
| 17 | Deployment retention on Pro: production 1 year, previews 180 days; Instant Rollback limited to the previous deployment on Hobby | [Deployment retention](https://vercel.com/docs/deployment-retention); [CLI rollback](https://vercel.com/docs/cli/rollback) | Confirmed |
| 18 | Spend management: 50/75/100% alerts, optional pause returning 503, checks every few minutes; seats, add-ons and Marketplace not covered; the default budget for new Pro teams only notifies | [Spend management](https://vercel.com/docs/spend-management); [Pro plan](https://vercel.com/docs/plans/pro-plan) | Confirmed |
| 19 | Neon Object Storage: generally available in mid-September 2026; 4 regions; versioning and lifecycle rules not enforced; soft delete; reset-from-parent of files in Ohio and Frankfurt only | [Changelog 2026-09-25](https://neon.com/docs/changelog/2026-09-25); [Regions](https://neon.com/docs/introduction/regions); [S3 compatibility](https://neon.com/docs/storage/s3-compatibility) | Confirmed |
| 20 | Vercel Config and Secret variables, 32-character redaction, legacy policy deprecated and replaced | [Config and Secret variables](https://vercel.com/docs/environment-variables/sensitive-environment-variables) | Confirmed |
| 21 | EDPB Guidelines 2/2023 v2.0 adopted 7 October 2024; DPDP core duties 18 months after 13 November 2025 | [EDPB](https://www.edpb.europa.eu/documents/guideline/guidelines-22023-on-technical-scope-of-art-53-of-eprivacy-directive_en); MeitY G.S.R. 843(E) and 846(E) | Confirmed. Some law firms compute 14 May 2027 instead of 13 May; "about" covers both |
| 22 | GitHub Free: 2,000 Actions minutes a month for private repositories; deleted Neon projects recoverable within 7 days | [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions); [Recover a deleted project](https://neon.com/docs/reference/api/projects/recover-project) | Confirmed |

**Effect on the recommendation:** none. The Speed Insights correction adds a likely $12–18 a month only if the client wants the Plus metrics. The cleanup correction strengthens the existing advice to add Neon's GitHub Action for preview branches, whichever integration is chosen. The core estimate (about $22–27, or $40 if the database never sleeps) and the handover advice still stand.

## Sources

All read on 2026-10-26.

**Neon** (read through Neon's documentation server and neon.com):

- [Neon pricing](https://neon.com/pricing)
- [Neon plans](https://neon.com/docs/introduction/plans)
- [History window](https://neon.com/docs/postgres/backup-restore/history-window)
- [Instant restore](https://neon.com/docs/postgres/backup-restore/branch-restore)
- [Backup & restore (snapshots)](https://neon.com/docs/guides/backup-restore)
- [Backup strategies](https://neon.com/docs/postgres/backup-restore/backups)
- [Automate pg_dump backups](https://neon.com/docs/manage/backup-pg-dump-automate)
- [Backups with pg_dump](https://neon.com/docs/manage/backup-pg-dump)
- [Manage projects (recover a deleted project)](https://neon.com/docs/manage/projects)
- [Recover a deleted project API](https://neon.com/docs/reference/api/projects/recover-project)
- [Object Storage overview](https://neon.com/docs/storage/overview)
- [Buckets](https://neon.com/docs/storage/buckets)
- [S3 compatibility](https://neon.com/docs/storage/s3-compatibility)
- [Changelog 2026-09-25](https://neon.com/docs/changelog/2026-09-25)
- [Neon backend beta announcement](https://neon.com/blog/neon-backend-is-beta)
- [Regions](https://neon.com/docs/introduction/regions)
- [Integrating Neon with Vercel](https://neon.com/docs/guides/vercel-overview)
- [Neon-Managed integration](https://neon.com/docs/guides/neon-managed-vercel-integration)
- [Vercel-Managed integration](https://neon.com/docs/guides/vercel-managed-integration)
- [Preview branch cleanup](https://neon.com/docs/guides/vercel-branch-cleanup)
- [Transfer projects](https://neon.com/docs/manage/orgs-project-transfer)
- [Manage organizations](https://neon.com/docs/manage/orgs-manage)
- [Organizations API](https://neon.com/docs/manage/orgs-api)
- [Auth production checklist](https://neon.com/docs/auth/production-checklist)
- [Customize emails](https://neon.com/docs/auth/guides/customize-emails)
- [Auth webhooks](https://neon.com/docs/auth/guides/webhooks)
- [Managed Better Auth roadmap](https://neon.com/docs/auth/roadmap)

**Vercel:**

- [Pricing page](https://vercel.com/pricing)
- [Pro plan](https://vercel.com/docs/plans/pro-plan)
- [Pricing on Vercel](https://vercel.com/docs/pricing)
- [Flat Rate CDN](https://vercel.com/docs/pricing/flat-rate-cdn)
- [Spend management](https://vercel.com/docs/spend-management)
- [Managing builds](https://vercel.com/docs/builds/managing-builds)
- [Deployment storage](https://vercel.com/docs/deployment-storage)
- [Limits](https://vercel.com/docs/limits)
- [Fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
- [Environments](https://vercel.com/docs/deployments/environments)
- [Environment variables](https://vercel.com/docs/environment-variables)
- [Config and Secret environment variables](https://vercel.com/docs/environment-variables/sensitive-environment-variables)
- [Deployment Protection](https://vercel.com/docs/deployment-protection)
- [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication)
- [Deployment retention](https://vercel.com/docs/deployment-retention)
- [Instant Rollback](https://vercel.com/docs/instant-rollback)
- [Vercel Blob](https://vercel.com/docs/vercel-blob)
- [Blob usage and pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing)
- [CLI: blob](https://vercel.com/docs/cli/blob)
- [Storage (transferring a store)](https://vercel.com/docs/storage)
- [Transferring a project](https://vercel.com/docs/projects/overview/transferring-projects)
- [Create project transfer request](https://vercel.com/docs/rest-api/projects/create-project-transfer-request)
- [Accept project transfer request](https://vercel.com/docs/rest-api/projects/accept-project-transfer-request)
- [Native integrations (transfer a resource)](https://vercel.com/docs/integrations/install-an-integration/product-integration)
- [Transferring an integration](https://vercel.com/docs/integrations/install-an-integration/transferring-an-integration)
- [KB: transfer team ownership](https://vercel.com/kb/guide/how-do-i-transfer-ownership-of-a-vercel-team)
- [Vercel for GitHub](https://vercel.com/docs/git/vercel-for-github)
- [Add a domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
- [Set up a custom domain](https://vercel.com/docs/domains/set-up-custom-domain)
- [KB: A records](https://vercel.com/kb/guide/a-record-and-caa-with-vercel)
- [Web Analytics](https://vercel.com/docs/analytics)
- [Web Analytics privacy](https://vercel.com/docs/analytics/privacy-policy)
- [Web Analytics pricing](https://vercel.com/docs/analytics/limits-and-pricing)
- [Speed Insights privacy](https://vercel.com/docs/speed-insights/privacy-policy)
- [Speed Insights pricing](https://vercel.com/docs/speed-insights/limits-and-pricing)
- [Redirects](https://vercel.com/docs/routing/redirects)
- [Configuration redirects](https://vercel.com/docs/routing/redirects/configuration-redirects)
- [Bulk redirects](https://vercel.com/docs/routing/redirects/bulk-redirects)
- [vercel.json reference](https://vercel.com/docs/project-configuration/vercel-json)
- [Routing Middleware](https://vercel.com/docs/routing-middleware)
- [Neon on the Vercel Marketplace](https://vercel.com/marketplace/neon)

**Libraries** (through context7 and their source repositories):

- [Next.js redirecting guide](https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/redirecting.mdx)
- [Next.js redirect-status source](https://github.com/vercel/next.js/blob/canary/packages/next/src/lib/redirect-status.ts)
- [Payload email adapter fallback (source)](https://github.com/payloadcms/payload/blob/main/packages/payload/src/index.ts)
- [Payload email overview](https://github.com/payloadcms/payload/blob/main/docs/email/overview.mdx)
- [Payload v3 migration guide (email adapters)](https://github.com/payloadcms/payload/blob/main/docs/migration-guide/v3.mdx)

**Email:**

- [Resend pricing](https://resend.com/pricing)
- [Resend: verified domains](https://resend.com/docs/dashboard/domains/introduction)

**GitHub:**

- [Events that trigger workflows (schedule)](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)

**Privacy law:**

- [EDPB Guidelines 2/2023, version 2.0](https://www.edpb.europa.eu/system/files/documents/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf)
- [Digital Personal Data Protection Act 2023 (MeitY)](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf)
- [DPDP Act on India Code, with commencement notes](https://indiacode.gov.in/server/api/core/bitstreams/52f9ecbb-b927-4ba6-ae6f-ca2fac50d4df/content)
- [DPDP Rules 2025](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)
