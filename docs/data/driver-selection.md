---
title: Driver Selection
description: How to choose local and production drivers for database, cache, storage, queue, event, and mail infrastructure.
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
MAIL_SUPPORTED_DRIVERS=log,resend
DB_SUPPORTED_DRIVERS=sqlite,postgres
```

Then choose which drivers each environment uses:

```text
CACHE_DRIVER=memory
STORAGE_DRIVER=local
QUEUE_DRIVER=workerpool
EVENTS_DRIVER=inproc
MAIL_DRIVER=log
DB_DRIVER=sqlite
```

Named resources follow the same pattern:

```text
STORAGE_UPLOADS_DRIVER=s3
QUEUE_CRITICAL_DRIVER=redis
EVENTS_AUDIT_DRIVER=nats
MAIL_TRANSACTIONAL_DRIVER=resend
```

## Local Defaults

Start local:

| Primitive | Local Driver |
| --- | --- |
| Database | `sqlite` |
| Cache | `memory` |
| Storage | `local` |
| Queue | `workerpool` |
| Events | `inproc` |
| Mail | `log` |

This keeps onboarding and local development small while preserving the production architecture.

These local drivers are generated fallbacks. An App without a `.env` file still constructs the generated default and named resources with the local fallback drivers, unless process environment or another loaded environment file selects a different supported driver.

## Decision Guide

Use the smallest driver that satisfies the runtime boundary you actually have.

| Situation | Default Choice | Move When |
| --- | --- | --- |
| One local process, no shared queue state | `workerpool` queue | API and workers split into separate processes |
| API and worker run separately on one machine | SQLite queue | Throughput, concurrency, or multi-node workers matter |
| Local cache for one process | memory cache | Multiple runtimes need shared values or locks |
| Local file/blob work | local storage | More than one host needs the same files |
| Local event fan-out | in-process events | Events must cross process boundaries |
| Local mail inspection | log mailer | Real delivery, provider webhooks, or domain authentication matter |
| Local relational state | SQLite | Production concurrency, managed backups, or multi-node writes matter |

Do not choose a distributed driver because it sounds production-like. Choose it when the App needs the behavior: durability, shared state, cross-process delivery, managed operations, or independent scaling.

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

The normal upgrade sequence is:

1. keep the application service code unchanged
2. add the production driver to `*_SUPPORTED_DRIVERS`
3. choose the driver with environment variables
4. run `forj build`
5. verify the runtime with metrics, inspects, logs, and smoke commands

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
forj generate --mail
forj generate --db
```

## Where To Find Driver Details

Framework pages explain how driver selection fits into the App.

Library pages own driver matrices, constructors, and low-level behavior:

- [Cache](/cache)
- [Storage](/storage)
- [Queue](/queue)
- [Events](/events)
- [Mail](/mail)

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
