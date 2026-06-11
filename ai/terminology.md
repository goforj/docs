# GoForj Terminology

## Purpose

This file defines canonical terminology for GoForj documentation.

Use these terms consistently. Do not introduce synonyms unless the codebase already uses them and the distinction is explicit.

## Canonical Terms

### Project

A Project is the repository-level GoForj workspace created by `forj new`.

Use Project when discussing `.goforj.yml`, selected components, shared internal packages, generated infrastructure, and the collection of one or more runnable apps.

Do not use App for the whole repository when multi-app behavior matters.

### App

An App is a runnable application boundary inside a GoForj Project.

The default app is named `app` and lives in `cmd/app`, `app`, and `app/wire`. Named apps such as `billing` or `reporting` live in `cmd/<app>`, `app/<app>`, and `app/<app>/wire`.

Use App when referring to a generated command surface, binary, app composition files, app-local Wire graph, route exposure, and runtime defaults.

Do not use App to mean a single package, service object, HTTP server, deployment environment, or the whole Project when multiple apps exist.

### Default App

The default app is the conventional app named `app`.

It is the normal single-app path and should appear first in docs. The default app lives directly under `app/` rather than `app/app/`.

### Named App

A Named App is an additional app in the same Project, such as `billing` or `customer-portal`.

Named apps are for meaningful ownership or deployment fan-out within one Project. They are not separate Go modules, separate repositories, or automatic microservices.

### Framework

The Framework is GoForj itself: the generator, templates, conventions, runtime policy, CLI tooling, and first-party integration layer.

Use Framework when discussing GoForj-owned behavior rather than user application code or sibling primitive libraries.

### Stack

The Stack is the cohesive set of GoForj framework behavior plus first-party primitives used by an App.

Use Stack when describing how HTTP, queues, events, scheduler, storage, cache, metrics, inspects, Lighthouse, configuration, and DI work together.

### Module

A Module is a Go module or a major GoForj component area with its own package boundary.

Use Module for repository or Go module boundaries such as `github.com/goforj/queue`, `github.com/goforj/storage`, or a generated application module.

Do not use Module to mean a runtime plugin, provider, or arbitrary folder unless the context is explicitly about Go modules.

### Runtime

A Runtime is an execution surface inside an App.

Examples:

- HTTP runtime
- queue worker runtime
- scheduler runtime
- Lighthouse runtime
- CLI command runtime

Use Runtime when lifecycle, process ownership, startup, shutdown, or operational behavior matters. Apps can expose multiple runtimes.

### Runtime Boundary

A Runtime Boundary is the line where a process or execution surface begins and ends.

Examples:

- HTTP request handling
- a queue worker process
- a scheduler process
- a CLI command
- a Lighthouse process

Docs should name runtime boundaries when behavior differs between surfaces.

### Execution Lifecycle

The Execution Lifecycle is the ordered flow from startup through work execution to shutdown.

Use this term for lifecycle behavior that crosses components:

- boot
- dependency construction
- provider registration
- route/job/schedule registration
- runtime start
- request/job/schedule execution
- graceful shutdown

### Provider

A Provider is a constructor or provider function used to wire dependencies into the App.

In GoForj, providers are normally explicit Go functions connected through Wire or generated wiring. Providers create services, managers, drivers, adapters, configuration objects, and runtime components.

Do not describe providers as hidden runtime registrations.

### Driver

A Driver is a backend implementation selected behind a stable primitive contract.

Examples:

- Redis cache driver
- memory cache driver
- local storage driver
- S3 storage driver
- sync queue driver
- Redis queue driver
- NATS events driver

Use Driver only when the backend implementation can be swapped without changing the application-facing contract.

### Adapter

An Adapter connects GoForj's app-facing contract to another implementation or ecosystem boundary.

Examples:

- `web` Echo adapter
- a framework adapter around an HTTP engine
- a bridge from GoForj primitives to an external protocol

Adapter is narrower than Driver. A Driver is usually backend selection for a primitive; an Adapter is usually contract translation.

### Service

A Service is application-owned behavior with business or application logic.

Services should depend on contracts, repositories, clients, and primitives through explicit constructor injection.

Do not use Service to mean any object in the system. A cache store, queue driver, HTTP router, or storage disk is a primitive, driver, or dependency, not automatically a service.

### Resource

A Resource is a named operational object the App can use or expose.

Examples:

- a named storage disk
- a named cache accessor
- a queue name
- a scheduler job name
- a route
- a metric series
- an inspect record

Use Resource when docs discuss naming, discovery, operational visibility, or Lighthouse surfaces.

### Context

Context has two meanings. Be explicit.

`context.Context` is Go's standard cancellation, deadline, and request-scoped value carrier.

