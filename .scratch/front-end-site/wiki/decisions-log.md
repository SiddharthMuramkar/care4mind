# Decision log

- 2026-10-27: the developer extended ticket 21 to start the real codebase. The framework is Next.js ([ADR-0003](../../../docs/adr/0003-nextjs-for-the-front-end.md)).
- 2026-10-27: after the style tiles, the developer picked Press as the base, blended with Kolam's logo and animation style. They want it "really interactive" on every click and scroll. Spec: [front-end-foundation](../../front-end-foundation/spec.md), commit `9ebb5ed`.
- 2026-10-27: the developer asked for the whole public front end in one run, using their skill flow and as many workflows as needed. Their answers that day:
  - **Content:** migrate everything worth keeping from the saved copies, with no new requests to the current site.
  - **Questionnaire flow:** build the KarmaYoga flow with the real statements and a placeholder result.
  - **Proposals:** build the Concept map and the site-wide "Devanagari first" setting, labelled Proposal.
  - **Structure:** the agent decides provisionally, recorded in [decisions.md](../decisions.md).

  Plan: `~/.claude/plans/pasted-content-id-e4d6-wayfinder-scratc-lazy-falcon.md`. Design: [design.md](../design.md).
- 2026-10-27: GLOSSARY.md stays unchanged during this build, because provisional terms aren't settled terms. No ADRs either, since none of the structure choices is final.
