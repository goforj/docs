# GoForj Generated Components Model

## Purpose

This file defines how to document generated App components.

Generated component docs are a third projection alongside framework guides and standalone library pages:

- Framework guides teach how to use the component in an App.
- Library pages teach the underlying primitive as an independent package.
- Generated component docs explain the code emitted into `internal/...` for a specific rendered App.

## Why This Matters

The GoForj templates already emit README files under generated packages such as:

- `internal/app`
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
- Which generated accessors exist?
- Which commands regenerate it?
- What invariants does the generated code assume?
- What should the App owner edit?
- What should remain generated?

### Library Docs

Answer:

- How does the underlying package work independently?
- What constructors, drivers, adapters, and APIs exist?
- How do standalone users install and test it?

## Codegen And Accessor Pattern

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

## Named Resource Pattern

Generated Apps use named resource managers:

- `app.Cache()` and `app.Caches().Sessions()`
- `app.Queue()` and `app.Queues().Critical()`
- `app.Storage().Default()` and `app.Storage().Public()`
- database default and named connections
- event default and named buses

Docs should treat these as generated configuration invariants.

Named generated accessors usually should not return errors. If a named accessor is missing or misaligned, that is a generation/configuration mismatch, not an optional missing dependency.

## Lazy Resource Pattern

Generated managers often construct lightweight handles and initialize infrastructure on first use.

Docs should distinguish:

- constructing a manager
- resolving a named accessor
- first use of remote infrastructure
- runtime-owned eager start for long-lived processes

This prevents docs from incorrectly claiming that every command must connect to every backend during boot.

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

