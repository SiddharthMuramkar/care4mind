# Care4Mind Login and Bot Protection

## Document data

| Item | Value |
| --- | --- |
| Date | 2026-11-10 |
| Code version | `main` at `5fa9b81` |
| Login status | OFF. `FEATURE_LOGIN=0` in production. |
| Style | ASD-STE100 style. Short sentences. Active voice. |
| Checker | No STE100 checker checked this document. |
| Secrets | This document has no secret values. |

## 1. Purpose

This document explains the login system.
It explains each outside service.
It explains the bot protection.
It explains the current status.
It explains the next human steps.

Read this document before you turn login on.
Do not turn login on from this document alone.
Issue #363 has the full go-live list.

## 2. The system at a glance

A user opens a Care4Mind page.
The browser shows a Sign up form or a Log in form.
The form first does a bot check.
The server then checks the bot check result.
The server then accepts one of two proofs:

- Proof A: Google confirms the user.
- Proof B: Brevo sends a 6-digit code to the user email.

The server then makes a session.
The server stores the session in Neon.
The browser keeps a session cookie for 7 days.

| Step | Part | Task |
| --- | --- | --- |
| 1 | Browser | Shows the form. Runs the Turnstile widget. |
| 2 | Cloudflare | Gives a bot check token. |
| 3 | Vercel server | Checks the token with Cloudflare. |
| 4 | Vercel BotID | Gives a second bot verdict. |
| 5 | Better Auth | Controls sign-up, log-in, and sessions. |
| 6 | Google or Brevo | Confirms the person or the email. |
| 7 | Neon Postgres | Stores users, sessions, and counters. |

## 3. Important correction

> **Cloudflare is not the firewall in this system.**
> Cloudflare only gives the Turnstile bot check.
> The firewall is Vercel Firewall.
> Vercel Firewall is not verified as on today.
> Issue #363 tracks that switch.

Do not change Cloudflare DNS for this site.
Vercel controls the site DNS today.
Cloudflare only needs the Turnstile widget.

## 4. What you set up

### 4.1 Vercel: host and firewall

Vercel hosts the Next.js site.
Vercel runs the server code.
Vercel stores all settings.
Vercel Firewall can block attack traffic.
Attack Mode is a Vercel Firewall switch.
The spike alert tells you to use Attack Mode.

Current status, verified 2026-11-10:

- Project: `care4mind`.
- Team scope: `acme-ef4b`.
- Production has the login settings. See section 11 for two wrong names.
- `FEATURE_LOGIN=0`. Login is off.
- `BETTER_AUTH_URL` is `https://www.care4mind.xyz`.
- Firewall Bot Protection: not verified. See issue #363.

### 4.2 Neon: database

Neon gives hosted Postgres.
Better Auth stores all login data in Neon.
The code connects with a `pg` pool.
The pool reads `DATABASE_URL`.

Current status, verified 2026-11-10:

- Project: `spring-poetry-95630039`.
- Region: `aws-ap-southeast-1`, Singapore.
- Branch `main`: `br-mute-mud-a1pdkhxy`.
- Branch `vercel-dev`: `br-nameless-sky-a1aektc7`.
- Database: `neondb`.
- Migration `migrations/0001_auth.sql` ran on `main`.
- The `main` branch has 6 auth tables. See section 9.

> **Warning: organisation mismatch.**
> The project is in organisation `org-solitary-mountain-90288211`.
> That organisation has the name "Siddharth", plan Launch.
> Organisation `org-twilight-credit-06484301` also exists.
> That organisation has the name "care4mind", plan Launch.
> It holds no projects today.
> Issue #139 asks for the project in the care4mind organisation.
> Fix this before client handover. See issue #139.

### 4.3 Cloudflare Turnstile: bot check

Turnstile is a bot check widget.
It replaces picture puzzles.
In Managed mode, it asks for a click only at risk moments.
The widget stamps each token with the action `login`.
The widget gives the token to the browser form.
The server sends the token to Cloudflare.
Cloudflare returns pass or fail.
The server also checks the hostname.
Only these hostnames pass:

