---
title: Named Resources
description: How generated GoForj Apps expose named caches, disks, queues, event buses, metrics, jobs, schedules, and routes.
---

# Named Resources

A named resource is an operational object the App can use, discover, or expose by a stable name.

Names make runtime behavior visible. They also let application code switch infrastructure without changing business logic.

## Common Named Resources

Examples include:

- cache accessors
- storage disks
- queues
- event buses
- jobs
- schedules
- routes
- metric series
- inspect records

Use stable names because they appear in logs, metrics, inspects, route lists, worker output, and Lighthouse surfaces.

## Default and Named Scopes

Generated Apps usually provide a default resource and optional named resources.

Examples:

```text
CACHE_DRIVER=memory
CACHE_SESSIONS_DRIVER=redis

STORAGE_DRIVER=local
STORAGE_PUBLIC_DRIVER=local
STORAGE_UPLOADS_DRIVER=s3

QUEUE_DRIVER=workerpool
QUEUE_CRITICAL_DRIVER=redis

EVENTS_DRIVER=inproc
EVENTS_AUDIT_DRIVER=nats
```

Default scopes use the base prefix. Named scopes use `_<NAME>_` between the primitive prefix and setting name.

## Generated Accessors

Named resources are exposed through generated accessors.

Examples:

```go
app.Cache()
app.Caches().Sessions()

app.Storage()
app.Storage().Public()
app.Storage().Uploads()

app.Queue()
app.Queues().Critical()

app.Bus()
app.Events().Audit()
```

Accessors are generated from configuration at generation time. After adding or renaming named resources, run `forj build` to refresh generated code.

::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
:::

## Fail-Fast Invariants

Named accessors represent generated invariants.

If an accessor is present, the App expects the generated code and runtime environment to agree. If they do not agree, failing fast is better than silently returning nil or pretending a resource exists.

This makes deployment mistakes visible early.

## Operational Naming

Good names are stable, bounded, and operator-readable.

Examples:

- `sessions`
- `uploads`
- `critical`
- `audit`
- `emails`
- `reports`
- `emails:send`
- `reports:daily`
- `GET /api/v1/users/:id`

Avoid names derived from user input, request payloads, email addresses, IDs, or unbounded values.

Use [Naming Conventions](/core/naming-conventions) when choosing names for commands, jobs, schedules, events, routes, and named resources.

## Metrics and Labels

Use named resources as metric labels when labels are needed.

Prefer:

- route name or route pattern
- job name
- queue name
- schedule name
- disk name
- cache name

Avoid raw paths, raw SQL, user IDs, emails, or arbitrary payload values.

## Common Mistakes

::: warning Common mistakes
- Do not add named resources by hand in generated accessor files.
- Do not treat missing named accessors as optional runtime state.
- Do not use cache names or queue names as arbitrary user input.
- Do not change business code when only a named resource driver changes.
- Do not use different names for the same resource across docs and examples.
:::

## Next Steps

- [Generated Components](/core/generated-components) explains regeneration.
- [Drivers and Adapters](/core/drivers-and-adapters) explains backend selection.
- [Naming Conventions](/core/naming-conventions) defines stable resource names.
- [Libraries](/libraries/) contains package-level resource behavior.
