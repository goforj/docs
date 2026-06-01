---
title: CLI Reference
description: Framework-level lookup for common GoForj CLI commands.
---

# CLI Reference

This page lists common GoForj CLI commands and generated App command patterns.

Use workflow pages for full context.

## Project Commands

| Command | Purpose |
| --- | --- |
| `forj new` | Create a new generated GoForj App through the interactive wizard. |
| `forj build` | Run generation, Wire, API indexing, then `go build`. |
| `forj run <app-command>` | Run generation, API indexing, then `go run . <app-command>`. |
| `forj dev` | Run local development watchers from `.goforj.yml`. |
| `forj generate` | Refresh generated component code and derived files. |
| `forj make:controller <name>` | Generate an HTTP controller and wire it into HTTP. |
| `forj make:command <name>` | Generate an application command and wire it into the App command tree. |
| `forj make:migration <name>` | Generate migration files for supported database drivers. |

Inside a generated App, `forj <command>` is the normal development surface. Native GoForj commands take precedence. If no native command matches, GoForj delegates to the generated App through the same source-aware path as `forj run <command>`.

Use `forj run <command>` when you want to force App command execution explicitly, especially for scripts or command names that collide with native GoForj commands. Use `./bin/app <command>` for the built binary and deployment/runtime process supervision.

## Common App Commands

Run these as `forj <command>` during development or directly through `./bin/app <command>` after build.

Prefer the short aliases in day-to-day commands. The canonical command names remain available.

| Preferred | Canonical | Purpose |
| --- | --- | --- |
| `app` | `run` | Run enabled App runtimes together. |
| `api` | `http:serve` | Run the HTTP runtime. |
| `worker` | `queue:work` | Run queue workers. |
| `scheduler` | `schedule:run` | Run the scheduler runtime. |
| `route:list` | `route:list` | List registered HTTP routes. |
| `migrate` | `migrate` | Run database migrations. |
| `migrate:rollback` | `migrate:rollback` | Roll back recent migrations. |
| `make:event` | `make:event` | Generate an event type. |
| `make:job` | `make:job` | Generate a queue job and wire it into jobs. |
| `make:schedule` | `make:schedule` | Generate a scheduled task and wire it into the scheduler. |
| `make:model` | `make:model` | Generate a model and repository when database support is enabled. |

Examples:

```bash
forj app
forj api
forj worker
forj scheduler
forj route:list
forj make:job reports:generate
forj make:schedule reports:daily --every 24h

./bin/app run
./bin/app api
./bin/app worker
./bin/app scheduler
```

These resolve to generated App commands through Kong aliases.

Available commands depend on selected components.

Controller, command, and migration generation are project-level `forj` commands:

```bash
forj make:controller users
forj make:command reports:reconcile
forj make:migration create_users
```

## Maintainer Commands

These are mainly for framework contributors:

| Command | Purpose |
| --- | --- |
| `forj test:render -s` | Render a disposable App, build it, and run tests. |
| `forj test:integration` | Run framework and rendered integration suites. |
| `forj test:openapi` | Validate generated OpenAPI behavior. |

## Related Pages

- [Quickstart](/getting-started/quickstart)
- [Make Commands](/core/make-commands)
- [forj dev](/developer-tools/forj-dev)
- [Generation Commands](/reference/generation-commands)
