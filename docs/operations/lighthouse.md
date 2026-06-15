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

## Common Mistakes

::: warning Common mistakes
- Do not treat Lighthouse as all observability.
- Do not make Lighthouse the first place metric semantics are validated.
- Do not hide unavailable resources as empty UI.
- Do not imply every queue backend supports every Lighthouse queue action.
- Do not push operator-specific payload shaping into low-level runtime files when a Lighthouse adapter owns it.
:::

## Next Steps

- [Inspects](/operations/inspects)
- [Metrics](/operations/metrics)
- [Generated Extension Points](/core/generated-extension-points)
