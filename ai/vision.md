# GoForj Documentation Vision

## Purpose

This file defines the long-term documentation vision for GoForj.

GoForj docs should help developers understand how to build, run, and operate real Go applications with a cohesive application stack. The docs should not only explain individual packages. They should teach the application model that connects HTTP, commands, jobs, queues, events, scheduler, storage, cache, metrics, inspections, Lighthouse, configuration, and dependency injection into one predictable system.

## Framework Identity

GoForj is a composable application stack for Go.

It provides a complete application experience while remaining Go-native:

- explicit dependency wiring
- conventional generated structure
- infrastructure swappability through drivers and providers
- local-first development
- production-oriented runtime behavior
- first-party tooling through `forj`
- auditable lifecycle and operational surfaces

GoForj is not a dynamic-language framework translated into Go. It takes inspiration from productive application frameworks, but its design center is normal Go: packages, interfaces, structs, constructors, contexts, tests, compiled binaries, and clear process boundaries.

## What GoForj Is Trying To Achieve

GoForj exists to make production application development in Go feel coherent without making it opaque.

The framework should let developers:

- start a project quickly
- understand the generated application structure
- add HTTP routes, commands, jobs, events, schedules, storage, cache, and metrics without inventing architecture each time
- change infrastructure backends without rewriting business logic
- run locally without requiring distributed infrastructure by default
- move from local development to production with the same application model
- inspect runtime behavior through logs, metrics, route lists, inspections, and Lighthouse
- own the generated code as idiomatic Go

The docs must reinforce that experience from the first page onward.

## Intended Developer Experience

The desired developer experience is:

- A new project has a recognizable shape.
- The next file to edit is usually obvious.
- Common tasks have one documented path.
- Runtime behavior is visible through commands, logs, metrics, and Lighthouse.
- Driver changes are configuration and provider changes, not business-logic rewrites.
- Generated code is readable enough to maintain by hand.
- Advanced customization is possible, but intentional.

Docs should reduce decision fatigue. They should not present every possible architecture as equally valid.

## Intended Audience

Primary audience:

- Go developers building application services, internal tools, APIs, background workers, and operational systems.
- Teams that want framework-level cohesion while retaining Go's explicitness.
- Developers who value strong conventions, local development, and production observability.

Secondary audience:

- Maintainers extending GoForj itself.
- AI agents generating or reviewing future documentation.
- Contributors building sibling primitives such as `web`, `queue`, `storage`, `cache`, `events`, `scheduler`, and `metrics`.

Docs may assume Go competence. They should not assume familiarity with GoForj.

## Platform Philosophy

GoForj is a stack, not a monolith.

The framework repo owns application policy:

- project rendering
- generated app shape
- runtime bootstrap
- lifecycle coordination
- environment conventions
- developer tooling
- Lighthouse integration

Sibling repos own reusable primitives:

- `web` owns app-facing HTTP abstractions, adapters, middleware, route indexing, and web telemetry.
- `queue` owns queue interfaces, drivers, worker behavior, workflow primitives, and driver consistency.
- `events` owns typed event publication, subscription, and distributed fan-out.
- `storage` owns storage interfaces, managers, drivers, and cross-driver behavior.
- `cache` owns cache stores, helpers, locks, rate-limit primitives, and driver behavior.
- `scheduler` owns scheduling fluency, schedule metadata, locking, and runtime control primitives.
- `metrics` owns low-level counters, gauges, histograms, snapshots, and exposition.

The docs should teach this boundary so users understand where framework policy ends and reusable primitives begin.

## Goals

- Explain the cohesive application model before diving into package APIs.
- Make the generated app structure feel intentional and navigable.
- Establish canonical usage patterns for each major subsystem.
- Keep examples runnable, realistic, and aligned with generated code.
- Teach driver swappability without hiding operational tradeoffs.
- Show local-first defaults before distributed production backends.
- Preserve Go-native explicitness in every explanation and example.
- Make production behavior visible: startup, shutdown, workers, schedules, metrics, inspects, degraded subsystems, and failure modes.
- Build a documentation system that scales across many modules and maintainers.

## Non-Goals

Docs should not:

- describe GoForj as a copy of another framework
- encourage dynamic container patterns or runtime reflection as the normal path
- teach multiple competing application architectures for the same task
- expose low-level driver constructors before explaining application-level wiring
- hide lifecycle behavior behind vague language
- imply distributed infrastructure is required for local development
- present implementation details as user-facing concepts unless they affect architecture or operations
- overuse comparisons to other ecosystems
- use marketing language to compensate for unclear explanations

## Long-Term Direction

GoForj docs should evolve from a library-first site into a complete documentation system with two strong paths:

- standalone Libraries for first-party Go packages
- framework guides for generated GoForj Apps

The durable structure should prioritize:

- getting started
- project structure
- configuration
- HTTP and commands
- dependency injection
- persistence patterns
- queues, jobs, events, and schedules
- cache and storage
- testing
- deployment and operations
- observability and Lighthouse
- libraries
- framework reference

Libraries and framework guides should reinforce each other. Reference pages remain important, but framework reference should support the application journey rather than define it.
