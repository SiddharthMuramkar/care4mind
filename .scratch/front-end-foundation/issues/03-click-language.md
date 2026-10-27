# 03: Click language: ink, page-turn, underlines

Status: ready-for-agent
Blocked by: 01
Spec: [Front-end foundation: Press × Kolam](../spec.md)

**What to build:** every press and every move through the site answers back.

- Calls to action and primary buttons spread vermilion ink from the point pressed, or from the centre on a keyboard press.
- Going deeper into the site (a card, a related link) turns the page forward; the breadcrumbs turn it back. The header and footer stay still, and a Concept card's title still flies into the page heading.
- Links draw their underline on hover and focus.
- With reduce motion on, presses and navigations happen instantly.
- Clicks and navigation never get slower or less reliable.

## Acceptance criteria

- [ ] **Ink-spread:**
  - applied to the homepage calls to action and to the primary link or button on each page that has one: the 404's "Go to the homepage" can be wired here or in ticket 04;
  - opted into with a data attribute and handled by one delegated client listener mounted once in the layout, so the parts stay server components;
  - a pointer press spreads a clip-path circle from the pointer, and Enter or Space spreads it from the centre;
  - the listener only records the position and restarts the animation: it never prevents default, never delays navigation, and does well under 1 ms of work;
  - there is no spread under reduced motion.
- [ ] **Page-turn:**
  - links from cards and related links carry the forward transition type, and breadcrumb links carry the back type;
  - one view transition round the main content maps them to a page-turn of about 300 ms, using transform and opacity only, with no animation for untyped transitions;
  - the header and footer keep still;
  - the card-to-title morph still works;
  - there is no animation under reduced motion.
- [ ] **Underline draw:**
  - navigation and call-to-action links draw their underline with a transform;
  - links in running text keep a visible underline at rest (WCAG 1.4.1) and draw an accent underline on hover and focus.
- [ ] **Kept:** the card deboss feedback and the focus ring.
- [ ] **End-to-end tests:**
  - clicking each call to action with the mouse, and pressing Enter on it, reaches the right place;
  - a Concept card leads to the Concept page with the right heading;
  - the breadcrumb leads home;
  - the header is present throughout;
  - axe passes;
  - the reduced-motion check finds nothing moving after a click.
- [ ] **Done-check:** every check in the spec's Testing Decisions passes.

## Comments
