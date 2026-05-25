# GoForj Architecture Model

## Purpose

This file gives future documentation sessions a high-level architecture model for GoForj.

It is not API reference. It explains relationships and lifecycle boundaries so docs reason about the system correctly.

## Top-Level Model

GoForj applications are generated Go applications with explicit runtime composition.

The framework provides:

- a generated project structure
- app-level configuration conventions
- runtime lifecycle coordination
- first-party primitives
- driver and provider wiring
- command and developer tooling through `forj`
- observability and Lighthouse integration

The App owns its business code. The Framework owns the generated shape and runtime policy. Sibling primitive modules own reusable contracts and drivers.

## Boot Process

The normal boot process is:

1. command entrypoint starts
2. environment and configuration load
3. providers construct dependencies
4. Wire-generated code assembles the object graph
5. runtime policy such as timeouts and lifecycle registries resolve near the root
6. routes, jobs, events, schedules, storage disks, caches, metrics, and Lighthouse surfaces register
7. the selected runtime starts
8. graceful shutdown runs when the process is canceled or exits

Docs should describe boot as explicit construction and registration, not discovery through hidden runtime magic.

## Provider Lifecycle

Providers construct dependencies.

Typical provider responsibilities:

- parse component configuration
- create drivers
- create managers
- create services
- create controllers
- create runtime objects
- expose interfaces consumed by other services

Providers should be deterministic and fail during boot when required dependencies cannot be constructed.

## Dependency Injection Flow

GoForj uses explicit dependency injection.

The normal flow is:

1. define constructors for app services and runtime components
2. define provider functions or provider sets
3. let Wire generate construction code
4. pass concrete dependencies into constructors
5. run the assembled App

Docs should avoid runtime service locator language.

## Runtime Lifecycle

The root runtime coordinates long-lived components.

Important concepts:

- `internal/app` owns app-level lifecycle policy
- lifecycle hooks register at documented extension points
- root timeouts resolve once and are passed down
- long-lived runtimes own their own start/stop behavior
- optional subsystems may degrade explicitly

Docs should explain lifecycle only when the feature starts, stops, or observes long-running work.

## HTTP Request Lifecycle

The HTTP lifecycle is:

1. HTTP runtime starts
2. middleware wraps route handlers
3. request enters through the `web` adapter
4. handler receives `web.Context`
5. controller parses request and calls services
6. services perform business work through injected dependencies
7. response is written through `web.Context`
8. metrics, logs, and inspects capture operational data

The underlying HTTP engine is behind the `web` adapter. Normal app docs should teach `web.Context`, route groups, middleware, controllers, and services.

## Queue Lifecycle

The queue lifecycle is:

1. queue driver is configured and constructed
2. job handlers are registered by name
3. jobs are dispatched with typed payloads
4. worker runtime starts
5. workers reserve or receive jobs from the driver
6. handlers bind payloads and call services
7. retries, backoff, timeout, metrics, and inspects apply according to queue behavior
8. worker runtime shuts down gracefully

Queue drivers differ operationally. Docs should separate queue contract from backend behavior.

## Job Lifecycle

A job lifecycle is:

1. app code builds a job with name and payload
2. queue dispatch persists, sends, or executes according to driver
3. worker receives the job
4. handler binds payload
5. handler calls domain service
6. success or failure is recorded
7. retry or failure behavior runs when configured

Docs should teach jobs as named, observable, retry-aware work units.

## Event Lifecycle

The event lifecycle is:

1. app code publishes a typed event
2. event bus resolves the topic
3. subscribers receive the event
4. subscriber handlers react
5. delivery behavior depends on driver

Events are for facts and fan-out. They are not the default durable work mechanism.

## Scheduler Lifecycle

The scheduler lifecycle is:

1. scheduler runtime starts
2. schedules register declaratively
3. each schedule has a stable name and timing expression
4. scheduler evaluates filters and overlap constraints
5. job function or command runs
6. hooks, metrics, inspects, and Lighthouse metadata capture behavior
7. scheduler stops on process shutdown

The registry should point to domain-owned methods. Scheduler runtime files should remain focused on bootstrap and lifecycle.

## Storage Flow

The storage flow is:

1. storage configuration defines default and named disks
2. providers construct the storage manager and drivers
3. app code resolves the required disk or named accessor
4. app code reads, writes, lists, deletes, or requests URLs through the storage contract
5. unsupported capabilities return explicit errors
6. optional disks may degrade independently when designed that way

Docs should show named disks before direct driver use.

## Cache Flow

The cache flow is:

1. cache configuration selects store drivers and defaults
2. providers construct stores and cache helpers
3. app or framework code uses named cache accessors
4. cache operations set, get, remember, delete, lock, or rate-limit with explicit TTLs
5. misses and expirations are normal behavior
6. metrics and Lighthouse surfaces may expose named cache behavior

Docs should keep cache separate from durable storage.

## Metrics Collection Flow

The metrics flow is:

1. metrics registry is constructed at startup
2. framework and app metrics register once
3. runtime components update metrics on hot paths
4. `/metrics` exposes snapshots in Prometheus-compatible format
5. external tools validate dashboards and alerts
6. Lighthouse can adapt proven metric semantics into operator views

Metrics should be bounded, low-cardinality, and operator-facing.

## Inspect Pipeline

The inspect pipeline is:

1. source runtime starts an inspect for a request, job, scheduler run, CLI command, or related execution
2. events are appended during execution
3. payload capture remains bounded and safe
4. the inspect finishes
5. source runtime publishes finished inspect records through a bounded path
6. Lighthouse retains and displays recent inspects

Use `inspect` for the feature. Use `trace_id` only for correlation fields.

## Lighthouse Architecture

Lighthouse is an operator-facing runtime visibility surface.

It should consume stable framework surfaces:

- routes
- logs
- inspects
- storage resources
- cache accessors
- scheduler metadata
- queue state
- metrics-derived views

Lighthouse should not invent backend semantics that are not already sound at the primitive or metrics layer.

## Local-First Infrastructure

GoForj supports local-first infrastructure through local and in-process drivers:

- memory cache
- file cache
- local storage
- memory storage
- sync events
- null events
- sync queue
- workerpool queue
- local scheduler
- local metrics endpoint

Distributed drivers should be introduced as production or integration choices, not as prerequisites for understanding the framework.

## Boundary Rules

- App policy belongs in the generated App and GoForj templates.
- Reusable primitive behavior belongs in sibling repos.
- Driver-specific behavior belongs in driver packages.
- Operator UI shaping belongs in Lighthouse integration files.
- Business logic belongs in application services, jobs, subscribers, or domain-owned methods.
- Runtime bootstrap belongs at runtime boundaries.

