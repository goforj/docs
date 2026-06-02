---
title: Database Strategy
description: How generated GoForj Apps model database connections, driver support, and durable data ownership.
---

# Database Strategy

Database connections are the source-of-truth path for durable relational data in a generated GoForj App.

GoForj keeps database configuration explicit and generated. The generated database package opens and caches connections on first access through its connection registry.

## Generated Package

Database connection behavior lives in:

```text
internal/database
```

The generated package owns:

- database connection configuration
- first-access connection opening
- default and named connection access
- driver-specific generated support
- local database README guidance

## Default Connection

The default connection uses `DB_*` variables:

```text
DB_SUPPORTED_DRIVERS=sqlite,postgres
DB_DRIVER=sqlite
DB_DATABASE=./_data/sqlite/app.db
```

For networked databases, the App can use host, database, username, password, port, pool, and query logging settings.

## Named Connections

Named connections use `DB_<NAME>_*` variables:

```text
DB_ANALYTICS_DRIVER=postgres
DB_ANALYTICS_HOST=127.0.0.1
DB_ANALYTICS_DATABASE=analytics
DB_ANALYTICS_USERNAME=app
DB_ANALYTICS_PASSWORD=secret
```

After changing named connections or supported drivers, use the normal build path:

```bash
forj build
```

::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
:::

Use focused generation only when you intentionally want to refresh database accessors without a full build:

```bash
forj generate --db
```

## Accessing Connections

Generated accessors expose default and named connections:

```go
db, err := conns.Default()
analytics, err := conns.Analytics()
```

Connections are opened on first accessor use and cached by name. This database-specific behavior does not imply that every generated manager uses lazy initialization.

Use health and readiness checks to make required database availability visible for the runtime process that needs it.

## Database Shell

Database-enabled Apps include a generated shell command for inspecting configured connections:

```bash
forj db
```

`forj db` opens the default database connection with the matching local client: `mysql`, `psql`, or `sqlite3`. The command resolves connection details from `DB_*` variables, so application code and shell access use the same App configuration.

Use the canonical command when you want the full name:

```bash
forj db:shell
```

Named connections use the App-facing connection name:

```bash
forj db analytics
forj db --connection analytics
```

When more than one shellable connection exists and the command is running in an interactive terminal, GoForj can show a compact selector. In scripts, it uses the default connection unless you pass a connection name.

### Method Selection

By default, `forj db` tries the local client first. If the local client is not installed, it falls back to the generated Docker Compose service when one exists.

You can choose the method explicitly:

```bash
forj db --method local
forj db --method compose
```

Use `--print` to inspect the command GoForj will run. Secrets are masked:

```bash
forj db --print
forj db analytics --method local --print
```

### Non-Interactive Queries

Use `--exec` for a single SQL string:

```bash
forj db --exec "select count(*) from users"
forj db analytics --exec "select count(*) from events"
```

Use `--` to pass client-native arguments directly after GoForj adds the configured connection arguments:

```bash
forj db -- --batch -e "select count(*) from users"
forj db analytics -- -c "select count(*) from events"
forj db --connection analytics -- -c "select now()"
```

The first example passes MySQL-style arguments. The `analytics` examples pass Postgres-style arguments when that connection uses Postgres.

## Driver Support

`DB_SUPPORTED_DRIVERS` controls which database drivers are generated into the App. `DB_DRIVER` and `DB_<NAME>_DRIVER` choose active runtime connections.

Example:

```text
DB_SUPPORTED_DRIVERS=sqlite,postgres
DB_DRIVER=sqlite
DB_ANALYTICS_DRIVER=postgres
```

This compiles SQLite and Postgres support, uses SQLite for the default connection, and uses Postgres for `analytics`.

## Source Of Truth

Use the database for durable business state.

Do not use cache as the source of truth. Do not use object storage as a replacement for relational state unless the data is actually file/blob data.

## Common Mistakes

::: warning Common mistakes
- Do not generalize database first-access behavior to cache, storage, queue, or event managers unless their generated code supports it.
- Do not add a runtime driver without including it in `DB_SUPPORTED_DRIVERS`.
- Do not hide database configuration in leaf services.
- Do not treat cache or storage as durable relational state.
- Do not edit generated DB accessors by hand.
:::

## Next Steps

- [Database Shell](/data/database-shell) explains interactive and non-interactive database access.
- [Migrations](/data/migrations) explains schema changes.
- [Repositories](/data/repositories) explains persistence boundaries.
- [Driver Selection](/data/driver-selection) explains local and production driver choices.
