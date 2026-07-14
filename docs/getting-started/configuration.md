---
title: Configuration
description: Understand GoForj render-time configuration, runtime environment, and driver selection.
---

# Configuration

GoForj uses two main configuration layers: project configuration and runtime environment configuration.

`.goforj.yml` describes the generated Project shape and local development lifecycles. `.env` files describe how each App behaves when it starts.

## When To Change Configuration

| Question | Guidance |
| --- | --- |
| Use this when | You need to change generated shape, runtime behavior, drivers, resource names, ports, secrets, or deployment defaults. |
| Avoid this when | You are trying to express business behavior that belongs in services, routes, jobs, schedules, or lifecycle hooks. |
| Start with | `.env` for local runtime behavior and `.goforj.yml` for generated App shape. |
| Upgrade to | Environment-specific files, process environment, secret management, and build-time defaults or overrides for packaged deployments. |

## Configuration Layers

| Layer | File or source | Purpose |
| --- | --- | --- |
| Project configuration | `.goforj.yml` | Component selection, rendering, App development lifecycles, custom watches, Wire paths, module replacements |
| Runtime environment | `.env`, `.env.local`, `.env.host`, process env | App name, ports, secrets, drivers, resource settings |
| Generated code | `internal/*/*_gen.go`, `app/wire/wire_gen.go` | Derived accessors, driver imports, provider wiring |
| Build-time options | `forj build` flags | Optional compiled environment defaults and overrides |

The important rule: change the correct layer for the behavior you want.

## `.goforj.yml`

`.goforj.yml` is the render contract for the Project and its Apps.

It includes fields such as:

```yaml
project_name: Example
module_name: example.com/example
apps:
  marketplace:
    components: [web_api, jobs]
dev:
  auto_migrate: true
  down_on_exit: true
  wire_paths:
    - app/wire
  apps:
    app:
      build:
        exec: forj build -o ./bin/app
        watch: [.go, .env, .env.*]
        ignore: [forj, _data, wire_gen.go, .git, .hg, .svn, .idea, .vscode, .settings, node_modules]
        root: .
        postpone: true
      run:
        exec: ./bin/app
    marketplace: true
render:
  starter_kit: none
  components: [cli, web_api, database_mysql, scheduler, jobs]
```

Top-level `apps` stores per-App render metadata. `dev.apps` selects the App lifecycles managed by `forj dev`; sibling `dev.watches` entries run independent custom commands.

Component lists contain only explicitly enabled components. Dependencies are resolved for rendering without expanding the persisted list. Legacy boolean component maps remain readable and are rewritten as compact lists the next time a render-backed workflow rewrites the configuration, including `forj render`.

Use `.goforj.yml` when you need to change the generated Project shape, enabled App components, local development orchestration, or module replacement behavior. See [forj dev](/developer-tools/forj-dev) for App lifecycle and custom watcher examples.

## Environment Files

Runtime behavior is configured through environment variables.

The generated project includes:

- `.env` for the main local runtime configuration.
- `.env.local` for local overrides.
- `.env.host` for host-specific local infrastructure settings.

The generated App entrypoint loads the environment before the App Wire graph is initialized.

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

MAIL_DRIVER=log
MAIL_SUPPORTED_DRIVERS=log

QUEUE_DRIVER=redis
QUEUE_SUPPORTED_DRIVERS=redis
```

The queue-driver choice in `forj new` is a one-time seed for these `.env` values. It is not retained in `.goforj.yml`, and an existing `.env` remains authoritative on later renders.

Apps can still start without a checked-in `.env` file. Generated local fallbacks construct usable resources for the default app shape, then process environment or environment files override them when present.

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
- `MAIL_SUPPORTED_DRIVERS`, `MAIL_DRIVER`, `MAIL_<NAME>_DRIVER`
- `DB_SUPPORTED_DRIVERS`, `DB_DRIVER`

## Regenerate After Driver Changes

Changing supported drivers can change imports, managers, and generated accessors.

The normal path is:

```bash
forj build
```

`forj build` runs generation, Wire, API indexing, and `go build`.

::: info Dev Loop
When this App is listed in `dev.apps`, its build lifecycle normally runs `forj build` for you, so saving relevant configuration or source changes flows through the complete build.
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

Generated Apps prefer local defaults first. If no environment file or process variable selects a driver, generated managers fall back to:

| Primitive | Fallback |
| --- | --- |
| Database | `sqlite` |
| Cache | `memory` |
| Storage | `local` |
| Queue | `workerpool` |
| Events | `inproc` |
| Mail | `log` |

SQLite databases use `_data/sqlite/app.db` for the default connection and `_data/sqlite/<name>.db` for named connections when no database path is configured.

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

::: warning Common mistakes
- Do not add a runtime driver without also including it in `*_SUPPORTED_DRIVERS` when generated code needs that driver compiled in.
- Do not edit generated managers by hand to add resources. Change environment configuration and regenerate.
- Do not put business behavior in `.goforj.yml`; it is a project and development configuration file.
- Do not persist queue selection under `render`; change `QUEUE_DRIVER` and `QUEUE_SUPPORTED_DRIVERS` in the environment.
- Do not use cache as durable business storage.
:::

## Next Steps

- [Project Structure](/getting-started/project-structure) explains where generated configuration is used.
- `core/drivers-and-adapters.md` will explain swappable infrastructure in more depth.
- [Libraries](/libraries/) links to standalone driver matrices and package APIs.
