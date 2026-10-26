---
status: accepted
---

# Build on Vercel and Neon, and drop WordPress

The new site is hosted on Vercel, and its data lives in Neon (hosted Postgres). WordPress goes entirely, including as a content back end. The developer chose this on 2026-10-26, while charting the planning map, and chose not to compare other hosts first. The aim is to build the product now on a stack the developer already pays for (Vercel Pro, plus a paid Neon plan) and the coding agents that write all the code know well. Moving to another provider later stays possible but isn't planned.

## Considered options

- **Keep WordPress as the content back end.** Content editors would keep admin screens they may know, and the brief left this open (open question 1). It would need a second host running PHP and MySQL beside Vercel and Neon, and the rebuild replaces everything else WordPress does.
- **Compare hosts first** (a static host, a container host, a small rented server). The developer ruled this out in favour of building on Vercel and Neon now.

## Consequences

- Content editors lose the WordPress admin screens, which ADR-0001 flagged as a possible consequence. The content back end has to run on Vercel and Neon, and is chosen in the planning map's Architecture review.
- The framework, content back end and search technology are still open. They are settled in a later ADR.
- The site is built under the developer's Vercel and Neon accounts. The projects move to accounts the client owns at handover (FR-09), and the client takes over the bills. The client confirms this through the planning map's question list.
