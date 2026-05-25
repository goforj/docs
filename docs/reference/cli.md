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
| `forj make:migration <name>` | Generate migration files for supported database drivers. |

## Common App Commands

Run these through `forj run` during development or directly through `./bin/app` after build.

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
| `make:event` | `make:event` | Generate an event scaffold. |
| `make:job` | `make:job` | Generate a job scaffold. |

Examples:

```bash
forj run app
forj run api
forj run worker
forj run scheduler
```

These resolve to generated App commands through Kong aliases.

Available commands depend on selected components.

Migration scaffolding is a project-level `forj` command:

```bash
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
- [forj dev](/developer-tools/forj-dev)
- [Generation Commands](/reference/generation-commands)
