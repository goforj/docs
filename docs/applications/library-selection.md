---
title: Choosing Libraries
description: Choose GoForj libraries from application requirements, existing dependencies, and runtime guarantees.
---

# Choosing Libraries

Start with the libraries and contracts already used by your app. Add a library when it meets a concrete requirement, such as reusable input rules, a searchable catalog, notification delivery, or a stable tenant rollout. Keep adequate standard-library code and explicit existing dependencies unless the requested behavior warrants a change.

Inside a GoForj Project, business behavior belongs in cohesive packages under `internal/`. Use the owning app's supported generators and named resource managers. Keep infrastructure construction, credentials, and lifecycle in providers and app setup. A standalone package and its framework integration are separate contracts: inspect the Project version before assuming a component or accessor exists.

[Feature, Search, and Notification Resources](/applications/library-resources) shows the framework configuration and accessor workflow for those optional integrations.

## Match the Application Requirement

| Requirement | Library | Decision to make |
| --- | --- | --- |
| Reusable input rules and stable field errors | [Validation](/validation) | Separate decoded invalid input from malformed requests and operational failures. |
| Lexical catalog search, filters, facets, and highlights | [Search](/search) | Choose a backend, app-owned schema, and explicit indexing and write-visibility policy. |
| Messages across chat, email, SMS, push, or incident channels | [Notification](/notification) | Define channel and fallback policy. Synchronous acceptance does not prove recipient delivery. |
| Stable targeted rollouts and typed release settings | [Feature](/feature) | Choose a stable targeting key, explicit fallbacks, and a request snapshot when decisions need one revision. |
| Startup environment configuration | [Env](/env) | Resolve required values, parsing, defaults, and precedence before injecting settings. |
| Authenticated application payload encryption | [Crypt](/crypt) | Separate key custody, new-key encryption, and old-key decryption during rotation. |
| Credentials bound to managed stores or encrypted files | [Secret](/secret) | Bind provider locations during construction and inject a reader. Verify publication before adding a version pin. |
| Typed outbound HTTP integration | [HTTPX](/httpx) | Use caller context, bounded timeouts, and an intentional retry policy. |
| Inbound routing, handlers, and middleware | [Web](/web) | Keep HTTP translation in controllers and policy at the intended route or router. |
| Temporary values, counters, rate limits, or locks | [Cache](/cache) | Decide whether state must coordinate across processes before choosing a local store. |
| Files, uploads, and large objects | [Storage](/storage) | Select a named disk and verify required backend capabilities such as streaming and URL generation. |
| Email composition and delivery | [Mail](/mail) | Use the app mail manager; choose notification when the requirement is channel policy. |
| Business counters and duration distributions | [Metrics](/metrics) | Reuse the app registry and keep label values bounded. |

These libraries work independently of GoForj. Their reference pages show direct constructors and drivers. In a framework app, prefer the available named manager/accessor so driver selection and lifecycle stay consistent. An available library does not imply a `forj make:*` command exists; inspect command help rather than guessing.

## Distinguish Background Responsibilities

Use [Events](/events) for typed facts and reactions. The selected driver determines delivery and failure behavior. Use [Queue](/queue) for deferred work with explicit job payloads, retry policy, worker ownership, and the required durability.

Use [Scheduler](/scheduler) to decide when work runs or is dispatched. Set timezone and overlap policy deliberately. Recurrence alone does not make work durable. See [Events versus Queues](/async/events-vs-queues) before choosing a direct reaction or queued job.

Notification delivery is a separate responsibility. A simple send is synchronous and provides no automatic retries or background execution. When delivery work must be durable, dispatch a job that calls an injected sender and define duplicate-delivery policy explicitly.

## Preserve Input Meaning

For PATCH requests, distinguish an omitted field, explicit null, and a supplied zero or false. A pointer or nullable SQL value alone does not necessarily preserve all three states. Use documented presence-aware validation types when the request contract needs them.

[Null](https://github.com/goforj/null) represents nullable SQL and JSON values. It addresses a different boundary from whether an HTTP field was supplied. Keep request decoding, normalization, validation, and persistence conversion explicit. [Requests and Validation](/applications/requests-validation) describes the HTTP error contract.

Environment configuration, encryption, and managed secret lookup also have separate responsibilities. Keep credential values out of logs, inspects, and metric labels. Do not invent secret-management behavior from environment reads and custom encryption in a leaf service.

## Use Smaller Tools Where They Fit

| Need | Library | Boundary |
| --- | --- | --- |
| Redirect-safe CLI presentation | [Console](/console) | Separate machine stdout from status output and avoid forced prompts. |
| Subprocess execution and decoding | [ExecX](/execx) | Pass explicit arguments, propagate cancellation, and handle exit errors. |
| Typed slice transformation and aggregation | [Collection](/collection) | Check mutation and cloning before branching a pipeline. |
| String normalization and transformations | [Strings](/strings) | Check byte-indexed versus rune-based Unicode contracts. |
| Development dumps and diffs | [GoDump](/godump) | Bound output, redact sensitive fields, and avoid application-path termination. |
| Compile-time dependency wiring | [Wire](/wire) | Change providers and regenerate; do not edit `wire_gen.go`. |
| Agent project inspection and documentation | [Atlas](/atlas) | Use read-only evidence before guessing APIs, resources, or commands. |

## Verify Versions and Integration

Inspect `go.mod`, existing imports, the owning app, and versioned examples before adding a dependency. Match major import suffixes to the selected release. Check minimum Go requirements and optional driver versions independently; a root tag does not publish every nested module.

Register application services in `app/wire/inject_services_app.go`, or `app/<name>/wire/inject_services_app.go` for an additional app. Keep driver construction in framework resource managers or explicit providers, and propagate caller context. Refresh loops and other long-lived work need an explicit app lifecycle.

Test the behavior the library provides and its relevant failures. Observe filtered results after indexing, explicit missing-flag fallback, or rate limits for separate identities. Imports and a passing build do not establish those behaviors.

For provider or registration changes, regenerate wiring and build from the Project root before running tests:

```bash
forj build
```

Expected result: generated wiring and the binary build with the selected dependencies. Then run:

```bash
go test ./...
```

Expected result: tests exercise the integration and its failure cases. These commands use the Project's pinned versions; they do not upgrade a library automatically.

## Next Steps

- [Libraries](/libraries/) lists standalone references.
- [Wiring Recipes](/developer-tools/wiring-recipes) explains app-owned providers.
- [Driver Selection](/data/driver-selection) separates local defaults from production needs.
- [Atlas](/developer-tools/atlas) explains agent guidance and read-only inspection.
