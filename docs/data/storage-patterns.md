---
title: Storage Patterns
description: How to use generated storage disks for files, blobs, local disks, object stores, and remote filesystems.
---

# Storage Patterns

Storage is for files and blobs.

Use storage disks for uploads, generated files, public assets, private files, and remote object stores. Use the database for relational state and metadata.

::: info Storage library reference
This page covers your App's generated disks and their configuration. The [storage library reference](/storage) documents standalone use, the complete package API, and the available driver and capability matrices.
:::

## When To Use Storage

Use storage when a workflow produces or consumes files, blobs, exports, uploads, or remote objects. Start with local or memory storage for development and tests. Choose object storage or a remote filesystem when more than one host or process needs the same files.

Keep relational metadata, ownership, authorization state, and transactional updates in the database.

## Access Storage from Application Code

Apps expose default and named disks:

```go
app.Storage()
app.Storage().Public()
app.Storage().Uploads()
```

Named disks come from environment variables:

```text
STORAGE_SUPPORTED_DRIVERS=local,s3
STORAGE_DRIVER=local
STORAGE_PUBLIC_DRIVER=local
STORAGE_UPLOADS_DRIVER=s3
STORAGE_UPLOADS_BUCKET=my-app-uploads
STORAGE_UPLOADS_REGION=us-east-1
```

After adding or renaming named disks, use the normal build path:

```bash
forj build
```

During `forj dev`, an app listed in `dev.apps` rebuilds automatically. [Generation Commands](/reference/generation-commands) covers focused maintainer workflows.

## Good Uses

Storage is a good fit for:

- user uploads
- generated exports
- public assets
- private documents
- object storage
- remote filesystem integration

Store metadata, ownership, and lifecycle rules in the database when those are part of business state.

## Choosing Storage Drivers

Use this default path:

| Need | Driver Shape |
| --- | --- |
| Local development and tests | local or memory |
| One host owns the files | local |
| Multiple hosts need the same files | object storage or remote filesystem |
| Public asset delivery | object storage or CDN-backed disk |
| Temporary distributed blob storage | Redis only with explicit size and durability limits |

Use local storage until deployment topology makes that wrong. If API and workers run on different hosts, local disk paths stop being a shared contract.

## Path Discipline

Keep storage paths stable and scoped.

Prefer:

```text
users/{userID}/avatars/current.png
reports/{reportID}/exports/latest.csv
```

Avoid raw user filenames as trusted paths. Normalize and validate paths at the boundary that accepts user input.

## Local and Production Drivers

Use local or memory storage for local development and tests.

Use S3, GCS, FTP, SFTP, Dropbox, rclone, Redis, or other supported drivers when production requirements need shared or remote storage.

Use [Storage](/storage) for the full package-level driver matrix.

## Consistency With Database

Database transactions do not automatically include storage writes.

When a workflow creates both database rows and storage objects, decide:

- which write happens first
- what cleanup happens after failure
- whether retries are safe
- whether missing blobs are recoverable

## Next Steps

- [Named Resources](/core/named-resources) explains named disks.
- [Driver Selection](/data/driver-selection) explains backend choices.
- [Environment Reference](/reference/env-vars#file-storage) lists disk and driver settings.
- [Storage](/storage) covers standalone package behavior.
