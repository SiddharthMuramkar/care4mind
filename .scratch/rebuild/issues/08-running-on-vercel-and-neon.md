# Running on Vercel and Neon: backups, environments, handover and costs

Type: research
Mode: AFK
Track: site
Status: open
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
