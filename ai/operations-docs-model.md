# GoForj Operations Docs Model

## Purpose

This file defines how GoForj should document runtime and production behavior.

Operations docs should make GoForj feel explicit, inspectable, and trustworthy.

## Operations Principle

Every runtime surface should answer:

- what process runs
- what starts during boot
- what must be registered before start
- how shutdown works
- how configuration affects behavior
- how health is checked
- how logs, metrics, inspects, and Lighthouse expose behavior
- what failure modes look like

## Runtime Surfaces

### HTTP Server

Document:

- command: `forj api`
- named app command: `forj <app> api`
- built binary command: `./bin/app api`
- named app binary command: `./bin/<app> api`
- combined runtime command: `forj app`
- built standalone command: `./bin/app` or `./bin/app run`
- route registration
- middleware stack
- health and readiness routes
- request logging
- HTTP metrics
- request inspects
- graceful shutdown
- route visibility through `forj route:list`
- named app route visibility through `forj <app> route:list`

Avoid:

- underlying adapter internals in beginner operations pages
- full route dumps in boot output

### Queue Workers

Document:

- command: `forj worker`
- named app command: `forj <app> worker`
- built binary command: `./bin/app worker`
- named app binary command: `./bin/<app> worker`
- default queue behavior: no `--queue` starts every configured generated queue
- queue selection: `--queue <name>` starts only the selected named queue; repeat for a subset
- priority model: named queues plus worker allocation, for example `QUEUE_EMAILS_WORKERS=6` and `QUEUE_REPORTS_WORKERS=2`
- handler registration before worker start
- driver behavior
- retry and timeout behavior
- graceful shutdown
- worker metrics
- job inspects
- queue state visibility
- production process supervision
- app-prefixed backend queue names for named apps

Explain that queue dispatch and queue work are separate concerns.

Keep backend-specific priority knobs secondary. The framework docs should lead with named queues and process sizing, then mention driver-specific weighting only when a backend page requires it.

### Scheduler

Document:

- command: `forj scheduler`
- named app command: `forj <app> scheduler`
- built binary command: `./bin/app scheduler`
- named app binary command: `./bin/<app> scheduler`
- generated schedule command: `forj make:schedule <name> --every <duration>`
- schedule registration in `app/schedules.go`
- named app schedule registration in `app/<app>/schedules.go`
- App-owned schedule providers in `app/wire/inject_schedules_app.go`
- named app schedule providers in `app/<app>/wire/inject_schedules_app.go`
- stable schedule names
- overlap control
- scheduler metrics
- scheduler inspects
- Lighthouse schedule controls
- graceful shutdown
- sub-minute or long-running schedule caveats when relevant

### Commands

Document:

- generated command surfaces
- `forj ...` as the normal default app development surface inside a generated Project
- `forj <app> ...` as the named app development surface
- native `forj` commands taking precedence over delegated App commands
- `forj run ...` as the explicit App-command path or collision escape hatch
- `./bin/app ...` as the built App command surface
- `./bin/<app> ...` as a named app built command surface
- bare runtime launch behavior for runtime-capable App binaries when relevant
- command lifecycle
- context cancellation
- logging
- exit behavior
- testing commands

Commands should be treated as runtime entrypoints, not shell scripts around the App.

### Metrics

Document:

- metric enablement
- `/metrics` exposure
- per-surface toggles
- bounded labels
- app identity labels
- runtime/process labels
- local scrape workflow
- production scrape workflow
- dashboard validation
- overhead considerations

Metrics docs should explain what operators can learn, not only what series exist.

### Inspects

Document:

- what source creates an inspect
- when an inspect starts and finishes
- retention and bounded payload behavior
- safe capture rules
- how to read timelines
- how request, job, scheduler, and CLI inspects differ
- Lighthouse as the recent-view owner

Never show secrets in inspect examples.

### Lighthouse

Document:

- local/operator role
- agent/runtime relationship
- resource visibility
- degraded state behavior
- commands and controls
- relationship to metrics and inspects

Lighthouse should consume stable semantics. It should not be the first place a runtime concept is defined.

## Standard Operations Page Sections

Use these sections for long-running runtimes:

1. `## Process Model`
2. `## Command`
3. `## Startup`
4. `## Shutdown`
5. `## Configuration`
6. `## Health and Readiness`
7. `## Logs`
8. `## Metrics`
9. `## Inspects`
10. `## Lighthouse`
11. `## Failure Modes`
12. `## Production Checklist`

Skip sections that truly do not apply, but do not omit lifecycle, configuration, or failure modes for long-running processes.

For topology pages, include a short section for bare binaries when the page discusses standalone process deployment. State that runtime-capable Apps make `./bin/app` equivalent to `./bin/app run` without a build flag, while explicit runtime commands continue to behave normally. Note that CLI-only binaries retain root help behavior.

## Failure Mode Language

Explain failure modes concretely:

- what failed
- where it appears
- whether the subsystem is required or optional
- whether the runtime exits or degrades
- what operator action is expected

Good:

> If the optional `uploads` disk cannot be constructed, the App should report the disk as unavailable instead of silently hiding it.

Avoid:

> Storage errors may occur.

## Degraded Subsystems

Document degradation when optional infrastructure is unavailable.

Rules:

- required dependencies should fail fast
- optional resources may degrade explicitly
- degraded state should be visible in logs and Lighthouse
- repeated low-level noise should not replace one clear warning

## Production Checklists

Every production operations page should include a short checklist.

Example:

- runtime command is supervised
- environment is explicit
- shutdown timeout is configured
- metrics are scraped
- logs are collected
- health/readiness checks are configured
- driver dependencies are reachable
- retries and timeouts are understood
- Lighthouse access is controlled if enabled
