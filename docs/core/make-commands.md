---
title: Make Commands
description: How GoForj make commands generate resources, place files in owning packages, and update wiring.
---

# Make Commands

Make commands create application resources and update the generated wiring surfaces that expose them.

They are the normal starting point for controllers, commands, jobs, schedules, events, models, and migrations. Generate the resource, review the changed files, then add the product behavior that belongs to your App.

## Package Placement

Make commands prefer colocated packages, but command names should stay operationally short.

Use `category:action` for application command names:

```bash
forj make:command reports:sync
```

This creates a command in:

```text
internal/reports/sync_cmd.go
```

Use two segments unless the extra segment is truly part of the operator-facing command. When the command belongs in a deeper package, keep the command name short and use `-d` to control file placement.

See [Naming Conventions](/core/naming-conventions) for command, job, event, schedule, route, and named resource names.

## Command Map

| Command | Generates | Default package behavior | Updates wiring |
| --- | --- | --- | --- |
| `forj make:controller <name>` | HTTP controller | grouped name maps to `internal/<group>/controller.go` | HTTP controller set and route registry |
| `forj make:command <name>` | App command | grouped name maps to `internal/<group>/<name>_cmd.go` | command set and App command collection |
| `forj make:job <name>` | Queue job | grouped name maps to `internal/<group>/<name>_job.go` | job set |
| `forj make:queue <name>` | Named queue config | updates `.env` queue keys | none |
| `forj make:schedule <name>` | Scheduled task | grouped name maps to `internal/<group>/<name>_schedule.go` | App scheduler set |
| `forj make:event <name>` | Event type | grouped name maps to `internal/<group>/<name>_event.go` | none |
| `forj make:subscriber <name>` | Event subscriber | grouped name maps to `internal/<group>/<name>_subscriber.go` | App event subscriber set |
| `forj make:model <table>` | Model and repository | `--package` controls the model package | repository set |
| `forj make:migration <name>` | SQL migration files | writes to the migrations directory | none |

Some make commands are native GoForj commands and some are generated App commands. During development, use the same `forj` prefix for both. Native GoForj commands win on name collisions; otherwise GoForj delegates to the App through the same source-aware path as `forj run`.

## Examples

Create a controller for a colocated HTTP package:

```bash
forj make:controller billing:reports
```

This creates `internal/billing/reports/controller.go`, wires the controller constructor, and adds the controller routes to the route registry. The default route path follows the grouped name, such as `/billing/reports`.

Create an App command:

```bash
forj make:command reports:sync
```

This creates `internal/reports/sync_cmd.go`, wires the constructor, and exposes the generated command through the App command tree.

Create a colocated job:

```bash
forj make:job billing:sync-reports --queue billing
```

This creates `internal/billing/sync_reports_job.go`, stamps the generated dispatch helper with `OnQueue("billing")`, and wires the job constructor into the generated job set.

Create a named queue:

```bash
forj make:queue reports --workers 2
```

This updates the queue section in `.env` with `QUEUE_REPORTS_NAME=reports` and `QUEUE_REPORTS_WORKERS=2`. Run `forj make:queue` without arguments in an interactive terminal to use the resource wizard.

Create a colocated schedule:

```bash
forj make:schedule reports:daily --every 24h
```

This creates `internal/reports/daily_schedule.go`, wires the schedule constructor into the App-owned `wire/inject_scheduler_schedules.go`, and registers it through the App schedule registry with the `reports:daily` schedule name. If `--every` is omitted, GoForj writes a valid `1h` starter interval that you can edit in the generated file.

Create a colocated event:

```bash
forj make:event billing:invoice-paid
```

This creates `internal/billing/invoice_paid_event.go`. Events are plain application types, so the generated file does not need a Wire registration by itself.

Create a subscriber for a colocated event:

```bash
forj make:subscriber billing:invoice-paid
```

This creates `internal/billing/invoice_paid_subscriber.go`, wires the subscriber constructor into the App-owned `wire/inject_event_subscribers.go`, and subscribes it to the default event bus. Use `--bus audit` to subscribe through a named event bus configured by `EVENTS_AUDIT_DRIVER`.

Create a model in an explicit package:

```bash
forj make:model invoices --package billing
```

This generates the model and repository in the selected package and wires the repository constructor.

Create a database migration:

```bash
forj make:migration create_invoice_tables
```

This writes timestamped SQL migration files for the configured database drivers.

## Output Overrides

Use `-d` when the default grouped package path is not the package you want:

```bash
forj make:command reports:sync -d ./internal/billing/reports
forj make:job billing:sync-reports -d ./internal/ops
forj make:schedule reports:daily -d ./internal/billing/reports
forj make:event billing:invoice-paid -d ./internal/billing/events
forj make:subscriber billing:invoice-paid -d ./internal/billing/events
```

The override controls the file location and package name. The grouped command name can still express the command, job, or event identity.

`make:model` uses `--package` instead of `-d` because models and repositories are generated around database table ownership.

## What Gets Wired

Make commands update the framework-owned files that should not require hand edits for the common path:

- `make:controller` adds the controller provider and route registry entry.
- `make:command` adds the command provider and App command collection entry.
- `make:job` adds the job provider.
- `make:queue` updates `.env` queue resource keys.
- `make:schedule` adds the schedule provider to `wire/inject_scheduler_schedules.go`, which is preserved across re-renders.
- `make:subscriber` adds the subscriber provider and subscription to `wire/inject_event_subscribers.go`, which is preserved across re-renders.
- `make:model` adds the repository provider.

`make:event` and `make:migration` generate files that do not need a provider registration by default.

## What Belongs To You

Generated files are starting points. Your App still owns:

- business logic and service methods
- constructor parameters for application services
- route behavior, validation, and response shape
- command input parsing and console output
- job payloads and handler behavior
- schedule intervals and handler behavior
- event payloads and subscribers
- migration SQL
- model relationships and repository options

Keep dependencies explicit. If a generated controller, command, or job needs an application service, add that service constructor to the right provider set and let Wire pass it in.

## Verify

After running a make command, verify the graph and the exposed runtime surface:

```bash
forj build
forj route:list
```

Use `route:list` for controllers. For commands, run the generated command signature through `forj <command>`. Use `forj run <command>` only when you want to force App command execution explicitly.

## Next Steps

- [Controllers](/applications/controllers) shows the HTTP boundary around services.
- [Commands](/applications/commands) shows App-owned CLI entry points.
- [Naming Conventions](/core/naming-conventions) defines stable operational names.
- [Wiring Recipes](/core/wiring-recipes) shows where generated and hand-written providers belong.
- [CLI Reference](/reference/cli) lists project-level commands and generated App command patterns.
