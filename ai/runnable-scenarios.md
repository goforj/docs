# Runnable Scenarios

## Purpose

This file defines the canonical runnable scenario strategy for GoForj docs.

Use it before writing end-user scenario pages. The goal is to make examples feel like one coherent App instead of a collection of unrelated snippets.

## Scenario Principle

Runnable scenarios should prove the framework path.

They should show a developer how normal GoForj code is organized, wired, run, tested, and observed through the generated App model.

Each scenario must:

- compile when placed in the documented location
- run with local-first defaults
- use generated App extension points
- keep business logic in services
- use explicit dependencies
- name runtime resources clearly
- include a verification command
- reinforce driver swappability without forcing distributed infrastructure

## Canonical Sample App

Use a single lightweight product shape across scenario pages:

**A small internal reporting app.**

The app manages users, accepts uploads, generates reports, emits events, dispatches background work, and exposes runtime visibility.

This domain is broad enough to exercise GoForj systems without creating complex business rules.

## Canonical Domains

Use these domains consistently.

| Domain | Use For | Primary Pages |
| --- | --- | --- |
| Users | HTTP, controllers, services, repositories, cache, events | Applications, Data, Async |
| Uploads | File validation, storage disks, upload workflows | Applications, Data |
| Reports | Jobs, workers, scheduler, generated files | Async, Operations |
| Notifications | Event subscribers and queued side effects | Async |
| Monitoring | Metrics, inspects, Lighthouse, operational visibility | Operations |

Avoid introducing new domains unless a page cannot be explained with these.

## Canonical Names

HTTP:

- `GET /api/users/{id}`
- `POST /api/users`
- `POST /api/uploads`
- `GET /api/reports/{id}`

Services:

- `UserService`
- `UploadService`
- `ReportService`
- `NotificationService`
- `MonitorCheckService`

Repositories:

- `UserRepository`
- `ReportRepository`

Events:

- `users.created`
- `uploads.received`
- `reports.generated`

Jobs:

- `reports:generate`
- `emails:send`
- `notifications:deliver`

Queues:

- `default`
- `reports`
- `emails`

Schedules:

- `reports:daily`
- `cleanup:stale-sessions`
- `monitor:poll`

Storage disks:

- `uploads`
- `reports`
- `assets`

Cache keys:

- `users:42:profile`
- `reports:daily-summary`
- `monitor:last-seen`

Metrics:

- `users.created`
- `uploads.received`
- `reports.generated`
- `jobs.processed`

Use bounded labels such as route, queue, job, disk, cache accessor, schedule, status class, or driver.

## Scenario Sequence

Write scenarios in this order.

### 1. JSON API Route With Controller And Service

Purpose:

Establish the normal App feature shape.

Must show:

- route registration
- thin controller
- service-owned business logic
- explicit dependency injection
- JSON response
- `route:list` verification
- one service-level test

Must not show:

- cache
- queue
- events
- storage
- production driver configuration

Primary pages supported:

- `applications/routes.md`
- `applications/controllers.md`
- `applications/services.md`
- `testing/http-tests.md`

### 2. Cached User Profile Lookup

Purpose:

Show named cache resources without making cache the source of truth.

Must show:

- `UserService` using `UserRepository`
- cache lookup by stable key
- explicit TTL
- repository as source of truth
- local cache behavior
- cache driver swappability by configuration
- service-level test with local or fake cache

Must not show:

- direct Redis clients in business services
- cache-only persistence
- distributed setup before local behavior

Primary pages supported:

- `data/cache-patterns.md`
- `data/driver-selection.md`
- `core/named-resources.md`
- `libraries/cache.md`

### 3. File Upload To Named Storage Disk

Purpose:

Show storage as a named resource behind the App abstraction.

Must show:

- upload route
- request validation boundary
- `UploadService`
- write to the `uploads` disk
- returned file identifier or path
- local filesystem behavior
- storage driver swappability by configuration
- test with a temporary local disk

Must not show:

- direct S3 clients in controllers or services
- public URL assumptions for private files
- multipart implementation details beyond what the page teaches

Primary pages supported:

- `applications/requests-validation.md`
- `data/storage-patterns.md`
- `core/named-resources.md`
- `libraries/storage.md`

### 4. `users.created` Event With Subscriber

Purpose:

Show events as local-first fan-out, not durable background jobs.

Must show:

- event definition or generated event registration
- publish after user creation
- subscriber registration
- subscriber calling `NotificationService`
- local in-process behavior
- event test using local delivery

Must not show:

- long-running report generation inside event subscribers
- event subscribers as the default retry boundary
- external broker setup before the local path

Primary pages supported:

