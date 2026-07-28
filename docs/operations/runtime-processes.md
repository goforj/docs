---
title: Runtime Processes
description: How HTTP, workers, scheduler, and combined runtime processes start and stop.
---

# Runtime Processes

Runtime processes are the long-running commands supervised in production.

This page owns the deployable command shapes, process separation, and shutdown behavior. For the conceptual difference between an app and its runtime roles, read [Runtime Topology](/core/runtime-topology).

## Common Processes

| Process | Built binary | Development alias |
| --- | --- | --- |
| Combined runtime | `./bin/app` or `./bin/app run` | `forj app` |
| HTTP | `./bin/app api` | `forj api` |
| Queue workers | `./bin/app worker` | `forj worker` |
| Scheduler | `./bin/app scheduler` | `forj scheduler` |

Both forms start the same App command. Use the built binary form for deployment and process supervision. Use the `forj <command>` development surface when you want GoForj to refresh generated code before running the App command. Use `forj run <command>` when you need to force App command execution explicitly.

For an additional app, use that app's binary or prefix the command with the app name:

| Process | Built binary | Development alias |
| --- | --- | --- |
| Combined runtime | `./bin/marketplace` or `./bin/marketplace run` | `forj marketplace app` |
| HTTP | `./bin/marketplace api` | `forj marketplace api` |
| Queue workers | `./bin/marketplace worker` | `forj marketplace worker` |
| Scheduler | `./bin/marketplace scheduler` | `forj marketplace scheduler` |

The app prefix is also how you run app-scoped commands during development:

```bash
forj marketplace route:list
forj marketplace migrate
forj marketplace make:job sync-catalog
```

## Choose the Processes to Supervise

Topology is selected by the commands the process manager starts; it does not require a build flag or a change to App code.

| Topology | Choose it when |
| --- | --- |
| Standalone | One deployment unit should own the enabled runtimes, as in local development, demos, small deployments, or simple operational environments. |
| Distributed | HTTP, workers, and the scheduler need independent scaling, restart policies, metrics targets, or resource limits. |

Use the combined command in the process table for one standalone service. Distributed deployments should start the explicit `api`, `worker`, and `scheduler` commands so ownership remains visible. Additional apps make the same choice through their own binaries, such as `./bin/marketplace api`.

Driver selection is separate from process topology. If API and worker processes share cache, queue, events, or files, configure backends that cross process boundaries. Splitting commands does not make process-local drivers shared or make jobs correct without idempotency and backend planning.

## Supervise the Combined Runtime

`run` starts enabled runtimes together. A runtime-capable generated binary selects `run` when launched without arguments, so the bare and explicit forms are equivalent.

The runtime host cancels sibling runtimes when one fails and returns the first runtime failure with the runtime name.

Explicit commands still win: `./bin/app api` starts only HTTP rather than selecting `run`. CLI-only App binaries retain root help behavior because they do not have a standalone runtime.

## Supervise Split Runtimes

Split runtime commands are useful when production needs:

- independent scaling
- separate restart policy
- scheduler singleton control
- queue worker resource isolation
- runtime-specific metrics scrape targets

## Shutdown

Shutdown should be bounded and predictable.

Common variables:

```text
APP_SHUTDOWN_TIMEOUT=30s
QUEUE_SHUTDOWN_TIMEOUT=10s
SCHEDULER_SUBPROCESS_SHUTDOWN_TIMEOUT=90s
```

Constructors should build dependencies, not start long-running work. Keep business behavior independent of process topology, allow workers time to finish in-flight jobs, and use locking or singleton control before running multiple schedulers. Splitting processes does not provide shared state or job correctness by itself.

## Next Steps

- [Deployment Basics](/operations/deployment-basics)
- [Queue Workers](/operations/queue-workers)
- [Scheduler Processes](/operations/scheduler-processes)
