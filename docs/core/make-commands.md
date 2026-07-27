---
title: Make Commands
description: How GoForj make commands generate resources, place files in owning packages, and update wiring.
---

# Make Commands

Make commands create application resources and update the generated wiring surfaces that expose them.

They are the normal starting point for controllers, commands, jobs, schedules, events, models, and migrations. Generate the resource, review the changed files, then add the product behavior that belongs to your App.

In a multi-app Project, run make commands through the app that owns the resource:

```bash
forj marketplace make:controller checkout
forj marketplace make:job sync-catalog
forj backstage make:schedule nightly-cleanup
```

The app prefix chooses the registration point. `forj marketplace make:*` creates the generated resource under `internal/...` and writes the registration and Wire changes into `app/marketplace/...`; unprefixed `forj make:*` creates the resource under `internal/...` and writes registration changes to the default app under `app/...`.

This keeps app composition in the owning app while shared domain code can still live under `internal/...`.

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

### Bare commands

A bare application command is App-wide:

```bash
forj make:command sync
```

It creates `internal/cmd/sync_cmd.go`. Use a grouped name when a feature package owns the command:

```bash
forj make:command reports:sync
```

This creates `internal/reports/sync_cmd.go` and exposes `reports:sync`. If operator naming and package placement differ, keep the command name short and use `-d`:

```bash
forj make:command reports:sync -d ./internal/ops
```

The file moves to `internal/ops/sync_cmd.go`, but the exposed command remains `reports:sync`.

### Go package names

Generated package declarations use compact lowercase Go names. For example:

```bash
forj make:controller BillingPortal
```

creates a `billingportal` package, not `billing_portal`. File names can use underscores, but package names should remain short lowercase identifiers.

## Organize by package ownership

Make commands organize code around the package that owns the behavior, not around global `controllers`, `jobs`, `models`, or `commands` directories.

```text
internal/reports/
  controller.go
  sync_cmd.go
  generate_job.go
  daily_schedule.go
  report_generated_event.go
  report_generated_subscriber.go
  report.go
  service.go
```

Every `.go` file in that directory declares `package reports`, so the package name provides the scope. `Controller`, `SyncCmd`, `GenerateJob`, `DailySchedule`, `Report`, and `Service` are different entry points and collaborators inside one ownership boundary.

Read grouped generator names from left to right:

| Command | Creates |
| --- | --- |
| `forj make:controller reports` | `internal/reports/controller.go` |
| `forj make:job reports:generate` | `internal/reports/generate_job.go` |
| `forj make:schedule reports:daily` | `internal/reports/daily_schedule.go` |

Controllers are package anchors, so the full grouped name becomes the controller package. For jobs and schedules, the leading segments select the package and the final segment names the generated entry point. Start with a flat package such as `internal/reports`; add nesting only when another package boundary clarifies ownership.

The generated entry points should stay thin:

```text
HTTP request      -> reports.Controller                -> reports.Service
CLI command       -> reports.SyncCmd                   -> reports.Service
Queue worker      -> reports.GenerateJob               -> reports.Service
Scheduler process -> reports.DailySchedule             -> reports.Service
Event bus         -> reports.ReportGeneratedSubscriber
```

They translate input, call package services, and return output. Services own workflows and receive repositories, clients, caches, queues, storage, and events through explicit constructor dependencies. Keeping related entry points together makes imports reveal ownership, keeps Wire constructors close to what they construct, and lets a feature move or shrink as one visible unit.

## Command Map

| Command | Generates | Default output and registration |
| --- | --- | --- |
| `forj make:controller <name>` | HTTP controller | Writes `internal/<group>/controller.go`; registers the controller and its routes. |
| `forj make:command <name>` | App command | Writes `internal/<group>/<name>_cmd.go`; adds the command to the App command collection. |
| `forj make:job <name>` | Queue job | Writes `internal/<group>/<name>_job.go`; registers the job provider. |
| `forj make:queue <name>` | Named queue config | Updates the queue keys in `.env`; no Wire registration is needed. |
| `forj make:schedule <name>` | Scheduled task | Writes `internal/<group>/<name>_schedule.go`; adds the schedule to the App scheduler. |
| `forj make:event <name>` | Event type | Writes `internal/<group>/<name>_event.go`; no Wire registration is needed. |
| `forj make:subscriber <name>` | Event subscriber | Writes `internal/<group>/<name>_subscriber.go`; registers the App event subscriber. |
| `forj make:model <table>` | Model and repository | Writes to the package selected by `--package`; registers the repository provider. |
| `forj make:migration <name>` | SQL migration files | Writes timestamped files to the migrations directory; no Wire registration is needed. |

