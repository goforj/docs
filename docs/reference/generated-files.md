---
title: Generated Files
description: Lookup reference for common generated files and ownership boundaries in GoForj Apps.
---

# Generated Files

Generated files are not all owned the same way.

Check file headers and local package READMEs before editing.

## Common Files and Directories

| Path | Purpose |
| --- | --- |
| `.goforj.yml` | Project render and development contract. |
| `.env` | Local runtime environment defaults. |
| `wire/wire.go` | Wire injector definitions. |
| `wire/wire_gen.go` | Generated Wire output. Do not edit by hand. |
| `internal/app/lifecycle_registry.go` | App-owned lifecycle extension point. |
| `internal/router/routes_registry.go` | App route composition. |
| `internal/scheduler/scheduler_registry.go` | App-owned schedule registration. |
| `internal/caches/*_gen.go` | Generated cache accessors and config. |
| `internal/storages/*_gen.go` | Generated storage accessors and config. |
| `internal/queues/*_gen.go` | Generated queue accessors and config. |
| `internal/events/*_gen.go` | Generated event bus accessors and config. |
| `internal/database/*_gen.go` | Generated DB accessors and config. |
| `build/api_index.json` | Generated API index output. |
| `build/api_index.diagnostics.json` | Generated API index diagnostics. |
| `build/openapi.json` | Generated OpenAPI output. |

## Ownership Rules

- Files marked `DO NOT EDIT` should be regenerated.
- Render-once files can be App-owned extension points.
- Generated component READMEs explain local generated package ownership.
- Framework-wide changes belong in GoForj templates or generators, not only in a rendered App.

## Related Pages

- [Generated Components](/core/generated-components)
- [Generated Extension Points](/core/generated-extension-points)
- [Code Generation](/core/code-generation)
