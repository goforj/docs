# Multi-App Documentation Plan

## Scope

This plan covers documentation changes needed for the current `goforj` work on branch `cmilesio/feat-multi-app-p2`.

## Execution Status

This plan has been partially executed in `goforj-docs`.

Latest audit on 2026-06-16 tightened the docs around the multi-app model:

- Worker, queue-worker, scheduler, deployment, and standalone/distributed pages now show named-app command and binary shapes where the single-app shape was previously the only example.
- Public scheduler guidance now points to app-owned schedule composition, `app/schedules.go` and `app/<app>/schedules.go`, instead of stale scheduler registry paths.
- Scenario specs in `../goforj/internal/scenarios/specs` were updated for app-owned schedule registration and regenerated into `docs/scenarios`.
- Scenario heading generation now follows the docs style guide by using `and` in headings instead of `And`.
- AI guidance now uses `marketplace` and `backstage` as the main named-app examples.

Latest audit on 2026-06-15 updated public docs to better showcase the stabilized multi-app model:

- `forj <app> <command>` is now presented as the primary named-app workflow.
- App-prefixed `make:*` commands are documented as routing generated registrations into the selected app's `app/<app>/...` and `app/<app>/wire/...` files.
- Central examples now use `marketplace` and `backstage` for approachable named-app examples instead of treating `billing` and `reporting` as the canonical model.
- App-scoped API index, OpenAPI, frontend, migration, queue, metric, Lighthouse, and runtime-process examples were refreshed.
- Named app local env defaults now mention sequential app creation using the next available HTTP port, avoiding duplicate `3001` defaults.
- `npm run build` passed from `docs/` after the documentation updates.

Completed in public docs:

- Core Project/app/runtime mental model.
- `docs/core/apps.md` and sidebar entry.
- Default app and named app command examples.
- App-local paths for routes, commands, lifecycle, schedules, and Wire.
- CLI, config, env var, generated file, API index, OpenAPI, dev, async, data, operations, frontend, and starter kit docs.
- Scenario markdown path cleanup for the app-local composition layout.
- Heading connector cleanup for `And` -> `and`.

Still recommended after the source branch stabilizes:

- Re-run the full source verification and scenario verification commands below.

The requested base branch was `master`, but this checkout does not have a `master` ref. `origin/HEAD` points at `origin/main`, so this review used `main..HEAD`.

Current branch state reviewed:

- `2f7d1d4 refactor: rename app targets to apps`
- `cb1412e perf: avoid go get during render dependency sync`
- the rest of the multi-app render, dev, runtime, API index, observability, migration, frontend, and generator work in `main..HEAD`

The branch currently changes roughly 293 files. The active model is no longer `App target`; it is:

```text
GoForj Project
  App: app
    Runtime: http
    Runtime: jobs
    Runtime: scheduler
  App: marketplace
    Runtime: http
    Runtime: jobs
  App: backstage
    Runtime: jobs
```

Use this vocabulary in public docs:

- `Project`: the repository/project created by `forj new`.
- `app`: a runnable application boundary inside a Project.
- `default app`: the conventional app named `app`.
- `named app`: an additional app such as `marketplace` or `backstage`.
- `runtime`: HTTP, jobs, scheduler, CLI, or similar runtime surface inside an app.
- `instance`: a concrete running process or replica.

Avoid `App target`, `runtime target`, and domain-level `target`. Use `target` only when it literally means a build target, deployment target, benchmark URL, or another non-GoForj-domain target.

## Source Inputs Reviewed

Primary source and template files:

- `../goforj/docs/designs/app-composition-layout-design.md`
- `../goforj/project/config.go`
- `../goforj/project/app_components.go`
- `../goforj/internal/build/app.go`
- `../goforj/internal/build/api_index_runner.go`
- `../goforj/internal/forj/makeapp/cmd.go`
- `../goforj/cmd/forj/main.go`
- `../goforj/internal/forj/dev_cmd.go`
- `../goforj/internal/forj/project_renderer.go`
- `../goforj/templates/internal/runtime/README.md.tmpl`
- `../goforj/templates/internal/runtime/apps.go.tmpl`
- `../goforj/templates/internal/cmd/app_identity.go.tmpl`
- `../goforj/internal/generate/observability.go`
- `../goforj/templates/internal/lighthouse/agent.go.tmpl`
- `../goforj/templates/internal/lighthouse/protocol.go.tmpl`
- `../goforj/templates/migrations/migrations.go.tmpl`

