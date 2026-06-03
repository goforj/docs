---
title: Organizing Generated Code
description: How GoForj make commands create controllers, commands, jobs, schedules, events, subscribers, and models in owning Go packages.
---

# Organizing Generated Code

GoForj make commands generate code around Go packages.

This follows a common Go pattern: organize by package ownership, not by global resource type.

Many web frameworks teach folders such as `controllers`, `jobs`, `models`, and `commands`. In Go, it is often easier to work in packages where related code lives side by side with the behavior it owns.

```text
internal/reports/
  controller.go
  sync_cmd.go
  generate_job.go
  daily_schedule.go
  report_generated_event.go
  report_generated_subscriber.go
  service.go
  repository.go
```

The package is the boundary. The files inside it are different entry points into the same App behavior.

## What Package Scope Means In Go

Every `.go` file in a directory belongs to the same package when it declares the same package name.

```go
// internal/reports/service.go
package reports

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func DoThing() {}
```

Another file in the same directory is still part of `package reports`:

```go
// internal/reports/sync_cmd.go
package reports

type SyncCmd struct {
	service *Service
}

func NewSyncCmd(service *Service) *SyncCmd {
	return &SyncCmd{service: service}
}
```

Code outside the package imports it and uses the package name as the scope:

```go
package app

import "example.com/app/internal/reports"

func Register() {
	service := reports.NewService()
	_ = reports.NewSyncCmd(service)
	reports.DoThing()
}
```

That `reports.` prefix is the Go package boundary. It is why the generated files are placed beside each other: `Controller`, `SyncCmd`, `GenerateJob`, `DailySchedule`, `Repository`, and `Service` all become names inside the same `reports` package.

## The Mental Model

A package should answer one question:

```text
What part of the App owns this behavior?
```

For example, a reports package might own:

- HTTP handlers for report routes
- CLI commands operators can run
- jobs that do background report work
- schedules that enqueue or run report work
- events the package publishes
- subscribers that react to report-related events
- services and repositories used by those entry points

The controller, command, job, and schedule are not separate architectural layers. They are entry points into the same package-owned behavior.

```text
HTTP request      -> reports.Controller -> reports.Service
CLI command       -> reports.SyncCmd    -> reports.Service
Queue worker      -> reports.GenerateJob -> reports.Service
Scheduler process -> reports.DailySchedule -> reports.Service
Event bus         -> reports.ReportGeneratedSubscriber
```

This keeps the dependency direction simple: entry points call package services, and package services use repositories, clients, caches, queues, storage, or events through explicit constructor dependencies.

## Why This Shape

Go packages are small, named ownership units.

When related files live together:

- names stay shorter because the package provides context
- imports reveal ownership
- Wire constructors stay close to the code they construct
- controllers do not need to know where jobs or repositories live elsewhere
- deleting or moving a feature is easier because the package is visible as a unit

This also makes generated files less mysterious. A make command creates a starting point, wires the constructor where needed, and leaves the package for you to finish.

## Names Become Packages

Most make commands turn the resource name into a package path. Start with flat packages such as `internal/reports`; add nesting only when the extra package boundary is useful.

Read grouped names from left to right:

- package ownership comes first, even when it is a single segment
- the generated resource name usually comes last
- controllers are package anchors, so the whole grouped name becomes the controller package

Examples:

| Command | Creates |
| --- | --- |
| `forj make:controller reports` | `internal/reports/controller.go` |
| `forj make:job reports:generate` | `internal/reports/generate_job.go` |
| `forj make:schedule reports:daily` | `internal/reports/daily_schedule.go` |

For jobs and schedules, `reports` is the package path and `generate` or `daily` is the generated file name. For controllers, `reports` names the controller package itself.

## A Complete Package Example

Start with an HTTP controller:

```bash
forj make:controller reports
# creates internal/reports/controller.go
# injects wire/inject_http_controllers.go
# injects internal/router/routes_registry.go
```

Add an operator command:

```bash
forj make:command reports:sync
# creates internal/reports/sync_cmd.go
# exposes reports:sync
# injects internal/cmd/wire.go
# injects internal/cmd/app_commands.go
```

Add a background job:

```bash
forj make:job reports:generate --queue reports
# creates internal/reports/generate_job.go
# injects wire/inject_jobs_app.go
```

Add a schedule:

```bash
forj make:schedule reports:daily --every 24h
# creates internal/reports/daily_schedule.go
# injects wire/inject_scheduler_schedules.go
```

Add an event and subscriber:

```bash
forj make:event reports:report-generated
# creates internal/reports/report_generated_event.go

forj make:subscriber reports:report-generated
# creates internal/reports/report_generated_subscriber.go
# injects wire/inject_event_subscribers.go
```

Add a model and repository:

