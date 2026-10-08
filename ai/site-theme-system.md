# Site Theme System

## Purpose

This file maps the visual layer of the docs site so future sessions can extend it without rediscovering structure, tokens, or hard-won gotchas. It covers the custom VitePress theme: landing page, docs view, search, 404, motion system, and analytics.

Read this before editing `docs/.vitepress/theme/custom.css` or `docs/.vitepress/theme/index.js`.

For the latest landing and starter showcase decisions, screenshot capture workflow, code-panel visibility fixes, and favicon exports, read the [2026-10-08 site refresh handoff](handoffs/2026-10-08-site-refresh.md). Its dated notes supersede older descriptions below where the implementation has changed.

## File Map

- `docs/.vitepress/theme/custom.css` - all theme styling (~3700 lines). Landing (`gf-home-*`), starter kit page (`gf-starter-*`), docs view refinements, code variants, search, 404, lightbox, banner.
- `docs/.vitepress/theme/starter-kits.css` - starter showcase rails, static hero preview, frontend choices, account and settings grids. Loaded after the landing stylesheet.
- `docs/.vitepress/theme/home.css` - landing-only connected panels, code explorer, starter-kit preview, and responsive overrides. Imported after `custom.css`; uses the existing theme tokens in both color modes.
- `docs/.vitepress/theme/index.js` - theme entry. Layout slots (preview banner, 404, motion/code pickers), lightbox, mermaid, outline/sidebar auto-scroll, hash-offset settle passes, page-enter replay, banner height measurement.
- `docs/.vitepress/theme/components/` - `GoForjHeroStack.vue` (isometric forge hero), `StarterKitHeroScreens.vue` (static dashboard preview with dimensions reserved before load), `MotionPicker.vue`, `CodeVariantPicker.vue`, `ApiIndexJump.vue`, `LibraryRepoHeader.vue`.
- `docs/index.md` - landing page sections and inline `<script setup>` (swap toggle, count-ups, section analytics).

## Landing Page Story

Keep the primary sequence: forge hero, code explorer, starter kits, development and Lighthouse, capabilities and evidence, then getting started. The full first-run transcript is optional; multi-app guidance belongs alongside deployment. Use the same primary action label, `Get started`, throughout.

The hero uses a static 48px background grid, masked toward the forge and away from the copy. Keep it low contrast in both color modes and behind the content.

Keep section rails square. Use 14px outer corners on configuration panels, preview frames, grouped capability cards, frontend choices, and statistics. Selectors use inset pills with a visible keyboard focus ring. Configuration examples use a filename header and a single column of monospace lines, with the environment selector and startup explanation beside the panel. Avoid spreading code assignments into a dashboard-style grid.

The runtime section uses `RuntimeTopology.vue` to switch between one process containing all runtimes and separate process boundaries for HTTP, workers, schedules, and an illustrative custom Runtime. Label the custom Runtime as wired by the user and leave its CLI command user-defined. Keep source commands inside their process boundaries. The shared service node represents code, not shared in-memory state between processes. `ProjectAppsDiagram.vue` shows shared Go packages feeding independent Apps, each with its own wiring, source command, build command, and standalone binary. Framework and runtime icons use original outlined blocks that echo the forge, with brand marks from the existing icon subset.

The starter-kit preview shows sign-in, dashboard, and profile surfaces together in a static grid with minimal bordered panels and no browser chrome. Sign-in leads the reading order and uses a close crop; no screenshot is hidden behind a selector. The preview uses screenshots from `docs/assets/starter-kits/`. Import assets used by dynamic Vue bindings so VitePress includes their hashed production files.

All 20 starter-kit screenshots were refreshed on 2026-10-07 from a newly rendered Vue starter with auth and the component library enabled, using the GoForj checkout at `9e6dc6fb`. The generator and app were built from current source in an isolated `/tmp` project. The app used SQLite, memory cache, local storage, log mail, and HTTP port 5194. A subsequent copy pass replaced generator terminology in the Vue, React, and templ + htmx templates with direct application language. Dashboard, profile, component overview, navigation, and command-menu screenshots were recaptured from a fresh SQLite app after rebuilding the Vue frontend. Full-screen images use a 1496 by 938 viewport at 2x resolution; account detail images are browser crops. The password-reset confirmation was captured after submitting the real form, and the invite dialog and command palette were opened through the UI. Refresh the complete set from a fresh rendered app when starter templates change, including images used by `/starter-kits` and `StarterKitHeroScreens.vue`.

`docs/assets/lighthouse/overview.png` is a real screenshot captured on 2026-10-07 from an isolated local photodrop app binary (GoForj 0.19.0). It shows a connected HTTP runtime with SQLite, memory cache, local storage, a workerpool queue, in-process events, and log mail. The capture contains no credentials or user project data. Refresh it from a current generated app when the Lighthouse interface changes; do not fabricate runtime records or edit displayed version metadata.

