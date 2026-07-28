---
title: Migrations
description: How GoForj Apps create, run, rollback, and organize database migrations.
---

# Migrations

Migrations describe database schema changes as ordered files.

GoForj Apps include generated migration commands when database support is enabled.

## Commands

Run pending migrations:

```bash
forj migrate
```

Run migrations for an additional app by prefixing the command with the app name:

```bash
forj admin migrate
```

## Create a Migration

<MakeCommandTabs name="migration">
<template #usage>

```bash
forj make:migration create_users
forj make:migration add_event_index --connection analytics
```

Run these project-level commands from your App root. Applying and rolling back migrations happens through the App's generated command surface.

Remove generated migration files that match a migration name:

```bash
forj make:migration create_users --remove
```

Use `--connection analytics` when removing files from a named connection directory.

</template>
<template #files>

The default connection writes under `migrations/`. Named connections use `migrations/<connection>/`; multi-App Projects add the App name first:

```text
migrations/<timestamp>_create_users.up.sql
migrations/<timestamp>_create_users.down.sql
migrations/analytics/<timestamp>_add_event_index.up.sql
migrations/admin/archive/<timestamp>_add_event_index.up.sql
```

Multi-driver Apps insert the driver before `.up.sql` and `.down.sql`, such as `.postgres.up.sql`. No Go or Wire files change.

</template>
<template #generated>

The generator creates paired starter files. Replace the comments with the forward and rollback SQL:

<CodeFile path="migrations/&lt;timestamp&gt;_create_users.up.sql">

```sql
-- Up migration (sqlite)
```
</CodeFile>

<CodeFile path="migrations/&lt;timestamp&gt;_create_users.down.sql">

```sql
-- Down migration (sqlite)
```
</CodeFile>

The timestamp is UTC in `YYYY_MM_DD_HHMMSS` format. Removal matches that timestamped up/down pair by migration name.

</template>
</MakeCommandTabs>

Rollback recent migrations:

```bash
forj migrate:rollback
```

For an additional app:

```bash
forj admin migrate:rollback
```

The generated migration command supports options such as step count, dry run, and connection selection.

## Multi-App Projects

App-prefixed commands scope execution to that app:

```bash
forj admin migrate
forj admin migrate --connection archive
```

The first command runs every migration stream under `migrations/admin/*`. The second runs only `migrations/admin/archive`.

If two apps share one physical database, pick one app to own that database's migration stream. Do not duplicate the same schema history under two app directories. The `analytics` connection directory maps to `DB_ANALYTICS_*`.

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
- Do not mix one app's migrations into another app's migration directory.
:::

## Next Steps

- [Database Strategy](/data/database-strategy) explains connection configuration.
- [Repositories](/data/repositories) explains where query code should live.
- [Testing Overview](/testing/#choose-a-test-layer) explains GoForj App testing direction.
