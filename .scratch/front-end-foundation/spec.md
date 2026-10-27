# Front-end foundation: Press × Kolam

Status: ready-for-agent
Source: [Design direction (ticket 21)](../rebuild/issues/21-design-direction.md), [ADR-0003](../../docs/adr/0003-nextjs-for-the-front-end.md)
Tickets: [issues/](issues/)

## Problem Statement

The developer has built the first four pages of the new Care4Mind site in the "Press" direction: indigo grounds, paper folios, turmeric and vermilion, Playfair with Tiro Devanagari Sanskrit. The pages are accessible and fast, but they still read as a well-set book rather than the site the brief asks for: "custom, rich in colour, and fun to explore, with motion and feedback on scroll and click", made by "a dedicated team of human designers", never template-like.

The developer picked a blend after seeing the three style tiles. Press stays the base. From the Kolam tile come the logo and the animation style. Kolams are the rice-flour line drawings made on thresholds in South India: one unbroken line looped round a grid of dots. The site must feel really interactive for any visitor, whatever they click or scroll.

The interaction must not cost anyone access or speed:

- The audience runs from the general public to researchers, and some Questionnaires sit close to mental health. Motion must never get in the way of reading, and anyone who has asked their device to reduce motion must get a still site.
- NFR-01 (WCAG 2.2 AA, reduced motion included), NFR-02 (LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 on mobile) and FR-06 (every width from 360 to 1440 px) still hold.

## Solution

The four pages keep their Press look and gain a **kolam language** for identity and motion:

- **Logo:** a kolam mark, one line looping round two dots, beside a lowercase italic wordmark, "care4mind". On indigo the line is rice-flour cream with turmeric dots, like a real kolam on a dark floor. On paper it is indigo with vermilion dots.
- **Imagery:** kolams generated in code, each one unbroken line through a grid of dots. They frame the homepage's opening folio, divide its sections, mark its contents, and stand for what the site is about: knowledge linked into one thread (FR-01).
- **On scroll,** lines draw themselves in as they come into view. The opening kolam drifts slightly slower than the page. On long pages, a turmeric reading thread fills across the top as you read.
- **On click,**
  - buttons and calls to action spread vermilion ink from the point you pressed;
  - moving deeper into the site (a card, a related link) turns the page forward, and breadcrumbs turn it back;
  - a Concept card's title flies into the Concept page's heading;
  - on a Concept page, a "Devanagari first" switch swaps the two scripts of the heading, with a springy knob.
- **On hover and focus,** the logo redraws itself and links draw their underline.

Body text never moves. Everything decorative is hidden from screen readers. With "reduce motion" on, every drawing is simply finished, nothing slides, spreads, springs or follows the scroll, and every control still works. Browsers without scroll-driven animations (Firefox today) get the finished drawings. Navigation, popovers and the accordion work exactly as before.

## User Stories

### Visitors (general public)

1. As a first-time visitor, I want the homepage to greet me with a kolam drawing itself round the opening verse, so that the site feels made with care for its subject from the first second.
2. As a first-time visitor, I want to read the opening verse and its translation straight away, while the kolam is still drawing, so that the decoration never makes me wait.
3. As a visitor, I want the logo to be recognisably Indian and hand-made in spirit (a kolam, not a stock icon), so that I trust the site is about Indian psychology and not a generic wellness template.
4. As a visitor, I want the logo to redraw itself when I point at it or tab to it, so that even the header rewards curiosity.
5. As a visitor, I want lines and dividers to draw themselves as I scroll the homepage, so that scrolling feels alive without the text moving under my eyes.
6. As a visitor, I want the opening kolam to drift a little slower than the page as I scroll, so that the page has depth.
7. As a visitor, I want each Contents entry to get a small kolam knot as it comes into view, so that the list of areas feels like part of the same drawing.
8. As a visitor, I want "Explore Concepts" and the other calls to action to answer my press with ink spreading from where I touched, so that I know the press registered.
9. As a visitor, I want the in-page links ("Explore Concepts", "Questionnaires") to glide me down to their section, so that I keep my place in the story.
10. As a visitor, I want a Concept card's title to fly into the Concept page's heading when I open it, so that I can see I went where I meant to.
11. As a visitor, I want moving deeper into the site to feel like turning a page forward, and going back by the breadcrumbs to feel like turning it back, so that I always sense where I am.
12. As a visitor, I want the header and footer to stay still while the page turns, so that the turn doesn't disorient me.
13. As a visitor reading a long Concept page, I want a thin thread across the top that fills as I read, so that I know how much is left.
14. As a visitor, I want links to draw their underline when I point at or focus them, so that I know exactly which link I'm about to follow.
15. As a visitor on the 404 page, I want a small kolam to draw itself and a clear way home, so that a wrong turn still feels part of the site.

