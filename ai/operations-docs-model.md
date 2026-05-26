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

- command: `forj run api`
- built binary command: `./bin/app api`
- combined runtime command: `forj run app`
- built standalone command: `./bin/app run`
- route registration
- middleware stack
- health and readiness routes
- request logging
- HTTP metrics
- request inspects
- graceful shutdown
- route visibility through `forj run route:list`

Avoid:

- underlying adapter internals in beginner operations pages
- full route dumps in boot output

### Queue Workers

Document:

- command: `forj run worker`
- built binary command: `./bin/app worker`
- handler registration before worker start
- driver behavior
- retry and timeout behavior
- graceful shutdown
- worker metrics
- job inspects
- queue state visibility
- production process supervision

Explain that queue dispatch and queue work are separate concerns.

### Scheduler

Document:

- command: `forj run scheduler`
- built binary command: `./bin/app scheduler`
- schedule registration in `internal/scheduler/scheduler_registry.go`
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
- `forj run ...` as developer CLI pass-through
- `./bin/app ...` as the built App command surface
- default-launch behavior from `forj build --auto-run` when relevant
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

For topology pages, include a short section for default-launch binaries when the page discusses standalone process deployment. State that `forj build --auto-run` makes `./bin/app` launch the standalone runtime with no arguments, while explicit runtime commands continue to behave normally.

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
