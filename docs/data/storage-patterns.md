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

## When to Use Storage

Use storage when a workflow produces or consumes files, blobs, exports, uploads, or remote objects. Start with local or memory storage for development and tests. Choose object storage or a remote filesystem when more than one host or process needs the same files.

When a feature introduces a durable category such as avatars, invoice attachments, or generated reports, consider giving it a named storage disk. A distinct name is valuable when the category has its own access, retention, visibility, or deployment policy. Reuse an existing disk when those policies are genuinely shared; do not create names merely to mirror directories.

Keep relational metadata, ownership, authorization state, and transactional updates in the database.

## Access Storage from Application Code

Apps expose default and named disks:

<!-- go-example: illustrative-fragment -->
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

## Consistency with Database

Database transactions do not automatically include storage writes.

When a workflow creates both database rows and storage objects, decide:

- which write happens first
- what cleanup happens after failure
- whether retries are safe
- whether missing blobs are recoverable

## Testing and Operations

Use a memory disk in focused service tests. Assert the exact stable path, written bytes, and cleanup behavior after a simulated database or storage failure. For a database-plus-blob workflow, include both partial-failure directions: the row succeeds while the blob fails, and the blob succeeds while the row fails.

Before releasing a remote Driver, run one non-production object through the same App workflow used by customers:

1. write the object through the API, command, or worker that owns the workflow
2. read it through a different deployed process when storage is meant to be shared
3. verify its content and authorization behavior
4. delete it through the normal cleanup path
5. confirm the object is gone while its audit or business metadata remains correct

Readiness proves that the configured disk can be constructed and reached. It does not prove bucket policy, temporary URL behavior, cross-host visibility, or cleanup permissions.

## Next Steps

- [Named Resources](/core/named-resources) explains named disks.
- [Driver Selection](/data/driver-selection) explains backend choices.
- [Environment Reference](/reference/env-vars#file-storage) lists disk and driver settings.
- [Storage](/storage) covers standalone package behavior.
