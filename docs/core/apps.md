---
title: Apps
description: How one GoForj Project can contain a default app and additional runnable applications.
---

# Apps

An app is a runnable program inside a GoForj Project. It has its own binary, commands, routes, lifecycle files, Wire graph, and runtime defaults.

Every Project starts with the default app, whose binary is `bin/app`. Most Projects need only that app.

When the same Project needs another independently runnable program, `forj make:app backstage` creates an additional app named `backstage`, with its own `bin/backstage` binary, routes, commands, runtime choices, and dependency graph. Its app name prefixes files and commands:

```bash
forj backstage api
forj backstage worker
```

For example, one commerce Project might contain:

| App | What it runs | Binary |
| --- | --- | --- |
| Default app | Public API and checkout workers | `bin/app` |
| Additional app named `backstage` | Internal administration API and scheduler | `bin/backstage` |

Both apps can use shared application behavior under `internal/orders`, while their routes, commands, schedules, lifecycle hooks, and wiring remain separate.

An additional app is not a package namespace, a worker process, or automatically a separate service or repository. Use packages under `internal/` to organize code, and use runtime commands such as `forj api` and `forj worker` to split processes inside one app. Add another app only when you need another binary, deployment boundary, or independently selected set of capabilities.

## The Default App

Every Project has a default app named `app`:

```text
cmd/
  app/
    main.go

app/
  commands.go
  lifecycle.go
  routes.go
  schedules.go
  wire/

internal/
  users/
  reports/
```

`cmd/app/main.go` is the binary entrypoint and stays small. `app/` owns routes, commands, schedules, lifecycle hooks, and the code that makes them available. `app/wire/` owns the Wire graph. Application behavior belongs under `internal/`.

The default app is enough for most Projects.

<span id="add-a-named-app"></span>

## Add Another App

<MakeCommandTabs name="app">
<template #usage>

Use `make:app` when the Project needs another runnable program:

```bash
forj make:app marketplace
```

You can choose which capabilities the app includes:

```bash
forj make:app billing --components web-api,jobs --dev-run run
forj make:app backstage --components web-api,scheduler --starter-kit vue
```

The interactive wizard includes a Dev Run choice. Apps with HTTP, jobs, or schedules default to the conventional `run` command, while CLI-only or explicitly disabled apps remain absent from `dev.apps`.

When scripting `make:app` with flags, use `--dev-run run` to enroll the app in `forj dev`. Use another app command, such as `--dev-run queue:work`, only when that is the intended long-running process.

Remove conventional generated app files with:

```bash
forj make:app marketplace --remove
```

Removal is conservative. It should not delete unknown app-owned files or migration history.

</template>
<template #files>

`make:app marketplace` creates the binary entrypoint and app-owned files:

```text
cmd/marketplace/main.go             binary entrypoint
app/marketplace/root_cmd.go         app commands
app/marketplace/routes.go           HTTP exposure when selected
app/marketplace/lifecycle.go        runtime lifecycle when selected
app/marketplace/wire/               app-specific Wire graph
.goforj.yml                         app component and starter-kit metadata
```

The exact files follow the selected components. Existing app migrations and unknown files are deliberately outside managed removal.

</template>
<template #generated>

The generator records the app's selected components in project configuration:

<CodeFile path=".goforj.yml">

```yaml
apps:
  marketplace:
    components: [web_api, jobs]
    starter_kit: none
```
</CodeFile>

The `app/marketplace/` directory owns the app's routes, commands, schedules, and lifecycle hooks; its `wire/` directory contains the corresponding dependency graph.

</template>
</MakeCommandTabs>

## Use an app as a command prefix

Prefix the command with the app name:

```bash
forj marketplace route:list
forj marketplace api
forj marketplace worker
forj marketplace build

forj backstage scheduler
forj backstage dev
```

Built binaries use the same command names:

```bash
./bin/marketplace api
./bin/marketplace worker
```

Unqualified commands use the default app:

```bash
forj route:list
forj api
```

That means single-app Projects do not get a more complicated workflow. Multi-app Projects add one predictable prefix when you need it.

## Generate into one app

The app prefix also chooses which route, command, job, or provider files receive new registrations.

```bash
forj marketplace make:controller checkout
forj marketplace make:job sync-catalog
forj marketplace make:model order
```

These commands create behavior under `internal/`, then register it with the selected app. For the controller above, that means:

```text
internal/checkout/controller.go
app/marketplace/routes.go
app/marketplace/wire/inject_http_controllers_app.go
```

