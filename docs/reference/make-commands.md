---
title: Make Command Reference
description: Lookup reference for GoForj make commands, generated files, registration changes, and shared options.
---

# Make Command Reference

This page is the exhaustive lookup for commands that create controllers, commands, jobs, schedules, events, models, migrations, and named queues. Each entry records the files and registration points the command changes.

Use the linked feature guide when you need to implement the generated resource. Use this reference when you need exact placement, wiring, removal, or shared-option behavior.

In a multi-app Project, run make commands through the app that owns the resource:

```bash
forj admin make:controller users
forj admin make:job reports:export
forj admin make:schedule audit:cleanup
```

The app prefix chooses the registration point. `forj admin make:*` creates the generated resource under `internal/...` and writes the registration and Wire changes into `app/admin/...`; unprefixed `forj make:*` creates the resource under `internal/...` and writes registration changes to the default app under `app/...`.

This keeps app composition in the owning app while shared domain code can still live under `internal/...`.

## Choose a Command or Workflow

- [`make:controller`](#make-controller) creates an HTTP controller and registers its routes.
- [`make:app`](#make-app) creates an additional runnable app.
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

### `make:app`

Create an additional app:

```bash
forj make:app admin
```

Without selection flags in an interactive terminal, the command opens the app wizard. In non-interactive use, or when scripting an exact selection, pass flags:

```bash
forj make:app admin --components web-api,jobs
forj make:app statuspage --components web-api,web-ui --starter-kit vue
forj make:app statuspage --components web-api,web-ui --starter-kit vue --component-library off
```

Use `--without` to remove components from the project-derived default selection. Use `--component-library on` or `--component-library off` to include or omit the selected first-party starter kit's component showcase; omission uses the Project-derived, default-on selection. Use `--help-format framework`, `--help-format external_cli`, or `--help-format guided` to choose the App command-help style. `--skip-wire` renders the App files without regenerating Wire; it is intended for generator debugging or a workflow that deliberately runs Wire separately.

The command creates the conventional binary entrypoint under `cmd/admin/`, app-owned composition under `app/admin/`, and app-specific Wire graph under `app/admin/wire/`. Exact files depend on the selected components; a CLI-only app does not receive HTTP, scheduler, or worker files merely because another app has them.

It also records the app's render metadata under top-level `apps` in `.goforj.yml`:

```yaml
apps:
  admin:
    components: [web_api, jobs]
    starter_kit: none
```

When explicitly disabled for a selected starter kit, the App metadata also records:

```yaml
apps:
  statuspage:
    components: [web_api, web_ui]
    starter_kit: vue
    starter_kit_options:
      component_library: false
```

The interactive wizard enrolls an app with HTTP, jobs, or schedules in `forj dev` and proposes the combined `run` command. A CLI-only app remains unenrolled. Review the Dev Run step when the app needs a narrower long-running command.

Flag-driven and non-interactive creation do not enroll the app unless `--dev-run` is explicit:

```bash
forj make:app admin --components web-api,jobs --dev-run run
```

`--dev-run run` selects the development supervisor command; it does not add runtime capabilities. A runtime-capable binary already defaults to `run` when launched without arguments.

Remove only the conventional App files and metadata created by `make:app` with:

```bash
forj make:app admin --remove
```

Removal is conservative and does not delete unknown app-owned files or migration history. See [Apps](/core/apps) for the ownership model and [forj dev](/developer-tools/forj-dev#choose-which-apps-participate) for normal lifecycle configuration.

### `make:controller`

Generate an HTTP controller for the package that owns the route.

<MakeCommandTabs name="controller">
<template #usage>

```bash
forj make:controller reports
```

The name controls both the package path and the starter route, `/reports`.

Prefix the command when an additional app owns the route:

```bash
forj admin make:controller users
```

Remove the generated controller and its managed registrations with:

```bash
forj make:controller reports --remove
```

</template>
<template #files>

```text
internal/reports/controller.go               created
app/wire/inject_http_controllers_app.go      provider added
app/routes.go                                routes registered
```

For an additional app, the generated controller stays under `internal/...`; the two registration files live under the owning app's `app/<name>/...`.

</template>
<template #generated>

The generated controller includes a constructor, starter route, and replaceable handler:

<CodeFile path="internal/reports/controller.go">

<!-- go-example: illustrative-fragment -->
```go
// Controller handles HTTP requests.
type Controller struct {
	logger *logger.AppLogger
}

// NewController creates a Controller.
func NewController(logger *logger.AppLogger) *Controller {
	return &Controller{logger: logger}
}

// Routes returns the HTTP routes handled by Controller.
func (c *Controller) Routes() []web.Route {
	return []web.Route{
		web.NewRoute(http.MethodGet, "/reports", c.Get),
	}
}

// Get handles the controller's GET route.
func (c *Controller) Get(r web.Context) error {
	c.logger.Info().Msg("Hello from reports controller")
	return r.Text(http.StatusOK, "Hello from reports controller")
}
```
</CodeFile>

The HTTP controller Wire set gains the constructor:

<CodeFile path="app/wire/inject_http_controllers_app.go">

<!-- go-example: illustrative-fragment -->
```go
// appHttpControllerSet provides all HTTP route controllers.
var appHttpControllerSet = wire.NewSet(
	reports.NewController, // [!code highlight]
)
```
</CodeFile>

The App route registry receives the controller and appends its routes:

<CodeFile path="app/routes.go">

<!-- go-example: illustrative-fragment -->
```go
// ProvideRoutes provides route groups for the HTTP server.
func ProvideRoutes(
	reportsController *reports.Controller, // [!code highlight]
) []web.RouteGroup {
	publicRoutes := slices.Concat(
		reportsController.Routes(), // [!code highlight]
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

<!-- go-example: illustrative-fragment -->
```go
// SyncCmd handles the reports:sync app command.
type SyncCmd struct {
	logger *logger.AppLogger
}

// Signature keeps command metadata with the implementation so generated wiring stays package-local.
func (*SyncCmd) Signature() string {
	return `name:"reports:sync" help:"Sync command"`
}

// Run is the entrypoint Kong calls after parsing reports:sync.
func (c *SyncCmd) Run(ctx context.Context) error {
	_ = ctx
	c.logger.Info().Msg("SyncCmd executed!")
	return nil
}
```
</CodeFile>

The App Wire set gains the provider:

<CodeFile path="app/wire/inject_cmd_app.go">

<!-- go-example: illustrative-fragment -->
```go
// appCommandSet provides app-owned command providers.
var appCommandSet = wire.NewSet(
	reports.NewSyncCmd, // [!code highlight]
)
```
</CodeFile>

The App command collection exposes it to Kong:

<CodeFile path="app/commands.go">

<!-- go-example: illustrative-fragment -->
```go
// Commands wires application-specific commands into the CLI.
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

<!-- go-example: illustrative-fragment -->
```go
// SyncReportsJobTypeName identifies the job during dispatch and handler registration.
const SyncReportsJobTypeName = "billing:sync-reports"

// SyncReportsJobPayload is the payload for the SyncReportsJob job.
type SyncReportsJobPayload struct {
	// add your payload fields here
}

// SyncReportsJob dispatches and handles its queue workflow.
type SyncReportsJob struct {
	queues *queues.Manager
}

// NewSyncReportsJob constructs the job with the configured queue manager.
func NewSyncReportsJob(queues *queues.Manager) *SyncReportsJob {
	return &SyncReportsJob{queues: queues}
}

// Queue dispatches the typed payload to the selected queue.
func (t *SyncReportsJob) Queue(ctx context.Context, payload SyncReportsJobPayload) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	_, err = t.queues.WithContext(ctx).Dispatch(
		queue.NewJob(SyncReportsJobTypeName).Payload(data).OnQueue("billing"),
	)
	return err
}

// HandleTask processes queue payloads.
func (t *SyncReportsJob) HandleTask(_ context.Context, msg queue.Message) error {
	var p SyncReportsJobPayload
	if err := msg.Bind(&p); err != nil {
		return fmt.Errorf("json.Unmarshal failed: %w", err)
	}
	return nil
}
```
</CodeFile>

The job Wire file gains both construction and runtime registration:

<CodeFile path="app/wire/inject_jobs_app.go">

<!-- go-example: illustrative-fragment -->
```go
// appJobSet provides app-owned jobs and their runtime registration.
var appJobSet = wire.NewSet(
	registerJobHandlers,
	billing.NewSyncReportsJob, // [!code highlight]
)

// registerJobHandlers binds every application job to each configured queue runtime.
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

<!-- go-example: illustrative-fragment -->
```go
// Reports returns the "reports" queue instance.
func (m *Manager) Reports() *queue.Queue {
	return m.reports
}
```
</CodeFile>

That is the complete `make:queue` output: environment configuration plus the accessor produced by the next build or queue generation pass. The following application-owned example shows how a generated job can use that named queue; `make:queue` does not write the job, service, Wire registration, or controller.

Keep the payload beside the generated job and its handler:

<CodeFile path="internal/reports/generate_job.go">

<!-- go-example: illustrative-fragment -->
```go
// GenerateJobTypeName identifies the job during dispatch and handler registration.
const GenerateJobTypeName = "reports:generate"

// GenerateJobPayload is the durable contract passed to the report worker.
type GenerateJobPayload struct {
	ReportID string `json:"report_id"`
}

// GenerateJob handles queued report generation through the application service.
type GenerateJob struct {
	service *Service
}

// NewGenerateJob constructs the worker with the service that owns report generation.
func NewGenerateJob(service *Service) *GenerateJob {
	return &GenerateJob{service: service}
}

// HandleTask decodes the queue message and delegates report generation to the service.
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

<!-- go-example: illustrative-fragment -->
```go
// Service coordinates report persistence, rendering, and asynchronous dispatch.
type Service struct {
	queues   *queues.Manager
	reports  *Repository
	renderer *Renderer
}

// NewService constructs the report service with its queue and domain dependencies.
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

// QueueGeneration dispatches report work through the named reports queue.
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

// Generate reloads the report before rendering so the worker uses current state.
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

<!-- go-example: illustrative-fragment -->
```go
// appSet provides application services to Wire.
var appSet = wire.NewSet(
	reports.NewRenderer,
	reports.NewService,
)
```
</CodeFile>

Wire can then inject the service into a controller, command, job, or other application entry point:

<CodeFile path="internal/reports/controller.go">

<!-- go-example: illustrative-fragment -->
```go
// Controller exposes report operations over HTTP.
type Controller struct {
	service *Service
}

// NewController constructs the HTTP adapter with the report service.
func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

// Generate queues report generation and returns without waiting for the worker.
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
app/wire/inject_schedules_app.go        provider and AppSchedules entry added
```

</template>
<template #generated>

The generated task keeps the schedule identity, interval, and work together:

<CodeFile path="internal/reports/daily_schedule.go">

<!-- go-example: illustrative-fragment -->
```go
// DailySchedule is a scheduled task.
type DailySchedule struct{}

// NewDailySchedule creates a new DailySchedule.
func NewDailySchedule() *DailySchedule {
	return &DailySchedule{}
}

// Name returns the operational schedule name.
func (s *DailySchedule) Name() string {
	return "reports:daily"
}

// Interval returns how often the schedule should run.
func (s *DailySchedule) Interval() (time.Duration, error) {
	return time.ParseDuration("24h")
}

// Handle runs the scheduled task.
func (s *DailySchedule) Handle(ctx context.Context) error {
	return nil
}
```
</CodeFile>

Wire constructs the schedule and adds it to the App's schedule collection. The highlighted lines are injected:

<CodeFile path="app/wire/inject_schedules_app.go">

<!-- go-example: illustrative-fragment -->
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

func ProvideAppSchedules(
	dailySchedule *reports.DailySchedule, // [!code highlight]
) *schedules.AppSchedules {
	return schedules.NewAppSchedules(
		dailySchedule, // [!code highlight]
	)
}
```
</CodeFile>

The App already contains the handoff that makes those entries automatic. `make:schedule` does not modify this file:

<CodeFile path="app/schedules.go">

<!-- go-example: illustrative-fragment -->
```go
// Register attaches app schedules to the scheduler.
func (r *ScheduleRegistry) Register(s *schedules.Scheduler) error {
	if err := r.appSchedules.Register(s); err != nil {
		return err
	}
	return nil
}
```
</CodeFile>

`AppSchedules.Register` iterates the collection and registers each task using its `Name`, `Interval`, and `Handle` methods. Manually defined fluent schedules can still follow that call when they need cron expressions, calendar helpers, or other custom registration.

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

<!-- go-example: illustrative-fragment -->
```go
// InvoicePaidEventTopic is the stable routing key for InvoicePaidEvent.
const InvoicePaidEventTopic = "billing.invoice-paid"

// InvoicePaidEvent is the event payload for InvoicePaidEventTopic.
type InvoicePaidEvent struct {
	// Add event fields.
}

// Topic returns the event bus topic for InvoicePaidEvent.
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

<!-- go-example: illustrative-fragment -->
```go
// InvoicePaidSubscriber handles InvoicePaidEvent messages from the configured event bus.
type InvoicePaidSubscriber struct{}

// NewInvoicePaidSubscriber constructs an InvoicePaidEvent subscriber.
func NewInvoicePaidSubscriber() *InvoicePaidSubscriber {
	return &InvoicePaidSubscriber{}
}

// Handle processes InvoicePaidEvent messages.
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

<!-- go-example: illustrative-fragment -->
```go
// appSubscriberSet contains application-owned event subscriber providers.
var appSubscriberSet = wire.NewSet(
	ProvideEventSubscribers,
	billing.NewInvoicePaidSubscriber, // [!code highlight]
)

// ProvideEventSubscribers registers application subscribers with configured event buses.
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

The positional argument is the exact name of an existing table. The generator inspects `invoices` through the default database connection, so that connection must be available. It does not create or migrate the table, and `make:model` does not select a named connection. The generated Go type and filename are singularized from the inspected table name; when an exact table is missing, the command may suggest an existing singular or plural variant. Models use `--package` rather than `-d` because their placement follows database table ownership.

```bash
forj make:model invoices --package billing --remove
```

If the model already exists, the command updates its schema-derived model definition while preserving the repository section.

By default, an ungrouped model is written under `./internal/models`. Use `--encrypt column_name` or `--compress column_name` to add the corresponding generated field handling; repeat the option or pass comma-separated names for multiple fields.

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

<!-- go-example: illustrative-fragment -->
```go
// InvoiceRepo provides persistence helpers for Invoice.
type InvoiceRepo struct {
	db  *database.Connections
	ctx context.Context
}

// NewInvoiceRepo creates a new Invoice repository.
func NewInvoiceRepo(db *database.Connections) *InvoiceRepo {
	return &InvoiceRepo{db: db}
}
```
</CodeFile>

The repository Wire set gains:

<CodeFile path="app/wire/inject_repositories_app.go">

<!-- go-example: illustrative-fragment -->
```go
// repositorySet is a wire set for generated repositories.
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

See [Naming Conventions](/reference/naming-conventions) for command, job, event, schedule, route, and named resource names.

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

`--remove` resolves the conventional generated path and removes the file at that path; it does not distinguish an untouched generated file from one you later edited. It also removes the matching generated registration entries. Migration removal deletes matching timestamped up/down files by migration name.

Commit or preserve application changes before removal, and inspect `--dry-run` output carefully. Removal does not search for tests, manually added references, or business code elsewhere, so the following build is what exposes remaining dependencies.

After removing a wired resource, rebuild the graph:

```bash
forj build
```

The build exposes application code that still refers to the removed type, route, command, repository, job, schedule, or subscriber.

### Opening Generated Files

Source-generating make commands can open their primary generated file after a successful run:

```bash
forj make:controller reports -o
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

Ungrouped resources use these source-owned defaults:

| Command | Default output |
| --- | --- |
| `make:command` | `./internal/cmd` |
| `make:job` | `./internal/jobs` |
| `make:schedule` | `./internal/schedules` |
| `make:event` | `./internal/events` |
| `make:subscriber` | `./internal/events` |
| `make:model` | `./internal/models` |

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

### What Belongs to You

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
- [Naming Conventions](/reference/naming-conventions) defines stable operational names.
- [Wiring Recipes](/developer-tools/wiring-recipes) shows where generated and hand-written providers belong.
- [CLI Reference](/reference/cli) lists project-level commands and App command patterns.
