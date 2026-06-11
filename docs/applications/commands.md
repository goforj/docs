---
title: Commands
description: How to add application commands to generated GoForj Apps.
---

# Commands

Commands are app entry points for developer, operator, and application workflows.

They run through the generated app lifecycle, use injected dependencies, and are exposed through `forj` and the app binary.

## Running Commands

Use the command name directly for the default app:

```bash
forj route:list
forj reports:reconcile
forj worker
forj scheduler
```

Use the app name first for a named app:

```bash
forj billing route:list
forj billing reports:reconcile
forj billing worker
forj billing scheduler
```

Inside a generated Project, native GoForj commands take precedence. If no native command matches, GoForj delegates to the active app. Use `forj run <command>` when you want to force default app command execution explicitly, and use `./bin/<app> <command>` when running a built binary.

The command runs inside the generated app, not as an ad hoc shell script around it.

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

## Make Commands

Use `forj make:command` when starting a new default app command:

```bash
forj make:command reports:reconcile
```

Use the app prefix for a named app command:

```bash
forj billing make:command reports:reconcile
```

The make command generates the command and injects it into the active app's command wiring surfaces. In the normal flow, you do not hand-edit the command Wire set or command collection just to expose the new command.

Use `category:action` names for application commands:

```bash
forj make:command reports:sync
```

This creates `internal/reports/sync_cmd.go` and exposes the generated command through the app command tree. If the command belongs in a deeper package, keep the command name short and use `-d` for placement:

```bash
forj make:command reports:sync -d ./internal/billing/reports
```

See [Naming Conventions](/core/naming-conventions) for command naming rules and examples.

Review what the make command created or updated:

- the command type owns `Signature`, constructor, and `Run`
- `app/wire/inject_cmd_app.go` provides the command constructor
- `app/commands.go` exposes the command through the default app command tree

For a named app, the same files live under `app/<name>/`.

If the command delegates to an application service, make sure that service is wired through `app/wire/inject_services_app.go` or `app/<name>/wire/inject_services_app.go`. The make command wires the command; application services still belong in the app services set.

Run:

```bash
forj build
forj reports:reconcile
```

For a named app, run:

```bash
forj build
forj billing reports:reconcile
```

`forj build` verifies the generated graph. Running the command verifies the generated `Signature` is exposed through the app command tree. Use the command name from the generated or edited `Signature`.

`forj make:command` checks the current GoForj and generated app command surfaces and rejects names that are already in use, such as `build`, `dev`, `new`, `generate`, and `run`. Choose an app-specific operator name such as `reports:sync` or `billing:reconcile`.

## Registering Commands

`forj make:command` handles command registration for generated commands.

If you are reviewing generated output or wiring a command by hand, a command needs two registrations:

- a constructor in `app/wire/inject_cmd_app.go`
- a field in `app/commands.go`

The command constructor should receive application services as parameters. It should not create repositories, managers, clients, or services itself.

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

- [Make Commands](/core/make-commands) explains grouped package placement and generated wiring updates.
- [Naming Conventions](/core/naming-conventions) defines stable command names.
- [Application Services](/applications/services) explains where command behavior should delegate.
- [Wiring Recipes](/core/wiring-recipes) shows the command wiring flow.
- [Runtime Lifecycle](/core/runtime-lifecycle) explains command startup and shutdown.
- [Testing Overview](/testing/overview) explains command test direction.
