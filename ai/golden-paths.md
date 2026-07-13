# GoForj Golden Paths

## Purpose

This file defines canonical usage patterns for GoForj documentation and examples.

Future docs should reinforce these paths unless a page is explicitly about advanced customization or internals.

## Core Rule

Teach one cohesive application architecture.

The default path is:

- generated app structure
- one default app first
- explicit constructors
- Wire-backed dependency injection
- app-local registration surfaces
- app services for business logic
- thin HTTP controllers
- named jobs, events, schedules, cache accessors, storage disks, and metrics
- local-first drivers in development
- configurable drivers in production
- observable runtime behavior

## Application Structure

Use the generated Project as the canonical structure. Teach the default app first; introduce named apps only when the Project needs another runnable boundary.

Typical ownership:

- `cmd/app`: default app binary entrypoint
- `app`: default app composition, route exposure, command exposure, lifecycle registration, schedule registration
- `app/wire`: default app Wire graph and app-owned provider sets
- `cmd/<app>`: named app binary entrypoint
- `app/<app>`: named app composition
- `app/<app>/wire`: named app Wire graph
- `internal/runtime`: reusable runtime policy, lifecycle machinery, app metadata, timeouts
- `internal/http`: HTTP server composition, route registration, readiness, route list, web runtime glue
- `internal/cmd`: CLI commands and command registration
- `internal/jobs`: job handlers, worker runtime, queue command surface
- `internal/events`: event definitions, topics, bus integration
- `internal/schedules`: reusable scheduler runtime behavior
- `internal/storages`: storage manager and named disk access
- `internal/caches`: named cache accessors
- `internal/metrics`: app metrics endpoint and framework instrumentation
- `internal`: shared application behavior, domain packages, controllers, services, jobs, subscribers, repositories

Business packages may be organized by domain, but examples should keep ownership clear: `internal/` owns behavior; `app/` and `app/<app>/` own exposure.

## Build and Run Commands

Golden path for local development:

- `forj dev` for the normal development loop
- `forj build` for generation, Wire, API indexing, and binary build
- `forj ...` for generated App commands when working inside a generated App
- `forj <app> ...` for a named app command, such as `forj marketplace route:list`
- `forj run ...` only when the docs need the explicit App-command path or collision escape hatch
- `forj app` when intentionally running the combined generated App runtime
- `dev.apps` for App-aware build, SPA, and runtime lifecycle ownership
- `dev.watches` for independent custom commands outside an App lifecycle

Golden path for built binaries:

- `./bin/app` or `./bin/app run` for the standalone runtime of a runtime-capable App
- `./bin/app api` for HTTP/API runtime
- `./bin/app worker` for queue workers
- `./bin/app scheduler` for scheduler runtime
- `./bin/app migrate` for migrations
- `./bin/<app> ...` for named app binaries, such as `./bin/marketplace worker`

For runtime-capable Apps, `./bin/app` and `./bin/app run` are equivalent. Explicit commands still take precedence, while CLI-only binaries keep their root help behavior when no command is supplied.

## Configuration

Golden path:

- Use generated env conventions.
- Resolve app-level policy near the root.
- Pass resolved configuration into providers.
- Choose drivers through configuration and provider wiring.
- Avoid reading env repeatedly in leaf services.

Docs should show environment variables as App configuration, not as hidden runtime discovery.

## Dependency Injection

Golden path:

- Use constructor injection.
- Keep required dependencies required.
- Wire dependencies through provider functions and Wire sets.
- Use interfaces at the consumer boundary when they make testing or backend swapping clearer.
- Fail fast on bad wiring.

Do not add nil guards around constructor-injected collaborators unless the dependency is intentionally optional.

## HTTP

Golden path:

- Register routes through generated HTTP route surfaces.
- Use `web.Context` in handlers.
- Group related handlers in controller types.
- Keep controllers thin.
- Call application services from controllers.
- Return explicit JSON, text, no-content, redirect, or file responses through `web.Context`.
- Attach middleware near route or router composition.
- Use `route:list` for full route visibility.

Avoid:

- scattering route registration across unrelated packages
- depending directly on the underlying HTTP engine in normal app code
- putting business workflows inside middleware
- using low-level `net/http` as the first app example

## Routing

Golden path:

- Define stable route groups.
- Use clear paths and HTTP verbs.
- Keep route names and handler names operationally meaningful where route indexing or Lighthouse uses them.
- Show route registration once, then move logic into controllers and services.

## Controllers

Golden path:

- Controller owns request parsing, validation handoff, service call, and response shaping.
- Service owns business behavior.
- Repository owns persistence.
- Job owns asynchronous execution.

Controller examples should not become miniature applications.

## Middleware

Golden path:

- Use first-party `webmiddleware` for common HTTP concerns.
- Apply global middleware at router composition.
- Apply route-specific middleware at route registration.
- Keep middleware stateless or explicitly configured.
- Log and measure through framework-supported middleware where possible.

## Queues

Golden path:

