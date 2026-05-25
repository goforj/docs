# GoForj Runtime Topology Model

## Purpose

This file defines how docs should explain GoForj runtime topology, process ownership, and lazy infrastructure initialization.

The source context shows this is important enough to be a dedicated documentation model.

## Core Runtime Distinction

GoForj has logical runtimes:

- HTTP/API runtime
- jobs runtime
- scheduler runtime
- CLI command runtime
- Lighthouse/runtime visibility surfaces

These logical runtimes may run:

- together in one process
- separately as leaf runtime commands
- under `forj dev`
- in distributed deployment topology

Docs must not collapse these into one vague "app runtime".

## Commands

Generated Apps expose both combined and leaf runtime commands:

- `forj run run`
- `forj run http:serve`
- `forj run queue:work`
- `forj run schedule:run`
- `forj run route:list`

The combined command is the normal local host path. Leaf commands remain important for production, explicit debugging, and distributed process layouts.

## Standalone Versus Distributed

Docs should explain topology separately from business logic.

Standalone mode:

- can run multiple logical runtimes in one OS process
- supports local and process-local drivers honestly
- is good for local development and simple deployment
- should preserve logical identity for logs, metrics, and Lighthouse

Distributed mode:

- runs HTTP, jobs, scheduler, and related surfaces as separate processes
- requires shared infrastructure for cross-process behavior
- keeps the same business code
- changes topology and configuration, not application architecture

Do not imply process-local drivers behave as shared infrastructure across distributed processes.

## Lazy Infrastructure Initialization

GoForj should document lazy initialization precisely.

Constructors should usually be cheap:

- capture config
- build factories
- prepare managers
- register dependencies

First use should initialize infrastructure:

- database handle use
- queue dispatch
- event publish
- storage operation
- cache operation

Runtime-owned eager start remains correct for:

- HTTP listener startup
- queue worker polling
- scheduler ticking
- explicit migrations
- readiness checks
- startup hooks that intentionally validate infrastructure

## Fail-Fast Nuance

GoForj favors fail-fast behavior for bad wiring and required runtime dependencies.

That does not mean every command should eagerly connect to every configured backend.

Docs should distinguish:

- fail fast on required dependency use
- fail fast on invalid generated configuration
- lazy initialize unrelated infrastructure for commands that do not use it
- eagerly initialize infrastructure when the runtime owns it

This nuance prevents two bad doc patterns:

- claiming GoForj hides all infrastructure failures until later
- claiming every command must fail if any configured backend is unavailable

## Observability Identity

Runtime topology affects:

- log component identity
- metrics labels
- Lighthouse agent identity
- inspect source
- health/readiness behavior

Docs should preserve logical runtime labels such as `http`, `jobs`, `scheduler`, `cli`, and `startup` even when runtimes share one process.

## Documentation Requirements

Every operations page for a runtime should state:

- command
- process model
- standalone behavior
- distributed behavior
- startup ownership
- shutdown ownership
- metrics identity
- Lighthouse identity
- lazy versus eager infrastructure behavior

## Artifacts Needed

Recommended public docs:

- `core/runtime-topology.md`
- `operations/runtime-processes.md`
- `operations/standalone-vs-distributed.md`
- `operations/lazy-initialization.md`

