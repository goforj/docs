---
title: Commands
description: How to add application commands to generated GoForj Apps.
---

# Commands

Commands are first-class App entry points for developer, operator, and application workflows.

They run through the generated App lifecycle, use injected dependencies, and are exposed through `forj run`.

## Running Commands

Use:

```bash
forj run <command>
```

Examples:

```bash
forj run route:list
forj run hello:world
forj run worker
forj run scheduler
```

The command runs inside the generated App, not as an ad hoc shell script around it.

## Command Shape

Commands define a signature and a `Run` method:

```go
type ReconcileReportsCmd struct {
	service *reports.Service
}

func (*ReconcileReportsCmd) Signature() string {
	return `name:"reports:reconcile" help:"Reconcile report state"`
}

func NewReconcileReportsCmd(service *reports.Service) *ReconcileReportsCmd {
	return &ReconcileReportsCmd{service: service}
}

func (c *ReconcileReportsCmd) Run() error {
	return c.service.Reconcile(context.Background())
}
```

Inject services through the constructor. Keep command code focused on flags, input translation, output, and calling application services.

## Registering Commands

A command needs two registrations:

- a constructor in the command Wire set
- a field in the generated command collection

First, expose the constructor from:

```text
internal/cmd/wire.go
```

Add the constructor to `AppCommandSet`:

```go
var AppCommandSet = wire.NewSet(
	// existing command providers...
	NewReconcileReportsCmd,
)
```

If the command lives in another package, import that package and use its constructor:

```go
var AppCommandSet = wire.NewSet(
	// existing command providers...
	reports.NewReconcileReportsCmd,
)
```

The command constructor should receive application services as parameters. It should not create repositories, managers, clients, or services itself.

Then expose the command through the generated App command collection:

```text
internal/cmd/app_commands.go
```

Add a field to `AppCommands`:

```go
type AppCommands struct {
	// existing commands...
	ReconcileReportsCmd ReconcileReportsCmd `cmd:""`
}
```

Add the command to `NewAppCommands` so Wire can pass it into the command tree:

```go
func NewAppCommands(
	// existing command parameters...
	reconcileReportsCmd *ReconcileReportsCmd,
) *AppCommands {
	return &AppCommands{
		// existing command assignments...
		ReconcileReportsCmd: *reconcileReportsCmd,
	}
}
```

This makes `reports:reconcile` available through the generated App binary and through `forj run reports:reconcile`.

Run:

```bash
forj build
```

This refreshes generation, Wire, API indexing, and the binary.

## Command Responsibilities

Commands are a good fit for:

- explicit operator tasks
- one-off maintenance actions
- local development utilities
- data reconciliation
- bootstrap tasks
- running runtime boundaries such as workers or schedulers

Commands should not become unstructured backdoors around application services.

## Context and Cancellation

For short commands, a background context may be acceptable when the command API does not provide a context.

For long-running or cancellable work, prefer command patterns that receive or create a cancellable context and pass it to services.

Runtime commands such as HTTP, queue workers, and scheduler processes already use runtime-managed contexts.

## Common Mistakes

::: warning Common mistakes
- Do not implement durable application behavior only as a shell script.
- Do not duplicate service workflows inside commands.
- Do not bypass Wire with package globals.
- Do not forget to regenerate wiring after adding command providers.
- Do not hide long-running runtime behavior in a short-lived command accidentally.
:::

## Next Steps

- [Application Services](/applications/services) explains where command behavior should delegate.
- [Runtime Lifecycle](/core/runtime-lifecycle) explains command startup and shutdown.
- [Testing Overview](/testing/overview) explains command test direction.