- Define named jobs.
- Register handlers before workers start.
- Dispatch jobs from services or controllers through an injected queue dependency.
- Use local `sync` or `workerpool` drivers for development and tests.
- Use durable or broker-backed drivers when production requirements require them.
- Use named queues for distinct operational classes such as `emails`, `reports`, or `critical`.
- Keep queue names logical in app code. Named apps physicalize backend queue names with the app prefix, for example `billing_default`, while the app still dispatches to `default`.
- Prioritize queues by worker allocation and process sizing, for example `QUEUE_EMAILS_WORKERS=6` versus `QUEUE_REPORTS_WORKERS=2`.
- Use `worker --queue <name>` when a process should work only one named queue.
- Treat retries as part of job design.
- Make job handlers idempotent where retries are possible.
- Run workers as explicit App processes or commands.

Use jobs for durable background work. Do not use events as a queue replacement.

## Jobs

Golden path:

- Use stable names such as `emails:send` or `reports:generate`.
- Use typed payloads.
- Bind and validate payloads at the handler boundary.
- Delegate business behavior to services.
- Emit metrics and inspects through framework surfaces.
- Keep handlers small and testable.

Avoid anonymous, untracked job behavior in docs.

## Events

Golden path:

- Use typed events to publish facts.
- Give events stable topics when the topic is part of the contract.
- Subscribe through generated or documented registration surfaces.
- Use events for fan-out and decoupled reactions.
- Use queues when work must be durable, retried, delayed, or worker-managed.

Docs should explicitly teach "events versus queues" early.

## Scheduler

Golden path:

- Use `forj make:schedule <name> --every <duration>` to create App-owned scheduled work.
- Let grouped schedule names colocate with their domain package, for example `forj make:schedule reports:daily --every 24h` creates `internal/reports/daily_schedule.go`.
- Wire App-owned schedule providers through `app/wire/inject_schedules_app.go`, or `app/<app>/wire/inject_schedules_app.go` for a named app.
- Register schedules in `app/schedules.go`, or `app/<app>/schedules.go` for a named app.
- Keep the registry declarative.
- Give every schedule a stable explicit name.
- Call domain-owned methods directly from schedule entries.
- Use scheduler runtime files for bootstrap and lifecycle only.
- Use Lighthouse scheduler integration for operator-facing metadata and controls.

Good shape:

```go
s.Every(30).Seconds().Name("monitor:poll").Do(s.monitorCheckJob.RunScheduledPoll)
```

Avoid growing scheduler bootstrap into a business-logic bucket.

## Storage

Golden path:

- Use named disks for app storage needs.
- Use local storage for development.
- Use object or remote storage drivers in production when required.
- Resolve disks through the generated storage manager or named accessors.
- Keep storage paths stable and scoped.
- Handle unsupported capabilities such as URL generation explicitly.

Business code should not import S3, GCS, FTP, or local filesystem driver packages directly unless the page is about custom driver wiring.

## Cache

Golden path:

- Use cache for temporary, derived, or performance-oriented data.
- Use named cache accessors for framework-owned and app-owned cache concerns.
- Use memory or file cache locally.
- Use Redis, Memcached, NATS, DynamoDB, or SQL-backed cache based on production requirements.
- Set TTLs deliberately.
- Treat cache misses as normal.
- Use cache-backed locks only when the operational tradeoff is explained.

Do not present cache as durable source-of-truth storage.

## Metrics

Golden path:

- Register metrics at startup.
- Emit metrics from framework-managed primitives and app services where useful.
- Use bounded labels.
- Use route names, queue names, job names, schedule names, disk names, and cache accessor names instead of raw user input.
- Expose `/metrics` when metrics are enabled.
- Validate metrics through standard Prometheus-compatible tooling before adapting them into Lighthouse views.

Avoid raw paths, raw SQL, user IDs, email addresses, or unbounded payload values as labels.

## Inspects

Golden path:

- Use `inspect` for execution records and `trace_id` only for correlation fields.
- Let framework-managed surfaces capture request, job, scheduler, and CLI activity.
- Keep captured payloads bounded and safe.
- Use Lighthouse for recent browsing and debugging.
- Prefer request-scoped debug events for diagnosing auth, queue, and runtime failures.

Do not log or inspect secrets.

## Lighthouse

Golden path:

- Treat Lighthouse as an operator and developer visibility surface.
- Surface framework-managed resources through stable names.
- Show unavailable or degraded resources explicitly.
- Keep UI payload shaping in Lighthouse integration files when the concern is operator-facing.
- Do not make Lighthouse the first place where metric or runtime semantics are invented.

## Testing

Golden path:

- Unit test services with fakes or small in-memory primitives.
- Test HTTP handlers through `webtest` or generated HTTP test helpers.
- Test jobs by invoking handlers with typed payloads and fake dependencies.
- Test events with fake buses or sync buses.
- Test storage and cache through memory/local drivers or provided contract test helpers.
- Use integration tests for real driver behavior.
- Use rendered app smoke tests for template and wiring changes.

Docs should make testing part of the normal workflow, not an appendix.