The landing page uses `docs/assets/lighthouse/request-inspect.png`, captured on 2026-10-07 from an isolated SQLite runtime using the existing `/tmp/test3/bin/app` binary. Actual login and authenticated requests populated the inspect list. The selected `GET /api/v1/auth/sessions` record shows cache calls, a SQLite query, and the HTTP exchange. The sidebar was collapsed through the UI. The viewport is 1440 by 700 at 1.5x resolution. Only local sample data was used; the temporary runtime, database, credentials, and browser session were removed after capture.

## Starter Showcase

`docs/starter-kits.md` follows the landing page frame: straight full-width rails, square orange intersection markers, and rounded app previews. Hero and component screenshots extend below their blocks and clip at the following rail. `StarterKitOptions.vue` lists rendering choices once and copies the documented `forj new` command. Keep account screenshots captioned as Vue previews, and preserve the distinction between Vue/React authentication and the templ account pages.

## Critical Scoping Rule

The home layout (`layout: home`) ALSO renders markdown inside `.vp-doc`. Any rule written against bare `.vp-doc` leaks onto the landing page. All docs-content styling (tables, link underlines) must be scoped to `.VPDoc .vp-doc ...`, which only the docs layout has.

Stricter still: showcase-style pages (Starter Kits, blog) use the docs layout WITHOUT a sidebar and carry their own display headings, so `.VPDoc` scoping is not enough for heading decorations. The h1 ember accent and the h2/hr gradient hairlines are scoped to `.VPDoc.has-sidebar`, which matches article pages only. Both leaks happened and were caught by the user: bare `.vp-doc` hairlines appeared on the landing page, then `.VPDoc`-scoped hairlines appeared on the Starter Kits closing section. Default to `.VPDoc.has-sidebar` for anything decorating prose headings.

## Design Tokens (informal, used by convention)

- Ember orange accent: `rgba(255, 154, 96, ...)` - kickers, h1 accent rule, hash-landing glow, code-group active tab, 404 rule. The forge identity color. Use sparingly.
- Indigo brand: `rgba(106, 125, 255, ...)` and `rgba(126, 146, 255, ...)` - primary buttons, selection, search highlights, TOC marker, link underlines, hover states.
- Hairline neutral: `rgba(148, 163, 204, 0.10-0.30)` - borders, dividers.
- Gradient hairline pattern: `linear-gradient(90deg, rgba(148,163,204,0.30), rgba(148,163,204,0.03))` applied via `border-image: ... 1` on h2/hr/footer rules. Left-weighted fade, used everywhere a flat rule would appear.
- Kicker pattern: uppercase, `font-size ~0.68-0.72rem`, `letter-spacing 0.12-0.16em`, muted or ember.
- Standard ease: `cubic-bezier(0.22, 1, 0.36, 1)` for entrances; `0.15-0.2s ease` for hovers.

## Motion System

Three states via `MotionPicker.vue`: Auto (follow OS), On (force), Reduced (force off). Stored in localStorage `goforjMotion`, applied as `data-gf-motion="on|reduced"` on `<html>` (absent = auto). Early-applied by an inline head script in `config.mts` to avoid flash.

Every animation/transform must be gated with this exact CSS pattern:

```css
@media (prefers-reduced-motion: no-preference) {
    html:not([data-gf-motion='reduced']) .thing { animation: ...; }
}
html[data-gf-motion='on'] .thing { animation: ...; }
```

(For transforms-on-hover, the inverse pattern: reset `transform: none` under `[data-gf-motion='reduced']` and under `reduce` + `:not([data-gf-motion='on'])`.)

In JS, check motion at call time (`isMotionReduced()` style helpers), never cache at mount.

Non-moving fades (opacity-only) are acceptable under reduced motion; translations and scaling are not.

## Docs View Refinements (three polish rounds, all verified live)

1. Title accent (52px ember rule under h1), gradient hairlines (h2/hr), page-enter fade+rise (`gf-doc-enter`), TOC glow marker + kicker title, sidebar hover nudge, code block top sheen.
2. Prev/next pager cards with arrow nudge, hash-landing ember glow (`.gf-hash-glow`, fired from `flashHashTarget()` on hashchange / mount / route change), indigo `::selection`, slim scrollbars, header-anchor fade, link underline offset shift, table polish (hairline frame, kicker th, row hover instead of zebra).
3. Search modal (`--vp-local-search-*` vars + `.VPLocalSearchBox` rules), custom 404 (`not-found` Layout slot in index.js, `gf-notfound__*` classes), code-group tabs (ember active bar, joined block), `::: details` disclosure (rotating chevron, gated content fade). Code groups and details are unused in content as of this writing - styled ahead of need.

