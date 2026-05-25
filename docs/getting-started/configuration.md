---
title: Configuration
description: Understand GoForj render-time configuration, runtime environment, and driver selection.
---

# Configuration

GoForj uses two main configuration layers: project configuration and runtime environment configuration.

`.goforj.yml` describes what the App is and how local development should run. `.env` files describe how the App behaves when it starts.

## Configuration Layers

| Layer | File or source | Purpose |
| --- | --- | --- |
| Project configuration | `.goforj.yml` | Component selection, rendering, dev watchers, Wire paths, module replacements |
| Runtime environment | `.env`, `.env.local`, `.env.host`, process env | App name, ports, secrets, drivers, resource settings |
| Generated code | `internal/*/*_gen.go`, `wire/wire_gen.go` | Derived accessors, driver imports, provider wiring |
| Build-time options | `forj build` flags | Optional compiled defaults, overrides, and default launch behavior |

The important rule: change the correct layer for the behavior you want.

## `.goforj.yml`

`.goforj.yml` is the render contract for the App.

It includes fields such as:

```yaml
project_name: Example
module_name: example.com/example
dev:
  auto_migrate: true
  down_on_exit: true
  wire_paths:
    - wire
render:
  starter_kit: none
  queue_driver: redis
  components:
    cli: true
    web_api: true
    jobs: true
    scheduler: true
    database_mysql: true
```

Use `.goforj.yml` when you need to change the generated project shape, enabled components, local dev watchers, or module replacement behavior.

## Environment Files

Runtime behavior is configured through environment variables.

The generated project includes:

- `.env` for the main local runtime configuration.
- `.env.local` for local overrides.
- `.env.host` for host-specific local infrastructure settings.

The generated `main.go` calls the App environment loader before `wire.InitializeApplication()`.

Common variables include:

```text
APP_NAME=Example
APP_ENV=local
APP_DEBUG=0
APP_URL=http://localhost:3000
APP_SHUTDOWN_TIMEOUT=30s

API_HTTP_HOST=0.0.0.0
API_HTTP_PORT=3000

CACHE_DRIVER=memory
CACHE_SUPPORTED_DRIVERS=memory

STORAGE_DRIVER=local
STORAGE_SUPPORTED_DRIVERS=local

EVENTS_DRIVER=inproc
EVENTS_SUPPORTED_DRIVERS=inproc
```

## Driver Configuration

GoForj separates compile-time driver support from runtime driver selection.

`*_SUPPORTED_DRIVERS` controls which drivers are generated into the App at compile time.

`*_DRIVER` selects which supported driver is used at runtime.

For named resources, use `*_<NAME>_DRIVER`.

Example:

```text
CACHE_SUPPORTED_DRIVERS=memory,redis
CACHE_DRIVER=memory
CACHE_SESSIONS_DRIVER=redis
```

This generates support for memory and Redis cache drivers. The default cache uses memory. The named `sessions` cache uses Redis.

This pattern appears across GoForj primitives:

- `CACHE_SUPPORTED_DRIVERS`, `CACHE_DRIVER`, `CACHE_<NAME>_DRIVER`
- `STORAGE_SUPPORTED_DRIVERS`, `STORAGE_DRIVER`, `STORAGE_<NAME>_DRIVER`
- `QUEUE_SUPPORTED_DRIVERS`, `QUEUE_DRIVER`, `QUEUE_<NAME>_DRIVER`
- `EVENTS_SUPPORTED_DRIVERS`, `EVENTS_DRIVER`, `EVENTS_<NAME>_DRIVER`
- `DB_SUPPORTED_DRIVERS`, `DB_DRIVER`

## Regenerate After Driver Changes

Changing supported drivers can change imports, managers, and generated accessors.

The normal path is:

```bash
forj build
```

`forj build` runs generation, Wire, API indexing, and `go build`.

::: info Dev Loop
During local development, `forj dev` normally runs the generated build watcher for you, so saving the relevant configuration or source changes will flow through `forj build`.
:::

Use focused generation only when you intentionally want to refresh one generated surface without running the full build:

```bash
forj generate --cache
forj generate --storage
forj generate --queue
forj generate --events
forj generate --db
```

## Local-First Defaults

Generated Apps prefer local defaults first:

- memory cache
- local storage
- in-process events
- local or compose-backed databases
- local queue drivers when selected

Production deployments can swap drivers through environment and providers without rewriting application business logic.

## Named Resources

Named resources are generated from scoped environment variables.

For storage:

```text
STORAGE_SUPPORTED_DRIVERS=local,s3
STORAGE_DRIVER=local
STORAGE_PUBLIC_DRIVER=local
STORAGE_UPLOADS_DRIVER=s3
STORAGE_UPLOADS_BUCKET=my-app-uploads
STORAGE_UPLOADS_REGION=us-east-1
```

The generated App can expose named accessors such as:

```go
app.Storage().Public()
app.Storage().Uploads()
```

Named generated accessors represent generated configuration invariants. If the current environment and generated code are out of sync, those accessors fail fast instead of silently returning a missing dependency.

## Build-Time Environment Defaults

`forj build` can compile default or forced environment values into the binary:

```bash
forj build --env-defaults APP_ENV=local
forj build --env-overrides APP_ENV=production
```

Defaults apply only when a key is unset. Overrides force the value.

These options are useful for packaging, but most local development should use `.env` files and process environment variables.

## Common Mistakes

- Do not add a runtime driver without also including it in `*_SUPPORTED_DRIVERS` when generated code needs that driver compiled in.
- Do not edit generated managers by hand to add resources. Change environment configuration and regenerate.
- Do not put business behavior in `.goforj.yml`; it is a project and development configuration file.
- Do not use cache as durable business storage.

## Next Steps

- [Project Structure](/getting-started/project-structure) explains where generated configuration is used.
- `core/drivers-and-adapters.md` will explain swappable infrastructure in more depth.
- [Libraries](/libraries/) links to standalone driver matrices and package APIs.