- `async/events.md`
- `async/event-subscribers.md`
- `async/events-vs-queues.md`
- `libraries/events.md`

### 5. `reports:generate` Job And Worker

Purpose:

Show durable background work and worker execution.

Must show:

- named job
- payload shape
- dispatch from controller, command, or service
- handler calling `ReportService`
- queue name
- `worker` verification
- retry and idempotency note
- job handler test

Must not show:

- anonymous jobs for meaningful work
- event subscribers doing durable work
- direct queue backend clients in business services

Primary pages supported:

- `async/queues.md`
- `async/jobs.md`
- `async/workers.md`
- `async/retries-idempotency.md`
- `libraries/queue.md`

### 6. `reports:daily` Schedule

Purpose:

Show recurring work as declarative scheduling around a testable service method.

Must show:

- named schedule
- schedule registration
- `ReportService.GenerateDaily`
- `scheduler` verification
- direct service test
- operations note for scheduler process ownership

Must not show:

- anonymous schedules for meaningful work
- business logic inside schedule registration
- wall-clock-dependent tests

Primary pages supported:

- `async/scheduler.md`
- `operations/scheduler-processes.md`
- `libraries/scheduler.md`

### 7. Runtime Observability Through Metrics And Inspects

Purpose:

Tie the sample App back to production trust.

Must show:

- bounded app metric
- inspect surface for useful runtime state
- queue or schedule visibility
- Lighthouse relationship
- local verification path
- production note for metrics export

Must not show:

- high-cardinality labels
- secrets or raw payload dumps in inspect output
- dashboards before runtime data is explained

Primary pages supported:

- `operations/metrics.md`
- `operations/inspects.md`
- `operations/lighthouse.md`
- `operations/production-checklist.md`

## Page Shape

Each runnable scenario page should use this structure:

```markdown
# Scenario Name

State the outcome in one paragraph.

## What You Will Build

List the concrete behavior.

## Prerequisites

Name enabled components, generated App assumptions, and local defaults.

## Files

List files changed or generated locations.

## Step 1: ...

Show complete files where practical.

## Verify

Show commands and expected behavior.

## Test

Show the smallest meaningful test.

## Operations

Explain logs, metrics, inspects, process boundaries, or driver behavior when relevant.

## Next Step

Link to the next scenario.
```

## Verification Commands

Use commands confirmed from the framework source or generated templates.

Common commands:

```bash
forj build
forj dev
forj run route:list
forj run api
forj run worker
forj run scheduler
go test ./...
```

When documenting Go commands in GoForj repositories, prefer:

```bash
GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache go test ./...
```

For generated user Apps, show the command users should normally run. Add cache env vars only when the page is explicitly about repository-local validation.

## File Location Rules

Prefer generated App-owned locations over framework internals.

Every scenario must name:

- where route registration lives
- where controllers live
- where services live
- where repositories or storage boundaries live
- where jobs, events, subscribers, or schedules are registered
- where generated accessors are expected when named resources are involved

If the exact generated path is unstable or not yet confirmed, the scenario page must not pretend certainty. Use a placeholder note in the internal draft and verify the path before publishing.

## Dependency Rules

Constructors should make required dependencies explicit.

Optional collaborators must be modeled explicitly in the type or constructor contract. Do not make examples silently skip behavior because a required collaborator was not wired.

Services may depend on narrow interfaces when that makes testing and driver independence clearer.

Do not introduce a service locator or runtime reflection container in examples.

## Local-First Rule

Every scenario starts with local behavior.

Then, if relevant, it may include a short "Swap The Driver" or "Production Driver" section that explains the configuration surface.

Do not require Redis, S3, a broker, or a production metrics backend before the local scenario works.

## Library Link Rule

Framework scenario pages should not duplicate full library reference.

Link to Libraries for:

- primitive API details
- driver matrices
- standalone usage
- constructor options
- advanced backend behavior

Keep framework pages focused on how the primitive fits into the generated App.

## Acceptance Checklist

Before publishing a runnable scenario:

- [ ] The scenario has one primary teaching goal.
- [ ] The domain and names match this file and `example-registry.md`.
- [ ] The code compiles or the page clearly marks fragments.
- [ ] The page names generated App-owned files.
- [ ] The page uses local-first drivers before production backends.
- [ ] Business logic lives in services.
- [ ] Controllers, subscribers, jobs, and schedules stay thin.
- [ ] Required dependencies are explicit.
- [ ] The scenario includes a verification command.
- [ ] The scenario includes at least one meaningful test.
- [ ] The page links to the next scenario.
- [ ] Framework pages link to Libraries for primitive details.
- [ ] The VitePress build passes after publication.
