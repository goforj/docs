# GoForj Experience Audit Plan

## Purpose

This is the working plan for improving the GoForj public experience across three surfaces: the landing page, the documentation site, and the ecosystem repo READMEs.

It was produced from a full review of `ai/`, `goforj/docs/`, the published site content in `docs/`, and the READMEs of all 19 sibling repos plus the GitHub org profile. Items are ranked by value for effort. Check boxes as work completes.

Use this file with `docs-roadmap.md`. That file tracks page production. This file tracks experience quality and funnel coherence.

## Sources reviewed

- `ai/` governance layer (constitution, terminology, tone, templates, anti-patterns, roadmap)
- `goforj/docs/context/` and `goforj/docs/designs/` (architecture, in-flight designs)
- `docs/` site content: 134 public Markdown pages, landing page, nav config, and theme components (verified 2026-07-12)
- READMEs: cache, collection, crypt, env, events, execx, godump, httpx, mail, metrics, null, queue, scheduler, storage, str, web, wgo, wire, goforj
- `goforj.github/profile/README.md` (org profile)

## Strategy decisions to resolve first

These block or shape several items below. Decide before executing Tier 1.

- [ ] **Release state.** `goforj/README.md` is an 11-line placeholder saying the project is unreleased and private, while the landing page and hero tell visitors to run `go install github.com/goforj/goforj/cmd/forj@latest`. One of these is wrong for any given launch date. Decide the public story and make every surface match it.
- [x] **One positioning statement.** The docs and marketing strategy lead with "the composable application stack for Go" and present standalone libraries as the second adoption path.
- [x] **Stat sourcing.** `bin/collect-proof-stats.mjs` mechanically generates the landing proof-band data from sibling repositories.

## Tier 1: quick wins

High value, low effort. Most are funnel fixes rather than new content.

### 1. README to docs-site funnel

Zero of the 19 repo READMEs link to goforj.dev. The libraries are the discovery surface (godump is listed in Awesome Go; str, collection, queue, and cache are strong standalone pitches), and today every visitor who arrives at a repo dead-ends there.

- [ ] Define one standard README block: a short "Part of the GoForj ecosystem" line plus links to goforj.dev, the library's docs page (`goforj.dev/<library>`), and the libraries index.
- [ ] Apply it to all 19 repos, near the top badges, not buried at the bottom.
- [ ] Add a "Use it with GoForj" section to the strongest READMEs (cache, queue, storage, events) showing the named-accessor form (`caches.Default()`, `queues.Reports()`) with a link to the framework guide.

### 2. Rewrite `goforj/README.md`

The core repo README is the most likely click target from the site's GitHub button and from every `go install` reference. Eleven placeholder lines undercut the entire landing page.

- [ ] Rewrite to mirror the landing positioning: what GoForj is, the two-command start, the library/framework dual path, links to quickstart and docs.
- [ ] If the framework is still gated, say so plainly and route visitors to the libraries instead. Do not leave the contradiction standing.

### 3. Align the org profile

- [ ] Update `goforj.github/profile/README.md` to the chosen positioning statement, add a visual or table of the ecosystem with docs links, and link the quickstart.

### 4. Production asset and link hygiene

- [x] Mark the starter-kit screenshot item in `docs-roadmap.md` as done. The screenshots are tracked in git (verified 2026-07-12).
- [x] Keep internal dead-link validation in the VitePress production build.
- [x] Generate proof-band numbers from sibling repositories with `bin/collect-proof-stats.mjs`.

### 5. Quickstart hardening

The journey from landing to first success is about 8 commands and 15 to 20 minutes, but the quickstart assumes nothing goes wrong.

- [ ] Add a short troubleshooting section: Go version requirements, PATH issues after `go install`, port conflicts on 3000, wire errors on first build (link `core/reading-wire-errors.md`).
- [ ] Show the `forj new` wizard interaction itself, since the wizard is the first product surface a user touches.
- [ ] End with an explicit "you are here, go to scenario 1" handoff into the verified scenario path.
- [ ] State the expected time to first success on the landing page start section and at the top of the quickstart.

## Tier 2: depth and trust

High value, moderate effort. This is content work and should follow `page-templates.md` and `review-checklists.md`.

### 6. Thicken the thin core concept pages

There is a depth cliff between concept pages (100 to 160 lines) and library or scenario pages (250 to 1,000+ lines). The concept pages carry the application model, which the constitution says is the thing the docs must teach.

- [ ] `core/dependency-injection.md`: add one full worked example from provider to wire generation to reading the generated output, including a failure case.
- [ ] `core/runtime-lifecycle.md`: trace one request and one job through startup, execution, and graceful shutdown with the actual hook points (`app/lifecycle.go`).
- [ ] `applications/routes.md` and `applications/controllers.md`: ground each in the canonical Users domain from `example-registry.md` with compiling code.
- [ ] Audit the remaining core pages against the feature-page template and list which sections each is missing.

### 7. Fill or fold the stub sections

Security, Frontend, and Developer Tools have 2 to 3 pages each and read as unfinished sections rather than small sections.

