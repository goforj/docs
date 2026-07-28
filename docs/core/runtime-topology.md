---
title: Runtime Topology
description: Understand when an app runs HTTP, workers, and schedules together or in separate processes.
---

# Runtime Topology

Runtime topology describes whether an app hosts its long-running work in one process or divides that work across independently supervised processes.

Apps and runtimes are different:

- an App is the runnable boundary, such as `app` or `marketplace`
- a Runtime is a process role inside an App, such as HTTP, jobs, or scheduler

## Start with One Process

The default local path keeps HTTP, workers, and the scheduler together:

```bash
forj app
```

This starts enabled runtimes together for the default app.

Select an additional app by name:

```bash
forj marketplace app
```

This is one app with several runtime roles. It is usually the simplest topology for local development and deployments that do not need independent scaling.

## Split Only the Process Boundary

Splitting the app gives HTTP, workers, and the scheduler separate process boundaries. The services, jobs, routes, and schedules do not change. Only the commands started by the process supervisor change.

Use split processes when:

- HTTP and workers scale independently
- the scheduler must run as a singleton
- workers need separate resource limits
- restart or supervision policy differs by runtime

[Runtime Processes](/operations/runtime-processes) shows the production commands, shutdown budgets, and supervision concerns for each process.

## Runtime Defaults

Generated `internal/runtime/apps.go` gives each app deterministic local defaults.

| App | HTTP | Metrics | Scheduler metrics | Worker metrics |
| --- | ---: | ---: | ---: | ---: |
| `app` | `3000` | `10000` | `10001` | `10002` |
| first additional app | `3001` | `10010` | `10011` | `10012` |
| second additional app | `3002` | `10020` | `10021` | `10022` |

Additional apps do not consume default-app globals such as `PORT=3000`. Override one app with its uppercase app prefix:

```text
MARKETPLACE_PORT=3100
MARKETPLACE_METRICS_PORT=10110
```

## Observability Identity

Operational data should preserve:

- project identity
- app identity
- runtime or process role
- instance identity when there are replicas

Metrics scrape labels currently include `app`, `process`, `service`, and `environment`.

## Choose Shared Infrastructure Deliberately

Process topology does not change a process-local driver into shared infrastructure. When API and worker processes must share queues, cache values, events, or files, select a backend that crosses the process boundary.

An additional app is a separate runnable application boundary, not a mechanism for splitting one app's HTTP and worker processes. Keep business behavior independent of topology, and run multiple scheduler replicas only when locking or singleton control makes that safe.

## Next Steps

- [Apps](/core/apps) explains the default app and additional apps.
- [Runtime Lifecycle](/core/runtime-lifecycle) explains startup and shutdown ordering.
- [Runtime Processes](/operations/runtime-processes) explains production process deployment.
