---
title: Libraries
description: Standalone first-party GoForj libraries for Go services, CLIs, workers, and GoForj Apps.
---

# Libraries

GoForj Libraries are first-party Go packages that can be used on their own or composed inside a GoForj App.

Each library page remains useful for standalone package users. Framework guides should link here for primitive APIs, driver details, constructors, and direct package usage.

Use the [Driver Catalog](/drivers) to compare every available backend before opening a library page for its constructors and package-level behavior.

## Application Infrastructure

- [Web](/web) provides server-side HTTP abstractions, middleware, route indexing, and testing helpers.
- [Cache](/cache) provides interchangeable cache stores and helpers.
- [Storage](/storage) provides filesystem and object storage primitives.
- [Queue](/queue) provides queueing, workers, and workflow primitives.
- [Events](/events) provides event dispatch and subscription primitives.
- [Mail](/mail) provides message composition and pluggable delivery primitives.
- [Scheduler](/scheduler) provides scheduled work primitives.
- [Metrics](/metrics) provides in-memory metrics primitives and Prometheus-compatible export.
- [Wire](/wire) supports explicit dependency wiring.
- [Atlas](/atlas) provides local agent context, skills, and MCP tooling for GoForj projects.

## Core Utilities

- [Env](/env) handles environment loading and configuration helpers.
- [Crypt](/crypt) provides encryption and key rotation utilities.
- [HTTPX](/httpx) provides lower-level HTTP client and utility helpers.
- [ExecX](/execx) provides command execution utilities.

## Developer Ergonomics

- [Console](/console) provides semantic messages, ANSI-aware layout, tables, trees, prompts, loaders, and progress for line-oriented CLI experiences.
- [Collection](/collection) provides fluent collection helpers.
- [Strings](/strings) provides string utilities.
- [GoDump](/godump) provides debugging and inspection helpers.

## How Libraries Relate to Apps

Framework pages show how an app uses each library. Library pages show standalone package APIs.

Use the framework guides when you are building a full GoForj App. Use the library pages when you need direct package details, a driver matrix, standalone usage, or lower-level behavior.

`web` and `httpx` are separate libraries. Use `web` for server-side routing, controllers, middleware, and app HTTP integration. Use `httpx` for outbound HTTP clients and lower-level HTTP utilities.
