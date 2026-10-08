# Site Refresh Handoff, 2026-10-08

Read alongside [Site Theme System](../site-theme-system.md) and the repository AGENTS.md. This records the landing page, starter kits, screenshot refresh, and follow-up fixes from this session.

## Current State

The user has committed changes throughout the session. At handoff start, the worktree was clean and HEAD was `1f352a3 chore: adjust favicon`. Earlier commits include `b46b8ab feat: refresh landing and starter kit showcases`, `ed8c073 fix: remove blog`, `ab6be1f fix: preview image`, and `784f384 chore: re-add favicon`. Always check current status and history before editing; do not assume files are still uncommitted.

No deployment or push was performed by the agent. Temporary processes and screenshots are conveniences, not durable prerequisites. Inspect listening ports before starting a server; VitePress silently picks another port if 5190 is occupied.

## User Preferences

- Restrained ember glows, thin borders, square section rails with small orange square intersections.
- Screenshots should tuck behind the next block's divider. Avoid floating rounded bottom edges on code previews.
- Minimal screenshot framing. No pseudo Safari chrome or large marketing caption bars.
- Show sign-in first, with other starter screens visible together rather than behind selector pills.
- Use actual framework icons from the existing design system.
- Landing examples should be focused fragments with visible meaningful behavior, not constructors and type boilerplate. Do not hide the main operation behind an unexplained helper.
- Short code examples need concise left-side content. Compact examples omit benefit bullets; Jobs, Commands, and Testing retain them.
- Keep commands on one line, horizontally scrollable when necessary, in slim individually copyable wrappers.
- Testing is the final example tab.
- Avoid describing ordinary product behavior as "generated". Use that term only when ownership or regeneration matters.
- Keep the docs navbar solid. The content aura fades in below it; the user rejected making the navbar transparent to conceal a seam.

## Source Map

| Surface | Authoritative files |
| --- | --- |
| Landing markup and example state | `docs/index.md` |
| Landing layout overrides | `docs/.vitepress/theme/home.css`, imported after `custom.css` |
| Docs sidebar, prose, aura | `docs/.vitepress/theme/custom.css` |
| Starter showcase | `docs/starter-kits.md`, `docs/.vitepress/theme/starter-kits.css` |
| Hero and kit illustrations | `GoForjHeroStack.vue`, `StarterKitHeroScreens.vue`, `StarterKitOptions.vue`, `FrameworkBlockIcon.vue` in theme components |
| Runtime illustrations | `RuntimeTopology.vue`, `ProjectAppsDiagram.vue` |
| Development transcript | `DevTerminalPreview.vue` |
| Metadata, navigation, favicon | `docs/.vitepress/config.mts` |
| Refresh scroll restoration | `docs/.vitepress/theme/index.js` |
| Brand exports | `docs/public/logo-lab.html` |

The home layout also contains `.vp-doc`. Bare `.vp-doc` selectors can leak docs styling onto the landing page. Article heading decorations generally need `.VPDoc.has-sidebar` scope. `custom.css` has historical overlapping rules; inspect computed styles rather than assuming the first matching rule wins.

## Refreshing Starter Kit Screenshots

### Provenance

Twenty files under `docs/assets/starter-kits/` were refreshed from a real, newly rendered Vue starter with authentication and the component library enabled. The initial source checkout was GoForj `9e6dc6fb`. A later template-copy pass was followed by fresh captures of dashboard, profile, components, navigation, and command menu. The Vue, React, and templ template wording changes belong to sibling `../goforj`, not this documentation repository.

The capture App used SQLite, memory cache, local storage, workerpool, inproc events, and log mail. HTTP used port 5194 during that capture. The old `/tmp` App and binaries are not a repeatable source of truth. No durable capture script was checked in during this session, and exact wizard keystrokes are not preserved.

### Repeatable Procedure

