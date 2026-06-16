---
title: Changelog
description: Historical GoForj framework milestones and user-facing changes.
---

# Changelog

This changelog tracks GoForj framework and first-party library milestones.

GoForj is pre-`v1.0`, and several early versions were assigned retrospectively to real development milestones. They are included because they mark substantial framework layers, not because those points were broad public releases.

## First-Party Library Ecosystem

GoForj's framework depth comes from a set of standalone first-party libraries. These packages are not incidental helpers hidden behind the generator. They have their own repositories, version tags, docs, examples, tests, and integration contracts, and they can be used outside a generated GoForj App.

That tag hygiene is intentional. The framework can move quickly because lower-level packages are versioned independently, and generated Apps can pin concrete package versions instead of depending on an untracked internal snapshot.

### Library Release Lines

The library ecosystem has its own release history:

| Library | Current line | What it provides |
| --- | --- | --- |
| `wire` | `v1.2.0` | GoForj-maintained Wire fork with explicit dependency generation, watch workflow support, and a custom loader. |
| `env` | `v2.4.0` | Layered environment loading, typed getters, scoped prefixes, app environment helpers, reload support, and container/runtime detection. |
| `scheduler` | `v2.1.3` | Scheduled work primitives, cron/interval DSL, overlap protection, cache-backed locking, runtime controls, observers, and task context decorators. |
| `collection` | `v2.0.2` | Fluent collection operations with explicit mutation semantics, benchmarked pipelines, map/set helpers, generated examples, and contract tests. |
| `httpx` | `v2.0.1` | HTTP client helpers, request construction, auth helpers, browser profiles, tracing/debugging support, and frozen `v1` compatibility. |
| `godump` | `v1.9.1` | Debug dumping, diff output, color controls, header controls, redaction, depth handling, stringer support, and doc generation. |
| `execx` | `v1.1.0` | Command execution helpers, shadow printing, decoder pipes, and TTY/PTTY behavior for developer tooling. |
| `str` | `v1.3.0` | Rune-safe string helpers, case-fold operations, matching/replacement helpers, plural/singular helpers, and generated API examples. |
| `crypt` | `v1.1.0` | Encryption helpers, key generation, key rotation, and instanced crypt behavior. |
| `web` | `v0.5.2` | Server-side HTTP abstractions, Echo adapter, middleware, route model, route indexing, WebSocket routes, testing helpers, and app-scoped route composition. |
| `queue` | `v0.2.1` | Queue facade, worker runtime, retries, delays, chains, batches, observers, fake/test packages, and multi-backend driver modules. |
| `events` | `v0.1.3` | Event facade, delivery context propagation, fake/test modules, examples, integration module, and transport-backed drivers. |
| `cache` | `v0.3.0` | Cache facade, memory/file/null stores, SQL/Redis/NATS/Memcached/DynamoDB drivers, readiness, inspectors, locks, observers, and integration modules. |
| `storage` | `v0.4.6` | Storage facade, named disks, local/memory/Redis/FTP/SFTP/S3/GCS/Dropbox/rclone drivers, fake/test modules, benchmarks, and capability matrices. |
| `mail` | `v0.2.0` | Mail composition, defaults, attachments, fake/log drivers, SMTP, SES, Mailgun, Postmark, Resend, and SendGrid transports. |
| `metrics` | `v0.1.0` | Counters, gauges, histograms, snapshots, units, names, and Prometheus-compatible export. |

### Foundation Libraries

The early standalone package work made the framework feel like a cohesive Go stack rather than a monolith.

