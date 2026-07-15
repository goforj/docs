---
title: Queues
description: How generated GoForj Apps configure default and named queues for background work.
---

# Queues

A Queue is an asynchronous work transport and execution system.

Use queues when work needs to run outside the request path, use workers, retry, delay, timeout, or move across process boundaries.

## When To Use Queues

| Question | Guidance |
| --- | --- |
| Use this when | Work should run outside the request path or be processed by workers. |
| Avoid this when | The result must be available before returning the current response. |
| Start with | `sync` or `workerpool` for one-process local development. |
| Upgrade to | SQLite, Redis, SQL, NATS, SQS, RabbitMQ, or another shared backend when API and workers split or work needs durable state. |

## Generated Package

Generated queue code lives in:

```text
internal/queues
```

The generated package builds the default queue from `QUEUE_*` variables and optional named queues from `QUEUE_<NAME>_*` variables.

Create a named queue with:

```bash
forj make:queue reports --workers 2
```

This updates the queue section in `.env`:

```text
QUEUE_REPORTS_NAME=reports
QUEUE_REPORTS_WORKERS=2
```

Run `forj make:queue` without arguments in an interactive terminal to use the resource wizard. Use `--name` only when the backend queue name should differ from the App-facing queue name:

```bash
forj make:queue reports --workers 2 --name production-report-jobs
```

## Accessors

Generated Apps expose queues through default and named accessors:

```go
queue := app.Queue()
critical := app.Queues().Critical()
```

Named accessors are generated invariants. If a named accessor is missing or misaligned with runtime environment, the App should fail fast.

Use named queues when the App has distinct classes of work. For example, `emails`, `reports`, and `critical` can each have their own generated accessor, backend configuration, worker count, metrics labels, and operational process.

One generated queue resource represents one queue. The resource name is the app-facing queue name, and by default it is also the backend queue name. Use `QUEUE_<NAME>_NAME` only when the backend queue name must differ.

In a multi-app Project, app code still uses the logical queue name, such as `reports`. Named apps physicalize backend names with an app prefix by default so two apps do not collide on the same backend queue.

For example, the `marketplace` app can dispatch to logical queue `default` while the backend queue is physicalized as `marketplace_default`. Application code still says `default`; GoForj owns the app-aware backend naming.

## Driver Configuration

Compile-time support:

```text
QUEUE_SUPPORTED_DRIVERS=workerpool,redis
```

Runtime selection:

```text
QUEUE_DRIVER=workerpool
QUEUE_CRITICAL_DRIVER=redis
QUEUE_NAME=default
QUEUE_WORKERS=30
QUEUE_SHUTDOWN_TIMEOUT=10s
```

Use `sync` or `workerpool` locally. Use durable or broker-backed drivers when production work needs shared state, retries, and independent workers.

Named queues inherit the root queue driver unless they override it:

```text
QUEUE_DRIVER=redis
QUEUE_EMAILS_WORKERS=6
QUEUE_REPORTS_WORKERS=2
```

In this example, both named queues use Redis. `emails` gets more worker capacity than `reports`, so it is prioritized by runtime allocation rather than by leaking backend-specific weighting into the main App model.

Use `about` to verify what the App will run:

```bash
forj about # or ./bin/app about
```

The queue section shows the app queue name, driver, backend queue name, and worker count. For example, `reports` may show `Queue Name: reports`, `Driver: redis`, and `Workers: 2`.

## Dispatching Work

Application services usually dispatch jobs through injected job types or queue dependencies.

Do not make HTTP controllers build raw queue payloads when a job type can own the payload shape and dispatch behavior.

When generating a job, pass `--queue` to stamp the generated dispatch helper:

```bash
forj make:job reports:generate --queue reports
```

Generated jobs dispatch through the Queue manager. For manual dispatch, pass the logical name such as `reports` to `Manager.Dispatch`; the manager selects that generated runtime and applies its configured physical backend name, including the App prefix for a named App.

Named accessors such as `app.Queues().Reports()` expose the direct runtime handle for worker lifecycle, readiness, and driver inspection. If low-level code dispatches through that handle, omit `OnQueue` so the handle uses its configured physical default. Supplying the logical name directly to the low-level handle bypasses App namespace translation.

## Workers

Start workers with:

```bash
forj worker # or ./bin/app worker
```

For a named app:

```bash
forj marketplace worker # or ./bin/marketplace worker
```

Without `--queue`, the worker process starts workers for every configured generated queue. To run only one queue:

```bash
forj worker --queue reports # or ./bin/app worker --queue reports
```

Repeat `--queue` to run a subset:

```bash
forj worker --queue emails --queue reports # or ./bin/app worker --queue emails --queue reports
```

In standalone local mode, workers can also be hosted with other enabled runtimes:

```bash
forj app # or ./bin/app
```

## Regeneration

After changing supported drivers or named queues, use the normal build path:

```bash
forj build
```

::: info Dev Loop
When this App is listed in `dev.apps`, its build lifecycle normally runs `forj build` for you.
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
