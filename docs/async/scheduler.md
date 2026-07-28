---
title: Scheduler
description: How GoForj Apps define recurring work through the scheduler registry.
---

# Scheduler

The Scheduler defines recurring work.

Use it for work that should run on an interval, cron expression, or calendar schedule.

::: info Scheduler API
This guide covers how a GoForj App registers and runs schedules. For standalone construction, the complete fluent API, adapters, and locking options, see the [scheduler library page](/scheduler).
:::

## When To Use Scheduler

Use the scheduler when work should begin on an interval, cron expression, or calendar schedule. Give it a stable name and call a domain service or dispatch a named job.

Use events or request handlers for work triggered by those boundaries. When a scheduled workflow needs durability or retries, let the schedule dispatch a job. Add singleton process policy or distributed locking when overlapping scheduler processes are possible.

## Default Recommendation

Use the scheduler to decide when recurring work starts.

| Need | Shape |
| --- | --- |
| Short, idempotent maintenance call | schedule calls a domain service method |
| Durable work with retries | schedule dispatches a named job |
| Operator-visible recurring behavior | stable schedule name plus metrics and inspects |
| High-throughput background processing | queue workers, not scheduler callbacks |

The scheduler should not become the place where business workflows accumulate.

## Generate a Schedule

<MakeCommandTabs name="async-schedule">
<template #usage>

```bash
forj make:schedule reports:daily --every 24h
```

If `--every` is omitted, the generated starter interval is `1h`.

</template>
<template #files>

```text
internal/reports/daily_schedule.go      created
app/wire/inject_schedules_app.go        provider added
app/schedules.go                        recurring task registered
```

Additional apps use the same registration shape under the owning app's `app/<name>/`.

</template>
<template #generated>

The generated task owns its stable name and interval:

<CodeFile path="internal/reports/daily_schedule.go">

```go
package reports

import (
	"context"
	"fmt"
	"time"
)

// DailyScheduleName is the operational name registered with the scheduler.
const DailyScheduleName = "reports:daily"

// DailyScheduleInterval is the schedule frequency as a Go duration string.
const DailyScheduleInterval = "24h"

// DailySchedule is a scheduled task.
type DailySchedule struct{}

// NewDailySchedule creates a new DailySchedule.
func NewDailySchedule() *DailySchedule {
	return &DailySchedule{}
}

// Name returns the operational schedule name.
func (s *DailySchedule) Name() string {
	return DailyScheduleName
}

// Interval returns how often the schedule should run.
func (s *DailySchedule) Interval() (time.Duration, error) {
	interval, err := time.ParseDuration(DailyScheduleInterval)
	if err != nil {
		return 0, fmt.Errorf("parse schedule interval %s: %w", DailyScheduleName, err)
	}
	return interval, nil
}

// Handle runs the scheduled task.
func (s *DailySchedule) Handle(ctx context.Context) error {
	return nil
}
```
</CodeFile>

The concrete schedule provider is added to the App Wire set:

<CodeFile path="app/wire/inject_schedules_app.go">

```go
// appScheduleSet contains application-owned schedule providers.
var appScheduleSet = wire.NewSet(
	ProvideAppSchedules,
	app.NewScheduleRegistry,
	wire.Bind(
		new(schedules.ScheduleRegistry),
		new(*app.ScheduleRegistry),
	),
	reports.NewDailySchedule, // [!code highlight]
)
```
</CodeFile>

`r.appSchedules.Register(s)` preserves schedules carried by the legacy `AppSchedules` container. New `make:schedule` resources use the direct `ScheduleRegistry` path:

<CodeFile path="app/schedules.go">

```go
// ScheduleRegistry registers scheduled work for this app.
type ScheduleRegistry struct {
	appSchedules  *schedules.AppSchedules
	dailySchedule *reports.DailySchedule // [!code highlight]
}

// NewScheduleRegistry constructs the schedule registry with its injected schedules.
func NewScheduleRegistry(
	appSchedules *schedules.AppSchedules,
	dailySchedule *reports.DailySchedule, // [!code highlight]
) *ScheduleRegistry {
	return &ScheduleRegistry{
		appSchedules:  appSchedules,
		dailySchedule: dailySchedule, // [!code highlight]
	}
}

// Register attaches app schedules to the scheduler.
func (r *ScheduleRegistry) Register(s *schedules.Scheduler) error {
	if err := r.appSchedules.Register(s); err != nil {
		return err
	}
	if err := schedules.RegisterRecurring(s, r.dailySchedule); err != nil { // [!code highlight]
		return err // [!code highlight]
	} // [!code highlight]
	return nil
}
```
</CodeFile>

</template>
</MakeCommandTabs>

## Naming Schedules

Schedules should have stable names.

Use `category:cadence` for cadence-oriented schedules such as `reports:daily`, or `category:action` for maintenance actions such as `sessions:cleanup`. See [Naming Conventions](/core/naming-conventions) for the full naming map.

## Start Scheduler

Run the scheduler directly:

```bash
forj scheduler
```

For an additional app, prefix the command with the app name:

```bash
forj admin scheduler
```

Run it with other enabled local runtimes:

```bash
forj app
```

For an additional app, prefix the command with the app name:

```bash
forj admin app
```

## Recommended Shape

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
- [Environment Reference](/reference/env-vars#scheduler-and-process-shutdown) lists scheduler timeouts.
- [Naming Conventions](/core/naming-conventions) defines stable schedule names.
- [Scheduler](/scheduler) covers standalone package details.
