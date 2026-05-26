---
title: Queue Workers
description: Operational behavior for queue worker runtimes.
---

# Queue Workers

Queue workers execute registered jobs.

Workers are long-running runtime processes with explicit startup, shutdown, queue selection, metrics, and failure behavior.

## Start

```bash
./bin/app worker
```

or, in standalone mode:

```bash
./bin/app run
```

## Configuration

Common variables:

```text
QUEUE_DRIVER=workerpool
QUEUE_WORKERS=30
QUEUE_DEFAULT_QUEUE=default
QUEUE_SHUTDOWN_TIMEOUT=10s
```

Use local drivers for local work. Use durable or broker-backed drivers when production requires them.

## Shutdown

Worker shutdown may wait for active jobs or backend shutdown behavior.

That is expected when it remains bounded by the configured shutdown budget. Useful diagnostics should show whether workers are waiting for active work.

## Scaling

Scale workers separately when queue throughput or resource use differs from HTTP.

Job handlers should not care whether workers run inside `run` or in a dedicated `worker` process.

## Common Mistakes

::: warning Common mistakes
- Do not run queue workers from HTTP handlers.
- Do not assume shutdown means instant termination.
- Do not ignore idempotency when retries are possible.
- Do not treat workerpool as equivalent to durable distributed queues.
:::

## Next Steps

- [Workers](/async/workers)
- [Retries and Idempotency](/async/retries-idempotency)
- [Queue](/queue)
