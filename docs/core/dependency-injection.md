---
title: Dependency Injection
description: How GoForj uses explicit provider functions and Wire to construct generated Apps.
---

# Dependency Injection

GoForj uses explicit Go constructors and Google Wire to build generated Apps.

The App dependency graph is generated and compiled. It is not a runtime reflection container.

## Why It Exists

Applications need shared services, resources, runtimes, commands, controllers, and providers.

GoForj wires those dependencies explicitly so construction is auditable, compile-time checked, and easy to inspect when something is wrong.

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

GoForj groups providers into Wire sets.

Examples:

- `appSet` provides application-level managers, timeouts, lifecycle registry, inspect manager, event manager, and metrics manager.
- `cmdSet` provides generated commands and application commands.
- HTTP, scheduler, jobs, cache, storage, database, mail, and auth sets are included when their components are enabled.

The final App is constructed by `NewApplication`.

## App Construction

`NewApplication` receives the dependencies Wire resolved.

It then:

- creates the lifecycle manager
- normalizes runtime topology
- attaches log sinks for inspect records
- attaches cache and event observers
- registers framework lifecycle hooks
- registers queue job handlers
- calls the user lifecycle registry
- returns the App with its managers and command root

This is construction and registration. Long-running runtime work still starts through commands and lifecycle execution.

## Application Services

Application-owned services should use normal constructor injection.

Example shape:

```go
package reports

type Service struct {
	repo  *Repository
	cache Cache
}

func NewService(repo *Repository, cache Cache) *Service {
	return &Service{
		repo:  repo,
		cache: cache,
	}
}
```

Add the constructor to the appropriate provider set so Wire can build it.

Do not reach into global state from services. Services should receive dependencies through constructors.

## Required And Optional Dependencies

Constructor parameters are part of a service's contract.

If a service requires a repository, queue, cache, or manager, make that dependency visible in the constructor. If a dependency is optional, model that explicitly with a separate option, configuration value, or clearly nullable field.

This keeps the dependency graph easy to read and lets generation, construction, and tests expose invalid wiring early.

## Generated Managers

Generated managers provide stable App access to infrastructure resources.

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

Managers should be cheap to construct. Backend connections should happen at the correct lifecycle or first-use boundary.

## Regenerate Wiring

Run the build pipeline after changing providers, generated components, or Wire sets:

```bash
forj build
```

For normal development, use `forj build`.

::: info Dev Loop
`forj dev` normally runs that build path through its generated watcher.
:::

For focused manual generation:

```bash
forj generate
```

`forj build` runs generation, Wire, API indexing, and `go build`.

## Common Mistakes

- Do not introduce a reflection container for application services.
- Do not use package globals to bypass Wire.
- Do not make required dependencies look optional.
- Do not edit `wire_gen.go` by hand.
- Do not put business workflows in provider functions.

## Next Steps

- [Generated Components](/core/generated-components) explains generated managers and accessors.
- [Project Structure](/getting-started/project-structure) explains where wiring files live.
