---
title: Lighthouse
description: GoForj local and operator-facing runtime visibility.
---

# Lighthouse

Lighthouse is GoForj's UI for inspecting running applications during development and operations.

It brings inspects, logs, routes, schedules, queue state, cache, storage, and metrics-backed views into one operator workspace.

<LighthouseProductView />

Instead of reconstructing a failure from several terminals, select the app and Runtime that produced it, follow its recent execution timeline, and move directly to the registered route, queue, schedule, cache, or storage resource involved. The workspace follows the components compiled into each App, so a focused worker and a full web app do not pretend to expose the same controls.

Use Lighthouse when you need the fast, connected view. Keep logs, metrics, health checks, and Inspects independently useful so production diagnosis never depends on one UI.

## Role

Lighthouse should present already-useful operational data.

Metrics must remain useful through standard Prometheus-compatible tooling, and inspects must remain meaningful runtime records. Lighthouse presents that information together; it is not the only way to observe an app.

## Runtime Agents

Application processes connect to Lighthouse as agents and can provide:

- inspects
- CLI commands
- routes
- cache
- storage
- schedules

Available data and controls depend on the app's enabled components.

In a multi-app Project, Lighthouse should present the app first and the runtime beneath it:

```text
photodrop
  admin
    http
    jobs

  statuspage
    http
    scheduler
```

In this example, `admin` handles staff operations and background jobs. `statuspage` is an independently available public surface whose HTTP runtime serves health and incident information while its scheduler refreshes availability.

Lighthouse payloads may still use implementation fields such as `agent` or `source` internally. Read `source` as the process role, such as `http`, `jobs`, `scheduler`, `cli`, or `app`. User-facing labels should stay close to the Project -> app -> runtime hierarchy.

Use `APP_INSTANCE_ID` when multiple replicas of the same app/runtime need stable operator identity.

## Connection and Access

When the Lighthouse component is included, it is enabled by default. An app process connects only when it has a Lighthouse URL and a shared secret:

```text
LIGHTHOUSE_ENABLED=true
LIGHTHOUSE_URL=wss://ops.example.com/lighthouse/ws/agent
LIGHTHOUSE_SECRET=<shared-secret-from-your-secret-store>
APP_INSTANCE_ID=api-1
```

The agent expects the `/lighthouse/ws/agent` websocket path. Keep `LIGHTHOUSE_SECRET` in the deployment secret store and restrict browser access to operators. An agent without a secret is disabled rather than connecting anonymously.

Agents reconnect while their process remains alive. A Lighthouse connection failure does not stop the HTTP server, worker, or scheduler; it reduces operator visibility and should appear as a clear warning rather than as an empty resource view.

## Inspects

Lighthouse owns the retained recent inspect browsing window.

It can show source-specific rows and detail views for:

- HTTP requests
- jobs
- scheduler runs
- CLI executions

## Operator Actions

Lighthouse can offer operator actions when the connected process and selected driver support them.

Examples:

- list routes
- inspect requests
- browse queue jobs
- control schedules
- browse cache or storage resources
- run selected CLI commands

Queue actions depend on the selected queue backend. The queue contract defines admin operations such as list, retry, cancel, delete, clear, and history, but drivers can return an unsupported error when the backend does not implement that action. Lighthouse should show that limitation instead of pretending the queue is empty or controllable.

Treat operator actions as production changes. Before retrying or deleting queue work, identify the app, process, queue, job, and driver capability; use application logs, metrics, and inspects to establish impact. A control that returns unsupported is a driver capability limit, not an empty queue.

## Browser Benchmarks

Lighthouse includes a browser workflow for controlled HTTP, cache, queue, storage, and database comparisons. It discovers only the suites and configured resource instances available to the selected App, then reports throughput, latency percentiles, errors, driver details, and the system baseline together.

Benchmarks create real load and can leave data behind after interruption or backend failure. Read [Performance Benchmarks](/operations/performance-benchmarks) before choosing a target, changing concurrency, or using results for a capacity decision.

## Operational Workflow

Use Lighthouse after the underlying signal has identified a problem:

1. Start with an alert, readiness failure, log, or bounded metric series.
2. Select the Project, then the app and process instance that produced it.
3. Use a recent Inspect or resource view to narrow the affected route, job, schedule, cache, or storage resource.
4. Confirm the action against the driver and topology before using a control.
5. Verify the result in that process's logs, metrics, and readiness state.

This order keeps Lighthouse a useful operator view without turning it into the only source of truth for a deployment decision.

## Failure Modes

| Failure | What appears | Operator action |
| --- | --- | --- |
| Missing `LIGHTHOUSE_SECRET` | Agent reports that it is disabled. | Provide the matching secret through the process's secret delivery path. |
| HTTP 401 while connecting | Agent warns that shared-secret authentication was rejected. | Verify that the app process and Lighthouse use the same secret. |
| HTTP 404 or unexpected websocket path | Agent reports a Lighthouse URL/path problem. | Set `LIGHTHOUSE_URL` to the `/lighthouse/ws/agent` endpoint. |
| Lighthouse unreachable | The app continues but recent Inspect delivery and live control visibility degrade. | Restore connectivity and use logs, metrics, and direct app commands until it returns. |
| Resource/action unavailable | UI should expose unavailable or unsupported state. | Check selected components and driver capabilities; do not infer that the resource is empty. |

## Production Checklist

- Lighthouse access and its shared secret are restricted to operators.
- Every replica has an unambiguous app, process role, and instance identity.
- Connection and authentication warnings are collected with application logs.
- A Lighthouse outage has a documented fallback using direct health, logs, metrics, and app commands.
- Browser benchmark access is limited to operators, and production runs require a reviewed target and load budget.

## Next Steps

- [Inspects](/operations/inspects)
- [Metrics](/operations/metrics)
- [Performance Benchmarks](/operations/performance-benchmarks)
- [Environment Reference](/reference/env-vars#lighthouse-and-inspects)
- [App Extension Points](/core/code-generation#choose-a-safe-extension-point)
