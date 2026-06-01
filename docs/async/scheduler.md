---
title: Scheduler
description: How generated GoForj Apps define recurring work through the scheduler registry.
---

# Scheduler

The Scheduler defines recurring work.

Use it for work that should run on an interval, cron expression, or calendar schedule.

## When To Use Scheduler

| Question | Guidance |
| --- | --- |
| Use this when | Work should begin on a recurring interval, cron expression, or calendar schedule. |
| Avoid this when | The work is event-driven, request-driven, or needs queue durability by itself. |
| Start with | A stable schedule name that calls a domain service or dispatches a named job. |
| Upgrade to | Singleton process policy, distributed locking, and queue-backed work when production overlap or retries matter. |

## Default Recommendation

Use the scheduler to decide when recurring work starts.

| Need | Shape |
| --- | --- |
| Short, idempotent maintenance call | schedule calls a domain service method |
| Durable work with retries | schedule dispatches a named job |
| Operator-visible recurring behavior | stable schedule name plus metrics and inspects |
| High-throughput background processing | queue workers, not scheduler callbacks |

The scheduler should not become the place where business workflows accumulate.

## Registry

Schedule registration lives in:

```text
internal/schedules/scheduler_registry.go
```

Keep the registry declarative.

```go
func (s *Scheduler) Register() error {
	s.DailyAt("04:11").
		Name("auth:sessions:cleanup").
		Do(s.inspectTask("auth:sessions:cleanup", s.authService.Cleanup))

	return nil
}
```

Schedules should have stable names.

Use `category:cadence` for cadence-oriented schedules such as `reports:daily`, or `category:action` for maintenance actions such as `sessions:cleanup`. See [Naming Conventions](/core/naming-conventions) for the full naming map.

## Start Scheduler

Run the scheduler directly:

```bash
forj scheduler
```

Run it with other enabled local runtimes:

```bash
forj app
```

## Target Shape

Schedules should call domain-owned services, jobs, or command work.

Good shape:

```go
s.Every(30).Seconds().
	Name("monitor:poll").
	Do(s.inspectTask("monitor:poll", s.monitorCheckJob.RunScheduledPoll))
```

Avoid growing scheduler runtime files into business-logic buckets.

## Observability

Generated scheduler code can record job outcomes into metrics and inspects when those components are enabled.

Lighthouse can expose schedule metadata and operator controls through runtime-specific integration.

## Production

In production, scheduler runtime usually needs clear singleton behavior or distributed locking when more than one process could run the same schedule.

Stable schedule names make scheduler behavior understandable, but they do not prevent overlap by themselves. Add overlap protection on the schedule when the work cannot run concurrently:

```go
s.EveryFiveMinutes().
	WithoutOverlapping().
	Name("reports:daily").
	Do(s.inspectTask("reports:daily", s.reports.GenerateDaily))
```

Use `WithoutOverlapping()` for same-process overlap control. Use `WithoutOverlappingWithLocker(...)` with a shared locker when multiple scheduler processes could run the same schedule.

Do not scale scheduler processes the same way as stateless HTTP or queue workers unless the schedules and locking strategy support it. Generated scheduler registration does not add distributed locking automatically.

## Common Mistakes

::: warning Common mistakes
- Do not hide important scheduled work behind anonymous callbacks.
- Do not put large business workflows in the scheduler registry.
- Do not run duplicate scheduler processes accidentally.
- Do not assume stable schedule names are a locking mechanism.
- Do not treat schedules as durable queues.
- Do not use unstable names for operator-facing schedules.
:::

## Next Steps

- [Retries and Idempotency](/async/retries-idempotency) explains safe recurring work.
- [Runtime Topology](/core/runtime-topology) explains process boundaries.
- [Naming Conventions](/core/naming-conventions) defines stable schedule names.
- [Scheduler](/scheduler) covers standalone package details.
