---
title: File Ownership
description: Identify which GoForj Project files belong to your application, the Framework, generators, or build tooling.
---

# File Ownership

Files in a GoForj Project have different owners. Some are normal application code, some are extension points created once, and some are refreshed from configuration or build inputs.

Use this page when deciding whether to edit a file or change the input that creates it. File headers remain authoritative when a specific file says `DO NOT EDIT`.

## Application and App Composition

| Path | Owner | Created or refreshed by | Edit? |
| --- | --- | --- | --- |
| `internal/<domain>/...` | Application | You and `forj make:*` | Yes |
| `app/commands.go` | App | Initial render and make commands | Yes |
| `app/lifecycle.go` | App | Initial render | Yes |
| `app/routes.go` | App | Initial render and controller commands | Yes |
| `app/schedules.go` | App | Initial render | Yes |
| `app/wire/inject_*_app.go` | App | Initial render and make commands | Yes |
| `app/<app>/...` | Additional App | Same conventions as the default App | Follow the matching default-App file |
| `migrations/` | Application | `forj make:migration` and application changes | Yes |

## Framework-Managed Project Files

These files implement the selected Project configuration. Change `.goforj.yml`, component selection, or the owning framework template instead of treating them as durable extension points.

| Path | Created or refreshed by | Edit? |
| --- | --- | --- |
| `cmd/app/main.go` | `forj render` | No; use App registration files |
| `cmd/<app>/main.go` | `forj render` | No; use that App's registration files |
| `app/root_cmd.go` | `forj render` | No |
| `app/wire/app.go`, `app/<app>/wire/app.go` | `forj render` | No; add providers through `_app.go` files |
| `app/wire/wire.go` | `forj render` | Avoid; compose custom sets through `_app.go` files |
| `app/wire/inject_*.go` without `_app` | `forj render` | No |
| `internal/runtime/apps.go` | `forj render` | No |

## Generated Go Output

These filenames are the concrete outputs readers will encounter; they are not wildcard categories.

| Capability | Paths | Refreshed by | Edit? |
| --- | --- | --- | --- |
| Wire | `app/wire/wire_gen.go`, `app/<app>/wire/wire_gen.go` | `forj build` or Wire generation | No |
| Cache | `internal/caches/manager_gen.go`, `internal/caches/accessors_gen.go` | Cache generation during `forj build` | No |
| Storage | `internal/storages/manager_gen.go`, `internal/storages/accessors_gen.go` | Storage generation during `forj build` | No |
| Queues | `internal/queues/manager_gen.go`, `internal/queues/accessors_gen.go` | Queue generation during `forj build` | No |
| Events | `internal/events/manager_gen.go`, `internal/events/accessors_gen.go` | Event generation during `forj build` | No |
| Mail | `internal/mail/manager_gen.go`, `internal/mail/accessors_gen.go` | Mail generation during `forj build` | No |
| Database | `internal/database/connections_gen.go` | Database generation during `forj build` | No |

## Build and Operational Output

| Path | Purpose | Owner |
| --- | --- | --- |
| `build/api_index.json` | Default App API index | Build tooling |
| `build/api_index.diagnostics.json` | Default App indexing diagnostics | Build tooling |
| `build/openapi.json` | Default App OpenAPI document | Build tooling |
| `build/.webindex-artifacts.lock` | Coordinates publication of the default App artifact set | Build tooling |
| `build/<app>/...` | Equivalent artifacts for an additional App | Build tooling |
| `bin/app`, `bin/<app>` | Compiled App binaries | GoForj build pipeline |
| `cmd/<app>/frontend/dist/` | Built frontend embedded by a Web UI App | SPA build tooling |
| `.goforj/backups/<set>/manifest.json` | Backup set inventory | Backup tooling and operators |
| `.goforj/backups/<set>/checksums.txt` | Backup artifact checksums | Backup tooling and operators |

Project inputs such as `.goforj.yml`, `.env`, and `go.mod` are configuration rather than generated output. See [Configuration Reference](/reference/configuration) and [Environment Reference](/reference/env-vars) for their separate render, build, and restart boundaries.

## Ownership Rules

- Edit application behavior and App-owned `_app.go` extension points normally.
- Change inputs and regenerate files marked `DO NOT EDIT`.
- Keep Framework-wide fixes in GoForj templates or generators, not only in one rendered Project.
- Do not commit build output, publication locks, or operator backup sets unless a repository explicitly owns a checked artifact.

## Related Pages

- [Apps](/core/apps)
- [Project Structure](/getting-started/project-structure)
- [App Extension Points](/core/code-generation#choose-a-safe-extension-point)
- [Code Generation](/core/code-generation)
- [Backup and Restore](/operations/backups)