- `godump` started in May 2025 and grew through `v1.9.1`, adding writer output, stringer support, safe stringer recovery, hex dumping, parameter and return type printing, stack frame controls, diff support, no-color/no-header options, field redaction, max-depth fixes, and dependency-light examples.
- `collection` reached `v2.0.2` with a large fluent API, explicit mutable/immutable operation labeling, map helpers, set operations, slicing/windowing, transformations, aggregation, benchmark notes, and generated examples that are tested.
- `str` reached `v1.3.0` with string construction, matching, replacement, plural/singular helpers, trim wrappers, case-fold variants, alpha/alnum/numeric predicates, initials, common prefix/suffix helpers, and generated API docs.
- `httpx` reached `v2.0.1` after freezing `v1`, then moved to clearer `v2` request helpers, auth helpers, browser profiles, client options, tracing, debugging, and generated examples.
- `execx` reached `v1.1.0` with shadow printing, decoder pipelines, TTY passthrough, PTY behavior, and cleaner command-output ergonomics.
- `crypt` reached `v1.1.0` with key generation, key rotation, and instanced methods so generated Apps can avoid global-only crypto helpers.
- `env` reached `v2.4.0` with `.env` layering, `APP_ENV` helpers, typed getters, map/slice parsing, scoped child prefixes, multi-word child discovery, `Load` aliases, reload support, and container/runtime detection.
- `wire` reached `v1.2.0` after GoForj forked the Google Wire lineage, added a watch workflow, and introduced a custom loader with major performance improvements while keeping explicit compile-time dependency injection.

### Runtime Primitive Libraries

The application primitives were built as reusable libraries before and alongside framework integration.

- `scheduler` reached `v2.1.3` with cron and interval scheduling, overlap protection, hooks, command execution, named jobs, job listing, runtime controls, admin surface work, cache-backed locking, observers, and context decorators.
- `web` reached `v0.5.2` after building an Echo-backed adapter, response helpers, cookie and real-IP helpers, WebSocket routes, core middleware, static/proxy/rewrite/security middleware, route models, route list rendering, server bootstrap, lifecycle handling, Prometheus telemetry, web tests, route indexing, and app-scoped route composition.
- `queue` reached `v0.2.1` after adding payload binding, worker and dispatcher behavior, NATS/SQS/RabbitMQ/Redis/MySQL/Postgres/SQLite/SQL-core drivers, fake APIs, integration hardening, retry and recovery policies, chains, batches, workflow callbacks, observer events, context propagation, physical queue name inference, and multi-module release tags for each driver.
- `events` reached `v0.1.3` with facade patterns, Redis/NATS/NATS JetStream/SNS/Kafka/GCP Pub/Sub drivers, fake/test packages, examples, integration modules, delivery context preservation, and driver-level context propagation.
- `cache` reached `v0.3.0` with memory/file/null stores, SQL/Redis/NATS/Memcached/DynamoDB drivers, ready checks, lock support, cache inspectors, `WithContext` facade behavior, observer event payloads, examples, integration modules, and driver-specific release tags.
- `storage` reached `v0.4.6` with local, memory, Redis, FTP, SFTP, S3, GCS, Dropbox, and rclone drivers; named disk management; deterministic listing; directory operations; file counting; context variants; fake/test packages; benchmarks; driver capability matrices; and per-driver tags.
- `mail` reached `v0.2.0` with core message composition, defaults, attachments, fake/log drivers, SMTP, SES, Mailgun, Postmark, Resend, SendGrid, Gmail-over-SMTP guidance, driver capability docs, and package coverage badges across transports.
- `metrics` reached `v0.1.0` with counters, gauges, histograms, snapshots, units, Prometheus export, and the primitive model used by generated App observability.

### Driver and Test Hygiene

The heavier infrastructure packages use separate module and tag lines for drivers, examples, integration suites, and test helpers.

