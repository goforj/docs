---
title: Logging
description: Operational logging guidance for generated GoForj Apps.
---

# Logging

Logs should make runtime behavior understandable without creating noise.

GoForj favors high-signal startup, shutdown, and degraded-state logs over large boot dumps.

## Good Default Logs

Good default-visible logs include:

- HTTP server start and stop
- queue worker start and stop
- scheduler start and stop
- route count summary
- clear degraded-runtime warnings
- dev ready markers

## Debug-Level Chatter

Keep detailed primitive chatter at debug level or behind explicit controls.

Examples:

- per-hook lifecycle detail
- repeated backend connection detail
- low-level driver start and stop noise
- verbose request internals

## Route Logging

Boot should not print the full route table.

Use:

```bash
./bin/app route:list
```

for complete route visibility.

## Timestamps

Console timestamps are controlled by:

```text
APP_LOG_TIME
```

## Common Mistakes

::: warning Common mistakes
- Do not print directly to raw `stderr` from generated managers.
- Do not repeat the same optional-resource warning for every process.
- Do not leak secrets or raw payloads into default logs.
- Do not bury important degraded-state information at trace level.
:::

## Next Steps

- [Inspects](/operations/inspects)
- [Metrics](/operations/metrics)
- [HTTP Server](/operations/http-server)
