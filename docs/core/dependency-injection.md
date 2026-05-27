---
title: Dependency Injection
description: How GoForj uses explicit provider functions and Wire to construct generated Apps.
---

# Dependency Injection

GoForj uses explicit Go constructors and Google Wire to build generated Apps.

The dependency graph is generated and compiled. It is not a runtime reflection container.

## The Model

Application packages own constructors:

```go
func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}
```

The generated `wire` package assembles those constructors into the App graph.

```text
application package -> provider set -> wire/wire_gen.go -> App
```

Wire matches constructor parameters to provider return types. If a constructor needs `*reports.Repository`, some provider in the graph must return `*reports.Repository`.

## Where It Lives

The main wiring package is:

```text
wire/
```

Common files include:

- `wire/wire.go`
- `wire/wire_gen.go`
- `wire/app.go`
- `wire/inject_app_services.go`
- `wire/inject_cmd.go`
- `wire/inject_http.go`
- `wire/inject_queue.go`
- `wire/inject_storage.go`
- `wire/inject_cache.go`

The generated entry point calls:

```go
app, err := wire.InitializeApplication()
```

## Provider Sets

Provider sets group constructors for a specific App surface.

Examples:

- `appSet` provides application services and App-level dependencies.
- `cmdSet` provides generated command dependencies.
- HTTP, jobs, queue, cache, storage, database, mail, and auth sets appear when those components are enabled.

The order inside `wire.NewSet` is not construction order. Wire reads the whole graph, matches types, and writes ordinary Go code to `wire/wire_gen.go`.

Use [Wiring Recipes](/core/wiring-recipes) when you need to know which set to edit.

## Construction Boundary

Wire constructs the App. It does not run the App.

App construction can:

- allocate services, adapters, managers, controllers, commands, and registries
- validate required construction inputs
- register framework and application hooks
- return a complete App value

Long-running runtime work still starts through commands and lifecycle execution.

## Constructor Contracts

Constructor parameters are dependencies.

If a service requires a repository, queue, cache, manager, adapter, or gateway, make that dependency visible in the constructor signature. If behavior is optional, model that explicitly with configuration, a disabled implementation, or a clearly optional branch.

Do not use package globals to hide dependencies from the graph.

## Regenerate Wiring

Run the build pipeline after changing providers, generated components, or Wire sets:

```bash
forj build
```

`forj build` refreshes generated code, runs Wire, indexes APIs, and builds the App binary.

::: info Dev Loop
`forj dev` normally runs that build path through its generated watcher.
:::

## Common Mistakes

::: warning Common mistakes
- Do not introduce a reflection container.
- Do not use package globals to bypass Wire.
- Do not make required dependencies look optional.
- Do not edit `wire/wire_gen.go` by hand.
- Do not put business workflows in provider functions.
:::

## Next Steps

- [Providers](/core/providers) defines provider functions.
- [Provider Patterns](/core/provider-patterns) shows practical provider shapes.
- [Wiring Recipes](/core/wiring-recipes) shows where to register each kind of constructor.
- [Reading Wire Errors](/core/reading-wire-errors) explains common Wire failure modes.
