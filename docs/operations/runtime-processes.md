---
title: Runtime Processes
description: How HTTP, workers, scheduler, and combined runtime processes start and stop.
---

# Runtime Processes

Runtime processes are the long-running execution surfaces of an App.

Each runtime starts through a command and participates in App startup and shutdown.

## Common Processes

| Process | Built binary | Development alias |
| --- | --- | --- |
| Combined runtime | `./bin/app run` | `forj app` |
| HTTP | `./bin/app api` | `forj api` |
| Queue workers | `./bin/app worker` | `forj worker` |
| Scheduler | `./bin/app scheduler` | `forj scheduler` |

Both forms start the same App command. Use the built binary form for deployment and process supervision. Use the `forj <command>` development surface when you want GoForj to refresh generated code before running the App command. Use `forj run <command>` when you need to force App command execution explicitly.

For a named app, use that app's binary or prefix the app name:

| Process | Built binary | Development alias |
| --- | --- | --- |
| Combined runtime | `./bin/marketplace run` | `forj marketplace app` |
| HTTP | `./bin/marketplace api` | `forj marketplace api` |
| Queue workers | `./bin/marketplace worker` | `forj marketplace worker` |
| Scheduler | `./bin/marketplace scheduler` | `forj marketplace scheduler` |

The app prefix is also how you run app-scoped commands during development:

```bash
forj marketplace route:list
forj marketplace migrate
forj marketplace make:job sync-catalog
```

## Combined Runtime

`run` starts enabled runtimes together.

The runtime host cancels sibling runtimes when one fails and returns the first runtime failure with the runtime name.

## Split Runtime

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

## Common Mistakes

::: warning Common mistakes
- Do not start long-running work from constructors.
- Do not make business behavior depend on process topology.
- Do not assume worker shutdown is instant when jobs are in flight.
- Do not scale scheduler processes like stateless HTTP processes without locks or singleton control.
:::

## Next Steps

- [Runtime Topology](/core/runtime-topology)
- [Queue Workers](/operations/queue-workers)
- [Scheduler Processes](/operations/scheduler-processes)
