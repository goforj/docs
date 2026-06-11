---
title: Generated Components
description: How GoForj generates App code for selected components, named resources, and driver support.
---

# Generated Components

Generated components are the framework-owned code surfaces GoForj renders from project configuration and environment configuration.

They make the App cohesive without requiring runtime reflection or hidden registration.

## Why They Exist

GoForj Apps need glue code for commands, managers, runtime packages, drivers, accessors, and Wire providers.

Writing that glue by hand is repetitive and easy to drift. GoForj generates the framework-owned parts so the App keeps one consistent shape while user code stays explicit.

## Project Rendering

`forj new` writes `.goforj.yml` and renders the selected project components.

`.goforj.yml` controls the rendered project shape:

```yaml
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

Changing component selection changes the generated App structure. The available packages, commands, Wire sets, and environment defaults depend on this contract.

## Build-Time Generation

The normal regeneration path is:

```bash
forj build
```

`forj build` runs:

1. generated component refresh
2. Wire generation
3. API indexing
4. `go build`

Use this when you want the App and binary to be current.

## Focused Generation

The normal path is still `forj build`.

::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
:::

Use focused generation only when you intentionally want to refresh one resource family without running the full build:

```bash
forj generate --cache
forj generate --storage
forj generate --queue
forj generate --events
forj generate --db
forj generate --observability
```

Running `forj generate` without flags runs the available generators for the current App.

## Generated Managers

Generated managers provide stable App access to infrastructure resources selected for the project.

Examples:

```go
app.Cache()
app.Caches()
app.Storage()
app.Events()
app.Bus()
app.Queue()
app.Queues()
app.DB()
```

Managers are generated App surfaces, not dependency injection concepts. Wire may construct them, but their purpose is to expose framework-owned resources through stable App methods.

Managers should be cheap to construct. Backend connections should happen at the correct lifecycle or first-use boundary.

## Named Resources

Several GoForj primitives generate named resources from environment scopes.

Examples:

```text
CACHE_DRIVER=memory
CACHE_SESSIONS_DRIVER=redis

STORAGE_DRIVER=local
STORAGE_PUBLIC_DRIVER=local
STORAGE_UPLOADS_DRIVER=s3

QUEUE_DRIVER=workerpool
QUEUE_CRITICAL_DRIVER=redis

EVENTS_DRIVER=inproc
EVENTS_AUDIT_DRIVER=redis
```

Generated accessors can then expose stable App methods such as:

```go
app.Caches().Sessions()
app.Storage().Public()
app.Storage().Uploads()
app.Queues().Critical()
app.Events().Audit()
```

Named accessors represent generated invariants. If the current environment and generated code are out of sync, the App should fail fast instead of pretending the resource exists.

## Driver Support

Driver support is generated separately from runtime driver selection.

`*_SUPPORTED_DRIVERS` determines which driver packages and factories are compiled into the App.

`*_DRIVER` and `*_<NAME>_DRIVER` choose active drivers at runtime.

Example:

```text
STORAGE_SUPPORTED_DRIVERS=local,s3
STORAGE_DRIVER=local
STORAGE_UPLOADS_DRIVER=s3
```

This compiles local and S3 storage support into the App, uses local for the default disk, and uses S3 for the named `uploads` disk.

## Render Once Files

Some generated files are intended for user customization after initial render.

Examples:

- `app/lifecycle.go`
- `app/routes.go`
- `app/commands.go`
- `app/schedules.go`
- application command registration surfaces
- schedule registry surfaces
- route/controller extension surfaces

Prefer documented extension points over editing generated runtime glue directly.

## When To Regenerate

Generated code should be refreshed after changing:

- selected components in `.goforj.yml`
- supported driver lists
- named cache, storage, queue, or event scopes
- database driver support
- provider sets or generated Wire inputs
- observability app and runtime configuration

Use `forj build` when unsure.

::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
:::

## Common Mistakes

::: warning Common mistakes
- Do not edit generated manager files to add named resources by hand.
- Do not add a runtime driver without including it in `*_SUPPORTED_DRIVERS`.
- Do not edit `wire_gen.go` manually.
- Do not put application business behavior in generated framework glue.
- Do not assume every generated file has the same ownership model.
:::

## Next Steps

- [Configuration](/getting-started/configuration) explains environment and driver selection.
- [Dependency Injection](/core/dependency-injection) explains Wire and providers.
