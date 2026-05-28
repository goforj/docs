# GoForj Example Registry

## Purpose

This file defines canonical example domains, names, progression, and verification rules for GoForj docs.

Use it to keep examples coherent across hundreds of pages.

## Registry Principle

Examples should feel like parts of one coherent GoForj application ecosystem.

They do not need to be one literal sample app, but they should reuse stable domains and naming patterns so readers do not relearn context on every page.

## Canonical Domains

### Users

Use for:

- HTTP controllers
- validation
- services
- repositories
- cache
- events
- auth-adjacent examples

Canonical names:

- `User`
- `UserService`
- `UserRepository`
- `users.created`
- `users:42:profile`
- `/api/users`

### Reports

Use for:

- queued jobs
- long-running work
- storage output
- scheduler
- notifications

Canonical names:

- `Report`
- `ReportService`
- `ReportRepository`
- `reports:generate`
- `reports:daily`
- `reports.generated`
- `reports/{id}.pdf`

### Uploads

Use for:

- storage
- file validation
- background processing
- public/private disk examples

Canonical names:

- `Upload`
- `UploadService`
- `uploads`
- `assets`
- `/api/uploads`
- `uploads.received`

### Notifications

Use for:

- queue dispatch
- event subscribers
- mail integration
- retry examples

Canonical names:

- `NotificationService`
- `emails:send`
- `notifications:deliver`
- `notifications.sent`

### Monitoring

Use for:

- scheduler
- Lighthouse
- metrics
- inspects
- operational examples

Canonical names:

- `MonitorCheck`
- `MonitorCheckService`
- `monitor:poll`
- `monitor:retention`
- `monitor.checked`

### Billing

Use sparingly for:

- events
- idempotency
- transactions
- operations

Canonical names:

- `Invoice`
- `BillingService`
- `billing.invoice_paid`
- `billing:reconcile`

## Canonical Resource Names

Queues:

- `default`
- `critical`
- `emails`
- `reports`

Jobs:

- `emails:send`
- `reports:generate`
- `reports:upload`
- `notifications:deliver`
- `billing:reconcile`

Events:

- `users.created`
- `reports.generated`
- `uploads.received`
- `billing.invoice_paid`

Schedules:

- `cleanup:stale-sessions`
- `reports:daily`
- `monitor:poll`
- `billing:reconcile`

Storage disks:

- `assets`
- `uploads`
- `reports`

Cache keys:

- `users:42:profile`
- `reports:daily-summary`
- `monitor:last-seen`

Metrics:

- `users.created`
- `reports.generated`
- `uploads.received`
- `jobs.processed`

Metric examples should use bounded labels such as route, job name, queue, disk, cache accessor, status class, or schedule name.

## Example Progression

Use this sequence when building public docs:

1. `users`: HTTP route returning JSON.
2. `users`: controller calling `UserService`.
3. `users`: `UserService` using `UserRepository`.
4. `users`: cached profile lookup.
5. `uploads`: write a file to the `uploads` disk.
6. `users`: publish `users.created`.
7. `notifications`: subscribe to `users.created`.
8. `notifications`: dispatch `emails:send`.
9. `reports`: define `reports:generate` job.
10. `reports`: run `worker`.
11. `reports`: schedule `reports:daily`.
12. `monitoring`: observe metrics and inspects.
13. `operations`: run workers and scheduler in production.

## Example Metadata Template

When creating a substantial example, track:

```markdown
## Example: Name

- Primary concept:
- Page:
- Example type: fragment | complete file | runnable scenario
- Generated location:
- Dependencies:
- Runtime boundary:
- Verification command:
- Related pages:
```

## Verification Standards

Fragments:

- Must be syntactically plausible.
- Must be clearly introduced as fragments.
- Must not carry the main teaching burden of task pages.

Complete files:

- Must include package and imports.
- Must compile when placed in the stated location or be marked as illustrative.
- Must use current GoForj APIs.

Runnable scenarios:

- Must include setup assumptions.
- Must include commands.
- Must include expected behavior.
- Must be covered by executable scenario specs when published under `docs/scenarios`.
- Must preserve diagrams in the spec, not by hand-editing generated markdown.

## Commands

Use confirmed generated command names:

- `forj build`
- `forj dev`
- `forj run api`
- `forj run route:list`
- `forj run worker`
- `forj run scheduler`
- `forj make:controller users`
- `forj run make:job`
- `forj run make:event`
- `forj run migrate`
- `forj run migrate:rollback`

For maintained scenario docs, use hidden maintainer commands from the GoForj CLI:

- `forj scenario:list`
- `forj scenario:test <id>`
- `forj scenario:test --all`
- `forj scenario:generate <id>`
- `forj scenario:generate --all --check`

Only use command names after checking current generated templates or CLI source.

## Anti-Examples

Avoid:

- `foo`, `bar`, `baz`
- generic `ThingService`
- direct Redis/S3/Kafka clients in business service examples
- anonymous schedules for meaningful work
- controllers that perform full workflows inline
- examples that require external infrastructure before local examples exist