- [x] Security: add Auth, sessions and cookies, OAuth, and production hardening guides.
- [x] Frontend: document the Vue, React, and templ + htmx starter kits and their serving models.
- [x] Developer Tools: document Atlas, Atlas debugging, `forj dev`, and generated-file opening.
- [x] Rule: no top-level sidebar section with fewer than 4 substantive pages.

### 8. Snippet verification and multi-app path sync

Two known gaps from the roadmap, treated as one editorial pass.

- [ ] Verify code snippets across the site for imports, constructor names, and package names against current sources (the standing quality gate in `ai-docs-workflow.md`).
- [ ] Sweep older pages for pre-multi-app paths and update to the current layout per `multi-apps-docs-plan.md` (`cmd/app/main.go`, `app/`, `app/wire/`, `internal/runtime/`, `forj <app> <command>`).
- [ ] Add a terminology lint pass: inspect not trace, render not generate, App and Component and Extension used per `terminology.md`.

### 9. Landing page refinements

The landing page is strong. These are adjustments, not a redesign.

- [ ] Add a one-line audience qualifier near the start section stating who this is for (Go developers building services, workers, CLIs, and products) per the audience definition in the constitution.
- [ ] Add the time-to-first-success estimate (see item 5).
- [ ] Consider one honest "where GoForj sits" passage: versus plain Go wiring by hand and versus dynamic-language frameworks. Keep it within constitution limits, positioning not comparison marketing. Decision pages exist for the details.
- [ ] Wire the proof-band stats to the canonical stat source once it exists.

## Tier 3: strategic

Larger efforts. Sequence after Tiers 1 and 2 unless launch timing pulls one forward.

### 10. AI-agent docs surface

The `ai/` layer governs authoring. The inverse surface is missing: making the docs consumable by users' AI tools, which matches the audience definition (AI agents are a stated tertiary audience) and the in-flight Go MCP server design.

- [ ] Generate `llms.txt` and `llms-full.txt` from the site content at build time.
- [ ] Add a short "Using GoForj with AI tools" page once the MCP server design lands.

### 11. Cross-primitive integration content

READMEs and library pages are siloed per primitive. The framework's pitch is coherence.

- [ ] Add one or two scenarios or guides that compose primitives (queue plus scheduler plus storage is already implicit in the Reports domain; make it explicit as a guide).
- [ ] Mention composition in the strongest READMEs (see item 1).

### 12. Pre-stage IA for in-flight designs

- [ ] Reserve IA placement and terminology for Extensions before the feature ships, so launch-day docs do not get bolted on. Extension is already a reserved term; the section is not designed.
- [ ] Same for the resource registry and `forj dev` TUI changes where they alter user-visible behavior.

### 13. Deferred items

- [ ] Versioning snapshot (`/versions/<version>/`) when a second documentation line exists, per `docs-versioning.md`.
- [ ] Showcase section and blog cadence decision, per the open item in `docs-roadmap.md`.
- [ ] Weak-tier README rebuilds (metrics, null, wire, wgo) to the standard layout: centered header, badge row, pitch, install, quick example. Lower priority than item 1 because traffic is lower, but metrics is a framework-facing primitive and currently reads as abandoned next to its siblings.

## Progress log

2026-06-11 session:

- [x] Quickstart rewritten: two-command path, wizard transcript, troubleshooting, scenario handoff, time framing.
- [x] Landing: audience line, time-to-success note, forj-primary command surfaces with `# → ./bin/app …` comments, metrics port corrected.
- [x] Command convention swept: forj-first with binary shown beside it in dev contexts (`async/queues.md`, `async/workers.md`); production pages keep binary-first.
- [x] Metrics port drift fixed: stale `9100` block replaced with real `10000/10001/10002` defaults in `operations/metrics.md`, `operations/http-server.md`, `applications/http-services.md`, `scenarios/runtime-observability.md`, and the landing terminal. Source of truth: `project_renderer.go` (`RuntimeBase: 10000 + i*10`) and `templates/.env.tmpl`.
- [x] Heading convention: use Title Case with lowercase connector words. Codified in `tone.md`, `docs-style-guide.md`, and `review-checklists.md`.
- [ ] Re-verify `scenarios/runtime-observability.md` end to end since its metrics ports changed (scenarios ship only after execution).
- [x] Scenario rendering bug found and fixed: `replace` steps with an empty `new` (deletions) rendered as "Update ... so it includes:" plus an empty code block (`reports-generate-job.md` steps 8 and 9). Renderer in `goforj/internal/scenarios/scenarios.go` now renders deletions as "Remove from `path`:" with the removed content. Stale `9100` ports also fixed in `specs/runtime-observability.yaml`. Generated pages hand-patched to match the fixed renderer.
- [x] Verified Scenario banner strengthened from "We test this scenario against the current GoForj templates..." to explicit automation language: generated from an executable spec, fresh App rendered from current templates, every step applied in order, every verification command run, failure blocks publication. Changed in the renderer (`scenarios.go`) and hand-synced across all seven published pages. Wording verified against what `runScenario` actually does.
- [ ] Run from the goforj repo to confirm parity and re-verify: `go test ./internal/scenarios`, then `forj scenario:generate --all --out-dir <docs repo>/docs/scenarios --check`, then `forj scenario:test --all`. The sandbox had no Go toolchain, so the renderer change is compile-checked by inspection only.