- `www.care4mind.xyz`
- `care4mind.org`
- `www.care4mind.org`

No token means no sign-up.
No token means no email code.
There is no path around the check.
Test keys cannot run in production.
The code refuses a test secret in production.
The code refuses a mixed test and real key pair.

### 4.4 Google: sign-in

Google gives OAuth sign-in.
The user picks a Google account.
Google sends the user back to the server.
The return address is `/api/auth/callback/google/`.
The address must match the Google console exactly.
The last slash is part of the address.

Rules in the code:

- A new Google user must use Sign up first.
- Log in does not silently make an account.
- Sign up needs the tick box.
- Sign up needs a name of 100 characters or less.
- Google must confirm the email address.
- ID-token sign-in is off.

The Google app uses three scopes only:

- `openid`
- `userinfo.email`
- `userinfo.profile`

Current status: keys sit in Vercel.
Real Google sign-in is not tested yet. See issue #363.

### 4.5 Brevo: email

Brevo sends all email for this site.
The code calls the Brevo HTTP API.
It sends no email with SMTP from the app.
It sends only three message types:

- A 6-digit sign-in code.
- A Delete my account link.
- A spike alert to the developer.

Current status, verified 2026-11-10:

- Sender address: `login@care4mind.xyz`.
- Sender name in the code: `Care4Mind`.
- Setting name: `LOGIN_EMAIL_FROM`.
- Alert inbox setting: `LOGIN_ALERT_EMAIL`. Value not in this document.

Note: the setup script text names `care4mind.org` at Namecheap.
The live setup uses `care4mind.xyz`.
Vercel holds that DNS.
You do not need Namecheap for this sender.

### 4.6 Better Auth: login engine

Better Auth runs inside the site.
It is not a separate hosted login page.
ADR-0004 records this choice.
Reason: only this option forces a bot check on both paths.
Both paths are Google and the email code.

Consequences you must accept:

- You must apply Better Auth security updates.
- Nobody else does that work for you.
- Server code must never call sign-in directly.
- Direct calls skip the bot check.
- A test lists every auth route.
- The test fails on an unchecked route.

## 5. How sign-up works: email code

1. The user enters a name and an email.
2. The user ticks the tick box.
3. The Turnstile widget runs in the browser.
4. The browser sends the form and the token.
5. The server asks Cloudflare about the token.
6. The server asks BotID for a verdict.
7. The server checks the email domain.
8. The server refuses a throwaway email domain.
9. The server counts codes for that email. See section 8.
10. Better Auth makes a 6-digit code.
11. Brevo sends the code to the email.
12. The code works for 10 minutes.
13. The user gets 5 attempts only.
14. The database stores only a hash of the code.
15. The user types the code on the form.
16. The server checks the tick box again.
17. The server checks the hourly new-account cap.
18. The server creates the account and a session.

The screen name goes in the `x-login-intent` header.
Sign up sends `sign-up`. Log in sends the log-in value.
The answer never reveals if an account exists.
An unknown email on Log in gets no code.
The screen gives the same answer in both cases.

## 6. How sign-up works: Google

1. The user enters a name.
2. The user ticks the tick box.
3. The Turnstile widget runs in the browser.
4. The server checks the token with Cloudflare.
5. The server asks BotID for a verdict.
6. The browser goes to Google.
7. Google asks the user to confirm.
8. Google sends the browser back to the server.
9. The server reads the tick box from OAuth state.
10. The server checks the email and the name again.
11. The server checks the hourly new-account cap.
12. The server creates the account and a session.

## 7. Session and log-out

A session lasts 7 days.
The server refreshes the session age each day of use.
The browser also gets a hint cookie, `c4m-logged-in`.
Pages can read the hint cookie.
Pages cannot read the session cookie.
The hint cookie holds no secret.
It only says "probably logged in".
Sign-out clears both cookies.

