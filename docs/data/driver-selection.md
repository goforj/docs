---
title: Driver Selection
description: How to choose local and production drivers for database, cache, storage, queue, and event infrastructure.
---

# Driver Selection

Driver selection should change infrastructure behavior without changing application business logic.

GoForj separates compile-time driver support from runtime driver selection.

## Two Decisions

First, choose which drivers the binary supports:

```text
CACHE_SUPPORTED_DRIVERS=memory,redis
STORAGE_SUPPORTED_DRIVERS=local,s3
QUEUE_SUPPORTED_DRIVERS=workerpool,redis
EVENTS_SUPPORTED_DRIVERS=inproc,nats
DB_SUPPORTED_DRIVERS=sqlite,postgres
```

Then choose which drivers each environment uses:

```text
CACHE_DRIVER=memory
STORAGE_DRIVER=local
QUEUE_DRIVER=workerpool
EVENTS_DRIVER=inproc
DB_DRIVER=sqlite
```

Named resources follow the same pattern:

```text
STORAGE_UPLOADS_DRIVER=s3
QUEUE_CRITICAL_DRIVER=redis
EVENTS_AUDIT_DRIVER=nats
```

## Local Defaults

Start local:

| Primitive | Local Driver |
| --- | --- |
| Database | SQLite |
| Cache | memory or file |
| Storage | local or memory |
| Queue | sync or workerpool |
| Events | in-process |

This keeps onboarding and local development small while preserving the production architecture.

## Production Drivers

Move to production drivers for concrete operational reasons:

- shared state
- durability
- independent scaling
- managed infrastructure
- cross-process fan-out
- remote object storage
- queue retry and worker control

Do not introduce distributed infrastructure before the App needs the behavior.

## Regeneration

Changing `*_SUPPORTED_DRIVERS` can change imports, factories, accessors, and generated config.

The normal path is:

```bash
forj build
```

::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
:::

Use focused generation only when you intentionally want to refresh one generated surface without a full build:

```bash
forj generate --cache
forj generate --storage
forj generate --queue
forj generate --events
forj generate --db
```

## Where To Find Driver Details

Framework pages explain how driver selection fits into the App.

Library pages own driver matrices, constructors, and low-level behavior:

- [Cache](/cache)
- [Storage](/storage)
- [Queue](/queue)
- [Events](/events)

## Common Mistakes

::: warning Common mistakes
- Do not show full driver matrices in every workflow page.
- Do not use production-only drivers in first examples.
- Do not compile every driver into every App by default.
- Do not make services import backend driver packages directly.
- Do not change business code when only the runtime backend changes.
:::

## Next Steps

- [Drivers and Adapters](/core/drivers-and-adapters) explains the core model.
- [Local-First Development](/core/local-first-development) explains default local workflows.
- [Libraries](/libraries/) contains standalone driver documentation.
