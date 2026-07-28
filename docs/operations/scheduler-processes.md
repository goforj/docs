---
title: Scheduler Processes
description: Operational behavior for generated scheduler runtimes.
---

# Scheduler Processes

The scheduler runtime runs recurring work.

Schedules should be named, declarative, and registered through app-owned schedule composition:

```text
app/schedules.go
app/<app>/schedules.go
```

## Process Commands

| Scope | Built binary | Development alias |
| --- | --- | --- |
| Default App scheduler only | `./bin/app scheduler` | `forj scheduler` |
| Named App scheduler only | `./bin/marketplace scheduler` | `forj marketplace scheduler` |
| Default App combined Runtime | `./bin/app` | `forj app` |
| Named App combined Runtime | `./bin/marketplace` | `forj marketplace app` |

Use the explicit scheduler command in split deployments so process ownership and singleton policy stay visible. Use the built binary under a supervisor; the `forj` aliases are development commands.

## Startup Behavior

At startup, the Runtime registers App-owned schedules before starting the scheduler engine. A registration error exits the process. A successful start emits:

```text
Scheduler started
```

That line proves registration completed and the scheduler loop started. It does not prove a particular task has run.

When metrics are enabled, the explicit scheduler command exposes its dedicated endpoint on `SCHEDULER_METRICS_PORT`, falling back through the generated metrics-port policy. The default App commonly uses `10001`.

## Singleton Behavior

Schedulers often need singleton behavior in production.

Stable schedule names are operator-facing identifiers. They are not locks.

For non-overlapping work in one scheduler process, add `WithoutOverlapping()` to the schedule. For non-overlapping work across processes, use `WithoutOverlappingWithLocker(...)` with a shared locker.

Do not run multiple scheduler processes unless your schedules, locks, and deployment topology are designed for it. Generated scheduler registration does not add distributed locking automatically.

## Shutdown

`SIGINT` or `SIGTERM` cancels the scheduler Runtime. A normal stop emits:

```text
Shutting down scheduler
Scheduler shut down
```

The scheduler engine must stop within `APP_SHUTDOWN_TIMEOUT`. Configure the supervisor stop timeout above that App budget.

Scheduler-owned command tasks have separate child-process controls:

```text
SCHEDULER_COMMAND_TIMEOUT=10m
SCHEDULER_SUBPROCESS_SHUTDOWN_TIMEOUT=90s
```

`SCHEDULER_COMMAND_TIMEOUT` bounds one command task. `SCHEDULER_SUBPROCESS_SHUTDOWN_TIMEOUT` gives an App command launched with scheduler-command origin its own graceful shutdown budget; it does not replace the parent scheduler Runtime's `APP_SHUTDOWN_TIMEOUT`.

## Verify a Deployment

1. Start the exact supervised command as the deployment service account.
2. Confirm `Scheduler started` appears once for the intended App and Runtime.
3. When metrics are enabled, query the dedicated endpoint:

```bash
curl --fail http://127.0.0.1:10001/metrics | grep 'scheduler_'
```

Expected result: Prometheus output contains scheduler metric families. A metric value of zero is valid before the first due run.

4. In Lighthouse, confirm the expected stable schedule names and next-run metadata.
5. Let one safe schedule become due, then confirm its log or Inspect outcome and the scheduler run metrics for that job name.
6. Send `SIGTERM` through the supervisor and confirm both shutdown lines appear before the supervisor timeout.

If metrics or Lighthouse are disabled, use the startup line plus a safe due run recorded in normal logs. Do not shorten a production schedule merely to create a probe.

## Failure Modes

| Failure | Behavior | Operator action |
| --- | --- | --- |
| Schedule registration fails | The process exits before `Scheduler started`. | Fix the invalid interval, cron expression, name, or App wiring, then rebuild and restart. |
| Metrics port is occupied | The explicit scheduler Runtime fails to start its metrics endpoint. | Assign a distinct `SCHEDULER_METRICS_PORT` for the process topology. |
| Duplicate scheduler processes run | The same due work can overlap. | Restore singleton ownership or configure a shared locker with `WithoutOverlappingWithLocker(...)`. |
| A task returns an error | Logs, metrics, and Inspects record a failed run; the schedule itself is not a durable retry queue. | Repair the task or dispatch retryable work to a named job. |
| A command task exceeds its limit | The child command is canceled at `SCHEDULER_COMMAND_TIMEOUT`. | Make the command bounded or move long retryable work to a queue. |
| Shutdown times out | The process returns a scheduler shutdown timeout and the supervisor may force termination. | Align App, subprocess, and supervisor budgets; make interrupted work safe to rerun. |

## Production Checklist

- Exactly one scheduler process owns schedules unless shared locking is deliberate.
- Every schedule has a stable name and an observable success or failure outcome.
- Long or retryable work is dispatched to a named job.
- Scheduler and child-command timeouts match the work and supervisor policy.
- The scheduler metrics port is unique in split topology.
- Logs, metrics, Inspects, and Lighthouse access follow the deployment's retention and security policy.
- Startup, one safe due run, and graceful `SIGTERM` shutdown are verified after release.

## Common Mistakes

::: warning Common mistakes
- Do not put large business workflows in the scheduler registry.
- Do not run duplicate scheduler processes accidentally.
- Do not rely on schedule names alone to prevent overlapping runs.
- Do not use anonymous callbacks for important production schedules.
- Do not treat schedules as queues.
:::

## Next Steps

- [Scheduler](/async/scheduler)
- [Runtime Processes](/operations/runtime-processes)
- [Lighthouse](/operations/lighthouse)
