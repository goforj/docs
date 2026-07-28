---
title: Database Strategy
description: How GoForj Apps model database connections, driver support, and durable data ownership.
---

# Database Strategy

Database connections are the source-of-truth path for durable relational data in a GoForj App.

GoForj keeps database configuration explicit and generated. The generated database package opens and caches connections on first access through its connection registry.

## Open the Default Connection

Database-enabled Apps expose the configured default connection through:

```bash
forj db
```

Expected result: GoForj resolves the default `DB_*` configuration and opens the matching `mysql`, `psql`, or `sqlite3` shell. It tries the local client first and falls back to the matching generated Docker Compose service only when the local client is missing and that service exists.

Use `--print` to verify the masked command without opening a shell:

```bash
forj db --print
```

Application code reaches the same default connection through the generated registry:

```go
db, err := conns.Default()
```

The connection opens on first access and is then cached by name.

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

If `DB_DRIVER` is unset, GoForj Apps use SQLite. If a SQLite connection does not set `DB_DATABASE`, the default connection uses `_data/sqlite/app.db`.

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

If a named connection uses the SQLite fallback and no database path is configured, it uses `_data/sqlite/<name>.db`, such as `_data/sqlite/analytics.db`.

After changing named connections or supported drivers, use the normal build path:

```bash
forj build
```

During `forj dev`, an app listed in `dev.apps` rebuilds automatically. [Generation Commands](/reference/generation-commands) covers focused maintainer workflows.

## Accessing Connections

Generated accessors expose default and named connections:

```go
db, err := conns.Default()
analytics, err := conns.Analytics()
```

Connections are opened on first accessor use and cached by name. This database-specific behavior does not imply that every generated manager uses lazy initialization.

Use health and readiness checks to make required database availability visible for the runtime process that needs it.

## Shell Options

Database-enabled Apps also expose the canonical command name:

Use the canonical command when you want the full name:

```bash
forj db:shell
```

The generated command is also available on the built App binary. Named Apps use the development prefix or their own binary:

```bash
./bin/app db
forj marketplace db
./bin/marketplace db
```

Named connections use the App-facing connection name:

```bash
forj db analytics
forj db --connection analytics
```

Connection selectors match generated resource names: `DB_ANALYTICS_*` maps to `analytics`. With multiple shellable connections, an interactive terminal shows a compact selector. A non-interactive command uses the default connection unless you pass a name; scripts should select one explicitly when they must not depend on that default.

### Method Selection

By default, `forj db` tries the local client first. It falls back to the generated Docker Compose service only when that client is missing and the matching service exists. Other local resolution errors are returned directly; if neither launch method is available, the error identifies the missing client and unavailable Compose fallback.

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

The printed command is useful for checking the selected client, host, port, database, connection arguments, and method without launching it.

### Non-Interactive Queries

Use `--exec` for a single SQL string:

```bash
forj db --exec "select count(*) from users"
forj db analytics --exec "select count(*) from events"
./bin/app db --exec "select 1"
```

Use `--` to pass client-native arguments directly after GoForj adds the configured connection arguments:

```bash
forj db -- --batch -e "select count(*) from users"
forj db analytics -- -c "select count(*) from events"
forj db --connection analytics -- -c "select now()"
```

The first example passes MySQL-style arguments. The `analytics` examples pass Postgres-style arguments when that connection uses Postgres.

Local MySQL launches force TCP when the connection is host-based, preventing the client from silently choosing a local socket.

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

## Next Steps

- [Migrations](/data/migrations) explains schema changes.
- [Repositories](/data/repositories) explains persistence boundaries.
- [Driver Selection](/data/driver-selection) explains local and production driver choices.
- [Environment Reference](/reference/env-vars#database) lists connection and driver settings.
