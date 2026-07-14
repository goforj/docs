---
title: Logging
description: Operational logging guidance for generated GoForj Apps.
---

# Logging

Logs should make runtime behavior understandable without creating noise.

GoForj favors high-signal startup, shutdown, and degraded-state logs over large boot dumps.

In multi-app Projects, logs should make the app identity visible. A line from `marketplace` should not be mistaken for the default app, especially when `forj dev` is running several apps together.

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

For a named app:

```bash
./bin/marketplace route:list
```

## HTTP Access Logs

Generated HTTP runtimes enable access logs by default. Control them with:

```text
HTTP_ACCESS_LOG_ENABLED=true
```

Each request event retains named fields for URI, method, status, latency, and client IP. Logger configuration carries App identity, while request context can add runtime source and inspect identity.

Console output uses a compact value-oriented line with status-aware color. JSON output and registered log sinks retain the structured field names, so machine processing does not depend on console formatting.

Disable access logs for a runtime where request volume would hide higher-signal events, then rely on metrics and inspects for the intended visibility.

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
- Do not omit app identity from multi-app runtime logs.
:::

## Next Steps

- [Inspects](/operations/inspects)
- [Metrics](/operations/metrics)
- [HTTP Server](/operations/http-server)
