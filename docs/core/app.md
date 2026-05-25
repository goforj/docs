---
title: App
description: The generated GoForj application model and the boundary between framework code and application code.
---

# App

An App is a generated GoForj application: its source tree, configuration, commands, runtime wiring, selected components, and application-owned code.

The App is the unit you build, run, test, deploy, and operate.

## What The App Owns

The App owns application behavior:

- HTTP controllers and routes
- application services
- repositories and persistence choices
- commands
- jobs
- events and subscribers
- schedules
- configuration values
- lifecycle hooks
- tests

The framework provides the structure, generated runtime glue, conventions, and integration points. The App fills those surfaces with application behavior.

## Root Shape

Most generated Apps follow this shape:

```text
cmd/
internal/
wire/
.env
.goforj.yml
```

The root `main.go` stays small. It loads environment configuration, initializes the App through Wire, and calls the generated App runner.

## App Versus Framework

Use this distinction when deciding where code belongs:

| Concern | Belongs In |
| --- | --- |
| Business behavior | App packages |
| Route, job, event, and schedule registration | Generated App extension points |
| Runtime lifecycle policy | `internal/app` |
| Framework-wide template behavior | GoForj framework source |
| Reusable primitive API | First-party library |
| Backend implementation | Driver package |

If rerendering should preserve a behavior change for all future Apps, the durable fix usually belongs in the framework templates or generators. If the behavior is application-specific, it belongs in the generated App.

## App Construction

The generated entry point calls:

```go
app, err := wire.InitializeApplication()
```

Wire resolves providers, constructs managers and services, registers framework hooks, registers application hooks, and returns the App.

Construction should not start long-running runtime work. HTTP servers, queue workers, and schedulers start when a command or runtime boundary starts them.

## App Execution

The App runs through generated commands:

```bash
forj run app
forj run api
forj run worker
forj run scheduler
forj run route:list
```

Each command has a clear runtime boundary. Some commands are short-lived. Others block until interrupted.

## Extension Points

Common App-owned extension points include:

- `internal/app/lifecycle_registry.go` for startup and shutdown hooks
- `internal/router/routes_registry.go` for application routes
- `internal/scheduler/scheduler_registry.go` for recurring work
- generated command registration surfaces for custom commands
- generated job registration surfaces for queued work
- generated event files and subscriber registration surfaces for fan-out

Use these surfaces before editing framework-owned runtime glue.

## Common Mistakes

- Do not put business workflows in `main.go`, `internal/http`, or runtime bootstrap files.
- Do not bypass generated registration surfaces with package globals.
- Do not edit generated files when a documented extension point exists.
- Do not treat the App as a dependency injection container. It is the runnable application boundary.
- Do not make business behavior depend on whether runtimes are hosted together or split.

## Next Steps

- [Runtime Lifecycle](/core/runtime-lifecycle) explains startup and shutdown.
- [Providers](/core/providers) explains construction boundaries.
- [Generated Extension Points](/core/generated-extension-points) explains where to add App behavior.
