# Site Theme System

## Purpose

This file maps the visual layer of the docs site so future sessions can extend it without rediscovering structure, tokens, or hard-won gotchas. It covers the custom VitePress theme: landing page, docs view, search, 404, motion system, and analytics.

Read this before editing `docs/.vitepress/theme/custom.css` or `docs/.vitepress/theme/index.js`.

## File Map

- `docs/.vitepress/theme/custom.css` - all theme styling (~3700 lines). Landing (`gf-home-*`), starter kit page (`gf-starter-*`), docs view refinements, code variants, search, 404, lightbox, banner.
- `docs/.vitepress/theme/index.js` - theme entry. Layout slots (preview banner, 404, motion/code pickers), lightbox, mermaid, outline/sidebar auto-scroll, hash-offset settle passes, page-enter replay, banner height measurement.
- `docs/.vitepress/theme/components/` - `GoForjHeroStack.vue` (isometric forge hero), `StarterKitHeroScreens.vue` (CSS class-toggled screenshot reveal), `MotionPicker.vue`, `CodeVariantPicker.vue`, `ApiIndexJump.vue`, `LibraryRepoHeader.vue`.
- `docs/index.md` - landing page sections and inline `<script setup>` (swap toggle, count-ups, section analytics).

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
