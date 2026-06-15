---
title: Metrics
description: Operational metrics emitted by generated GoForj Apps.
---

# Metrics

Metrics are numeric operational signals emitted by the App.

Generated Apps expose Prometheus-compatible metrics through `github.com/goforj/metrics`.

## Endpoints

Standalone host mode prefers one shared metrics endpoint:

```text
http://localhost:10000/metrics
```

Direct runtime commands may expose source-specific listeners:

```text
http://localhost:10000/metrics  # HTTP
http://localhost:10001/metrics  # scheduler
http://localhost:10002/metrics  # workers
```

Named apps get deterministic local defaults so app runtimes do not fight for the same ports.

| App | HTTP metrics | Scheduler metrics | Worker metrics |
| --- | ---: | ---: | ---: |
| `app` | `10000` | `10001` | `10002` |
| first named app | `10010` | `10011` | `10012` |
| second named app | `10020` | `10021` | `10022` |

When the HTTP runtime exposes `/metrics`, local scraping may use each app's HTTP port instead:

| App | HTTP `/metrics` |
| --- | ---: |
| `app` | `3000` |
| first named app | `3001` |
| second named app | `3002` |
 
Override named app ports with app-prefixed env vars such as `MARKETPLACE_API_HTTP_PORT`, `MARKETPLACE_METRICS_PORT`, `MARKETPLACE_SCHEDULER_METRICS_PORT`, and `MARKETPLACE_WORKER_METRICS_PORT`.

When HTTP metrics are enabled, the App may also expose:

```text
GET /metrics
```

## Toggles

Framework metrics can be controlled per surface:

```text
METRICS_HTTP_ENABLED=true
METRICS_CACHE_ENABLED=true
METRICS_STORAGE_ENABLED=true
METRICS_EVENTS_ENABLED=true
METRICS_QUEUE_ENABLED=true
METRICS_DATABASE_ENABLED=true
METRICS_AUTH_ENABLED=true
METRICS_SCHEDULER_ENABLED=true
```

Disabled instrumentation should be absent or inert enough to make overhead decisions honest.

## Labels

Labels should be bounded and operator-facing.

Prefer route patterns, queue names, job names, schedule names, cache names, disk names, bus names, and driver names.

Framework metric families emit `app` directly. Many runtime-aware families also emit `source`, which is the logical runtime surface such as `http`, `jobs`, `scheduler`, `cli`, `lighthouse`, or `app`.

The local observability stack adds scrape-time metadata such as `process`, `service`, and `environment`:

```text
app=marketplace
source=jobs
process=jobs
service=Example
environment=local
```

Use `source` for logical runtime attribution and `process` for scrape topology.

Avoid user IDs, emails, raw URLs, raw SQL, cache keys, filenames, request IDs, and arbitrary error strings.

## Proving Path

GoForj metrics should prove themselves against standard Prometheus-compatible tooling before Lighthouse adapts them into UI views.

This keeps metric names, labels, and dashboards honest.

## Common Mistakes

::: warning Common mistakes
- Do not add high-cardinality labels.
- Do not count internal scrape traffic as application traffic.
- Do not create a second metrics registry for normal App metrics.
- Do not use metrics as a replacement for logs or inspects.
:::

## Next Steps

- [Metrics Library](/metrics)
- [Inspects](/operations/inspects)
- [Lighthouse](/operations/lighthouse)
