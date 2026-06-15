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
| `forj new` | Create a new GoForj Project through the interactive wizard. |
| `forj build` | Run generation, Wire, API indexing, then `go build`. |
| `forj run <app-command>` | Run generation, API indexing, then `go run . <app-command>`. |
| `forj dev` | Run local development watchers from `.goforj.yml`. |
| `forj generate` | Refresh generated component code and derived files. |
| `forj make:app <name>` | Create a named app in the current Project. |
| `forj make:controller <name>` | Generate an HTTP controller and wire it into HTTP. |
| `forj make:command <name>` | Generate an application command and wire it into the App command tree. |
| `forj make:migration <name>` | Generate migration files for supported database drivers. |

Inside a generated Project, `forj <command>` is the normal default-app development surface. Native GoForj commands take precedence. If no native command matches, GoForj delegates to the default app through the same source-aware path as `forj run <command>`.

Named apps use an app prefix:

```bash
forj marketplace route:list
forj marketplace build
forj marketplace worker
```

The prefix is part of the ergonomics. It selects the active app for generated App commands and app-aware native commands without forcing you to change directories or pass an `--app` flag.

Use `forj run <command>` when you want to force App command execution explicitly, especially for scripts or command names that collide with native GoForj commands. Use `./bin/app <command>` for the built binary and deployment/runtime process supervision.

## Common App Commands

Run these as `forj <command>` during development or directly through `./bin/app <command>` after build. For named apps, use `forj <app> <command>` or `./bin/<app> <command>`.

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
| `db` | `db:shell` | Open a database shell for a configured connection. |
| `cache` | `cache:shell` | Open a Redis shell for a configured cache store. |
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
forj db
forj cache
forj make:job reports:generate
forj make:schedule reports:daily --every 24h

./bin/app run
./bin/app api
./bin/app worker
./bin/app scheduler
./bin/app db
./bin/app cache

forj marketplace route:list
./bin/marketplace worker
```

These resolve to generated App commands through Kong aliases.

Available commands depend on selected components.

Database shell examples:

```bash
forj db
forj db analytics
forj db --method compose
forj db --print
forj db --exec "select count(*) from users"
forj db -- --batch -e "select count(*) from users"
forj db analytics -- -c "select count(*) from events"
```

Cache shell examples:

```bash
forj cache
forj cache sessions
forj cache --method compose
forj cache --print
forj cache --exec "PING"
forj cache -- PING
forj cache sessions -- GET user:1
```

App and resource generation are project-level `forj` commands:

```bash
forj make:app marketplace
forj make:controller users
forj make:command reports:reconcile
forj make:migration create_users
```

To register generated code into a named app, prefix the command:

```bash
forj marketplace make:controller checkout
forj marketplace make:job sync-catalog --queue sync
forj marketplace make:model order
```

The prefix chooses the registration files. `forj marketplace make:controller checkout` creates `internal/checkout/controller.go`, then updates `app/marketplace/routes.go` and `app/marketplace/wire/inject_http_controllers_app.go`; unprefixed `forj make:controller users` creates `internal/users/controller.go`, then updates the default app's `app/routes.go` and `app/wire/inject_http_controllers_app.go`.

File-generating make commands support `--open` / `-o` to open the generated file and `--no-open` to suppress opening. See [Opening Generated Files](/developer-tools/editor-open) for automatic editor detection and `FORJ_MAKE_OPEN` configuration.

Make commands also support `--remove` to delete the generated file or resource config and undo the wiring that the command manages:

```bash
forj make:controller users --remove
forj make:command reports:reconcile --remove
forj make:migration create_users --remove
```

Use `--dry-run` with `--remove` to preview the changes. See [Make Commands](/core/make-commands#removing-generated-resources) for the command-by-command removal behavior.

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
- [Opening Generated Files](/developer-tools/editor-open)
- [Database Shell](/data/database-shell)
- [forj dev](/developer-tools/forj-dev)
- [Generation Commands](/reference/generation-commands)