1. Inspect current `../goforj` source and CLI help. Build the CLI from current source with `GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache`. Do not assume a globally installed `forj` contains current template changes.
2. Create the project in a fresh `/tmp` directory, never inside the framework checkout. Use `forj new` and select Vue, authentication, and the component library. Verify current wizard/config schema rather than guessing unattended flags.
3. Use standalone drivers so the capture does not start Redis, Postgres, mail containers, or other services. SQLite avoids database port conflicts; the HTTP listener still needs a free port. Verify active driver selections against `../goforj/project/resource_catalog.go` and rendered environment files.
4. Run the current App's build/dev workflow. If frontend templates changed, rebuild the frontend as well. Confirm the served page actually contains the new text before taking pictures.
5. Seed only local sample account data. Authenticate through the actual application. Never commit credentials, cookies, local databases, or environment files.
6. Capture in dark mode using Playwright. Full screens used viewport **1496 x 938 at deviceScaleFactor 2**, giving 2992 x 1876 PNGs. Account details use targeted crops; inspect existing file dimensions and displayed content to reproduce framing rather than blindly replacing every image with a full viewport.
7. Wait for fonts and images before capture. Open dialogs and command menus through the UI. The password-reset confirmation came from submitting the real recovery form, not editing HTML to fabricate a result.
8. Replace existing named assets so all consumers update. Review both the landing page and `/starter-kits`, including narrow viewports and light theme. Import images used by dynamic Vue bindings so Vite includes production asset URLs.
9. Stop only capture processes you started. Remove temporary credentials and browser state. Do not stop unrelated user services.

### Screen Mapping

Verify routes against `../goforj/templates/starter-kits/vue/frontend/src/router.ts` each time. At handoff:

| Screen | Route / action | Asset families |
| --- | --- | --- |
| Sign-in | `/login` | `account-login`, `auth-login-focused`, `auth-login-wide`, `browser-login-screen` |
| Registration | `/register` | `account-register`, `auth-register` |
| Recovery / confirmation | `/forgot-password`, submit real form | `account-password-reset`, `account-password-reset-sent` |
| Dashboard | `/` after authentication | `app-dashboard-shell` |
| Settings | `/settings/profile`, `/settings/password`, `/settings/appearance` | `account-*-settings`, `settings-*` |
| Gallery | `/components/overview` | `components-overview` |
| Navigation | `/components/navigation` | `browser-navigation-patterns` |
| Overlays | `/components/overlays`, open invite dialog | `browser-overlay-patterns`, `overlay-invite-dialog` |
| Command menu | open through UI | `browser-command-palette` |

### Playwright Starting Point

From the docs repository root, the installed package can be imported directly:

```js
import { chromium } from './docs/node_modules/playwright/index.mjs'
const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1496, height: 938 },
  deviceScaleFactor: 2
})
// Navigate to the real capture App, authenticate, and select the target screen.
await page.evaluate(() => document.fonts.ready)
// Use a locator screenshot for account detail crops; a page screenshot for full screens.
await page.screenshot({ path: '/tmp/starter-dashboard.png' })
await browser.close()
```

Use actual app labels and route guards from current source. This is a starting point, not an end-to-end script with credentials or assumed selectors.

## Lighthouse and CLI Captures

- `docs/assets/lighthouse/request-inspect.png` is a real inspect with cache calls, a SQLite query, and HTTP exchange. Five actual requests were populated using login and authenticated calls; the selected record was `GET /api/v1/auth/sessions`. Sidebar collapsed through the UI. Capture: **1440 x 700 at 1.5x**. Recreate records through actual traffic, not browser DOM edits.
- The old capture used `/tmp/test3/bin/app`, an older local binary. Do not depend on it next time. Refresh from current source and never edit displayed version numbers.
- `overview.png` is also real, but the landing intentionally uses request inspect rather than dashboard overview.
- `DevTerminalPreview.vue` derives from a fresh standalone-driver templ + htmx App running `forj dev` on port 5196, displayed as default port 3000. Startup output was simplified to match the actual capture. Preparation timings were removed rather than inventing faster numbers. Continuous CSS rails replace disconnected-looking box characters visually.
- Source commands compile/run current code. `forj build` and `forj admin build` create standalone binaries. Do not call the CLI a literal alias for `./bin/app`.

## Code Preview Disappearance: Important Fix

The first reproduced issue was a dynamic Vue class update overwriting `is-inview`, a class applied imperatively by the scroll reveal observer. That observer had already unobserved the element, so it remained invisible. Compact layout now uses `data-compact` instead of a dynamic class.

The final implementation is more robust:

- The interactive code explorer and its left copy have **no `data-reveal` animation**.
- Main example panels use `v-if="swapTab === ..."`. Exactly one main panel exists.
- Event file panels use `v-if` / `v-else`. Exactly one event file exists.
- `home.css` explicitly sets the rendered main panel to `display: block; visibility: visible; opacity: 1; transition: none` to override historical `custom.css` rules.
- Tab changes reset `.gf-home-swap__panels.scrollTop` after `nextTick`.
- Preserve keyboard navigation for the main tabs and both event file tabs.

