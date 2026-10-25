---
title: Changelog
description: GoForj framework and library release history, compiler requirements, and upgrade notes.
---

# Changelog

This changelog records GoForj framework releases and independently versioned first-party libraries, with source links and upgrade notes.

GoForj is in public beta. Some early framework versions were assigned retrospectively to development milestones. The library history below distinguishes published release dates from tagged-source dates.

## Unreleased

The current documentation follows `main`. Changes remain in this section until they are included in a tagged framework release.

### Maintenance Mode

- Added live `maintenance:enable` and `maintenance:disable` commands that use an authenticated, loopback-only control endpoint to gate HTTP traffic while queue workers and scheduled tasks continue normally.
- Added a dependency-free memory backend for local use and a production-oriented named-cache backend that preserves maintenance state across process replacement and replicas.
- Added browser and JSON HTTP 503 responses shared by every official starter kit while keeping health, readiness, metrics, and Lighthouse routes reachable.
- Preserved environment-enforced maintenance for deployment policy and disabled shared maintenance state in generated test profiles.

### Project Builds

- Made `forj build` prepare every stale SPA configured under `dev.apps` before compiling the App, while reusing successful `forj dev` output and skipping unchanged frontend work.
- Kept the freshness check lightweight with metadata-only receipts and ran frontend preparation alongside independent backend build stages.

### Environment Contracts

- Added automatic private `.env` initialization with fresh values for present framework signing and diagnostic keys, plus hidden `forj env:set` value entry.
- Made generation the single owner that synchronizes committed `.env.example` and `.env.testing` contracts, blanks newly discovered application values by default, rejects ambiguous dotenv keys, and refuses unsafe legacy test-profile migration before changing ignore rules.
- Added deterministic test-friendly values and `forj env:check` so CI can verify and use the committed test profile instead of reconstructing a complete `.env`.

### Starter Kits and App Help

- Added a default-on component-library choice for Vue, React, and templ + htmx starter kits, with a smaller working shell when the showcase is disabled.
- Refreshed the Web UI placeholder used when a Project does not select a first-party starter kit.
- Built a missing conventional App binary before displaying source-aware root command help.

## v0.35.1

Released October 20, 2026.

- Fixed first-boot MySQL and MariaDB development database preparation by waiting for the authenticated permanent server before provisioning.
- Preserved the existing preparation budget, custom hooks, and configuration. Existing projects do not need to be regenerated for this CLI fix.

