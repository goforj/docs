---
title: Providers
description: How provider functions construct services, adapters, managers, and runtime components in GoForj Apps.
---

# Providers

A provider is a Go function Wire can call to construct a dependency.

Providers keep construction explicit: dependencies go in as parameters, and the constructed value comes out as the return value.

## Shape

Most providers are constructors:

```go
func NewService(repo *Repository, cache Cache) *Service {
	return &Service{
		repo:  repo,
		cache: cache,
	}
}
```

A provider can also return an error when construction can fail:

```go
func ProvideGateway(cfg Config) (*Gateway, error) {
	if cfg.BaseURL == "" {
		return nil, errors.New("BILLING_API_URL is required")
	}

	return NewGateway(cfg), nil
}
```

Wire uses the return type to satisfy another constructor's parameter.

## What Providers Build

Providers can build:

- application services
- repositories
- controllers
- commands
- job handlers
- managers
- adapters and gateways
- typed configuration values
- runtime components

Keep the provider's job narrow: construct dependencies, choose implementations, and validate construction inputs.

## What They Should Not Do

Providers should not hide runtime behavior.

Avoid:

- business workflows
- package globals
- background workers started from random constructors
- repeated environment reads from leaf services
- nil fallbacks for required dependencies

Construction and runtime are separate. Long-running work should start through lifecycle hooks or runtime commands, not from provider functions.

## Required Dependencies

Required dependencies should be visible in the constructor signature.

```go
func NewService(repo *Repository, gateway *Gateway) *Service {
	return &Service{
		repo:    repo,
		gateway: gateway,
	}
}
```

If a dependency is optional, model the optional behavior directly. Do not make required wiring look optional just to avoid a Wire error.

## Next Steps

- [Dependency Injection](/core/dependency-injection) explains the generated graph model.
- [Provider Patterns](/core/provider-patterns) shows practical provider shapes.
- [Wiring Recipes](/core/wiring-recipes) shows where providers are registered.
