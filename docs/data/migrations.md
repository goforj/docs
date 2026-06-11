---
title: Migrations
description: How generated GoForj Apps create, run, rollback, and organize database migrations.
---

# Migrations

Migrations describe database schema changes as ordered files.

Generated GoForj Apps include migration commands when database support is enabled.

## Commands

Run pending migrations:

```bash
forj migrate
```

Run migrations for a named app with the app prefix:

```bash
forj billing migrate
```

Generate a migration:

```bash
forj make:migration create_users
```

Run this from the generated App root. Migration generation is a project-level `forj` command, while applying and rolling back migrations happens through the generated App command surface.

Remove generated migration files that match a migration name:

```bash
forj make:migration create_users --remove
```

The removal command matches timestamped files by migration name, including driver-specific files such as `.sqlite.up.sql` and `.postgres.down.sql`. Use `--connection analytics` when removing migration files from a named connection directory.

Rollback recent migrations:

```bash
forj migrate:rollback
```

For a named app:

```bash
forj billing migrate:rollback
```

The generated migration command supports options such as step count, dry run, and connection selection.

## Files

Migration files live under:

```text
migrations/
```

Driver-specific migrations include the driver name:

```text
migrations/2026_01_01_000001_create_users.sqlite.up.sql
migrations/2026_01_01_000001_create_users.sqlite.down.sql
migrations/2026_01_01_000001_create_users.postgres.up.sql
migrations/2026_01_01_000001_create_users.postgres.down.sql
```

## Named Connections

Root migration files target the default connection.

Subdirectories target named connections:

```text
migrations/analytics/2026_01_01_000001_add_events.postgres.up.sql
migrations/analytics/2026_01_01_000001_add_events.postgres.down.sql
```

The `analytics` directory maps to `DB_ANALYTICS_*`.

## Multi-App Projects

When a Project has multiple apps, migrations are grouped by app first and connection second:

```text
migrations/default/default/
migrations/billing/default/
migrations/billing/analytics/
```

This keeps each app's schema changes easy to review while preserving named connection ownership.

## Migration Table

Each connection maintains its own migration table in that database.

This lets default and named connections migrate independently.

## Safe Migration Practice

Prefer migrations that are:

- explicit
- reversible when practical
- small enough to review
- driver-specific when SQL differs by backend
- run through the App command path

Use dry run before applying migrations when you need visibility:

```bash
forj migrate --dry-run
```

## Common Mistakes

::: warning Common mistakes
- Do not assume one SQL file works for every driver.
- Do not put named-connection migrations in the root directory.
- Do not manually edit migration history unless you are intentionally repairing a database.
- Do not run migrations outside the App path when the generated command owns connection selection.
- Do not forget that each connection has its own migration table.
- Do not mix named app migrations into another app's migration directory.
:::

## Next Steps

- [Database Strategy](/data/database-strategy) explains connection configuration.
- [Repositories](/data/repositories) explains where query code should live.
- [Testing Overview](/testing/overview) explains generated App testing direction.
