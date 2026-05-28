# GoForj Documentation Execution Plan

## Purpose

This is the actionable source of truth for building the GoForj public documentation system.

Use this file as the working plan. Check boxes as pages, navigation changes, examples, and validation tasks are completed.

## Planning Rules

- [ ] Preserve Libraries as a first-class top-level section for standalone first-party Go packages.
- [ ] Build framework docs around generated GoForj Apps, runtime lifecycle, explicit DI, named resources, and operations.
- [ ] Keep library pages useful to users who do not adopt the full framework.
- [ ] Link framework pages to Libraries for primitive APIs, constructors, driver matrices, and standalone usage.
- [ ] Link Libraries back to framework guides for generated App integration.
- [ ] Do not duplicate full library README content in framework workflow pages.
- [ ] Do not expand deep framework reference before the first application-building path exists.
- [ ] Verify command names and generated file paths from source before publishing pages.

## Phase 0: Internal Foundation

Goal: finish the internal AI/docs operating layer.

- [x] Create `ai/docs-constitution.md`.
- [x] Create `ai/vision.md`.
- [x] Create `ai/philosophy.md`.
- [x] Create `ai/terminology.md`.
- [x] Create `ai/tone.md`.
- [x] Create `ai/docs-style-guide.md`.
- [x] Create `ai/golden-paths.md`.
- [x] Create `ai/anti-patterns.md`.
- [x] Create `ai/architecture.md`.
- [x] Create `ai/framework-docs-analysis.md`.
- [x] Create `ai/information-architecture.md`.
- [x] Create `ai/page-templates.md`.
- [x] Create `ai/review-checklists.md`.
- [x] Create `ai/example-registry.md`.
- [x] Create `ai/operations-docs-model.md`.
- [x] Create `ai/driver-decision-model.md`.
- [x] Create `ai/library-docs-model.md`.
- [x] Create `ai/generated-components-model.md`.
- [x] Create `ai/runtime-topology-model.md`.
- [x] Create `ai/product-surfaces-model.md`.
- [x] Create `ai/marketing-site-strategy.md`.
- [x] Create `ai/source-context-map.md`.
- [x] Create `ai/ai-docs-workflow.md`.
- [x] Replace older non-actionable planning notes with this actionable roadmap.

Exit criteria:

- [x] Internal docs operating model exists.
- [x] Terminology source of truth exists.
- [x] Page templates exist.
- [x] Review checklists exist.
- [x] Libraries and framework projections are modeled separately.

## Phase 1: Navigation and IA

Goal: make the site structure reflect the intended docs system before writing many pages.

- [x] Create a top-level `libraries/index.md`.
- [x] Create placeholder directories for `getting-started`, `core`, `applications`, `data`, `async`, `testing`, `operations`, and `reference`.
- [x] Update VitePress nav to expose `Getting Started`, `Core Concepts`, `Applications`, `Async`, `Operations`, and `Libraries`.
- [x] Update VitePress sidebar to group existing library pages under `Libraries`.
- [x] Keep existing library URLs or redirects stable.
- [x] Add search titles/descriptions that distinguish framework guides from library pages.
- [x] Add a public docs landing page section that explains the two paths: build a GoForj App or use standalone Libraries.

Exit criteria:

- [x] A reader can find Libraries without treating them as an appendix.
- [x] A reader can find the framework getting-started path without browsing library pages first.
- [x] Existing library pages remain reachable.

## Phase 2: First 10 Framework Pages

Goal: publish the minimum coherent "build with GoForj" path.

Write these in order:

- [x] `getting-started/quickstart.md`
- [x] `getting-started/project-structure.md`
- [x] `getting-started/configuration.md`
- [x] `core/runtime-lifecycle.md`
- [x] `core/runtime-topology.md`
- [x] `core/dependency-injection.md`
- [x] `core/generated-components.md`
- [x] `applications/http-services.md`
- [x] `async/events-vs-queues.md`
- [x] `testing/overview.md`

Acceptance criteria for each page:

- [x] Uses terminology from `ai/terminology.md`.
- [x] Follows the relevant template from `ai/page-templates.md`.
- [x] Names generated App locations when relevant.
- [x] Shows local-first behavior before production variants.
- [x] Includes a verification step when task-oriented.
- [x] Links to the next likely page.
- [x] Links to Libraries when deeper primitive detail is needed.

## Phase 3: Libraries Track

Goal: preserve and improve standalone first-party library docs while connecting them to framework guides.

- [x] `libraries/index.md` explains the Libraries section and groups packages.
- [x] `libraries/cache.md` has or links to a concise "Using With GoForj" note.
- [x] `libraries/storage.md` has or links to a concise "Using With GoForj" note.
- [x] `libraries/queue.md` has or links to a concise "Using With GoForj" note.
- [x] `libraries/events.md` has or links to a concise "Using With GoForj" note.
- [x] `libraries/scheduler.md` has or links to a concise "Using With GoForj" note.
- [x] `libraries/wire.md` has or links to a concise "Using With GoForj" note.
- [x] Decide whether `web` should appear as `libraries/web.md` in addition to or instead of `httpx.md`.
- [x] Decide whether `metrics` should be added under Libraries.
- [x] Keep README-slurped API/reference sections intact for standalone package users.
- [x] Avoid duplicating full driver matrices in framework workflow pages.