Important current source facts:

- Project config now persists per-app metadata under `apps`.
- Code symbols now use `project.App`, `project.Apps`, `DefaultAppName`, `DefaultNamedApp`, `IsSafeAppName`, `AppConfig`, `AppComponentDefinitions`, and `NormalizeAppComponents`.
- App selection for source-mode build/run uses `FORJ_APP`.
- CLI app dispatch sets `FORJ_COMMAND_PREFIX=forj <app>` and `FORJ_APP=<app>`.
- The default app lives at `cmd/app/main.go`, `app/`, and `app/wire/`.
- Named apps live at `cmd/<app>/main.go`, `app/<app>/`, and `app/<app>/wire/`.
- Generated runtime app metadata lives in `internal/runtime/apps.go`.
- API index and OpenAPI output stay at `build/api_index.json` and `build/openapi.json` for the default app, and move under `build/<app>/` for named apps.
- Metrics scrape labels currently include `app`, `process`, `service`, and `environment`.
- Lighthouse protocol currently exposes `app`, `source`, `group_key`, and `instance_key`; public prose should explain `source` as the runtime surface unless the source code later renames the wire fields to `runtime` and `instance`.
- Named apps get deterministic runtime defaults by app index: HTTP `3000 + appIndex`, runtime block `10000 + appIndex*10`, scheduler metrics `+1`, worker metrics `+2`.
- Named apps do not consume default-app globals such as `PORT` and `METRICS_PORT`.
- Queue backend names are physicalized by app for named apps, while app code keeps logical queue names.
- Multi-app migrations use explicit app and connection ownership.
- `forj make:app <name>` creates a named app, and `forj make:app <name> --remove` removes conventional files and metadata conservatively.
- Render dependency sync now uses a lighter `sync core libs` / `go mod edit -require=...` path instead of teaching or reporting `go get core libs`.

## Documentation Goal

Update docs from the old single-root generated App layout:

```text
main.go
wire/
internal/app/
internal/cmd/app_commands.go
internal/router/routes_registry.go
```

to the current Project/app/runtime layout:

```text
cmd/app/main.go
app/
app/wire/
internal/runtime/
internal/runtime/apps.go
```

with named apps shaped as:

```text
cmd/<app>/main.go
cmd/<app>/frontend/
app/<app>/
app/<app>/wire/
```

The docs should keep the single-app Project as the default mental model, then introduce named apps as the scale-out path for larger Projects.

## Required AI Context Updates

Update these AI context files before broad public-doc rewrites:

- `ai/terminology.md`
  - Add `Project` as the `forj new` output.
  - Reframe `App` as a runnable boundary inside a GoForj Project.
  - Add `default app` and `named app`.
  - Keep `Runtime` as the concept below an app.
  - Avoid `App target`, `runtime target`, and domain-level `target`.
- `ai/golden-paths.md`
  - Replace root `main.go`, root `wire/`, `internal/app`, and `internal/cmd/app_commands.go` with `cmd/app`, `app`, `app/wire`, and `internal/runtime`.
  - Add named-app command examples such as `forj marketplace route:list`, `forj marketplace build`, and `./bin/marketplace worker`.
  - Update generator guidance so make commands update the active app's `app/...` and `app/.../wire/...` files.
  - Add queue physicalization guidance: logical queue names in app code, app-prefixed backend queue names for named apps.
- `ai/source-context-map.md`
  - Replace stale source paths with `templates/app`, `templates/cmd/app`, `templates/internal/runtime`, `templates/internal/runtime/apps.go.tmpl`, `templates/internal/cmd/app_identity.go.tmpl`, and app-aware Wire templates under `templates/wire`.
  - Replace references to removed files such as `templates/internal/app/README.md.tmpl`, `templates/internal/app/lifecycle_registry.go.tmpl`, and `templates/wire/inject_scheduler_schedules.go.tmpl`.
- `ai/generated-components-model.md`
  - Replace `internal/app` generated component language with `internal/runtime`.
  - Document generated `internal/runtime/apps.go`.
  - Update command, route, schedule, subscriber, job, repository, and service registration nuances for app-local composition files.
