---
title: Queues
description: How generated GoForj Apps configure default and named queues for background work.
---

# Queues

A Queue is an asynchronous work transport and execution system.

Use queues when work needs to run outside the request path, use workers, retry, delay, timeout, or move across process boundaries.

## Generated Package

Generated queue code lives in:

```text
internal/queues
```

The generated package builds the default queue from `QUEUE_*` variables and optional named queues from `QUEUE_<NAME>_*` variables.

## Accessors

Generated Apps expose queues through default and named accessors:

```go
queue := app.Queue()
critical := app.Queues().Critical()
```

Named accessors are generated invariants. If a named accessor is missing or misaligned with runtime environment, the App should fail fast.

## Driver Configuration

Compile-time support:

```text
QUEUE_SUPPORTED_DRIVERS=workerpool,redis
```

Runtime selection:

```text
QUEUE_DRIVER=workerpool
QUEUE_CRITICAL_DRIVER=redis
QUEUE_DEFAULT_QUEUE=default
QUEUE_WORKERS=30
QUEUE_SHUTDOWN_TIMEOUT=10s
```

Use `sync` or `workerpool` locally. Use durable or broker-backed drivers when production work needs shared state, retries, and independent workers.

## Dispatching Work

Application services usually dispatch jobs through injected job types or queue dependencies.

Do not make HTTP controllers build raw queue payloads when a job type can own the payload shape and dispatch behavior.

## Workers

Start workers with:

```bash
forj run worker
```

In standalone local mode, workers can also be hosted with other enabled runtimes:

```bash
forj run app
```

## Regeneration

After changing supported drivers or named queues, use the normal build path:

```bash
forj build
```

::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
:::

Use focused generation only when you intentionally want to refresh queues without a full build:

```bash
forj generate --queue
```

## Common Mistakes

::: warning Common mistakes
- Do not use events as a replacement for durable queued work.
- Do not dispatch unnamed or anonymous work in docs.
- Do not import backend queue driver packages in business services.
- Do not assume in-process queues behave like distributed queues.
- Do not forget to plan shutdown behavior for long-running workers.
:::

## Next Steps

- [Jobs](/async/jobs) explains job definitions.
- [Workers](/async/workers) explains worker lifecycle.
- [Queue](/queue) covers standalone package details.
