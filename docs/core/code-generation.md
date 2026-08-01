---
title: Code Generation
description: Understand why GoForj generates code, who owns each result, and which changes require regeneration.
---

# Code Generation

GoForj generates ordinary Go code for composition, configuration, driver factories, resource accessors, API metadata, and Wire graphs. Generation keeps dependencies explicit at compile time while avoiding runtime reflection or hidden registration.

The generated result is part of the application architecture. Read it, test it, and respect the ownership stated by its file header or local README.

## Why GoForj Generates Code

Generation turns Project and environment inputs into visible Go contracts:

- selected components determine which capabilities exist
- supported-driver lists determine which implementations compile into the binary
- named resource scopes determine which stable accessors exist
- provider sets determine the Wire graph
- routes and command types contribute API and command metadata

This moves integration failures toward generation and build time. A missing driver, invalid named resource, or incomplete dependency graph should fail explicitly instead of becoming a hidden runtime lookup.

<span id="build-and-refresh-generated-code"></span>

## The Normal Path

Use:

```bash
forj build
```

The normal build refreshes generated components, runs Wire, builds API index artifacts, and builds the app binary.

During `forj dev`, an app listed in `dev.apps` receives its configured build lifecycle automatically. Use the explicit build when working outside that loop or when you want to prove source, generated code, and the binary agree.

Focused generation exists for maintainers and narrow repair workflows. The [Generation Commands](/reference/generation-commands) page owns exact commands, flags, component availability, and output behavior.

<span id="choose-the-project-shape"></span>

## Inputs and Outputs

Generation reads several kinds of input:

| Input | What it controls |
| --- | --- |
| Selected components in `.goforj.yml` | Which framework capabilities and app APIs exist |
| Supported-driver environment values | Which backend factories compile into the app |
| Named resource environment scopes | Which generated accessors and resource metadata exist |
| Provider sets and injectors | The Wire dependency graph |
| Application routes and commands | API index, OpenAPI, and command metadata |

The output can include managers, accessors, configuration types, driver manifests, Wire output, API artifacts, and framework-owned package code. Not every app contains every output; component selection is authoritative.

See [Configuration Reference](/reference/configuration) for Project inputs and [Environment Reference](/reference/env-vars#resolution-and-naming) for driver and named-resource inputs.

## One Resource from Input to App API

For example, adding a named queue starts with configuration:

```dotenv
QUEUE_SUPPORTED_DRIVERS=workerpool,redis
QUEUE_CRITICAL_DRIVER=redis
```

The next `forj build` turns that input into concrete source and a compiled App contract:

```text
.env
  └── QUEUE_CRITICAL_DRIVER=redis
        ↓ forj build
internal/queues/manager_gen.go       supported driver construction
internal/queues/accessors_gen.go     Critical() accessor
        ↓ Wire
app.Queues().Critical()              stable App API
```

Application code depends on `Critical()`, not a Redis constructor. Runtime configuration may switch that queue to another already-supported driver; changing the supported set or adding another named queue regenerates the contract.

This is the useful test for generation: an input that changes compile-time capability should produce readable code, a stable typed API, and an early build failure when the graph cannot be satisfied.

<span id="choose-a-safe-extension-point"></span>

## Ownership Models

GoForj Projects contain three practical ownership models:

| Ownership | How to work with it |
| --- | --- |
| Regenerated output, including files marked `DO NOT EDIT` | Change its input or framework template, then regenerate. |
| Render-once extension point | Edit it as app-owned code after initial creation. |
| Application-owned file | Maintain it like any other application code. |

`wire_gen.go` is regenerated output. Change providers or injector inputs, then run `forj build`.

App composition files are intended extension points when present:

| Concern | Default app owner |
| --- | --- |
| Startup and shutdown hooks | `app/lifecycle.go` |
| Route composition | `app/routes.go` |
| App command exposure | `app/commands.go` |
| Schedule composition | `app/schedules.go` |
| App-local providers | `app/wire/inject_*_app.go` |

Additional apps use the same conventions under `app/<name>/`. Exact files follow selected components; do not create a missing component surface by copying one from another app.

Keep these composition files declarative. Put controllers, services, jobs, subscribers, and scheduled behavior in their owning `internal/...` packages, then expose them through the app.

<span id="use-generated-resources"></span>

## App APIs

Selected components can generate stable app-facing managers:

<!-- go-example: illustrative-fragment -->
```go
app.Cache()
app.Caches()
app.Storage()
app.Events()
app.Bus()
app.Queue()
app.Queues()
app.DB()
```

Each method exists only when its component is enabled. Wire can construct these managers, but manager construction is not permission to hide expensive connections or lifecycle work inside dependency lookup.

Named environment scopes can add typed accessors:

<!-- go-example: illustrative-fragment -->
```go
app.Caches().Sessions()
app.Storage().Uploads()
app.Queues().Critical()
app.Events().Audit()
```

Those methods are generated configuration invariants. If the environment and generated accessors disagree, rebuild the app. Code should fail fast rather than silently pretend a required named dependency is optional.

<span id="compile-driver-support"></span>

## Driver Support and Selection

Driver-backed resources separate compile-time support from runtime selection:

```dotenv
STORAGE_SUPPORTED_DRIVERS=local,s3
STORAGE_DRIVER=local
STORAGE_UPLOADS_DRIVER=s3
```

Generation compiles local and S3 factories. Startup selects local for the default disk and S3 for `uploads`.

Changing an active driver to another already-compiled driver needs a restart. Changing the supported set or adding a named generated accessor needs regeneration and a new binary. [Configuration](/getting-started/configuration#when-to-rebuild-or-restart) owns that beginner decision rule; [Environment Reference](/reference/env-vars) owns every variable.

<span id="decide-whether-to-change-the-app-or-framework"></span>

## App Code versus Framework Code

Change the application when behavior is specific to one Project.

Change GoForj templates or generators when:

- every new Project needs the change
- an extension point is missing or has the wrong ownership
- rerendering must reproduce the behavior
- generated discovery, accessors, or provider wiring are incorrect

Do not hand-edit generated output to test a framework fix. Update the authoritative template or generator, regenerate every checked-in mirror, and verify another generation produces no diff.

<span id="inputs-that-require-a-rebuild"></span>
<span id="common-mistakes"></span>

## Rebuild Boundaries

Run `forj build` after changing:

- selected components
- supported-driver lists
- named cache, storage, queue, event, mail, or database scopes
- provider sets or Wire injector inputs
- generated observability inputs

A normal application implementation change also needs a new binary, but it does not necessarily change generated files.

<span id="next-steps"></span>

## Related Concepts

- [Apps](/core/apps) explains app composition and ownership.
- [Dependency Injection](/core/dependency-injection) explains providers and Wire.
- [File Ownership](/reference/generated-files) lists important generated locations.
- [Generation Commands](/reference/generation-commands) is the command lookup.
- [Make Command Reference](/reference/make-commands) lists resource scaffolding and registration changes.
