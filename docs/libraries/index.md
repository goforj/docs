---
title: Libraries
description: Standalone first-party GoForj libraries for Go services, CLIs, workers, and generated GoForj Apps.
---

# Libraries

GoForj Libraries are first-party Go packages that can be used on their own or composed inside a generated GoForj App.

Each library page remains useful for standalone package users. Framework guides should link here for primitive APIs, driver details, constructors, and direct package usage.

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

## Core Utilities

- [Env](/env) handles environment loading and configuration helpers.
- [Crypt](/crypt) provides encryption and key rotation utilities.
- [HTTPX](/httpx) provides lower-level HTTP client and utility helpers.
- [ExecX](/execx) provides command execution utilities.

## Developer Ergonomics

- [Collection](/collection) provides fluent collection helpers.
- [Strings](/strings) provides string utilities.
- [GoDump](/godump) provides debugging and inspection helpers.

## How Libraries Relate To Apps

Framework pages should show the generated App integration first. Library pages should show the standalone package API.

Use the framework guides when you are building a full GoForj App. Use the library pages when you need direct package details, a driver matrix, standalone usage, or lower-level behavior.

`web` and `httpx` are separate libraries. Use `web` for server-side routing, controllers, middleware, and generated App HTTP integration. Use `httpx` for lower-level HTTP client and utility behavior.
