# GoForj Runtime Topology Model

## Purpose

This file defines how docs should explain GoForj runtime topology, process ownership, and infrastructure startup.

The source context shows runtime topology, startup, and readiness behavior are important enough to be a dedicated documentation model.

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

- `forj app`
- `forj api`
- `forj worker`
- `forj scheduler`
- `forj route:list`

The combined command is the normal local host path. Leaf commands remain important for production, explicit debugging, and distributed process layouts.

Built binaries should usually be documented with their direct command surface:

- `./bin/app run`
- `./bin/app api`
- `./bin/app worker`
- `./bin/app scheduler`
- `./bin/app migrate`

Use `forj ...` when documenting developer CLI behavior inside a generated App. Use `forj run ...` only when documenting the explicit App-command path or a collision escape hatch. Use `./bin/app ...` when documenting deployment and process supervision.

When explaining command execution, keep the surfaces distinct:

- `forj <native-command>` runs Framework-owned commands.
- `forj <app-command>` delegates to the generated App when no native command matches.
- `forj run <app-command>` forces the source-aware App-command path.
- `./bin/app <command>` runs the built binary and is the deployment/runtime surface.

Do not imply App-owned generation logic moved into the Framework CLI. `forj` may route commands, but App-owned generators and commands remain generated App code so they can use App configuration, dependencies, and wiring.

## Default Launch Binaries

`forj build --auto-run` can compile a default launch target into the binary.

When present, running the binary with no command starts the standalone App runtime:

```bash
./bin/app
```

This should be described as equivalent to the standalone launch command:

```bash
./bin/app run
```

Explicit commands still win. If a supervisor runs `./bin/app api`, `./bin/app worker`, or another command, the binary runs that command instead of the default launch target.

Docs should frame this as a packaging convenience for single-process services, not as a replacement for explaining topology.

## Standalone versus Distributed

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

## Infrastructure Startup

GoForj docs should not claim general deferred infrastructure startup unless the generated App and selected driver explicitly implement it.

Constructors should usually stay cheap:

- capture config
- build factories
- prepare managers
- register dependencies

Runtime-owned startup remains correct for:

- HTTP listener startup
- queue worker polling
- scheduler ticking
- explicit migrations
- readiness checks
- startup hooks that intentionally validate infrastructure

## Fail-Fast Nuance

GoForj favors fail-fast behavior for bad wiring and required runtime dependencies.

That does not mean docs should invent lazy backend behavior.

Docs should distinguish:

- fail fast on required dependency use
- fail fast on invalid generated configuration
- avoid touching unrelated infrastructure from commands that do not use it
- initialize infrastructure when the runtime owns it or readiness requires it

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
- infrastructure startup and readiness behavior

## Artifacts Needed

Recommended public docs:

- `core/runtime-topology.md`
- `operations/runtime-processes.md`
- `operations/standalone-vs-distributed.md`
- `operations/health-readiness.md`
