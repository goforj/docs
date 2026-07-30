---
title: Metrics
description: Operational metrics emitted by GoForj Apps.
---

# Metrics

Metrics are numeric operational signals emitted by the App.

GoForj Apps expose Prometheus-compatible metrics through `github.com/goforj/metrics`.

Metrics endpoints and instrumentation are present only when the metrics component is selected for the App.

::: info Metrics package reference
This operations guide covers the endpoints, configuration, and runtime signals of a GoForj App. The [metrics library page](/metrics) documents standalone registries, exposition, metric types, and the complete package API.
:::

## Endpoints

When a combined App includes HTTP, scrape the HTTP route:

```text
http://localhost:3000/metrics
```

The combined runtime disables dedicated per-runtime listeners. When the combined App has no HTTP runtime, it uses the App metrics port instead:

```text
http://localhost:10000/metrics
```

Direct runtime commands may expose source-specific listeners:

```text
http://localhost:10000/metrics  # HTTP runtime
http://localhost:10001/metrics  # scheduler
http://localhost:10002/metrics  # workers
```

Apps get deterministic per-app local defaults so their runtimes do not fight for the same ports.

| App | HTTP metrics | Scheduler metrics | Worker metrics |
| --- | ---: | ---: | ---: |
| `app` | `10000` | `10001` | `10002` |
| `admin` | `10010` | `10011` | `10012` |
| `statuspage` | `10020` | `10021` | `10022` |

Here `admin` serves staff operations, while `statuspage` is a separately available public surface for service health and incidents.

When the HTTP runtime exposes `/metrics`, scrape each App's HTTP port:

| App | HTTP `/metrics` |
| --- | ---: |
| `app` | `3000` |
| `admin` | `3001` |
| `statuspage` | `3002` |
 
Override ports for the staff operations App with app-prefixed env vars such as `ADMIN_API_HTTP_PORT`, `ADMIN_METRICS_PORT`, `ADMIN_SCHEDULER_METRICS_PORT`, and `ADMIN_WORKER_METRICS_PORT`.

When the HTTP runtime and metrics component are enabled, the App also exposes:

```text
GET /metrics
```

Verify the listener selected for the running topology:

```bash
curl --fail http://127.0.0.1:3000/metrics
# HELP http_requests_total Total HTTP requests.
# TYPE http_requests_total counter
```

The exact metric families depend on enabled components and whether the App has served requests; Prometheus text and a successful response prove the scrape endpoint is available.

## Toggles

Framework metrics can be controlled per surface:

```text
METRICS_HTTP_ENABLED=true
METRICS_CACHE_ENABLED=true
METRICS_STORAGE_ENABLED=true
METRICS_EVENTS_ENABLED=true
METRICS_MAIL_ENABLED=true
METRICS_QUEUE_ENABLED=true
METRICS_DATABASE_ENABLED=true
METRICS_AUTH_ENABLED=true
METRICS_SCHEDULER_ENABLED=true
```

Disabled instrumentation should be absent or inert enough to make overhead decisions honest.

The demo App also uses `METRICS_MONITORING_ENABLED` for its monitoring surface. See [Environment Reference](/reference/env-vars#metrics-and-runtime-ports) for port precedence and the complete toggle list.

## Labels

Labels should be bounded and operator-facing.

Prefer route patterns, queue names, job names, schedule names, cache names, disk names, bus names, and driver names.

Framework metric families emit `app` directly. Many runtime-aware families also emit `source`, which is the logical runtime surface such as `http`, `jobs`, `scheduler`, `cli`, `lighthouse`, or `app`.

The local observability stack adds scrape-time metadata such as `process`, `service`, and `environment`:

```text
app=admin
source=jobs
process=jobs
service=Example
environment=local
```

This label set identifies a background staff-operations job from `admin`. Use `source` for logical runtime attribution and `process` for scrape topology.

Avoid user IDs, emails, raw URLs, raw SQL, cache keys, filenames, request IDs, and arbitrary error strings.

## Proving Path

GoForj metrics should prove themselves against standard Prometheus-compatible tooling before Lighthouse adapts them into UI views.

This keeps metric names, labels, and dashboards honest.

## Next Steps

- [Metrics Library](/metrics)
- [Environment Reference](/reference/env-vars#metrics-and-runtime-ports)
- [Inspects](/operations/inspects)
- [Lighthouse](/operations/lighthouse)
