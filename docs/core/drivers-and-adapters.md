---
title: Drivers and Adapters
description: The difference between interchangeable infrastructure drivers and integration adapters in GoForj.
---

# Drivers and Adapters

Drivers and adapters let an app use different infrastructure without rewriting application logic.

They are related, but they are not the same concept.

## Driver

A Driver is a backend implementation selected behind a stable primitive contract.

Examples:

- memory, file, Redis, SQL, and NATS cache drivers
- local, S3, GCS, FTP, and SFTP storage drivers
- sync, workerpool, Redis, SQL, NATS, SQS, and RabbitMQ queue drivers
- in-process, Redis, NATS, Kafka, Pub/Sub, and SNS event drivers

The application-facing contract stays stable. The backend can change through configuration and generated provider support.

```mermaid
flowchart LR
  service["application service"] --> contract["cache, queue, storage, or event API"]
  contract --> manager["app manager or named accessor"]
  manager --> driver["selected driver"]
  driver --> backend["backend infrastructure"]
```

## Adapter

An Adapter connects a GoForj-facing contract to another implementation or ecosystem boundary.

Examples:

- the `web` Echo adapter
- middleware adapters around HTTP engines
- bridges from framework-owned abstractions into external protocols

Adapters translate boundaries. Drivers select backends.

## Where Selection Happens

An app compiles support for a bounded set of drivers, then configuration chooses which supported driver each environment uses. This keeps backend dependencies out of binaries that do not need them and makes unsupported selections fail fast.

[Driver Selection](/data/driver-selection) owns the environment variables, local defaults, production choices, and migration workflow. The [Drivers catalog](/drivers) owns the complete availability matrix.

## Application Boundary

Business code should depend on app-facing APIs and named accessors.

Prefer:

```go
app.Storage().Uploads()
app.Caches().Sessions()
app.Queues().Critical()
app.Events().Audit()
```

Avoid importing backend driver packages directly in business services unless the page is explicitly about custom wiring or advanced infrastructure work.

Start with the local driver that satisfies the current runtime boundary. Choose shared or durable infrastructure when processes must coordinate, work must survive restarts, or the deployment requires managed services. Changing that backend should not require changing the consuming service.

## Next Steps

- [Named Resources](/core/named-resources) explains default and named accessors.
- [Driver Selection](/data/driver-selection) explains how to choose and migrate drivers.
- [Drivers](/drivers) lists the available backends.
- [Libraries](/libraries/) contains package-level driver details.
