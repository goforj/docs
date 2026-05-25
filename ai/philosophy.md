# GoForj Documentation Philosophy

## Purpose

This file defines the engineering and developer-experience philosophy that GoForj documentation should preserve.

Docs should teach the way GoForj wants applications to be built: explicit, conventional, composable, local-first, production-aware, and easy to inspect.

## Explicit Over Magic

GoForj favors behavior that can be traced through code, configuration, generated files, and provider wiring.

Docs should prefer:

- named constructors
- explicit provider registration
- clear environment variables
- generated files with obvious ownership
- lifecycle hooks with named extension points
- concrete command examples
- visible runtime behavior

Docs should avoid implying that GoForj works through hidden global state, runtime reflection containers, annotation scanning, or invisible registration.

When behavior is automatic, explain the boundary:

- what is generated
- what is configured
- what is wired
- what runs at process startup
- what the user owns

## Conventions With Clear Ownership

Conventions are part of GoForj's value.

Docs should present convention as leverage, not as restriction. A good convention answers:

- where code belongs
- when it runs
- how it is wired
- how it is tested
- how it is observed

Generated app extension points should be documented as the normal customization path. If a behavior should survive rerendering or apply to every app, the docs should point maintainers toward framework templates and generators rather than one-off rendered-app edits.

## Composability

GoForj primitives should compose without forcing business code to know backend details.

Docs should consistently separate:

- application code: handlers, services, jobs, event subscribers, schedules
- framework policy: generated structure, runtime lifecycle, app-level configuration
- primitive contracts: queue, cache, storage, events, scheduler, web, metrics
- driver implementation: Redis, SQL, S3, NATS, local filesystem, memory, and other backends

The core rule is:

Business logic should depend on app-facing contracts and named services, not on infrastructure-specific driver code.

## Local-First

Local development should be useful before distributed infrastructure exists.

Docs should show local and in-process drivers early:

- local storage
- memory or file cache
- sync or workerpool queues
- sync or null events
- local HTTP server
- local scheduler
- local metrics endpoint

Distributed drivers belong after the reader understands the application model.

Local-first does not mean toy-first. Local examples should still use real application structure, contexts, errors, tests, and lifecycle boundaries.

## Production-First Thinking

GoForj docs should teach production concerns as normal application concerns.

Important production topics:

- graceful startup and shutdown
- queue worker lifecycle
- scheduler lifecycle
- context deadlines and cancellation
- retries, backoff, and idempotency
- cache and storage driver tradeoffs
- bounded metric labels
- safe inspection payloads
- degraded optional subsystems
- environment-specific configuration
- operational commands such as `route:list`

Production guidance should be practical and specific. Avoid vague claims such as "production ready" without showing the behavior that makes it operable.

## Operational Clarity

A GoForj app should be inspectable.

Docs should make these surfaces feel first-class:

- startup and shutdown logs
- route lists
- queue worker state
- scheduler schedule lists
- metrics endpoint
- Lighthouse runtime views
- inspect timelines
- health and readiness checks
- explicit degraded states

Operator-facing behavior is not a side feature. It is part of the framework contract.

## Systems Thinking

GoForj applications are systems with multiple execution surfaces:

- HTTP requests
- CLI commands
- queue workers
- scheduler ticks
- event fan-out
- background lifecycle hooks
- metrics scrapes
- Lighthouse agent traffic

Docs should explain which process owns which work. They should not collapse everything into "the app" when the lifecycle or failure mode differs.

## Developer Confidence

The docs should make developers feel oriented, not entertained.

Confidence comes from:

- one clear path for common work
- code that compiles
- examples that match generated app structure
- honest tradeoffs
- precise terminology
- short explanations before code
- production notes at the right depth
- clear next steps

## Infrastructure Swappability

The canonical GoForj promise is:

Swap drivers, not business logic.

Docs must reinforce this without overselling it. Swapping drivers can still require:

- different configuration
- provider changes
- migrations or schema setup
- dependency additions
- operational tuning
- behavior-specific tests

The point is that application handlers, services, jobs, and schedules should not need to be rewritten around backend APIs.

## Framework Ergonomics

Ergonomics should come from:

- strong generated defaults
- fluent but explicit APIs
- predictable names
- good CLI affordances
- minimal ceremony for common tasks
- visible escape hatches

Docs should show ergonomics through straightforward examples, not by describing the framework as magical or effortless.

## Abstraction Philosophy

Good GoForj abstractions:

- remove backend-specific coupling
- preserve meaningful errors
- make lifecycle visible
- keep configuration explicit
- expose test seams
- do not hide expensive operations
- are small enough to understand
- map to real operational concepts

Discouraged abstractions:

- generic service locators
- reflection-heavy runtime containers
- global registries as the primary application model
- annotation-style hidden registration
- "manager" types that accumulate unrelated business logic
- wrappers that only rename an underlying dependency without improving boundaries
- interfaces created before there are real alternate implementations
- abstractions that make tests pass by hiding nil or miswired dependencies

## Escape Hatches

Escape hatches are allowed when they are explicit and documented.

Good escape hatches:

- accessing an underlying adapter for a framework-specific feature
- registering custom lifecycle hooks
- adding a custom provider
- using a driver directly in specialized code
- replacing generated defaults intentionally
- disabling a subsystem through configuration

Escape hatches should not become the first tutorial path. Teach the golden path first, then show where advanced users can step outside it.

## What GoForj Intentionally Avoids

GoForj avoids:

- runtime reflection containers as the normal DI path
- hidden framework behavior that cannot be traced
- dynamic-language magic patterns
- multiple equivalent official architectures
- excessive annotations
- generated code that users cannot read
- distributed infrastructure as a local requirement
- enterprise layering that does not solve a concrete problem
- swallowing misconfiguration with defensive nil checks around required dependencies
- marketing language in place of technical clarity