`web.Context` is the HTTP context abstraction owned by `web`.

Avoid using "context" casually to mean background information. Use "background", "setting", or "surrounding model" instead.

### HTTP

HTTP refers to GoForj's web application surface: routes, handlers, controllers, middleware, request lifecycle, responses, route lists, and web telemetry.

Prefer "HTTP" or "web" depending on scope:

- HTTP for protocol and request lifecycle.
- `web` for the GoForj primitive package and abstraction boundary.

### Route

A Route maps an HTTP method and path to a handler through the `web` routing contract.

Routes should be registered through the generated app route surfaces, not by scattering router setup across unrelated packages.

### Controller

A Controller is an HTTP-facing type that groups related route handlers and translates requests into application service calls.

Controllers should be thin. They should validate request shape, call services, and return responses. Business workflows belong in services or domain-owned types.

### Middleware

Middleware is request or execution policy applied around a handler.

For HTTP, middleware belongs near route or router composition. For queues, middleware belongs in queue construction or worker execution policy.

Middleware should not become hidden business logic.

### Event

An Event is a typed fact that something happened.

Events are for publication and fan-out. They are not the default mechanism for durable background work, retries, or job orchestration. Use queues and jobs for that.

### Queue

A Queue is an asynchronous work transport and execution system.

Queue docs should emphasize dispatch, worker lifecycle, retries, backoff, timeouts, and backend selection.

### Job

A Job is a named unit of queued work with a payload and a registered handler.

Jobs should be stable, explicit, and idempotent where retries are possible. Job names are operational identifiers.

### Scheduler

The Scheduler defines recurring work.

Schedules should be registered declaratively, given stable names, and point to domain-owned methods or app-owned command work. Scheduler bootstrap should not accumulate business logic.

### Storage

Storage is the file/blob abstraction for local disks, object stores, and remote filesystems.

Use Disk for a named storage backend resolved through storage configuration or a storage manager.

### Cache

Cache is the key/value abstraction for temporary or derived data.

Use Store for the underlying cache backend. Use Cache for the ergonomic helper layer when relevant. Avoid using cache as durable business storage.

### Metrics

Metrics are numeric operational signals emitted by the App and scraped or exported for observability.

Metrics should use bounded labels, stable names, and operator-facing semantics. Do not call all observability "metrics".

### Observability

Observability is the broader system for understanding runtime behavior: logs, metrics, inspects, route lists, health checks, scheduler views, queue state, and Lighthouse.

Metrics are one part of observability.

### Inspect

An Inspect is a captured execution record for understanding a request, job, scheduler run, CLI execution, or related runtime activity.

Use `inspect` and `inspects` for the product surface. Keep `trace_id` only as the correlation field where the code uses it.

### Lighthouse

Lighthouse is GoForj's local/operator-facing runtime visibility surface.

It aggregates and presents runtime information such as inspects, resources, schedules, storage, cache, logs, and other debugging or operational views.

Do not use Lighthouse as a generic name for all observability. It is a UI/runtime feature that consumes framework surfaces.

### Configuration

Configuration is explicit App settings sourced from environment files, environment variables, generated defaults, and provider wiring.

Docs should distinguish local development configuration from production configuration.

### Dependency Injection

Dependency Injection is explicit construction and passing of dependencies into constructors.

In GoForj docs, dependency injection usually means provider functions plus Wire-generated wiring. Avoid language that suggests a runtime service locator.

### Lifecycle

Lifecycle is startup and shutdown coordination for long-lived runtime components.

Use lifecycle for process-level concerns, not for ordinary method calls.

### Extension Point

An Extension Point is a documented place where user code should customize generated behavior.

Examples:

- `app/lifecycle.go`
- `app/routes.go`
- `app/commands.go`
- `app/schedules.go`
- `app/wire/...`
- `app/<name>/...` for a named app
- provider functions and Wire sets

Docs should prefer extension points over ad hoc edits.

## Terminology Rules

- Use Driver for backend implementations behind a stable primitive contract.
- Use Project for the repository-level GoForj workspace.
- Use App for a runnable boundary inside a Project.
- Use default app and named app when distinguishing `app` from additional apps.
- Use Provider for explicit dependency construction and wiring.
- Use Service for application-owned behavior.
- Use Runtime when discussing process or lifecycle behavior.
- Do not use App target, runtime target, or target as GoForj domain terms.
- Use Resource for named operational objects.
- Use Inspect, not trace, for the product feature.
- Use `trace_id` only when referring to the correlation field.
- Use Lighthouse only for the operator/runtime visibility surface.
- Use Stack when discussing the combined GoForj experience.
- Use Framework when discussing GoForj-owned policy.