- `ai/runtime-topology-model.md`
  - Add app as a topology dimension above runtime type.
  - Document deterministic app port defaults, named-app env overrides, and app-scoped binary/process examples.
- `ai/operations-docs-model.md`
  - Update metrics, Lighthouse, inspects, worker, scheduler, and runtime process guidance for `app`, runtime/source, and instance identity.
- `ai/runnable-scenarios.md`
  - Update scenario-generation guidance so specs refer to `app/...`, `app/wire/...`, and `app/lifecycle.go`.

## Public Docs Changes

### Priority 1: Correct The Core Mental Model

These pages are currently the highest-risk source of stale guidance:

- `docs/getting-started/project-structure.md`
  - Rewrite the tree around `.goforj.yml`, `cmd/app`, `app`, `app/wire`, `internal`, `internal/runtime`, `internal/runtime/apps.go`, `migrations`, and optional `cmd/<app>`.
  - Explain the fan-out rule: `internal/` owns behavior; `app/` and `app/<app>/` own exposure and composition.
  - Replace lifecycle extension point references with `app/lifecycle.go`.
- `docs/getting-started/quickstart.md`
  - Replace root `main.go` and root `wire/` output references.
  - Show `cmd/app/main.go`, `app/`, and `app/wire/` in the first generated tree.
  - Keep `forj dev` as the local-first path.
- `docs/core/app.md`
  - Reframe the top-level product as a GoForj Project.
  - Define apps as runnable boundaries inside the Project.
  - Replace the old `main.go -> wire.InitializeApplication -> App` diagram with `cmd/<app>/main.go -> app/<app> root command -> app/<app>/wire`.
  - Keep the warning that business logic belongs under `internal/`.
- `docs/core/runtime-lifecycle.md`
  - Move lifecycle examples from `internal/app/lifecycle_registry.go` to `app/lifecycle.go`.
  - Clarify that lifecycle support lives in `internal/runtime`.
- `docs/core/runtime-topology.md`
  - Add apps as a composition/deployment dimension above runtimes.
  - Keep standalone versus distributed runtime modes distinct from app fan-out.
  - Add examples for `forj app`, `forj marketplace`, `./bin/app`, and `./bin/marketplace`.
- `docs/core/dependency-injection.md`
  - Replace root `wire/` guidance with app-local `app/wire` and `app/<app>/wire`.
  - Explain that each app has its own Wire graph and binary entrypoint.

### Priority 2: Add A Dedicated Multi-App Guide

Create `docs/core/apps.md`.

Recommended structure:

1. Define a GoForj Project.
2. Define an app.
3. Show the single-app layout.
4. Show the multi-app layout.
5. Explain `forj make:app`.
6. Explain named-app command prefixes.
7. Explain app-safe components and `apps` metadata.
8. Explain runtime ports and app identity.
9. Explain queue and migration ownership boundaries.
10. Explain common mistakes.

Key facts to document:

- The default app is named `app`.
- Default app paths are `cmd/app/main.go`, `app/`, and `app/wire/`.
- Named app paths are `cmd/<app>/main.go`, `cmd/<app>/frontend`, `app/<app>/`, and `app/<app>/wire/`.
- App names must be path-safe and cannot collide with native Framework commands or reserved layout names.
- App discovery is convention-first from `cmd/<app>/main.go` and `app/<app>/`.
- `.goforj.yml` stores per-app component/starter-kit metadata under `apps`, but does not define which apps exist.
- Named apps are not separate Go modules, repositories, or automatic microservices.
- `internal/` remains shared implementation for apps inside the same module.

Add the page to the Core Concepts sidebar after `App` or `Project Structure`, then link to it from `project-structure`, `runtime-topology`, `configuration`, `forj-dev`, `cli`, `generation-commands`, `migrations`, `queues`, and `metrics`.

### Priority 3: Update Command and Generator Docs

- `docs/reference/cli.md`
  - Add `forj make:app`.
  - Add named-app command prefix behavior: `forj <app> <command>`.
  - Explain native Framework command precedence.
  - Show source-mode dispatch and built binary dispatch.
  - Document `forj dev` as all-app orchestration in multi-app Projects.