### Students and researchers

16. As a student, I want to choose whether a Concept's heading leads with the IAST spelling or the Devanagari, so that I can read it in the script I'm learning.
17. As a student, I want the switch between scripts to animate the two spellings trading places, so that I can see they are the same word.
18. As a researcher, I want the References list to open from a clear control whose kolam-knot icon shows whether it's open, so that I can scan the sources quickly.
19. As a researcher, I want the "Also spelled" popover and the References accordion to behave exactly as before, so that the new motion doesn't change how I find sources.
20. As a researcher, I want every Reference with a DOI to stay one click from its record, so that the animation layer never hides the evidence.
21. As a researcher, I want the related Questionnaire link on a Concept page and the related Concept link on a Questionnaire page to turn the page forward, so that following the link between them feels like following a thread.

### Keyboard users

22. As a keyboard user, I want every interactive part (logo, navigation, calls to action, cards, breadcrumbs, popover, accordion, script switch) to be reachable with Tab and to show a strong focus ring, so that I never lose my place.
23. As a keyboard user, I want pressing Enter or Space on a call to action to spread its ink from the centre, so that I get the same feedback as a mouse user.
24. As a keyboard user, I want the script switch to work with Enter and Space and to keep focus after the swap, so that I can toggle it back and forth.
25. As a keyboard user, I want focusing the logo to redraw it, so that hover-only delights aren't hidden from me.
26. As a keyboard user, I want the skip link to keep working, so that I can jump past the header straight to the content.

### Screen-reader users

27. As a screen-reader user, I want the kolams, the reading thread, the ink and the knots to be silent, so that decoration doesn't clutter what I hear.
28. As a screen-reader user, I want the logo link to be announced as "Care4Mind home", so that I know where it goes.
29. As a screen-reader user, I want the script switch announced as a toggle button, "Devanagari first", with its pressed state, so that I know what it does and whether it's on.
30. As a screen-reader user, I want the Concept heading to keep the same name and both spellings with their own language tags in either order, so that my reader pronounces each correctly.
31. As a screen-reader user, I want the disabled "Start the Questionnaire" button to stay disabled and explained as coming soon, so that I'm not sent into something that isn't live.

### People who reduce motion

32. As someone whose device asks to reduce motion, I want every kolam to appear finished, so that I still see the designs without anything moving.
33. As someone who reduces motion, I want page changes to happen instantly, with no slide or morph, so that navigation never makes me dizzy.
34. As someone who reduces motion, I want no parallax, no scroll-linked thread, no ink spread and no spring, so that the whole site keeps still.
35. As someone who reduces motion, I want in-page links to jump rather than glide, so that the page doesn't scroll on its own.
36. As someone who reduces motion, I want the script switch to swap the scripts instantly and still report its state, so that I lose the animation but not the feature.

### Phones, slow devices and other browsers

