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

Migration streams map to the generated flat connection registry:

| Migration stream | Database configuration |
| --- | --- |
| `migrations/app/default/*` | Default `DB_*` connection |
| `migrations/app/analytics/*` | `DB_ANALYTICS_*` |
| `migrations/admin/default/*` | `DB_ADMIN_*` |
| `migrations/admin/archive/*` | `DB_ADMIN_ARCHIVE_*` |

Adding another App expands the original App's streams beneath `migrations/app/` so every migration has an explicit App and connection owner. The additional App's name becomes part of its database connection name even when the migration stream is named `default`.

If two apps share one physical database, pick one app to own that database's migration stream. Do not duplicate the same schema history under two app directories. Migration records use a unique migration name within each physical database, so migration filenames across App streams that intentionally share one database must also remain unique.

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

Expected result: each pending migration is printed with its app, connection, and database connection, followed by `dry-run complete (<count>)`. The command creates the migration table when needed but does not apply pending migration SQL.

## Release Handoff

Use the built artifact and the release environment for deployment:

```bash
./bin/app migrate --dry-run
./bin/app migrate
./bin/app migrate --dry-run
```

The first command is the reviewable plan. The second applies it. The final command should report `dry-run complete (0)`. Run the same sequence with `--connection <name>` when a release owns only one named stream.

Do not use rollback as the first production recovery test. Exercise each new down migration against disposable data before release, and restore from backup when a destructive forward migration cannot be reversed safely.

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

- [Database Connections](/data/database-strategy) explains connection configuration.
- [Repositories](/data/repositories) explains where query code should live.
- [Testing Overview](/testing/#choose-a-test-layer) explains GoForj App testing direction.
- [`make:migration` Reference](/reference/make-commands#make-migration) lists connection selection, removal, and shared options.
