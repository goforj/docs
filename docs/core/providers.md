---
title: Providers
description: How provider functions construct services, managers, drivers, adapters, and runtime components in GoForj Apps.
---

# Providers

A Provider is a normal Go function that constructs a dependency for the App.

Providers keep construction explicit. They make the dependency graph auditable, compile-time checked, and compatible with Wire generation.

## Provider Shape

Most providers are constructors:

```go
func NewService(repo *Repository, cache Cache) *Service {
	return &Service{
		repo:  repo,
		cache: cache,
	}
}
```

Dependencies are function parameters. The returned value is the thing Wire can provide to another constructor.

## What Providers Build

Providers can build:

- application services
- repositories
- controllers
- commands
- job handlers
- managers
- configuration structs
- drivers
- adapters
- runtime components

Keep the provider's job narrow: construct and validate dependencies. Do not hide business workflows in provider functions.

## Provider Sets

GoForj groups providers into Wire sets.

Examples include:

- App-level providers
- command providers
- HTTP providers
- queue and job providers
- event providers
- cache, storage, database, and mail providers
- observability and metrics providers

Provider sets describe how the App is constructed. They are not runtime registries.

## Required Dependencies

Required dependencies should be visible in the provider signature.

If a service needs a repository, queue, cache, or manager, express that dependency as a constructor parameter. If the dependency is optional, model the optional behavior directly through an option, configuration value, or explicit nullable field.

Clear provider contracts make the generated dependency graph easier to inspect and test.

## Configuration Providers

Configuration should be resolved near the App boundary and passed into providers as typed values where practical.

Avoid repeatedly reading environment variables from leaf services. That makes behavior harder to test and obscures where runtime policy is chosen.

## Provider Lifecycle

Construction and startup are separate.

Providers may create lightweight values, managers, configuration objects, handlers, and clients. Long-running runtime work should start through lifecycle hooks or runtime commands, not from random constructors.

Examples:

- Construct a queue manager in a provider.
- Register queue handlers during App construction.
- Start queue workers from `forj run worker` or `forj run app`.

## Common Mistakes

- Do not introduce a runtime reflection container.
- Do not use package globals to avoid provider wiring.
- Do not put business workflows in providers.
- Do not start long-running goroutines from constructors unless that is the explicit design of the type.
- Do not make required dependencies look optional.

## Next Steps

- [Dependency Injection](/core/dependency-injection) explains Wire generation.
- [Generated Components](/core/generated-components) explains generated managers and provider inputs.
- [Drivers and Adapters](/core/drivers-and-adapters) explains backend and boundary construction.