37. As a visitor on a cheap phone over a slow connection, I want the first screen to show its text within 2.5 seconds, so that the site doesn't feel broken.
38. As a visitor on a cheap phone, I want taps to respond within 200 ms, so that the ink and page-turns never make the site feel sluggish.
39. As a visitor on any device, I want nothing to jump around while the page loads or while animations run, so that I don't tap the wrong thing.
40. As a visitor on a 360 px phone, I want the kolams, logo and switch to fit without sideways scrolling, so that the site works on my screen.
41. As a visitor who zooms to 400% (320 px wide), I want the content to reflow without horizontal scrolling, so that I can read it large.
42. As a Firefox or Safari user, I want the site to work fully and look finished, even where my browser can't run the scroll-linked drawings, so that I'm not punished for my browser.
43. As a visitor whose JavaScript failed to load, I want to still read every page and follow every link, so that interaction is an enhancement, not a requirement.

### Content editors and the Client

44. As a Content editor, I want the kolams and motion to come from the design, not from the content, so that adding a Concept or Questionnaire never needs me to set up animations.
45. As a Content editor, I want new Concepts and Questionnaires to pick up the page-turn, title morph and reading thread automatically, so that every page feels the same.
46. As the Project owner, I want a short list of features the design suggests beyond the requirements, so that I can approve or refuse them in the sign-off pack before anyone builds them.
47. As the Client, I want the site to stay out of search engines until launch, so that the unfinished site isn't confused with the current one.

### The developer

48. As the developer, I want one generator for every kolam, tested as a pure function, so that every drawing is a valid unbroken kolam and changing one size can't break it.
49. As the developer, I want one kolam component with a small set of behaviours (draw on load, draw on scroll, redraw on hover, still), so that pages pick a behaviour instead of writing animation CSS.
50. As the developer, I want all motion to respect one reduced-motion rule and one set of duration and easing tokens, so that motion is consistent and easy to tune.
51. As the developer, I want scroll effects done in CSS, not scroll listeners, so that they cost no main-thread work.
52. As the developer, I want Motion used in exactly one place (the switch knob), loaded lazily, so that the JavaScript budget stays small.
53. As the developer, I want each interaction covered by an end-to-end test that clicks or scrolls like a user and runs axe in each state, so that a regression shows up in CI, not in front of the Client.
54. As the developer, I want Lighthouse CI to fail the build if LCP, CLS or Total Blocking Time go over budget, so that new motion can't quietly slow the site.
55. As the developer, I want the font loading tuned to what Lighthouse measures, so that the type that matters most loads first.
56. As the developer, I want every new colour pair checked for contrast by the existing unit test, so that the kolam colours can't drift below WCAG.

## Implementation Decisions

### The blend

- **Press stays the base, unchanged:** the colour tokens, Playfair (static Text Regular, Italic and SemiBold, plus Display Medium) and Tiro Devanagari Sanskrit at 87%, paper folios with the double rule and vermilion corner diamonds, small-caps labels, the deboss press feedback on cards, the breadcrumbs, and the shloka set like a manuscript folio.
- **From Kolam:**
  - the logo (the 2×1 kolam mark and the lowercase italic "care4mind" wordmark), which replaces the Press "4" roundel;
  - generated kolam imagery;
  - the animation language: lines draw in, underlines draw, scripts swap, cards morph into titles.
- The Press fleuron stays as a small ornament.

### Kolam generator (pure function, the main unit-test seam)

- One function takes a dot grid size (m columns × n rows) and an optional unit size. It returns:
  - an SVG path for one unbroken line,
  - the dot centres,
  - the drawing's width and height.
- The line is a billiard path: it starts between the first two dots, travels at 45°, bounces off the box edges, and rounds every bounce into a curve. It passes between every pair of neighbouring dots and loops round the outer ones.
- The path is one closed loop only when m and n share no common factor. Any other size would draw an incomplete kolam, so the function rejects it: it throws for sizes that share a factor, and for anything that isn't a positive whole number.
- The prototype is the Kolam style tile in commit `d99c935`: its generator, its parts and its CSS. Restore it from there. It doesn't yet reject bad sizes.

### Kolam component (one deep component)

- A server component that renders a kolam as decorative SVG (hidden from assistive technology), with the line set to a path length of 1 so a drawing animation is a single dash offset.
- It takes the grid size and one behaviour:
  - **draw on load:** once, about 1.6 s;
  - **draw on scroll:** as it enters the viewport, with a scroll-driven view timeline;
  - **redraw on hover:** when an enclosing link is hovered or focused;
  - **still:** finished.
