# Front-end interaction stack and quality checks: research findings

Ticket: [Front-end interaction stack and quality checks](../issues/06-front-end-interaction-stack.md) · Researched 2026-10-26 · Branch: research/front-end-interaction-stack

Every source cited here was read on 2026-10-26, from the source that owns the fact: official docs, licences, specs, the npm registry, or source code. The one exception is the GSAP licence: its live page was down that day, so it was read from an Internet Archive capture dated 2026-10-17. Version numbers and release dates come from the npm registry on the same day. As the ticket asks, the framework is assumed to be Next.js (a React framework). Nothing from the current site's front end carries over: its Elementor and Astra code is replaced.

A few terms come up throughout:

- **Front end:** the part of the site that runs in the visitor's browser.
- **Main thread:** the one lane in the browser that runs the page's JavaScript and works out layout. While it's busy, the page can't respond to clicks.
- **Compositor:** a separate lane that moves already-drawn layers around. Animations it can run alone stay smooth even while the main thread is busy.
- **Core Web Vitals (NFR-02):** Google's three speed measures, judged at the 75th percentile of real visits ([web.dev/vitals](https://web.dev/articles/vitals)):
  - **LCP**: how fast the biggest piece of content appears.
  - **INP**: how fast the page reacts to a click, tap or key press.
  - **CLS**: how much the layout jumps around unexpectedly.

## Summary

