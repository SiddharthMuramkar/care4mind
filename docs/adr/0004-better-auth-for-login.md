---
status: accepted
---

# Run login inside the site with Better Auth

Users sign up or log in before taking a Questionnaire, and every sign-up and log-in must pass a server-verified bot check, because the old site has 2,945 subscriber accounts of unexplained origin (#333), which the developer attributes to bots. There is no way around the check. So login runs inside the Next.js app on Better Auth, with its data in Neon (ADR-0002). The developer chose this on 2026-11-09. It was the only option looked at that could force the check on both ways in, Google and the emailed code, and it joined Vercel in July 2026.

## Considered options

- **Neon Auth, Neon's managed Better Auth.** The obvious pick beside ADR-0002, with no upkeep for us. It has no captcha plugin, its users can't install plugins, and no hook fires when a returning Google user signs in, so it can't force the check.
- **Clerk.** Its bot protection applies only to sign-ups and never challenges a sign-in.

## Consequences

- Security updates are ours. Twelve Better Auth advisories landed on 2026-11-03. Someone must keep applying them after handover (FR-09), and the Client has to accept that.
- A later upgrade can add a route the bot check misses, so a test lists every auth route and fails on any that is not checked, not switched off and not on a short reviewed list of routes that can't start a sign-in alone.
- Server code must never call Better Auth's sign-in or send-code functions directly, because that skips the check.
- Cloudflare, Google sign-in and an email sender join the accounts handed over.
