---
title: Cache Patterns
searchTitle: Use Redis and Other Cache Drivers
description: How to use generated cache accessors for temporary, derived, and performance-oriented data.
---

# Cache Patterns

Cache is for temporary, derived, or performance-oriented data.

It is not durable business storage.

::: info Cache library reference
This guide focuses on using cache inside a GoForj App. See the [cache library page](/cache) for standalone construction, the complete package API, and the full driver and capability matrix.
:::

## When to Use Cache

Use cache when data can be recomputed, reloaded, or safely treated as temporary. Memory cache is the simplest choice for one-process development and focused tests. Choose a shared cache when API, workers, scheduler processes, or multiple hosts need the same values, locks, or counters.

Keep business truth in durable storage. A cache value may disappear at any time.

## Access Cache from Application Code

Apps expose cache through default and named accessors:

<!-- go-example: illustrative-fragment -->
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

During `forj dev`, an app listed in `dev.apps` rebuilds automatically. [Generation Commands](/reference/generation-commands) covers focused maintainer workflows.

## Cache Shell

Redis-backed cache stores can be inspected with the generated `cache:shell` command:

```bash
forj cache
forj cache:shell
```

Pass a cache store name when the App has named Redis caches:

```bash
forj cache sessions
forj cache --store sessions
```

GoForj tries `redis-cli` first, then falls back to the generated Docker Compose `redis` service when one exists:

```bash
forj cache --method local
forj cache --method compose
forj cache --print
```

Run one Redis command non-interactively, or pass native `redis-cli` arguments after `--`:

```bash
forj cache --exec "PING"
forj cache sessions --exec "GET user:1"
forj cache -- PING
forj cache sessions -- GET user:1
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

## Verify Cache Behavior

Test the behavior your service promises, not only the selected Driver. A cache-aside test should prove that the first call loads the source of truth, the second call uses the cached value, and a miss or expiry loads the source again. Use memory cache for that focused test so it stays deterministic.

When Redis is the deployment Driver, verify the configured resource through the App command before release:

```bash
forj cache --exec "PING"
```

Expected result: Redis replies `PONG`. For a named store, add its App-facing name, such as `forj cache sessions --exec "PING"`. This proves connectivity to that store; it does not prove TTL, invalidation, or cache-aside behavior, which belong in the service test.

## Local and Production Drivers

Use memory or file cache locally.

Use Redis, Memcached, NATS, DynamoDB, or SQL-backed cache when production requirements need shared, durable, or distributed behavior.

Use [Cache](/cache) for the full package-level driver matrix.

In a split deployment, run the same smoke workflow through each process that depends on the cache and check readiness after startup. A successful API probe does not prove a separately deployed worker or scheduler has the same credentials or network path.

## Next Steps

- [Named Resources](/core/named-resources) explains named accessors.
- [Driver Selection](/data/driver-selection) explains backend choices.
- [Environment Reference](/reference/env-vars#cache) lists cache and driver settings.
- [Cache](/cache) covers standalone package behavior.
