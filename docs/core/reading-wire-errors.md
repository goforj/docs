---
title: Reading Wire Errors
description: How to interpret missing provider, duplicate provider, wrong set, and interface wiring failures in GoForj Apps.
---

# Reading Wire Errors

Wire errors are compile-time graph errors.

When `forj build` fails during Wire generation, the app graph could not be constructed from the provider sets. The fix is usually to add, remove, or move a provider. Do not edit `app/wire/wire_gen.go`.

## Read The Chain

Start with the type Wire could not provide, then follow who needed it.

Simplified output:

```text
wire: no provider found for *myapp/internal/users.Service
	needed by *myapp/internal/users.Controller in provider "NewController"
	needed by httpAppControllerSet
```

This says:

- `users.Controller` needs `*users.Service`.
- Wire cannot find a provider that returns `*users.Service`.
- The failing graph is the HTTP controller graph.

The fix is not to edit `app/wire/wire_gen.go`. Add the missing service provider to the set that provides application services.

## Missing Provider

Likely cause: a constructor needs a value that no provider returns.

```go
func NewController(service *users.Service) *Controller {
	return &Controller{service: service}
}
```

Fix:

```go
var appServiceSet = wire.NewSet(
	// existing app providers...
	users.NewService,
)
```

Keep the controller in the HTTP controller set:

```go
var httpAppControllerSet = wire.NewSet(
	// existing controllers...
	users.NewController,
)
```

Use [Wiring Recipes](/core/wiring-recipes) when you are unsure which set owns a constructor.

## Wrong Set

Likely cause: the provider exists, but it was added to a set that is not used by the failing graph.

Check the file names:

| Value | Usually belongs in |
| --- | --- |
| Application service | `app/wire/inject_services_app.go` |
| HTTP controller | `app/wire/inject_http_controllers_app.go` |
| App command | `app/wire/inject_cmd_app.go` and `app/commands.go` |
| Job handler | `app/wire/inject_jobs_app.go` when jobs are enabled |

If the error is about a controller, adding the service constructor to the controller set is usually the wrong fix. Controllers belong in the controller set; services belong in the app services set.

## Duplicate Provider

Likely cause: two providers in the same graph return the same type.

Simplified output:

```text
wire: multiple providers for *httpx.Client
	current:
		provider "ProvideBillingHTTPClient"
	previous:
		provider "ProvideSearchHTTPClient"
```

Prefer domain-specific adapter types:

```go
type BillingGateway struct {
	http *httpx.Client
}

type SearchIndexer struct {
	http *httpx.Client
}
```

Then provide `*billing.BillingGateway` and `*search.SearchIndexer`, not two raw `*httpx.Client` values.

If the duplicate is accidental, remove one provider from the set.

## Interface Mismatch

Likely cause: a constructor asks for an interface, but the provider returns a concrete type.

```go
func NewService(gateway Gateway) *Service {
	return &Service{gateway: gateway}
}
```

If the provider owns the implementation choice, return the interface:

```go
func ProvideGateway(cfg GatewayConfig) (Gateway, error) {
	if !cfg.Enabled {
		return NewDisabledGateway(), nil
	}

	return NewHTTPGateway(cfg), nil
}
```

Use concrete types when there is only one implementation and no useful abstraction boundary.

## Type Mismatch

Wire matches exact Go types.

These are different types:

```go
*billing.Gateway
billing.Gateway
*search.Gateway
```

When a constructor asks for `billing.Gateway`, a provider returning `*billing.HTTPGateway` will not satisfy it unless the provider returns `billing.Gateway` or the graph explicitly binds that concrete type to the interface.

## Stale Generated Output

Likely cause: provider sets, generated components, or constructor signatures changed, but the graph was not regenerated.

Run:

```bash
forj build
```

Do not manually edit:

```text
app/wire/wire_gen.go
```

Change providers, constructors, or generated component inputs, then regenerate.

## Fast Checklist

When Wire fails:

- Find the missing or duplicated type.
- Find the constructor that asked for it.
- Confirm exactly one provider returns that type.
- Confirm the provider is in the set used by the failing graph.
- Confirm constructor parameter types match provider return types exactly.
- Confirm interfaces are intentional.
- Run `forj build` after changing the provider set.

## Next Steps

- [Wiring Recipes](/core/wiring-recipes) maps values to generated provider sets.
- [Provider Patterns](/core/provider-patterns) shows provider shapes for adapters and optional features.