## Page-Enter Replay Gotcha

`replayDocEnter()` restarts the `gf-doc-enter` animation by removing the class, forcing reflow (`void document.body.offsetHeight`), and re-adding it SYNCHRONOUSLY. Do not move the re-add into `requestAnimationFrame`: rAF never fires in background tabs and the class stays off. Same reason `StarterKitHeroScreens.vue` waits for image load then double-rAFs only for the initial reveal (page is foreground on load).

## Hash Offset Machinery

The sticky docs preview banner (`.gf-docs-preview-banner`, sticky below nav) must be accounted for in scroll offsets or hash targets hide behind it:

- `stickyOffset()` in index.js includes the banner's `getBoundingClientRect().bottom`.
- `updateBannerOffsetVar()` measures banner height into `--gf-banner-height` on `<html>` (on mount + resize); headings use `scroll-margin-top: calc(var(--vp-nav-height) + var(--gf-banner-height) + 16px)` for native anchor jumps (refresh, search navigation).
- Settle passes (`scheduleHashSettlePasses`) verify and correct alignment at 320/560/840/1200ms.

If the banner is ever removed, delete all three pieces together.

## Analytics (GA4, prod only)

`track()` helpers check `window.gtag` presence at call time (gtag only injected in prod via `GA_MEASUREMENT_ID`). Events: `section_view` (landing sections, IntersectionObserver with tall-section handling), `swap_toggle`, `install_copy` (hero chip), `forge_strike` (hero block click). Analytics observers are registered BEFORE the motion gate in `docs/index.md` onMounted so reduced-motion users still get tracked.

## Code Variant System

16 code block themes via `data-gf-code-variant` on `<html>`, localStorage `goforjCodeVariant`, default `ink`. Each variant defines `--gf-code-*` vars consumed by `.vp-doc div[class*='language-']` rules. Picker hidden on mobile (`.gf-code-variant-picker { display: none }` at <=640px).

## Working Practices (hard-won)

- `custom.css` is too large for full Read-tool loads and has been edited by parallel sessions: edit via exact-string replace (python) and verify the anchor string exists first.
- Verify visually in the user's live tab (he keeps one open, often in device emulation). HMR wipes injected styles/iframes between calls.
- Screenshots of a background tab can capture stale paints (full blank frames) and CSS animations pause while not rendering; confirm with computed-style JS probes before declaring a bug.
- MiniSearch duplicate-ID HMR overlay appears after long dev sessions; needs a dev-server restart, Escape dismisses per occurrence.
- Writing style for site copy: regular dashes only (no em dashes), no terminal periods on display headings, kickers uppercase, one quip max. See `ai/tone.md` and `ai/docs-style-guide.md`.

## Known Risks

- `docs/assets/starter-kits/*` screenshots are tracked in git and available to production builds.
- Landing page and docs share `.vp-doc`; re-read the Critical Scoping Rule before adding any content-element rule.

The development section uses `DevTerminalPreview.vue` with the result fully visible, without replay or an expandable transcript. Its preparation and App startup output was captured from the local framework CLI on 2026-10-07 in a fresh `/tmp` App using templ + htmx, SQLite, memory cache, workerpool, inproc events, local storage, and log mail. The isolated capture port 5196 is displayed as the default 3000; measured durations are capture details, not performance guarantees. The running App returned `{"status":"ok"}` from `/-/health`.

Landing preview frames use a single subtle border without an orange outer halo. Code and environment panels share the compact file-tab header. The Lighthouse screenshot uses its own navigation without an additional marketing title bar. Terminal grouping rails span the line spacing continuously while preserving the captured transcript text.

The landing code section updates its description, benefits, guide link, and copyable commands with the selected example. Scaffold examples use the relevant make command; cache, storage, and mail show configuration values, and testing shows the package test command. Model scaffolding explains that its table must already exist. Its job, subscriber, schedule, and command examples retain the current make-template contracts with photo workflow logic added. The controller receives the concrete photo service. Testing uses `webtest.NewContext` with an explicitly App-owned test fixture helper that seeds photo 42; no HTTP server is required. Ten example tabs use a minimal grid with an ember-colored active indicator. Code frames size to their content without stretching to the copy column; long snippets scroll inside a bounded code panel and reset to the top on selection.

The starter kits showcase follows the landing page's thin preview borders, full section rails and square markers, restrained ember backgrounds, framework block icons, and compact command wrappers. Its hero leads with sign-in and layers a dashboard behind it, clipped at the page frame and the next section. The three first-party kits have individual cards; bringing an existing frontend remains a separate guide link. `forj new` and `forj dev` are individually copyable, with development run from the new project.
