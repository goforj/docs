---
title: Runtime Topology
description: Understand app and runtime process shapes in a GoForj Project.
---

# Runtime Topology

Runtime topology describes how an app's runtimes are hosted: together in one process or split across explicit commands.

Apps and runtimes are different:

- an app is the runnable boundary, such as `app` or `marketplace`
- a runtime is a process role inside an app, such as HTTP, jobs, or scheduler

## Local Default

The default local path is:

```bash
forj app
```

This starts enabled runtimes together for the default app.

For a named app:

```bash
forj marketplace app
```

## Split Runtimes

Run a specific runtime when you want separate process boundaries:

```bash
forj api
forj worker
forj scheduler
```

For a named app:

```bash
forj marketplace api
forj marketplace worker
forj marketplace scheduler
```

The application behavior should not change when you split runtimes. Only process topology changes.

## Built Binaries

Deployment docs use built binaries:

```bash
./bin/app run
./bin/app api
./bin/app worker
./bin/app scheduler
```

Named app binaries follow the app name:

```bash
./bin/marketplace api
./bin/marketplace worker
```

## Runtime Defaults

Generated `internal/runtime/apps.go` gives each app deterministic local defaults.

| App | HTTP | Metrics | Scheduler metrics | Worker metrics |
| --- | ---: | ---: | ---: | ---: |
| `app` | `3000` | `10000` | `10001` | `10002` |
| first named app | `3001` | `10010` | `10011` | `10012` |
| second named app | `3002` | `10020` | `10021` | `10022` |

Named apps do not consume default-app globals such as `PORT=3000`. Override one app with its uppercase app prefix:

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

## Choosing a topology

Use the combined runtime first for:

- local development
- onboarding
- simple deployments

Use split runtimes when:

- HTTP and workers scale independently
- scheduler should run as a singleton
- queue workers need separate resource limits
- process supervision differs by runtime

## Common Mistakes

::: warning Common mistakes
- Do not create a named app just to split HTTP from workers.
- Do not make business logic depend on whether runtimes run together or separately.
- Do not expect process-local drivers to become shared infrastructure in distributed topology.
- Do not run multiple scheduler replicas unless the scheduler and deployment are configured for it.
:::

## Next Steps

- [Apps](/core/apps) explains default and named apps.
- [Runtime Lifecycle](/core/runtime-lifecycle) explains startup and shutdown ordering.
- [Runtime Processes](/operations/runtime-processes) explains production process deployment.
