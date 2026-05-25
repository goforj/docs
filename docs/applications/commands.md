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

Generated Apps collect application commands in generated command surfaces, commonly under:

```text
internal/cmd
```

Add the command constructor to the relevant provider set so Wire can build it. Then add the command to the App command collection.

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

## Context And Cancellation

For short commands, a background context may be acceptable when the command API does not provide a context.

For long-running or cancellable work, prefer command patterns that receive or create a cancellable context and pass it to services.

Runtime commands such as HTTP, queue workers, and scheduler processes already use runtime-managed contexts.

## Common Mistakes

- Do not implement durable application behavior only as a shell script.
- Do not duplicate service workflows inside commands.
- Do not bypass Wire with package globals.
- Do not forget to regenerate wiring after adding command providers.
- Do not hide long-running runtime behavior in a short-lived command accidentally.

## Next Steps

- [Application Services](/applications/services) explains where command behavior should delegate.
- [Runtime Lifecycle](/core/runtime-lifecycle) explains command startup and shutdown.
- [Testing Overview](/testing/overview) explains command test direction.
