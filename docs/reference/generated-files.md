---
title: Generated Files
description: Lookup reference for common generated files and ownership boundaries in GoForj Projects.
---

# Generated Files

Generated files are not all owned the same way.

Check file headers and local package READMEs before editing.

## Common Files And Directories

| Path | Purpose |
| --- | --- |
| `.goforj.yml` | Project render and development contract. |
| `.env` | Local runtime environment defaults. |
| `cmd/app/main.go` | Default app binary entrypoint. |
| `cmd/<app>/main.go` | Named app binary entrypoint. |
| `cmd/<app>/frontend/` | Frontend source and embedded build output for an app with Web UI. |
| `app/commands.go` | Default app command exposure. |
| `app/lifecycle.go` | Default app lifecycle hooks. |
| `app/routes.go` | Default app route exposure. |
| `app/schedules.go` | Default app schedule exposure. |
| `app/wire/wire.go` | Default app Wire injector definitions. |
| `app/wire/wire_gen.go` | Generated Wire output. Do not edit by hand. |
| `app/<app>/...` | Named app composition files. |
| `app/<app>/wire/...` | Named app Wire graph. |
| `internal/runtime/apps.go` | Generated app metadata and deterministic runtime defaults. Do not edit by hand. |
| `internal/caches/*_gen.go` | Generated cache accessors and config. |
| `internal/storages/*_gen.go` | Generated storage accessors and config. |
| `internal/queues/*_gen.go` | Generated queue accessors and config. |
| `internal/events/*_gen.go` | Generated event bus accessors and config. |
| `internal/database/*_gen.go` | Generated DB accessors and config. |
| `build/api_index.json` | Default app API index output. |
| `build/openapi.json` | Default app OpenAPI output. |
| `build/<app>/api_index.json` | Named app API index output. |
| `build/<app>/openapi.json` | Named app OpenAPI output. |

## Ownership Rules

- Files marked `DO NOT EDIT` should be regenerated.
- Render-once files are App-owned extension points.
- `internal/` owns behavior; `app/` owns exposure.
- Framework-wide changes belong in GoForj templates or generators, not only in a rendered Project.

## Related Pages

- [Apps](/core/apps)
- [Generated Components](/core/generated-components)
- [Generated Extension Points](/core/generated-extension-points)
- [Code Generation](/core/code-generation)
