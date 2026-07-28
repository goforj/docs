---
title: Data and Persistence
description: Durable data, cache, storage, transactions, repositories, and driver selection in GoForj.
---

# Data and Persistence

Data and Persistence explains how GoForj applications work with durable data, derived data, and files.

Use these guides to keep source-of-truth records, derived data, and files separate while working with database connections, cache accessors, and storage disks configured by your app.

## Choose a Data Task

| Task | Read |
| --- | --- |
| Select, configure, or inspect a database | [Database Strategy](/data/database-strategy) |
| Change schema safely | [Migrations](/data/migrations) |
| Own and test database queries | [Repositories](/data/repositories) |
| Coordinate durable writes | [Transactions](/data/transactions) |
| Store temporary or derived values | [Cache Patterns](/data/cache-patterns) |
| Store files and objects | [Storage Patterns](/data/storage-patterns) |
| Compare local and production backends | [Driver Selection](/data/driver-selection) |

## Related Sections

- [Cached User Profile](/scenarios/cached-user-profile) shows cache as derived data.
- [File Upload To Storage](/scenarios/file-upload-storage) shows named storage disks.
- [Core Concepts](/core/) explains drivers, adapters, providers, and named resources.
- [Libraries](/libraries/) includes standalone Cache and Storage documentation.
