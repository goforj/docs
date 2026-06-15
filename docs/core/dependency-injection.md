---
title: Dependency Injection
description: How GoForj uses explicit provider functions and app-local Wire graphs.
---

# Dependency Injection

GoForj uses explicit Go constructors and Wire-generated code. It does not use a runtime service locator.

Each app has its own Wire graph.

## The Model

Application packages own constructors:

```go
func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}
```

The app's Wire package assembles those constructors:

```text
internal package -> app/wire provider set -> app/wire/wire_gen.go -> app
```

For a named app, the graph lives under `app/<name>/wire`.

## Where It Lives

Default app:

```text
app/wire/
  wire.go
  wire_gen.go
  inject_cmd_app.go
  inject_http_controllers_app.go
  inject_services_app.go
```

Named app:

```text
app/marketplace/wire/
  wire.go
  wire_gen.go
  inject_cmd_app.go
  inject_http_controllers_app.go
  inject_services_app.go
```

Generated files appear only when the selected components need them.

## Provider Sets

Provider sets group constructors for a specific app surface:

- application services
- repositories
- HTTP controllers
- commands
- jobs
- schedules
- subscribers
- framework managers

The order inside `wire.NewSet` is not construction order. Wire reads the whole graph, matches types, and writes ordinary Go code to `wire_gen.go`.

## Construction Boundary

Wire constructs the app. It does not start long-running runtime work.

Construction can allocate services, adapters, managers, controllers, commands, and registries. HTTP servers, queue workers, and schedulers start when a command starts that runtime.

## Regenerate Wiring

Run the build pipeline after changing providers, generated components, or Wire sets:

```bash
forj build
```

For a named app:

```bash
forj marketplace build
```

::: info Dev Loop
`forj dev` normally runs the build path through its watcher. In a multi-app Project, unqualified `forj dev` builds and runs discovered apps.
:::

## Common Mistakes

::: warning Common mistakes
- Do not use package globals to hide dependencies from Wire.
- Do not edit `wire_gen.go` by hand.
- Do not add nil guards around required constructor-injected dependencies.
- Do not put business workflows in provider functions.
:::

## Next Steps

- [Providers](/core/providers) defines provider functions.
- [Wiring Recipes](/core/wiring-recipes) shows which app-local file to edit.
- [Reading Wire Errors](/core/reading-wire-errors) explains common Wire failures.