- `queue` publishes driver tags such as `driver/redisqueue`, `driver/postgresqueue`, `driver/mysqlqueue`, `driver/sqlitequeue`, `driver/sqsqueue`, `driver/rabbitmqqueue`, `driver/natsqueue`, plus `examples`, `integration`, and `docs` tags.
- `events` publishes transport and helper tags such as `driver/redisevents`, `driver/natsevents`, `driver/natsjetstreamevents`, `driver/snsevents`, `driver/kafkaevents`, `driver/gcppubsubevents`, `eventscore`, `eventsfake`, `eventstest`, `examples`, and `integration`.
- `cache` publishes driver and helper tags such as `driver/rediscache`, `driver/postgrescache`, `driver/mysqlcache`, `driver/sqlitecache`, `driver/natscache`, `driver/memcachedcache`, `driver/dynamocache`, `driver/sqlcore`, `cachecore`, `cachetest`, `examples`, and `integration`.
- `storage` publishes driver and helper tags such as `driver/localstorage`, `driver/memorystorage`, `driver/redisstorage`, `driver/ftpstorage`, `driver/sftpstorage`, `driver/s3storage`, `driver/gcsstorage`, `driver/dropboxstorage`, `driver/rclonestorage`, `storagecore`, `storagetest`, `examples`, `integration`, and benchmark docs.
- `mail` keeps provider transports split and tested, with coverage tracked across `mail`, `mailfake`, `maillog`, `mailsmtp`, `mailses`, `mailmailgun`, `mailpostmark`, `mailresend`, and `mailsendgrid`.

That hygiene is what lets GoForj generated Apps choose only the drivers they need while still depending on tagged, tested package boundaries.

### Docs and Example Discipline

The libraries also carry documentation infrastructure that feeds the main docs site.

- Many libraries generate README/API sections from public doc comments and runnable examples.
- Example modules are often split out so examples do not bloat downstream dependency trees.
- Example generation and compile checks are part of the maintenance workflow.
- Test count, coverage, driver matrix, benchmark, and capability sections are embedded directly in library docs where they help users choose a primitive.

The framework changelog below focuses on how those independently versioned libraries became a cohesive generated App experience.

## v0.18.0

Released June 16, 2026.

### Multi-App Architecture

- Added first-class support for one GoForj Project containing multiple runnable Apps.
- Added the default App at `app/` with its binary entrypoint at `cmd/app/main.go`.
- Added named Apps under `app/<name>/` with matching binary entrypoints under `cmd/<name>/main.go`.
- Added app-prefixed command routing such as `forj marketplace route:list`, `forj marketplace make:controller checkout`, and `forj marketplace build`.
- Updated `make:*` commands so an app prefix writes generated code into the selected App's registration and Wire files.
- Moved generated app composition into app-owned files such as `commands.go`, `routes.go`, `schedules.go`, `lifecycle.go`, and `root_cmd.go`.
- Renamed the public domain model from app targets to Apps.
- Added app-aware rendering, discovery, configuration, runtime metadata, and generated tests.

### Runtime, Build, and Dev

- Added app-scoped build and run behavior.
- Added multi-app `forj dev` support.
- Added deterministic runtime ports for named Apps.
- Added app-scoped OpenAPI and API index output.
- Added app-scoped migrations.
- Added multi-app render and integration smoke coverage.
- Reduced render dependency sync work by avoiding unnecessary `go get` calls.
- Integrated `web v0.5.x` route composition support so route indexes and OpenAPI output can be scoped by App.

### Observability

- Added app identity to runtime metrics and Lighthouse metadata.
- Updated Grafana dashboards so app signals can be filtered and grouped.
- Updated Lighthouse display to show Apps and runtimes instead of target-oriented language.

## v0.17.0

Released June 3, 2026.

### Make Commands and App Composition Groundwork

- Added removal flow support for generated make command artifacts.
- Improved generated CLI ergonomics.
- Added app composition layout design work that became the basis for multi-app architecture.
- Added database and cache shell commands.
- Added event subscriber generation.
- Added queue resource maker workflow.
- Added editor-open hooks for generated controller and make command flows.
- Moved make generators deeper into the generated app command surface.
- Simplified generated CLI help output.
- Stabilized rendered app tests around the expanded generator surface.

## v0.16.0

Released June 1, 2026.

### Generated App Command Ergonomics

