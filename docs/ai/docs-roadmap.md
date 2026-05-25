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

- [x] Create `docs/ai/docs-constitution.md`.
- [x] Create `docs/ai/vision.md`.
- [x] Create `docs/ai/philosophy.md`.
- [x] Create `docs/ai/terminology.md`.
- [x] Create `docs/ai/tone.md`.
- [x] Create `docs/ai/docs-style-guide.md`.
- [x] Create `docs/ai/golden-paths.md`.
- [x] Create `docs/ai/anti-patterns.md`.
- [x] Create `docs/ai/architecture.md`.
- [x] Create `docs/ai/framework-docs-analysis.md`.
- [x] Create `docs/ai/information-architecture.md`.
- [x] Create `docs/ai/page-templates.md`.
- [x] Create `docs/ai/review-checklists.md`.
- [x] Create `docs/ai/example-registry.md`.
- [x] Create `docs/ai/operations-docs-model.md`.
- [x] Create `docs/ai/driver-decision-model.md`.
- [x] Create `docs/ai/library-docs-model.md`.
- [x] Create `docs/ai/generated-components-model.md`.
- [x] Create `docs/ai/runtime-topology-model.md`.
- [x] Create `docs/ai/product-surfaces-model.md`.
- [x] Create `docs/ai/source-context-map.md`.
- [x] Create `docs/ai/ai-docs-workflow.md`.
- [x] Replace older non-actionable planning notes with this actionable roadmap.

Exit criteria:

- [x] Internal docs operating model exists.
- [x] Terminology source of truth exists.
- [x] Page templates exist.
- [x] Review checklists exist.
- [x] Libraries and framework projections are modeled separately.

## Phase 1: Navigation And IA

Goal: make the site structure reflect the intended docs system before writing many pages.

- [ ] Create a top-level `libraries/index.md`.
- [ ] Create placeholder directories for `getting-started`, `core`, `applications`, `data`, `async`, `testing`, `operations`, and `reference`.
- [ ] Update VitePress nav to expose `Getting Started`, `Core Concepts`, `Applications`, `Async`, `Operations`, and `Libraries`.
- [ ] Update VitePress sidebar to group existing library pages under `Libraries`.
- [ ] Keep existing library URLs or redirects stable.
- [ ] Add search titles/descriptions that distinguish framework guides from library pages.
- [ ] Add a public docs landing page section that explains the two paths: build a GoForj App or use standalone Libraries.

Exit criteria:

- [ ] A reader can find Libraries without treating them as an appendix.
- [ ] A reader can find the framework getting-started path without browsing library pages first.
- [ ] Existing library pages remain reachable.

## Phase 2: First 10 Framework Pages

Goal: publish the minimum coherent "build with GoForj" path.

Write these in order:

- [ ] `getting-started/quickstart.md`
- [ ] `getting-started/project-structure.md`
- [ ] `getting-started/configuration.md`
- [ ] `core/runtime-lifecycle.md`
- [ ] `core/runtime-topology.md`
- [ ] `core/dependency-injection.md`
- [ ] `core/generated-components.md`
- [ ] `applications/http-services.md`
- [ ] `async/events-vs-queues.md`
- [ ] `testing/overview.md`

Acceptance criteria for each page:

- [ ] Uses terminology from `docs/ai/terminology.md`.
- [ ] Follows the relevant template from `docs/ai/page-templates.md`.
- [ ] Names generated App locations when relevant.
- [ ] Shows local-first behavior before production variants.
- [ ] Includes a verification step when task-oriented.
- [ ] Links to the next likely page.
- [ ] Links to Libraries when deeper primitive detail is needed.

## Phase 3: Libraries Track

Goal: preserve and improve standalone first-party library docs while connecting them to framework guides.

- [ ] `libraries/index.md` explains the Libraries section and groups packages.
- [ ] `libraries/cache.md` has or links to a concise "Using With GoForj" note.
- [ ] `libraries/storage.md` has or links to a concise "Using With GoForj" note.
- [ ] `libraries/queue.md` has or links to a concise "Using With GoForj" note.
- [ ] `libraries/events.md` has or links to a concise "Using With GoForj" note.
- [ ] `libraries/scheduler.md` has or links to a concise "Using With GoForj" note.
- [ ] `libraries/wire.md` has or links to a concise "Using With GoForj" note.
- [ ] Decide whether `web` should appear as `libraries/web.md` in addition to or instead of `httpx.md`.
- [ ] Decide whether `metrics` should be added under Libraries.
- [ ] Keep README-slurped API/reference sections intact for standalone package users.
- [ ] Avoid duplicating full driver matrices in framework workflow pages.

Exit criteria:

- [ ] Standalone package users can still succeed from library docs.
- [ ] Generated App users can jump from framework guides to library details without confusion.
- [ ] Major primitives have bidirectional links between framework and library projections.

## Phase 4: Core Concepts Expansion

Goal: finish the conceptual layer needed by all feature docs.

- [ ] `core/app.md`
- [ ] `core/providers.md`
- [ ] `core/drivers-and-adapters.md`
- [ ] `core/generated-extension-points.md`
- [ ] `core/named-resources.md`
- [ ] `core/code-generation.md`
- [ ] `core/local-first-development.md`

Exit criteria:

- [ ] App, Framework, Stack, Runtime, Provider, Driver, Adapter, Service, Resource, Inspect, and Lighthouse are consistently explained.
- [ ] Generated component codegen and named accessors are explained before cache, queue, storage, events, and database guides depend on them.
- [ ] Runtime topology is explained before operations pages depend on it.

## Phase 5: Application Building

Goal: let users build normal GoForj App features.

