---
title: Integration Tests
description: How to test GoForj behavior that depends on generated wiring, databases, containers, or external backends.
---

# Integration Tests

Integration tests verify behavior that cannot be trusted from isolated unit tests.

Use them for generated wiring, database behavior, backend drivers, runtime boundaries, and rendered App behavior.

## Command

GoForj Apps can use normal Go integration tags:

```bash
go test -tags=integration ./...
```

Expected result: integration-tagged packages report `ok`. If a selected package needs Docker, an emulator, or credentials, state that prerequisite in the test and run its focused package command rather than making the default App suite depend on it.

Framework contributors often run focused integration packages from the `goforj` repository:

```bash
GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache go test -tags=integration ./internal/forj -count=1
```

## What Belongs Here

Integration tests are a good fit for:

- database connections
- migrations
- generated accessors
- HTTP server bootstrap
- readiness with real dependencies
- backend queue drivers
- distributed event drivers
- storage backends
- rendered App smoke behavior

## Testcontainers

GoForj uses testcontainers for backend integration where appropriate.

Keep container-backed tests clearly marked and avoid making ordinary unit tests depend on Docker or network access.

## Environment

GoForj commits `.env.testing` as the complete safe test profile. When application or test code loads `goforj/env`, it selects this file if `APP_ENV=testing` or Go test markers are present; merely starting an arbitrary Go test does not itself load dotenv files. Process environment variables retain precedence.

Run the contract check before tests in CI:

```bash
forj env:check
go test ./...
```

Ordinary application tests should use the deterministic values in `.env.testing`. Database, Redis, and SMTP host keys use loopback defaults; generated NATS and RabbitMQ URLs use their local container service names. Set only the additional process variables required by tests that intentionally contact a live external service; do not reconstruct the entire dotenv file in CI. On upgrade, review and remove an unmanaged legacy `.env.testing` before generation changes ignore rules or creates the committed profile.

Avoid depending on a developer's local `.env` unless the test is intentionally validating rendered App behavior from that file.

## Next Steps

- [Rendered App Smoke Tests](/testing/rendered-app-smoke-tests) covers template confidence.
- [Database Connections](/data/database-strategy) explains connection generation.
- [Testing](/testing/) explains how to choose a test layer.
