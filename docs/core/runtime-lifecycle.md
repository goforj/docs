---
title: Runtime Lifecycle
description: How a GoForj App starts, runs commands and runtimes, and shuts down.
---

# Runtime Lifecycle

The runtime lifecycle is the ordered path from App construction to startup, command execution, runtime work, and graceful shutdown.

GoForj keeps lifecycle behavior explicit so commands, HTTP servers, workers, schedulers, metrics, events, and storage all have a predictable place to start and stop.

## Why It Exists

Go applications often accumulate startup behavior in `main.go`, package `init` functions, or hidden global state.

GoForj avoids that. The generated App creates dependencies through Wire, registers lifecycle hooks explicitly, starts the App before command execution, and shuts it down through the lifecycle manager.

## Execution Flow

The generated `main.go` keeps the entry point small:

1. load environment configuration
2. handle skip-boot commands when applicable
3. register embedded frontend assets when Web UI is enabled
4. initialize the App through `wire.InitializeApplication()`
5. call `app.Run(nil, args)`

Inside `App.Run`, the App:

1. parses generated CLI commands
2. attaches a cancellable context
3. begins an inspect record for command execution
4. starts the App lifecycle
5. runs the selected command
6. shuts the App down with a bounded timeout
7. finishes the inspect record

## Lifecycle Phases

Generated Apps use the lifecycle manager in `internal/app`.

Startup phases run in registration order:

- `BeforeStartup`
- `Startup`
- `AfterStartup`

Shutdown phases run in reverse registration order:

- `BeforeShutdown`
- `Shutdown`
- `AfterShutdown`

Startup runs once. Shutdown runs only after startup has completed.

## Register Hooks

The primary user extension point is:

```text
internal/app/lifecycle_registry.go
```

Use this file when application code needs startup or shutdown behavior.

```go
package app

type LifecycleRegistry struct {
	reportService *reports.Service
}

func NewLifecycleRegistry(reportService *reports.Service) *LifecycleRegistry {
	return &LifecycleRegistry{reportService: reportService}
}

func (r *LifecycleRegistry) Register(lifecycle *Lifecycle) {
	lifecycle.On(Startup, func(ctx context.Context) error {
		return r.reportService.WarmCache(ctx)
	})

	lifecycle.On(Shutdown, func(ctx context.Context) error {
		return r.reportService.Flush(ctx)
	})
}
```

`NewLifecycleRegistry` is built by Wire, so it can receive injected services and repositories.

## Framework Hooks

GoForj also registers framework-owned lifecycle hooks during App construction.

Examples include:

- event buses start during startup and close during shutdown
- database connections close during shutdown
- framework-owned queue job handlers are registered during App construction
- cache observers record cache operations into inspects
- event observers record events into inspects and metrics

These hooks are registered explicitly in the generated App wiring. They are not hidden runtime registrations.

App-owned handlers and subscribers should still be registered through documented App extension points before their runtime starts.

## Shutdown Timeouts

The App resolves timeout policy once near the root runtime.

Important variables include:

```text
APP_SHUTDOWN_TIMEOUT=30s
SCHEDULER_SUBPROCESS_SHUTDOWN_TIMEOUT=90s
QUEUE_SHUTDOWN_TIMEOUT=10s
```

The scheduler subprocess path can use a scheduler-specific shutdown timeout. Normal App shutdown uses the App shutdown timeout.

## Runtime Boundaries

The lifecycle applies to every generated command, but not every command starts the same long-running work.

Examples:

- `forj run route:list` starts the App lifecycle, lists routes, and shuts down.
- `forj run api` starts the HTTP runtime and blocks until interrupted.
- `forj run worker` starts worker runtime behavior and blocks until interrupted.
- `forj run scheduler` starts scheduler runtime behavior and blocks until interrupted.
- `forj run app` starts enabled runtimes together through the runtime host.

Runtime-specific behavior belongs near the runtime package that owns it.

## Common Mistakes

::: warning Common mistakes
- Do not put startup behavior in `main.go` when it belongs in `internal/app/lifecycle_registry.go`.
- Do not make required dependencies appear optional. Construction and lifecycle behavior should expose invalid setup clearly.
- Do not run long-lived runtime startup from random constructors.
- Do not scatter shutdown behavior across package globals.
:::

## Next Steps

- [Runtime Topology](/core/runtime-topology) explains combined and split runtime process shapes.
- [Project Structure](/getting-started/project-structure) explains where runtime packages live.
