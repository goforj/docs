---
title: CLI Reference
description: Framework-level lookup for common GoForj CLI commands.
---

# CLI Reference

This page lists common GoForj CLI commands and App command patterns.

Use workflow pages for full context.

## Project Commands

| Command | Purpose |
| --- | --- |
| `forj new` | Create a new GoForj Project through the interactive wizard. |
| `forj build` | Run generation, Wire, API indexing, then `go build`. |
| `forj build:api-index` | Build the active App's API index, diagnostics, and OpenAPI artifacts. |
| `forj run [<app-command>]` | Build an exact temporary App binary, start it with the optional command, then publish prepared API artifacts after the process-start boundary. |
| `forj dev` | Run App development lifecycles and custom watches from `.goforj.yml`. |
| `forj down` | Run the configured `dev.down` teardown tasks without starting a development session. |
| `forj generate` | Refresh generated component code and derived files. |
| `forj make:app <name>` | Create an additional runnable app in the current Project. |
| `forj make:controller <name>` | Generate an HTTP controller and wire it into HTTP. |
| `forj make:command <name>` | Generate an application command and wire it into the App command tree. |
| `forj make:migration <name>` | Generate migration files for supported database drivers. |
| `forj project:describe --json` | Print the versioned static Project topology for tools and automation. |

See the [Make Command Reference](/core/make-commands#command-reference) for every generator, the files it touches, and representative generated code.

## Framework Command Options

Run `forj <command> --help` for the exact command metadata installed with your CLI version. The main framework options are:

| Command | Options |
| --- | --- |
| `forj new` | `--allow-non-empty` permits creation in a non-empty destination. |
| `forj build` | `--timings`, `--api-index-strict`, `--env-defaults`, `--env-overrides`, `--profile`, `--top`, and `--root`; remaining arguments pass through to `go build`. |
| `forj build:api-index` | `--strict` rejects warnings and errors; `--tags` selects comma-separated Go build tags. |
| `forj run` | `--timings`, `--api-index-strict`, and `--root`; remaining arguments pass to the compiled App. |
| `forj generate` | `--storage`, `--cache`, `--mail`, `--queue`, `--events`, `--db`, and `--observability` select individual components. With no flags, all available generators run. |
| `forj make:app` | `--components`, `--without`, `--starter-kit`, `--help-format`, `--dev-run`, `--skip-wire`, and `--remove`. |
| `forj project:describe` | `--json` is required and prints the versioned machine contract. |

`forj dev` and `forj down` take their behavior from `.goforj.yml` and do not accept command-specific flags.

Inside a GoForj Project, `forj <command>` is the normal default-app development surface. Native GoForj commands take precedence. If no native command matches, GoForj delegates to the default app through the same source-aware path as `forj run <command>`.

Select an additional app by prefixing the command with its app name:

```bash
forj marketplace route:list
forj marketplace build
forj marketplace worker
```

The prefix is part of the ergonomics. It selects the active app for App commands and app-aware native commands without forcing you to change directories or pass an `--app` flag.

Use `forj run <command>` when you want to force App command execution explicitly, especially for scripts or command names that collide with native GoForj commands.

The command surface communicates intent:

| Intent | Default App | Additional App |
| --- | --- | --- |
| Develop from current source | `forj <command>` | `forj marketplace <command>` |
| Run the built artifact | `./bin/app <command>` | `./bin/marketplace <command>` |
| Develop the combined Runtime | `forj app` | `forj marketplace app` |
| Run the combined artifact | `./bin/app` | `./bin/marketplace` |

`forj` uses the source-aware App path so current source does not silently run through a stale binary. Direct binary commands run exactly the artifact on disk and are the deployment and process-supervision surface.

`build:api-index --strict` rejects warnings as well as errors. Complete `build` and `run` commands use `--api-index-strict`. See [API Index](/applications/api-index) for build-tag and publication behavior.

## Common App Commands

The command names below are shared by the source-aware development and built-artifact surfaces. Choose the surface from the intent table above.

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

Development examples:

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
forj marketplace route:list
forj marketplace worker
```

Built-artifact examples:

```bash
./bin/app
./bin/app run
./bin/app api
./bin/app worker
./bin/app scheduler
./bin/app db
./bin/app cache
./bin/marketplace route:list
./bin/marketplace worker
```

For runtime-capable Apps, bare `./bin/app` selects `run`; CLI-only binaries print root help when no command is supplied. Passing `--help` or an explicit command retains normal CLI behavior.

These reach the App command surface. Short command names use Kong aliases.

Available commands depend on selected components.

## Backup Commands

Backup commands are framework-owned operator commands. They use the selected App's resource contract and environment:

| Command | Purpose |
| --- | --- |
| `forj backup:plan` | Show the database and storage backup plan. |
| `forj backup:create` | Create a native manifest-backed backup set. |
| `forj backup:list` | List completed local or configured remote backup sets. |
| `forj backup:verify --from <source>` | Verify the manifest and every artifact checksum. |
| `forj backup:restore --from <source> --dry-run` | Print the restore plan without changing data. |
| `forj backup:restore --from <source> --confirm restore-production` | Perform an explicitly confirmed destructive restore. |
| `forj backup:prune` | Remove completed sets outside the retention policy. |
| `forj backup:status` | Report the newest local backup and its age. |

Prefix the command with the app name to operate on an additional app:

```bash
forj marketplace backup:plan
forj marketplace backup:create
```

Use `--resource` to select one database or storage resource. `backup:create --portable` and `backup:restore --portable` provide database-neutral SQL transfer when a same-driver native restore is not appropriate.

See [Backup and Restore](/operations/backups) before automating or performing a restore.

## Atlas Commands

Atlas commands manage optional project-local agent guidance:

| Command | Purpose |
| --- | --- |
| `forj atlas:install` | Install selected agent guidance, skills, and MCP configuration. |
| `forj atlas:update` | Refresh Atlas-managed files and project-owned skills. |
| `forj atlas:doctor` | Report installation health and stale managed surfaces. |
| `forj atlas:list-skills` | List built-in and project-owned Atlas skills. |
| `forj atlas:make-skill <name>` | Create a project-owned skill using a lowercase kebab-case name. |

`atlas:install` and `atlas:update` accept repeatable `--agent` selections, `--all-agents`, `--guidelines`, `--skills`, `--mcp`, `--no-interaction`, and `--dry-run`. See [Atlas](/developer-tools/atlas) for installation and workflow guidance.

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

Prefix a resource command when an additional app owns its registration:

```bash
forj marketplace make:controller checkout
forj marketplace make:job sync-catalog --queue sync
forj marketplace make:model order
```

See [Apps](/core/apps#add-another-app) for App creation and prefix behavior. See the [Make Command Reference](/core/make-commands#command-reference) for generated files, wiring changes, output overrides, opening files, and removal.

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
- [Make Command Shared Options](/core/make-commands#shared-options)
- [Database Shell](/data/database-strategy#database-shell)
- [Backup and Restore](/operations/backups)
- [forj dev](/developer-tools/forj-dev)
- [Generation Commands](/reference/generation-commands)
