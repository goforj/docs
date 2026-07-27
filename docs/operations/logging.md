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

These are the first lines an operator should use to establish process identity and lifecycle. Send the process's standard output and standard error to the platform log collector; do not add a second shell wrapper just to redirect generated App logs.

## Startup and Shutdown Investigation

For a supervised binary, inspect the service manager's captured output first:

```bash
sudo journalctl -u example.service -n 100 --no-pager
```

Expected result: startup identifies the HTTP bind address and route count, while workers and schedulers identify their lifecycle transitions. A normal shutdown includes a shutdown marker; workers can also report active jobs while they wait within their configured budget.

If a combined Runtime exits, look for the first Runtime error rather than assuming all sibling processes failed independently. The Runtime host cancels sibling Runtimes after the first non-cancellation failure.

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

Keep access logs enabled during a new deployment until the request path, status, and latency are understood. If you disable them for steady-state volume, retain an explicit route-level metric and a safe Inspect sampling policy; otherwise a 5xx increase has no request-level path back to an operator.

## Timestamps

Console timestamps are controlled by:

```text
APP_LOG_TIME
```

## Safe Fields and Correlation

Use structured fields that answer an operational question: App identity, Runtime source, route pattern, queue or schedule name, status, and latency. The request context can carry the `trace_id` correlation field used by Inspects, but the product surface is still called an Inspect.

Never log authorization headers, cookies, credentials, raw queue payloads, or unredacted request bodies by default. Local HTTP error-response capture is intentionally local-environment behavior; do not rely on it as a production payload-dump mechanism.

## Failure Modes

| Symptom | Likely meaning | Operator action |
| --- | --- | --- |
| Repeated low-level connection errors | A required dependency may be unreachable, or an optional one may be degraded. | Find the one high-level readiness/degraded warning and repair the dependency; do not alert on every reconnect line. |
| Missing App identity in a multi-App Project | Logs cannot be attributed to the owning App. | Correct logger wiring before using a shared sink for deployment decisions. |
| No request evidence during an incident | Access logs were disabled or not collected. | Use metrics and Inspects immediately; restore a safe access-log policy after the incident. |
| Secret appears in output | A log field or payload capture is unsafe. | Restrict access, rotate the secret, and remove/redact the emitting field. |

## Common Mistakes

::: warning Common mistakes
- Do not print directly to raw `stderr` from generated managers.
- Do not repeat the same optional-resource warning for every process.
- Do not leak secrets or raw payloads into default logs.
- Do not bury important degraded-state information at trace level.
- Do not omit app identity from multi-app runtime logs.
:::

## Production Checklist

- Service output is collected and retained by the platform log system.
- Startup, shutdown, readiness failure, and degraded-resource lines are searchable by App and Runtime.
- Access-log volume is an intentional policy, not accidental suppression.
- Secret and payload redaction has been reviewed for application-owned logs.

## Next Steps

- [Inspects](/operations/inspects)
- [Metrics](/operations/metrics)
- [HTTP Server](/operations/http-server)
