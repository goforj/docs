---
title: Queue Workers
description: Operational behavior for queue worker runtimes.
---

# Queue Workers

Queue workers execute registered jobs.

Workers are long-running runtime processes with explicit startup, shutdown, queue selection, metrics, and failure behavior.

## Start

```bash
forj run worker
./bin/app worker
```

or, in standalone mode:

```bash
forj run app
./bin/app run
```

The built binary form is what supervisors usually run. The `forj run` form is the development alias that refreshes generated code before running the App command.

Without flags, `worker` starts every configured generated queue. To dedicate a process to one queue:

```bash
forj run worker --queue reports
./bin/app worker --queue reports
```

Repeat the flag when one process should work a subset:

```bash
./bin/app worker --queue emails --queue reports
```

## Configuration

Common variables:

```text
QUEUE_DRIVER=workerpool
QUEUE_WORKERS=30
QUEUE_NAME=default
QUEUE_SHUTDOWN_TIMEOUT=10s
```

Use local drivers for local work. Use durable or broker-backed drivers when production requires them.

Named queues use `QUEUE_<NAME>_*` variables and inherit the root queue driver unless overridden:

```text
QUEUE_DRIVER=redis
QUEUE_EMAILS_WORKERS=6
QUEUE_REPORTS_WORKERS=2
```

Use worker allocation as the normal priority control. A queue with more worker capacity drains faster, and a dedicated `worker --queue <name>` process can be scaled independently from lower-priority work.

Verify queue inventory before deploying a worker topology:

```bash
./bin/app about
```

The queue section should show each queue, its driver, backend queue name, and worker count.

## Shutdown

Worker shutdown may wait for active jobs or backend shutdown behavior.

That is expected when it remains bounded by the configured shutdown budget. Useful diagnostics should show whether workers are waiting for active work.

## Scaling

Scale workers separately when queue throughput or resource use differs from HTTP.

Job handlers should not care whether workers run inside `run` or in a dedicated `worker` process.

For queue priority, prefer separate named queues and process sizing before reaching for backend-specific weighting knobs.

## Queue Control

Runtime queue controls depend on the selected backend.

Redis-backed queues support the full admin surface today. Other drivers may support only part of the contract or return an unsupported error for admin actions such as listing, retrying, canceling, deleting, clearing, or reading queue history.

Design operational workflows around the backend you deploy, and expose unsupported queue controls clearly in Lighthouse or CLI tooling.

## Common Mistakes

::: warning Common mistakes
- Do not run queue workers from HTTP handlers.
- Do not assume shutdown means instant termination.
- Do not ignore idempotency when retries are possible.
- Do not treat workerpool as equivalent to durable distributed queues.
- Do not assume every queue driver supports queue admin operations.
:::

## Next Steps

- [Workers](/async/workers)
- [Retries and Idempotency](/async/retries-idempotency)
- [Queue](/queue)
