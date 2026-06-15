---
title: Wiring Recipes
description: Where to register application services, adapters, controllers, commands, jobs, repositories, and named resources in a GoForj App.
---

# Wiring Recipes

Use this page when you created a Go package and need to connect its constructors to an app.

GoForj apps use explicit provider sets. Your package owns constructors. The app's `wire` package imports those constructors and adds them to the right set.

## Quick Map

| You built | Register it in | Typical provider |
| --- | --- | --- |
| Application service | `app/wire/inject_services_app.go` | `billing.NewService` |
| Outbound adapter or gateway | `app/wire/inject_services_app.go` | `billing.ProvideGateway` |
| Repository | `app/wire/inject_repositories_app.go` when present | `reports.NewRepository` |
| HTTP controller | `app/wire/inject_http_controllers_app.go` | `users.NewController` |
| App command | `app/wire/inject_cmd_app.go` and `app/commands.go` | `reports.NewReconcileCommand` |
| Job handler | `app/wire/inject_jobs_app.go` when jobs are enabled | `reports.NewGenerateHandler` |
| Schedule | `app/wire/inject_schedules_app.go` and `app/schedules.go` | `reports.NewDailySchedule` |
| Event subscriber | `app/wire/inject_subscribers_app.go` | `billing.NewInvoicePaidSubscriber` |
| Named resource adapter | Usually `app/wire/inject_services_app.go` | `provideUploadsDisk` |

For a named app, replace `app/...` with `app/<name>/...`.

Use the most specific generated set that owns the surface. If a generated file is not present, the app probably does not have that component enabled.

## Make Commands

For controllers and commands, start with the make command.

The make command is not just a file generator. It also injects the generated resource into the active app's wiring harness. Generate first, then review what changed.

| Flow | Start with | Verify |
| --- | --- | --- |
| HTTP controller | `forj make:controller Users` | controller file, HTTP controller set, route registry |
| App command | `forj make:command reports:reconcile` | command type, command Wire set, command collection |
| Queue job | `forj make:job GenerateReport` | job type, job Wire set |
| Scheduled task | `forj make:schedule reports:daily --every 24h` | schedule type, schedule Wire set, schedule registration |
| Model repository | `forj make:model users --package users` | model, repository, repository Wire set |

Run the same flow through a named app when that app owns the resource:

```bash
forj marketplace make:controller checkout
forj marketplace make:command catalog:rebuild
```

The wiring still matters because generated resources usually depend on application services. The make command wires the generated resource itself; you may still need to wire the application services it depends on.

See [Make Commands](/core/make-commands) for grouped package placement, output overrides, and the full command map.

## Service and Adapter

Application packages usually own the service and any adapter it depends on:

```text
internal/billing/gateway.go
internal/billing/provider.go
internal/billing/service.go
app/wire/inject_services_app.go
```

Then wire those constructors from:

```text
app/wire/inject_services_app.go
```

```go
package wire

import (
	"github.com/google/wire"

	"myapp/internal/billing"
)

var appServiceSet = wire.NewSet(
	// existing app providers...
	billing.ProvideGateway,
	billing.NewService,
)
```

Wire can construct `*billing.Service` because `billing.ProvideGateway` provides the `*billing.Gateway` that `billing.NewService` receives.

## HTTP Controller

Controllers belong to the HTTP controller set:

```bash
forj make:controller Users
```

After running the make command, verify the wiring it updated:

- `internal/users/controller.go` exists
- `users.NewController` is in `app/wire/inject_http_controllers_app.go`
- the controller routes are included from `app/routes.go`

The controller can depend on an application service already provided by the app service set. If Wire cannot provide that service, add the service constructor to `app/wire/inject_services_app.go`.

Verify the result:

```bash
forj build
forj route:list
```

## Command

Application commands are registered from:

```bash
forj make:command reports:reconcile
```

After running the make command, verify the wiring it updated:

- the command type has `Signature`, constructor, and `Run`
- the constructor is in `app/wire/inject_cmd_app.go`
- the command is exposed through `app/commands.go`

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

var appServiceSet = wire.NewSet(
	// existing app providers...
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

`forj build` refreshes generated code, runs Wire, indexes APIs, and builds the app binary.

## Common Mistakes

::: warning Common mistakes
- Do not add constructors to `app/wire/wire_gen.go`; it is generated output.
- Do not register a controller in the service set when it belongs in the HTTP controller set.
- Do not create dependencies inside commands or controllers when they should be constructor parameters.
- Do not use package globals to avoid wiring a provider.
- Do not register two providers for the same raw type when domain-specific adapter types would make the graph clearer.
:::

## Next Steps

- [Make Commands](/core/make-commands) explains the generated resource flow.
- [Provider Patterns](/core/provider-patterns) shows how to shape providers in application packages.
- [Reading Wire Errors](/core/reading-wire-errors) explains how to debug missing and duplicate providers.
- [Dependency Injection](/core/dependency-injection) explains the generated graph model.
