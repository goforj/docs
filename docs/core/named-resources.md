---
title: Named Resources
description: How GoForj Apps expose named caches, disks, queues, event buses, metrics, jobs, schedules, and routes.
---

# Named Resources

A named resource gives application code a stable, typed handle such as `uploads`, `critical`, or `audit` while configuration chooses the backing driver.

That separation is one of GoForj's main configuration strengths: the same service can use an in-process queue locally and Redis in production without changing the queue name or dispatch code.

```mermaid
flowchart LR
    service[Application service] --> accessor[Queues().Critical()]
    dev[Local config<br/>workerpool] --> driver[Selected queue driver]
    prod[Production config<br/>redis] --> driver
    driver --> accessor
    accessor --> queue[critical queue]
```

The accessor is compiled from the Project's named resource configuration. The active driver is selected at startup from the drivers already compiled into the App.

## Common Named Resources

Resource families with generated accessors include:

- caches
- storage disks
- queues
- event buses
- mailers
- database connections

Other operational objects also have stable names, but they are registered rather than exposed as infrastructure accessors:

- jobs
- schedules
- routes
- metric series
- inspect records

Use stable names because they appear in logs, metrics, inspects, route lists, worker output, and Lighthouse surfaces.

## Default and Named Scopes

GoForj Apps usually provide a default resource and optional named resources when the owning component is enabled. A Project without Cache, File Storage, Background Jobs, or Events does not render accessors for that resource family.

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

MAIL_DRIVER=log
MAIL_TRANSACTIONAL_DRIVER=resend
```

Default scopes use the base prefix. Named scopes use `_<NAME>_` between the primitive prefix and setting name.

## Generated Accessors

Named resources are exposed through generated accessors.

Examples:

<!-- go-example: illustrative-fragment -->
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

app.Mail()
app.Mail().Transactional()
```

Accessors come from configuration. After adding or renaming named resources, run `forj build`; `forj dev` does this automatically for apps listed in `dev.apps`.

## Use a Named Resource in a Service

Inject the owning manager once, then choose the named resource where the workflow needs it:

<!-- go-example: illustrative-fragment -->
```go
type AlertService struct {
	queues *queues.Manager
}

func NewAlertService(queueManager *queues.Manager) *AlertService {
	return &AlertService{queues: queueManager}
}

func (s *AlertService) Dispatch(ctx context.Context, payload []byte) error {
	critical := s.queues.Critical()
	_, err := critical.WithContext(ctx).Dispatch(
		queue.NewJob(AlertJobTypeName).Payload(payload),
	)
	return err
}
```

The service asks for `critical`; it does not know whether that queue is backed by workerpool, Redis, NATS, SQS, or another supported driver. Add `NewAlertService` to the App's service provider set and let Wire supply the manager.

## Change a Driver Without Changing the Service

Keep the named contract and change only runtime selection:

::: code-group

```dotenv [Local]
QUEUE_SUPPORTED_DRIVERS=workerpool,redis
QUEUE_CRITICAL_DRIVER=workerpool
```

```dotenv [Production]
QUEUE_SUPPORTED_DRIVERS=workerpool,redis
QUEUE_CRITICAL_DRIVER=redis
QUEUE_ADDR=redis:6379
```

:::

Because both drivers are already in `QUEUE_SUPPORTED_DRIVERS`, this switch needs a restart, not regeneration. Adding a new supported driver or a new named accessor requires `forj build`.

## Fail-Fast Invariants

Named accessors represent generated invariants.

If an accessor is present, its generated resource is required. Missing runtime driver settings use local fallbacks only when the fallback driver is built into the App. New Projects write explicit active selections, and a selected MySQL-only or Postgres-only database must receive its environment configuration.

If the generated code and runtime environment disagree in a way that cannot be satisfied, failing fast is better than silently returning nil or pretending a resource exists.

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

Use [Naming Conventions](/reference/naming-conventions) when choosing names for commands, jobs, schedules, events, routes, and named resources.

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

- [Code Generation](/core/code-generation) explains regeneration.
- [Drivers and Adapters](/core/drivers-and-adapters) explains backend selection.
- [Naming Conventions](/reference/naming-conventions) defines stable resource names.
- [Libraries](/libraries/) contains package-level resource behavior.
