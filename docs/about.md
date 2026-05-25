# What is GoForj?

GoForj is a composable application stack for Go.

It provides a cohesive way to build applications with explicit runtime behavior, generated components, local-first drivers, first-party libraries, and production-oriented tooling.

The same first-party libraries can also be used independently. A team can adopt one package in an existing service, or build a full GoForj App that composes those primitives behind framework-level abstractions.

## Why GoForj Exists

Go excels at building reliable systems, but many teams end up re-solving the same application concerns:

- HTTP services and commands
- Queues, jobs, events, and scheduled work
- Cache, storage, and data access
- Configuration, environment handling, and dependency wiring
- Metrics, inspections, and operational visibility
- Local development that maps cleanly to production infrastructure

GoForj exists to make those concerns feel like one application system while preserving Go's clarity.

The goal is not to abstract Go away. It is to provide strong conventions, generated glue, and interchangeable infrastructure without hiding the lifecycle of the application.

## Design Principles

These principles apply across the framework, libraries, examples, and documentation.

### High trust by default
- Explicit inputs and outputs
- Predictable error models
- No hidden globals or unexplained runtime side effects

### Explicit over implicit
- Configuration is visible and inspectable
- Defaults are conservative and overrideable
- Escape hatches are always available

### Swap drivers, not business logic
- Infrastructure backends are selected through configuration and providers
- Application code should depend on framework resources and library interfaces
- Local drivers should be useful before distributed infrastructure is required

### Production-first
- Examples mirror real usage, not toy snippets
- APIs are designed for long-lived codebases
- Cross-platform behavior is documented honestly

### Developer experience matters
- Fluent APIs where they reduce noise
- Copy-paste-ready examples that actually run
- Documentation kept in sync with real code

## What GoForj Is Today

Today, GoForj includes a framework, CLI/tooling, generated application components, and standalone libraries.

The documentation has two paths:

- [Getting Started](/getting-started/) for building a GoForj App.
- [Libraries](/libraries/) for standalone first-party Go packages.

## What GoForj Is Not

- A dynamic-language framework ported to Go
- A hidden runtime or DSL
- A replacement for the Go standard library
- A reflection-heavy dependency container
- A collection of hidden magic abstractions
- A system that requires one infrastructure vendor

## Who GoForj Is For

- Go developers building CLIs, services, workers, and internal tools
- Teams that value explicit behavior and long-term maintainability
- Engineers who want better ergonomics without giving up control

If you prefer readable Go over clever Go, GoForj is built for you.

## Start Exploring

Start with [Getting Started](/getting-started/) if you want to build a GoForj App.

Start with [Libraries](/libraries/) if you want to use a standalone package in an existing Go project.