- Its colours come from two new semantic tokens (kolam line and kolam dot). They default to the indigo-ground values (cream line, turmeric dot), and the paper folio overrides them (indigo line, vermilion dot), just as it already overrides the focus and link colours.
- The default rendering is always the finished drawing. Animation is added only inside `prefers-reduced-motion: no-preference`, and scroll-driven animation only inside a feature query for scroll timelines. This one rule gives reduced motion, Firefox and no-JavaScript visitors a finished, still drawing.

### Logo

- The header's home link shows the kolam mark and the italic wordmark. Its accessible name stays "Care4Mind home", and the mark redraws on hover and focus.
- The footer uses the same wordmark without the redraw.
- On indigo: cream line with turmeric dots. On paper: indigo line with vermilion dots.

### Interaction set

Every item honours reduced motion. Only transform, opacity, clip-path and SVG stroke offsets animate, apart from the link-underline exception below.

- **Everywhere**
  - Ornament rules and kolam bands draw on scroll. Body text never animates.
  - **Link underline draw** on hover and focus, by link kind:
    - Navigation and call-to-action links draw a line with a transform.
    - Links inside running text keep a visible underline at rest (WCAG 1.4.1) and draw an accent underline over it. They may animate the background size, because only the one link under the pointer or focus is painted.
  - **Ink-spread press:** primary buttons and calls to action reveal a vermilion ink circle (a clip-path circle) from the pointer position. A keyboard press spreads it from the centre.
    - It is done by one small delegated client listener, opted into with a data attribute, so the server components stay server components.
    - The listener only records the press position as CSS custom properties and restarts a CSS animation. It does well under 1 ms of work and never delays the click or navigation.
  - **Page-turn navigation:**
    - Links that go deeper (cards, related links) carry the forward transition type; breadcrumb links carry the back type.
    - One view transition round the main content maps those types to a page-turn slide-and-fade of about 300 ms. Untyped transitions (browser back and forward) don't animate.
    - The header and footer keep their own transition names, so they stay still.
    - The existing card-to-title morph keeps working inside the turn.
- **Homepage**
  - **Signature:** a large kolam frames the opening folio and draws on load, once. The heading and verse are visible from first paint; the kolam is never the largest contentful element, and its drawing never delays text.
  - A light parallax on that kolam: a transform on a scroll timeline, no listener.
  - Kolam bands between sections draw on scroll.
  - Each Contents numeral gets a small kolam knot (a 1×1 kolam) that draws on scroll.
  - Anchor links scroll smoothly, and instantly under reduced motion.
- **Concept page**
  - A reading-progress thread: a turmeric line across the top, scaled on the root scroll timeline. It is decorative, and absent under reduced motion and where scroll timelines aren't supported.
  - A **script switch:**
    - A toggle button named "Devanagari first" with `aria-pressed`.
    - Pressing it swaps which spelling leads the Concept heading. Both spellings stay inside the heading with their own language tags, and the heading's text content keeps the IAST term in both states.
    - The swap runs through a React view transition, and the knob moves with a Motion spring. This is the only use of Motion: lazily loaded, strict, and with reduced motion respected through the existing provider.
    - The choice lasts for the page view only. A site-wide preference is a sign-off-pack idea, not built.
  - The References accordion trigger gets a kolam-knot icon that turns when open.
  - The "Also spelled" popover stays as it is.
- **Questionnaire page:** the reading-progress thread and page-turn links. The disabled Start stays still, disabled and labelled "Coming soon".
- **404 page:** a small kolam that draws on load, and ink-spread on the link home.

### Guardrails

