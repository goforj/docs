---
title: HTTP Server
description: Operational behavior for generated GoForj HTTP runtimes.
---

# HTTP Server

The HTTP runtime serves application routes and framework routes through the generated `internal/http` package and the `web` abstraction.

## Process Model

The HTTP Runtime owns one listener, framework routes, application route groups, request logging, HTTP metrics, and request Inspects. It receives `SIGINT` and `SIGTERM` through the App lifecycle and lets the server drain within `APP_SHUTDOWN_TIMEOUT`.

Run it by itself when it needs its own scaling or restart policy:

```bash
./bin/app api
```

Run the combined Runtime only when the same process should own all enabled Runtimes:

```bash
./bin/app
```

The bare form is equivalent to `./bin/app run` for a runtime-capable App. It also starts enabled workers and the scheduler, so it is not a substitute for an HTTP-only process in a split deployment.

## Startup and Shutdown

At startup, the server logs its bind address and a route-count summary. It does not print the entire route table. A bind failure, such as another process already using the port, makes the HTTP Runtime fail; in combined mode the Runtime host then cancels sibling Runtimes.

On `SIGTERM`, stop sending new traffic to the process first, then allow the App's graceful shutdown budget to finish. Set the supervisor's stop timeout longer than `APP_SHUTDOWN_TIMEOUT`; otherwise the supervisor can terminate the process before its HTTP server finishes draining.

## Configuration

Common variables:

```text
API_HTTP_HOST=0.0.0.0
API_HTTP_PORT=3000
HTTP_ACCESS_LOG_ENABLED=true
METRICS_PORT=10000
```

`API_HTTP_HOST` defaults to `0.0.0.0`; set it to `127.0.0.1` when a same-host reverse proxy owns public traffic. `API_HTTP_PORT` selects the listener. The `api` command also accepts host, port, and dedicated metrics-port options, but environment configuration keeps the supervised command stable.

## Framework Routes

Common framework-owned routes:

- `/-/health`
- `/-/ready`
- `/swagger`
- `/swagger/doc.json`
- `/metrics` when metrics are enabled
- Lighthouse routes when enabled

Application routes should be registered through `app/routes.go` or `app/<name>/routes.go`, not by editing framework route registration.

## Route Visibility

Startup logs show a route count summary.

Use:

```bash
./bin/app route:list
```

for the full route table.

For a named app binary, use that app's binary:

```bash
./bin/marketplace route:list
```

Expected result: a complete, human-readable table of methods, paths, and handlers. The command constructs the App route surface but does not start the HTTP listener.

## Health, Readiness, and Verification

Use liveness to answer whether the process is responding and readiness to decide whether it should receive traffic:

```bash
curl --fail http://127.0.0.1:3000/-/health
./bin/app health http://127.0.0.1:3000 --probe ready --fail
```

Expected result: health returns HTTP 200 with `{"status":"ok"}`. The App `health` command exits non-zero when readiness is not HTTP 200 with `ready`, making it suitable for a release check. Detailed readiness failures require `APP_DIAG_TOKEN`; do not put that token in a public load-balancer probe.

## Logs, Metrics, and Inspects

HTTP access logging is enabled by default and emits structured URI, method, status, latency, and client-IP fields. Set `HTTP_ACCESS_LOG_ENABLED=false` only when request volume makes higher-signal lifecycle and error logs unreadable; retain HTTP metrics and Inspects for visibility.

When metrics are enabled, the HTTP Runtime can start a dedicated Prometheus endpoint on `METRICS_PORT` and can expose `GET /metrics` through the HTTP route surface. Scrape the endpoint that the deployed topology makes reachable, and use route patterns rather than raw URLs as metric dimensions.

When Inspect capture is enabled, finished requests become request Inspects. They are useful for a recent execution timeline and request/response diagnosis, but they are bounded and must not be treated as durable audit storage.

## Failure Modes

| Failure | Behavior | Operator action |
| --- | --- | --- |
| HTTP port is occupied | The HTTP Runtime cannot start; a combined host cancels siblings. | Find the listener or choose a distinct App HTTP port. |
| Required dependency is unavailable | Liveness can remain 200 while readiness is 503. | Keep the instance out of traffic and repair the failed dependency. |
| Metrics port conflicts in split topology | The metrics listener cannot bind. | Give each Runtime a distinct configured metrics port. |
| Access logs hide important events | The process remains healthy but diagnostics become noisy. | Reduce access-log volume deliberately; do not remove lifecycle, metrics, or readiness checks. |

## Production Checklist

- The HTTP Runtime is supervised with a stop timeout above `APP_SHUTDOWN_TIMEOUT`.
- The bind address is intentional and public TLS/proxy ownership is clear.
- Public probes use health/readiness without diagnostics credentials.
- Route visibility, access logs, metrics, and Inspects have been verified after deploy.

## Next Steps

- [Health and Readiness](/operations/health-readiness)
- [Logging](/operations/logging)
- [HTTP Services](/applications/http-services)
