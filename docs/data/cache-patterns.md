---
title: Cache Patterns
description: How to use generated cache accessors for temporary, derived, and performance-oriented data.
---

# Cache Patterns

Cache is for temporary, derived, or performance-oriented data.

It is not durable business storage.

## Generated Accessors

Generated Apps expose cache through default and named accessors:

```go
app.Cache()
app.Caches().Sessions()
```

Named cache scopes come from environment variables:

```text
CACHE_SUPPORTED_DRIVERS=memory,redis
CACHE_DRIVER=memory
CACHE_SESSIONS_DRIVER=redis
```

After adding or renaming named caches, use the normal build path:

```bash
forj build
```

::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
:::

Use focused generation only when you intentionally want to refresh cache code without a full build:

```bash
forj generate --cache
```

## Good Uses

Cache is a good fit for:

- expensive derived data
- session-like temporary state when the selected driver supports the requirement
- rate limit counters
- short-lived lookup results
- coordination locks when the operational tradeoff is understood

Set TTLs deliberately.

## Choosing Cache Drivers

Use this default path:

| Need | Driver Shape |
| --- | --- |
| Fast local development or unit tests | memory |
| Local persistence across restarts | file |
| Shared cache across API, workers, or scheduler | Redis, Memcached, NATS, DynamoDB, or SQL-backed cache |
| Distributed locks or rate limits | shared backend with explicit TTLs |

Use memory cache until process boundaries make that wrong. A memory cache is not shared between `api`, `worker`, and `scheduler` processes.

## Cache-Aside Shape

Typical flow:

1. try cache
2. compute or load source-of-truth data
3. write cache with TTL
4. return result

Cache misses should be normal.

## Local and Production Drivers

Use memory or file cache locally.

Use Redis, Memcached, NATS, DynamoDB, or SQL-backed cache when production requirements need shared, durable, or distributed behavior.

Use [Cache](/cache) for the full package-level driver matrix.

## Common Mistakes

::: warning Common mistakes
- Do not store source-of-truth business state only in cache.
- Do not omit TTLs for data that should expire.
- Do not put user input directly into metric labels or cache resource names.
- Do not import cache driver packages into business services.
- Do not assume local memory cache is shared across runtime processes.
:::

## Next Steps

- [Named Resources](/core/named-resources) explains named accessors.
- [Driver Selection](/data/driver-selection) explains backend choices.
- [Cache](/cache) covers standalone package behavior.