- `docs/reference/generation-commands.md`
  - Add `make:app` examples:
    - `forj make:app marketplace`
    - `forj make:app marketplace --components web-api,jobs`
    - `forj make:app backstage --components web-api,web-ui --starter-kit vue`
    - `forj make:app backstage --without web-ui --skip-wire`
    - `forj make:app marketplace --remove`
  - Update make command outputs to app-local files.
- `docs/core/make-commands.md`
  - Add active-app behavior.
  - Use examples such as `forj marketplace make:controller checkout`.
  - Remove stale `wire/inject_scheduler_schedules.go` and `internal/cmd/app_commands.go` references.
- `docs/applications/commands.md`
  - Replace command exposure path with `app/commands.go` and `app/wire/inject_cmd_app.go`.
  - Add app-specific command exposure examples.
- `docs/applications/controllers.md`
  - Replace controller Wire path with `app/wire/inject_http_controllers_app.go`.
  - Replace route registration path with `app/routes.go` or `app/<app>/routes.go`.
- `docs/applications/routes.md`
  - Explain that `route:list` is scoped to the active app.
  - Add `forj marketplace route:list` as the named-app example.
- `docs/core/wiring-recipes.md`
  - Update all Wire file references to app-local `app/wire/...`.
  - Explain how to choose the active app before editing examples.
- `docs/core/reading-wire-errors.md`
  - Update troubleshooting paths from root `wire/` to app-local `app/wire/`.

### Priority 4: Update Configuration, Env Vars, and Generated File Reference

- `docs/getting-started/configuration.md`
  - Add `apps` as the per-app component/starter-kit metadata key.
  - Make clear that app discovery comes from layout, not config.
  - Document `FORJ_APP` as a command/build selector only where needed.
  - Keep `FORJ_COMMAND_PREFIX` as internal/delegation context unless a public use case exists.
- `docs/reference/configuration.md`
  - Add `apps.<name>.components` and `apps.<name>.starter_kit`.
  - Clarify project-level components versus app-safe components.
  - Explain that `make:app` may promote app-safe capabilities into the project render set.
- `docs/reference/env-vars.md`
  - Add named-app runtime port override pattern using uppercase snake-case app prefixes:
    - `<APP>_PORT`
    - `<APP>_API_HTTP_PORT`
    - `<APP>_METRICS_PORT`
    - `<APP>_API_METRICS_PORT`
    - `<APP>_METRICS_API_PORT`
    - `<APP>_SCHEDULER_METRICS_PORT`
    - `<APP>_METRICS_SCHEDULER_PORT`
    - `<APP>_WORKER_METRICS_PORT`
    - `<APP>_JOBS_METRICS_PORT`
    - `<APP>_METRICS_JOBS_PORT`
  - Explain that default-app globals such as `PORT`, `API_HTTP_PORT`, and `METRICS_PORT` do not apply to named apps.
  - Add `FORJ_APP` for source/build command selection.
  - Add `APP_INSTANCE_ID` for replicated runtimes.
  - Add frontend config projection: `FRONTEND_*` and `<APP>_FRONTEND_*`.
- `docs/reference/generated-files.md`
  - Replace `main.go`, root `wire/`, and `internal/app` entries.
  - Add `cmd/app/main.go`, `cmd/<app>/main.go`, `cmd/<app>/frontend`, `app/`, `app/<app>/`, `app/wire`, `app/<app>/wire`, and `internal/runtime/apps.go`.
  - Mark `internal/runtime/apps.go` as generated and not app-owner edited.

### Priority 5: Update Dev, Build, API Index, and OpenAPI Pages

- `docs/developer-tools/forj-dev.md`
  - Document multi-app behavior:
    - single-app `forj dev` remains the normal loop
    - in a multi-app Project, unqualified `forj dev` manages Apps listed under `dev.apps`
    - `forj <app> dev` scopes dev to one app
  - Mention supervisor-owned `.env` triggers and App lifecycle configuration.
  - Mention parallel shutdown behavior only if the page discusses process management details.
- `docs/core/local-first-development.md`
  - Add app fan-out local development guidance and deterministic ports.
- `docs/applications/api-index.md`
  - Document app-scoped API index output:
    - default app: `build/api_index.json`
    - named app: `build/<app>/api_index.json`
  - Explain status output such as `app billing`.
  - Use the verified public command `forj marketplace build:api-index`.
