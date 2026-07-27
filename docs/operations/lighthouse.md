---
title: Lighthouse
description: GoForj local and operator-facing runtime visibility.
---

# Lighthouse

Lighthouse is GoForj's local and operator-facing runtime visibility surface.

It consumes framework runtime surfaces such as inspects, logs, resources, schedules, route information, cache, storage, and metrics-backed views.

## Role

Lighthouse should present already-useful operational data.

Metrics should first be useful through standard Prometheus-compatible tooling. Inspects should first be meaningful runtime records. Lighthouse then gives those surfaces a first-party operator view.

## Runtime Agents

Generated runtimes can connect as Lighthouse agents and expose capabilities such as:

- inspects
- CLI commands
- routes
- cache
- storage
- schedules

Capabilities depend on enabled App components.

In a multi-app Project, Lighthouse should present the app first and the runtime beneath it:

```text
photodrop
  marketplace
    http
    jobs

  backstage
    http
    scheduler
```

Lighthouse payloads may still use implementation fields such as `agent` or `source` internally. Read `source` as the runtime surface, such as `http`, `jobs`, `scheduler`, `cli`, or `app`. User-facing labels should stay close to the Project -> app -> runtime model.

Use `APP_INSTANCE_ID` when multiple replicas of the same app/runtime need stable operator identity.

## Connection and Access

Lighthouse is enabled by default when rendered into the App. A Runtime agent connects only when it has a Lighthouse URL and a shared secret:

```text
LIGHTHOUSE_ENABLED=true
LIGHTHOUSE_URL=wss://ops.example.com/lighthouse/ws/agent
LIGHTHOUSE_SECRET=<shared-secret-from-your-secret-store>
APP_INSTANCE_ID=api-1
```

The agent expects the `/lighthouse/ws/agent` websocket path. Keep `LIGHTHOUSE_SECRET` in the deployment secret store and restrict browser access to Lighthouse as an operator surface. An agent without a secret is disabled rather than connecting anonymously.

Agents reconnect while their Runtime remains alive. A Lighthouse connection failure should not stop the HTTP, worker, or scheduler Runtime; it reduces operator visibility and should be visible as a clear warning rather than as an empty resource view.

## Inspects

Lighthouse owns the retained recent inspect browsing window.

It can show source-specific rows and detail views for:

- HTTP requests
- jobs
- scheduler runs
- CLI executions

## Operator Actions

Lighthouse integration can expose operator actions where the runtime owns them.

Examples:

- list routes
- inspect requests
- browse queue jobs
- control schedules
- browse cache or storage resources
- run selected CLI commands

Queue actions depend on the selected queue backend. The queue contract defines admin operations such as list, retry, cancel, delete, clear, and history, but drivers can return an unsupported error when the backend does not implement that action. Lighthouse should show that limitation instead of pretending the queue is empty or controllable.

Treat operator actions as production changes. Before retrying or deleting queue work, identify the App, Runtime, queue, job, and driver capability; use the normal application logs, metrics, and Inspects to establish impact. A control that returns unsupported is a driver capability limit, not an empty queue.

## Operational Workflow

Use Lighthouse after the underlying signal has identified a problem:

1. Start with an alert, readiness failure, log, or bounded metric series.
2. Select the Project, then the App and Runtime instance that produced it.
3. Use a recent Inspect or resource view to narrow the affected route, job, schedule, cache, or storage resource.
4. Confirm the action against the driver and topology before using a control.
5. Verify the result in the source Runtime's logs, metrics, and readiness state.

This order keeps Lighthouse a useful operator view without turning it into the only source of truth for a deployment decision.

## Failure Modes

| Failure | What appears | Operator action |
| --- | --- | --- |
| Missing `LIGHTHOUSE_SECRET` | Agent reports that it is disabled. | Provide the matching secret through the Runtime's secret delivery path. |
| HTTP 401 while connecting | Agent warns that shared-secret authentication was rejected. | Verify that the Runtime and Lighthouse use the same secret. |
| HTTP 404 or unexpected websocket path | Agent reports a Lighthouse URL/path problem. | Set `LIGHTHOUSE_URL` to the `/lighthouse/ws/agent` endpoint. |
| Lighthouse unreachable | Runtime continues but recent Inspect delivery and live control visibility degrade. | Restore connectivity and use logs, metrics, and direct Runtime commands until it returns. |
| Resource/action unavailable | UI should expose unavailable or unsupported state. | Check selected components and driver capabilities; do not infer that the resource is empty. |

## Common Mistakes

::: warning Common mistakes
- Do not treat Lighthouse as all observability.
- Do not make Lighthouse the first place metric semantics are validated.
- Do not hide unavailable resources as empty UI.
- Do not imply every queue backend supports every Lighthouse queue action.
- Do not push operator-specific payload shaping into low-level runtime files when a Lighthouse adapter owns it.
:::

## Production Checklist

- Lighthouse access and its shared secret are restricted to operators.
- Every replica has unambiguous App, Runtime, and instance identity.
- Connection/authentication warnings are collected with Runtime logs.
- A Lighthouse outage has a documented fallback using direct health, logs, metrics, and App commands.

## Next Steps

- [Inspects](/operations/inspects)
- [Metrics](/operations/metrics)
- [Environment Reference](/reference/env-vars#lighthouse-and-inspects)
- [Generated Extension Points](/core/code-generation#choose-a-safe-extension-point)