- Added schedule generator support.
- Cleaned up generated app command UX.
- Simplified app command delegation in the CLI.
- Improved generated queue developer experience.
- Logged queue worker allocations on startup.
- Made Grafana bind mounts friendlier to rootless local development.
- Added the first app composition layout proposal.

## v0.15.0

Released May 26, 2026.

### Runtime Command Aliases and Build Stabilization

- Added runtime aliases for generated app commands.
- Passed local app commands through the `forj` command surface.
- Made run progress transient so command output stays easier to scan.
- Simplified release version output.
- Added the MIT license.
- Added migration translation design notes.

## v0.14.0

Released May 22, 2026.

### Runtime Performance and Inspect Overhead

- Reduced inspect, logger, and metrics overhead on HTTP request paths.
- Streamlined Lighthouse inspect transport.
- Introduced structured logger pipeline and profiling harnesses.
- Moved maintainer benchmarks into internal packages.
- Tightened source and local error middleware paths.
- Refined frontend monitoring visuals and loading behavior.
- Restored SPA fallback routing under the web adapter.

## v0.13.0

Released May 20, 2026.

### Lighthouse Execution Inspection

- Added Lighthouse execution inspection as a framework capability.
- Captured runtime behavior across HTTP, jobs, scheduler, mail, cache, storage, events, database, and logging paths.
- Added encrypted command routing and inspect transport integration.
- Added inspect browsing and detail views in Lighthouse.
- Added inspect dashboards and overhead benchmarks.
- Switched primitive integrations toward structured event records.
- Hardened render, Lighthouse, metrics, and generated inspect tests.
- Reduced slow integration outliers and reused integration database containers where possible.

## v0.12.0

Released May 6, 2026.

### Runtime Source Attribution

- Unified execution source attribution across framework ingress points.
- Propagated source identity through generated HTTP, command, queue, scheduler, and event paths.
- Verified source propagation with framework tests.
- Split generated primitive accessors into dedicated generated files.
- Refined context guidance for generated runtime behavior.
- Synced generated module pins and rendered auth tests.

## v0.11.0

Released May 2, 2026.

### Metrics and Observability

- Added the metrics framework milestone.
- Introduced the standalone `metrics` library release line.
- Added database query fingerprinting.
- Added per-surface instrumentation toggles.
- Generated topology-aware metrics targets.
- Added overhead comparison commands for metrics.
- Refined observability dashboards across primitives.
- Moved metrics overhead guidance into maintainer docs.

## v0.10.0

Released April 27, 2026.

### Vue Starter Kit

- Added the Vue starter kit foundation.
- Added generated auth registration and recovery screens.
- Added login loading and feedback behavior.
- Added starter kit auth strengthening.
- Added Mailpit local development support.
- Integrated `mail` library transport work into generated auth mail delivery.
- Refined sidebar, command menu, scrolling, and route overlay behavior.
- Added starter kit documentation and design context.

## v0.9.1

Released April 21, 2026.

### Lighthouse Polish and Atlas Groundwork

- Streamlined Lighthouse dashboard summaries.
- Improved env editor behavior and route editing affordances.
- Added validation for editor symbols in bulk operations.
- Continued Lighthouse UI and table styling cleanup.
- Added early Atlas MCP server design context.

## v0.9.0

Released April 20, 2026.

### Web, Auth, Mail, and Lighthouse Foundations

- Expanded generated web, auth, mail, and Lighthouse foundations.
- Integrated the standalone `web`, `mail`, `queue`, `cache`, `storage`, and `scheduler` libraries into the generated App model.
- Added generated auth implementation, including users, sessions, password reset, email verification, login attempts, and OAuth provider scaffolding.
- Added generated auth commands for creating users and setting passwords.
- Added generated mail support and auth delivery integration.
- Expanded Lighthouse templates, UI, transport, project config, and generated routes.
- Added generated lifecycle behavior and runtime timeout handling.
- Added generated readiness, health, Swagger, route list, and HTTP server improvements.
- Added a component catalog and project renderer module replacement support.
- Added integration testkit helpers for containers, compose, temp dirs, render harnesses, and repo setup.
- Added substantial design and context documentation for auth, mail, metrics, runtime architecture, observability, and repository boundaries.