```bash
forj make:model reports --package reports
# creates internal/reports/report.go
# wires ReportRepo in wire/inject_repositories.go
```

The package starts to look like this:

```text
internal/reports/
  controller.go
  daily_schedule.go
  generate_job.go
  report.go
  report_generated_event.go
  report_generated_subscriber.go
  sync_cmd.go
```

You would usually add service code beside those files:

```text
internal/reports/
  service.go
  report.go
```

The generated files are entry points and adapters. The service owns the workflow.

## Commands Are Slightly Different

Application command names are operator-facing names.

Prefer short command names:

```bash
forj make:command reports:sync
```

This creates:

```text
internal/reports/sync_cmd.go
```

and exposes the command as:

```text
reports:sync
```

If the command belongs somewhere other than its default package, keep the command name short and use `-d` for placement:

```bash
forj make:command reports:sync -d ./internal/ops
```

That creates `internal/ops/sync_cmd.go` while still exposing `reports:sync`. Use command names for operator meaning, not as a full package path.

## Bare Commands Stay In internal/cmd

A bare command is treated as a top-level App command:

```bash
forj make:command sync
```

Creates:

```text
internal/cmd/sync_cmd.go
```

That is useful for simple App-wide commands. It does not create `internal/sync` because a single word does not necessarily describe a package boundary.

Use a grouped name or `-d` when the command belongs to a feature package. These are equivalent:

```bash
forj make:command reports:sync
forj make:command sync -d ./internal/reports --name reports:sync
```

Both create `internal/reports/sync_cmd.go` and expose the command as `reports:sync`. The first form derives placement from the grouped command name. The second form keeps the generated type name short and sets placement/signature explicitly.

## Package Names Are Go Names

Generated package directories and package declarations use compact lowercase Go names.

```bash
forj make:controller BillingPortal
```

Creates a package named:

```text
billingportal
```

not:

```text
billing_portal
```

That matches normal Go package style. File names can still use underscores, but package names should be short lowercase identifiers.

## What Each Make Command Adds

| Command | Package behavior |
| --- | --- |
| `make:controller reports` | creates `internal/reports/controller.go` |
| `make:command reports:sync` | creates `internal/reports/sync_cmd.go` and exposes `reports:sync` |
| `make:job reports:generate` | creates `internal/reports/generate_job.go` |
| `make:schedule reports:daily` | creates `internal/reports/daily_schedule.go` |
| `make:event reports:report-generated` | creates `internal/reports/report_generated_event.go` |
| `make:subscriber reports:report-generated` | creates `internal/reports/report_generated_subscriber.go` |
| `make:model reports --package reports` | creates `internal/reports/report.go` and wires `ReportRepo` |
| `make:migration create_reports` | creates migration files in `migrations/` |

`make:queue` is resource configuration rather than package generation. It updates queue environment keys.

## Removing Generated Package Entries

Use `--remove` with the same make command when a generated entry point no longer belongs in the package:

```bash
forj make:job reports:generate --remove
forj make:schedule reports:daily --remove
forj make:subscriber reports:report-generated --remove
```

The command removes the generated file and the wiring it knows how to manage. For colocated packages, that usually means the package gets smaller without forcing you to hunt through Wire files manually.

`--remove` does not delete the package directory, service code, repositories, tests, or hand-written references. That is intentional: those files are App-owned code, and GoForj should not guess whether they still matter.

Run `forj build` after removal. If application code still imports or references the removed type, the build will point at the remaining work.

## A Good Package Shape

A useful package usually has entry points near the top and workflow code underneath:

```text
internal/reports/
  controller.go              # HTTP entry point
  sync_cmd.go                # CLI entry point
  generate_job.go            # queue entry point
  daily_schedule.go          # scheduler entry point
  report.go                  # model and repository helpers
  report_generated_event.go  # event contract
  report_generated_subscriber.go # event entry point

  service.go                 # workflow behavior
```

The entry points should stay thin. They translate input, call services, and return output.

The service should own the business workflow:

```go
package reports

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}
```

If a generated controller, command, job, or schedule needs `*Service`, add it to the constructor and wire `NewService` through the App services provider set.

## Common Mistakes

::: warning Common mistakes
- Do not create one package per file just because a generator can.
- Do not put all controllers, jobs, commands, and services in one global package.
- Do not make command names longer just to mirror package depth.
- Do not use snake case package names.
- Do not put business workflows directly in generated entry points.
- Do not hand-edit generated wiring before trying the make command path.
:::

## Next Steps

- [Make Commands](/core/make-commands) lists each generator and the wiring it updates.
- [Naming Conventions](/core/naming-conventions) explains stable runtime names.
- [Wiring Recipes](/core/wiring-recipes) shows where service providers belong.
- [Controllers](/applications/controllers) explains HTTP entry points.
- [Commands](/applications/commands) explains App CLI entry points.