See the [release notes](https://github.com/goforj/goforj/releases/tag/v0.35.1) for database compatibility coverage and installation instructions. For releases between `v0.29.0` and this version, see the [complete release history](https://github.com/goforj/goforj/releases).

## v0.29.0

Released October 18, 2026.

- Added MySQL and PostgreSQL development Compose profiles, preserving existing service selection on the first rerender of older projects.
- Adopted Web v0.6.4 with Echo 5.4 security fixes and fewer middleware allocations, updated library and frontend dependencies, and fixed zstd decoder crashes.
- Stabilized Wire parallelism and Lighthouse command-routing tests.

Requires Go 1.26 or newer. Review the [release notes and upgrade guidance](https://github.com/goforj/goforj/releases/tag/v0.29.0), especially HTTP proxy trust and database profile behavior, before upgrading.

## v0.27.1

Released September 3, 2026.

### Development Watchers

- Scoped macOS development watches to selected files so unrelated filesystem activity does not restart an App.

## v0.24.1

Released August 12, 2026.

### HTTP Access Logs

- Kept successful SPA delivery and routine metrics scraping quiet by default while preserving failures and ordinary application requests.
- Added `HTTP_SPA_ACCESS_LOG_ENABLED` for Apps that need successful SPA requests in the access log.

## v0.24.0

Released August 9, 2026.

### Development Lifecycle

- Reworked `forj dev` output around compact preparation, build, restart, and runtime transitions while preserving diagnostics when App or SPA builds fail.
- Coordinated build waves and runtime replacement so overlapping changes converge on the newest successful App binary.
- Preserved App lifecycle ownership boundaries and custom frontend files during rerendering.

### App Scaffolding

- Simplified framework-managed App entrypoint files and added typed job payload scaffolds.
- Rendered only the selected Atlas agent and stopped creating the retired root frontend directory.

## v0.23.1

Released July 28, 2026.

### PTY Handling

- Updated the pinned `execx` dependency to `v1.1.4` for its PTY handling fix.

## v0.23.0

Released July 28, 2026.

### Generated Schedules

- Simplified generated recurring-schedule registration by collecting application-owned schedules directly through Wire.
- Kept legacy schedule wiring migration support while making new generated schedule collections explicit.

## v0.22.0

Released July 26, 2026.

### Managed Development Environments

- Preserved the launcher environment through development builds and App runtimes, including explicit inherited build overrides.
- Kept dotenv precedence stable for build defaults while isolating each App runtime environment.
- Stabilized managed development lifecycle and Compose startup behavior.

## v0.21.0

Released July 22, 2026.

### Development Service Workflow

- Added development service and resource status reporting, plus a static project descriptor for tooling.
- Restored standard development environment precedence and allowed project dotenv topology to be read without mutation.
- Improved incremental builds and Vue production builds, while retaining the component showroom in production output.

## First-Party Library Ecosystem

GoForj's libraries are versioned independently and can be used outside the framework. The history below covers all 19 libraries, including the `null` compatibility fork, through October 24, 2026.

### Library Release Lines

The versions below are current as of October 24, 2026. Framework releases may select earlier library versions. Minimum Go versions come from the root module at each listed tag; separately published drivers and helpers can require newer compilers.

| Library | Version | Minimum Go | What it provides |
| --- | --- | --- | --- |
| [Atlas](#atlas) | [v0.4.13](https://github.com/goforj/atlas/tree/v0.4.13) | 1.25.0 | Project guidance, skills, MCP tools, and agent evaluations. |
| [Cache](#cache) | [v0.4.2](https://github.com/goforj/cache/releases/tag/v0.4.2) | 1.27.0 | Cache helpers, locks, inspectors, and local, distributed, and SQL drivers. |
| [Collection](#collection) | [v4.0.0](https://github.com/goforj/collection/releases/tag/v4.0.0) | 1.27.0 | Slice-backed collections, fluent transformations, and explicit mutation. |
| [Console](#console) | [v0.2.0](https://github.com/goforj/console/tree/v0.2.0) | 1.24.0 | Semantic CLI output, layouts, prompts, loaders, and progress. |
| [Crypt](#crypt) | [v1.2.0](https://github.com/goforj/crypt/tree/v1.2.0) | 1.24.4 | Authenticated CBC encryption, compatible envelopes, and key rotation. |
| [Env](#env) | [v2.6.1](https://github.com/goforj/env/tree/v2.6.1) | 1.24.4 | Typed environment values, layered loading, scoped keys, and reloads. |
| [Events](#events) | [v0.2.1](https://github.com/goforj/events/releases/tag/v0.2.1) | 1.24.0 | Typed event delivery with local and distributed transports. |
| [Execx](#execx) | [v1.1.4](https://github.com/goforj/execx/tree/v1.1.4) | 1.24.4 | Subprocess execution, output decoding, and TTY and PTY support. |
| [GoDump](#godump) | [v1.10.0](https://github.com/goforj/godump/releases/tag/v1.10.0) | 1.18 | Debug dumps, diffs, type controls, and field redaction. |
| [HTTPX](#httpx) | [v2.1.0](https://github.com/goforj/httpx/releases/tag/v2.1.0) | 1.27.0 | HTTP client helpers, typed responses, authentication, and diagnostics. |
| [Mail](#mail) | [v0.3.1](https://github.com/goforj/mail/tree/v0.3.1) | 1.24.0 | Message building, attachments, and mail delivery transports. |
| [Metrics](#metrics) | [v0.2.0](https://github.com/goforj/metrics/tree/v0.2.0) | 1.24.0 | Registries, counters, gauges, histograms, and Prometheus exposition. |
| [Null](#null) | [v6.0.2](https://github.com/goforj/null/tree/v6.0.2) | 1.22.12 | Compatibility fork for nullable SQL and JSON values. |
| [Queue](#queue) | [v0.2.1](https://github.com/goforj/queue/tree/v0.2.1) | 1.24.4 | Job dispatch, workers, retries, workflows, and backend drivers. |
| [Scheduler](#scheduler) | [v2.1.4](https://github.com/goforj/scheduler/tree/v2.1.4) | 1.24.4 | Recurring work, locks, execution controls, and task contexts. |
| [Storage](#storage) | [v0.6.0](https://github.com/goforj/storage/releases/tag/v0.6.0) | 1.24.4 | File and object storage, driver capabilities, and streaming S3 operations. |
| [Str](#str) | [v3.0.0](https://github.com/goforj/str/releases/tag/v3.0.0) | 1.24.0 | Fluent string operations with standard-library contracts and application helpers. |
| [Web](#web) | [v0.6.4](https://github.com/goforj/web/releases/tag/v0.6.4) | 1.26.0 | HTTP contracts, the Echo adapter, middleware, testing, and API indexing. |
| [Wire](#wire) | [v1.3.1](https://github.com/goforj/wire/releases/tag/v1.3.1) | 1.25.0 | Compile-time dependency generation, caching, and watch mode. |

### Reading the History

Each table is ordered by version, newest first. Dates marked **release** are GitHub publication dates. Dates marked **source** are dates of the tagged commits, because no published release page exists for that version; they are not claimed tag-publication dates. Version links open the release notes when available, otherwise the tagged commit history.

Documentation-only, test-only, and same-source tags are recorded as such. Moving aliases and prerelease tags are excluded from the numbered root history. For independent driver and helper tags, see [Driver and Test Hygiene](#driver-and-test-hygiene).

### Atlas {#atlas}

These are tagged library versions, not a record of every change currently on `main`. Local evaluation tooling and guidance may continue to evolve after the latest tag.

| Version | Date | Changes |
| --- | --- | --- |
| [v0.4.13](https://github.com/goforj/atlas/commits/v0.4.13) | 2026-08-20 (source) | Added composed application workflows and data-generation evaluations. |
| [v0.4.12](https://github.com/goforj/atlas/commits/v0.4.12) | 2026-08-19 (source) | Initialized validated write-probe repositories. |
| [v0.4.11](https://github.com/goforj/atlas/commits/v0.4.11) | 2026-08-19 (source) | Removed stale event-probe imports. |
| [v0.4.10](https://github.com/goforj/atlas/commits/v0.4.10) | 2026-08-19 (source) | Verified resilient job boundaries structurally. |
| [v0.4.9](https://github.com/goforj/atlas/commits/v0.4.9) | 2026-08-19 (source) | Aligned evaluations with App layouts. |
| [v0.4.8](https://github.com/goforj/atlas/commits/v0.4.8) | 2026-08-19 (source) | Calibrated evaluation contracts. |
| [v0.4.7](https://github.com/goforj/atlas/commits/v0.4.7) | 2026-08-19 (source) | Scoped event-context verification. |
| [v0.4.6](https://github.com/goforj/atlas/commits/v0.4.6) | 2026-08-19 (source) | Included event subscriptions in verifier scope. |
| [v0.4.5](https://github.com/goforj/atlas/commits/v0.4.5) | 2026-08-19 (source) | Decoupled domain-event behavior probes. |
| [v0.4.4](https://github.com/goforj/atlas/commits/v0.4.4) | 2026-08-19 (source) | Accepted equivalent evaluation implementations. |
| [v0.4.3](https://github.com/goforj/atlas/commits/v0.4.3) | 2026-08-19 (source) | Scoped domain-event context validation. |
| [v0.4.2](https://github.com/goforj/atlas/commits/v0.4.2) | 2026-08-19 (source) | Accepted equivalent implementations and documented evaluation handoff state. |
| [v0.4.1](https://github.com/goforj/atlas/commits/v0.4.1) | 2026-08-17 (source) | Required Codex Atlas MCP startup and removed workspace-specific documentation paths. |
| [v0.4.0](https://github.com/goforj/atlas/commits/v0.4.0) | 2026-08-17 (source) | Added evaluation coverage mapping, guidance treatments, framework verifiers, and executable calibration. |
| [v0.3.1](https://github.com/goforj/atlas/commits/v0.3.1) | 2026-08-07 (source) | Kept agent-specific guideline, skill, and MCP projections intentional. |
| [v0.3.0](https://github.com/goforj/atlas/commits/v0.3.0) | 2026-06-24 (source) | Expanded framework workflow guidance. |
| [v0.2.2](https://github.com/goforj/atlas/commits/v0.2.2) | 2026-06-21 (source) | Corrected skills and refreshed documentation. |
| [v0.2.0](https://github.com/goforj/atlas/commits/v0.2.0) | 2026-06-16 (source) | Added Gemini support. |
| [v0.1.2](https://github.com/goforj/atlas/commits/v0.1.2) | 2026-06-16 (source) | Added project skill helpers. |
| [v0.1.1](https://github.com/goforj/atlas/commits/v0.1.1) | 2026-06-16 (source) | Loaded documentation through the runtime Git cache. |
| [v0.1.0](https://github.com/goforj/atlas/commits/v0.1.0) | 2026-06-16 (source) | Established project-local agent guidance and tooling. |

### Cache {#cache}

The root module requires Go 1.27 from v0.4.1 onward. In v0.4.2, `cachecore`, `cachetest`, and most driver modules retain Go 1.24.4; PostgreSQL and SQLite require Go 1.25, and NATS requires Go 1.26. Applications retaining Go 1.26 can keep the root at v0.4.0 and select newer core and driver modules as documented in the [v0.4.2 release](https://github.com/goforj/cache/releases/tag/v0.4.2). For ownership-safe locks, drain older binaries with unconditional unlock behavior before relying on the new release semantics. Direct lock acquisition and release must use the same Cache instance.

| Version | Date | Changes |
| --- | --- | --- |
| [v0.4.2](https://github.com/goforj/cache/releases/tag/v0.4.2) | 2026-10-17 (release) | Coordinated dependency updates across eleven published modules, preserving Redis timing defaults. Compiler requirements vary by module. |
| [v0.4.1](https://github.com/goforj/cache/releases/tag/v0.4.1) | 2026-08-31 (release) | Added ownership-safe lock release and Go 1.27 generic Cache methods; retained package-level helpers. |
| [v0.4.0](https://github.com/goforj/cache/commits/v0.4.0) | 2026-07-16 (source) | Unified Cache shaping and cross-driver behavior, with coordinated module publication. |
| [v0.3.0](https://github.com/goforj/cache/commits/v0.3.0) | 2026-05-20 (source) | Adopted structured observer event payloads. |
| [v0.2.2](https://github.com/goforj/cache/commits/v0.2.2) | 2026-05-06 (source) | Added cross-driver observer-context tests. |
| [v0.2.1](https://github.com/goforj/cache/commits/v0.2.1) | 2026-05-05 (source) | Adopted context-bound Cache facades through `WithContext`. |
| [v0.2.0](https://github.com/goforj/cache/commits/v0.2.0) | 2026-04-08 (source) | Added Cache inspectors for browsing stored entries. |
| [v0.1.5](https://github.com/goforj/cache/commits/v0.1.5) | 2026-03-06 (source) | Renamed context-aware variants from `Ctx` to `Context`. |
| [v0.1.4](https://github.com/goforj/cache/commits/v0.1.4) | 2026-03-01 (source) | Added readiness probes. |
| [v0.1.3](https://github.com/goforj/cache/commits/v0.1.3) | 2026-02-26 (source) | Corrected module references and generated examples. |
| [v0.1.2](https://github.com/goforj/cache/releases/tag/v0.1.2) | 2026-02-25 (release) | Decoupled the driver API from the Redis client. |
| [v0.1.1](https://github.com/goforj/cache/releases/tag/v0.1.1) | 2026-02-25 (release) | Separated examples into their own module. |
| [v0.1.0](https://github.com/goforj/cache/releases/tag/v0.1.0) | 2026-02-23 (release) | Established the modular Cache facade and driver packages, replacing the legacy root factory and options. |

### Collection {#collection}

v4 is the supported slice-backed release and requires Go 1.27 and the `github.com/goforj/collection/v4` import path. v3 is superseded because its module archive included a repository-only test. Existing v2 consumers can retain `/v2`; moving to v4 also changes API and ownership semantics. See the [v4 migration guide](https://github.com/goforj/collection/blob/v4.0.0/MIGRATING_TO_V4.md).

| Version | Date | Changes |
| --- | --- | --- |
| [v4.0.0](https://github.com/goforj/collection/releases/tag/v4.0.0) | 2026-08-23 (release) | Published the corrected slice-backed module at `/v4`, excluding repository-only tests from consumer downloads. Requires Go 1.27. |
| [v3.0.0](https://github.com/goforj/collection/releases/tag/v3.0.0) | 2026-08-23 (release) | Introduced slice-backed collections and generic methods. Superseded by v4 because a repository-only test was included in the module archive. |
| [v2.0.2](https://github.com/goforj/collection/commits/v2.0.2) | 2026-05-26 (source) | Strengthened collection contracts and CI coverage. |
| [v2.0.1](https://github.com/goforj/collection/commits/v2.0.1) | 2026-05-26 (source) | Separated documentation and executable examples into tooling modules; refreshed examples and API documentation. |
| [v2.0.0](https://github.com/goforj/collection/releases/tag/v2.0.0) | 2026-01-02 (release) | Made constructors borrow slices by default, made copying explicit, and simplified transformation, filtering, and mutation APIs. |
| [v1.3.0](https://github.com/goforj/collection/releases/tag/v1.3.0) | 2026-01-01 (release) | Added `Where` as an alias for `Filter` in the v1 API. |
| [v1.2.0](https://github.com/goforj/collection/releases/tag/v1.2.0) | 2025-12-30 (release) | Tagged the same source commit as v1.1.0; no additional source changes. |
| [v1.1.0](https://github.com/goforj/collection/releases/tag/v1.1.0) | 2025-12-20 (release) | Refreshed API examples and benchmark documentation. |
| [v1.0.0](https://github.com/goforj/collection/releases/tag/v1.0.0) | 2025-12-16 (release) | Established fluent slice pipelines, set operations, grouping, map conversion, windows, partitioning, and explicit cloning. |

### Console {#console}

| Version | Date | Changes |
| --- | --- | --- |
| [v0.2.0](https://github.com/goforj/console/commits/v0.2.0) | 2026-08-08 (source) | Added opt-in OSC 9;4 terminal progress indicators for loaders and determinate progress, without control sequences in redirected output. |
| [v0.1.1](https://github.com/goforj/console/commits/v0.1.1) | 2026-07-16 (source) | Linked the API index to generated executable examples. |
| [v0.1.0](https://github.com/goforj/console/commits/v0.1.0) | 2026-07-16 (source) | Established semantic messages, ANSI-aware layouts, tables, trees, prompts, loaders, progress, and isolated console instances. |

### Crypt {#crypt}

v1.2.0 preserves Go signatures and reads of old ciphertext, but new writes use a different CBC envelope. Older readers cannot read those new writes. Roll out compatible readers before switching writers, or pause writes for a coordinated upgrade. Retain needed historical keys. Existing ciphertext does not generally need re-encryption. See the [wire-format migration](https://github.com/goforj/crypt/blob/v1.2.0/README.md#wire-format-migration).

| Version | Date | Changes |
| --- | --- | --- |
| [v1.2.0](https://github.com/goforj/crypt/commits/v1.2.0) | 2026-07-15 (source) | Changed CBC writes to the interoperable hex-MAC envelope, retained reads of historical ciphertext, and hardened key rotation. |
| [v1.1.0](https://github.com/goforj/crypt/releases/tag/v1.1.0) | 2026-02-26 (release) | Added instance-based Cipher methods and separated examples from runtime dependencies. |
| [v1.0.0](https://github.com/goforj/crypt/releases/tag/v1.0.0) | 2025-12-16 (release) | Established encryption, environment-backed key generation, and key rotation helpers. |

### Env {#env}

v2.0.3 moves loader debugging to `ENV_DEBUG`. v2.5.0 makes loading transactional, and v2.6.0 makes process environment variables override dotenv values. Review code that depended on file values overriding an existing process variable.

| Version | Date | Changes |
| --- | --- | --- |
| [v2.6.1](https://github.com/goforj/env/commits/v2.6.1) | 2026-08-12 (source) | Expanded accepted boolean environment values. |
| [v2.6.0](https://github.com/goforj/env/commits/v2.6.0) | 2026-07-23 (source) | Made process environment variables take precedence over dotenv files. |
| [v2.5.0](https://github.com/goforj/env/commits/v2.5.0) | 2026-07-16 (source) | Made environment loading transactional and clarified its failure behavior. |
| [v2.4.0](https://github.com/goforj/env/commits/v2.4.0) | 2026-04-03 (source) | Added reload support for changed environment files. |
| [v2.3.1](https://github.com/goforj/env/commits/v2.3.1) | 2026-03-13 (source) | Fixed scoped discovery of multi-word child names. |
| [v2.3.0](https://github.com/goforj/env/commits/v2.3.0) | 2026-03-11 (source) | Added `Load` as an entry point for layered environment loading. |
| [v2.2.0](https://github.com/goforj/env/commits/v2.2.0) | 2026-03-10 (source) | Added scoped prefixes. |
| [v2.1.0](https://github.com/goforj/env/commits/v2.1.0) | 2026-03-06 (source) | Added integer-map parsing through `GetMapInt`. |
| [v2.0.4](https://github.com/goforj/env/releases/tag/v2.0.4) | 2026-02-26 (release) | Separated examples from the runtime dependency tree. |
| [v2.0.3](https://github.com/goforj/env/releases/tag/v2.0.3) | 2026-02-10 (release) | Moved environment-loader debug output from `APP_DEBUG` to `ENV_DEBUG`. |
| [v2.0.2](https://github.com/goforj/env/releases/tag/v2.0.2) | 2026-01-14 (release) | Corrected examples and documentation. |
| [v2.0.1](https://github.com/goforj/env/releases/tag/v2.0.1) | 2026-01-14 (release) | Corrected the `/v2` module path and consolidated the `dev` environment name into `local`. |
| [v1.1.0](https://github.com/goforj/env/releases/tag/v1.1.0) | 2026-01-13 (release) | Added environment-context loading. |
| [v1.0.1](https://github.com/goforj/env/releases/tag/v1.0.1) | 2026-01-12 (release) | Corrected environment loading order. |
| [v1.0.0](https://github.com/goforj/env/releases/tag/v1.0.0) | 2025-12-16 (release) | Established the standalone environment-loading package and refined its behavior and tests. |
| [v0.0.1](https://github.com/goforj/env/releases/tag/v0.0.1) | 2025-12-15 (release) | Established the initial environment helper package. |

### Events {#events}

v0.2.1 publishes ten runtime and helper modules. The root, core, test and fake helpers, Redis, and SNS retain Go 1.24. Kafka requires Go 1.25; Google Pub/Sub, NATS, and JetStream require Go 1.26. These compiler requirements depend on the modules imported. The release preserves the event serialization contract and requires no message-data migration.

| Version | Date | Changes |
| --- | --- | --- |
| [v0.2.1](https://github.com/goforj/events/releases/tag/v0.2.1) | 2026-10-17 (release) | Updated compression and HTTP/2 dependencies across ten runtime and helper modules. Compiler requirements vary by driver. |
| [v0.2.0](https://github.com/goforj/events/commits/v0.2.0) | 2026-07-15 (source) | Hardened event delivery and teardown behavior while retaining Go 1.24 support. |
| [v0.1.3](https://github.com/goforj/events/commits/v0.1.3) | 2026-05-06 (source) | Added delivery-context propagation tests. |
| [v0.1.2](https://github.com/goforj/events/commits/v0.1.2) | 2026-05-05 (source) | Preserved delivery contexts in transport drivers. |
| [v0.1.1](https://github.com/goforj/events/commits/v0.1.1) | 2026-05-05 (source) | Adopted context-bound event facades through `WithContext`. |
| [v0.1.0](https://github.com/goforj/events/commits/v0.1.0) | 2026-03-10 (source) | Established typed events and transport drivers, including SNS and NATS JetStream. |

### Execx {#execx}

| Version | Date | Changes |
| --- | --- | --- |
| [v1.1.4](https://github.com/goforj/execx/commits/v1.1.4) | 2026-07-28 (source) | Waited through transient PTY reads instead of treating them as completed output. |
| [v1.1.3](https://github.com/goforj/execx/commits/v1.1.3) | 2026-07-16 (source) | Handled PTY hangup as EOF. |
| [v1.1.2](https://github.com/goforj/execx/commits/v1.1.2) | 2026-07-15 (source) | Made subprocess and pipeline lifecycles failure-safe. |
| [v1.1.1](https://github.com/goforj/execx/commits/v1.1.1) | 2026-07-13 (source) | Excluded documentation and examples from runtime module downloads. |
| [v1.1.0](https://github.com/goforj/execx/releases/tag/v1.1.0) | 2026-01-09 (release) | Added PTY support. |
| [v1.0.1](https://github.com/goforj/execx/releases/tag/v1.0.1) | 2026-01-09 (release) | Fixed TTY passthrough. |
| [v1.0.0](https://github.com/goforj/execx/releases/tag/v1.0.0) | 2026-01-03 (release) | Standardized shadow-print spacing. |
| [v0.1.0](https://github.com/goforj/execx/releases/tag/v0.1.0) | 2026-01-03 (release) | Added decoder pipelines. |
| [v0.0.1](https://github.com/goforj/execx/releases/tag/v0.0.1) | 2025-12-31 (release) | Established command execution and configurable shadow printing. |

### GoDump {#godump}

| Version | Date | Changes |
| --- | --- | --- |
| [v1.10.0](https://github.com/goforj/godump/releases/tag/v1.10.0) | 2026-10-17 (release) | Added opt-in `WithoutTypes` and serialization-tag-based redaction while preserving default output and Go 1.18 support. |
| [v1.9.1](https://github.com/goforj/godump/releases/tag/v1.9.1) | 2026-02-27 (release) | Removed the Testify dependency and separated examples from the runtime module. |
| [v1.9.0](https://github.com/goforj/godump/releases/tag/v1.9.0) | 2025-12-24 (release) | Added field redaction and `WithoutHeader`, and fixed maximum-depth handling. |
| [v1.8.0](https://github.com/goforj/godump/releases/tag/v1.8.0) | 2025-12-20 (release) | Added diff output, no-color configuration, and documentation generation. |
| [v1.7.1](https://github.com/goforj/godump/releases/tag/v1.7.1) | 2025-12-07 (release) | Reverted the Windows ANSI color change introduced in v1.7.0. |
| [v1.7.0](https://github.com/goforj/godump/releases/tag/v1.7.0) | 2025-12-02 (release) | Added type-display and Stringer controls, plus Windows ANSI color support subsequently reverted in v1.7.1. |
| [v1.6.0](https://github.com/goforj/godump/releases/tag/v1.6.0) | 2025-08-11 (release) | Established Go 1.18 compatibility and refined caller and color handling. |
| [v1.5.0](https://github.com/goforj/godump/releases/tag/v1.5.0) | 2025-07-04 (release) | Added configurable stack-frame skipping and corrected HTML and struct rendering. |
| [v1.4.0](https://github.com/goforj/godump/releases/tag/v1.4.0) | 2025-06-30 (release) | Displayed function parameter and return types. |
| [v1.3.0](https://github.com/goforj/godump/releases/tag/v1.3.0) | 2025-06-29 (release) | Added JSON dumping and customization, and corrected embedded-field and HTML output. |
| [v1.2.0](https://github.com/goforj/godump/commits/v1.2.0) | 2025-06-20 (source) | Added hex dumping. |
| [v1.1.0](https://github.com/goforj/godump/releases/tag/v1.1.0) | 2025-06-01 (release) | Documented writer-directed dumping through `Fdump`. |
| [v1.0.7](https://github.com/goforj/godump/commits/v1.0.7) | 2025-06-01 (source) | Added `Fdump` for writer-directed output. |
| [v1.0.6](https://github.com/goforj/godump/releases/tag/v1.0.6) | 2025-06-01 (release) | Fixed an out-of-bounds field index. |
| [v1.0.5](https://github.com/goforj/godump/releases/tag/v1.0.5) | 2025-05-31 (release) | Improved handling of custom types. |
| [v1.0.4](https://github.com/goforj/godump/commits/v1.0.4) | 2025-05-30 (source) | Improved custom-type handling and modernized implementation details. |
| [v1.0.3](https://github.com/goforj/godump/commits/v1.0.3) | 2025-05-30 (source) | Recovered safely from panicking `String` methods. |
| [v1.0.2](https://github.com/goforj/godump/commits/v1.0.2) | 2025-05-29 (source) | Used `String` methods when present. |
| [v1.0.1](https://github.com/goforj/godump/commits/v1.0.1) | 2025-05-28 (source) | Located the first caller outside GoDump when printing headers. |
| [v1.0.0](https://github.com/goforj/godump/releases/tag/v1.0.0) | 2025-05-26 (release) | Established the standalone GoDump package and its dump output. |
| [v0.1.2](https://github.com/goforj/godump/commits/v0.1.2) | 2025-05-26 (source) | Corrected the initial tests. |
| [v0.1.1](https://github.com/goforj/godump/commits/v0.1.1) | 2025-05-26 (source) | Renamed the package to `godump`. |
| [v0.1.0](https://github.com/goforj/godump/commits/v0.1.0) | 2025-05-26 (source) | Established the initial dumping implementation and documentation. |

### HTTPX {#httpx}

v2.1.0 raises the minimum from Go 1.24.4 to Go 1.27 for generic client methods; existing package-level request helpers remain. Consumers on older compilers should retain v2.0.1. The historical `v1` compatibility alias is separate from the numbered versions below.

| Version | Date | Changes |
| --- | --- | --- |
| [v2.1.0](https://github.com/goforj/httpx/releases/tag/v2.1.0) | 2026-10-17 (release) | Added generic client methods, fixed named string and byte-slice response decoding, and updated compression and network dependencies. Requires Go 1.27. |
| [v2.0.1](https://github.com/goforj/httpx/commits/v2.0.1) | 2026-03-08 (source) | Refreshed v2 tagging guidance, API documentation, and examples. |
| [v2.0.0](https://github.com/goforj/httpx/releases/tag/v2.0.0) | 2025-12-29 (release) | Introduced the v2 request API and refreshed its executable documentation. |
| [v1.1.0](https://github.com/goforj/httpx/commits/v1.1.0) | 2025-12-28 (source) | Added proxy, cookie, redirect, tracing, HEAD, OPTIONS, browser-profile, and fingerprinting helpers. |
| [v1.0.0](https://github.com/goforj/httpx/releases/tag/v1.0.0) | 2025-12-26 (release) | Established the HTTP client helpers, request API, and examples. |

### Mail {#mail}

v0.3.0 makes validation stricter: a sender must remain after defaults, unsafe headers and attachment metadata are rejected, fake and log delivery honor cancellation, and malformed custom endpoints fail at construction. Configure a default sender or provide one per message. Only the root and `mailses` are separately published modules; the other transport packages ship in the root module. See the [tagged compatibility notes](https://github.com/goforj/mail/blob/v0.3.0/README.md#unreleased-compatibility-notes), whose heading predates the tag.

| Version | Date | Changes |
| --- | --- | --- |
| [v0.3.1](https://github.com/goforj/mail/commits/v0.3.1) | 2026-07-16 (source) | Isolated attachment test fixtures and staged SES dependency checksums. |
| [v0.3.0](https://github.com/goforj/mail/commits/v0.3.0) | 2026-07-15 (source) | Enforced portable sender, header, attachment, endpoint, and cancellation contracts across bundled transports. |
| [v0.2.0](https://github.com/goforj/mail/commits/v0.2.0) | 2026-04-21 (source) | Expanded core, fake, SMTP, and provider edge-case coverage. |
| [v0.1.0](https://github.com/goforj/mail/commits/v0.1.0) | 2026-04-19 (source) | Established message building, attachments, fake and log delivery, SMTP, SES, Mailgun, Postmark, Resend, and SendGrid transports. |

### Metrics {#metrics}

v0.2.0 tightens registration and exposition validation and changes `Histogram.Sum` and `HistogramSnapshot.Sum` from `int64` to `float64`. Counter unit suffixes and escaped label values can change exported series identities. Review typed sum consumers, dashboards, and recording rules using the [migration guide](https://github.com/goforj/metrics/blob/v0.2.0/MIGRATING.md).

| Version | Date | Changes |
| --- | --- | --- |
| [v0.2.0](https://github.com/goforj/metrics/commits/v0.2.0) | 2026-07-16 (source) | Hardened descriptor, label, and exposition validation; made histogram snapshots coherent and changed histogram sums to `float64`. |
| [v0.1.0](https://github.com/goforj/metrics/commits/v0.1.0) | 2026-04-27 (source) | Established registries, counters, gauges, histograms, snapshots, and Prometheus exposition. |

### Null {#null}

This fork retains nullable SQL and JSON behavior from the upstream v6 lineage under `github.com/goforj/null/v6`. The two numbered tags resolve to the same source commit; the source date of v6.0.2 is not evidence that it was published before v6.0.1.

| Version | Date | Changes |
| --- | --- | --- |
| [v6.0.2](https://github.com/goforj/null/commits/v6.0.2) | 2025-07-15 (source) | Tagged the same source commit as v6.0.1; no additional source changes. |
| [v6.0.1](https://github.com/goforj/null/releases/tag/v6.0.1) | 2025-07-16 (release) | Established the GoForj module path for the nullable SQL and JSON compatibility fork, retaining the upstream v6 implementation. |

### Queue {#queue}

| Version | Date | Changes |
| --- | --- | --- |
| [v0.2.1](https://github.com/goforj/queue/commits/v0.2.1) | 2026-06-07 (source) | Aligned integration-test queue names with physical queue naming. |
| [v0.2.0](https://github.com/goforj/queue/commits/v0.2.0) | 2026-06-07 (source) | Tagged the same source commit as v0.1.17; no additional source changes. |
| [v0.1.17](https://github.com/goforj/queue/commits/v0.1.17) | 2026-06-07 (source) | Inferred physical queue names from driver defaults. |
| [v0.1.16](https://github.com/goforj/queue/commits/v0.1.16) | 2026-05-06 (source) | Added cross-driver coverage for handler context propagation. |
| [v0.1.15](https://github.com/goforj/queue/commits/v0.1.15) | 2026-05-06 (source) | Regenerated examples from the updated dispatch documentation. |
| [v0.1.14](https://github.com/goforj/queue/commits/v0.1.14) | 2026-05-06 (source) | Decorated handler contexts before process-observer events. |
| [v0.1.13](https://github.com/goforj/queue/commits/v0.1.13) | 2026-05-06 (source) | Corrected examples. |
| [v0.1.12](https://github.com/goforj/queue/commits/v0.1.12) | 2026-05-06 (source) | Adopted context-bound dispatch through `WithContext`. |
| [v0.1.11](https://github.com/goforj/queue/commits/v0.1.11) | 2026-05-05 (source) | Exposed queue event constants. |
| [v0.1.10](https://github.com/goforj/queue/commits/v0.1.10) | 2026-05-05 (source) | Completed observer context propagation in drivers. |
| [v0.1.9](https://github.com/goforj/queue/commits/v0.1.9) | 2026-05-05 (source) | Propagated contexts through queue observer events. |
| [v0.1.8](https://github.com/goforj/queue/commits/v0.1.8) | 2026-04-22 (source) | Normalized observed job types across drivers. |
| [v0.1.7](https://github.com/goforj/queue/commits/v0.1.7) | 2026-04-06 (source) | Aligned Redis worker shutdown timeout handling. |
| [v0.1.6](https://github.com/goforj/queue/commits/v0.1.6) | 2026-03-16 (source) | Added shared driver logger configuration and stabilized Redis tests. |
| [v0.1.5](https://github.com/goforj/queue/commits/v0.1.5) | 2026-03-02 (source) | Added administration contracts and Redis and SQL backend operations. |
| [v0.1.4](https://github.com/goforj/queue/commits/v0.1.4) | 2026-03-01 (source) | Added readiness checks. |
| [v0.1.3](https://github.com/goforj/queue/commits/v0.1.3) | 2026-02-27 (source) | Removed coupling to a specific driver implementation. |
| [v0.1.2](https://github.com/goforj/queue/commits/v0.1.2) | 2026-02-27 (source) | Added lifecycle event hooks. |
| [v0.1.1](https://github.com/goforj/queue/commits/v0.1.1) | 2026-02-26 (source) | Stabilized initialization through readiness handling. |
| [v0.1.0](https://github.com/goforj/queue/releases/tag/v0.1.0) | 2026-02-25 (release) | Established queue dispatch, workers, recovery policies, workflow primitives, fakes, and separately packaged backends. |

### Scheduler {#scheduler}

v2 makes handlers and hooks error-aware and uses the `github.com/goforj/scheduler/v2` module path. Update callback signatures when moving from v1. Tables follow version order; tagged-source dates are not necessarily monotonic.

| Version | Date | Changes |
| --- | --- | --- |
| [v2.1.4](https://github.com/goforj/scheduler/commits/v2.1.4) | 2026-07-17 (source) | Updated cache dependencies used by scheduler locking and refreshed API links. |
| [v2.1.3](https://github.com/goforj/scheduler/commits/v2.1.3) | 2026-05-05 (source) | Passed observer information through task context handling. |
| [v2.1.2](https://github.com/goforj/scheduler/commits/v2.1.2) | 2026-05-06 (source) | Added task context decorators. |
| [v2.1.1](https://github.com/goforj/scheduler/commits/v2.1.1) | 2026-05-05 (source) | Adapted cache-backed locking to the Cache `WithContext` API. |
| [v2.1.0](https://github.com/goforj/scheduler/commits/v2.1.0) | 2026-04-10 (source) | Added scheduler administration primitives. |
| [v2.0.0](https://github.com/goforj/scheduler/commits/v2.0.0) | 2026-04-10 (source) | Made handlers and hooks error-aware and moved the module to `/v2`. |
| [v1.4.0](https://github.com/goforj/scheduler/commits/v1.4.0) | 2026-03-06 (source) | Updated the Cache dependency and installation guidance. |
| [v1.3.0](https://github.com/goforj/scheduler/commits/v1.3.0) | 2026-03-03 (source) | Added pause and resume controls, shared runtime state, and paused-job metadata and execution semantics. |
| [v1.2.0](https://github.com/goforj/scheduler/commits/v1.2.0) | 2026-03-03 (source) | Added the Scheduler facade and command execution targets. |
| [v1.1.1](https://github.com/goforj/scheduler/commits/v1.1.1) | 2026-02-27 (source) | Refined documentation and maintenance fixes. |
| [v1.1.0](https://github.com/goforj/scheduler/commits/v1.1.0) | 2026-02-27 (source) | Added cache-backed locking and explicit empty-job-list output. |
| [v1.0.0](https://github.com/goforj/scheduler/releases/tag/v1.0.0) | 2025-12-17 (release) | Established the scheduling DSL, job registration, and examples. |

### Storage {#storage}

v0.6.0 publishes twelve runtime and helper modules. The root, core, FTP, memory, and S3 modules require Go 1.24.4; Dropbox and local storage require Go 1.25; GCS, rclone, Redis, SFTP, and `storagetest` require Go 1.26. These differences were introduced by v0.5.1, not the streaming addition. Streaming is an optional capability: existing `Storage`, buffered operations, and stored objects remain compatible. See [v0.5.1 upgrade requirements](https://github.com/goforj/storage/releases/tag/v0.5.1) and [v0.6.0 streaming contracts](https://github.com/goforj/storage/releases/tag/v0.6.0).

| Version | Date | Changes |
| --- | --- | --- |
| [v0.6.0](https://github.com/goforj/storage/releases/tag/v0.6.0) | 2026-10-18 (release) | Added optional streaming object storage, S3 pagination, metadata, conditional operations, and explicit bucket preparation across twelve coordinated module tags. |
| [v0.5.1](https://github.com/goforj/storage/releases/tag/v0.5.1) | 2026-10-17 (release) | Updated driver dependencies and compression, preserved Redis timing defaults, and clarified optional paging tests. Compiler requirements vary by module. |
| [v0.5.0](https://github.com/goforj/storage/commits/v0.5.0) | 2026-07-16 (source) | Hardened storage driver contracts and lifecycle behavior. |
| [v0.4.6](https://github.com/goforj/storage/commits/v0.4.6) | 2026-05-06 (source) | Added cross-driver context-handling tests and refreshed examples. |
| [v0.4.5](https://github.com/goforj/storage/commits/v0.4.5) | 2026-05-05 (source) | Adopted context-bound storage facades through `WithContext`. |
| [v0.4.4](https://github.com/goforj/storage/commits/v0.4.4) | 2026-04-07 (source) | Corrected listing sort behavior. |
| [v0.4.3](https://github.com/goforj/storage/commits/v0.4.3) | 2026-04-07 (source) | Updated coordinated release metadata. |
| [v0.4.2](https://github.com/goforj/storage/commits/v0.4.2) | 2026-04-07 (source) | Added directory operations and file counting, and made local listing order deterministic. |
| [v0.3.0](https://github.com/goforj/storage/commits/v0.3.0) | 2026-04-07 (source) | Added paged listing and corrected SFTP readiness. |
| [v0.2.5](https://github.com/goforj/storage/commits/v0.2.5) | 2026-03-11 (source) | Extracted `storagecore` so driver modules no longer depend on the root facade. |
| [v0.2.4](https://github.com/goforj/storage/commits/v0.2.4) | 2026-03-11 (source) | Refined module replacements and coverage maintenance. |
| [v0.2.3](https://github.com/goforj/storage/commits/v0.2.3) | 2026-03-11 (source) | Refined release metadata and repository maintenance. |
| [v0.2.2](https://github.com/goforj/storage/commits/v0.2.2) | 2026-03-11 (source) | Split storage modules. |
| [v0.2.1](https://github.com/goforj/storage/commits/v0.2.1) | 2026-03-08 (source) | Corrected module references. |
| [v0.2.0](https://github.com/goforj/storage/commits/v0.2.0) | 2026-03-08 (source) | Added Redis blob storage, improved listing and walking, and renamed local configuration from `Remote` to `Root`. |
| [v0.1.0](https://github.com/goforj/storage/commits/v0.1.0) | 2026-03-06 (source) | Added memory storage and fake interfaces, expanded examples, and corrected module builds. |
| [v0.0.1](https://github.com/goforj/storage/commits/v0.0.1) | 2025-12-21 (source) | Established the storage package, separate rclone integration, and remote-filesystem integration tests. |

### Str {#str}

v3 retains Go 1.24 as its minimum, but requires `/v3` imports and behavior review. Search indexes use bytes; trimming uses standard cutset semantics; `Lines` returns an iterator. Changing the import alone is insufficient. See the [v2 to v3 migration guide](https://github.com/goforj/str/blob/v3.0.0/MIGRATING.md).

| Version | Date | Changes |
| --- | --- | --- |
| [v3.0.0](https://github.com/goforj/str/releases/tag/v3.0.0) | 2026-09-12 (release) | Aligned fluent operations with the standard `strings` contracts, including byte-based search indexes, cutset trimming, and iterator-based `Lines`. Requires import migration to `/v3`. |
| [v2.0.1](https://github.com/goforj/str/releases/tag/v2.0.1) | 2026-07-13 (release) | Excluded documentation and examples from runtime module downloads. |
| [v2.0.0](https://github.com/goforj/str/releases/tag/v2.0.0) | 2026-07-13 (release) | Simplified the API, removed aliases, standardized names, and clarified Unicode behavior. Requires import migration to `/v2` and method updates. |
| [v1.3.0](https://github.com/goforj/str/releases/tag/v1.3.0) | 2026-03-10 (release) | Added folded search indexes and counts, character predicates, affix helpers, common prefixes and suffixes, initials, and native-type parsing. |
| [v1.2.0](https://github.com/goforj/str/releases/tag/v1.2.0) | 2025-12-28 (release) | Added a `TrimSpace` wrapper to the v1 API. |
| [v1.1.2](https://github.com/goforj/str/releases/tag/v1.1.2) | 2025-12-28 (release) | Removed the negated predicate variants from the v1 API. |
| [v1.1.1](https://github.com/goforj/str/releases/tag/v1.1.1) | 2025-12-28 (release) | Removed the GoDump runtime dependency. |
| [v1.1.0](https://github.com/goforj/str/releases/tag/v1.1.0) | 2025-12-28 (release) | Added matching, pluralization, singularization, transliteration, normalization, and additional replacement helpers. |
| [v1.0.0](https://github.com/goforj/str/releases/tag/v1.0.0) | 2025-12-18 (release) | Established immutable fluent string construction, transformations, and executable examples. |

### Web {#web}

v0.6.3 raises the minimum from Go 1.25 to Go 1.26. Review TLS-terminating proxies before adopting v0.6.3 or later: forwarded scheme headers now depend on trusted proxy configuration. Public-address proxies and `100.64.0.0/10` need explicit trusted CIDRs where applicable. Client-IP extraction is a separate setting. See the [tagged proxy guidance](https://github.com/goforj/web/blob/v0.6.3/README.md#request-scheme-and-proxy-trust). v0.6.4 preserves the API and minimum compiler version.

| Version | Date | Changes |
| --- | --- | --- |
| [v0.6.4](https://github.com/goforj/web/releases/tag/v0.6.4) | 2026-10-18 (release) | Reused middleware dispatch continuations to remove one allocation per benchmarked middleware operation. |
| [v0.6.3](https://github.com/goforj/web/releases/tag/v0.6.3) | 2026-10-17 (release) | Adopted Echo 5.4 security fixes and repaired Go 1.27 API indexing. Requires Go 1.26 and a review of forwarded-scheme proxy trust. |
| [v0.6.2](https://github.com/goforj/web/commits/v0.6.2) | 2026-07-21 (source) | Added and hardened incremental API-index caching and target-specific cache reads. |
| [v0.6.1](https://github.com/goforj/web/commits/v0.6.1) | 2026-07-18 (source) | Optimized Echo dispatch, expanded adapter guard-path tests, and added reproducible benchmarks. |
| [v0.6.0](https://github.com/goforj/web/commits/v0.6.0) | 2026-07-13 (source) | Hardened App-scoped API indexing, schema generation, and build-context handling. |
| [v0.5.3](https://github.com/goforj/web/commits/v0.5.3) | 2026-06-20 (source) | Added API-index filters. |
| [v0.5.2](https://github.com/goforj/web/commits/v0.5.2) | 2026-06-05 (source) | Preserved request context reuse through root middleware. |
| [v0.5.1](https://github.com/goforj/web/commits/v0.5.1) | 2026-06-05 (source) | Tightened target-scoped route indexing. |
| [v0.5.0](https://github.com/goforj/web/commits/v0.5.0) | 2026-06-05 (source) | Scoped API indexing to route composition. |
| [v0.4.2](https://github.com/goforj/web/commits/v0.4.2) | 2026-06-04 (source) | Inferred middleware names for route reporting and refined middleware examples. |
| [v0.4.1](https://github.com/goforj/web/commits/v0.4.1) | 2026-05-22 (source) | Improved Echo request fast paths and exposed adapter source names. |
| [v0.4.0](https://github.com/goforj/web/commits/v0.4.0) | 2026-04-20 (source) | Expanded adapter and middleware contract coverage and refreshed package documentation. |
| [v0.3.0](https://github.com/goforj/web/commits/v0.3.0) | 2026-04-09 (source) | Added first-class WebSocket routes. |
| [v0.2.0](https://github.com/goforj/web/commits/v0.2.0) | 2026-04-08 (source) | Added handler contexts for the `webtest` testing package. |
| [v0.1.0](https://github.com/goforj/web/commits/v0.1.0) | 2026-04-06 (source) | Established HTTP contracts, the Echo v5 adapter, declarative routes, lifecycle handling, response visibility, and Prometheus telemetry. |

### Wire {#wire}

v1.3.0 raises the minimum from Go 1.19 to Go 1.25 because of tooling dependencies. Provider APIs and the default generation command remain compatible. Custom generation commands are opt-in. v1.3.1 fixes cgo discovery without another minimum-Go increase.

| Version | Date | Changes |
| --- | --- | --- |
| [v1.3.1](https://github.com/goforj/wire/releases/tag/v1.3.1) | 2026-10-21 (release) | Preserved cgo constructors during fresh and cached discovery and refreshed older discovery caches automatically. |
| [v1.3.0](https://github.com/goforj/wire/releases/tag/v1.3.0) | 2026-10-17 (release) | Invalidated stale workspace-provider caches and added opt-in custom generation commands. Requires Go 1.25. |
| [v1.2.0](https://github.com/goforj/wire/commits/v1.2.0) | 2026-04-28 (source) | Added the custom package loader and generation performance improvements. |
| [v1.1.0](https://github.com/goforj/wire/releases/tag/v1.1.0) | 2026-01-08 (release) | Added watch mode. |
| [v1.0.0](https://github.com/goforj/wire/releases/tag/v1.0.0) | 2026-01-08 (release) | Established the GoForj-maintained Wire fork and its generation-cache work. |

### Driver and Test Hygiene

A root tag does not publish a nested Go module. The following driver and helper modules have their own tags at the coordinated versions shown. Upgrade the modules your application imports and check their individual compiler requirements.

| Library | Coordinated version | Independently tagged modules |
| --- | --- | --- |
| Cache | v0.4.2 | [`cachecore`](https://github.com/goforj/cache/tree/cachecore/v0.4.2), [`cachetest`](https://github.com/goforj/cache/tree/cachetest/v0.4.2), [`driver/dynamocache`](https://github.com/goforj/cache/tree/driver/dynamocache/v0.4.2), [`driver/memcachedcache`](https://github.com/goforj/cache/tree/driver/memcachedcache/v0.4.2), [`driver/mysqlcache`](https://github.com/goforj/cache/tree/driver/mysqlcache/v0.4.2), [`driver/natscache`](https://github.com/goforj/cache/tree/driver/natscache/v0.4.2), [`driver/postgrescache`](https://github.com/goforj/cache/tree/driver/postgrescache/v0.4.2), [`driver/rediscache`](https://github.com/goforj/cache/tree/driver/rediscache/v0.4.2), [`driver/sqlcore`](https://github.com/goforj/cache/tree/driver/sqlcore/v0.4.2), [`driver/sqlitecache`](https://github.com/goforj/cache/tree/driver/sqlitecache/v0.4.2) |
| Events | v0.2.1 | [`driver/gcppubsubevents`](https://github.com/goforj/events/tree/driver/gcppubsubevents/v0.2.1), [`driver/kafkaevents`](https://github.com/goforj/events/tree/driver/kafkaevents/v0.2.1), [`driver/natsevents`](https://github.com/goforj/events/tree/driver/natsevents/v0.2.1), [`driver/natsjetstreamevents`](https://github.com/goforj/events/tree/driver/natsjetstreamevents/v0.2.1), [`driver/redisevents`](https://github.com/goforj/events/tree/driver/redisevents/v0.2.1), [`driver/snsevents`](https://github.com/goforj/events/tree/driver/snsevents/v0.2.1), [`eventscore`](https://github.com/goforj/events/tree/eventscore/v0.2.1), [`eventsfake`](https://github.com/goforj/events/tree/eventsfake/v0.2.1), [`eventstest`](https://github.com/goforj/events/tree/eventstest/v0.2.1) |
| Mail | v0.3.1 | [`mailses`](https://github.com/goforj/mail/tree/mailses/v0.3.1) |
| Queue | v0.2.1 | [`driver/mysqlqueue`](https://github.com/goforj/queue/tree/driver/mysqlqueue/v0.2.1), [`driver/natsqueue`](https://github.com/goforj/queue/tree/driver/natsqueue/v0.2.1), [`driver/postgresqueue`](https://github.com/goforj/queue/tree/driver/postgresqueue/v0.2.1), [`driver/rabbitmqqueue`](https://github.com/goforj/queue/tree/driver/rabbitmqqueue/v0.2.1), [`driver/redisqueue`](https://github.com/goforj/queue/tree/driver/redisqueue/v0.2.1), [`driver/sqlitequeue`](https://github.com/goforj/queue/tree/driver/sqlitequeue/v0.2.1), [`driver/sqlqueuecore`](https://github.com/goforj/queue/tree/driver/sqlqueuecore/v0.2.1), [`driver/sqsqueue`](https://github.com/goforj/queue/tree/driver/sqsqueue/v0.2.1) |
| Storage | v0.6.0 | [`driver/dropboxstorage`](https://github.com/goforj/storage/tree/driver/dropboxstorage/v0.6.0), [`driver/ftpstorage`](https://github.com/goforj/storage/tree/driver/ftpstorage/v0.6.0), [`driver/gcsstorage`](https://github.com/goforj/storage/tree/driver/gcsstorage/v0.6.0), [`driver/localstorage`](https://github.com/goforj/storage/tree/driver/localstorage/v0.6.0), [`driver/memorystorage`](https://github.com/goforj/storage/tree/driver/memorystorage/v0.6.0), [`driver/rclonestorage`](https://github.com/goforj/storage/tree/driver/rclonestorage/v0.6.0), [`driver/redisstorage`](https://github.com/goforj/storage/tree/driver/redisstorage/v0.6.0), [`driver/s3storage`](https://github.com/goforj/storage/tree/driver/s3storage/v0.6.0), [`driver/sftpstorage`](https://github.com/goforj/storage/tree/driver/sftpstorage/v0.6.0), [`storagecore`](https://github.com/goforj/storage/tree/storagecore/v0.6.0), [`storagetest`](https://github.com/goforj/storage/tree/storagetest/v0.6.0) |

Queue also has historical `docs`, `examples`, and `integration` tags through v0.2.1. Cache, Events, and Storage have older support-module tags that do not advance with their latest runtime releases. Do not infer a new documentation, benchmark, or integration module version from a root release. Other libraries can contain nested tooling modules without publishing them separately.

The linked release notes describe backend-specific validation and operational requirements.

## Earlier Framework Releases

## v0.20.0

Released June 27, 2026.

### Multi-App Development Runtime

- Reworked `forj dev` so discovered Apps use app-scoped build and runtime commands.
- Preserved one coordinated development session while keeping each App's runtime identity, binary, and configured launch command explicit.
- Honored configured development startup commands instead of replacing them with one hard-coded runtime shape.
- Kept default-app commands unprefixed while named Apps continue to use `forj <app> <command>`.

## v0.19.0

Released June 24, 2026.

### Atlas and Agent Support

- Added first-class Atlas installation during project creation.
- Added project diagnostics and framework-aware local agent context.
- Added generated guidance and workflow skills for routes, jobs, schedules, events, data resources, Wire repair, runtime debugging, and multi-app changes.

### Starter Kits

- Added the React starter kit with React, Vite, TypeScript, Tailwind, and shadcn/ui.
- Added the templ + htmx starter kit with app-owned Go templates, htmx behavior, Tailwind, Basecoat, controller wiring, and generated tests.
- Preserved Vue as the existing client-side reference while giving all three kits the same generated ownership model.

### Command Experience

- Added configurable generated CLI help formats.
- Fixed Atlas rendering and updated the Atlas dependency used by new Projects.

## v0.18.1

Released June 20, 2026.

- Fixed generated build-link behavior after the multi-app layout release.

## v0.18.0

Released June 16, 2026.

### Multi-App Architecture

- Added first-class support for one GoForj Project containing multiple runnable Apps.
- Added the default App at `app/` with its binary entrypoint at `cmd/app/main.go`.
- Added named Apps under `app/<name>/` with matching binary entrypoints under `cmd/<name>/main.go`.
- Added app-prefixed command routing such as `forj admin route:list`, `forj admin make:controller reports`, and `forj admin build`.
- Updated `make:*` commands so an app prefix writes generated code into the selected App's registration and Wire files.
- Moved App composition into app-owned files such as `commands.go`, `routes.go`, `schedules.go`, `lifecycle.go`, and `root_cmd.go`.
- Renamed the public domain model from app targets to Apps.
- Added app-aware rendering, discovery, configuration, runtime metadata, and generated tests.

### Runtime, Build, and Dev

- Added app-scoped build and run behavior.
- Added multi-app `forj dev` support.
- Added deterministic runtime ports for named Apps.
- Added app-scoped OpenAPI and API index output.
- Added app-scoped migrations.
- Added multi-app render and integration smoke coverage.
- Reduced render dependency sync work by avoiding unnecessary `go get` calls.
- Integrated `web v0.5.x` route composition support so route indexes and OpenAPI output can be scoped by App.

### Observability

- Added app identity to runtime metrics and Lighthouse metadata.
- Updated Grafana dashboards so app signals can be filtered and grouped.
- Updated Lighthouse display to show Apps and runtimes instead of target-oriented language.

## v0.17.0

Released June 3, 2026.

### Make Commands and App Composition Groundwork

- Added removal flow support for generated make command artifacts.
- Improved generated CLI ergonomics.
- Added app composition layout design work that became the basis for multi-app architecture.
- Added database and cache shell commands.
- Added event subscriber generation.
- Added queue resource maker workflow.
- Added editor-open hooks for generated controller and make command flows.
- Moved make generators deeper into the App command surface.
- Simplified generated CLI help output.
- Stabilized rendered app tests around the expanded generator surface.

## v0.16.0

Released June 1, 2026.

### App Command Ergonomics

- Added schedule generator support.
- Cleaned up App command UX.
- Simplified app command delegation in the CLI.
- Improved generated queue developer experience.
- Logged queue worker allocations on startup.
- Made Grafana bind mounts friendlier to rootless local development.
- Added the first app composition layout proposal.

## v0.15.0

Released May 26, 2026.

### Runtime Command Aliases and Build Stabilization

- Added runtime aliases for App commands.
- Passed local app commands through the `forj` command surface.
- Made run progress transient so command output stays easier to scan.
- Simplified release version output.
- Added the MIT license.
- Added migration translation design notes.

## v0.14.0

Released May 22, 2026.

### Runtime Performance and Inspect Overhead

- Reduced inspect, logger, and metrics overhead on HTTP request paths.
- Streamlined Lighthouse inspect transport.
- Introduced structured logger pipeline and profiling harnesses.
- Moved maintainer benchmarks into internal packages.
- Tightened source and local error middleware paths.
- Refined frontend monitoring visuals and loading behavior.
- Restored SPA fallback routing under the web adapter.

## v0.13.0

Released May 20, 2026.

### Lighthouse Execution Inspection

- Added Lighthouse execution inspection as a framework capability.
- Captured runtime behavior across HTTP, jobs, scheduler, mail, cache, storage, events, database, and logging paths.
- Added encrypted command routing and inspect transport integration.
- Added inspect browsing and detail views in Lighthouse.
- Added inspect dashboards and overhead benchmarks.
- Switched primitive integrations toward structured event records.
- Hardened render, Lighthouse, metrics, and generated inspect tests.
- Reduced slow integration outliers and reused integration database containers where possible.

## v0.12.0

Released May 6, 2026.

### Runtime Source Attribution

- Unified execution source attribution across framework ingress points.
- Propagated source identity through generated HTTP, command, queue, scheduler, and event paths.
- Verified source propagation with framework tests.
- Split generated primitive accessors into dedicated generated files.
- Refined context guidance for generated runtime behavior.
- Synced generated module pins and rendered auth tests.

## v0.11.0

Released May 2, 2026.

### Metrics and Observability

- Added the metrics framework milestone.
- Introduced the standalone `metrics` library release line.
- Added database query fingerprinting.
- Added per-surface instrumentation toggles.
- Generated topology-aware metrics targets.
- Added overhead comparison commands for metrics.
- Refined observability dashboards across primitives.
- Moved metrics overhead guidance into maintainer docs.

## v0.10.0

Released April 27, 2026.

### Vue Starter Kit

- Added the Vue starter kit foundation.
- Added generated auth registration and recovery screens.
- Added login loading and feedback behavior.
- Added starter kit auth strengthening.
- Added Mailpit local development support.
- Integrated `mail` library transport work into generated auth mail delivery.
- Refined sidebar, command menu, scrolling, and route overlay behavior.
- Added starter kit documentation and design context.

## v0.9.1

Released April 21, 2026.

### Lighthouse Polish and Atlas Groundwork

- Streamlined Lighthouse dashboard summaries.
- Improved env editor behavior and route editing affordances.
- Added validation for editor symbols in bulk operations.
- Continued Lighthouse UI and table styling cleanup.
- Added early Atlas MCP server design context.

## v0.9.0

Released April 20, 2026.

### Web, Auth, Mail, and Lighthouse Foundations

- Expanded generated web, auth, mail, and Lighthouse foundations.
- Integrated the standalone `web`, `mail`, `queue`, `cache`, `storage`, and `scheduler` libraries into the GoForj App model.
- Added generated auth implementation, including users, sessions, password reset, email verification, login attempts, and OAuth provider scaffolding.
- Added generated auth commands for creating users and setting passwords.
- Added generated mail support and auth delivery integration.
- Expanded Lighthouse templates, UI, transport, project config, and generated routes.
- Added generated lifecycle behavior and runtime timeout handling.
- Added generated readiness, health, Swagger, route list, and HTTP server improvements.
- Added a component catalog and project renderer module replacement support.
- Added integration testkit helpers for containers, compose, temp dirs, render harnesses, and repo setup.
- Added substantial design and context documentation for auth, mail, metrics, runtime architecture, observability, and repository boundaries.

## v0.8.0

Released February 13, 2026.

### Events, API Index, OpenAPI, and Lifecycle

- Added eventing support.
- Added API index generation and build commands.
- Added OpenAPI and Swagger generation hardening.
- Added startup and lifecycle hooks.
- Added health and readiness probes.
- Added queue and cache abstractions.
- Adopted standalone `queue`, `events`, and `cache` package behavior for App primitives.
- Added graceful workerpool and dispatcher shutdown behavior.
- Ported database integration tests.
- Added `test:openapi`.
- Added `run` to start API, scheduler, and jobs together.

## v0.7.0

Released February 10, 2026.

### Demo Monitoring Stack and Native Dev Loop

- Added the demo monitoring stack.
- Added monitor operations tooling.
- Added native `wgo`-based local development loop behavior.
- Added monitor polling, incidents, notification providers, channel validation, and settings.
- Added demo persistence and repository consolidation.
- Added demo seeding and diagnostics pages.
- Avoided embedding frontend node dependencies in rendered output.
- Exercised the database, queue, scheduler, cache, storage, command, and frontend paths through a realistic App.

## v0.6.0

Released February 6, 2026.

### Dev Console Runtime

- Shipped Dev Console UI and runtime.
- Refactored template embedding.
- Hardened command generation.
- Added command console coloring fixes.
- Added `DEVCONSOLE_ENABLED` gating.
- Overhauled `forj new` after the first dev console pass.
- Built on the first standalone command execution and watcher utility work that later became part of the developer toolchain.

## v0.5.0

Released January 14, 2026.

### Application Logging

- Added structured application logging.
- Improved logging behavior in GoForj Apps.
- Prepared the local runtime surface for richer dev console and watcher behavior.

## v0.4.0

Released January 13, 2026.

### Database Architecture

- Re-architected database connections.
- Added connection-aware migrations.
- Added model and repository generation pairing.
- Added repository Wire injection.
- Added many-to-many and polymorphic relationship support.
- Added field encryption and decryption support.
- Added PostgreSQL and SQLite support.
- Added migration docs and database render/integration coverage.

## v0.3.0

Released December 16, 2025.

### Project Creation and Command UX

- Improved the `forj new` flow with validation, path selection, cancellation, hotkeys, and clearer terminal presentation.
- Ran Wire generation after project creation.
- Added `--version`.
- Added route listing on boot.
- Refined CLI help alignment and command grouping.
- Moved environment and crypt packages toward first-party module ownership.
- Established early use of `env`, `crypt`, `execx`, and `wire` as project-owned building blocks instead of hidden framework internals.

## v0.2.0

Released May 28, 2025.

### Renderer and Generator Foundation

- Expanded the project renderer.
- Added render-once templates.
- Added route list command support.
- Split registration points for commands, controllers, schedules, and HTTP wiring.
- Added initial CI render coverage.
- Added many missing App templates.
- Improved `make:command` and `make:controller` injection behavior.
- Hardened rendered test coverage around generated projects.

## v0.1.x

Released May 26 through December 6, 2025.

### Early Framework and Package Foundation

- Established the early GoForj repository and CLI shape.
- Added the first project renderer and App templates.
- Added early `make:command` behavior.
- Added early build and render test workflows.
- Added the table package.
- Moved `env` and `crypt` toward top-level package ownership.
- Added the env runtime.
- Iterated on Docker-in-Docker, render tests, and CI setup.
- Started the first-party package strategy that later produced standalone libraries for collections, strings, HTTP utilities, dumps, execution, configuration, encryption, queues, events, cache, storage, scheduler, web, mail, metrics, and wiring.