- **No new dependencies.** Motion is already installed and stays behind lazy loading.
- **No scroll or resize listeners.** Scroll effects are CSS scroll-driven animations.
- **No layout shift:** animations never change layout, and every kolam reserves its box from its width and height.
- **Text paints first:** the decoration never blocks or delays text.
- **Budgets:** LCP ≤ 2.5 s, CLS ≤ 0.1 and Total Blocking Time ≤ 200 ms (standing in for INP), measured by Lighthouse CI on the three content pages.
- **Font fallback plan if LCP misses:**
  1. Preload only Playfair Text Regular and Display Medium, and load Italic and SemiBold without preloading.
  2. If that's not enough, let Tiro use the "optional" font-display strategy.

### Unchanged decisions

- Pages read content only through the content module (`getConcept` and friends). Kolam sizes and motion are presentation, so they live in components, not content.
- Every page still sends noindex, by meta tag and header, until launch.
- Sanskrit stays NFC, with ṃ.
- The Vercel and GitHub set-up doesn't change.

## Testing Decisions

- **Test behaviour, not implementation:**
  - Assert what a person sees and can do: roles, names, states, where a click lands, what's announced, whether anything moves. Don't assert class names, keyframe names or internal state.
  - Assert computed results only where the behaviour is visual. Examples: a drawing is finished (dash offset 0) under reduced motion and in Firefox; no running animations under reduced motion.
- **Unit (Vitest):**
  - The kolam generator's coprime sizes give one closed loop that visits every gap between dots; the expected number of curve segments follows from m and n.
  - It returns m×n dots and the right width and height, and rejects sizes that share a factor or aren't positive whole numbers.
  - The contrast test covers the new kolam colour pairs: 3:1 as graphics on both grounds.
  - The Sanskrit and content tests stay green.
  - Prior art: the existing Sanskrit, content and contrast unit tests.
- **End to end (Playwright),** at 360, 768 and 1440 px in Chromium:
  - **Logo:** the accessible name is unchanged, and hover or focus starts a redraw.
  - **Ink-spread:** clicking or pressing Enter on a call to action still navigates or scrolls to the right place.
  - **Page-turn:** a card leads to the Concept page with the right heading; breadcrumbs lead back; the header persists.
  - **Script switch:** the pressed state flips, both language tags are present, focus stays on the switch, and axe passes in both states.
  - **Accordion and popover:** axe passes with each open.
  - **Reading thread:** present and decorative where supported.
  - **Reduced motion:** no moving animations on load, scroll or click, extending the existing check; drawings are finished; the switch still swaps.
  - **Reflow** at 320 px still passes.
  - **Firefox:** the pages render with finished drawings. WebKit gets the same check in CI only.
  - Prior art: the concept, questionnaire, motion, reflow, pages and smoke specs.
- **Performance:** Lighthouse CI on the homepage, the Concept page and the Questionnaire page, three runs each, with the budgets above as errors.
- **Every ticket's done-check:**
  - lint, format check, typecheck, unit tests and the production build;
  - Playwright projects chromium-360, chromium-768, chromium-1440, reflow-320, reduced-motion and firefox-360;
  - plus Lighthouse CI for the performance ticket.

## Out of Scope

- A database or CMS: the Architecture review and the Editing trial decide those.
- Site search (FR-04).
- The Questionnaire engine (FR-05): questions, scoring and results. The KarmaYoga Scale stays an intro page with Start disabled.
- The mobile navigation pattern: the Site map and navigation ticket owns it. The header keeps its two links.
- More Concepts, Questionnaires or topic pages; canonical URLs and the sitemap; analytics.
- Features beyond the requirements, which go to the sign-off pack instead of being built:
  - an interactive Concept map;
  - a site-wide IAST/Devanagari preference;
  - audio pronunciation of terms;
  - a "kolam of your reading path".
- Anything on care4mind.org, its DNS or the current site; any paid Vercel add-on.

## Further Notes

- **Tickets run one after another** on the integration branch `SiddharthMuramkar/frontend`, not in parallel worktrees. Tickets 02–04 all touch the global styles, the layout and the pages, so parallel branches would conflict for little gain.
- The style tiles that led to this pick are still viewable behind the Vercel login at the tiles deployment listed in ticket 21.
- Real text only. Nothing in this spec adds or changes content; if a label is needed, it's interface text ("Devanagari first"), not content.
