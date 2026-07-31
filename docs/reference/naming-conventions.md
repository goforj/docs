---
title: Naming Conventions
description: Lookup reference for commands, jobs, schedules, events, routes, and named resources in GoForj Apps.
---

# Naming Conventions

Names in a GoForj App become operational identifiers.

They appear in commands, logs, metrics, inspects, queue state, route lists, schedules, environment variables, and Lighthouse. Choose names that are stable, bounded, and readable by someone operating the App.

## Convention Map

| Surface | Convention | Examples |
| --- | --- | --- |
| Commands | `category:action` | `reports:sync`, `users:import`, `billing:reconcile` |
| Jobs | `category:action` | `emails:send`, `reports:generate`, `invoices:export` |
| Schedules | `category:cadence` or `category:action` | `reports:daily`, `sessions:cleanup`, `billing:reconcile` |
| Events | `domain.past_tense` | `users.created`, `invoices.paid`, `reports.generated` |
| Routes | REST-ish HTTP paths | `GET /api/v1/users/:id`, `POST /api/v1/reports` |
| Named resources | bounded noun names | `profiles`, `uploads`, `reports`, `critical`, `audit` |

Use lowercase names for runtime identifiers unless the surface has a Go-specific form such as a type, constructor, or generated accessor.

## Commands

Application commands should be short operator actions.

Prefer:

```bash
forj make:command reports:sync
```

Do not use command names as package paths. Keep the command name in the operator-facing `category:action` shape, then use `-d` if the file belongs somewhere else.

If the command belongs in a deeper package, keep the command name short and use `-d` for placement:

```bash
forj make:command reports:sync -d ./internal/billing/reports
```

Use extra command segments only when the extra segment is truly part of the operator-facing command.

## Jobs

Jobs should name the unit of background work, not the queue, package, or handler type.

Use a grouped make-command name so package placement and the operator-facing identity begin in sync:

```bash
forj make:job reports:generate
```

This creates `internal/reports/generate_job.go` with `GenerateJobTypeName = "reports:generate"`.

Prefer:

<!-- go-example: illustrative-fragment -->
```go
const GenerateReportJobTypeName = "reports:generate"
const SendEmailJobTypeName = "emails:send"
```

Avoid names that hide the action:

<!-- go-example: illustrative-fragment -->
```go
const GenerateReportJobTypeName = "reports"
```

Job names should stay stable because they appear in dispatch records, worker logs, metrics, retries, and queue administration.

Ungrouped generator names retain their older compact identity for compatibility, such as `SyncReports` becoming `syncreports`. Prefer grouped names for new jobs instead of depending on that legacy shape.

::: warning Regenerating older grouped resources
Older generators also compacted grouped job and event names. Regenerating one of those files now adopts the documented grouped identity. Before replacing an existing file, coordinate queued job names, subscriber topics, broker state, dashboards, and external publishers that still use the old compact value.
:::

## Schedules

Schedules should name the recurring behavior.

Use `category:cadence` when cadence is the important operator-facing fact:

<!-- go-example: illustrative-fragment -->
```go
s.DailyAt("04:00").
	Name("reports:daily")
```

Use `category:action` when the schedule runs a named maintenance action:

<!-- go-example: illustrative-fragment -->
```go
s.EveryHour().
	Name("sessions:cleanup")
```

The schedule name is an identifier, not a lock. Add explicit overlap protection when the work cannot run concurrently.

## Events

Events should be facts that already happened.

Use a grouped make-command name to create a dotted topic:

```bash
forj make:event users:created
```

This creates `internal/users/created_event.go` with `CreatedEventTopic = "users.created"`.

Use dotted topics with a domain noun and past-tense verb:

<!-- go-example: illustrative-fragment -->
```go
const UserCreatedEventTopic = "users.created"
const InvoicePaidEventTopic = "invoices.paid"
```

Grouped event names use kebab-case within each segment and dots between segments. For example, `billing:invoice-paid` becomes `billing.invoice-paid`. Ungrouped generator names retain their older compact topic for compatibility, so prefer the grouped form for new event contracts.

Generated event files remain App-owned starting points. Review the topic constant before other code or infrastructure depends on it.

Avoid imperative event names:

<!-- go-example: illustrative-fragment -->
```go
const UserCreatedEventTopic = "users.create"
const InvoicePaidEventTopic = "billing:pay-invoice"
```

Use commands or jobs for imperative work. Use events for facts.

## Routes

Routes should describe resources. Use HTTP methods for actions.

Prefer:

```text
GET    /api/v1/users/:id
POST   /api/v1/users
GET    /api/v1/reports/:id
POST   /api/v1/reports
```

Avoid RPC-style paths for normal resource operations:

```text
POST /api/v1/create-user
GET  /api/v1/get-report
```

Named path parameters should be bounded identifiers such as `:id`, `:user_id`, or `:report_id`, not arbitrary user-provided labels.

## Named Resources

Named resources should be bounded nouns.

Prefer:

```text
CACHE_PROFILES_DRIVER=redis
STORAGE_UPLOADS_DRIVER=s3
QUEUE_CRITICAL_DRIVER=redis
EVENTS_AUDIT_DRIVER=nats
```

Avoid names derived from users, tenants, emails, request IDs, file names, or payload values.

Named resources often become generated accessors:

<!-- go-example: illustrative-fragment -->
```go
app.Caches().Profiles()
app.Storage().Uploads()
app.Queues().Critical()
app.Events().Audit()
```

## Common Mistakes

::: warning Common mistakes
- Do not use user input as a command, job, schedule, route, queue, cache, disk, metric, or event name.
- Do not use different names for the same behavior across examples, code, metrics, and docs.
- Do not encode package depth into command or job names unless operators need that depth.
- Do not rename published event topics casually; treat them as contracts.
- Do not use route paths as a substitute for domain modeling.
:::

## Next Steps

- [Make Command Reference](/reference/make-commands) explains generated resource placement.
- [Named Resources](/core/named-resources) explains generated accessors.
- [Events versus Queues](/async/events-vs-queues) explains event and job boundaries.