## 8. Bot protection, layer by layer

The layers work in this order.
A request must pass each layer in turn.

### Layer 0: the off switch

`FEATURE_LOGIN` controls the whole system.
The build reads the flag once.
With login off, `/api/auth/*` answers 404.
It answers as if the route does not exist.
Production has `FEATURE_LOGIN=0` today.

### Layer 1: served paths only

The route forwards only 10 named paths.
All other auth paths answer 404.
This stops unlimited database writes.
Better Auth counts unknown paths without this guard.

Served paths: `get-session`, `sign-in/social`,
`callback/google`, `email-otp/send-verification-otp`,
`sign-in/email-otp`, `sign-out`, `delete-user`,
`delete-user/callback`, `error`, `ok`.

Fourteen Better Auth paths are off in config.
They cover passwords, email change, and name edits.
This site uses no passwords at all.

### Layer 2: Vercel Firewall

Vercel Firewall sits at the edge.
Bot Protection and Attack Mode belong here.
Status today: not verified as on.
Turn it on before go-live. See issue #363.
This layer is outside the code.
No code file controls it.

### Layer 3: Cloudflare Turnstile

Only two paths need a token:

- `/email-otp/send-verification-otp`
- `/sign-in/social`

These two paths start every sign-in.
The server checks hostname and action.
Action must equal `login`.
Hostname must be on the list in section 4.3.
A failed check stops the request here.
BotID never sees a failed request.

### Layer 4: Vercel BotID

BotID gives a second verdict, `isBot`.
The check gets 5 seconds only.
A slow check counts as a failed check.
Today BotID records only. It blocks nobody.
`LOGIN_BOTID_BLOCKING` controls the switch.
Set it to `1` only after the trial.
In record mode, a failed check passes.
In blocking mode, a failed check refuses.
The log records each event without personal data.

### Layer 5: rate limits

Better Auth stores rate counts in Neon.
Table `rateLimit` holds the counts.
Global rule: at most 1000 requests, then 10 quiet seconds.
Code routes: at most 600 requests, then 60 quiet seconds.
These two numbers are code defaults today. See section 11.
Code routes are send-code, use-code, Google, and delete-user.
`get-session` has no rate limit by design.
One Wi-Fi with 30 phones must still work.
Vercel Firewall must guard `get-session` floods instead.

### Layer 6: defence counters

Table `defenceCount` holds hourly counters.
Each counter restarts after one hour.
Email counters use a SHA-256 hash as the key.
No row stores a readable email address.

| Defence | Default limit | Blocks today? |
| --- | --- | --- |
| Codes per email, per hour | 10 | No. Records only. |
| Delete links per account, per hour | 3 | No. Records only. |
| New accounts per site, per hour | 500 | No. Records only. |
| Spike alert, new accounts per hour | 100 | Sends one email. |

`LOGIN_LIMITS_BLOCKING` controls blocking.
Set it to `1` only after the 30-phone trial.
The trial must set the real numbers first.

### Layer 7: throwaway email refusal

Sign-up refuses throwaway email domains.
The check uses a published block list.
Subdomains of listed domains also fail.
Privacy relays always pass this check.
Examples: DuckDuckGo, Firefox Relay, Apple Hide My Email.
SimpleLogin, Proton Pass, and Addy also pass.
This refusal blocks today. It is not record-only.

### Layer 8: spike alert

The server counts new accounts each hour.
Past the alert number, it sends one email.
The email goes to `LOGIN_ALERT_EMAIL`.
Subject: "Care4Mind: sign-ups are spiking".
The email tells you to use Attack Mode.
A failed alert never blocks a sign-up.
Two requests cannot send two alerts.

### Layer 9: browser security headers

