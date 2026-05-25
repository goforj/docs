---
title: Standalone Versus Distributed
description: How standalone and distributed runtime topology affect operations.
---

# Standalone Versus Distributed

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

## Distributed

Distributed topology starts explicit runtime commands:

```bash
./bin/app api
./bin/app worker
./bin/app scheduler
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

- Do not make services depend on runtime topology.
- Do not scale scheduler processes like HTTP processes by default.
- Do not assume standalone is only for toys.
- Do not assume distributed topology makes jobs more correct without idempotency and backend planning.

## Next Steps

- [Runtime Topology](/core/runtime-topology)
- [Runtime Processes](/operations/runtime-processes)
- [Production Checklist](/operations/production-checklist)
