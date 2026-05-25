---
title: Integration Tests
description: How to test GoForj behavior that depends on generated wiring, databases, containers, or external backends.
---

# Integration Tests

Integration tests verify behavior that cannot be trusted from isolated unit tests.

Use them for generated wiring, database behavior, backend drivers, runtime boundaries, and rendered App behavior.

## Command

Generated Apps can use normal Go integration tags:

```bash
go test -tags=integration ./...
```

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

Integration tests should set required environment explicitly.

Avoid depending on a developer's local `.env` unless the test is intentionally validating rendered App behavior from that file.

## Common Mistakes

- Do not move every test into the integration layer.
- Do not hide integration prerequisites.
- Do not duplicate rendered compose dependency shape in a separate hardcoded test list.
- Do not ignore the first render or Wire failure when many generated tests fail.
- Do not patch only a rendered App when the durable fix belongs in templates or generators.

## Next Steps

- [Rendered App Smoke Tests](/testing/rendered-app-smoke-tests) covers template confidence.
- [Database Strategy](/data/database-strategy) explains connection generation.
- [Testing Overview](/testing/overview) explains test layers.