2026-06-11 session, second pass (high-leverage builds):

- [x] Cookbook shipped at `/cookbook`: an intent-based "how do I" index with ~60 entries across nine groups, linked from the Getting Started nav and sidebar. All links validated by the build's dead-link check.
- [x] `llms.txt` and `llms-full.txt` now generate at build time (`buildEnd` in config.mts): a linked index with per-page descriptions, and the full docs corpus with frontmatter and Vue script blocks stripped, ordered to match the sidebar. Landing page excluded by design.
- [x] Sitemap generation enabled (`sitemap.hostname`), and `editLink` added pointing at goforj/docs (verified public).
- [x] Landing "Fit" section shipped between scenarios and manifesto: honest reach-for / reach-elsewhere cards plus the eject promise ("Stop running forj tomorrow and your application still builds, tests, and deploys"). New CSS mirrors the operations card language.

- [x] Live terminal shipped on the landing start section (`GoForjLiveTerminal.vue`): types `forj new`, `forj dev`, and the health curl, replaying output with realistic pacing on a loop. Output lines follow verified command shapes from goforj source (`buildDevReadySummaryLines`: "✔ Dev ready" with App, Lighthouse, and Swagger links). SSR renders the full static transcript; reduced motion and the gfMotion override stay static; height is reserved before replay so layout never shifts. The sandbox could not run forj itself (go.dev and proxy.golang.org blocked), so the transcript is reconstructed from source, not captured. To replace with a live capture: record a real run, then update the LINES array in the component.

2026-06-12 session, third pass:

- [x] Proof stats generated, not written: `bin/collect-proof-stats.mjs` reads README executed-count badges plus mechanical `func Test` counts across the 17 libraries, writes `docs/.vitepress/data/proof-stats.json`, and the landing proof band renders from it. New `/numbers` page documents methodology, per-library detail, and the published collection and queue benchmark highlights, with honest footnotes (only 6 of 17 libraries publish badges today; the rest should add them).
- [x] `/drivers` page: all 49 drivers across the six swap primitives in one matrix, count sourced from the same JSON as the landing.
- [x] `/whats-new` page shipped, then removed by decision: two entries read as a graveyard, not a pulse. Bring it back once releases carry notes and there is a cadence to feed it. The numbers and performance pages were likewise removed; the generated proof band on the landing page, linking to the counting script, is the surviving form of that work.
- [x] Scenario course treatment: specs and renderer now carry `path_position`, `path_total`, `estimated_minutes`; every scenario page opens with "Scenario N of 7 ... about M minutes" (estimates are drafts, verify against real runs); scenarios index reframed as a numbered path with total time and an "After The Path" handoff. Regenerate and `scenario:generate --check` from the goforj repo to confirm parity.

Idea backlog (not yet executed, roughly ranked):

- [ ] Show Lighthouse on the landing page: a real capture of an inspect timeline. Strongest unshipped conversion asset.
- [x] Live terminal transcript replaced with a real captured run (2026-06-11, photodrop, Vue starter kit, full default components). Lines are verbatim from the capture; curation for pane width is documented in the component comment (condensed confirm panel, final compose count only, VictoriaMetrics link and two log-line tails omitted).
- [x] Changelog and public version story: `/versions/changelog` records framework releases, `v0.20.0` is the latest tag, and the root docs include implemented Unreleased behavior.
- [ ] Queued launch posts: "How we test 40 drivers against real backends", "Inspects: visibility without an OpenTelemetry pilgrimage".
- [x] Proof-band stats generated from the repos so they cannot drift; link each stat to evidence.
- [x] Scenario path as a course: per-scenario time estimates, position indicator, completion handoff.
- [ ] CLI errors print docs URLs for common failures (wire errors especially); optional `forj docs <topic>` command.
- [ ] Funnel definition over existing GA events (install_copy to quickstart to scenario 1) and local-search query logging for gap mining.
- [ ] Confirm force-dark is a deliberate brand decision.

## Evidence notes

Kept brief; the full review lives in session history and can be regenerated.

- Landing page: `docs/index.md` plus `GoForjHeroStack.vue`. Narrative arc is start, swap drivers, capability grid, generators, operations, scale, proof, scenarios, manifesto, closing. Audience, time-to-success, and generated proof stats are present.
- IA: `docs/.vitepress/config.mts`. Sidebar is coherent, library pages rewritten to root paths, no orphan pages found.
- Depth cliff examples: `core/dependency-injection.md`, `core/runtime-lifecycle.md`, `applications/routes.md`, `applications/controllers.md` versus `libraries/cache.md` and the scenario pages.
- Product sections: `security/`, `frontend/`, and `developer-tools/` each expose at least four substantive pages in the sidebar.
- README funnel: no README links to the docs site (str mentions goforj.dev only inside example code); org profile positioning differs from site; `goforj/README.md` is a placeholder; metrics and null lack the standard header and badges.
