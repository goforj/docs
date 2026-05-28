---
title: Scheduler Processes
description: Operational behavior for generated scheduler runtimes.
---

# Scheduler Processes

The scheduler runtime runs recurring work.

Schedules should be named, declarative, and registered in `internal/scheduler/scheduler_registry.go`.

## Start

```bash
./bin/app scheduler
```

or, in standalone mode:

```bash
./bin/app run
```

## Singleton Behavior

Schedulers often need singleton behavior in production.

Stable schedule names are operator-facing identifiers. They are not locks.

For non-overlapping work in one scheduler process, add `WithoutOverlapping()` to the schedule. For non-overlapping work across processes, use `WithoutOverlappingWithLocker(...)` with a shared locker.

Do not run multiple scheduler processes unless your schedules, locks, and deployment topology are designed for it. Generated scheduler registration does not add distributed locking automatically.

## Shutdown

Scheduler subprocess shutdown can use a scheduler-specific timeout:

```text
SCHEDULER_SUBPROCESS_SHUTDOWN_TIMEOUT=90s
```

Keep shutdown behavior bounded and explicit.

## Observability

Generated scheduler integration can emit metrics and inspects and expose schedule state through Lighthouse when enabled.

Use stable schedule names because they become operator-facing identifiers.

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
