---
title: Changelog
description: Historical GoForj framework milestones and user-facing changes.
---

# Changelog

This changelog tracks framework-level GoForj milestones.

GoForj is pre-`v1.0`, and several early versions were assigned retrospectively to real development milestones. They are included because they mark substantial framework layers, not because those points were broad public releases.

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

## v0.6.0

Released February 6, 2026.

### Dev Console Runtime

- Shipped Dev Console UI and runtime.
- Refactored template embedding.
- Hardened command generation.
- Added command console coloring fixes.
- Added `DEVCONSOLE_ENABLED` gating.
- Overhauled `forj new` after the first dev console pass.

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
