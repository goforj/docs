---
title: Database Strategy
description: How generated GoForj Apps model database connections, driver support, and durable data ownership.
---

# Database Strategy

Database connections are the source-of-truth path for durable relational data in a generated GoForj App.

GoForj keeps database configuration explicit, generated, and lazy so non-database commands do not require a live database unless they use one.

## Generated Package

Database connection behavior lives in:

```text
internal/database
```

The generated package owns:

- database connection configuration
- lazy connection creation
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

Connections are lazy and cached. A command that does not touch the database should not need a live database just because database support exists in the App.

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

- Do not make every command connect to the database during boot.
- Do not add a runtime driver without including it in `DB_SUPPORTED_DRIVERS`.
- Do not hide database configuration in leaf services.
- Do not treat cache or storage as durable relational state.
- Do not edit generated DB accessors by hand.

## Next Steps

- [Migrations](/data/migrations) explains schema changes.
- [Repositories](/data/repositories) explains persistence boundaries.
- [Driver Selection](/data/driver-selection) explains local and production driver choices.
