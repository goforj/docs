---
title: Wiring Recipes
description: Where to register application services, adapters, controllers, commands, jobs, repositories, and named resources in a GoForj App.
---

# Wiring Recipes

Use this page when you created a Go package and need to connect its constructors to the generated App.

GoForj Apps use explicit provider sets. Your package owns constructors. The generated `wire` package imports those constructors and adds them to the right set.

## Quick Map

| You built | Register it in | Typical provider |
| --- | --- | --- |
| Application service | `wire/inject_app_services.go` | `billing.NewService` |
| Outbound adapter or gateway | `wire/inject_app_services.go` | `billing.ProvideGateway` |
| Repository | `wire/inject_repositories.go` when present | `reports.NewRepository` |
| HTTP controller | `wire/inject_http_controllers.go` | `users.NewController` |
| App command | `internal/cmd/wire.go` | `reports.NewReconcileCommand` |
| Job handler | `wire/inject_jobs_app.go` when jobs are enabled | `reports.NewGenerateHandler` |
| Named resource adapter | Usually `wire/inject_app_services.go` | `provideUploadsDisk` |

Use the most specific generated set that owns the surface. If a generated file is not present, the App probably does not have that component enabled.

## Service and Adapter

Application packages usually own the service and any adapter it depends on:

```text
internal/billing/gateway.go
internal/billing/provider.go
internal/billing/service.go
```

Then wire those constructors from:

```text
wire/inject_app_services.go
```

```go
package wire

import (
	"github.com/google/wire"

	"myapp/internal/billing"
)

var appSet = wire.NewSet(
	// existing framework and app providers...
	billing.ProvideGateway,
	billing.NewService,
)
```

Wire can construct `*billing.Service` because `billing.ProvideGateway` provides the `*billing.Gateway` that `billing.NewService` receives.

## HTTP Controller

Controllers belong to the HTTP controller set:

```text
wire/inject_http_controllers.go
```

```go
package wire

import (
	"github.com/google/wire"

	"myapp/internal/users"
)

var httpAppControllerSet = wire.NewSet(
	// existing controllers...
	users.NewController,
)
```

The controller can depend on an application service already provided by `appSet`.

## Command

Application commands are registered from:

```text
internal/cmd/wire.go
```

```go
package cmd

import (
	"github.com/google/wire"

	"myapp/internal/reports"
)

var AppCommandSet = wire.NewSet(
	// existing command providers...
	reports.NewReconcileCommand,
)
```

Command constructors should receive application services as parameters. They should not create repositories, managers, clients, or services themselves.

Commands also need to be exposed through the generated command collection. See [Commands](/applications/commands) for the command-specific registration path.

## Named Resource

Named resources often need a small provider function that selects one generated resource from a manager:

```go
package wire

import (
	"github.com/goforj/storage"

	"myapp/internal/storages"
	"myapp/internal/uploads"
)

var appSet = wire.NewSet(
	// existing framework and app providers...
	provideUploadsDisk,
	uploads.NewService,
)

func provideUploadsDisk(manager *storages.Manager) storage.Storage {
	return manager.Uploads()
}
```

The service receives the specific resource it needs instead of reaching into the manager itself.

## After Editing

Regenerate the graph after changing providers or generated component files:

```bash
forj build
```

`forj build` refreshes generated code, runs Wire, indexes APIs, and builds the App binary.

## Common Mistakes

::: warning Common mistakes
- Do not add constructors to `wire/wire_gen.go`; it is generated output.
- Do not register a controller in `appSet` when it belongs in the HTTP controller set.
- Do not create dependencies inside commands or controllers when they should be constructor parameters.
- Do not use package globals to avoid wiring a provider.
- Do not register two providers for the same raw type when domain-specific adapter types would make the graph clearer.
:::

## Next Steps

- [Provider Patterns](/core/provider-patterns) shows how to shape providers in application packages.
- [Reading Wire Errors](/core/reading-wire-errors) explains how to debug missing and duplicate providers.
- [Dependency Injection](/core/dependency-injection) explains the generated graph model.
