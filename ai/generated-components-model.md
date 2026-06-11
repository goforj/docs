# GoForj Generated Components Model

## Purpose

This file defines how to document generated App components.

Generated component docs are a third projection alongside framework guides and standalone library pages:

- Framework guides teach how to use the component in an App.
- Library pages teach the underlying primitive as an independent package.
- Generated component docs explain the code emitted into `internal/...` for a specific rendered App.

## Why This Matters

The GoForj templates already emit README files under generated packages such as:

- `internal/runtime`
- `internal/auth`
- `internal/caches`
- `internal/database`
- `internal/events`
- `internal/http`
- `internal/inspects`
- `internal/mail`
- `internal/metrics`
- `internal/observability`
- `internal/queues`
- `internal/storages`

These README files are not public marketing docs. They are local ownership guides for the generated App. They should be accurate, operational, and specific to emitted code.

## Projection Boundaries

### Public Framework Docs

Answer:

- What is the framework feature?
- Where does it live in a generated App?
- What is the golden path?
- How does configuration flow?
- How is it wired?
- How is it tested and operated?

### Generated Component READMEs

Answer:

- What did this App generate?
- Which env vars control this generated package?
- Which generated accessors or metadata files exist?
- Which commands regenerate it?
- What invariants does the generated code assume?
- What should the App owner edit?
- What should remain generated?

### Library Docs

Answer:

- How does the underlying package work independently?
- What constructors, drivers, adapters, and APIs exist?
- How do standalone users install and test it?

## Codegen and Accessor Pattern

Several generated components use the same pattern:

1. env vars define default and named resources
2. `*_SUPPORTED_DRIVERS` selects compile-time driver support
3. `*_DRIVER` and `*_<NAME>_DRIVER` select runtime drivers among compiled options
4. `forj generate --<component>` emits typed accessors and imports only needed drivers
5. `forj build` refreshes generated accessors before building
6. named accessors fail fast when generated code and runtime env are out of sync

Examples:

- `CACHE_SUPPORTED_DRIVERS`
- `QUEUE_SUPPORTED_DRIVERS`
- `STORAGE_SUPPORTED_DRIVERS`
- `EVENTS_SUPPORTED_DRIVERS`
- `DB_SUPPORTED_DRIVERS`

This pattern deserves first-class documentation. It is central to GoForj's "swap drivers, not business logic" story because it keeps binaries lean while preserving runtime environment flexibility.

When documenting regeneration, prefer `forj build` as the normal path.

Focused generation commands are valid reference material, but public workflow pages should not imply developers must run them manually during normal development. During `forj dev`, the generated build watcher normally runs `forj build` for the developer.

## Named Resource Pattern

Generated Apps use named resource managers:

- `app.Cache()` and `app.Caches().Sessions()`
- `app.Queue()` and `app.Queues().Critical()`
- `app.Storage().Default()` and `app.Storage().Public()`
- database default and named connections
- event default and named buses

Docs should treat these as generated configuration invariants.

Named generated accessors usually should not return errors. If a named accessor is missing or misaligned, that is a generation/configuration mismatch, not an optional missing dependency.

App metadata nuance: `internal/runtime/apps.go` is regenerated on render. It compiles the default app and named app list into binaries, including deterministic app indexes, HTTP ports, runtime metric ports, and env prefixes. App owners should not edit it by hand.

Queue nuance: named queues inherit the root queue driver unless they override it. One generated queue resource represents one logical queue. The default app keeps backend queue names unchanged. Named apps physicalize backend queue names with the app prefix, for example `billing_default`, so multiple apps can share one queue backend without workers stealing each other's jobs. Use `QUEUE_<NAME>_NAME` only for rare backend name overrides within the default app model. The worker command with no `--queue` starts all configured generated queues. `worker --queue <name>` selects one queue, and repeated flags select a subset. Use named queue worker counts as the primary priority model before backend-specific queue weighting.

Schedule nuance: scheduler runtime code lives in `internal/schedules`, while generated schedule implementations may be colocated with their owning domain package. `forj make:schedule reports:daily --every 24h` should create a domain-owned schedule such as `internal/reports/daily_schedule.go`, register it in `app/schedules.go`, and wire its provider through `app/wire/inject_schedules_app.go`. For named apps, use `app/<app>/schedules.go` and `app/<app>/wire/inject_schedules_app.go`. Do not document `internal/scheduler`; that package name was replaced to avoid conflicting with the `github.com/goforj/scheduler/v2` library import.

Command nuance: inside a generated Project, `forj <command>` is the normal default-app command surface. Native Framework commands take precedence. `forj <app> <command>` selects a named app. If no native command matches, `forj` delegates to the generated app through the source-aware path. `forj run <command>` remains the explicit default-app command path and collision escape hatch. `./bin/app <command>` and `./bin/<app> <command>` remain built binary/deployment surfaces.

## Resource Startup Pattern

Generated managers may construct lightweight handles, but docs should not claim lazy resource initialization unless the generated App and selected driver explicitly implement it.

Current confirmed nuance: generated database connections open and cache connections on first accessor use. Do not generalize that database-specific behavior to cache, storage, queue, or event managers unless their generated code supports it.

Docs should distinguish:

- constructing a manager
- resolving a named accessor
- runtime-owned startup for long-lived processes
- readiness checks for required infrastructure

This prevents docs from incorrectly claiming that GoForj has a general lazy initialization model.

## Generated README Standards

Generated component READMEs should include:

- component purpose
- generated package ownership
- configuration env vars
- compile-time driver support when relevant
- runtime driver selection when relevant
- generated accessors
- regeneration command
- common usage
- operational notes
- fail-fast invariants

They may include more env detail than public workflow pages because they are local package ownership docs.

## Public Docs Integration

Public framework pages should not duplicate generated README env tables.

Instead:

- explain the pattern
- show one local example
- link to generated component docs or reference for full env detail
- link to library pages for primitive APIs and driver matrices

Use native VitePress info callouts for recurring workflow context such as automatic `forj dev` build behavior. Do not add this as inline noise after every command.

## Artifacts Needed

Recommended public docs:

- `core/generated-components.md`
- `core/named-resources.md`
- `core/code-generation.md`
- `core/driver-support.md`

Recommended reference docs:

- `reference/generated-files.md`
- `reference/env-vars.md`
- `reference/generation-commands.md`
