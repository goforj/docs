---
title: Rendered App Smoke Tests
description: How GoForj contributors validate templates and generated Apps through disposable rendered smoke tests.
---

# Rendered App Smoke Tests

Rendered App smoke tests validate that GoForj templates and generators produce a working App.

This is primarily a framework maintainer workflow. Application teams usually start with `go test ./...` in their App.

## Maintainer Command

From the `goforj` repository:

```bash
GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache go run ./cmd/forj/main.go test:render -s
```

This renders a temporary App, builds it, and runs its tests.

Expected result: the command exits successfully after rendering, building, and testing the disposable App. Run it from the `goforj` repository, not from an application repository.

## What It Catches

Rendered smoke tests catch:

- broken templates
- missing imports
- invalid generated accessors
- Wire generation failures
- generated App compile failures
- generated test failures
- dependency replacement issues
- multi-app wiring or binary-entrypoint regressions when the smoke target includes additional apps
- per-app API artifact isolation
- stale API artifact cleanup for CLI-only Apps

If package-level tests pass but rendered smoke fails, inspect the rendered output.

## Source of Truth

The rendered App is not the source of truth.

If a fix should survive rerender, change:

- `templates/...`
- generator code
- framework runtime code
- sibling library code

Direct rendered App edits are useful for quick hypothesis checks, but they are not the durable fix.

## Local Replaces

Use `render.module_replaces` when smoke testing against local sibling repositories.

Use paths that are stable from the generated project root. For local sibling repositories, prefer a relative path and avoid container-specific absolute paths.

```yaml
render:
  module_replaces:
    github.com/goforj/web: ../web
```

## Next Steps

- [Integration Tests](/testing/integration-tests) covers backend and rendered integration.
- [Code Generation](/core/code-generation) explains generated file ownership.
- [Practical maintainer workflows are tracked internally in GoForj context files.](/core/code-generation#choose-a-safe-extension-point)
