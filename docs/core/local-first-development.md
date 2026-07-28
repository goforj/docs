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
forj app
```

The generated `app` command hosts enabled runtimes together in one process. Topology comes from the command you launch, not an environment mode switch.

For an additional app, add the app name:

```bash
forj admin app
```

Use direct runtime commands when you need explicit process boundaries:

```bash
forj api
forj worker
forj scheduler
```

Select an additional app by name:

```bash
forj admin api
forj admin worker
forj admin scheduler
```

Apps get deterministic per-app local defaults, so the default app can listen on `3000`, the first additional app on `3001`, and the next additional app on `3002` without manual port edits.

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

The application code should not change when a production driver replaces a local one. If that driver is already included in `*_SUPPORTED_DRIVERS`, the switch needs runtime configuration and a restart rather than regenerated business code.

## Upgrade Path

Move to distributed drivers when requirements justify it.

Examples:

- Redis cache for shared cache state
- S3 or GCS storage for shared object storage
- Redis, SQL, NATS, SQS, or RabbitMQ queues for durable or distributed background work
- NATS, Redis, Kafka, Pub/Sub, or SNS events for cross-process fan-out
- Postgres or MySQL for production SQL storage

This should be a configuration and provider-support change, not a business-logic rewrite. Adding a driver that is not already supported also requires regeneration and a new build.

## Development Workflow

Use `forj dev` for watcher-driven local development. Each entry under `dev.apps` controls that App's managed build and runtime participation; sibling `dev.watches` remain independent.

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

Additional apps use their own binaries:

```bash
./bin/admin api
./bin/admin worker
./bin/admin scheduler
```

The App should not contain business logic that depends on whether these runtimes are hosted together or separately.

## What Local-First Avoids

Local-first docs should avoid:

- requiring Redis, Postgres, object storage, or brokers before the first App works
- presenting distributed topology as the beginner default
- hiding runtime behavior behind package globals
- making local examples use different architecture than production examples
- treating mocks as the primary way to understand framework behavior

## Next Steps

- [Runtime Topology](/core/runtime-topology) explains combined and split process shapes.
- [Drivers and Adapters](/core/drivers-and-adapters) explains driver selection.
- [Generated Components](/core/code-generation) explains how driver support is compiled into the App.
