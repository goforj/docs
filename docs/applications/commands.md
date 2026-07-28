---
title: Commands
description: How application commands run, receive dependencies, and delegate to services in GoForj Apps.
---

# Commands

Commands are app entry points for developer, operator, and application workflows.

They run through the App lifecycle, use injected dependencies, and are exposed through `forj` and the App binary.

## Running Commands

Use the command name directly for the default app:

```bash
forj route:list
forj reports:reconcile
forj worker
forj scheduler
```

Use the app name first to select an additional app:

```bash
forj marketplace route:list
forj marketplace reports:reconcile
forj marketplace worker
forj marketplace scheduler
```

Inside a GoForj Project, native GoForj commands take precedence. If no native command matches, GoForj delegates to the active App. Use `forj run <command>` when you want to force default App command execution explicitly, and use `./bin/<app> <command>` when running a built binary.

The command runs inside the App, not as an ad hoc shell script around it.

## Create a Command

<MakeCommandTabs name="application-command">
<template #usage>

Create a command for the default App:

```bash
forj make:command reports:reconcile
```

Prefix the generator when an additional app owns the command:

```bash
forj marketplace make:command reports:reconcile
```

</template>
<template #files>

```text
internal/reports/reconcile_cmd.go    created
app/wire/inject_cmd_app.go           provider added
app/commands.go                      command exposed
```

For an additional app, the generated command stays under `internal/...`; the registration files live under the owning app's `app/<name>/...`.

</template>
<template #generated>

The generated command starts with its CLI signature and the shared App logger:

<CodeFile path="internal/reports/reconcile_cmd.go">

```go
// ReconcileCmd handles the reports:reconcile app command.
type ReconcileCmd struct {
	logger *logger.AppLogger
}

// Signature keeps command metadata with the implementation so generated wiring stays package-local.
func (*ReconcileCmd) Signature() string {
	return `name:"reports:reconcile" help:"Reconcile command"`
}

// NewReconcileCmd receives shared app services through Wire for this command.
func NewReconcileCmd(logger *logger.AppLogger) *ReconcileCmd {
	return &ReconcileCmd{logger: logger}
}

// Run is the entrypoint Kong calls after parsing reports:reconcile.
func (c *ReconcileCmd) Run(ctx context.Context) error {
	_ = ctx
	c.logger.Info().Msg("ReconcileCmd executed!")
	return nil
}
```
</CodeFile>

The generator adds the constructor to the App command provider set:

<CodeFile path="app/wire/inject_cmd_app.go">

```go
// appCommandSet provides app-owned command providers.
var appCommandSet = wire.NewSet(
	reports.NewReconcileCmd, // [!code highlight]
)
```
</CodeFile>

It also exposes the command through the collection Kong parses:

<CodeFile path="app/commands.go">

```go
// Commands wires application-specific commands into the CLI.
type Commands struct {
	ReportsReconcileCmd reports.ReconcileCmd `cmd:""` // [!code highlight]
}

// NewCommands constructs the application command collection.
func NewCommands(
	reportsReconcileCmd *reports.ReconcileCmd, // [!code highlight]
) *Commands {
	return &Commands{
		ReportsReconcileCmd: *reportsReconcileCmd, // [!code highlight]
	}
}
```
</CodeFile>

</template>
</MakeCommandTabs>

Build and run the generated command before replacing its starter behavior:

```bash
forj build
go test ./...
forj reports:reconcile
```

Expected output includes:

```text
ReconcileCmd executed!
```

For an additional app, use `forj marketplace build` and `forj marketplace reports:reconcile`.

Replace the starter body with the application workflow and add its service to the constructor. Wire will satisfy the new dependency after its provider is in the App service set.

The [`make:command` reference](/core/make-commands#make-command) covers output overrides, removal, and the exact registration changes. Keep command code focused on flags, input translation, output, and calling application services.

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

Generated commands can receive the CLI lifecycle context directly. Pass it to the service instead of replacing it with `context.Background()`:

<CodeFile path="internal/reports/reconcile_cmd.go">

```go
// Run delegates reconciliation to the service while preserving CLI cancellation.
func (c *ReconcileCmd) Run(ctx context.Context) error {
	return c.service.Reconcile(ctx)
}
```
</CodeFile>

Long-running services should check cancellation between units of work and pass the same context into repositories and clients:

<CodeFile path="internal/reports/service.go">

```go
// Reconcile processes pending reports until the work completes or the caller cancels.
func (s *Service) Reconcile(ctx context.Context) error {
	reportIDs, err := s.reports.PendingIDs(ctx)
	if err != nil {
		return err
	}

	for _, reportID := range reportIDs {
		if err := ctx.Err(); err != nil {
			return err
		}
		if err := s.reconcileOne(ctx, reportID); err != nil {
			return err
		}
	}
	return nil
}
```
</CodeFile>

The CLI context is cancelled when the command lifecycle stops, including interrupt-driven shutdown. Runtime commands such as HTTP, queue workers, and the scheduler receive the same lifecycle-managed cancellation behavior.

Use `context.Background()` only at a boundary that genuinely has no caller context. A generated command's `Run(ctx context.Context)` method already has one.

## Next Steps

- [`make:command` Reference](/core/make-commands#make-command) shows generation, placement, and wiring.
- [Naming Conventions](/core/naming-conventions) defines stable command names.
- [Application Services](/applications/services) explains where command behavior should delegate.
- [Wiring Recipes](/core/wiring-recipes) shows the command wiring flow.
- [Runtime Lifecycle](/core/runtime-lifecycle) explains command startup and shutdown.
- [Testing](/testing/) explains how command tests fit the broader test strategy.
- [Console](/console) provides standalone messages, ANSI-aware layout, tables, prompts, loaders, and progress for command output.
