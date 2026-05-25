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
- view job payloads
- control schedules
- browse cache or storage resources
- run selected CLI commands

## Common Mistakes

- Do not treat Lighthouse as all observability.
- Do not make Lighthouse the first place metric semantics are validated.
- Do not hide unavailable resources as empty UI.
- Do not push operator-specific payload shaping into low-level runtime files when a Lighthouse adapter owns it.

## Next Steps

- [Inspects](/operations/inspects)
- [Metrics](/operations/metrics)
- [Generated Extension Points](/core/generated-extension-points)