- `docs/applications/openapi.md`
  - Document app-scoped OpenAPI output:
    - default app: `build/openapi.json`
    - named app: `build/<app>/openapi.json`
  - Explain that served Swagger/OpenAPI belongs to the active app's HTTP surface.
- `docs/operations/runtime-processes.md`
  - Add named-app binary examples such as `./bin/marketplace api`, `./bin/marketplace worker`, and `./bin/backstage scheduler`.
- `docs/operations/standalone-vs-distributed.md`
  - Clarify how bare runtime binaries default to `run` for each runtime-capable App.

### Priority 6: Update Data, Queues, and Migrations

- `docs/data/migrations.md`
  - Document single-app migration layout versus multi-app migration layout.
  - Explain `migrations/<app>/<connection>/`.
  - Explain that `default` becomes explicit in the multi-app layout.
  - Document `forj migrate` for the default/single-app path and `forj <app> migrate` for named apps.
  - Explain that if two apps share a physical database, one app should own the migration stream.
- `docs/data/database-strategy.md`
  - Add app-owned migration source guidance.
  - Explain app-scoped database connection naming such as `billing` and `billing_ledger` when relevant.
- `docs/data/repositories.md`
  - Update Wire paths to `app/wire/inject_repositories_app.go` or `app/<app>/wire/inject_repositories_app.go`.
- `docs/async/queues.md`
  - Explain logical queue names versus backend queue names.
  - Document that named apps prefix physical backend queue names, such as `billing_default`, while app code still uses `default`.
  - Note that no separate queue namespace env var is needed for normal multi-app usage.
- `docs/async/jobs.md`
  - Explain app-scoped job registration and worker process examples.
- `docs/async/workers.md`
  - Add named-app worker examples: `forj marketplace worker` and `./bin/marketplace worker`.
- `docs/async/scheduler.md`
  - Update schedule registration paths to `app/schedules.go` and `app/<app>/schedules.go`.

### Priority 7: Update Observability, Metrics, Lighthouse, and Operations

- `docs/operations/metrics.md`
  - Add `app` as a bounded metric/scrape label.
  - Document vmagent scrape labels: `app`, `process`, `service`, and `environment`.
  - Document deterministic app/runtime scrape ports.
  - Distinguish `process` labels from the docs concept of runtime.
- `docs/operations/lighthouse.md`
  - Document current Lighthouse identity fields:
    - `app`
    - `source` as the runtime surface
    - `group_key`
    - `instance_key`
  - Explain `APP_INSTANCE_ID`.
  - Keep `agent` language limited to Lighthouse implementation behavior.
  - If the source later renames fields to `runtime` and `instance`, update the docs plan and public docs accordingly.
- `docs/operations/inspects.md`
  - Ensure examples preserve app identity where inspect records include it.
- `docs/operations/health-readiness.md`
  - Document app-specific HTTP and runtime endpoints when multiple apps run locally.
- `docs/operations/production-checklist.md`
  - Add checklist items for app-specific ports, process supervisors, metrics scrape labels, and `APP_INSTANCE_ID`.
- `docs/operations/logging.md`
  - Add app/runtime/instance identity guidance if logs include those fields.

### Priority 8: Update Frontend and Starter Kit Docs

- `docs/frontend/vue-starter-kit.md`
  - Replace root `frontend/` assumptions with `cmd/<app>/frontend` when Web UI is app-scoped.
  - Document `FRONTEND_*` and `<APP>_FRONTEND_*` configuration projection.
  - Explain app-specific backend proxy configuration.
- `docs/getting-started/starter-kits.md`
  - Explain that a Web UI app owns its frontend assets and backend proxy configuration.
- `docs/frontend/index.md`
  - Link to multi-app guidance for projects with more than one UI or HTTP app.
- `docs/starter-kits.md`
  - Update any old root frontend path examples.

### Priority 9: Update Scenario Docs Through Specs

Generated scenario pages currently reference old paths such as `wire/inject_app_services.go`, `wire/inject_http_controllers.go`, `internal/router/routes_registry.go`, and `internal/app/lifecycle_registry.go`.

Do not hand-edit `docs/scenarios/*.md`. Update the scenario specs in `../goforj/internal/scenarios/specs`, then regenerate.

Affected scenarios likely include:

- `json-api-route`
- `cached-user-profile`
- `file-upload-storage`
- `reports-daily-schedule`
- `reports-generate-job`
- `users-created-event`

Regeneration command shape from the AI workflow:

```bash
GOCACHE=/tmp/gocache go build -o /tmp/forj-scenario-mvp ./cmd/forj
/tmp/forj-scenario-mvp scenario:test --all
/tmp/forj-scenario-mvp scenario:generate --all --out-dir ../goforj-docs/docs/scenarios --check
```

Run these from `../goforj`, and write generated markdown into the docs repo only after the specs reflect the new app layout.

## Renderer Dependency Sync Documentation Change

The render dependency sync behavior changed from `go get core libs` to a lighter `sync core libs` path based on `go mod edit -require=...`. It skips modules already pinned correctly or locally replaced.

Docs impact:

- `docs/testing/rendered-app-smoke-tests.md`
  - If it mentions render dependency sync behavior, change wording from `go get core libs` to `sync core libs`.
  - Mention that `render.module_replaces` intentionally prevents dependency pinning from overriding sibling checkouts.
- `docs/getting-started/configuration.md` and `docs/reference/configuration.md`
  - Keep `render.module_replaces` guidance and ensure it says absolute paths are used for local sibling repos.
- Do not teach users to run the internal sync step directly.

## Suggested Execution Order

1. Update AI context files so future docs edits stop reinforcing stale paths.
2. Add `docs/core/apps.md` and sidebar entry.
3. Rewrite `project-structure`, `quickstart`, `app`, `dependency-injection`, `runtime-lifecycle`, and `runtime-topology`.
4. Update CLI, generation command, make command, command, controller, route, and Wire troubleshooting pages.
5. Update config, env var, and generated file references.
6. Update dev, API index, OpenAPI, runtime-process, and standalone/distributed pages.
7. Update migrations, database, queues, jobs, workers, and scheduler docs.
8. Update metrics, Lighthouse, inspects, health/readiness, production checklist, and logging docs.
9. Update frontend and starter kit docs.
10. Update scenario specs in `../goforj`, regenerate scenario pages, then run docs build.

## Verification Plan

Source verification:

```bash
cd ../goforj
GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache go test ./internal/forj ./internal/build ./project ./internal/generate -count=1
```

Rendered Project verification for docs examples:

```bash
cd ../goforj
GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache go run ./cmd/forj/main.go test:render -s
```

Named-app smoke verification:

```bash
cd ../goforj
GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache go test ./internal/forj -run 'TestMakeApp|TestMultiApp|TestRenderedObservability' -count=1
```

Scenario verification after spec updates:

```bash
cd ../goforj
GOCACHE=/tmp/gocache go build -o /tmp/forj-scenario-mvp ./cmd/forj
/tmp/forj-scenario-mvp scenario:test --all
/tmp/forj-scenario-mvp scenario:generate --all --out-dir ../goforj-docs/docs/scenarios --check
```

Docs verification:

```bash
cd docs
npm run build
```

## Review Checklist

- Public docs use Project, app, default app, named app, runtime, and instance consistently.
- Public docs avoid `App target`, `runtime target`, and domain-level `target`.
- Single-app Projects still feel like the default.
- Named apps are not described as services, modules, or separate repositories.
- Examples do not put business logic in `app/`, `app/<app>/`, `cmd/<app>`, or `internal/runtime`.
- Generated file paths use `app/wire`, not root `wire`.
- Lifecycle examples use `app/lifecycle.go`.
- Runtime app metadata examples use `internal/runtime/apps.go`.
- Config examples use `apps`, not `app_targets`.
- Command-selection env examples use `FORJ_APP`, not `FORJ_APP_TARGET` or `APP_TARGET`.
- Named-app env vars are shown as overrides, not mandatory generated `.env` output.
- API index and OpenAPI examples use `build/<app>/...` for named apps.
- Metrics scrape labels use current source fields: `app`, `process`, `service`, and `environment`.
- Lighthouse docs either use exact current fields (`app`, `source`, `group_key`, `instance_key`) or are updated after a source rename to `runtime` and `instance`.
- Queue docs distinguish logical queue names from physical backend queue names.
- Migration docs explain app/connection ownership.
- Scenario markdown is regenerated from specs rather than edited by hand.