Exit criteria:

- [x] Standalone package users can still succeed from library docs.
- [x] Generated App users can jump from framework guides to library details without confusion.
- [x] Major primitives have bidirectional links between framework and library projections.

## Phase 4: Core Concepts Expansion

Goal: finish the conceptual layer needed by all feature docs.

- [x] `core/app.md`
- [x] `core/providers.md`
- [x] `core/drivers-and-adapters.md`
- [x] `core/generated-extension-points.md`
- [x] `core/named-resources.md`
- [x] `core/code-generation.md`
- [x] `core/local-first-development.md`

Exit criteria:

- [x] App, Framework, Stack, Runtime, Provider, Driver, Adapter, Service, Resource, Inspect, and Lighthouse are consistently explained.
- [x] Generated component codegen and named accessors are explained before cache, queue, storage, events, and database guides depend on them.
- [x] Runtime topology is explained before operations pages depend on it.

## Phase 5: Application Building

Goal: let users build normal GoForj App features.

- [x] `applications/routes.md`
- [x] `applications/controllers.md`
- [x] `applications/middleware.md`
- [x] `applications/requests-validation.md`
- [x] `applications/responses-errors.md`
- [x] `applications/services.md`
- [x] `applications/commands.md`

Exit criteria:

- [x] Reader can add routes, controllers, services, and commands.
- [x] Examples keep business logic out of runtime bootstrap.
- [x] HTTP docs use `web` abstractions and link to the standalone library page.
- [x] Route visibility through `route:list` is documented.

## Phase 6: Data and Persistence

Goal: explain durable data, derived data, and file/blob storage boundaries.

- [x] `data/database-strategy.md`
- [x] `data/migrations.md`
- [x] `data/repositories.md`
- [x] `data/transactions.md`
- [x] `data/cache-patterns.md`
- [x] `data/storage-patterns.md`
- [x] `data/driver-selection.md`

Exit criteria:

- [x] Readers understand source-of-truth versus cache.
- [x] Storage disks and cache accessors are documented as named resources.
- [x] `*_SUPPORTED_DRIVERS` generation is explained where relevant.
- [x] Database guidance is honest about current framework ownership.

## Phase 7: Async and Workflows

Goal: explain background work, fan-out, and recurring work.

- [x] `async/queues.md`
- [x] `async/jobs.md`
- [x] `async/workers.md`
- [x] `async/events.md`
- [x] `async/event-subscribers.md`
- [x] `async/scheduler.md`
- [x] `async/retries-idempotency.md`

Exit criteria:

- [x] Events and queues are clearly separated.
- [x] Jobs are named and observable.
- [x] Workers and scheduler lifecycle are explicit.
- [x] Local-first and production drivers are separated.
- [x] Queue and event docs link to standalone Libraries.

## Phase 8: Testing

Goal: make tests part of the normal GoForj workflow.

- [x] `testing/unit-tests.md`
- [x] `testing/http-tests.md`
- [x] `testing/command-tests.md`
- [x] `testing/job-queue-tests.md`
- [x] `testing/event-tests.md`
- [x] `testing/cache-storage-tests.md`
- [x] `testing/integration-tests.md`
- [x] `testing/rendered-app-smoke-tests.md`

Exit criteria:

- [x] Each major subsystem has a test path.
- [x] Local drivers and fakes are documented.
- [x] Rendered App smoke testing is documented for framework contributors.

## Phase 9: Operations and Observability

Goal: make production and runtime behavior explicit.

- [x] `operations/deployment-basics.md`
- [x] `operations/runtime-processes.md`
- [x] `operations/http-server.md`
- [x] `operations/queue-workers.md`
- [x] `operations/scheduler-processes.md`
- [x] `operations/health-readiness.md`
- [x] `operations/logging.md`
- [x] `operations/metrics.md`
- [x] `operations/inspects.md`
- [x] `operations/lighthouse.md`
- [x] `operations/standalone-vs-distributed.md`
- [x] `operations/production-checklist.md`

Exit criteria:

- [x] Every long-running runtime has process, startup, shutdown, and failure docs.
- [x] Metrics and inspects are explained before Lighthouse dashboards.
- [x] Standalone versus distributed topology is explicit.
- [x] Infrastructure startup is documented without claiming a general lazy initialization model.

## Phase 10: Product Surfaces

Goal: document larger framework capabilities that compose multiple primitives.

- [x] `security/auth.md`
- [x] `getting-started/starter-kits.md`
- [x] `frontend/vue-starter-kit.md`
- [x] `applications/api-index.md`
- [x] `applications/openapi.md`
- [x] `developer-tools/forj-dev.md`
- [x] Decide when extension docs can become public user docs.

Decision: extension docs can become public user docs when they describe stable App-owned extension points, name generated file ownership clearly, avoid maintainer-only template workflow, and link to internal/generated component details instead of exposing template implementation as the primary path.

