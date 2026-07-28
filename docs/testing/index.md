---
title: Testing
description: Test GoForj applications, services, commands, queues, events, cache, storage, and rendered Apps.
---

# Testing

Testing in GoForj starts with normal Go tests and expands only when behavior crosses a runtime boundary, depends on generated wiring, or requires an infrastructure backend. The goal is confidence without making every test boot the whole App.

The [JSON API Route](/scenarios/json-api-route) is the runnable baseline: it creates a Users service and controller, includes a complete service test, and verifies the generated HTTP route. From that App root:

```bash
forj build
go test ./...
forj route:list
```

Expected result: build and tests pass, and the route list contains `/api/v1/users/:id`.

## Choose a Test Layer

Use the narrowest layer that proves the behavior:

| Behavior to prove | Start with | Add a broader test when |
| --- | --- | --- |
| Services, repositories with fakes, and pure domain behavior | [Unit Tests](/testing/unit-tests) with `go test ./...` | Generated wiring or a real backend changes the result |
| Controllers, route groups, and generated HTTP behavior | [HTTP Tests](/testing/http-tests) with `httptest` | Listener or full-App behavior is the point |
| Console commands | [Command Tests](/testing/command-tests) | Generated registration or runtime composition matters |
| Job handlers and dispatch | [Job and Queue Tests](/testing/job-queue-tests) | Retries, worker lifecycle, shutdown, or backend behavior matters |
| Event publishing and subscribers | [Event Tests](/testing/event-tests) | Delivery through an external backend matters |
| Cache and storage behavior | [Cache and Storage Tests](/testing/cache-storage-tests) | Driver-specific semantics matter |
| Database, external backends, or App boundaries | [Integration Tests](/testing/integration-tests) with `go test -tags=integration ./...` | A new App must also be exercised |
| Template and generated-App compile confidence | [Rendered App Smoke Tests](/testing/rendered-app-smoke-tests) | A targeted framework integration suite is required |

Most App teams should begin from their App root:

```bash
go test ./...
```

Expected result: each package reports `ok`; a failure identifies the package and test name to investigate.

GoForj Apps include generated tests for enabled framework-owned surfaces such as lifecycle idempotency, runtime topology defaults, health and readiness, Swagger serving, metrics, events, database connections, and generated commands.

## Keep Domain Behavior Direct

Application services, job handlers, event handlers, and scheduled work should remain testable without starting HTTP, workers, or the scheduler. Use constructor injection with fakes or local drivers, then test runtime integration separately only when that boundary is relevant.

For scheduler work, keep the registry declarative:

```go
s.DailyAt("04:11").Name("cleanup:stale-sessions").Do(s.authService.Cleanup)
```

Test `authService.Cleanup` directly. Add scheduler integration coverage only when registration, runtime behavior, or observability is the target.

Local infrastructure drivers can keep broader tests small:

- use `inproc` for event delivery
- use `sync` or `workerpool` for queue dispatch
- use `null` when no-op queue behavior is the contract

## Maintainer Workflows

Framework and template contributors can render a temporary App and run its tests:

```bash
forj test:render -s
```

Use the framework integration command for targeted heavier suites:

```bash
forj test:integration
forj test:integration rendered --target database --variant sqlite
```

These are maintainer workflows, not the default path for every application team. Depending on the selected suite, integration tests may require Docker or external backends.

## Related Sections

- [Getting Started](/getting-started/) introduces the first local application path.
- [Operations](/operations/) explains runtime behavior that integration tests should verify.
