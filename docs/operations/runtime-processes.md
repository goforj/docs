---
title: Runtime Processes
description: How HTTP, workers, scheduler, and combined runtime processes start and stop.
---

# Runtime Processes

Runtime processes are the long-running execution surfaces of an App.

Each runtime starts through a command and participates in App startup and shutdown.

## Common Processes

| Process | Command |
| --- | --- |
| Combined runtime | `./bin/app run` |
| HTTP | `./bin/app api` |
| Queue workers | `./bin/app worker` |
| Scheduler | `./bin/app scheduler` |

Each command starts the App lifecycle, runs its owned runtime boundary, and shuts down through the lifecycle manager.

## Combined Runtime

`run` starts enabled runtimes together.

The runtime host cancels sibling runtimes when one fails and returns the first runtime failure with the runtime name.

## Split Runtime

Split runtime commands are useful when production needs:

- independent scaling
- separate restart policy
- scheduler singleton control
- queue worker resource isolation
- source-specific metrics scrape targets

## Shutdown

Shutdown should be bounded and predictable.

Common variables:

```text
APP_SHUTDOWN_TIMEOUT=30s
QUEUE_SHUTDOWN_TIMEOUT=10s
SCHEDULER_SUBPROCESS_SHUTDOWN_TIMEOUT=90s
```

## Common Mistakes

- Do not start long-running work from constructors.
- Do not make business behavior depend on process topology.
- Do not assume worker shutdown is instant when jobs are in flight.
- Do not scale scheduler processes like stateless HTTP processes without locks or singleton control.

## Next Steps

- [Runtime Topology](/core/runtime-topology)
- [Queue Workers](/operations/queue-workers)
- [Scheduler Processes](/operations/scheduler-processes)