Exit criteria:

- [x] Auth docs explain server-authoritative sessions, cookies, refresh behavior, reset/verification, scheduled cleanup, and inspect visibility.
- [x] Starter kit docs explain generated ownership and optional component compatibility.
- [x] API Index docs are explicit about current AST-based capabilities and limits.
- [x] `forj dev` docs match the transcript-first tooling model.

## Phase 11: Framework Reference

Goal: provide lookup material after workflow docs exist.

- [x] `reference/cli.md`
- [x] `reference/env-vars.md`
- [x] `reference/configuration.md`
- [x] `reference/generated-files.md`
- [x] `reference/generation-commands.md`
- [x] `reference/errors.md`

Exit criteria:

- [x] Framework-level lookup details live in reference.
- [x] Workflow pages link to reference.
- [x] Framework reference does not duplicate full library API indexes.

## Phase 12: Documentation Versioning

Goal: tag the current documentation line and establish the versioning model before publishing.

- [x] Expose the current docs version as `v0.9`.
- [x] Add a nav version selector.
- [x] Add `versions/index.md` with the public version policy.
- [x] Add `ai/docs-versioning.md` with internal versioning governance.
- [ ] Create a frozen `/versions/v0.9/` snapshot when a second active documentation line exists.

Exit criteria:

- [x] Readers can see which documentation line they are reading.
- [x] Maintainers know when to snapshot and what to snapshot.
- [x] Library docs remain separate from framework version snapshots until package-version alignment requires otherwise.

## Future Marketing Surfaces

Goal: keep product storytelling, showcase pages, and future publishing surfaces aligned with the documentation system.

- [x] Capture the unified VitePress-first site strategy in `ai/marketing-site-strategy.md`.
- [x] Add a top-level Starter Kits marketing page that is separate from the starter kit docs page.
- [x] Add a lightweight Blog surface with a real first post instead of placeholder content.
- [ ] Decide when to add a public `Showcase` section beyond individual top-level product pages.
- [ ] Design the first Lighthouse showcase page as a product story, not API reference.
- [x] Decide when a lightweight blog/news section has enough content to justify public navigation.
- [ ] Verify the Starter Kits hero screenshot animation visibly runs on full page refresh.
- [ ] Revisit whether VitePress is still the right platform if CMS workflows, complex demos, or separate marketing ownership become real constraints.

Exit criteria:

- [x] Marketing pages, showcase pages, blog posts, docs pages, and library pages have distinct roles.
- [x] Product storytelling supports the docs learning path instead of competing with it.
- [ ] Any future platform split is based on concrete constraints, not aesthetic preference alone.

## First Runnable Scenarios

Status: paused after the first five scenarios.

Do not continue expanding runnable scenarios until the publishing-quality pass is complete, unless explicitly requested.

Build these after the first 10 framework pages:

- [x] Create `ai/runnable-scenarios.md` to define the shared scenario model.
- [x] JSON API route with controller and service.
- [x] Cached user profile lookup.
- [x] File upload to named storage disk.
- [x] `users.created` event with subscriber.
- [x] `reports:generate` job and worker.
- [ ] `reports:daily` schedule.
- [ ] Runtime observability through metrics and inspects.

Remaining scenario action items:

- [x] Add `reports:daily` schedule scenario that dispatches existing durable work instead of duplicating job logic.
- [x] Add runtime observability scenario that follows API -> event -> job -> schedule behavior through metrics, inspects, Lighthouse, and logs.
- [ ] Re-review all runnable scenarios as one sequence for command consistency, generated file ownership, local-first driver choices, and repeated terminology.

## Publishing Quality Pass

Goal: move from broad coverage to publishable confidence.

Work these before adding more scenario pages:

- [x] Run a complete navigation pass across all top-level sections.
- [x] Review every section index page for clear reader orientation and next-step links.
- [x] Audit public pages for stale command names, especially `forj run app`, `forj run api`, `forj run worker`, `forj run scheduler`, and production `./bin/app` commands.
- [x] Audit environment variable examples against source-generated configuration keys.
- [x] Audit generated file paths against current templates and rendered App output.
- [ ] Review code snippets for imports, constructor names, package names, and compile-shaped examples.
- [x] Ensure framework pages link to Libraries for standalone primitive detail without duplicating README content.
- [x] Ensure Libraries pages link back to framework guides only where generated App integration is relevant.
- [x] Review sidebar ordering and top nav for the intended learning path.
- [x] Run `npm run build` after quality-pass changes.

## Quality Gates

Apply before publishing a page:

- [ ] Page follows the relevant template.
- [ ] Terminology matches `ai/terminology.md`.
- [ ] Examples use canonical names from `ai/example-registry.md`.
- [ ] Commands are verified against source or generated templates.
- [ ] File paths are verified against source or generated templates.
- [ ] Framework pages link to Libraries for primitive details.
- [ ] Library pages remain useful to standalone package users.
- [ ] Operations pages cover startup, shutdown, logs, metrics, inspects, failure modes, and production checklist where relevant.
- [ ] VitePress build passes, or the blocker is documented.
