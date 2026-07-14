---
title: Apps
description: How GoForj Projects use the default app and optional named apps.
---

# Apps

Start with one app. Add another only when the Project needs another runnable boundary.

That rule keeps GoForj simple: one Project, shared application behavior under `internal/`, and clear app composition under `app/`.

## The default shape

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

The default app is enough for most Projects.

## Add a named app

Use `make:app` when you need another app:

```bash
forj make:app marketplace
```

That creates conventional app files:

```text
cmd/marketplace/main.go
app/marketplace/
app/marketplace/wire/
```

You can choose the app surface explicitly:

```bash
forj make:app billing --components web-api,jobs --dev-run run
forj make:app backstage --components web-api,scheduler --starter-kit vue
```

The interactive wizard includes a Dev Run choice. Runtime-capable wizard Apps default to the conventional `run` lifecycle, while CLI-only or explicitly disabled Apps remain absent from `dev.apps`.

When scripting `make:app` with flags, use `--dev-run run` to enroll the App in `forj dev`. Use another App command, such as `--dev-run queue:work`, only when that is the intended long-running process.

Remove conventional generated app files with:

```bash
forj make:app marketplace --remove
```

Removal is conservative. It should not delete unknown app-owned files or migration history.

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

Built binaries follow the same shape:

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

The app prefix also chooses the registration point for `make:*` commands.

```bash
forj marketplace make:controller checkout
forj marketplace make:job sync-catalog
forj marketplace make:model order
```

These commands create behavior under `internal/`, then wire exposure through the selected app. For the controller above, that means:

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

## What Belongs Where

`internal/` owns behavior. Apps own exposure.

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

## App Metadata

GoForj discovers apps by convention:

```text
cmd/<app>/main.go
app/<app>/
```

`.goforj.yml` can store per-app component and starter-kit choices under `apps`, but layout decides which apps exist.

```yaml
apps:
  marketplace:
    components: [web_api, jobs]
    starter_kit: none
```

This top-level `apps` metadata is separate from `dev.apps`, which selects the App lifecycles managed by `forj dev`.

## App-scoped output

Outputs that used to assume one app are now app-aware where they need to be.

API index and OpenAPI output stay simple for the default app:

```text
build/api_index.json
build/openapi.json
```

Named apps write under their app name:

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

Generated `internal/runtime/apps.go` compiles app metadata into each binary. Do not edit it by hand.

Default ports are deterministic:

| App | HTTP | Metrics | Scheduler metrics | Worker metrics |
| --- | ---: | ---: | ---: | ---: |
| `app` | `3000` | `10000` | `10001` | `10002` |
| first named app | `3001` | `10010` | `10011` | `10012` |
| second named app | `3002` | `10020` | `10021` | `10022` |

Named app overrides use an uppercase app prefix:

```text
MARKETPLACE_PORT=3100
MARKETPLACE_WORKER_METRICS_PORT=10112
```

Default-app globals such as `PORT` and `METRICS_PORT` do not apply to named apps.

When `make:app` writes local env defaults, it uses the next available app HTTP port so sequential app creation does not make two named apps bind the same listener.

## Queue and Migration Boundaries

App code uses logical queue names such as `default` or `sync`. Named apps physicalize backend queue names with the app prefix, such as `marketplace_default`, so multiple apps can share a queue backend safely.

Migrations are app-owned when a Project has multiple apps:

```text
migrations/
  app/default/
  marketplace/default/
  marketplace/archive/
```

If two apps share one physical database, choose one app to own that database's migration stream.

## Common Mistakes

::: warning Common mistakes
- Do not create named apps just to organize packages.
- Do not put business behavior in `app/` or `cmd/<app>/`.
- Do not rely on `.goforj.yml` as the source of app discovery.
- Do not expect named apps to share process-local drivers across processes.
:::

## Next Steps

- [Project Structure](/getting-started/project-structure) shows the generated tree.
- [forj dev](/developer-tools/forj-dev) explains App lifecycle orchestration and custom watches.
- [Runtime Topology](/core/runtime-topology) explains app and runtime process shapes.
- [Migrations](/data/migrations) explains app-owned migration streams.
