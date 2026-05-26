---
title: Testing Overview
description: Test GoForj Apps at the service, framework surface, integration, and rendered App levels.
---

# Testing Overview

Testing in GoForj should start with normal Go tests and expand only when a runtime boundary, generated component, or infrastructure backend requires it.

The goal is confidence without making every test boot the whole App.

## Testing Layers

| Layer | Use for | Command |
| --- | --- | --- |
| Unit tests | Services, repositories with fakes, pure domain behavior | `go test ./...` |
| Generated package tests | HTTP health, lifecycle, metrics, events, generated wiring behavior | `go test ./...` |
| Integration tests | Database, rendered app behavior, external backends | `go test -tags=integration ./...` |
| Render smoke | Template and generated App compile confidence | `forj test:render -s` |
| Framework integration | GoForj maintainer validation | `forj test:integration` |

Most App teams should begin with `go test ./...` inside the generated App.

## Local Test Command

From the generated App root:

```bash
go test ./...
```

Generated Apps include tests for framework-owned surfaces when those components are enabled.

Examples include:

- lifecycle idempotency
- runtime topology defaults
- HTTP health and readiness
- Swagger serving
- metrics manager behavior
- event bus integration
- database connection behavior
- generated command behavior

## Test Services Directly

Application services should be easy to test without starting HTTP, queue workers, or scheduler.

Use constructor injection and provide fakes or test repositories:

```go
func TestUserServiceFindsUser(t *testing.T) {
	repo := users.NewMemoryRepository()
	service := users.NewService(repo)

	user, err := service.Find(context.Background(), "user_123")
	if err != nil {
		t.Fatalf("find user: %v", err)
	}
	if user.ID != "user_123" {
		t.Fatalf("unexpected user id: %s", user.ID)
	}
}
```

If a service needs cache, storage, events, or queues, depend on a narrow interface or use local drivers.

## Test HTTP Behavior

Generated HTTP tests use `httptest` and the generated server bootstrap.

The generated health tests verify:

- `GET /-/health`
- `GET /-/ready`
- readiness failures return `503`
- authorized readiness can include structured dependency errors

Application HTTP tests should prefer testing controllers or route groups without starting a real listener unless the listener behavior is the point of the test.

## Test Events

Generated event tests use the in-process driver for local delivery.

Use events tests when you need to verify:

- a typed event publishes successfully
- a subscriber receives the expected payload
- a handler records the expected side effect
- unsupported generated driver configuration fails clearly

For local tests, prefer:

```text
EVENTS_DRIVER=inproc
```

## Test Queues and Jobs

For job tests, test the handler directly first.

Use queue runtime tests only when you need to verify dispatch, backend behavior, worker lifecycle, retries, or shutdown.

Local queue-friendly drivers include:

- `sync`
- `workerpool`
- `null` for no-op dispatch behavior

Use backend integration tests only when driver behavior matters.

## Test Scheduler Work

Keep scheduled work in domain-owned methods so it can be tested directly.

The scheduler registry should stay declarative:

```go
s.DailyAt("04:11").Name("cleanup:stale-sessions").Do(s.authService.Cleanup)
```

Test `authService.Cleanup` directly. Add scheduler integration tests only when schedule registration, runtime behavior, or observability is the target.

## Rendered App Smoke Tests

For framework/template contributors, rendered App smoke testing is important because template regressions often appear only after rendering.

From the `goforj` repository:

```bash
GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache go run ./cmd/forj/main.go test:render -s
```

This renders a temporary App, builds it, and runs its tests.

This is a maintainer workflow, not the default test path for every application team.

## Integration Tests

GoForj uses integration tags for heavier tests:

```bash
GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache go test -tags=integration ./internal/forj -count=1
```

The `forj test:integration` maintainer command can run framework and rendered integration suites:

```bash
forj test:integration
forj test:integration rendered --target database --variant sqlite
```

These commands may require Docker or external backends depending on the selected suite.

## Common Mistakes

::: warning Common mistakes
- Do not start the full runtime for service behavior that can be tested directly.
- Do not use distributed infrastructure when a local driver proves the behavior.
- Do not make required dependencies look optional only to make tests easier.
- Do not patch only a rendered smoke App if the bug belongs in templates or generators.
- Do not make scheduler tests depend on wall-clock timing when the domain method can be tested directly.
:::

## Next Steps

- [Unit Tests](/testing/unit-tests) covers application service tests.
- [HTTP Tests](/testing/http-tests) covers HTTP controllers and route groups.
- [Integration Tests](/testing/integration-tests) covers backend and rendered App integration.
