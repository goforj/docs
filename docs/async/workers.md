---
title: Workers
description: How queue workers run jobs, handle shutdown, and fit into GoForj runtime topology.
---

# Workers

Workers execute queued jobs.

They are long-running runtime processes with explicit startup, shutdown, metrics, and queue configuration.

## Start Workers

Run workers directly:

```bash
forj worker # or ./bin/app worker
```

For a named app, keep the same command shape and add the app name:

```bash
forj marketplace worker # or ./bin/marketplace worker
```

Run workers with other enabled runtimes in local standalone mode:

```bash
forj app # or ./bin/app run
```

For a named app:

```bash
forj marketplace app # or ./bin/marketplace run
```

## Runtime Boundary

The worker command starts the App lifecycle, starts the queue worker runtime, blocks while workers run, and shuts down on cancellation.

This makes workers a clear operational boundary separate from HTTP and scheduler processes when needed.

By default, `worker` starts workers for every configured generated queue. Use `--queue` when a process should work only one named queue:

```bash
forj worker --queue reports # or ./bin/app worker --queue reports
```

For a named app:

```bash
forj marketplace worker --queue sync # or ./bin/marketplace worker --queue sync
```

Repeat the flag to work a subset:

```bash
forj worker --queue emails --queue reports # or ./bin/app worker --queue emails --queue reports
```

## Configuration

Common worker-related variables include:

```text
QUEUE_DRIVER=workerpool
QUEUE_WORKERS=30
QUEUE_NAME=default
QUEUE_SHUTDOWN_TIMEOUT=10s
```

Named queues use `QUEUE_<NAME>_*` variables. If a named queue does not set its own driver, it inherits `QUEUE_DRIVER`.

```text
QUEUE_DRIVER=redis
QUEUE_EMAILS_WORKERS=6
QUEUE_REPORTS_WORKERS=2
```

Prefer named queues for operational priority. Give higher-priority work more worker capacity, and run dedicated `worker --queue <name>` processes when it needs separate scaling, CPU, memory, or deployment policy.

Some drivers support additional backend-specific queue weighting. Keep that as a driver detail; use [Queue](/queue) for the full package behavior.

## Metrics

When metrics are enabled, worker processes can expose a dedicated metrics endpoint. The generated worker command includes metrics configuration when the App has metrics support.

Use metrics, inspects, logs, queue backend state, and Lighthouse to understand worker behavior.

## Scaling

Use standalone mode first for local development.

Use explicit worker processes when production needs:

- independent scaling
- different resource limits
- restart isolation
- separate deploy topology
- queue-specific concurrency tuning
- queue-specific priority through worker allocation

The job code should not change when topology changes.

## Common Mistakes

::: warning Common mistakes
- Do not run workers from HTTP handlers.
- Do not assume `forj app` is the only runtime shape.
- Do not start multiple scheduler processes accidentally when scaling workers.
- Do not ignore shutdown timeouts for long-running jobs.
- Do not hide worker startup in constructors or package globals.
:::

## Next Steps

- [Runtime Topology](/core/runtime-topology) explains process shapes.
- [Jobs](/async/jobs) explains job handlers.
- [Operations](/operations/) covers production runtime behavior.
