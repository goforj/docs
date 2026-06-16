---
title: Deployment Basics
description: Baseline deployment model for generated GoForj Apps.
---

# Deployment Basics

A generated GoForj App is a Go application with explicit runtime commands.

Deployment is mostly deciding which binary to run, which runtime commands to start, and which environment variables select infrastructure.

## Build

Build the App:

```bash
forj build
```

`forj build` refreshes generated components, runs Wire, indexes APIs, and builds the binary.

## Runtime Commands

Common production commands:

```bash
./bin/app run
./bin/app api
./bin/app worker
./bin/app scheduler
./bin/app migrate
```

Named apps use their own binaries:

```bash
./bin/marketplace api
./bin/marketplace worker
./bin/marketplace scheduler
./bin/marketplace migrate
```

Use `run` for standalone topology. Use specific runtime commands when HTTP, workers, and scheduler should be separate processes.

## Environment

Set runtime environment through process env, `.env` files, or your deployment platform.

Important areas:

- `APP_ENV`
- `APP_SHUTDOWN_TIMEOUT`
- `RUNTIME_MODE`
- HTTP host and port
- supported and selected drivers
- secrets
- metrics ports
- readiness token

## Deployment Order

Typical order:

1. build the App
2. configure environment
3. run migrations when database schema changed
4. start runtime processes
5. verify health and readiness
6. verify metrics and logs

## Common Mistakes

::: warning Common mistakes
- Do not deploy a binary after changing generated drivers without running `forj build`.
- Do not run every runtime in one process just because local development does.
- Do not start multiple scheduler processes unless the schedules support it.
- Do not make required configuration appear optional.
:::

## Next Steps

- [Runtime Processes](/operations/runtime-processes)
- [Standalone versus Distributed](/operations/standalone-vs-distributed)
- [Production Checklist](/operations/production-checklist)
