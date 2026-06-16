---
title: Standalone versus Distributed
description: How standalone and distributed runtime topology affect operations.
---

# Standalone versus Distributed

GoForj supports standalone and distributed runtime topology.

The App code should not change when topology changes.

## Standalone

Standalone hosts enabled runtimes together:

```bash
./bin/app run
```

Use it for:

- local development
- demos
- small deployments
- simple operational environments

## Default Launch Binaries

For single-process deployments, `forj build --auto-run` can compile standalone launch behavior into the binary:

```bash
forj build --auto-run
```

With that build option, launching the binary with no command starts the App runtime:

```bash
./bin/app
```

This is equivalent to running:

```bash
./bin/app run
```

Explicit commands still win. If a process supervisor starts `./bin/app api`, `./bin/app worker`, or any other command, the binary runs that command instead of the default launch behavior.

Use this when the deployment unit should behave like a normal executable service. Do not use it to hide runtime topology decisions; distributed deployments should still start explicit runtime commands.

## Distributed

Distributed topology starts explicit runtime commands:

```bash
./bin/app api
./bin/app worker
./bin/app scheduler
```

Named apps use their own binaries:

```bash
./bin/marketplace api
./bin/marketplace worker
./bin/marketplace scheduler
```

Use it for:

- independent scaling
- separate restart policies
- scheduler singleton control
- process-specific metrics
- separate resource limits

## Configuration

Topology is selected with:

```text
RUNTIME_MODE=standalone
RUNTIME_MODE=distributed
```

Unknown or empty values normalize to `standalone`.

## Common Mistakes

::: warning Common mistakes
- Do not make services depend on runtime topology.
- Do not scale scheduler processes like HTTP processes by default.
- Do not assume standalone is only for toys.
- Do not assume distributed topology makes jobs more correct without idempotency and backend planning.
:::

## Next Steps

- [Runtime Topology](/core/runtime-topology)
- [Runtime Processes](/operations/runtime-processes)
- [Production Checklist](/operations/production-checklist)
