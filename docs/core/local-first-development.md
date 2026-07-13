---
title: Local-First Development
description: How GoForj keeps local development simple while preserving production infrastructure flexibility.
---

# Local-First Development

GoForj is local-first: the default development path should run with minimal external infrastructure while preserving the same App architecture used in production.

Local-first does not mean local-only. It means the first working path is small, explicit, and easy to inspect.

## Default Path

Start with:

```bash
forj app # or ./bin/app
```

The generated `app` command hosts enabled runtimes together in one process when `RUNTIME_MODE` is unset or `standalone`.

For a named app, add the app name:

```bash
forj marketplace app # or ./bin/marketplace
```

Use direct runtime commands when you need explicit process boundaries:

```bash
forj api       # or ./bin/app api
forj worker    # or ./bin/app worker
forj scheduler # or ./bin/app scheduler
```

For a named app:

```bash
forj marketplace api       # or ./bin/marketplace api
forj marketplace worker    # or ./bin/marketplace worker
forj marketplace scheduler # or ./bin/marketplace scheduler
```

Named apps get deterministic local defaults, so the default app can listen on `3000`, the first named app on `3001`, and the next named app on `3002` without manual port edits.

## Local Drivers

Prefer local drivers while learning and building the first version of a feature.

Examples:

| Primitive | Local Path |
| --- | --- |
| Cache | memory or file |
| Storage | local or memory |
| Queue | sync or workerpool |
| Events | in-process |
| Database | SQLite when SQL is enabled |
| Mail | log or local SMTP tooling |

The application code should not change when a production driver replaces a local one.

## Upgrade Path

Move to distributed drivers when requirements justify it.

Examples:

- Redis cache for shared cache state
- S3 or GCS storage for shared object storage
- Redis, SQL, NATS, SQS, or RabbitMQ queues for durable or distributed background work
- NATS, Redis, Kafka, Pub/Sub, or SNS events for cross-process fan-out
- Postgres or MySQL for production SQL storage

This should be a configuration and provider-support change, not a business-logic rewrite.

## Development Workflow

Use `forj dev` for watcher-driven local development when the project is configured for it.

Use `forj build` before relying on generated code or binaries:

```bash
forj build
```

Use `route:list`, health checks, readiness, metrics, inspects, and Lighthouse to inspect runtime behavior instead of guessing from logs alone.

## Production Shape

Production runs the built binary form of the same split process shape:

```bash
./bin/app api
./bin/app worker
./bin/app scheduler
```

Named apps use their own binaries:

```bash
./bin/marketplace api
./bin/marketplace worker
./bin/marketplace scheduler
```

The App should not contain business logic that depends on whether these runtimes are hosted together or separately.

## What Local-First Avoids

Local-first docs should avoid:

- requiring Redis, Postgres, object storage, or brokers before the first App works
- presenting distributed topology as the beginner default
- hiding runtime behavior behind package globals
- making local examples use different architecture than production examples
- treating mocks as the primary way to understand framework behavior

## Common Mistakes

::: warning Common mistakes
- Do not use production-only infrastructure in first examples unless the page is specifically about that driver.
- Do not teach low-level package construction before generated App integration.
- Do not make services depend directly on local-only drivers.
- Do not skip regeneration when changing supported drivers.
- Do not treat standalone topology as a toy. It is the normal local and small-deployment path.
:::

## Next Steps

- [Runtime Topology](/core/runtime-topology) explains standalone and distributed runtime modes.
- [Drivers and Adapters](/core/drivers-and-adapters) explains driver selection.
- [Generated Components](/core/generated-components) explains how driver support is compiled into the App.
