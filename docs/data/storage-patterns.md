---
title: Storage Patterns
description: How to use generated storage disks for files, blobs, local disks, object stores, and remote filesystems.
---

# Storage Patterns

Storage is for files and blobs.

Use storage disks for uploads, generated files, public assets, private files, and remote object stores. Use the database for relational state and metadata.

## Generated Disks

Generated Apps expose default and named disks:

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

::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
:::

Use focused generation only when you intentionally want to refresh storage code without a full build:

```bash
forj generate --storage
```

## Good Uses

Storage is a good fit for:

- user uploads
- generated exports
- public assets
- private documents
- object storage
- remote filesystem integration

Store metadata, ownership, and lifecycle rules in the database when those are part of business state.

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

## Common Mistakes

::: warning Common mistakes
- Do not store relational source-of-truth data in object paths alone.
- Do not hardcode local filesystem paths in business services.
- Do not import storage driver packages into normal application logic.
- Do not assume every driver supports every capability, such as temporary URLs.
- Do not skip path normalization for user-controlled filenames.
:::

## Next Steps

- [Named Resources](/core/named-resources) explains named disks.
- [Driver Selection](/data/driver-selection) explains backend choices.
- [Storage](/storage) covers standalone package behavior.
