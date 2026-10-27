# Running on Vercel and Neon: backups, environments, handover and costs

Type: research
Mode: AFK
Track: site
Status: resolved
Blocked by: none
Map: [Care4Mind.org rebuild](../map.md)

## Question

What does running this site on Vercel Pro and a paid Neon plan involve? Read docs and pricing only, and create nothing.

- **Backups and restore (FR-08):**
  - Neon's point-in-time restore, snapshots, and how long each plan keeps them.
  - How to restore into a new branch and switch over.
  - How media in the likely storage (Vercel Blob or Neon object storage) is backed up.
  - What a tested restore would look like.
- **Environments:** Vercel preview deploys paired with Neon branches, production, and how secrets are kept.
- **Editor login and email:** what sending invite and password-reset emails needs.
- **Handover (FR-09):**
  - How a Vercel project and a Neon project move to accounts the client owns, and what stays tied to the developer.
  - How the domain is attached on Vercel.
- **Cost:** the expected monthly cost for this site's size, on the plans the client would take over, and what pushes it up. The site has about 40 pages, 71 media files, low traffic and a small editing team.
- **Analytics:** what Vercel Web Analytics and Speed Insights record, and whether either needs a consent banner.
- **Redirects:** the limits on redirects in Vercel config or middleware.

Nobody decides here. The facts feed:

- the [Architecture review](23-architecture-review.md)
- [Findability: page metadata, sitemap, link checks and analytics](25-findability-and-analytics.md)
- the running and handover parts of the map's "Not yet specified" section

## Answer

Researched 2026-10-26. Full findings: [`running-on-vercel-and-neon.md`](https://github.com/SiddharthMuramkar/care4mind/blob/research/running-on-vercel-and-neon/.scratch/rebuild/research/running-on-vercel-and-neon.md) on branch `research/running-on-vercel-and-neon` (pushed, never merged; commit `7c8c62c`).

- Neon can rewind the database up to 7 days on Launch (30 on Scale) and keep snapshots up to 35 days. Media isn't covered by either and needs its own copy.
- Neon's Vercel integration gives each preview deploy its own database copy, including real content and editor logins. Old copies are cleaned up only if that option is switched on. Secrets sit in Vercel's encrypted environment variables.
- Handover: a database bought through Vercel's Marketplace can't use Neon's project transfer. Billing through Neon directly, or a dedicated team and organisation handed over whole, avoids that.
- Cost: about $22–27 a month plus tax (Vercel Pro $20, Neon $2–7), about $40 if the database never sleeps. Speed Insights Plus would add about $12–18. Vercel Hobby is barred because the builder is paid.
- Editor emails need an email service and DNS records on care4mind.org. Neon's managed login has no two-factor yet, and its shared sender is for development only.
- Vercel analytics sets no cookies, but EU guidance still covers scripts that send data, so consent goes to the client's advisers. Redirect limits are ample; FR-07's 301 needs `statusCode: 301`.

**Verified:** 22 claim groups rechecked, all core facts confirmed. Corrections were details (Speed Insights per-event charge, preview-copy cleanup, undeletable restore branches, a stale price note); none changes the cost estimate or the handover advice.

**Gaps** (all listed in the findings): Cost totals rest on assumed traffic, builds and database awake-hours; only unit rates are verified. Neon's and Vercel's docs disagree on whether a Marketplace database moves with a Vercel project transfer (untested). Neon Object Storage's recovery and durability are undocumented. The client's jurisdiction is unrecorded, so only EU and Indian privacy texts were read.
