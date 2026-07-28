# GoForj Terminology

## Purpose

This file defines canonical terminology for GoForj documentation.

Use these terms when the distinction matters. In ordinary prose, prefer familiar concrete nouns over framework taxonomy.

Lead with what developers build or do: "send mail," "register a route," "run queue workers," or "configure Redis." Avoid using `surface`, `shape`, `primitive`, or `composition` as catch-all substitutes for the specific file, command, capability, process, or boundary involved.

Prefer lowercase **app** in ordinary prose. Use **App** only when deliberately naming the runnable-boundary concept defined below or distinguishing it from a Project or Runtime.

## Canonical Terms

### Project

A Project is the repository-level GoForj workspace created by `forj new`.

Use Project when discussing `.goforj.yml`, selected components, shared internal packages, generated infrastructure, and the collection of one or more runnable apps.

Do not use App for the whole repository when multi-app behavior matters.

### App

An App is a runnable application boundary inside a GoForj Project.

The default app is named `app` and lives in `cmd/app`, `app`, and `app/wire`. An additional app such as `admin` lives in `cmd/<app>`, `app/<app>`, and `app/<app>/wire`.

Use App when the runnable boundary itself is the subject, especially when distinguishing apps in a multi-app Project. Otherwise, name the app binary, commands, files, Wire graph, routes, or runtime defaults directly.

Do not use App to mean a single package, service object, HTTP server, deployment environment, or the whole Project when multiple apps exist.

### Default App

The default app is the conventional app named `app`.

It is the normal single-app path and should appear first in docs. The default app lives directly under `app/` rather than `app/app/`.

### Additional App

An additional app is another runnable app in the same Project, such as `admin`.

Additional apps are for meaningful ownership or deployment fan-out within one Project. They are not separate Go modules, separate repositories, or automatic microservices.

### Framework

The Framework is GoForj itself: the generator, templates, conventions, runtime policy, CLI tooling, and first-party integration layer.

Use Framework when discussing GoForj-owned behavior rather than user application code or standalone first-party libraries.

### Stack

The Stack is the cohesive set of GoForj framework behavior plus first-party libraries used by an app.

Use Stack sparingly when describing GoForj as a whole. In task documentation, name the relevant capabilities.

### Module

A Module is a Go module or a major GoForj component area with its own package boundary.

Use Module for repository or Go module boundaries such as `github.com/goforj/queue`, `github.com/goforj/storage`, or a generated application module.

Do not use Module to mean a runtime plugin, provider, or arbitrary folder unless the context is explicitly about Go modules.

### Runtime

A Runtime is a process role inside an App.

Examples:

- HTTP runtime
- queue worker runtime
- scheduler runtime
- Lighthouse runtime
- CLI command runtime

Use Runtime when lifecycle, process ownership, startup, shutdown, or operational behavior matters. Apps can expose multiple runtimes.

### Runtime Boundary

A Runtime Boundary is the line where a process or unit of execution begins and ends.

Examples:

- HTTP request handling
- a queue worker process
- a scheduler process
- a CLI command
- a Lighthouse process

Docs should name runtime boundaries when behavior differs between HTTP requests, workers, schedules, commands, or other execution paths.

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

A Driver is a backend implementation selected behind a stable application-facing contract.

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
- a bridge from a GoForj library to an external protocol

Adapter is narrower than Driver. A Driver usually selects a backend; an Adapter usually translates between contracts.

### Service

A Service is application-owned behavior with business or application logic.

Services should depend on contracts, repositories, clients, and infrastructure dependencies through explicit constructor injection.

Do not use Service to mean any object in the system. A cache store, queue driver, HTTP router, or storage disk is a specific dependency, not automatically a service.

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

Use Resource when docs discuss naming, discovery, operational visibility, or Lighthouse views. When possible, use the concrete noun: disk, cache, queue, route, metric, or inspect.

### Context

Context has two meanings. Be explicit.

`context.Context` is Go's standard cancellation, deadline, and request-scoped value carrier.

`web.Context` is the HTTP context abstraction owned by `web`.

Avoid using "context" casually to mean background information. Use "background", "setting", or "surrounding model" instead.

### HTTP

HTTP refers to routes, handlers, controllers, middleware, request lifecycle, responses, route lists, and web telemetry.

Prefer "HTTP" or "web" depending on scope:

- HTTP for protocol and request lifecycle.
- `web` for the GoForj package and abstraction boundary.

### Route

A Route maps an HTTP method and path to a handler through the `web` routing contract.

Routes should be registered in `app/routes.go` or the corresponding owning app file, not by scattering router setup across unrelated packages.

### Controller

A Controller is an HTTP-facing type that groups related route handlers and translates requests into application service calls.

Controllers should be thin. They should validate requests, call services, and return responses. Business workflows belong in services or domain-owned types.

### Middleware

Middleware is request or execution policy applied around a handler.

For HTTP, middleware belongs near route or router setup. For queues, middleware belongs in queue construction or worker execution policy.

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

Use `inspect` and `inspects` for the feature. Keep `trace_id` only as the correlation field where the code uses it.

### Lighthouse

Lighthouse is GoForj's local and operator-facing runtime UI.

It aggregates and presents runtime information such as inspects, resources, schedules, storage, cache, logs, and other debugging or operational views.

Do not use Lighthouse as a generic name for all observability. It presents logs, inspects, routes, schedules, cache, storage, and other runtime information.

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
- `app/<name>/...` for an additional app
- provider functions and Wire sets

Docs should prefer extension points over ad hoc edits.

## Terminology Rules

- Use Driver for backend implementations behind a stable application-facing contract.
- Use Project for the repository-level GoForj workspace.
- Prefer app in ordinary prose. Use App when deliberately naming the runnable-boundary concept inside a Project.
- Use default app and additional app when distinguishing `app` from other apps in the Project.
- Use Provider for explicit dependency construction and wiring.
- Use Service for application-owned behavior.
- Use Runtime when discussing process or lifecycle behavior.
- Do not use App target, runtime target, or target as GoForj domain terms.
- Use Resource for named operational objects when the shared category matters; otherwise name the object.
- Use Inspect, not trace, for the product feature.
- Use `trace_id` only when referring to the correlation field.
- Use Lighthouse only for the operator/runtime UI.
- Use Stack sparingly when discussing the combined GoForj experience.
- Use Framework when discussing GoForj-owned policy.
- Avoid surface, shape, primitive, and composition when a concrete noun is available.
- Use generated only when creation, ownership, regeneration, or safe editing matters.
