---
title: Backup and Restore
description: Plan, create, verify, retain, and safely restore GoForj App data.
---

# Backup and Restore

GoForj provides framework-owned backup commands for durable resources configured by a generated App.

The commands run through `forj`, not the deployed App binary. They discover the selected App's database and storage resource contract, choose driver-aware strategies, and create manifest-backed backup sets with checksums.

## Safe Workflow

Inspect the plan before creating automation:

```bash
forj backup:plan
forj backup:plan --json
```

Create a backup in the default local repository:

```bash
forj backup:create
```

The default location is `.goforj/backups/backup-<UTC timestamp>`. Each completed set contains `manifest.json`, `checksums.txt`, and the database or storage artifacts named by the manifest.

List completed backups and verify the selected set:

```bash
forj backup:list
forj backup:verify --from .goforj/backups/backup-20260713T150000Z
```

Preview a restore before changing data:

```bash
forj backup:restore --from .goforj/backups/backup-20260713T150000Z --dry-run
```

Restore only after checking the plan and stopping writers that could conflict with the operation:

```bash
forj backup:restore --from .goforj/backups/backup-20260713T150000Z --confirm restore-production
```

The exact confirmation phrase is required for every destructive restore. Native restore verifies the manifest and artifact checksums before changing a resource.

::: warning Local backup files
`.goforj/backups` can contain production data and is not a source artifact. Keep it out of version control, public build artifacts, and unencrypted workstation sync. Add `.goforj/backups/` to the Project's ignore policy when using the default path.
:::

## Select an App or Resource

Unprefixed commands use the default App. Use the normal App prefix for a named App:

```bash
forj marketplace backup:plan
forj marketplace backup:create
```

The prefix loads the selected App's environment and resource contract before the framework command runs.

Use `--resource` for one database connection or storage disk:

```bash
forj backup:plan --resource reporting
forj backup:create --resource reporting
forj backup:create --resource storage.private
forj backup:restore --from <backup-directory> --resource reporting --dry-run
```

Database selectors accept `reporting` or `db.reporting`. Storage selectors use `storage.<name>`.

## Native Strategies

| Resource | Backup strategy | Restore behavior |
| --- | --- | --- |
| SQLite | SQLite `VACUUM INTO` | Prepares a native copy, then replaces the target database. |
| MySQL or MariaDB | `mysqldump` or `mariadb-dump` | Restores with `mysql` or `mariadb`. |
| PostgreSQL | Custom-format `pg_dump` | Restores with `pg_restore --clean --if-exists`. |
| Local storage | `tar.zst` directory archive | Overlays archived files onto the selected root. Matching files are replaced; unrelated existing files remain. |
| S3 App storage | Manifest-checksummed key/size inventory | Metadata only; GoForj refuses to restore objects from this artifact. |

MySQL, MariaDB, and PostgreSQL commands require the matching native client tools on the machine running `forj`. Connection secrets stay in the command environment and are not written to the manifest or printed as command arguments.

Unsupported external storage drivers are skipped during a complete backup. Explicitly selecting one fails rather than reporting a backup that GoForj cannot create.

The current backup plan requires at least one configured database with a supported driver. Storage-only Apps cannot create a framework backup set yet.

## Native and Portable Database Backups

Use native backups for routine same-driver recovery. A native database artifact can only be restored into the matching driver.

Use `--portable` when transferring SQL data across supported database drivers:

```bash
forj backup:create --resource reporting --portable
forj backup:restore --from .goforj/backups/portable-20260713T150000Z --resource reporting --portable --target-driver postgres --dry-run
forj backup:restore --from .goforj/backups/portable-20260713T150000Z --resource reporting --portable --target-driver postgres --confirm restore-production
```

A portable backup contains canonical table metadata and rows rather than a native dump. The target schema must already exist, and its columns must be compatible. When both the archive and Project provide a migration fingerprint, they must match.

Portable restore inserts the archived rows in one database transaction. It does not clear target tables first, so restore into an empty target unless additive inserts are intentional. Existing rows can cause duplicate-key failures.

Portable backup is a transfer path, not a replacement for the database vendor's native production backup tooling.

## Remote Repositories

Set `APP_BACKUP_DRIVER` to `s3` or `b2-s3` to copy verified local backup contents to an S3-compatible repository:

```text
APP_BACKUP_DRIVER=s3
APP_BACKUP_S3_BUCKET=example-backups
APP_BACKUP_S3_REGION=us-east-1
APP_BACKUP_S3_PREFIX=production/app
```

`backup:create` first creates and verifies the local set, then uploads its files. With a remote repository configured:

- `backup:list` lists remote names whose prefix contains a manifest.
- `backup:verify --from <name>` downloads and verifies a remote set.
- `backup:restore --from <name>` downloads the set before planning or restoring it.
- `backup:prune` removes older remote sets.

Remote upload writes files individually and is not an atomic completion protocol. A failed upload can leave a partial prefix, and `backup:list` alone does not prove that every artifact arrived. Run `backup:verify --from <name>` after upload before treating the remote copy as a recovery point. If upload fails, clean the partial prefix through the repository provider before retrying.

Use `APP_BACKUP_S3_ENDPOINT` and `APP_BACKUP_S3_USE_PATH_STYLE` for compatible services that require them. Credentials use `APP_BACKUP_S3_ACCESS_KEY_ID` and `APP_BACKUP_S3_SECRET_ACCESS_KEY`.

This repository is separate from S3-backed App storage. An S3 backup repository stores completed backup sets. An S3 App storage backup currently stores only an object inventory.

## Retention and Freshness

Keep the newest local completed sets by count:

```bash
forj backup:prune --keep 14 --dry-run
forj backup:prune --keep 14
```

Set calendar-bucket retention when backup frequency varies over time:

```text
APP_BACKUP_KEEP_DAILY=14
APP_BACKUP_KEEP_WEEKLY=4
APP_BACKUP_KEEP_MONTHLY=6
```

When any calendar-retention variable is set, local pruning keeps at most that many completed sets in each applicable day, ISO week, or month bucket. Values must be non-negative integers; invalid values fall back to the defaults shown above. Remote repositories currently prune by `--keep` count.

Check the newest local completed backup:

```bash
forj backup:status
```

`backup:status` reports whether a local backup exists, its creation time, age, and resource count. It does not currently query remote repository freshness.

Use `BACKUP_PATH` or the command-specific `--to` and `--path` flags to move local sets outside the default location:

```bash
BACKUP_PATH=/var/backups/example forj backup:create
forj backup:list --path /var/backups/example
```

## Production Practice

- Run `backup:plan` after changing database or storage configuration.
- Automate `backup:create`, then verify the completed set.
- Test restore into an isolated environment before depending on a backup policy.
- Stop or isolate writers before a destructive restore.
- Keep backup repository credentials separate from normal App storage credentials.
- Monitor `backup:status` or repository inventory from your operations system.
- Retain deployment archives separately when you also need binaries, environment files, or node configuration.

## Next Steps

- [Production Checklist](/operations/production-checklist)
- [Driver Selection](/data/driver-selection)
- [Environment Variables](/reference/env-vars)
- [CLI Reference](/reference/cli)