- [ ] `applications/routes.md`
- [ ] `applications/controllers.md`
- [ ] `applications/middleware.md`
- [ ] `applications/requests-validation.md`
- [ ] `applications/responses-errors.md`
- [ ] `applications/services.md`
- [ ] `applications/commands.md`

Exit criteria:

- [ ] Reader can add routes, controllers, services, and commands.
- [ ] Examples keep business logic out of runtime bootstrap.
- [ ] HTTP docs use `web` abstractions and link to the standalone library page.
- [ ] Route visibility through `route:list` is documented.

## Phase 6: Data And Persistence

Goal: explain durable data, derived data, and file/blob storage boundaries.

- [ ] `data/database-strategy.md`
- [ ] `data/migrations.md`
- [ ] `data/repositories.md`
- [ ] `data/transactions.md`
- [ ] `data/cache-patterns.md`
- [ ] `data/storage-patterns.md`
- [ ] `data/driver-selection.md`

Exit criteria:

- [ ] Readers understand source-of-truth versus cache.
- [ ] Storage disks and cache accessors are documented as named resources.
- [ ] `*_SUPPORTED_DRIVERS` generation is explained where relevant.
- [ ] Database guidance is honest about current framework ownership.

## Phase 7: Async And Workflows

Goal: explain background work, fan-out, and recurring work.

- [ ] `async/queues.md`
- [ ] `async/jobs.md`
- [ ] `async/workers.md`
- [ ] `async/events.md`
- [ ] `async/event-subscribers.md`
- [ ] `async/scheduler.md`
- [ ] `async/retries-idempotency.md`

Exit criteria:

- [ ] Events and queues are clearly separated.
- [ ] Jobs are named and observable.
- [ ] Workers and scheduler lifecycle are explicit.
- [ ] Local-first and production drivers are separated.
- [ ] Queue and event docs link to standalone Libraries.

## Phase 8: Testing

Goal: make tests part of the normal GoForj workflow.

- [ ] `testing/unit-tests.md`
- [ ] `testing/http-tests.md`
- [ ] `testing/command-tests.md`
- [ ] `testing/job-queue-tests.md`
- [ ] `testing/event-tests.md`
- [ ] `testing/cache-storage-tests.md`
- [ ] `testing/integration-tests.md`
- [ ] `testing/rendered-app-smoke-tests.md`

Exit criteria:

- [ ] Each major subsystem has a test path.
- [ ] Local drivers and fakes are documented.
- [ ] Rendered App smoke testing is documented for framework contributors.

## Phase 9: Operations And Observability

Goal: make production and runtime behavior explicit.

- [ ] `operations/deployment-basics.md`
- [ ] `operations/runtime-processes.md`
- [ ] `operations/http-server.md`
- [ ] `operations/queue-workers.md`
- [ ] `operations/scheduler-processes.md`
- [ ] `operations/health-readiness.md`
- [ ] `operations/logging.md`
- [ ] `operations/metrics.md`
- [ ] `operations/inspects.md`
- [ ] `operations/lighthouse.md`
- [ ] `operations/standalone-vs-distributed.md`
- [ ] `operations/lazy-initialization.md`
- [ ] `operations/production-checklist.md`

Exit criteria:

- [ ] Every long-running runtime has process, startup, shutdown, and failure docs.
- [ ] Metrics and inspects are explained before Lighthouse dashboards.
- [ ] Standalone versus distributed topology is explicit.
- [ ] Lazy initialization is documented without weakening fail-fast wiring.

## Phase 10: Product Surfaces

Goal: document larger framework capabilities that compose multiple primitives.

- [ ] `security/auth.md`
- [ ] `getting-started/starter-kits.md`
- [ ] `frontend/vue-starter-kit.md`
- [ ] `applications/api-index.md`
- [ ] `applications/openapi.md`
- [ ] `developer-tools/forj-dev.md`
- [ ] Decide when extension docs can become public user docs.

Exit criteria:

- [ ] Auth docs explain server-authoritative sessions, cookies, refresh behavior, reset/verification, scheduled cleanup, and inspect visibility.
- [ ] Starter kit docs explain generated ownership and optional component compatibility.
- [ ] API Index docs are explicit about current AST-based capabilities and limits.
- [ ] `forj dev` docs match the transcript-first tooling model.

## Phase 11: Framework Reference

Goal: provide lookup material after workflow docs exist.

- [ ] `reference/cli.md`
- [ ] `reference/env-vars.md`
- [ ] `reference/configuration.md`
- [ ] `reference/generated-files.md`
- [ ] `reference/generation-commands.md`
- [ ] `reference/errors.md`

Exit criteria:

- [ ] Framework-level lookup details live in reference.
- [ ] Workflow pages link to reference.
- [ ] Framework reference does not duplicate full library API indexes.

## First Runnable Scenarios

Build these after the first 10 framework pages:

- [ ] JSON API route with controller and service.
- [ ] Cached user profile lookup.
- [ ] File upload to named storage disk.
- [ ] `users.created` event with subscriber.
- [ ] `reports:generate` job and worker.
- [ ] `reports:daily` schedule.
- [ ] Runtime observability through metrics and inspects.

## Quality Gates

Apply before publishing a page:

- [ ] Page follows the relevant template.
- [ ] Terminology matches `docs/ai/terminology.md`.
- [ ] Examples use canonical names from `docs/ai/example-registry.md`.
- [ ] Commands are verified against source or generated templates.
- [ ] File paths are verified against source or generated templates.
- [ ] Framework pages link to Libraries for primitive details.
- [ ] Library pages remain useful to standalone package users.
- [ ] Operations pages cover startup, shutdown, logs, metrics, inspects, failure modes, and production checklist where relevant.
- [ ] VitePress build passes, or the blocker is documented.