## v0.8.0

Released February 13, 2026.

### Events, API Index, OpenAPI, and Lifecycle

- Added eventing support.
- Added API index generation and build commands.
- Added OpenAPI and Swagger generation hardening.
- Added startup and lifecycle hooks.
- Added health and readiness probes.
- Added queue and cache abstractions.
- Adopted standalone `queue`, `events`, and `cache` package behavior for generated App primitives.
- Added graceful workerpool and dispatcher shutdown behavior.
- Ported database integration tests.
- Added `test:openapi`.
- Added `run` to start API, scheduler, and jobs together.

## v0.7.0

Released February 10, 2026.

### Demo Monitoring Stack and Native Dev Loop

- Added the demo monitoring stack.
- Added monitor operations tooling.
- Added native `wgo`-based local development loop behavior.
- Added monitor polling, incidents, notification providers, channel validation, and settings.
- Added demo persistence and repository consolidation.
- Added demo seeding and diagnostics pages.
- Avoided embedding frontend node dependencies in rendered output.
- Exercised the generated database, queue, scheduler, cache, storage, command, and frontend paths through a realistic generated product.

## v0.6.0

Released February 6, 2026.

### Dev Console Runtime

- Shipped Dev Console UI and runtime.
- Refactored template embedding.
- Hardened command generation.
- Added command console coloring fixes.
- Added `DEVCONSOLE_ENABLED` gating.
- Overhauled `forj new` after the first dev console pass.
- Built on the first standalone command execution and watcher utility work that later became part of the developer toolchain.

## v0.5.0

Released January 14, 2026.

### Generated Logging

- Added structured generated application logging work.
- Improved logging behavior in generated apps.
- Prepared the local runtime surface for richer dev console and watcher behavior.

## v0.4.0

Released January 13, 2026.

### Database Architecture

- Re-architected database connections.
- Added connection-aware migrations.
- Added model and repository generation pairing.
- Added repository Wire injection.
- Added many-to-many and polymorphic relationship support.
- Added field encryption and decryption support.
- Added PostgreSQL and SQLite support.
- Added migration docs and database render/integration coverage.

## v0.3.0

Released December 16, 2025.

### Project Creation and Command UX

- Improved the `forj new` flow with validation, path selection, cancellation, hotkeys, and clearer terminal presentation.
- Ran Wire generation after project creation.
- Added `--version`.
- Added route listing on boot.
- Refined CLI help alignment and command grouping.
- Moved environment and crypt packages toward first-party module ownership.
- Established early use of `env`, `crypt`, `execx`, and `wire` as project-owned building blocks instead of hidden framework internals.

## v0.2.0

Released May 28, 2025.

### Renderer and Generator Foundation

- Expanded the project renderer.
- Added render-once templates.
- Added route list command support.
- Split registration points for commands, controllers, schedules, and HTTP wiring.
- Added initial CI render coverage.
- Added many missing templates for generated Apps.
- Improved `make:command` and `make:controller` injection behavior.
- Hardened rendered test coverage around generated projects.

## v0.1.x

Released May 26 through December 6, 2025.

### Early Framework and Package Foundation

- Established the early GoForj repository and CLI shape.
- Added the first project renderer and generated app templates.
- Added early `make:command` behavior.
- Added early build and render test workflows.
- Added the table package.
- Moved `env` and `crypt` toward top-level package ownership.
- Added the env runtime.
- Iterated on Docker-in-Docker, render tests, and CI setup.
- Started the first-party package strategy that later produced standalone libraries for collections, strings, HTTP utilities, dumps, execution, configuration, encryption, queues, events, cache, storage, scheduler, web, mail, metrics, and wiring.