Some make commands are native GoForj commands and some are generated app commands. During development, use the same `forj` prefix for both. Native GoForj commands win on name collisions; otherwise GoForj delegates to the active app through the same source-aware path as `forj run`.

For named apps, the command map is the same, but the registration files change:

```bash
forj marketplace make:controller checkout
```

updates:

```text
internal/checkout/controller.go
app/marketplace/routes.go
app/marketplace/wire/inject_http_controllers_app.go
```

while:

```bash
forj make:controller users
```

updates:

```text
internal/users/controller.go
app/routes.go
app/wire/inject_http_controllers_app.go
```

## Opening Generated Files

File-generating make commands support `--open` and `-o` to open the primary generated file after the command succeeds:

```bash
forj make:controller billing:reports -o
forj make:job billing:sync-reports --open
```

Use `--no-open` to suppress editor opening for a single run. Generated Apps can also set `FORJ_MAKE_OPEN=auto`, `always`, or `never`, and `FORJ_EDITOR` can pin the editor command.

See [Opening Generated Files](/developer-tools/editor-open) for automatic editor detection and configuration.

## Removing Generated Resources

Make commands also support `--remove` when you want to back out a generated resource:

```bash
forj make:controller reports --remove
forj make:command reports:sync --remove
forj make:job reports:generate --remove
forj make:schedule reports:daily --remove
forj make:event reports:report-generated --remove
forj make:subscriber reports:report-generated --remove
forj make:model reports --package reports --remove
forj make:migration create_reports --remove
forj make:queue reports --remove
```

Removal uses the same name, package, and output flags as creation. If you used `-d`, `--package`, `--connection`, or `--bus` when creating the resource, pass the same option when removing it.

Use `--dry-run` to preview the delete and wiring cleanup:

```bash
forj make:controller reports --remove --dry-run
```

`--remove` is deterministic. It removes the generated file and the wiring that the matching make command knows how to add. It does not inspect your business logic, service code, tests, or manually added references.

Removal reverses the default output and registration described in the [Command Map](#command-map). Three cases are worth calling out:

- subscribers also remove their generated event subscription block;
- migrations remove timestamped files matching the migration name;
- named queues remove their generated environment keys.

After removing a wired resource, run:

```bash
forj build
```

This catches any remaining application references that still point at the removed type, command, route, repository, job, schedule, or subscriber.

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

This creates `internal/reports/daily_schedule.go`, wires the schedule constructor into the app-owned `app/wire/inject_schedules_app.go`, and registers it through `app/schedules.go` with the `reports:daily` schedule name. If `--every` is omitted, GoForj writes a valid `1h` starter interval that you can edit in the generated file.

Create a colocated event:

```bash
forj make:event billing:invoice-paid
```

This creates `internal/billing/invoice_paid_event.go`. Events are plain application types, so the generated file does not need a Wire registration by itself.

Create a subscriber for a colocated event:

```bash
forj make:subscriber billing:invoice-paid
```

This creates `internal/billing/invoice_paid_subscriber.go`, wires the subscriber constructor into the app-owned `app/wire/inject_subscribers_app.go`, and subscribes it to the default event bus. Use `--bus audit` to subscribe through a named event bus configured by `EVENTS_AUDIT_DRIVER`.

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
- `make:schedule` adds the schedule provider to `app/wire/inject_schedules_app.go` and the schedule registration to `app/schedules.go`, which are preserved across re-renders.
- `make:subscriber` adds the subscriber provider and subscription to `app/wire/inject_subscribers_app.go`, which is preserved across re-renders.
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

## Common Mistakes

::: warning Common mistakes
- Do not create one package per generated file.
- Do not collect every controller, job, command, and service in one global package.
- Do not make operator-facing command names longer merely to mirror package depth.
- Do not use snake case package names.
- Do not put business workflows directly in generated entry points.
- Do not hand-edit generated wiring before using the make command path.
:::

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
