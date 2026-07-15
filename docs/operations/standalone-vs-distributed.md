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
./bin/app
```

Runtime-capable generated App binaries default to `run` when launched without arguments, so this is equivalent to `./bin/app run`. No build flag is required.

Explicit commands still win. If a process supervisor starts `./bin/app api`, `./bin/app worker`, or another command, the binary runs that command instead of selecting the standalone runtime. CLI-only App binaries retain root help behavior because they do not have a standalone runtime.

Use it for:

- local development
- demos
- small deployments
- simple operational environments

The bare form is convenient when the deployment unit is one standalone service. Distributed deployments should still start explicit runtime commands so process ownership remains visible.

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

## Choosing the Topology

Topology is selected by the commands your process manager starts:

```bash
./bin/app           # enabled runtimes together
./bin/app api       # HTTP only
./bin/app worker    # workers only
./bin/app scheduler # scheduler only
```

Driver configuration is a separate decision. When API and worker processes need to share cache, queue, events, or files, select backends that cross process boundaries. Changing the process command alone does not make process-local drivers distributed.

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
