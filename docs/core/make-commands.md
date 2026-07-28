---
title: Make Commands
description: How GoForj make commands generate resources, place files in owning packages, and update wiring.
---

# Make Commands

Make commands create controllers, commands, jobs, schedules, events, models, migrations, and named queues, then update the wiring and registration files that expose them.

They are the normal starting point for controllers, commands, jobs, schedules, events, models, and migrations. Generate the resource, review the changed files, then add the product behavior that belongs to your App.

In a multi-app Project, run make commands through the app that owns the resource:

```bash
forj marketplace make:controller checkout
forj marketplace make:job sync-catalog
forj backstage make:schedule nightly-cleanup
```

The app prefix chooses the registration point. `forj marketplace make:*` creates the generated resource under `internal/...` and writes the registration and Wire changes into `app/marketplace/...`; unprefixed `forj make:*` creates the resource under `internal/...` and writes registration changes to the default app under `app/...`.

This keeps app composition in the owning app while shared domain code can still live under `internal/...`.

## Choose a Command or Workflow

- [`make:controller`](#make-controller) creates an HTTP controller and registers its routes.
- [`make:command`](#make-command) creates an App command and exposes it to Kong.
- [`make:job`](#make-job) creates a queue job and registers its handler.
- [`make:queue`](#make-queue) creates named queue configuration and a generated accessor.
- [`make:schedule`](#make-schedule) creates and registers a recurring task.
- [`make:event`](#make-event) creates a typed application event.
- [`make:subscriber`](#make-subscriber) creates and registers an event subscriber.
- [`make:model`](#make-model) derives a model and repository from a database table.
- [`make:migration`](#make-migration) creates timestamped up and down SQL files.

Shared workflows apply across those generators:

- [Package placement](#how-package-placement-works) explains grouped names and feature ownership.
- [Removing generated resources](#removing-generated-resources) previews and reverses managed changes.
- [Opening generated files](#opening-generated-files) opens the primary generated source in your editor.
- [Output overrides](#output-overrides) selects a non-default package directory.
- [Ownership and verification](#ownership-and-verification) separates generated scaffolding from App behavior and proves the result.

<span id="command-map"></span>

## Command Reference

Some make commands are native GoForj commands and some are App commands. During development, use the same `forj` prefix for both. Native GoForj commands win on name collisions; otherwise GoForj delegates to the active app through the same source-aware path as `forj run`.

For an additional app, prefix the command with the app name. The generated resource stays under `internal/...`, while registration changes go to the owning app under `app/<name>/...`.

<span id="examples"></span>
<span id="what-gets-wired"></span>

### `make:controller`

Generate an HTTP controller for the package that owns the route.

<MakeCommandTabs name="controller">
<template #usage>

```bash
forj make:controller billing:reports
```

The grouped name controls both the package path and the starter route, `/billing/reports`.

Prefix the command when an additional app owns the route:

```bash
forj marketplace make:controller checkout
```

Remove the generated controller and its managed registrations with:

```bash
forj make:controller billing:reports --remove
```

</template>
<template #files>

```text
internal/billing/reports/controller.go       created
app/wire/inject_http_controllers_app.go      provider added
app/routes.go                                routes registered
```

For an additional app, the generated controller stays under `internal/...`; the two registration files live under the owning app's `app/<name>/...`.

</template>
<template #generated>

The generated controller includes a constructor, starter route, and replaceable handler:

<CodeFile path="internal/billing/reports/controller.go">

```go
type Controller struct {
	logger *logger.AppLogger
}

func NewController(logger *logger.AppLogger) *Controller {
	return &Controller{logger: logger}
}

func (c *Controller) Routes() []web.Route {
	return []web.Route{
		web.NewRoute(http.MethodGet, "/billing/reports", c.Get),
	}
}

func (c *Controller) Get(r web.Context) error {
	c.logger.Info().Msg("Hello from billing reports controller")
	return r.Text(http.StatusOK, "Hello from billing reports controller")
}
```
</CodeFile>

The HTTP controller Wire set gains the constructor:

<CodeFile path="app/wire/inject_http_controllers_app.go">

```go
var appHttpControllerSet = wire.NewSet(
	billingReports.NewController, // [!code highlight]
)
```
</CodeFile>

The App route registry receives the controller and appends its routes:

<CodeFile path="app/routes.go">

```go
func ProvideRoutes(
	billingReportsController *billingReports.Controller, // [!code highlight]
) []web.RouteGroup {
	publicRoutes := slices.Concat(
		billingReportsController.Routes(), // [!code highlight]
	)
	return []web.RouteGroup{
		web.NewRouteGroup("/api/v1", publicRoutes),
	}
}
```
</CodeFile>

</template>
</MakeCommandTabs>

### `make:command`

Generate an App command.

<MakeCommandTabs name="command">
<template #usage>

```bash
forj make:command reports:sync
```

Use `--name` to override the exposed command signature independently from the generated type and file:

```bash
forj make:command Sync -d ./internal/billing/reports --name reports:sync
```

```bash
forj make:command reports:sync --remove
```

</template>
<template #files>

```text
internal/reports/sync_cmd.go      created
app/wire/inject_cmd_app.go        provider added
app/commands.go                   command exposed
```

</template>
<template #generated>

The command keeps its CLI metadata with its implementation:

<CodeFile path="internal/reports/sync_cmd.go">

```go
type SyncCmd struct {
	logger *logger.AppLogger
}

func (*SyncCmd) Signature() string {
	return `name:"reports:sync" help:"Sync command"`
}

func (c *SyncCmd) Run(ctx context.Context) error {
	_ = ctx
	c.logger.Info().Msg("SyncCmd executed!")
	return nil
}
```
</CodeFile>

The App Wire set gains the provider:

<CodeFile path="app/wire/inject_cmd_app.go">

```go
var appCommandSet = wire.NewSet(
	reports.NewSyncCmd, // [!code highlight]
)
```
</CodeFile>

The App command collection exposes it to Kong:

<CodeFile path="app/commands.go">

```go
type Commands struct {
	ReportsSyncCmd reports.SyncCmd `cmd:""` // [!code highlight]
}
```
</CodeFile>

</template>
</MakeCommandTabs>

### `make:job`

Generate a queue job and select its default queue.

<MakeCommandTabs name="job">
<template #usage>

```bash
forj make:job billing:sync-reports --queue billing
```

```bash
forj make:job billing:sync-reports --remove
```

</template>
<template #files>

```text
internal/billing/sync_reports_job.go    created
app/wire/inject_jobs_app.go             provider and handler added
```

</template>
<template #generated>

The generated dispatch helper targets the selected queue:

<CodeFile path="internal/billing/sync_reports_job.go">

```go
const SyncReportsJobTypeName = "billing:sync-reports"

func (t *SyncReportsJob) Queue(ctx context.Context, name string) error {
	var p SyncReportsJobPayload
	payload, err := json.Marshal(p)
	if err != nil {
		return err
	}
	_, err = t.queues.WithContext(ctx).Dispatch(
		queue.NewJob(SyncReportsJobTypeName).Payload(payload).OnQueue("billing"),
	)
	return err
}
```
</CodeFile>

The job Wire file gains both construction and runtime registration:

<CodeFile path="app/wire/inject_jobs_app.go">

```go
var appJobSet = wire.NewSet(
	registerJobHandlers,
	billing.NewSyncReportsJob, // [!code highlight]
)

func registerJobHandlers(
	queueManager *queues.Manager,
	billingSyncReportsJob *billing.SyncReportsJob, // [!code highlight]
) *jobHandlerRegistration {
	queueManager.Register( // [!code highlight]
		billing.SyncReportsJobTypeName, // [!code highlight]
		billingSyncReportsJob.HandleTask, // [!code highlight]
	) // [!code highlight]
	return &jobHandlerRegistration{}
}
```
</CodeFile>

</template>
</MakeCommandTabs>

### `make:queue`

Add a named queue resource.

<MakeCommandTabs name="queue">
<template #usage>

```bash
forj make:queue reports --workers 2
```

Run `forj make:queue` without a name in an interactive terminal to use the resource wizard.

Use `--name production-report-jobs` when the backend queue name should differ from the `reports` resource name. Use `--env-file` to update a file other than `.env`.

```bash
forj make:queue reports --remove
```

Pass the same `--env-file` during removal when creation did not update `.env`.

</template>
<template #files>

```text
.env                               named queue keys added
internal/queues/accessors_gen.go   regenerated on build
```

With `--env-file`, the specified file replaces `.env`. No Wire file changes.

</template>
<template #generated>

The queue resource is environment configuration:

<CodeFile path=".env">

```dotenv
QUEUE_REPORTS_NAME=reports
QUEUE_REPORTS_WORKERS=2
```
</CodeFile>

Using `--name production-report-jobs` changes the first value while the stable resource key remains `REPORTS`.

The next `forj build` or `forj generate --queue` derives a typed accessor from that resource key:

<CodeFile path="internal/queues/accessors_gen.go">

```go
// Reports returns the "reports" queue instance.
func (m *Manager) Reports() *queue.Queue {
	return m.reports
}
```
</CodeFile>

Keep the payload beside the generated job and its handler:

<CodeFile path="internal/reports/generate_job.go">

```go
const GenerateJobTypeName = "reports:generate"

type GenerateJobPayload struct {
	ReportID string `json:"report_id"`
}

type GenerateJob struct {
	service *Service
}

func NewGenerateJob(service *Service) *GenerateJob {
	return &GenerateJob{service: service}
}

func (j *GenerateJob) HandleTask(ctx context.Context, msg queue.Message) error {
	var payload GenerateJobPayload
	if err := msg.Bind(&payload); err != nil {
		return fmt.Errorf("bind generate report payload: %w", err)
	}
	return j.service.Generate(ctx, payload.ReportID)
}
```
</CodeFile>

This example carries an ID because the worker should load the report's current state. That is a good default for mutable records, not a rule for every workload. For high-throughput work, use a bounded batch of IDs or a compact immutable snapshot DTO when avoiding another read matters. Avoid placing persistence models directly on the queue: they tend to create large payloads, stale state, and a queue contract coupled to the database model.

`make:queue` does not create an application service. Inject the queue manager into the service that dispatches the job:

<CodeFile path="internal/reports/service.go">

```go
type Service struct {
	queues   *queues.Manager
	reports  *Repository
	renderer *Renderer
}

func NewService(
	queues *queues.Manager,
	reports *Repository,
	renderer *Renderer,
) *Service {
	return &Service{
		queues:   queues,
		reports:  reports,
		renderer: renderer,
	}
}

func (s *Service) QueueGeneration(ctx context.Context, reportID string) error {
	payload, err := json.Marshal(GenerateJobPayload{ReportID: reportID})
	if err != nil {
		return err
	}

	reports := s.queues.Reports()
	_, err = reports.WithContext(ctx).Dispatch(
		queue.NewJob(GenerateJobTypeName).Payload(payload),
	)
	return err
}

func (s *Service) Generate(ctx context.Context, reportID string) error {
	report, err := s.reports.Find(ctx, reportID)
	if err != nil {
		return err
	}
	return s.renderer.Render(ctx, report)
}
```
</CodeFile>

Register that constructor with the application service set:

<CodeFile path="app/wire/inject_services_app.go">

```go
var appSet = wire.NewSet(
	reports.NewRenderer,
	reports.NewService,
)
```
</CodeFile>

Wire can then inject the service into a controller, command, job, or other application entry point:

<CodeFile path="internal/reports/controller.go">

```go
type Controller struct {
	service *Service
}

func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

func (c *Controller) Generate(r web.Context) error {
	if err := c.service.QueueGeneration(r.Context(), r.Param("reportID")); err != nil {
		return err
	}
	return r.NoContent(http.StatusAccepted)
}
```
</CodeFile>

The dependency direction stays one-way: the reports package imports `internal/queues`, while the App's Wire package imports reports and assembles the graph.

Omit `OnQueue` when dispatching through the direct handle. When application code needs GoForj to translate the logical queue name to an App-prefixed backend name, dispatch through the injected manager and use `.OnQueue("reports")` instead.

</template>
</MakeCommandTabs>

### `make:schedule`

Generate a recurring task.

<MakeCommandTabs name="schedule">
<template #usage>

```bash
forj make:schedule reports:daily --every 24h
```

```bash
forj make:schedule reports:daily --remove
```

If `--every` is omitted, the generated starter interval is `1h`.

</template>
<template #files>

```text
internal/reports/daily_schedule.go      created
app/wire/inject_schedules_app.go        provider added
app/schedules.go                        recurring task registered
```

</template>
<template #generated>

The generated task owns its stable name and interval:

<CodeFile path="internal/reports/daily_schedule.go">

```go
const DailyScheduleName = "reports:daily"
const DailyScheduleInterval = "24h"

func (s *DailySchedule) Name() string {
	return DailyScheduleName
}

func (s *DailySchedule) Handle(ctx context.Context) error {
	return nil
}
```
</CodeFile>

The Wire set gains the provider:

<CodeFile path="app/wire/inject_schedules_app.go">

```go
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

`r.appSchedules.Register(s)` preserves schedules carried by the legacy `AppSchedules` container. New `make:schedule` resources do not enter that container; the command injects the concrete schedule into `ScheduleRegistry` and adds the highlighted recurring registration:

<CodeFile path="app/schedules.go">

```go
type ScheduleRegistry struct {
	appSchedules  *schedules.AppSchedules
	dailySchedule *reports.DailySchedule // [!code highlight]
}

func NewScheduleRegistry(
	appSchedules *schedules.AppSchedules,
	dailySchedule *reports.DailySchedule, // [!code highlight]
) *ScheduleRegistry {
	return &ScheduleRegistry{
		appSchedules:  appSchedules,
		dailySchedule: dailySchedule, // [!code highlight]
	}
}

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

### `make:event`

Generate an application event type.

<MakeCommandTabs name="event">
<template #usage>

```bash
forj make:event billing:invoice-paid
```

```bash
forj make:event billing:invoice-paid --remove
```

Removal deletes the generated type, but it does not remove application code that refers to it.

</template>
<template #files>

```text
internal/billing/invoice_paid_event.go    created
```

Events are plain application types, so no Wire or registration file changes.

</template>
<template #generated>

The generated event converts the grouped name to a dotted stable topic and provides a place for the payload:

<CodeFile path="internal/billing/invoice_paid_event.go">

```go
const InvoicePaidEventTopic = "billing.invoice-paid"

type InvoicePaidEvent struct {
	// Add event fields.
}

func (InvoicePaidEvent) Topic() string {
	return InvoicePaidEventTopic
}
```
</CodeFile>

</template>
</MakeCommandTabs>

### `make:subscriber`

Generate a subscriber for an application event.

<MakeCommandTabs name="subscriber">
<template #usage>

```bash
forj make:subscriber billing:invoice-paid
```

Use `--bus audit` to target a named event bus configured by `EVENTS_AUDIT_DRIVER`.

```bash
forj make:subscriber billing:invoice-paid --remove
```

Pass the same `--bus` value used during creation. Removal deletes the generated subscriber, its provider, and its subscription block.

</template>
<template #files>

```text
internal/billing/invoice_paid_subscriber.go    created
app/wire/inject_subscribers_app.go             provider and subscription added
```

</template>
<template #generated>

The generated subscriber starts with a typed handler:

<CodeFile path="internal/billing/invoice_paid_subscriber.go">

```go
type InvoicePaidSubscriber struct{}

func NewInvoicePaidSubscriber() *InvoicePaidSubscriber {
	return &InvoicePaidSubscriber{}
}

func (s *InvoicePaidSubscriber) Handle(
	ctx context.Context,
	event InvoicePaidEvent,
) error {
	_ = ctx
	_ = event
	return nil
}
```
</CodeFile>

The App Wire file constructs it and performs the subscription:

<CodeFile path="app/wire/inject_subscribers_app.go">

```go
var appSubscriberSet = wire.NewSet(
	ProvideEventSubscribers,
	billing.NewInvoicePaidSubscriber, // [!code highlight]
)

func ProvideEventSubscribers(
	eventManager *events.Manager,
	billingInvoicePaidSubscriber *billing.InvoicePaidSubscriber, // [!code highlight]
) (*EventSubscribersReady, error) {
	billingInvoicePaidSubscriberBus := eventManager.Named("default") // [!code highlight]
	if billingInvoicePaidSubscriberBus == nil { // [!code highlight]
		return nil, fmt.Errorf("event bus %q is not configured", "default") // [!code highlight]
	} // [!code highlight]
	if _, err := billingInvoicePaidSubscriberBus.Subscribe( // [!code highlight]
		billingInvoicePaidSubscriber.Handle, // [!code highlight]
	); err != nil { // [!code highlight]
		return nil, err // [!code highlight]
	} // [!code highlight]
	return &EventSubscribersReady{}, nil
}
```
</CodeFile>

</template>
</MakeCommandTabs>

### `make:model`

Generate a model and repository helpers in an explicit package.

<MakeCommandTabs name="model">
<template #usage>

```bash
forj make:model invoices --package billing
```

The generator inspects the existing `invoices` table through the default database connection, so that connection must be available. Models use `--package` rather than `-d` because their placement follows database table ownership.

```bash
forj make:model invoices --package billing --remove
```

If the model already exists, the command updates its schema-derived model definition while preserving the repository section.

</template>
<template #files>

```text
internal/billing/invoice.go                 created or updated
app/wire/inject_repositories_app.go         repository provider added
```

Removal deletes the model file, including its repository helpers, and removes the provider.

</template>
<template #generated>

Model fields reflect the columns discovered in the `invoices` table. The schema-independent repository portion of the same file starts with:

<CodeFile path="internal/billing/invoice.go">

```go
type InvoiceRepo struct {
	db  *database.Connections
	ctx context.Context
}

func NewInvoiceRepo(db *database.Connections) *InvoiceRepo {
	return &InvoiceRepo{db: db}
}
```
</CodeFile>

The repository Wire set gains:

<CodeFile path="app/wire/inject_repositories_app.go">

```go
var repositorySet = wire.NewSet(
	billing.NewInvoiceRepo, // [!code highlight]
)
```
</CodeFile>

</template>
</MakeCommandTabs>

### `make:migration`

Generate SQL migration files.

<MakeCommandTabs name="migration">
<template #usage>

```bash
forj make:migration create_invoice_tables
```

Use `--connection` for a non-default migration stream. Drivers come from `DB_SUPPORTED_DRIVERS`, falling back to `DB_DRIVER`.

```bash
forj make:migration create_invoice_tables --remove
```

Removal deletes timestamped up and down files matching the migration name.

</template>
<template #files>

A single-driver App using the default connection creates:

```text
migrations/<timestamp>_create_invoice_tables.up.sql
migrations/<timestamp>_create_invoice_tables.down.sql
```

Expanded App layouts write under `migrations/<app>/<connection>/`. Multi-driver Apps add the driver before `.up.sql` and `.down.sql`. No Wire files change.

</template>
<template #generated>

For SQLite, the two starter files contain:

<CodeFile path="migrations/&lt;timestamp&gt;_create_invoice_tables.up.sql">

```sql
-- Up migration (sqlite)
```
</CodeFile>

<CodeFile path="migrations/&lt;timestamp&gt;_create_invoice_tables.down.sql">

```sql
-- Down migration (sqlite)
```
</CodeFile>

The timestamp is UTC in `YYYY_MM_DD_HHMMSS` format. Replace the starter comments with the forward and rollback SQL.

</template>
</MakeCommandTabs>

<span id="package-placement"></span>

## How Package Placement Works

Make commands prefer colocated packages, but command names should stay operationally short.

Use `category:action` for application command names:

```bash
forj make:command reports:sync
```

This creates `internal/reports/sync_cmd.go`. Use two segments unless the extra segment is truly part of the operator-facing command. When the command belongs in a deeper package, keep the command name short and use `-d` to control file placement.

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

This creates a `billingportal` package, not `billing_portal`. File names can use underscores, but package names should remain short lowercase identifiers.

### Organize by package ownership

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

- `forj make:controller reports` creates `internal/reports/controller.go`.
- `forj make:job reports:generate` creates `internal/reports/generate_job.go`.
- `forj make:schedule reports:daily` creates `internal/reports/daily_schedule.go`.

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

## Shared Options

### Removing Generated Resources

Removal uses the same name, package, connection, bus, output, and env-file flags as creation. Pass the same options so the generator resolves the same file and registration entries.

Use `--dry-run` to preview file and wiring cleanup:

```bash
forj make:controller reports --remove --dry-run
```

`--remove` reverses only the files and registration entries managed by the matching make command. It does not inspect or delete business logic, tests, or manually added references.

After removing a wired resource, rebuild the graph:

```bash
forj build
```

The build exposes application code that still refers to the removed type, route, command, repository, job, schedule, or subscriber.

### Opening Generated Files

Source-generating make commands can open their primary generated file after a successful run:

```bash
forj make:controller billing:reports -o
forj make:job billing:sync-reports --open
```

This applies to controllers, commands, events, subscribers, jobs, schedules, models, and migrations. A migration opens its first generated up migration. `make:queue` only updates configuration, so it has no source file to open.

Use `--no-open` to suppress opening for one run. Apps can set:

```dotenv
FORJ_MAKE_OPEN=auto
FORJ_EDITOR=
```

`FORJ_MAKE_OPEN` accepts:

| Value | Behavior |
| --- | --- |
| `auto` | Open only in an interactive terminal when CI is not active. |
| `always` | Try to open after every successful generator run. |
| `never` | Open only when the command explicitly uses `--open` or `-o`. |

Automatic opening stays quiet when it cannot resolve an editor. An explicit `--open`, or `FORJ_MAKE_OPEN=always`, prints a warning instead.

Set `FORJ_EDITOR` to pin the command when automatic detection is not what you want:

```dotenv
FORJ_EDITOR="code --reuse-window --goto {location}"
FORJ_EDITOR="goland --line {line} {file}"
```

The command supports `{file}` for the absolute generated path, `{line}` for the line number, and `{location}` for both as `path:line`. Without `FORJ_EDITOR`, GoForj checks terminal editor hints, then running GUI editors, then commands on `PATH`. Its editor preference is GoLand, Cursor, VS Code, Zed, then IntelliJ IDEA, while preferring an already-running editor over launching a different one.

### Output Overrides

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

## Ownership and Verification

### What Belongs To You

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

### Verify

After running a make command, verify the graph and the exposed runtime surface:

```bash
forj build
forj route:list
```

Use `route:list` for controllers. For commands, run the generated command signature through `forj <command>`. Use `forj run <command>` only when you want to force App command execution explicitly.

### Common Mistakes

::: warning Common mistakes
- Do not create one package per generated file.
- Do not collect every controller, job, command, and service in one global package.
- Do not make operator-facing command names longer merely to mirror package depth.
- Do not use snake case package names.
- Do not put business workflows directly in generated entry points.
- Do not hand-edit generated wiring before using the make command path.
:::

## Next Steps

- [Controllers](/applications/controllers) shows the HTTP boundary around services.
- [Commands](/applications/commands) shows App-owned CLI entry points.
- [Naming Conventions](/core/naming-conventions) defines stable operational names.
- [Wiring Recipes](/core/wiring-recipes) shows where generated and hand-written providers belong.
- [CLI Reference](/reference/cli) lists project-level commands and App command patterns.