- **Current versions, October 2026:** Next.js 16.4.3, React 19.3.1, Tailwind CSS 4.3.3, Motion 14.6.0, GSAP 3.15.0, Lenis 1.3.27, Base UI 1.9.0, React Aria Components 1.22.1, Radix 1.8.1 and Ark UI 5.39.3. React 19.3 (9 September 2026) made `<ViewTransition>` stable: it animates page changes using the browser's own View Transitions API, and Next.js runs it with no configuration. None of these libraries is fast or slow in itself. What decides INP, CLS and LCP is *what* gets animated (`transform`, `opacity`, `filter` and `clip-path` stay off the main thread) and how much JavaScript ships.
- **Styling:** Next.js's own docs recommend Tailwind CSS for most styling and CSS Modules for component-specific styles. Tailwind 4 defines the design tokens (named colours, sizes, durations and easings) as CSS variables in one `@theme` block. vanilla-extract works only experimentally with Turbopack, Next.js's default build tool. A stable, tool-neutral token file format exists (DTCG 2025.10), but it's only needed if the design tool and the code have to share tokens.
- **Accessible component primitives:** all four candidates are maintained, permissively licensed (MIT or Apache-2.0), and handle keyboard, focus and screen-reader attributes for us. Base UI went stable in December 2025, ships monthly, and has been shadcn/ui's default since July 2026. React Aria is from Adobe and is the only one with an official skill and MCP server for coding agents. Radix still ships, but its release-notes page has been quieter. Ark UI is the only one that also works in Svelte.
- **Motion:** the cheapest-first layering is:
  1. CSS transitions.
  2. CSS scroll-driven animations. They run off the main thread, but Firefox doesn't support them yet, so they're not "Baseline" (supported by all major browsers).
  3. React `<ViewTransition>` for page changes.
  4. Motion for springs, gestures and layout changes. It's MIT licensed and just over 5 kB to start with if it's lazy-loaded (corrected on verification: that is the vendor's figure for Rollup builds, and other bundlers come out slightly larger). Its default is *not* to honour reduced motion.

  GSAP is now free for any website, but under Webflow's own licence rather than an open-source one, and ScrollTrigger runs on the main thread. Lenis moves wheel scrolling onto the main thread. It honours reduced motion by default.
- **Accessible motion:** WCAG 2.2 AA doesn't on its own require honouring the "reduce motion" setting (that's 2.3.3, Level AAA), but the brief's NFR-01 includes it. Level A 2.2.2 also applies to motion that starts when something scrolls into view and lasts over 5 seconds. Each tool opts into reduced motion differently, so it has to be wired in per tool. WCAG's Reflow criterion (1.4.10, AA) tests at 320 CSS px, which is narrower than FR-06's 360 px.
- **Crafted look:** the design guidance read for this ticket agrees (Anthropic's frontend-design skill, Vercel's interface guidelines, Nielsen Norman Group (NN/g), Apple's HIG):
  - Choose type and palette deliberately for this subject.
  - Spend boldness on one memorable moment rather than animating every section.
  - Give motion a job: show what changed after a click.
  - Keep durations at 100–400 ms.

  The Anthropic skill names two tells as the AI default: "fade-and-slide-up on every section" and "hover effects on every card" (corrected on verification: the draft said all four sources warn against both. Only the Anthropic skill names them. NN/g's scroll-text study backs the first, and Vercel says to animate only when it "clarifies cause & effect or … adds deliberate delight". None of Vercel, NN/g or Apple names hover effects on every card, and the type-and-palette advice comes from the Anthropic skill alone). NN/g found that scroll-triggered text animation slowed readers down, and advises caution on medical and task-focused sites. That matters for the Questionnaire pages.
- **Automated checks on Vercel:**
  - **Playwright** (scripted browsers) can check every width from 320 to 1440 px, with and without reduced motion, against each preview deployment.
  - **axe-core** catches about 57% of WCAG issues. Its WCAG 2.2 target-size rule only runs if the `wcag22aa` tag is requested.
  - **Lighthouse CI** checks LCP, CLS and Total Blocking Time, but can't measure INP.
  - **Vercel Deployment Checks** can hold back a production release until these pass.
  - **Real-visitor INP** needs Speed Insights Plus ($10 per project per month plus $0.65 per 10,000 events on Pro) or the free `web-vitals` library reporting to our own endpoint.
- **Still checked by hand:**
  - screen readers and keyboard-only use
  - focus that is visible and not hidden
  - each animation with "reduce motion" on
  - contrast over images and gradients
  - motion comfort
  - a real low-end phone for scroll and tap feel
- **One coherent combination for the Design direction prototypes to use** (input, not a decision; see the last Findings section):
  - Next.js 16 with React 19.3
  - Tailwind 4 tokens, plus CSS Modules where needed
  - Base UI, with React Aria as the runner-up
  - CSS, then `<ViewTransition>`, then Motion, with GSAP held back for one signature scroll sequence and no Lenis by default
  - Playwright, axe, Lighthouse CI and Deployment Checks in CI
- **Verification (2026-10-26):** 17 groups of load-bearing claims were rechecked against their primary sources. Six needed fixing: two dates, one version note, two citations made more precise, and one overstated agreement between the design sources. None of the fixes changes the suggested combination. See [Verification](#verification).

## Findings

### Versions checked

From the npm registry (`registry.npmjs.org/<package>`), 2026-10-26:

| Package | Latest | Published | Licence |
| --- | --- | --- | --- |
| next | 16.4.3 | 2026-10-23 (16.0 was 2025-10-22) | MIT |
| react | 19.3.1 | 2026-10-14 | MIT |
| tailwindcss | 4.3.3 | 2026-07-16 | MIT |
| @vanilla-extract/css | 1.21.3 | 2026-10-08 | MIT |
| style-dictionary | 5.7.1 | 2026-10-24 | Apache-2.0 |
| radix-ui | 1.8.1 | 2026-10-12 | MIT |
| react-aria-components | 1.22.1 | 2026-10-09 | Apache-2.0 |
| @ark-ui/react | 5.39.3 (6.0.0-next.0 on the `next` tag) | 2026-10-05 | MIT |
| @base-ui/react | 1.9.0 (1.0.0 was 2025-12-11) | 2026-10-09 | MIT |
| motion | 14.6.0 (13.0 on 2026-08-05, 14.0 on 2026-10-02) | 2026-10-22 | MIT |
| gsap | 3.15.0 | 2026-04-13 | "Standard 'no charge' license" |
| @gsap/react | 2.1.2 | 2025-01-15 | same GSAP licence |
| lenis | 1.3.27 (2.0.0-dev.5 on the `dev` tag) | 2026-10-15 | MIT |
| @playwright/test | 1.64.1 | 2026-10-14 | Apache-2.0 |
| axe-core, @axe-core/playwright | 4.14.0 | axe-core 2026-10-05; @axe-core/playwright 2026-10-15 (corrected on verification: the draft gave 2026-10-15 for both) | MPL-2.0 |
| @lhci/cli (Lighthouse CI) | 0.15.1 | 2025-06-25 | Apache-2.0 |
| lighthouse | 13.5.0 | 2026-09-18 | Apache-2.0 |
| @vercel/speed-insights | 2.0.0 | 2026-03-10 | Apache-2.0 |
| web-vitals | 6.2.3 | 2026-10-05 (corrected on verification: the draft said "not checked") | Apache-2.0 |
| astro | 7.4.2 (7.0 on 2026-06-22) | 2026-10-21 | MIT |
| @sveltejs/kit | 3.1.0 (3.0 on 2026-10-01) | 2026-10-14 | MIT |

### How animation affects INP, CLS, LCP and the main thread

These rules apply to every motion tool below, so they come first.

- **INP counts only clicks, taps and key presses.** "Hovering and scrolling … are not observed for the purposes of INP" ([web.dev/inp](https://web.dev/articles/inp)). An INP of 200 ms or less is "good". Each interaction has three parts ([web.dev/optimize-inp](https://web.dev/articles/optimize-inp)), and the third includes the rendering work an animation adds:
  1. Input delay: waiting for the main thread to be free.
  2. Processing: the page's own event code running.
  3. Presentation delay: drawing the next frame.

  Script loading and parsing during start-up also lengthens input delay ([same page](https://web.dev/articles/optimize-inp)).
- **CLS ignores expected movement.** Shifts within 500 ms of a user input are excluded. "Composited animations using `translate` can't impact other elements, and so don't count toward CLS". Animating `top`, `left`, `width` or `height` does cause layout shifts ([web.dev/optimize-cls](https://web.dev/articles/optimize-cls); [web.dev/cls](https://web.dev/articles/cls)). Shifts while scrolling count, even within 500 ms, if lazy-loaded content arrives without reserved space ([optimize-cls](https://web.dev/articles/optimize-cls)).
- **LCP ignores invisible elements.** "Elements with an opacity of 0, that are invisible to the user" are not LCP candidates ([web.dev/lcp](https://web.dev/articles/lcp)). A hero heading or image that fades in from opacity 0 therefore can't count as painted until the fade begins. Entrance animations on the first screen can delay LCP.
- **Only some properties stay off the main thread.** Google's guidance is to restrict animations to `transform` and `opacity` to stay on the compositor ([web.dev/animations-guide](https://web.dev/articles/animations-guide)). Motion's docs add `clipPath` and `filter` to the list browsers can animate "entirely on the GPU" ([motion.dev/docs/react-use-scroll](https://motion.dev/docs/react-use-scroll)).
- **Scrolling stays smooth only if nothing intercepts it.** Chrome's compositor scrolls the page without the main thread unless an input listener might cancel the scroll. If such a listener covers the whole page, the compositor "has to communicate with the main thread and wait for it every time an input event comes in" ([Chrome: Inside look at modern web browser, part 4](https://developer.chrome.com/blog/inside-browser-part4)). This is what smooth-scroll libraries do (see Lenis below).

### Styling

**Tailwind CSS 4.3**

What it is: Tailwind is a "utility-first" CSS framework. Pages are styled with small single-purpose class names such as `px-4` or `bg-mint-500`, and the CSS for them is generated at build time, so no styling code runs in the browser ([tailwindcss.com/docs](https://tailwindcss.com/docs/theme)).

- **Tokens:** version 4 moved configuration into CSS. Theme variables declared in an `@theme` block (for example `--color-mint-500`, `--font-display`, `--ease-snappy`) create the matching utility classes. They are also ordinary CSS variables that custom CSS can use ([Theme variables](https://tailwindcss.com/docs/theme); [Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles)).
- **Reduced motion:** it has `motion-safe:` and `motion-reduce:` variants (prefixes that apply a style only under a media condition). The docs recommend `motion-safe:` to avoid "undoing" styles ([States docs](https://tailwindcss.com/docs/hover-focus-and-other-states)).
- **Browser floor:** Chrome 111, Safari 16.4, Firefox 128 ([Compatibility](https://tailwindcss.com/docs/compatibility)).
- **Recent changes:** v4.3 shipped on 8 May 2026 ([blog](https://tailwindcss.com/blog/tailwindcss-v4-3)). On 9 September 2026 Tailwind Labs joined Shopify. It says "Everything will always be MIT-licensed", that the team will keep maintaining it, and that it is closing new sign-ups for its paid products ([announcement](https://tailwindcss.com/blog/tailwind-is-joining-shopify)).
- **Next.js's view:** "Use Tailwind CSS for most styling needs", and "Use CSS Modules for component-specific styles when Tailwind utilities aren't sufficient" ([Next.js CSS docs](https://nextjs.org/docs/app/getting-started/css)).

**CSS Modules**

What it is: an ordinary CSS file named `*.module.css`, whose class names Next.js makes unique per file, so styles can't leak between components. It's built into Next.js and needs no setup ([Next.js CSS docs](https://nextjs.org/docs/app/getting-started/css)). Like Tailwind, it's plain CSS at build time, so it has no runtime cost.

Next.js warns that global stylesheets aren't removed when you navigate between routes, so it recommends keeping global CSS truly global ([same page](https://nextjs.org/docs/app/getting-started/css)).

**vanilla-extract 1.21**

What it is: styles written in TypeScript files, which gives type-checked tokens, and turned into static CSS at build time.

- **Next.js support:** for Next.js 16 and later, "Both Turbopack and Webpack are supported", but "Turbopack support is experimental. Its API is unstable and may undergo breaking changes in non-major versions". It is also off by default (`unstable_turbopack.mode: 'off'`) ([vanilla-extract Next.js integration](https://vanilla-extract.style/documentation/integrations/next)).
- **Turbopack is the default:** "Turbopack is now the default bundler in Next.js" ([Next.js Turbopack docs](https://nextjs.org/docs/app/api-reference/turbopack)).
- **Open issue:** filed 4 September 2026, it reports that the Turbopack integration creates one module per CSS rule, which makes development memory-bound ([issue #1786](https://github.com/vanilla-extract-css/vanilla-extract/issues/1786)).
- **Agent docs:** context7's versioned index of vanilla-extract is at 1.16.1, against 1.21.3 on npm.

**Runtime CSS-in-JS** (styles generated by JavaScript in the browser, such as styled-components) isn't on the ticket's list. Next.js says these libraries need a style registry and React concurrent-rendering support to work with Server Components ([CSS-in-JS guide](https://nextjs.org/docs/app/guides/css-in-js)).

**Design tokens.** Design tokens are named design decisions, such as "brand-saffron = this colour" or "duration-quick = 150 ms", kept in one place so every page uses the same values.

- **Standard format:** the W3C Design Tokens Community Group (DTCG) published its first stable format, "Design Tokens Format Module 2025.10", on 28 October 2025. It is a Community Group report and is "not on the W3C Standards Track" ([spec](https://www.designtokens.org/tr/2025.10/format/); [W3C CG page](https://www.w3.org/community/design-tokens/)).
- **Token types:** colour, dimension, font family, font weight, **duration**, **cubicBezier** (easing curves) and number. Composite types are stroke style, border, **transition**, shadow, gradient and typography. Files use `.tokens` or `.tokens.json` ([spec](https://www.designtokens.org/tr/2025.10/format/)).
- **Turning tokens into code:** Style Dictionary 5.7.1 is the translation tool the spec names. Its issue tracking full 2025.10 support was still open, with gradient support marked in progress ([issue #1590](https://github.com/style-dictionary/style-dictionary/issues/1590)).
- **Do we need it?** If tokens live only in code, Tailwind's `@theme` block already holds them as CSS variables. A DTCG file earns its keep only when a design tool (for example Figma with a token plug-in) must exchange tokens with the code.

**Effect on NFR-02.** All four approaches above produce static CSS at build time, so the choice of styling tool has little direct effect on INP. CLS from styling comes mainly from fonts and unsized media, which [Typefaces for IAST and Devanagari](../issues/07-typefaces-iast-devanagari.md) covers.

### Accessible component primitives

What they are: "primitives" (or "headless" components) are unstyled building blocks for dialogs, menus, tabs, popovers and so on. They handle the hard accessibility parts: keyboard control, focus movement, and the ARIA attributes that tell screen readers what each part is. The site supplies all of the look. That makes them a good fit for a custom design.

| | Radix Primitives | React Aria Components | Ark UI | Base UI |
| --- | --- | --- | --- | --- |
| Maker | Radix; the repository description says it is maintained by WorkOS ([repo](https://github.com/radix-ui/primitives)) | Adobe ([repo](https://github.com/adobe/react-spectrum)) | Chakra UI team, built on the Zag.js state machines ([about](https://ark-ui.com/docs/overview/about)) | "From the creators of Radix, Material UI, and Floating UI" ([about](https://base-ui.com/react/overview/about)) |
| Frameworks | React | React | React, Solid, Vue, Svelte 5 ([home](https://ark-ui.com/); [Svelte post](https://ark-ui.com/blog/introducing-ark-ui-svelte)) | React |
| Licence | MIT | Apache-2.0 | MIT | MIT |
| Release pace | `radix-ui` 1.8.1 on 12 Oct 2026; the releases page's latest entry is 20 July 2026 ([releases](https://www.radix-ui.com/primitives/docs/overview/releases)) | about monthly, v1.22.0 on 9 Oct 2026 ([releases](https://github.com/adobe/react-spectrum/releases)) | 5.39.3 on 5 Oct 2026; v6 pre-releases started 6 Oct 2026 ([changelog](https://ark-ui.com/docs/overview/changelog)) | v1.0 on 11 Dec 2025 with 35 components; v1.9.0 on 9 Oct 2026 ([releases](https://base-ui.com/react/overview/releases)) |
| Animation hooks | `data-state="open/closed"` for CSS keyframes (Radix waits for the exit animation before unmounting); `forceMount` to let JavaScript libraries control mounting ([animation guide](https://www.radix-ui.com/primitives/docs/guides/animation)) | `data-entering` / `data-exiting` states for CSS transitions; notes keyframe animations "are not interruptible" ([styling](https://react-aria.adobe.com/styling)) | `data-state` CSS animations; `Presence` with `lazyMount` / `unmountOnExit` ([presence](https://ark-ui.com/react/docs/utilities/presence)) | `data-starting-style` / `data-ending-style` CSS transitions, which "can be smoothly cancelled midway"; documented Motion recipes with `keepMounted` ([animation handbook](https://base-ui.com/react/handbook/animation)) |
| Focus and keyboard | Follows the WAI-ARIA Authoring Practices; moves focus on interaction, for example to Cancel in an alert dialog ([accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)) | `useFocusRing` shows a focus ring only for keyboard use ([docs](https://react-aria.adobe.com/useFocusRing)) | "WAI-ARIA patterns baked in" ([home](https://ark-ui.com/)) | Focus and accessibility fixes in each release ([releases](https://base-ui.com/react/overview/releases)) |
| Agent support | docs in context7 | official Agent Skill, MCP server, `.md` docs, `llms.txt` ([Working with AI](https://react-aria.adobe.com/ai)) | `llms.txt` docs in context7 | "View as Markdown" on each page, plus `llms.txt` ([quick start](https://base-ui.com/react/overview/quick-start)) |

**Context.** shadcn/ui is the most-copied styled kit built on these primitives. On its July 2026 changelog it made Base UI the default for new projects ([changelog](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)). Its reasons:

- "Base UI is stable … 6M+ weekly downloads"
- projects created on its generator "pick Base UI over Radix 2 to 1"
- "Radix is not being deprecated"

Its October 2026 components ship for Base UI, React Aria and Radix ([changelog](https://ui.shadcn.com/docs/changelog)).

shadcn's default look is itself widely reused. Using its components as-is works against the "never looks like a template" bar. That's an inference, not a cited finding.

**Other facts:**

- React Aria publishes nightly builds tagged `3.0.0-nightly-…` alongside 1.x stable ([npm release history via releasealert](https://releasealert.dev/npmjs/_/react-aria-components)). This session found no announcement of what they mean.
- The four libraries' effect on INP and bundle size wasn't measured. Each interactive primitive is a client component, so it adds some JavaScript.

### Motion

#### Motion (formerly Framer Motion)

- **What and licence:** an animation library for React, plain JavaScript and Vue. MIT licensed (npm). Motion+ is a paid add-on for premium examples and some AI-kit tools ([AI Kit](https://motion.dev/docs/ai-kit)).
- **Release pace:** fast, with 24 releases between 5 August and 20 October 2026, including two major versions.
  - 13.0 dropped an optional dependency.
  - 14.0 removed some internal APIs.
  - 13.4.0 added `AnimateView`, view transitions built on React 19.3's `<ViewTransition>`.

  Source: [CHANGELOG](https://github.com/motiondivision/motion/blob/main/CHANGELOG.md).
- **Off-main-thread work:** browsers can run `opacity`, `transform`, `clipPath` and `filter` animations on the GPU, and `useScroll` can hand them to the browser's `ScrollTimeline` ([useScroll](https://motion.dev/docs/react-use-scroll); [scroll()](https://motion.dev/docs/scroll)). The changelog adds:
  - hardware-accelerated `backgroundColor` and SVG (12.43.0)
  - hardware-accelerated independent transforms such as `x` and `y` (14.2.0)
  - since 13.5.0, `scroll` and `useScroll` "Use main thread for all `offset` animations"
- **Motion's own cost grades:** the vendor publishes a tier list:
  - **S** (compositor only): `transform`, `opacity`, `filter`, `clip-path`, ScrollTimeline
  - **B** (one-time layout read): `layout` animations
  - **C** (repaint each frame): colours, `box-shadow`, CSS variables, and View Transitions
  - **D** (layout every frame): `width`, `height`, `margin`, `top`/`left`

  Source: [Performance Doctor](https://motion.dev/docs/performance-doctor). `layoutDependency` limits layout measurements ([motion component](https://motion.dev/docs/react-motion-component)).
- **Bundle size:**
  - the full `motion` component can't be tree-shaken (unused code stripped out) below 43 kB
  - `m` + `LazyMotion` is "just over 5 kB" for the first render, then +24 kB (`domAnimation`) or +38 kB (`domMax`)
  - `useAnimate` mini is 3.3 kB

  Source: [Reduce bundle size](https://motion.dev/docs/react-reduce-bundle-size). (corrected on verification: the same page says these figures come from Rollup-built bundles and that Webpack "is less effective at tree-shaking", so its bundles should be slightly larger. Next.js doesn't build with Rollup, so treat 5 kB as a lower bound and measure it in the prototypes.) Features can load asynchronously after the page becomes interactive ([LazyMotion](https://motion.dev/docs/react-lazy-motion)).
- **Next.js:** animated components must be client components, or use `import * as motion from "motion/react-client"` ([installation](https://motion.dev/docs/react-installation)).
- **Reduced motion:** `MotionConfig`'s `reducedMotion` defaults to `"never"`. Setting `"user"` turns off transform and layout animations when the visitor asks for reduced motion, while keeping `opacity` and `backgroundColor` ([MotionConfig](https://motion.dev/docs/react-motion-config); [accessibility](https://motion.dev/docs/react-accessibility)).
- **Agents:** the "Motion AI Kit" is an official skill and MCP server. Docs search is free; Performance Doctor, the transition editor and premium examples need Motion+ ([AI Kit](https://motion.dev/docs/ai-kit)).
- **INP / CLS / main thread, summarised:**
  - INP: low if click-triggered animations use the S-tier properties, and if the JavaScript is lazy-loaded so it doesn't add to start-up work.
  - CLS: none for transform and opacity.
  - Main thread: layout animations need a layout read, and scroll animations using `offset` run on the main thread.

#### GSAP and ScrollTrigger, and GSAP's licence

- **What it is:** a general JavaScript animation engine (timelines, tweens). ScrollTrigger ties animations to scroll position, including "pinning" a section while the page scrolls. "GSAP is now free for everyone, thanks to Webflow's support!" ([gsap.com](https://gsap.com/standard-license)). All formerly paid plugins, including SplitText and MorphSVG, are free for commercial use (licence FAQ, below).
- **Licence:** the "Standard 'No Charge' GSAP License", effective 30 April 2025 and last modified 30 May 2025, copyright Webflow. Read from the [Internet Archive capture of gsap.com/community/standard-license/ dated 2026-10-17](https://web.archive.org/web/20261017164628/https://gsap.com/community/standard-license/). On 2026-10-26 the [live licence URL](https://gsap.com/standard-license) showed only a "Forums Temporarily Offline" notice after "A critical security vulnerability was found in PHP".
  - **Permitted:** use "on any website, web application, or digital interface by any person or entity".
  - **Prohibited:** use "in tools that allow users to build visual animations without code" that compete with Webflow's visual animation builder.
  - **Termination:** Webflow "may terminate this GSAP License … if you fail to comply".
  - **Changes:** Webflow may change the terms. If you don't accept a revision, you may keep using versions released before it.
  - **AI:** "AI-generated code is not a 'Prohibited Use'".
  - **Not open source:** the npm `license` field is the custom licence, the code repository declares no standard licence, and each file header reads "Copyright 2026, GreenSock. All rights reserved. Subject to the terms at https://gsap.com/standard-license" (gsap 3.15.0 tarball). A public content site is a permitted use. At handover the client inherits these terms.
- **Size:** measured from the npm tarball's minified files with `gzip -9`: GSAP core 28.3 kB and ScrollTrigger 18.0 kB, so about 46 kB together. Real bundles will differ.
- **Release pace:** the last release was 3.15.0 on 13 April 2026, and the code repository's last push was the same day (npm; repository metadata).
- **How ScrollTrigger works:** it works out start and end points up front, debounces the browser's `scroll` events, and updates on the next animation frame. Resizing triggers a full recalculation after a 200 ms pause, which the docs call "CPU-intensive" ([ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger)). Pinning adds padding by default (`pinSpacing`) "to push other elements down" (same page).

  Both run on the main thread. If the padding is added after the first paint, without a user input, the push counts as a layout shift. That's an inference from the CLS rules above.
- **React:** the `useGSAP()` hook cleans up automatically through `gsap.context()` and is safe for server rendering ([@gsap/react README](https://github.com/greensock/react/blob/main/README.md)).
- **Reduced motion:** opt in with `gsap.matchMedia()` and `(prefers-reduced-motion: reduce)`. Animations created inside it are reverted automatically when the condition stops matching ([gsap.matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29)).
- **Agents:** an official, MIT-licensed "GSAP AI Skills" repository exists ([gsap-skills](https://github.com/greensock/gsap-skills)). Its README tells agents, when no animation library is specified, to "recommend GSAP". That's a vendor preference built into the skill, so it isn't neutral guidance.

#### CSS scroll-driven animations

- **What it is:** CSS (`animation-timeline: scroll()` or `view()`) that ties an ordinary CSS animation's progress to the scroll position, with no JavaScript.
- **Speed:** Chrome's case study shows the CSS version "completely unaffected by the heavy JavaScript work", because the API "tries to use as few main thread resources as possible" ([Chrome case study](https://developer.chrome.com/blog/scroll-animation-performance-case-study)).
- **Browser support:** Chrome and Edge 115+, Safari 26+, no Firefox release. So the feature is **not Baseline**, the label for features that work in all major browsers ([web-features 3.44.0 data, 22 Oct 2026](https://www.npmjs.com/package/web-features); [webstatus.dev](https://webstatus.dev/features/scroll-driven-animations)).
- **What that means:** it can only be an extra layer. In Firefox the content has to look right without the animation, for example by placing it inside an `@supports (animation-timeline: scroll())` block. That's a standard CSS pattern rather than a cited finding.
- **Effect:** no INP cost (no script), no CLS for `transform` and `opacity`, and close to zero main-thread time.
- **Reduced motion:** the page's author has to add a `prefers-reduced-motion` rule.

#### The View Transitions API (and React's `<ViewTransition>`)

- **What it is:** a browser feature that takes a snapshot before and after a change and animates between them: a crossfade, a slide, or one element morphing into another across two pages.
- **Browser support** ([web-features 3.44.0](https://www.npmjs.com/package/web-features)):
  - Same-page view transitions: Baseline since 14 October 2025 (Chrome 111, Firefox 144, Safari 18).
  - `view-transition-class`: Baseline since October 2025.
  - Transition "types": Baseline since 13 January 2026.
  - Transitions between separate page loads ("cross-document"): Chrome 126 and Safari 18.2 but not Firefox, so not Baseline.
- **React 19.3** (9 September 2026) made `<ViewTransition>` and `addTransitionType` stable ([React 19.3 post](https://react.dev/blog/2026/09/09/react-19-3)). (corrected on verification: the post explicitly calls only `<ViewTransition>` and Fragment Refs stable. `addTransitionType`'s stable status rests instead on `react` 19.3.1 exporting it without an `unstable_` prefix, checked in the npm tarball's `cjs/react.production.js`, and on the Next.js guide: "React 19.3 includes the `<ViewTransition>` component and `addTransitionType` API".) Animations start from Transitions, Suspense reveals or `useDeferredValue`, not from plain `setState` ([Next.js guide](https://nextjs.org/docs/app/guides/view-transitions)).
- **Next.js:** "View transitions work in the App Router with no configuration". Without browser support, "the transitions do not animate", and the page works normally ([guide](https://nextjs.org/docs/app/guides/view-transitions)).
  - **Click loss:** during a transition "the `::view-transition` overlay captures pointer events, so clicks during the animation are lost". The fix is `::view-transition { pointer-events: none }`, but named elements still skip clicks for the length of the transition, so the guide says to "keep transitions short".
  - **Morph needs a ready page:** a shared-element morph plays only if the destination page is already prefetched. Otherwise the new content uses its enter animation.
  - **Reduced motion is not automatic:** the guide gives a `prefers-reduced-motion` rule that sets transition animation durations to 0.
  - **Its example timings:** 150 ms exit, 210 ms enter, 400 ms move.
- **Effect:** the old view is a snapshot, so the animation itself doesn't move real layout (no CLS). Motion's vendor tier list grades View Transitions "C: repaint each frame" ([Performance Doctor](https://motion.dev/docs/performance-doctor)). The INP cost of the snapshot step wasn't found in a primary source (see Gaps).

#### Smooth-scroll libraries such as Lenis

- **What "smooth scroll" means:** the library catches mouse-wheel input and animates the scroll position itself with an easing curve, frame by frame, instead of letting the browser jump.
- **Lenis basics:** 1.3.27, MIT, with a 2.0 in development. It "Runs on native scroll", so `position: sticky`, anchor links and accessibility keep working, and it smooths wheel input by default. Touch is smoothed only with `syncTouch`, which "can be unstable on iOS<16" ([README](https://github.com/darkroomengineering/lenis/blob/main/README.md); same text in the 1.3.27 npm package).
- **Reduced motion:** honoured by default (`respectReducedMotion: true`). Smoothing is turned off (`lerp` forced to 1, so the page tracks the wheel 1:1) and programmatic scrolls jump instantly, "while scroll keeps running on the main thread" (README).
- **Stated limitations:**
  - "capped to 60fps on Safari … and 30fps on low power mode"
  - stops working over iframes
  - no CSS scroll-snap without its plug-in
  - nested scroll areas need configuring
  - anchor links need `anchors: true`
  - `allowNestedScroll` "Can create performance issues since it checks the DOM tree on every scroll event"

  Source: README.
- **Size:** about 5.4 kB with `gzip -9` (minified file from the 1.3.27 tarball).
- **Effect:**
  - INP: scrolling isn't counted, but Lenis's per-frame loop competes with click handling on the main thread. That's an inference.
  - CLS: none.
  - Main thread: wheel scrolling now depends on it, so any long task stalls the scroll, where native scrolling would carry on ([Chrome, part 4](https://developer.chrome.com/blog/inside-browser-part4)).
- **NN/g's warning:** "parallax, carousel-forwarding animations, and scroll jacking can make users with vestibular disorders dizzy or nauseated and trigger migraines" ([NN/g, animation duration](https://www.nngroup.com/articles/animation-duration/)).

#### Impact summary

| Tool | INP | CLS | Main-thread time | LCP risk |
| --- | --- | --- | --- | --- |
| CSS transitions / keyframes on transform & opacity | none from script | none | ~none | if the hero starts at opacity 0 |
| CSS scroll-driven animations | none | none (transform/opacity) | ~none | as above |
| View Transitions (`<ViewTransition>`) | clicks lost during the overlay unless pointer-events is disabled | none | snapshot and repaint (vendor grade C) | none known |
| Motion | low if S-tier properties and lazy-loaded; start-up JS 5 kB+ | none for transform/opacity; layout animations do a read | per-frame JS unless hardware-accelerated; `offset` scroll on the main thread | as above |
| GSAP + ScrollTrigger | ~46 kB gzip of script to parse; handlers on the main thread | pin spacing can shift layout if added after paint | scroll handling on the main thread; CPU-heavy refresh on resize | as above |
| Lenis | indirect (per-frame loop) | none | all wheel scrolling on the main thread | none |

### Accessible motion: reduced motion, keyboard and focus

**What WCAG 2.2 actually requires** ([WCAG 2.2](https://www.w3.org/TR/WCAG22/)):

| Criterion | Level | What it means for rich interaction |
| --- | --- | --- |
| 2.2.2 Pause, Stop, Hide | A | Motion that starts by itself, lasts over 5 seconds and runs alongside other content needs a pause, stop or hide control. "Starts automatically" includes motion started by "scrolling an element into view" ([Understanding 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)). It applies to the whole page, even content not relied on. |
| 2.3.1 Three Flashes | A | Nothing flashes more than three times a second. |
| 2.3.3 Animation from Interactions | **AAA** | "Motion animation triggered by interaction can be disabled". "Motion animation" excludes "changes of color, blurring, or opacity", so crossfades are an acceptable reduced-motion substitute. Sufficient technique: [C39, `prefers-reduced-motion`](https://www.w3.org/WAI/WCAG22/Techniques/css/C39) ([Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)). |
| 1.4.10 Reflow | AA | Content works without sideways scrolling at a width of **320 CSS px**, equivalent to 1280 px at 400% zoom. That is narrower than FR-06's 360 px. |
| 1.4.11 Non-text Contrast | AA | Focus indicators and control states need 3:1 contrast against what's next to them. |
| 1.4.13 Content on Hover or Focus | AA | Hover cards and tooltips must be dismissible, hoverable and persistent. |
| 2.4.7 Focus Visible | AA | The keyboard focus indicator is visible. |
| 2.4.11 Focus Not Obscured (Minimum) | AA, new in 2.2 | The focused item isn't entirely hidden by "author-created content" such as sticky headers or animated overlays. |
| 2.5.7 Dragging Movements | AA, new in 2.2 | Anything done by dragging, such as a draggable Concept map, also works with single clicks or taps. |
| 2.5.8 Target Size (Minimum) | AA, new in 2.2 | Click and tap targets are at least 24×24 CSS px, or spaced so that a 24 px circle around each doesn't overlap another ([Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)). |

Two consequences:

- **NFR-01 goes beyond AA on motion.** The map says NFR-01 includes reduced motion, which is AAA in WCAG. The project has raised the bar there on purpose, and it should be tested as such.
- **Scroll-reveal effects count as "automatic" motion.** Anything triggered by scrolling into view that runs longer than 5 seconds (a looping background, say) needs a pause control even at Level A.

**How each tool honours "reduce motion"** (the operating-system setting that browsers expose as `prefers-reduced-motion`; supported since Chrome 74, Firefox 63 and Safari 10.1 per [web-features](https://www.npmjs.com/package/web-features)):

| Tool | Default | How to honour it |
| --- | --- | --- |
| Plain CSS | not honoured | `@media (prefers-reduced-motion: reduce)`, or Tailwind's `motion-safe:` / `motion-reduce:` ([Tailwind](https://tailwindcss.com/docs/hover-focus-and-other-states)) |
| Motion | `reducedMotion: "never"` | `<MotionConfig reducedMotion="user">` at the root, or `useReducedMotion()` ([Motion](https://motion.dev/docs/react-motion-config)) |
| GSAP | not honoured | `gsap.matchMedia()` with a `reduceMotion` condition ([GSAP](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29)) |
| Lenis | honoured | on by default; can be turned off ([README](https://github.com/darkroomengineering/lenis/blob/main/README.md)) |
| React `<ViewTransition>` in Next.js | not honoured | a CSS rule setting `::view-transition-*` durations to 0 ([Next.js guide](https://nextjs.org/docs/app/guides/view-transitions)) |
| Astro `<ClientRouter />` | honoured | built in: "disables *all* view transition animations" under reduced motion ([Astro docs](https://docs.astro.build/en/guides/view-transitions/)) |
| Svelte transitions | not honoured, and a global CSS rule has **no effect** because they run on the Web Animations API | `prefersReducedMotion` from `svelte/motion` (Svelte 5.7+) ([Svelte docs](https://svelte.dev/docs/svelte/transition)) |

**Keyboard and focus patterns that keep rich interaction accessible:**

- **Tab between, arrows within.** "Tab and Shift + Tab keys move focus from one UI component to another while other keys, primarily the arrow keys, move focus inside of components". Composite widgets such as tabs and menus keep one tab stop, using a "roving tabindex" ([APG keyboard interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)).
- **Never lose focus.** When a dialog closes or an item is deleted, focus must move somewhere sensible, or browsers drop it to the page body ([APG](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)). The primitives above do this. Radix, for example, focuses Cancel when an alert dialog opens ([Radix](https://www.radix-ui.com/primitives/docs/overview/accessibility)).
- **Visible focus, distinct from selection.** APG advises relying on the browser's default focus ring, or making a custom one easy to distinguish, and keeping it distinct from the "selected" look (same page). Vercel's guidelines: "Every focusable element shows a visible, unobscured focus ring", and prefer `:focus-visible` (shown only for keyboard users) over `:focus` ([Web Interface Guidelines](https://vercel.com/design/guidelines)). React Aria's `useFocusRing` follows the same rule.
- **Interruptible motion.** Animations should be "cancelable by user input" ([Vercel guidelines](https://vercel.com/design/guidelines)). Apple: "Let people cancel motion … don't make people wait for an animation to complete" ([Apple HIG, Motion](https://developer.apple.com/design/human-interface-guidelines/motion)). CSS transitions can be cancelled midway and keyframe animations can't ([Base UI](https://base-ui.com/react/handbook/animation); [React Aria](https://react-aria.adobe.com/styling)).
- **Page changes announced.** Next.js includes a route announcer that reads the new `document.title`, else the `<h1>`, after client-side navigation. It also ships `eslint-plugin-jsx-a11y` (automatic accessibility warnings in code) ([Next.js accessibility](https://nextjs.org/docs/architecture/accessibility)).
- **Hit targets.** Vercel's guidelines say at least 24 px, and 44 px on mobile ([guidelines](https://vercel.com/design/guidelines)), which matches 2.5.8 above.

### Crafted look: what reads as hand-made rather than template or AI

**Sources** (none is an empirical study of how people perceive "AI-made" design; see Gaps):

- Anthropic's own frontend-design skill. The model that will build the site comes from the same vendor, so it is the most direct description of the defaults to avoid ([frontend-design SKILL.md](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)).
- Vercel's Web Interface Guidelines ([guidelines](https://vercel.com/design/guidelines)).
- NN/g's research articles on animation ([purpose](https://www.nngroup.com/articles/animation-purpose-ux/), [duration](https://www.nngroup.com/articles/animation-duration/), [scroll-triggered text](https://www.nngroup.com/articles/scroll-animations/)).
- Apple's Human Interface Guidelines on motion ([HIG](https://developer.apple.com/design/human-interface-guidelines/motion)).
- A practitioner essay, "Invisible Details of Interaction Design", July 2023 ([rauno.me](https://rauno.me/craft/interaction-design)).

What they agree on:

1. **Choices specific to this subject, not defaults.**
   - "Choose your typefaces deliberately, not the default families you would reach for on any other project"
   - "make deliberate, opinionated choices about palette, typography, and layout that are specific to this brief"
   - "Typography carries the personality of the page"

   The same skill lists today's generic tells: a warm cream background with a serif display and terracotta accent; near-black with one acid-green accent; "content chopped into identical rounded cards, one border-radius on everything"; "a big number with a small label … and a gradient accent"; "gradient washes as decoration"; and "a '→' appended to link and button text" (Anthropic skill). For Care4Mind the obvious subject-specific material is the Sanskrit itself: IAST and Devanagari type, and shloka layout. That links to the typeface research.
2. **One memorable moment, quiet elsewhere.**
   - "A single orchestrated moment — one page-load sequence or one reveal — lands better than scattered effects"
   - "Spend your boldness in one place"
   - "fade-and-slide-up entrances on each section and hover transitions on every card are the generic default"

   Source: Anthropic skill. NN/g agrees that "the number of simultaneous animations is overwhelming" when everything moves ([purpose](https://www.nngroup.com/articles/animation-purpose-ux/)).
3. **Motion that answers an action and shows what changed.**
   - "Motion that answers a person's action (opening, expanding, confirming) is welcome when it shows what changed" (Anthropic skill).
   - NN/g lists the useful jobs: feedback, communicating state change, spatial metaphors for navigation, and signifiers. It warns against "surface-level delight (that quickly sours)".
   - Apple: "Add motion purposefully … Don't add motion for the sake of adding motion", and avoid motion on "UI interactions that occur frequently".
   - The interaction-design essay: animations should show where things come from and go (spatial consistency), feedback should start "immediately", and frequent actions such as menus feel slower when animated.
4. **Timing and easing are the craft.**
   - NN/g: most UI animations take 100–500 ms. Simple feedback about 100 ms, modals 200–300 ms, and 400 ms only for big moves. "At 500ms, animations start to feel like a real drag". Entrances slightly longer than exits; ease-out for things arriving ([duration](https://www.nngroup.com/articles/animation-duration/)).
   - Next.js's view-transition example uses 150, 210 and 400 ms ([guide](https://nextjs.org/docs/app/guides/view-transitions)).
   - Keeping these durations and easings as named tokens (Tailwind's `--ease-*` variables, DTCG's `duration`, `cubicBezier` and `transition` types) gives every agent-built component the same rhythm.
5. **Scroll effects need restraint, especially for this subject.** In NN/g's usability study, text that animated in on scroll slowed users down. "Task-focused users don't want to be wowed", and medical sites should be cautious. Animate secondary visuals, not body text, and play the effect only once ([scroll-triggered text](https://www.nngroup.com/articles/scroll-animations/)).

   Care4Mind's audiences include students and researchers, and its Questionnaires are mental-health-adjacent. That argues for calmer motion on reading pages and Questionnaire pages than on the homepage. This is an inference for the Design direction.
6. **Finish in the details.** Vercel's list covers:
   - curly quotes and tabular numbers
   - designed empty, sparse, dense and error states
   - skeletons that "mirror final content exactly"
   - deep-linked state in the URL
   - restoring scroll position on Back
   - optimistic UI (showing the result straight away and reconciling with the server later)
   - "Preference: CSS > Web Animations API > JavaScript libraries" for animation

   Source: [guidelines](https://vercel.com/design/guidelines). Vercel also publishes the list as an agent skill and an `AGENTS.md` file (same page).

### Checking FR-06, NFR-01 and NFR-02 automatically in CI on Vercel

**Terms:**

- **CI** ("continuous integration"): automatic checks that run on every code change.
- **Preview deployment:** the copy of the site Vercel builds for each change, at its own URL.
- **Lab data:** measured by a test machine.
- **Field data:** measured from real visitors.

**Wiring on Vercel:**

- **Testing each preview:** a GitHub Actions workflow can run on the `deployment_status` event and test `github.event.deployment_status.target_url`. Vercel's own example runs `npx playwright test` this way ([Vercel: automated agent access](https://vercel.com/docs/deployment-protection/automated-agent-access)).
- **Getting past protection:** protected previews are reached with the `x-vercel-protection-bypass` header plus `x-vercel-set-bypass-cookie`, set in `playwright.config.ts` ([Protection Bypass for Automation](https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation)).
- **Holding back releases:** with **Deployment Checks**, Vercel "will hold each production deployment until all required checks pass" before it goes to the live domain. Checks can be GitHub Actions results or Vercel's own lint and typecheck jobs. "Force Promote" bypasses them ([Deployment Checks](https://vercel.com/docs/deployment-checks)).

**FR-06 (360–1440 px), with Playwright 1.64.1.** Playwright drives the Chromium, Firefox and WebKit browser engines from scripts ([playwright.dev](https://playwright.dev/docs/intro)). WebKit in Playwright isn't the same as Safari on a real iPhone.

- **Width and reduced motion:** a test project can set the viewport per run, and `reducedMotion: 'reduce'` emulates the reduce-motion setting ([TestOptions](https://playwright.dev/docs/api/class-testoptions)). (corrected on verification: the draft said the option was added in v1.50. Playwright's own docs disagree. The TestOptions page says v1.50, but the [release notes](https://playwright.dev/docs/release-notes) list the standalone `testOptions.reducedMotion` as new in v1.63, and `contrast` only arrived in v1.51. Either way it works in 1.64.1, and `contextOptions: { reducedMotion }` has worked since v1.12.)
- **Visual comparison:** `toHaveScreenshot` compares against stored screenshots and by default "stops CSS animations, CSS transitions and Web Animations", fast-forwarding finite ones ([LocatorAssertions](https://playwright.dev/docs/api/class-locatorassertions)).
- **What a test can assert at each width** (test design, not a cited finding): no horizontal page scroll; navigation, search and a Questionnaire step all work; a screenshot matches.
- **Add 320 px** for WCAG Reflow.

**NFR-01 (WCAG 2.2 AA), with axe-core 4.14.0 through `@axe-core/playwright`:**

- **Coverage:** axe finds "on average 57% of WCAG issues automatically". It marks uncertain results "incomplete" for manual review, and states that "It returns zero false positives (bugs notwithstanding)" ([axe-core README](https://github.com/dequelabs/axe-core/blob/develop/README.md)).
- **WCAG 2.2 needs asking for.** The only WCAG 2.2 A/AA rule, `target-size` (2.5.8), is disabled by default ([rule descriptions](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)). It does run when `wcag22aa` is among the requested tags. That was confirmed by reading `ruleShouldRun` and `matchTags` in the 4.14.0 `axe.js`: a requested tag that matches overrides `enabled: false`.

  Playwright's documented example requests only `wcag2a`, `wcag2aa`, `wcag21a` and `wcag21aa`, so copying it skips target size ([Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)). Tag names are listed in the [axe API docs](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md).
- **No automated rules** for focus visible, focus not obscured, reflow or reduced motion (rule descriptions).
- **Test every state:** scans see only what is on screen, so a test must open each menu, dialog and Questionnaire step before scanning.
- **Playwright's own caution:** "many accessibility problems can only be discovered through manual testing" (same page).
- **In-browser aid:** the Vercel Toolbar's Accessibility Audit Tool, available on all plans, checks "WCAG 2.0 level A and AA rules" using axe, and can record while you hover and focus ([Vercel docs](https://vercel.com/docs/vercel-toolbar/accessibility-audit-tool), last updated 2025-09-24). It's a hand tool, not a CI gate.

**NFR-02 (Core Web Vitals) in the lab, with Lighthouse CI 0.15.1:**

- **What it does:** `lhci` runs Lighthouse (Google's page auditor) 3 times by default against given URLs and can fail a build with assertions. For example, `maxNumericValue` can be set on LCP, CLS and Total Blocking Time (TBT), alongside budgets ([LHCI configuration](https://googlechrome.github.io/lighthouse-ci/docs/configuration.html)). `extraHeaders` can carry the Vercel bypass header (same page).
- **Mobile throttling defaults:** 150 ms latency, 1.6 Mbps down / 750 kbps up, and 4× CPU slowdown "to emulate a mid-tier mobile device" ([Lighthouse throttling](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md)).
- **No INP.** Lighthouse "cannot measure INP, as there is no user input"; TBT "is a proxy for INP" ([web.dev/vitals](https://web.dev/articles/vitals)). Lighthouse user flows in "timespan" mode, scripted with Puppeteer, do report INP for scripted interactions ([Chrome blog](https://developer.chrome.com/blog/inp-tools-2022); [user flows](https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md)). The LHCI configuration docs describe URL-based runs only.
- **Version lag:** `@lhci/cli` 0.15.1 (June 2025) pins `lighthouse` 12.6.1, while Lighthouse itself is at 13.5.0 (npm).

**NFR-02 in the field (real visitors):**

- **Speed Insights free tier:** only the overall "Real Experience Score", from 10,000 events per rolling 30 days shared across the team. Collection pauses for at least 14 days once that's exceeded ([Speed Insights limits and pricing](https://vercel.com/docs/speed-insights/limits-and-pricing)).
- **Speed Insights Plus:** adds each Core Web Vital (FCP, LCP, INP, CLS, TTFB), breakdowns by route and element, and 30-day ranges on Pro. It costs "$10 per project, per month on Pro" plus "$0.65 per 10,000 events", with no included events (same page). It tracks preview and production deployments ([overview](https://vercel.com/docs/speed-insights)).
- **Do it ourselves:** web.dev points to Google's `web-vitals` library for measuring Core Web Vitals in your own code ([web.dev/vitals](https://web.dev/articles/vitals)). It could report to an endpoint on Neon, which is a design choice for the Architecture review.
- **Google's public data (CrUX):** includes a site only if it's "sufficiently popular". The threshold isn't published ([CrUX methodology](https://developer.chrome.com/docs/crux/methodology)), so a small new site may not appear.
- **Not a pre-launch gate:** field data needs real traffic, so it can't gate a deploy before launch. That's an inference.

| Requirement | Automated in CI | Blind spots |
| --- | --- | --- |
| FR-06 widths | Playwright per width + screenshots + overflow assertions | real devices, touch feel, zoom |
| NFR-01 | axe with `wcag22aa` per page and state; jsx-a11y lint | about 43% of issues on average; focus visible / not obscured, reflow, reduced motion, screen-reader experience |
| NFR-02 LCP, CLS | Lighthouse CI on previews (mobile throttling) | lab only; real-network variation |
| NFR-02 INP | TBT as a proxy; scripted timespan flows possible but not in LHCI | real interactions on real phones; needs field data after launch |

### What still has to be checked by hand

Automated tools "can not determine accessibility, they can only assist" and "Human judgement is required" ([W3C WAI](https://www.w3.org/WAI/test-evaluate/tools/selecting/)). Items to schedule (which devices and pages is for the Launch test plan):

- **Reduced motion, per animation.** C39's test procedure: turn the setting on, decide whether each animation is essential, and check it's suppressed ([C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39)). Also check that anything over 5 seconds can be paused (2.2.2) and that nothing flashes (2.3.1).
- **Keyboard-only walkthrough.** Logical tab order; a visible focus ring with 3:1 contrast; focus never fully hidden by sticky or animated layers (2.4.11); no keyboard traps; focus returns after dialogs; clicks or keys aren't lost during view transitions.
- **Screen readers on real devices**, including route announcements, live regions and the Questionnaire flow.
- **Zoom and reflow.** 320 CSS px, or 400% zoom, without sideways scroll.
- **Contrast where axe can't tell**, such as text over images, gradients or animated backgrounds. axe returns these as "incomplete".
- **Motion comfort and feel** on a real low-end Android phone and an iPhone. That covers scroll smoothness, tap response and Safari's 60 fps cap if Lenis is used.
- **Hover-only content.** Dismissible, hoverable, persistent (1.4.13).
- **Dragging alternatives** (2.5.7), if any drag interaction ships.
- **Content quality.** Alt text, headings and link text, which the migration also touches.

### Differences on Astro or SvelteKit

- **Versions:** Astro 7 (22 June 2026) brings Vite 8, a Rust compiler and queued rendering ([Astro 7 post](https://astro.build/blog/astro-7)). SvelteKit 3 (1 October 2026) requires Node 22.17, TypeScript 6, Svelte 5.57.1 and Vite 8 ([SvelteKit 3 post](https://svelte.dev/blog/sveltekit-3-is-here); [migration guide](https://svelte.dev/docs/kit/migrating-to-sveltekit-3)).
- **JavaScript cost:** Astro renders components to HTML and CSS, "stripping out all client-side JavaScript automatically". Interactive parts become "islands" that load `client:load`, `client:idle` or `client:visible`, and React and Svelte components can be mixed ([Astro islands](https://docs.astro.build/en/concepts/islands/)). That lowers start-up JavaScript, which helps INP input delay.
- **Primitives:** Radix, React Aria and Base UI are React-only. In Astro they work inside React islands. In SvelteKit the only listed candidate is Ark UI (`@ark-ui/svelte` 5.24.3, Svelte 5 only). Ark's 6.0.0-next notes say its Svelte package "had not had the pass Solid and Vue were given" and is only now being brought up to the v6 API ([Ark releases](https://github.com/chakra-ui/ark/releases)). Bits UI (2.20.2, MIT) is a Svelte-native option not on the ticket's list and not researched here.
- **Motion libraries:** Motion targets React, plain JavaScript and Vue ([motion.dev](https://motion.dev/docs/react-installation)). Svelte would use its plain-JavaScript API. GSAP is framework-agnostic, and its skills cover Svelte. Lenis has React and Vue adapters plus plain JavaScript (README).
- **Svelte's built-in transitions** use the Web Animations API, so a global CSS reduced-motion rule doesn't affect them. Use `prefersReducedMotion` ([Svelte transition docs](https://svelte.dev/docs/svelte/transition)).
- **View transitions:**
  - Astro offers browser-native cross-document transitions (no JavaScript, but no Firefox), or `<ClientRouter />`. The router adds client-side routing, fallbacks for browsers without support, and automatic reduced-motion handling ([Astro view transitions](https://docs.astro.build/en/guides/view-transitions/)). Astro 7 removed deprecated transition internals ([upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v7)).
  - SvelteKit "does not have any specific integration": you call `document.startViewTransition` in `onNavigate` ([SvelteKit FAQ](https://svelte.dev/docs/kit/faq)).
- **Styling:** Tailwind works in all three. For Vue, Svelte and Astro component styles, Tailwind suggests using its CSS variables rather than `@apply` ([compatibility](https://tailwindcss.com/docs/compatibility)).
- **Speed Insights** documents setups for Astro and SvelteKit as well as Next.js ([quickstart](https://vercel.com/docs/speed-insights/quickstart)).

### How well coding agents can work with each

From context7's `resolve-library-id`, 2026-10-26. A "snippet" is an indexed code example. Where versions are listed, context7 also offers version-pinned docs.

| Library | context7 ID (snippets) | Version lag in context7 | Vendor's own agent resources |
| --- | --- | --- | --- |
| Next.js | `/vercel/next.js` (6,160); `/websites/nextjs` (6,876) | versioned index stops at 16.2.9 (npm: 16.4.3) | `llms.txt` docs index ([Next.js](https://nextjs.org/docs/app/api-reference/turbopack.md)) |
| Tailwind CSS | `/websites/tailwindcss` (3,564) | none listed | none found |
| vanilla-extract | `/vanilla-extract-css/vanilla-extract` (621) | versioned at 1.16.1 (npm: 1.21.3) | none found |
| Radix | `/websites/radix-ui_primitives` (990) | none listed | none found |
| React Aria | `/websites/react-aria_adobe` (3,538) | none listed | skill + MCP + `.md` + `llms.txt` |
| Ark UI | `/llmstxt/ark-ui_llms_txt` (19,531, all four frameworks) | none listed | `llms.txt` |
| Base UI | `/mui/base-ui` (3,399) | versions up to 1.9.0, current | `.md` + `llms.txt`; shadcn's Radix-to-Base-UI migration skill |
| Motion | `/websites/motion_dev` (3,515) | none listed | AI Kit skill + MCP (some parts paid) |
| GSAP | `/websites/gsap_v3` (3,329); `/greensock/react` (106); `/greensock/gsap-skills` (183) | none listed | official skills (vendor-biased, see above) |
| Lenis | `/darkroomengineering/lenis` (121) | none listed | none found |
| Playwright | `/websites/playwright_dev` (6,041) | versioned index stops at 1.63.0 (npm: 1.64.1) | none checked |
| axe-core | `/dequelabs/axe-core` (884) | none listed | none checked |
| Lighthouse CI | `/googlechrome/lighthouse-ci` (378) | none listed | none checked |

### One coherent combination, for the Design direction prototypes

This is input only. The ticket says "Nobody decides here", and the developer decides in the Architecture review. It's offered because [Design direction](../issues/21-design-direction.md) asks for prototypes built "with the stack from the front-end research".

- **Framework:** Next.js 16 App Router with React 19.3, as the ticket assumes.
- **Styling:** Tailwind CSS 4, with every colour, type step, spacing, radius, duration and easing declared once as `@theme` tokens. CSS Modules for the few bespoke components whose CSS reads better outside utility classes.
  - Not vanilla-extract: its Turbopack support is experimental.
  - DTCG token files only if a designer syncs tokens from a design tool.
- **Primitives:** Base UI, because it's stable, ships monthly, has CSS-transition hooks that cancel cleanly, documents its Motion integration, and is shadcn's default, so agents have seen a lot of it. React Aria Components is the runner-up if the prototypes need its richer accessibility and internationalisation behaviour or its MCP server. Pick one library, not two.
- **Motion, cheapest layer first:**
  1. CSS transitions for hover, press and open/close feedback. Add `@starting-style` (Baseline since 2024, per [web-features](https://www.npmjs.com/package/web-features)) for entry animations, and scroll-driven animations only as an extra layer.
  2. React `<ViewTransition>` for page and shared-element transitions, with `::view-transition { pointer-events: none }` and the reduced-motion rule.
  3. Motion for React (`LazyMotion` + `m`, `MotionConfig reducedMotion="user"`) for springs, gestures, layout and presence animations.
  4. GSAP + ScrollTrigger held in reserve for one signature scroll sequence that Motion can't do. The licence is fine for this site but isn't open source, and it runs on the main thread.
  5. No Lenis by default. It puts wheel scrolling on the main thread and is capped at 60 fps in Safari, and NN/g warns against scroll effects on task-focused content. If a direction wants it, limit it to the homepage and test on Safari.
- **Checks:**
  - Playwright at, for example, 320, 360, 390, 768, 1024, 1280 and 1440 px, with a reduced-motion project and screenshots.
  - axe with `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa`, run on each page and state.
  - Lighthouse CI on previews asserting LCP ≤ 2.5 s, CLS ≤ 0.1 and a TBT budget.
  - Vercel Deployment Checks so production waits for these.
  - Field INP from Speed Insights Plus or `web-vitals` after launch.
  - The manual list above.

What would change this:

- a Design direction that is mostly long scroll storytelling, which strengthens the case for GSAP
- a move to SvelteKit, which makes Ark UI the only listed primitive option
- the client declining Speed Insights Plus, which leaves `web-vitals` to our own endpoint

## Gaps and uncertainties

- **GSAP's licence couldn't be read live.** On 2026-10-26 gsap.com/standard-license showed a forum-outage notice. The terms come from an Internet Archive capture of gsap.com/community/standard-license/ dated 2026-10-17 (effective 30 April 2025, last modified 30 May 2025). The licence lets Webflow change the terms, so recheck before the build.
- **No hands-on measurement.** Bundle sizes for GSAP and Lenis are `gzip -9` of minified files from the npm tarballs, not of a built Next.js page. Motion's sizes are the vendor's own figures. The primitives' JavaScript cost and INP impact weren't measured. The Design direction prototypes are the place to measure them.
- **View Transitions and INP.** No primary source was found on how the snapshot step affects INP. Motion's "C tier" grade is a vendor's view.
- **axe and `wcag22aa`.** That requesting the tag runs the disabled `target-size` rule was established by reading axe-core 4.14.0's source, not by running it. A first CI run should confirm it.
- **Lighthouse CI.** It pins Lighthouse 12.6.1 against 13.5.0 and last released in June 2025. Whether it supports user flows (timespan mode, which is needed for INP) wasn't confirmed beyond its configuration docs, which describe URL runs only.
- **Vercel Toolbar accessibility tool.** Its docs (last updated 2025-09-24) say WCAG 2.0 A/AA. Whether it now covers 2.1 or 2.2 wasn't checked.
- **Speed Insights prices** were read from Vercel's public docs. The client's account terms at handover may differ.
- **Radix's release notes page** shows July 2026 as its latest entry, while npm shows releases on 12 October 2026. The difference wasn't investigated.
- **React Aria's `3.0.0-nightly` builds.** Their meaning (a coming major version?) wasn't found.
- **Crafted look.** The sources are guidance from vendors, practitioners and NN/g. No peer-reviewed study of what makes an interface "read as AI-generated" was found in this session.
- **Scroll-driven animations in Firefox.** web-features lists no Firefox release, and Chrome's page mentions "Firefox Technology Preview: supported". When it ships in Firefox stable wasn't checked.
- **Astro and SvelteKit** were covered only where they differ. Bits UI, a Svelte primitive library, wasn't researched.
- **context7 coverage.** Snippet counts and benchmark scores are context7's own measures. Some versioned indexes lag npm (Next.js 16.2.9, Playwright 1.63.0, vanilla-extract 1.16.1). Tailwind's own agent resources weren't searched for.

## Verification

An independent check on 2026-10-26 looked again at the claims the suggested combination rests on, each against its primary source. Downloaded files (npm tarballs, the web-features data, the archived licence page) were read as data only.

| # | Claim | Checked against | Outcome |
| --- | --- | --- | --- |
| 1 | Versions, dates and licences in the versions table | npm registry metadata for all 21 packages (`dist-tags`, `time`, `license`) | Confirmed: every "Latest" version and licence. **Corrected:** axe-core 4.14.0 was published 2026-10-05, and only `@axe-core/playwright` on 2026-10-15. **Filled in:** web-vitals 6.2.3, published 2026-10-05. Also confirmed: Next 16.0.0 on 2025-10-22, React 19.3.0 on 2026-09-09, Base UI 1.0.0 on 2025-12-11, Motion 13.0.0 on 2026-08-05 and 14.0.0 on 2026-10-02, and `@lhci/cli` 0.15.1 pinning `lighthouse` 12.6.1. |
| 2 | React 19.3 made `<ViewTransition>` stable on 9 September 2026 | react.dev blog post; `react` 19.3.1 tarball | Confirmed for `<ViewTransition>`. **Corrected citation:** the post doesn't call `addTransitionType` stable. Its stable status is shown by the 19.3.1 package exporting it without an `unstable_` prefix, and by the Next.js guide. |
| 3 | Next.js runs view transitions with no configuration; clicks are lost under the overlay; reduced motion is not automatic; 150/210/400 ms timings | Next.js view transitions guide (last updated 2026-10-15) | Confirmed, word for word. |
| 4 | CSS scroll-driven animations aren't Baseline and have no Firefox release; view transitions, `view-transition-class`, transition types, cross-document transitions and `@starting-style` Baseline status | web-features 3.44.0 `data.json` (npm tarball) | Confirmed: Chrome/Edge 115 and Safari 26, no Firefox. The other statuses and dates match. (webstatus.dev renders its data with JavaScript, so it couldn't be read as text.) |
| 5 | Motion is MIT; `m` + `LazyMotion` is "just over 5 kB"; the full component is 43 kB; `reducedMotion` defaults to `"never"`; "user" keeps opacity and colour | context7 `/websites/motion_dev`; motion.dev bundle-size and MotionConfig pages; npm | Confirmed. **Added caveat:** the sizes are from Rollup builds, and Webpack builds come out slightly larger. |
| 6 | Motion changelog: 24 releases from 5 August to 20 October, `AnimateView` in 13.4.0, `offset` scroll animations on the main thread since 13.5.0, hardware-accelerated transforms in 14.2.0 | Raw `CHANGELOG.md` | Confirmed: 24 changelog headings from 13.0.0 to 14.6.0. npm has 23 of them as stable releases, because 13.4.7 isn't on npm. |
| 7 | GSAP licence: free for any website, not open source, Webflow can change or terminate it, AI-generated code allowed | Live gsap.com/standard-license (still the forum-outage notice on 2026-10-26); the Internet Archive capture of 2026-10-17 (downloaded and read); gsap 3.15.0 tarball header | Confirmed: every quoted clause, the effective date (30 April 2025), the last-modified date (30 May 2025), and the header "Copyright 2026, GreenSock. All rights reserved". The gzip sizes come out at 28,268 and 17,998 bytes, matching the draft. |
| 8 | Lenis honours reduced motion by default but still runs on the main thread; Safari is capped at 60 fps | Lenis 1.3.27 README from the npm tarball | Confirmed, word for word. |
| 9 | Base UI went stable with 35 components on 11 December 2025; shadcn/ui made it the default in July 2026; Radix's releases page stops at 20 July 2026 | base-ui.com releases; shadcn changelog entry; radix-ui.com releases; npm | Confirmed. shadcn says "New projects now use Base UI by default", "Base UI is stable", and "Radix is not being deprecated". |
| 10 | React Aria has an official agent skill, an MCP server, `.md` pages and `llms.txt`; v1.22.0 came out on 9 October 2026 | react-aria.adobe.com/ai; GitHub releases API | Confirmed. GitHub dates the release 2026-10-09, while npm has 1.22.0 on 2026-10-08 (UTC). |
| 11 | Next.js recommends Tailwind for most styling and CSS Modules where Tailwind isn't enough; vanilla-extract's Turbopack support is experimental and off by default | nextjs.org CSS docs (last updated 2026-08-25); vanilla-extract Next.js integration page | Confirmed, word for word. |
| 12 | Tailwind joined Shopify on 9 September 2026, everything stays MIT-licensed, and new sign-ups for paid products are closed | tailwindcss.com announcement | Confirmed. |
| 13 | axe finds "on average 57%" of issues; `target-size` is the only WCAG 2.2 A/AA rule, is off by default, and runs when `wcag22aa` is requested; Playwright's example skips that tag | axe-core 4.14.0 tarball (`README.md`; `axe.js` rule metadata, `matchTags` and `ruleShouldRun`); playwright.dev accessibility page | Confirmed. `target-size` is the only rule tagged `wcag22a` or `wcag22aa` and has `enabled: false`, and a matching requested tag overrides that. It still hasn't been *run*, so the item in Gaps stands. |
| 14 | Lighthouse can't measure INP and TBT is the proxy; Lighthouse's mobile throttling defaults; Playwright's `reducedMotion` option | web.dev/vitals; Lighthouse `throttling.md`; context7 `/websites/playwright_dev`; Playwright TestOptions page and release notes | Lighthouse claims confirmed. **Corrected:** Playwright's docs conflict on when `testOptions.reducedMotion` arrived (v1.50 on one page, v1.63 in the release notes). It works in 1.64.1 either way. |
| 15 | Speed Insights: the free tier shows only RES, from 10,000 events per rolling 30 days, with a pause of at least 14 days; Plus costs $10 per project per month on Pro plus $0.65 per 10,000 events, with none included. Deployment Checks hold production releases; the bypass headers and `deployment_status` workflow; the Toolbar audit covers WCAG 2.0 A/AA | Vercel docs: Speed Insights limits and pricing (last updated 2026-09-23), Deployment Checks (2026-08-11), automated agent access and Protection Bypass (via `search_vercel_documentation`), Accessibility Audit Tool (2025-09-24) | Confirmed. |
| 16 | WCAG: 2.3.3 is AAA and excludes colour, blur and opacity; Reflow is AA at 320 CSS px (1280 px at 400%) | W3C Understanding 2.3.3 and 1.4.10 | Confirmed. |
| 17 | The "crafted look" sources agree | Anthropic `frontend-design` SKILL.md (raw); Vercel Web Interface Guidelines; NN/g scroll-text and duration articles | Quotes confirmed. **Corrected:** the Summary said all four sources warn against both tells. Only the Anthropic skill names them, as described in the Summary. |

**Effect on the recommendation:** none. Every reason given for the suggested combination held up: Base UI's stability and shadcn default, Motion's licence and reduced-motion default, GSAP's non-open-source licence, Lenis running on the main thread, scroll-driven animations missing from Firefox, `<ViewTransition>` being stable with no configuration, vanilla-extract's experimental Turbopack support, axe's `wcag22aa` tag, Lighthouse's lack of INP, and Speed Insights pricing.

## Sources

All read 2026-10-26 unless noted.

**Registries and data**

- npm registry metadata for every package in the versions table: https://registry.npmjs.org/ (for example https://registry.npmjs.org/motion/latest)
- web-features 3.44.0 data (Baseline status), published 2026-10-22: https://www.npmjs.com/package/web-features
- webstatus.dev, scroll-driven animations: https://webstatus.dev/features/scroll-driven-animations
- context7 library listings via `resolve-library-id` (for example https://context7.com/websites/motion_dev)
- Code-host repository metadata (last push, licence) for radix-ui/primitives, mui/base-ui, adobe/react-spectrum, chakra-ui/ark, motiondivision/motion, greensock/GSAP, darkroomengineering/lenis, tailwindlabs/tailwindcss, vanilla-extract-css/vanilla-extract, dequelabs/axe-core, GoogleChrome/lighthouse-ci

**Web performance and standards**

- web.dev, Web Vitals: https://web.dev/articles/vitals
- web.dev, INP: https://web.dev/articles/inp
- web.dev, Optimize INP: https://web.dev/articles/optimize-inp
- web.dev, CLS: https://web.dev/articles/cls
- web.dev, Optimize CLS: https://web.dev/articles/optimize-cls
- web.dev, LCP: https://web.dev/articles/lcp
- web.dev, High-performance CSS animations: https://web.dev/articles/animations-guide
- Chrome, Inside look at modern web browser (part 4): https://developer.chrome.com/blog/inside-browser-part4
- Chrome, Scroll-driven animations performance case study: https://developer.chrome.com/blog/scroll-animation-performance-case-study
- Chrome, INP tool support: https://developer.chrome.com/blog/inp-tools-2022
- Chrome, CrUX methodology: https://developer.chrome.com/docs/crux/methodology
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Understanding 2.2.2 Pause, Stop, Hide: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
- Understanding 2.3.3 Animation from Interactions: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- Understanding 2.5.8 Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Technique C39: https://www.w3.org/WAI/WCAG22/Techniques/css/C39
- ARIA Authoring Practices, keyboard interface: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
- W3C WAI, Selecting evaluation tools: https://www.w3.org/WAI/test-evaluate/tools/selecting/
- Design Tokens Format Module 2025.10: https://www.designtokens.org/tr/2025.10/format/
- W3C Design Tokens Community Group: https://www.w3.org/community/design-tokens/
- Style Dictionary DTCG 2025.10 support issue: https://github.com/style-dictionary/style-dictionary/issues/1590

**Frameworks and styling**

- React 19.3 release post: https://react.dev/blog/2026/09/09/react-19-3
- Next.js, view transitions guide: https://nextjs.org/docs/app/guides/view-transitions
- Next.js, CSS: https://nextjs.org/docs/app/getting-started/css
- Next.js, CSS-in-JS: https://nextjs.org/docs/app/guides/css-in-js
- Next.js, Turbopack: https://nextjs.org/docs/app/api-reference/turbopack
- Next.js, accessibility: https://nextjs.org/docs/architecture/accessibility
- Tailwind, theme variables: https://tailwindcss.com/docs/theme
- Tailwind, adding custom styles: https://tailwindcss.com/docs/adding-custom-styles
- Tailwind, states (motion-safe / motion-reduce): https://tailwindcss.com/docs/hover-focus-and-other-states
- Tailwind, compatibility: https://tailwindcss.com/docs/compatibility
- Tailwind blog index: https://tailwindcss.com/blog
- Tailwind v4.3 post: https://tailwindcss.com/blog/tailwindcss-v4-3
- Tailwind Labs joining Shopify: https://tailwindcss.com/blog/tailwind-is-joining-shopify
- vanilla-extract, Next.js integration: https://vanilla-extract.style/documentation/integrations/next
- vanilla-extract issue #1786: https://github.com/vanilla-extract-css/vanilla-extract/issues/1786
- Astro 7 post: https://astro.build/blog/astro-7
- Astro, upgrade to v7: https://docs.astro.build/en/guides/upgrade-to/v7
- Astro, islands: https://docs.astro.build/en/concepts/islands/
- Astro, view transitions: https://docs.astro.build/en/guides/view-transitions/
- SvelteKit 3 post: https://svelte.dev/blog/sveltekit-3-is-here
- SvelteKit 3 migration guide: https://svelte.dev/docs/kit/migrating-to-sveltekit-3
- SvelteKit FAQ (view transitions): https://svelte.dev/docs/kit/faq
- Svelte, transitions: https://svelte.dev/docs/svelte/transition
- Svelte, svelte/motion: https://svelte.dev/docs/svelte/svelte-motion

**Primitives**

- Radix releases: https://www.radix-ui.com/primitives/docs/overview/releases
- Radix animation guide: https://www.radix-ui.com/primitives/docs/guides/animation
- Radix accessibility: https://www.radix-ui.com/primitives/docs/overview/accessibility
- Radix repository: https://github.com/radix-ui/primitives
- React Aria releases: https://react-aria.adobe.com/releases
- React Aria styling: https://react-aria.adobe.com/styling
- React Aria useFocusRing: https://react-aria.adobe.com/useFocusRing
- React Aria, Working with AI: https://react-aria.adobe.com/ai
- React Spectrum releases: https://github.com/adobe/react-spectrum/releases
- React Aria Components release history: https://releasealert.dev/npmjs/_/react-aria-components
- Ark UI home: https://ark-ui.com/
- Ark UI about: https://ark-ui.com/docs/overview/about
- Ark UI changelog: https://ark-ui.com/docs/overview/changelog
- Ark UI presence: https://ark-ui.com/react/docs/utilities/presence
- Ark UI releases: https://github.com/chakra-ui/ark/releases
- Ark UI Svelte announcement: https://ark-ui.com/blog/introducing-ark-ui-svelte
- Base UI about: https://base-ui.com/react/overview/about
- Base UI releases: https://base-ui.com/react/overview/releases
- Base UI quick start: https://base-ui.com/react/overview/quick-start
- Base UI animation handbook: https://base-ui.com/react/handbook/animation
- shadcn/ui, Base UI as the default: https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- shadcn/ui changelog: https://ui.shadcn.com/docs/changelog

**Motion tools**

- Motion changelog: https://github.com/motiondivision/motion/blob/main/CHANGELOG.md
- Motion, useScroll: https://motion.dev/docs/react-use-scroll
- Motion, scroll(): https://motion.dev/docs/scroll
- Motion, MotionConfig: https://motion.dev/docs/react-motion-config
- Motion, accessibility: https://motion.dev/docs/react-accessibility
- Motion, reduce bundle size: https://motion.dev/docs/react-reduce-bundle-size
- Motion, LazyMotion: https://motion.dev/docs/react-lazy-motion
- Motion, installation: https://motion.dev/docs/react-installation
- Motion, motion component: https://motion.dev/docs/react-motion-component
- Motion, Performance Doctor: https://motion.dev/docs/performance-doctor
- Motion, AI Kit: https://motion.dev/docs/ai-kit
- GSAP licence page (outage notice on 2026-10-26): https://gsap.com/standard-license
- GSAP Standard License, Internet Archive capture of 2026-10-17: https://web.archive.org/web/20261017164628/https://gsap.com/community/standard-license/
- GSAP 3.15.0 npm tarball (file headers, README): https://registry.npmjs.org/gsap/-/gsap-3.15.0.tgz
- GSAP, ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger
- GSAP, ScrollTrigger.refresh: https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.refresh%28%29
- GSAP, gsap.matchMedia: https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29
- @gsap/react README: https://github.com/greensock/react/blob/main/README.md
- GSAP AI Skills: https://github.com/greensock/gsap-skills
- Lenis README: https://github.com/darkroomengineering/lenis/blob/main/README.md
- Lenis 1.3.27 npm tarball: https://registry.npmjs.org/lenis/-/lenis-1.3.27.tgz

**Design guidance**

- Anthropic frontend-design skill: https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md
- Vercel Web Interface Guidelines: https://vercel.com/design/guidelines
- NN/g, The Role of Animation and Motion in UX: https://www.nngroup.com/articles/animation-purpose-ux/
- NN/g, Executing UX Animations, Duration and Motion: https://www.nngroup.com/articles/animation-duration/
- NN/g, scroll-triggered text animations: https://www.nngroup.com/articles/scroll-animations/
- Apple HIG, Motion: https://developer.apple.com/design/human-interface-guidelines/motion (read via its JSON data endpoint)
- Invisible Details of Interaction Design: https://rauno.me/craft/interaction-design

**Testing and Vercel**

- Playwright, introduction: https://playwright.dev/docs/intro
- Playwright, accessibility testing: https://playwright.dev/docs/accessibility-testing
- Playwright, TestOptions: https://playwright.dev/docs/api/class-testoptions
- Playwright, LocatorAssertions: https://playwright.dev/docs/api/class-locatorassertions
- axe-core README: https://github.com/dequelabs/axe-core/blob/develop/README.md
- axe-core rule descriptions: https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md
- axe-core API: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md
- axe-core 4.14.0 npm tarball (`axe.js` source read as text): https://registry.npmjs.org/axe-core/-/axe-core-4.14.0.tgz
- Lighthouse CI configuration: https://googlechrome.github.io/lighthouse-ci/docs/configuration.html
- Lighthouse throttling: https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md
- Lighthouse user flows: https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md
- Vercel, automated agent access: https://vercel.com/docs/deployment-protection/automated-agent-access
- Vercel, Protection Bypass for Automation: https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation
- Vercel, Deployment Checks: https://vercel.com/docs/deployment-checks
- Vercel, Speed Insights overview: https://vercel.com/docs/speed-insights
- Vercel, Speed Insights limits and pricing: https://vercel.com/docs/speed-insights/limits-and-pricing
- Vercel, Speed Insights quickstart: https://vercel.com/docs/speed-insights/quickstart
- Vercel Toolbar, Accessibility Audit Tool: https://vercel.com/docs/vercel-toolbar/accessibility-audit-tool
