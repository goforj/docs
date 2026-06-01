---
title: Project Structure
description: Understand the generated GoForj App layout and extension points.
---

# Project Structure

A GoForj App is a generated Go project with explicit runtime packages, Wire wiring, environment files, and first-party component surfaces.

The exact tree depends on the components selected in `.goforj.yml`. This page describes the common structure and the ownership model behind it.

## Root Files

```text
.
|-- .goforj.yml
|-- .env
|-- .env.local
|-- .env.host
|-- main.go
|-- go.mod
|-- docker-compose.yml
|-- bin/
|-- internal/
|-- migrations/
|-- wire/
`-- frontend/
```

Some files appear only when the matching component is enabled.

## `.goforj.yml`

`.goforj.yml` is the project contract for rendering and local development.

It records:

- project name
- Go module path
- selected components
- optional starter kit
- queue driver default
- dev pre-tasks
- dev watchers
- Wire paths
- optional module replacements for local framework/library development

The renderer reads this file when project files need to be generated or refreshed.

## Environment Files

The generated App uses environment files for runtime configuration.

Common files:

- `.env` contains the main local runtime configuration.
- `.env.local` contains local overrides.
- `.env.host` contains host-oriented values for local infrastructure.

The generated `main.go` loads environment configuration before initializing the App through Wire.

## `main.go`

`main.go` is the executable entry point.

Its responsibilities are intentionally small:

- load environment configuration
- register embedded frontend assets when Web UI is enabled
- initialize the App through `wire.InitializeApplication()`
- pass command arguments into `app.Run`

Business logic should not live in `main.go`.

## `wire/`

`wire/` contains dependency wiring for the generated App.

Important files include:

- `wire/wire.go`
- `wire/wire_gen.go`
- `wire/app.go`
- component-specific inject files such as `inject_http.go`, `inject_queue.go`, `inject_storage.go`, and `inject_cache.go`

GoForj uses explicit provider functions and Google Wire. The App is constructed through generated wiring rather than a runtime reflection container.

## `internal/app`

`internal/app` owns root runtime policy.

It contains:

- lifecycle coordination
- startup and shutdown phases
- runtime host behavior
- timeout policy
- runtime source metadata

The primary user extension point for lifecycle behavior is:

```text
internal/app/lifecycle_registry.go
```

Use that file for startup hooks, shutdown hooks, and app-level lifecycle integration.

## `internal/cmd`

`internal/cmd` owns the generated App command surface.

The generated root command includes framework commands such as:

- `app`
- `api`
- `route:list`
- `worker`
- `scheduler`
- `migrate`
- `make:event`
- `make:job`
- `make:schedule`

Application-specific commands belong in the App command extension surface, not in ad hoc shell scripts around the binary.

## Runtime Packages

Runtime packages appear when their components are enabled:

- `internal/http` owns HTTP server composition, health endpoints, readiness, route listing, Swagger, and HTTP runtime behavior.
- `internal/jobs` owns long-running queue worker process behavior.
- `internal/schedules` owns scheduler runtime behavior and schedule registration.
- `internal/lighthouse` owns Lighthouse runtime and operator-facing integration.
- `internal/metrics` owns metrics registration and export behavior.

These packages are runtime boundaries. Keep process startup, shutdown, and operator behavior close to the runtime that owns it.

## Infrastructure Packages

Infrastructure packages expose named resources and generated managers:

- `internal/caches`
- `internal/storages`
- `internal/events`
- `internal/queues`
- `internal/database`
- `internal/mail`

The generated App exposes these through App accessors such as:

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

The available accessors depend on selected components.

## Application Code

Application-owned behavior should live in focused packages under `internal/`.

Examples:

- `internal/users`
- `internal/reports`
- `internal/uploads`
- `internal/notifications`

Controllers should translate HTTP requests into service calls. Services should own application behavior. Repositories should own persistence-specific access.

## Generated and User-Owned Code

GoForj renders code so the App has a complete local structure, but not every file has the same ownership.

Prefer these extension points first:

- lifecycle hooks in `internal/app/lifecycle_registry.go`
- commands in the generated App command surface
- routes and controllers in the generated HTTP surfaces
- schedules in `internal/schedules/scheduler_registry.go`
- domain behavior in application-owned packages under `internal/`

Avoid scattering changes through generated runtime glue when a documented extension point exists.

## Next Steps

- [Configuration](/getting-started/configuration) explains render-time and runtime configuration.
- [Runtime Lifecycle](/core/runtime-lifecycle) explains startup, execution, and shutdown.
- [Generated Components](/core/generated-components) explains how GoForj refreshes component code.