Repeated checks passed in Chromium and WebKit, at 1440px and 390px, including all tabs and both event files. Do not reintroduce multiple overlapping display, opacity, or reveal states merely to animate selection.

The code window owns **one** `--gf-code-bg` gradient. Its inner panels and language wrappers are transparent. A second gradient on the inner content caused a visible horizontal colour cutoff where short code ended.

## Example Simplification and Framework APIs

Examples are marked `illustrative-fragment`, not complete compiling files. Constructors and most owning structs were removed, but meaningful operations and errors remain visible. Full guides provide setup.

- Cache uses the current local generic method `f.cache.WithContext(ctx).Remember(...)`. Its inline loader queries the ten newest photos through GORM; an invisible `rankPhotos` helper was rejected as too opaque.
- Current `../queue/job.go` accepts structs in `.Payload(p)` and stores encoding failures for dispatch validation. The landing no longer manually marshals JSON.
- `msg.Bind(&p)` is the queue payload decoding shortcut. The make-job template still contained explicit `json.Marshal` when checked. Updating that sibling template is separate work; it was not changed here.
- Jobs source: `../goforj/templates/internal/makecmd/job.tmpl`; other make examples are in that directory. Driver choices come from `../goforj/project/resource_catalog.go`.
- Named Resources Mermaid labels are quoted, especially `"Queues().Critical()"`, to avoid Mermaid interpreting parentheses as syntax.

## Navigation, Social Metadata, and Favicons

- Blog removed from the Reference menu. Blog pages and their local sidebar remain accessible by URL. Landing already had no blog link.
- Main and starter kits frontmatter explicitly set `ogImage` to `/assets/goforj-og-20260731.png`, alt text, and 1200 x 630 dimensions. Otherwise the metadata resolver chooses the first content image. Built HTML was checked for exactly one `og:image` and `twitter:image` on both pages. Chat clients may cache old previews.
- Sidebar headings use Inter, 14px, weight 700, primary ink, normal casing and tracking. Avoid restoring the hard-to-read small uppercase monospace headings.
- Docs aura is on `.VPDoc::before`, with a mask fading from transparent at zero to black at 64px. There is no bright orange top seam. Navbar backing remains solid.
- Current favicon assets: `favicon-tile.svg`, `favicon-tile-32.png`, `favicon-tile.ico`. Cache version is `20261008-2`. The ICO contains 16, 32, and 48px PNG entries. Keep fallback declarations alongside SVG.

### Re-exporting the Tile Favicon

The tile is from the existing design system, not a newly invented brand mark. Load `/logo-lab.html` in Playwright and evaluate:

```js
const svg = await page.evaluate(() =>
  rTile(128, P_DARK, { seam: true, label: 'GoForj' })
)
```

Write this SVG to `docs/public/favicon-tile.svg`. Rasterize that SVG with browser canvas at 16, 32, and 48px. Save the 32px image as `favicon-tile-32.png`. Pack those PNG buffers into an ICO directory with the corresponding sizes and offsets. The logo-lab renderer is the design source; the exported assets are checked-in derivatives. Do not change navbar logo assets just to change the favicon.

The pre-existing `icon-tile.png` rendered as a plain orange square when inspected. Do not assume that filename is a valid finished tile export. The SVG renderer above produced the proper dark mark on the rounded orange plate.

Temporary preview `/tmp/goforj-favicon-tile-preview.png` shows 16px icons in dark/light tab mockups. It is a mockup, not a screenshot of browser chrome.

## Validation and Remaining Limitations

- Run `npm run build` from `docs/`. During this session its prebuild gate failed on an existing release metadata contract: `.vitepress/data/release.json: latest release must match v0.28.0`. Recheck current state before treating that as still present. Do not silently change release metadata as part of styling work.
- Direct `./node_modules/.bin/vitepress build .` passed several times, including after final panel rendering changes. This validates compilation but does not replace the failed prebuild audit.
- Theme generation/sync can update `docs/public/design-system.css`. Review generated changes; rebuild from source rather than hand-editing that mirror.
- Final favicon tile export was inspected visually; the earlier fallback links were browser-checked for 200 responses. A full post-tile build was not run before this handoff.
- Use normal-motion browser checks for reveal bugs. Reduced-motion-only checks can hide the issue. For static layout captures, an injected rule making `[data-reveal]` visible is useful, but never treat that as proof of real animation behavior.
- `git diff --check` was run after edits. Review status again before committing the handoff.