Every response sends three headers:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`

`next.config.ts` sets these headers.
Issue #365 added them.

## 9. Data in Neon

Migration `0001_auth.sql` made 6 tables.
All 6 tables are empty at setup time.

| Table | Data it holds |
| --- | --- |
| `user` | Name, email, email-confirmed flag, picture, dates. |
| `session` | Session token, expiry, IP address, browser name. |
| `account` | Provider link, for example a Google account id. |
| `verification` | Hashed codes and tokens, with expiry. |
| `rateLimit` | Better Auth burst counts per key. |
| `defenceCount` | Hourly defence counts, keyed by hash. |

Delete rules:

- Delete a user, and sessions delete too.
- Delete a user, and account links delete too.
- The Delete my account link works for 24 hours.
- The link opens the Privacy page first.
- The page asks for one more press.
- One press on the page deletes the account.
- An email link alone deletes nothing.

Logs hold no email addresses.
A defence log line holds only the defence name and counts.
Search logs for `login-defence` to find each event.

## 10. Email details

The code message says "Your Care4Mind code is" plus the code.
It says the code works for 10 minutes.
It tells strangers to ignore the email.
The delete message carries one link only.
The alert message carries counts only.
It carries no user name and no email address.
Brevo gets the sender, one recipient, subject, and body.
A Brevo refusal makes the request fail.
The error names only the Brevo status number.

## 11. Settings in Vercel

The server reads settings at the first login request.
It reads no login setting at build time.
A missing setting stops login.
The error names each missing setting.
The build succeeds with no settings, as in CI.

Setting names. Values are never in this document:

| Setting | Purpose |
| --- | --- |
| `FEATURE_LOGIN` | Main switch. Today `0`. |
| `BETTER_AUTH_URL` | Site address for cookies and checks. |
| `BETTER_AUTH_SECRET` | Signs and seals auth data. Secret. |
| `DATABASE_URL` | Neon connection string. Secret. |
| `DATABASE_URL_UNPOOLED` | Direct Neon string, from integration. |
| `TURNSTILE_SITE_KEY` | Public widget key, built into pages. |
| `TURNSTILE_SECRET_KEY` | Server Cloudflare key. Secret. |
| `GOOGLE_CLIENT_ID` | Google OAuth client id. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret. Secret. |
| `BREVO_API_KEY` | Brevo send key. Secret. |
| `LOGIN_EMAIL_FROM` | Sender address. Verified value in 4.5. |
| `LOGIN_ALERT_EMAIL` | Spike alert inbox. |
| `LOGIN_LIMITS_BLOCKING` | `1` blocks, `0` records only. |
| `LOGIN_BOTID_BLOCKING` | `1` blocks, `0` records only. |
| `LOGIN_CODES_PER_EMAIL_PER_HOUR` | Default 10. |
| `LOGIN_DELETE_LINKS_PER_ACCOUNT_PER_HOUR` | Default 3. |
| `LOGIN_NEW_ACCOUNTS_PER_HOUR` | Default 500. |
| `LOGIN_SPIKE_NEW_ACCOUNTS_PER_HOUR` | Default 100. |
| `LOGIN_ROUTE_LIMIT_BURST` | Default 600. |
| `LOGIN_GLOBAL_LIMIT_BURST` | Default 1000. |

> **Warning: two names in Vercel do not match the code.**
> Vercel holds `LOGIN_ROUTE_LIMIT_PER_MINUTE`.
> Vercel holds `LOGIN_GLOBAL_LIMIT_PER_10_SECONDS`.
> The code never reads these two names.
> The setup scripts wrote these wrong names.
> So defaults 600 and 1000 apply today.
> Vercel also lacks `LOGIN_DELETE_LINKS_PER_ACCOUNT_PER_HOUR`.
> So default 3 applies there too.
> Fix the names at the trial, with the real numbers.
> Issue #363 now records this mismatch.

## 12. Failure behaviour

| Failure | Result for the user |
| --- | --- |
| Login off | Auth routes answer 404. Site works. |
| Missing setting | Login stops. Error names the setting. |
| Test Turnstile key in production | Login stops. Error names the key type. |
| Cloudflare says fail | Request stops. No code, no account. |
| BotID slow or failed, record mode | Request passes. Log records the failure. |
| BotID slow or failed, blocking mode | Request fails. |
| Brevo refuses an email | Request fails. No code reaches the user. |
| Google email not confirmed | Sign-up stops with a plain message. |
| Too many codes, record mode | Code still sends. Log records the count. |
| Too many codes, blocking mode | Request fails: too many codes. |
| Spike alert email fails | Sign-up succeeds. Log records the failure. |

## 13. Verified status, 2026-11-10

- Code: `main` at `5fa9b81`. `pnpm check` passes.
- Git: one worktree, one branch, `main`.
- Pull requests: none open. Issue #352 closed.
- Vercel: production holds the login settings. Two names are wrong. See section 11.
- Vercel: `LOGIN_EMAIL_FROM` equals `login@care4mind.xyz`.
- Vercel: `FEATURE_LOGIN` equals `0`.
- Neon: `main` has all 6 auth tables. Schema-diff proves it.
- Neon: branches are `main` and `vercel-dev` only.
- Issue #363: criterion 1 is ticked. Issue stays open.
- Issue #139: open. Organisation mismatch in section 4.2.
- Issue #140: open. Neon hardening and ADR fix still pending.
- Backups: `~/care4mind-leftovers-2026-11-10/`.

Not verified today:

- Real Turnstile pass on the live hostnames.
- Real Google sign-in end to end.
- Real code delivery to a real inbox.
- Vercel Firewall Bot Protection state.
- TalkBack, VoiceOver, and keyboard use.
- WhatsApp in-app browser behaviour.
- Thirty phones on one Wi-Fi.

## 14. Next human steps

Do these steps in issue #363, in order:

1. Turn on Vercel Firewall Bot Protection.
2. Confirm you can switch Attack Mode on.
3. Test real Turnstile keys on `www.care4mind.xyz`.
4. Test real Google sign-in end to end.
5. Test a real code into a real inbox.
6. Test with TalkBack, VoiceOver, and a keyboard.
7. Test Google sign-in in the WhatsApp browser.
8. Run the 30-phone trial on one Wi-Fi.
9. Set limit numbers from the trial results.
10. Fix the two wrong setting names. See section 11.
11. Then set limits and BotID to blocking.
12. Get the legal check for India data law.
13. Show Log in beside Search.
14. Make Start require login.
15. Set `FEATURE_LOGIN=1` and redeploy.

Also do these two side tasks:

- Issue #139: move the Neon project, or amend the record.
- Issue #140: protect `main`, 7-day history, daily snapshots.

## 15. Turn login off fast

Use this procedure in an attack or a fault:

1. Open the Vercel project settings.
2. Set `FEATURE_LOGIN` to `0` for Production.
3. Redeploy production. The flag is read at build.
4. Open `/api/auth/ok/` and confirm a 404 answer.
5. If traffic still attacks, switch Attack Mode on.

## 16. Source files

| File | Content |
| --- | --- |
| `scripts/setup-login.sh` | The 6-stage setup wizard. |
| `src/lib/auth/settings.ts` | Setting names, defaults, refusal rules. |
| `src/lib/auth/create-auth.ts` | Better Auth config, plugins, limits. |
| `src/lib/auth/defences.ts` | BotID, counters, throwaway check, alert. |
| `src/lib/auth/email.ts` | Brevo sender and message texts. |
| `src/lib/auth/route-handler.ts` | Off switch and served paths. |
| `src/lib/auth/shared.ts` | Hostnames, action, checked paths. |
| `src/lib/auth/auth.ts` | Real service wiring on Vercel. |
| `src/components/login/TurnstileWidget.tsx` | Browser widget. |
| `migrations/0001_auth.sql` | The 6 database tables. |
| `docs/adr/0002-vercel-and-neon.md` | Host and database choice. |
| `docs/adr/0004-better-auth-for-login.md` | Login engine choice. |
| `.env.example` | Canonical setting name list. |

End of document.
