---
title: What Is GoForj?
description: Understand what GoForj provides, the problems it addresses, and when it fits a Go project.
---

# What is GoForj?

GoForj helps Go developers build CLIs, HTTP services, workers, and full web products.

It gives routes, commands, queues, events, schedules, cache, storage, mail, configuration, dependency wiring, and operational tooling one consistent home while keeping runtime behavior explicit.

The first-party libraries also work independently. A team can add one package to an existing service or use the framework to build and run a complete application.

## Why GoForj Exists

Go excels at building reliable systems, but many teams end up re-solving the same application concerns:

- HTTP services and commands
- Queues, jobs, events, and scheduled work
- Cache, storage, and data access
- Configuration, environment handling, and dependency wiring
- Metrics, inspections, and operational visibility
- Local development that maps cleanly to production infrastructure

GoForj exists to make those concerns feel like one application system while preserving Go's clarity.

The goal is not to abstract Go away. It is to provide strong conventions, explicit wiring, and interchangeable infrastructure without hiding how the application starts, runs, and shuts down.

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

### Production-aware
- Examples mirror real usage, not toy snippets
- APIs are designed for long-lived codebases
- Cross-platform behavior is documented honestly

### Developer Experience
- Fluent APIs where they reduce noise
- Copy-paste-ready examples that actually run
- Documentation kept in sync with real code

## What GoForj Is Today

Today, GoForj includes the `forj` CLI, project templates, runtime conventions, operational tools, and standalone libraries.

The documentation has two paths:

- [Getting Started](/getting-started/) for building an app with GoForj.
- [Libraries](/libraries/) for standalone first-party Go packages.

## What GoForj Is Not

- A dynamic-language framework ported to Go
- A hidden runtime or DSL
- A replacement for the Go standard library
- A reflection-heavy dependency container
- A collection of hidden magic abstractions
- A system that requires one infrastructure vendor

## Who GoForj Is for

- Go developers building CLIs, services, workers, and internal tools
- Teams that value explicit behavior and long-term maintainability
- Engineers who want better ergonomics without giving up control

If you prefer readable Go over clever Go, GoForj is built for you.

## Start Exploring

Start with [Getting Started](/getting-started/) if you want to build an app with GoForj.

Start with [Libraries](/libraries/) if you want to use a standalone package in an existing Go project.
