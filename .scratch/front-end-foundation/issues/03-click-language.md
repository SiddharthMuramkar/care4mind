# 03: Click language: ink, page-turn, underlines

Status: resolved
Blocked by: 01
Spec: [Front-end foundation: Press × Kolam](../spec.md)

**What to build:** every press and every move through the site answers back.

- Calls to action and primary buttons spread vermilion ink from the point pressed, or from the centre on a keyboard press.
- Going deeper into the site (a card, a related link) turns the page forward; the breadcrumbs turn it back. The header and footer stay still, and a Concept card's title still flies into the page heading.
- Links draw their underline on hover and focus.
- With reduce motion on, presses and navigations happen instantly.
- Clicks and navigation never get slower or less reliable.

## Acceptance criteria

- [x] **Ink-spread:**
  - applied to the homepage calls to action and to the primary link or button on each page that has one: the 404's "Go to the homepage" can be wired here or in ticket 04;
  - opted into with a data attribute and handled by one delegated client listener mounted once in the layout, so the parts stay server components;
  - a pointer press spreads a clip-path circle from the pointer, and Enter or Space spreads it from the centre;
  - the listener only records the position and restarts the animation: it never prevents default, never delays navigation, and does well under 1 ms of work;
  - there is no spread under reduced motion.
- [x] **Page-turn:**
  - links from cards and related links carry the forward transition type, and breadcrumb links carry the back type;
  - one view transition round the main content maps them to a page-turn of about 300 ms, using transform and opacity only, with no animation for untyped transitions;
  - the header and footer keep still;
  - the card-to-title morph still works;
  - there is no animation under reduced motion.
- [x] **Underline draw:**
  - navigation and call-to-action links draw their underline with a transform;
  - links in running text keep a visible underline at rest (WCAG 1.4.1) and draw an accent underline on hover and focus.
- [x] **Kept:** the card deboss feedback and the focus ring.
- [x] **End-to-end tests:**
  - clicking each call to action with the mouse, and pressing Enter on it, reaches the right place;
  - a Concept card leads to the Concept page with the right heading;
  - the breadcrumb leads home;
  - the header is present throughout;
  - axe passes;
  - the reduced-motion check finds nothing moving after a click.
- [x] **Done-check:** every check in the spec's Testing Decisions passes.

## Comments

**Built, 2026-10-28:**

- **Ink-spread:** `InkSpread` (`src/components/InkSpread.tsx`) is one passive click listener in the layout for every control marked `data-ink`. It notes where the press landed and restarts the spread by switching between two identical CSS animations: a clip-path circle of a new token, `--color-ink-spread` (vermilion at 70%), under the label. It is on the homepage calls to action and the 404's "Go to the homepage", and costs about 0.1 ms per press at 4× CPU slowdown.
- **Page-turn:** `PageTurn` wraps each page's `<main>` in one `<ViewTransition>` that maps the `turnForward` and `turnBack` types to a 320 ms slide-and-fade, by transform and opacity. Cards and related links turn forward, breadcrumbs back; other page changes swap at once. The header and footer have their own transition names and stay put above the turn, and the card's title still flies into the heading.
- **Underlines:** header and call-to-action links draw a 1 px line by transform. Links in running text (any link without a class) are now underlined at rest and draw a vermilion accent under that line, by background-size.
- Decisions the spec left open:
  - The ink spreads on click rather than pointerdown. A keyboard press is a click without a position, so it spreads from the centre; Space spreads it only on buttons, which Space activates; a touch that starts a scroll spreads nothing.
  - The ink is translucent, so the label keeps its colour. The contrast test now lays the ink over each control's ground: 6.75:1 on indigo, 4.65:1 on paper.
  - Tailwind's preflight had left every link without an underline. Breadcrumbs count as links in text: without an underline, only colour would tell a crumb from the current page.
  - The header is now a solid indigo strip, the same at rest, so the turning page passes beneath it rather than showing through.
  - The call-to-action styles moved to `src/app/cta.module.css`, shared by the homepage and the 404. On the 404, "Read about Vikṣepa" turns forward like a related link, and gets the `&nbsp;` the card uses, as inline-flex dropped its space.
  - The header and footer names are inline styles, as in the Next.js guide, because CSS Modules scope transition names.
- Left over:
  - With Next.js 16.4.3, a link pressed while its page is still being prefetched loses its transition types, so that page changes at once instead of turning. The tests hover a link and wait for its prefetch first, as a visitor's reading time does.
  - Focusing a control partly below the fold glides it into view; on a freshly loaded page that glide can replace the one Enter starts. The tests bring a control on screen before focusing it, as a keyboard user's Tab does. This happened before this ticket too.
  - No enabled primary button exists yet, so Space on a button is untested end to end; the Questionnaire's disabled Start stays still.
