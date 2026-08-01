---
title: Dependency Injection
description: Follow a dependency from its provider through Wire to App construction.
---

# Dependency Injection

GoForj Apps use ordinary Go constructors and Wire-generated construction. A dependency is visible in a constructor, registered in an App-local Wire set, and then passed by generated Go code. There is no runtime service locator.

::: info Wire reference
This guide traces dependency injection inside a GoForj App. For standalone Wire installation and generation, provider-set semantics, compatibility details, and the complete API documentation, see the [Wire library page](/wire).
:::

## One Dependency, End to End

The [JSON API Route](/scenarios/json-api-route) scenario is the canonical runnable example. It adds a `users.Service` dependency to a generated controller. From an HTTP-enabled App root, run:

```bash
forj make:controller users
```

The command creates `internal/users/controller.go`, adds `users.NewController` to `app/wire/inject_http_controllers_app.go`, and adds the controller's routes to `app/routes.go`. Create the service in `internal/users/service.go`:

<!-- go-example: illustrative-fragment -->
```go
package users

type Service struct{}

func NewService() *Service {
	return &Service{}
}
```

Then add the import and provider to the App-owned `app/wire/inject_services_app.go`:

<!-- go-example: illustrative-fragment -->
```go
var appSet = wire.NewSet(
	users.NewService,
	app.NewLifecycleRegistry,
	runtime.NewTimeouts,
)
```

The controller constructor makes the required dependency explicit:

<!-- go-example: source-backed-excerpt -->
```go
func NewController(service *Service) *Controller {
	return &Controller{service: service}
}
```

Run the build pipeline after changing a Wire-owned provider set:

```bash
forj build
go test ./...
forj route:list
```

Expected results: `forj build` regenerates `app/wire/wire_gen.go` without an error, tests pass, and `route:list` includes `/api/v1/users/:id`. The generated file is output, not an extension point: do not edit it by hand.

## Where the Graph Lives

For the default App, the relevant files are:

```text
internal/users/service.go                     application constructor
internal/users/controller.go                  HTTP constructor and routes
app/wire/inject_services_app.go               application service providers
app/wire/inject_http_controllers_app.go       controller providers
app/wire/wire_gen.go                          generated construction output
app/routes.go                                 App-owned route composition
```

Additional apps use the same shape under `app/<name>/wire/` and `app/<name>/routes.go`.

This is where application services belong. GoForj supplies the framework providers, but your App-owned `_app.go` files are the normal place to add constructors for services, repositories, gateways, clients, and adapters used by that App.

## Share a Service Between Apps

Sharing an `internal` package does not share a runtime singleton. Each App has its own entrypoint and Wire graph, so each binary constructs the service for itself:

::: code-group

<!-- go-example: illustrative-fragment -->
```go [app/wire/inject_services_app.go]
var appSet = wire.NewSet(
	reports.NewService,
	app.NewLifecycleRegistry,
	runtime.NewTimeouts,
)
```

<!-- go-example: illustrative-fragment -->
```go [app/admin/wire/inject_services_app.go]
var appSet = wire.NewSet(
	reports.NewService,
	admin.NewLifecycleRegistry,
	runtime.NewTimeouts,
)
```

:::

Both Apps reuse `internal/reports.Service`, but the default App might expose it through a public controller while `admin` exposes staff-only routes and commands. Adding the constructor to one App does not silently add it to the other.

## Providers

A provider is an ordinary Go constructor or function that Wire calls while constructing an App. Its parameters declare dependencies and its return type supplies a value to another constructor.

Prefer a constructor when the function signature already describes the dependency:

<!-- go-example: illustrative-fragment -->
```go
func NewService(repo UserRepository) *Service {
	return &Service{repo: repo}
}
```

Put the constructor in the narrowest appropriate App-owned Wire set. In the Users path above, `users.NewService` belongs in `app/wire/inject_services_app.go`, while the controller generator places `users.NewController` in `app/wire/inject_http_controllers_app.go`.

### When a dedicated provider helps

Write a dedicated provider when App configuration selects an implementation or when composition converts a concrete value to a consumer-facing contract:

<!-- go-example: illustrative-fragment -->
```go
func provideUserRepository(source *MemoryUserRepository) UserRepository {
	return source
}
```

Keep driver selection, configuration validation, and concrete-to-interface binding near the App composition boundary. This keeps business services independent of driver packages.

A provider can return an error when construction cannot proceed:

<!-- go-example: illustrative-fragment -->
```go
func ProvideGateway(cfg GatewayConfig) (*Gateway, error) {
	if cfg.BaseURL == "" {
		return nil, errors.New("BILLING_API_URL is required")
	}
	return NewGateway(cfg), nil
}
```

Wire propagates that error through App construction. Resolve configuration near the root and pass typed values down so malformed configuration fails during construction rather than during a later request or job.

### Organize your own injector sets

When one service area has several providers, keep them in another App-owned `_app.go` file and include the set from `appSet`:

::: code-group

<!-- go-example: illustrative-fragment -->
```go [app/wire/inject_billing_app.go]
package wire

import (
	"github.com/goforj/wire"
	"example.com/acme/internal/billing"
)

var billingSet = wire.NewSet(
	billing.NewGateway,
	billing.NewRepository,
	billing.NewService,
)
```

<!-- go-example: illustrative-fragment -->
```go [app/wire/inject_services_app.go]
var appSet = wire.NewSet(
	billingSet,
	app.NewLifecycleRegistry,
	runtime.NewTimeouts,
)
```

:::

The custom injector remains ordinary App-owned Go code. Nesting it in `appSet` connects it to the root graph without editing `wire_gen.go` or hiding dependencies behind a registry.

### Provider boundaries

Providers may construct services, repositories, controllers, commands, job handlers, typed configuration, adapters, drivers, managers, and runtime registries. Keep their responsibility narrow: construct dependencies, select implementations, and validate construction inputs.

Providers should not run business workflows, start workers, hide dependencies in package globals, repeatedly read environment variables, or add nil fallbacks for required collaborators.

## Reading a Failure

If `users.NewController` requires `*users.Service` but `appSet` does not provide it, `forj build` fails during Wire generation. Treat that as a construction error: add the missing constructor or a provider that returns the required type, then rerun the build. Do not add a nil guard to `NewController` or modify `wire_gen.go`; either change hides or overwrites the real wiring problem.

## Construction Is Not Execution

Wire constructs services, controllers, managers, and registries. It does not start HTTP listeners, workers, or schedulers. Those begin at their own runtime boundary after App startup. See [App Lifecycle](/core/app-lifecycle).

## Common Mistakes

::: warning Common mistakes
- Do not use globals to bypass constructor injection.
- Do not assume `wire.NewSet` order is runtime construction order; Wire resolves the complete type graph.
- Do not edit `wire_gen.go` or add nil fallbacks for required collaborators.
- Do not start long-lived work from a provider.
:::

## Next Steps

- [Provider Patterns](/core/provider-patterns) compares practical construction shapes.
- [Wiring Recipes](/developer-tools/wiring-recipes) maps routes, commands, jobs, and other app dependencies to their provider files.
- [Reading Wire Errors](/developer-tools/reading-wire-errors) covers common diagnostics.