The job and model commands follow the same rule: generated behavior lives under `internal/...`, and the selected app receives the matching Wire registration in files such as `app/marketplace/wire/inject_jobs_app.go` or `app/marketplace/wire/inject_repositories_app.go`.

Unprefixed make commands keep writing to the default app:

```bash
forj make:controller users
```

```text
internal/users/controller.go
app/routes.go
app/wire/inject_http_controllers_app.go
```

## Apps and runtimes

An app can expose several runtimes:

- HTTP
- jobs
- scheduler
- CLI commands

For example, `forj marketplace api`, `forj marketplace worker`, and `forj marketplace scheduler` run different process roles inside the same `marketplace` app. The app owns the binary and dependency graph; the runtime is the role the process is currently running.

Separate app processes do not share memory-backed cache, queue, or event drivers. Choose a shared backend when work or state must cross process boundaries.

## What Belongs Where

`internal/` owns behavior. Apps register that behavior with a runnable binary; do not put business workflows in `app/` or `cmd/<app>/`.

For example, a checkout controller can live in:

```text
internal/checkout/controller.go
```

The `marketplace` app exposes it through:

```text
app/marketplace/routes.go
app/marketplace/wire/inject_http_controllers_app.go
```

This keeps the code reusable inside the Project without pretending each app is a separate repository.

Use these boundaries when deciding where code belongs:

| Concern | Belongs in |
| --- | --- |
| Project configuration and selected components | `.goforj.yml` |
| Routes, commands, schedules, and lifecycle hooks | `app/` or `app/<name>/` |
| App Wire graph | `app/wire/` or `app/<name>/wire/` |
| Binary entrypoint | `cmd/app/` or `cmd/<name>/` |
| Business behavior | `internal/...` |
| Reusable runtime machinery | `internal/runtime`, `internal/http`, `internal/jobs`, `internal/schedules` |

Do not bypass these app files with package globals. If rerendering should preserve a behavior change for all future Projects, change the GoForj template or generator. Keep application-specific behavior in your Project.

## App Metadata

GoForj discovers apps by convention:

```text
cmd/<app>/main.go
app/<app>/
```

`.goforj.yml` can store per-app component and starter-kit choices under `apps`, but layout decides which apps exist.

The generated-code tab under [Add Another App](#add-another-app) shows the configuration. This top-level `apps` metadata is separate from `dev.apps`, which selects the app processes managed by `forj dev`.

## App-scoped output

API descriptions and frontend files are stored by app when a Project has more than one.

API index and OpenAPI output stay simple for the default app:

```text
build/api_index.json
build/openapi.json
```

Additional apps write under their app name:

```text
build/marketplace/api_index.json
build/marketplace/openapi.json
```

Frontend source and embedded assets follow the app entrypoint:

```text
cmd/app/frontend/
cmd/marketplace/frontend/
cmd/backstage/frontend/
```

## Runtime Defaults

The generator writes `internal/runtime/apps.go` from app metadata and compiles it into each binary. Do not edit that file by hand.

Default ports are deterministic:

| App | HTTP | Metrics | Scheduler metrics | Worker metrics |
| --- | ---: | ---: | ---: | ---: |
| `app` | `3000` | `10000` | `10001` | `10002` |
| first additional app | `3001` | `10010` | `10011` | `10012` |
| second additional app | `3002` | `10020` | `10021` | `10022` |

Overrides for an additional app use its uppercase app name as a prefix:

```text
MARKETPLACE_PORT=3100
MARKETPLACE_WORKER_METRICS_PORT=10112
```

Default-app globals such as `PORT` and `METRICS_PORT` do not apply to additional apps.

When `make:app` writes local env defaults, it uses the next available app HTTP port so sequential app creation does not make two apps bind the same listener.

## Queue and Migration Boundaries

App code uses logical queue names such as `default` or `sync`. In a multi-app Project, additional apps prefix backend queue names with the app name, such as `marketplace_default`, so multiple apps can share a queue backend safely.

Migrations are app-owned when a Project has multiple apps:

```text
migrations/
  app/default/
  marketplace/default/
  marketplace/archive/
```

If two apps share one physical database, choose one app to own that database's migration stream.

## Common Mistakes

The costly mistakes are architectural: creating additional apps only to organize packages, placing business workflows in app registration files, or expecting memory-backed drivers to share state across processes. The relevant sections above explain the package, ownership, and backend choices that avoid them.

## Next Steps

- [Project Structure](/getting-started/project-structure) shows the project tree.
- [forj dev](/developer-tools/forj-dev) explains app process orchestration and custom watches.
- [Runtime Topology](/core/runtime-topology) explains app and runtime processes.
- [Migrations](/data/migrations) explains app-owned migration streams.
