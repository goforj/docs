---
title: Runtime Topology
description: Understand standalone and distributed runtime shapes in a generated GoForj App.
---

# Runtime Topology

Runtime topology describes how enabled App runtimes are hosted: together in one process or split across explicit runtime commands.

GoForj defaults to a local-first standalone topology while still making production process boundaries explicit.

## Modes

Generated Apps model two runtime modes:

| Mode | Meaning |
| --- | --- |
| `standalone` | Enabled runtimes are hosted together in one process. |
| `distributed` | Runtimes are expected to be launched through explicit runtime commands. |

Unknown or empty values normalize to `standalone`.

The runtime mode is resolved from:

```text
RUNTIME_MODE
```

## Standalone Runtime

The default local path is:

```bash
forj run app
```

This runs the generated App command alias `app`, which gathers enabled runtimes and hosts them together.

Depending on selected components, the combined runtime can include:

- HTTP runtime
- scheduler runtime
- jobs runtime
- metrics endpoint behavior

Standalone is useful for local development, onboarding, demos, and simple process models.

For built binaries, production process commands, and `forj build --auto-run`, use [Standalone versus Distributed](/operations/standalone-vs-distributed).

## Distributed Runtime

Distributed topology uses explicit runtime commands:

```bash
forj run api
forj run worker
forj run scheduler
```

Each command starts the App lifecycle and then runs the selected runtime boundary.

This is useful when an environment wants separate processes, containers, scaling rules, or restart policies for HTTP, workers, and scheduler.

This page uses `forj run ...` because it explains the generated App model through the developer CLI. Deployment docs use `./bin/app ...` because they describe the built binary.

## Runtime Host Behavior

The combined `app` command uses `internal/app.RuntimeHost`.

The runtime host:

- starts all configured runtimes
- gives each runtime a shared cancellable context
- cancels sibling runtimes when the first runtime fails
- returns the first runtime failure with the runtime name
- treats external context cancellation as graceful shutdown

If no runtimes are configured, the host fails instead of silently doing nothing.

## Runtime Identities

Each hosted runtime has a logical identity.

Common identities are:

- `http`
- `jobs`
- `scheduler`

Runtime identities appear in errors, logs, metrics, and inspect records where relevant.

## Choosing A Topology

Use standalone first:

- local development
- quick demos
- onboarding examples
- simple process models

Use explicit runtime commands when:

- HTTP and workers need independent scaling
- scheduler should run as a singleton process
- queue workers need separate resource limits
- production restart policy differs by runtime

The App code should not need to change when topology changes.

## Common Mistakes

- Do not assume `forj run app` is the only production shape.
- Do not make business logic depend on whether HTTP, workers, and scheduler run in one process.
- Do not hide runtime-specific startup in generic helpers when a runtime package owns that process boundary.
- Do not run multiple scheduler processes unless the scheduler and deployment are configured for that behavior.

## Next Steps

- [Runtime Lifecycle](/core/runtime-lifecycle) explains startup and shutdown ordering.
- [Runtime Processes](/operations/runtime-processes) explains production process deployment.
- [Standalone versus Distributed](/operations/standalone-vs-distributed) explains built binary commands and default-launch binaries.
