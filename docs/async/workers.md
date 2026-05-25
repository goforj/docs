---
title: Workers
description: How queue workers run jobs, handle shutdown, and fit into GoForj runtime topology.
---

# Workers

Workers execute queued jobs.

They are long-running runtime processes with explicit startup, shutdown, metrics, and queue configuration.

## Start Workers

Run workers directly:

```bash
forj run worker
```

Run workers with other enabled runtimes in local standalone mode:

```bash
forj run app
```

## Runtime Boundary

The worker command starts the App lifecycle, starts the queue worker runtime, blocks while workers run, and shuts down on cancellation.

This makes workers a clear operational boundary separate from HTTP and scheduler processes when needed.

## Configuration

Common worker-related variables include:

```text
QUEUE_DRIVER=workerpool
QUEUE_WORKERS=30
QUEUE_DEFAULT_QUEUE=default
QUEUE_SHUTDOWN_TIMEOUT=10s
```

Some drivers support additional queue weighting or backend-specific behavior. Use [Queue](/queue) for the full package details.

## Metrics

When metrics are enabled, worker processes can expose a dedicated metrics endpoint. The generated worker command includes metrics configuration when the App has metrics support.

Use metrics, inspects, logs, queue backend state, and Lighthouse to understand worker behavior.

## Scaling

Use standalone mode first for local development.

Use explicit worker processes when production needs:

- independent scaling
- different resource limits
- restart isolation
- separate deploy topology
- queue-specific concurrency tuning

The job code should not change when topology changes.

## Common Mistakes

- Do not run workers from HTTP handlers.
- Do not assume `forj run app` is the only runtime shape.
- Do not start multiple scheduler processes accidentally when scaling workers.
- Do not ignore shutdown timeouts for long-running jobs.
- Do not hide worker startup in constructors or package globals.

## Next Steps

- [Runtime Topology](/core/runtime-topology) explains process shapes.
- [Jobs](/async/jobs) explains job handlers.
- [Operations](/operations/) covers production runtime behavior.
