---
title: Rendered App Smoke Tests
description: How GoForj contributors validate templates and generated Apps through disposable rendered smoke tests.
---

# Rendered App Smoke Tests

Rendered App smoke tests validate that GoForj templates and generators produce a working App.

This is primarily a framework maintainer workflow. Application teams usually start with `go test ./...` in their generated App.

## Maintainer Command

From the `goforj` repository:

```bash
GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache go run ./cmd/forj/main.go test:render -s
```

This renders a temporary App, builds it, and runs its tests.

## What It Catches

Rendered smoke tests catch:

- broken templates
- missing imports
- invalid generated accessors
- Wire generation failures
- generated App compile failures
- generated test failures
- dependency replacement issues

If package-level tests pass but rendered smoke fails, inspect the rendered output.

## Source Of Truth

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

## Common Mistakes

::: warning Common mistakes
- Do not assume a dirty framework worktree is harmless during render smoke.
- Do not patch only the rendered App for a template bug.
- Do not ignore module replacement drift when testing sibling repository changes.
- Do not treat render smoke as the default test path for every application team.
:::

## Next Steps

- [Integration Tests](/testing/integration-tests) covers backend and rendered integration.
- [Code Generation](/core/code-generation) explains generated file ownership.
- [Practical maintainer workflows are tracked internally in GoForj context files.](/core/generated-extension-points)
