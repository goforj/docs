---
title: Workers
searchTitle: Run a Queue Worker
description: How queue workers run jobs, handle shutdown, and fit into GoForj runtime topology.
---

# Workers

Workers execute queued jobs.

They are the execution side of the queue model: handlers are registered before startup, workers receive named jobs, and handler results become success, retry, or terminal failure outcomes.

## Execution Lifecycle

The worker lifecycle is:

1. construct the App and queue manager
2. register typed job handlers
3. start workers for the selected logical queues
4. deliver each job with cancellation and attempt metadata
5. record logs, metrics, and inspects
6. drain or stop within the shutdown budget

Do not hide handler registration or worker startup in package globals. Generated wiring keeps registration visible and completes it before workers begin delivery.

## Queue Selection

One worker runtime can consume every configured queue or a selected subset. Queue names remain logical App resource names such as `emails` or `reports`; backend physical names and driver configuration stay behind the generated queue manager.

```bash
forj worker --queue emails --queue reports
```

Use named queues when work needs separate concurrency, resources, or operational priority. Process allocation is the default priority mechanism: give urgent queues more workers or their own worker process rather than teaching handlers about topology.

During development, dispatch one safe job through the normal service or command path. Expected result: this worker logs the selected logical queue and the registered handler records a successful outcome. An unknown queue or unregistered job should fail visibly; process existence is not a delivery check.

## Delivery and Retry

Handler errors use the retry budget attached to the job. Retries are not implied by starting a worker, and backend redelivery can still repeat a job after infrastructure failure.

Keep handlers idempotent, use stable payload references, and return terminal errors with `queue.Permanent(err)` when retrying cannot succeed. See [Retries and Idempotency](/async/retries-idempotency) for a runnable policy and test.

## Topology Independence

Workers can run inside the combined `run` Runtime or in explicit `worker` processes. Job and handler code should not change when operations split or scale those processes.

Use the [Queue Workers runbook](/operations/queue-workers) for deployment commands, driver and concurrency configuration, startup verification, shutdown, scaling, and failure response.

The operations handoff should name the exact built command, for example `./bin/app worker --queue emails`, its Driver and worker count from `./bin/app about`, and a supervisor stop timeout longer than `QUEUE_SHUTDOWN_TIMEOUT` plus the App shutdown budget. Verify graceful `SIGTERM` with a safe in-flight job before relying on the drain during a production rollout.

## Next Steps

- [Runtime Topology](/core/runtime-topology) explains process shapes.
- [Jobs](/async/jobs) explains job handlers.
- [Queue Workers](/operations/queue-workers) is the production runbook.
