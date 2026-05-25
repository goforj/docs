---
title: Drivers And Adapters
description: The difference between interchangeable infrastructure drivers and integration adapters in GoForj.
---

# Drivers And Adapters

Drivers and adapters let GoForj Apps use different infrastructure without rewriting application logic.

They are related, but they are not the same concept.

## Driver

A Driver is a backend implementation selected behind a stable primitive contract.

Examples:

- memory, file, Redis, SQL, and NATS cache drivers
- local, S3, GCS, FTP, and SFTP storage drivers
- sync, workerpool, Redis, SQL, NATS, SQS, and RabbitMQ queue drivers
- in-process, Redis, NATS, Kafka, Pub/Sub, and SNS event drivers

The application-facing contract stays stable. The backend can change through configuration and generated provider support.

## Adapter

An Adapter connects a GoForj-facing contract to another implementation or ecosystem boundary.

Examples:

- the `web` Echo adapter
- middleware adapters around HTTP engines
- bridges from framework-owned abstractions into external protocols

Adapters translate boundaries. Drivers select backends.

## Compile-Time Support

Generated Apps compile only the drivers they support.

Examples:

```text
CACHE_SUPPORTED_DRIVERS=memory,redis
STORAGE_SUPPORTED_DRIVERS=local,s3
QUEUE_SUPPORTED_DRIVERS=workerpool,redis
EVENTS_SUPPORTED_DRIVERS=inproc,nats
DB_SUPPORTED_DRIVERS=sqlite,postgres
```

This keeps binaries lean and avoids importing unused backend dependencies.

## Runtime Selection

Runtime driver selection happens through default and named resource variables:

```text
CACHE_DRIVER=memory
CACHE_SESSIONS_DRIVER=redis

STORAGE_DRIVER=local
STORAGE_UPLOADS_DRIVER=s3

QUEUE_DRIVER=workerpool
QUEUE_CRITICAL_DRIVER=redis

EVENTS_DRIVER=inproc
EVENTS_AUDIT_DRIVER=nats
```

The selected runtime driver must be included in the supported driver list. If generation and runtime configuration disagree, the App should fail fast.

## Application Boundary

Business code should depend on App-facing contracts and generated accessors.

Prefer:

```go
app.Storage().Uploads()
app.Caches().Sessions()
app.Queues().Critical()
app.Events().Audit()
```

Avoid importing backend driver packages directly in business services unless the page is explicitly about custom wiring or advanced infrastructure work.

## Choosing Drivers

Start local:

- memory or file cache
- local or memory storage
- sync or workerpool queue
- in-process events
- SQLite when the App uses SQL locally

Move to distributed drivers when the runtime requirement exists:

- shared state across processes
- durable background work
- external object storage
- independent scaling
- managed cloud infrastructure

Do not introduce distributed infrastructure just to make a first example look production-sized.

## Common Mistakes

- Do not call every integration an adapter.
- Do not call every backend a provider.
- Do not change business code when only the backend changes.
- Do not document driver matrices in framework workflow pages when the library page already owns them.
- Do not compile every possible driver into every App by default.

## Next Steps

- [Named Resources](/core/named-resources) explains default and named accessors.
- [Generated Components](/core/generated-components) explains supported driver generation.
- [Libraries](/libraries/) contains package-level driver details.
