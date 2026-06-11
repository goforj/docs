---
title: Apps
description: How GoForj Projects use the default app and optional named apps.
---

# Apps

Start with one app. Add another only when the Project needs another runnable boundary.

That rule keeps GoForj simple: one Project, shared application behavior under `internal/`, and clear app composition under `app/`.

## The Default Shape

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

## Add A Named App

Use `make:app` when you need another app:

```bash
forj make:app billing
```

That creates conventional app files:

```text
cmd/billing/main.go
app/billing/
app/billing/wire/
```

You can choose the app surface explicitly:

```bash
forj make:app billing --components web-api,jobs
forj make:app portal --components web-api,web-ui --starter-kit vue
```

Remove conventional generated app files with:

```bash
forj make:app billing --remove
```

Removal is conservative. It should not delete unknown app-owned files or migration history.

## Run A Named App

Prefix the command with the app name:

```bash
forj billing route:list
forj billing api
forj billing worker
forj billing scheduler
```

Built binaries follow the same shape:

```bash
./bin/billing api
./bin/billing worker
```

Unqualified commands use the default app:

```bash
forj route:list
forj api
```

## What Belongs Where

`internal/` owns behavior. Apps own exposure.

For example, a billing controller can live in:

```text
internal/billing/invoices/controller.go
```

The `billing` app exposes it through:

```text
app/billing/routes.go
app/billing/wire/inject_http_controllers_app.go
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
  billing:
    components:
      web_api: true
      jobs: true
    starter_kit: none
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
BILLING_PORT=3100
BILLING_WORKER_METRICS_PORT=10112
```

Default-app globals such as `PORT` and `METRICS_PORT` do not apply to named apps.

## Queue And Migration Boundaries

App code uses logical queue names such as `default` or `reports`. Named apps physicalize backend queue names with the app prefix, such as `billing_default`, so multiple apps can share a queue backend safely.

Migrations are app-owned when a Project has multiple apps:

```text
migrations/
  app/default/
  billing/default/
  billing/ledger/
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
- [Runtime Topology](/core/runtime-topology) explains app and runtime process shapes.
- [Migrations](/data/migrations) explains app-owned migration streams.
