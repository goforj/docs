---
title: Queue Workers
description: Operational behavior for queue worker runtimes.
---

# Queue Workers

Queue workers execute registered jobs.

Workers are long-running runtime processes with explicit startup, shutdown, queue selection, metrics, and failure behavior.

## Process Commands

Use the built binary under a supervisor in deployment. For source-aware development commands, see [Queues](/async/queues#workers).

| Scope | Supervised command |
| --- | --- |
| Every configured queue | `./bin/app worker` |
| One queue | `./bin/app worker --queue reports` |
| Admin staff operations | `./bin/admin worker` |
| Combined Runtime | `./bin/app` |

Repeat `--queue` when one process should work a subset. Names remain logical from the selected App's point of view:

```bash
./bin/app worker --queue emails --queue reports
./bin/admin worker --queue reports
```

The `admin` worker example isolates staff-requested report exports from the default App's customer-facing email and report queues.

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

For the staff operations App, inspect the `admin` binary:

```bash
./bin/admin about
```

The queue section should show `admin`'s reports queue, its driver, backend queue name, and worker count.

## Startup Verification

Start the exact supervised command as the deployment service account. Successful startup should identify the worker lifecycle and selected queues without reporting an unregistered handler, unsupported driver, or backend connection failure.

Dispatch one safe test job through the normal application path. Expected result:

- the selected worker receives the named job
- logs, and an Inspect when Inspects are enabled, identify the App, queue, job name, and outcome
- queue metrics record the attempt when metrics are enabled
- a durable backend no longer reports the job as pending after success

Do not use process existence alone as proof that handlers are registered or that the backend is reachable.

## Shutdown

On `SIGINT` or `SIGTERM`, worker shutdown may wait for active jobs or backend cleanup. `QUEUE_SHUTDOWN_TIMEOUT` bounds the queue drain inside the App lifecycle; keep the supervisor stop timeout longer than both the queue and App shutdown budgets.

Useful diagnostics show whether workers are waiting for active work. A forced stop can cause broker redelivery, so jobs must remain idempotent even when normal drains succeed.

## Scaling

Scale workers separately when queue throughput or resource use differs from HTTP.

Job handlers should not care whether workers run inside `run` or in a dedicated `worker` process.

For queue priority, prefer separate named queues and process sizing before reaching for backend-specific weighting knobs.

## Queue Control

Runtime queue controls depend on the selected backend.

Redis-backed queues support the full admin surface today. Other drivers may support only part of the contract or return an unsupported error for admin actions such as listing, retrying, canceling, deleting, clearing, or reading queue history.

Design operational workflows around the backend you deploy, and expose unsupported queue controls clearly in Lighthouse or CLI tooling.

## Failure Modes

| Failure | Behavior | Operator action |
| --- | --- | --- |
| Unsupported or unreachable driver | Worker startup fails or readiness remains degraded. | Verify `QUEUE_SUPPORTED_DRIVERS`, the active driver, credentials, and network reachability. |
| Unknown `--queue` value | The process cannot own the intended queue. | Compare the logical name with `./bin/app about` and the generated accessor configuration. |
| Handler is not registered | Delivery fails instead of running application behavior. | Check `app/wire/inject_jobs_app.go`, rebuild, and restart workers before redispatching. |
| Job repeatedly fails | Attempts consume the configured retry budget and can become terminal. | Inspect the handler error and payload reference before retrying; do not loop operator retries blindly. |
| Shutdown exceeds its budget | The supervisor can force termination while work is active. | Make the job resumable and idempotent, then align queue, App, and supervisor timeouts. |
| Queue depth grows | Work arrives faster than successful processing. | Check failure rate and backend health before adding workers; then scale the affected named queue. |

## Production Checklist

- The artifact includes every active queue driver in `QUEUE_SUPPORTED_DRIVERS`.
- `./bin/app about` reports the intended logical and backend queue names.
- Each worker process owns an explicit queue set and concurrency budget.
- Retry, backoff, timeout, and idempotency behavior is tested for critical jobs.
- The supervisor stop timeout exceeds graceful App and queue shutdown budgets.
- Logs, queue depth, and terminal failures are collected; collect metrics and Inspects when those components are enabled.
- Operator retry and delete actions are limited to drivers that support them.

## Next Steps

- [Workers](/async/workers)
- [Retries and Idempotency](/async/retries-idempotency)
- [Environment Reference](/reference/env-vars#queue)
- [Queue](/queue)
