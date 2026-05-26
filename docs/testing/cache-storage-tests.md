---
title: Cache and Storage Tests
description: How to test cache and storage behavior with local drivers and targeted backend integration tests.
---

# Cache and Storage Tests

Cache and storage tests should use local drivers by default.

Use backend integration tests only when backend-specific behavior matters.

## Cache Tests

Use memory, file, or null cache for local tests:

```text
CACHE_SUPPORTED_DRIVERS=memory,file,null
CACHE_DRIVER=memory
```

Test cache behavior as derived state:

- cache miss
- cache hit
- TTL behavior when relevant
- invalidation
- fallback to source-of-truth data

Do not test business correctness only through cache.

## Storage Tests

Use local or memory storage for local tests:

```text
STORAGE_SUPPORTED_DRIVERS=local,memory
STORAGE_DRIVER=local
STORAGE_ROOT=/tmp/app-storage-test
```

Test:

- path normalization
- writes
- reads
- deletes
- generated URLs when supported
- missing file behavior

## Backend Tests

Use integration tests for Redis, S3, GCS, FTP, SFTP, SQL-backed cache, and other backend-specific behavior.

Keep those tests explicit and isolated because they may need containers, emulators, credentials, or network access.

## Common Mistakes

- Do not use cache as the source of truth in tests.
- Do not hardcode local filesystem paths that collide across tests.
- Do not require cloud storage for normal unit tests.
- Do not assume every storage driver supports every capability.
- Do not skip regeneration after adding named caches or disks.

## Next Steps

- [Cache Patterns](/data/cache-patterns) explains cache usage.
- [Storage Patterns](/data/storage-patterns) explains disk usage.
- [Cache](/cache) and [Storage](/storage) cover standalone package details.
