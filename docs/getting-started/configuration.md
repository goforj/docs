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

Modern configuration stores only the enabled component names in a YAML sequence. Short selections stay compact, such as `components: [cli, web_api]`; longer selections use normal multiline YAML. No `component_contract` field is needed or written. Legacy boolean component maps remain readable and are rewritten as sequences the next time a render-backed workflow rewrites the configuration, including `forj render`.

Component lists contain only explicitly enabled components. Dependencies are resolved for rendering without expanding the saved list. `forj new` starts with Cache, Events, File Storage, and Background Jobs enabled, while keeping each one selectable. It also keeps the database concrete: MySQL starts selected, and Postgres and SQLite are alternatives on the same Components screen.

Components gate generated code. If Cache, Events, File Storage, or Background Jobs is absent from every App selection, GoForj does not render that resource package, its providers, or its environment entries. A named App receives only the APIs and App-prefixed defaults for its own selections. Background Jobs owns the Queue resource, job support, and worker runtime. Some higher-level components add required dependencies; for example, Auth requires Mail, Web API, Cache, and a selected database engine.

You can add a component later by adding its name and running `forj render`. Removing a name is deliberately not an uninstall command: GoForj removes only output it can prove is framework-owned, refuses before writing when source or configuration still depends on the component, and never deletes cache state, stored files, queued work, or event history. Driver changes remain separate environment choices and usually do not require changing components.

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
CACHE_SUPPORTED_DRIVERS=memory,redis

STORAGE_DRIVER=local
STORAGE_SUPPORTED_DRIVERS=local

EVENTS_DRIVER=inproc
EVENTS_SUPPORTED_DRIVERS=inproc,redis

MAIL_DRIVER=log
MAIL_SUPPORTED_DRIVERS=log,smtp

QUEUE_DRIVER=workerpool
QUEUE_SUPPORTED_DRIVERS=workerpool,redis
```

`forj new` derives these values from the selected components. There is no separate driver-selection screen. It selects the chosen database engine, starts Cache in memory, Background Jobs on workerpool, Events in-process, and File Storage locally. Mail starts with SMTP when Docker is enabled and log output otherwise. An existing `.env` remains authoritative when rendering into an existing directory.

Apps that use only built-in local fallbacks can start without a checked-in `.env` file. When a selected resource differs from its fallback, such as a MySQL database, provide its active driver and connection values through an environment file or process environment.

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

New Projects compile both the local driver and Redis for Cache, Queue, and Events. Moving one of those resources to Redis later usually means provisioning Redis, changing its active `*_DRIVER`, and restarting the App. Selecting a driver outside the supported list still requires adding it to `*_SUPPORTED_DRIVERS` and rebuilding.

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

Only enabled components participate. An explicit focused command for a disabled component fails with a message that points back to `.goforj.yml`.

## Generated Fallbacks

Generated managers retain local fallbacks when no environment value selects a driver:

| Primitive | Fallback |
| --- | --- |
| Database | `sqlite` |
| Cache | `memory` |
| Storage | `local` |
| Queue | `workerpool` |
| Events | `inproc` |
| Mail | `log` |

The fallback must be included in the generated driver's supported set. New Projects write explicit active selections so a MySQL-only or Postgres-only App does not rely on the SQLite fallback.

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
- [Drivers and Adapters](/core/drivers-and-adapters) explains swappable infrastructure in more depth.
- [Libraries](/libraries/) links to standalone driver matrices and package APIs.
