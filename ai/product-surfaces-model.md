# GoForj Product Surfaces Model

## Purpose

This file defines how to document GoForj product surfaces that are larger than a single primitive library.

Examples:

- Auth
- Starter Kits
- Lighthouse
- API Index / OpenAPI generation
- Extensions
- `forj dev`
- generated frontend app shells

These surfaces combine framework policy, generated code, primitives, commands, UI, and operational behavior. They need a different docs model than simple package pages.

## Product Surface Rule

A product surface should be documented by capability, ownership, lifecycle, and extension points.

Do not document it only as files or APIs.

## Auth

Auth is a generated framework component, not just a library wrapper.

Docs should cover:

- component dependencies
- generated routes
- cookie and session model
- access and refresh token behavior
- server-authoritative sessions
- password reset and email verification
- login rate limiting and lockout
- OAuth layering when enabled
- scheduled cleanup
- request inspect visibility
- safe debug logging rules
- testing and fake provider strategy

Auth docs should be security-first and operationally precise. Avoid presenting JWTs as the sole source of truth.

Recommended artifact:

- `security/auth-docs-model.md` or `ai/auth-docs-model.md`

## Starter Kits

Starter kits are product starting points, not framework primitives.

Docs should cover:

- optional component selection during App creation
- component compatibility
- what the kit generates
- which code the user owns after creation
- how the frontend app shell relates to backend components
- auth-aware routes and pages when Auth is enabled
- how to remove or change starter code
- what is optional versus required

Starter kits should feel production-minded, not demo-only.

Starter kits should not imply that GoForj pulls in the full framework by default. App owners choose the components they need during creation. A starter can be a simple CLI, an API service, a frontend-backed application, or a full system with auth, mail, queues, scheduling, metrics, observability, Docker resources, and database support.

The strongest message is ownership: generated starter files live in the App source tree. They are not hosted templates, hidden framework internals, or opaque runtime surfaces. Teams can inspect, replace, or evolve the generated code.

The Starter Kits marketing page should show real generated surfaces:

- login, registration, password reset, and settings screens
- dashboard shell and application navigation
- component reference pages grouped by workflow
- overlay, command palette, and form patterns

Keep public screenshots current and descriptive. Rename imported screenshots to product-oriented names rather than timestamped desktop filenames.

Recommended public docs:

- `getting-started/starter-kits.md`
- `frontend/vue-starter-kit.md`
- `frontend/react-starter-kit.md`
- `frontend/templ-htmx-starter-kit.md`
- `starter-kits.md`

## Lighthouse

Lighthouse is an operator-facing runtime visibility surface.

Docs should cover:

- runtime connection model
- resource explorers
- inspects
- logs
- metrics-derived views
- degraded resources
- commands and controls
- local development role
- production/security guidance if exposed

Lighthouse should be introduced after metrics and inspects are explained.

## API Index and OpenAPI

API Index is a framework tooling surface.

Docs should cover:

- route discovery
- handler analysis
- emitted artifacts
- diagnostics
- limitations
- relationship to OpenAPI
- build and CI usage
- Lighthouse API exploration when relevant

Be explicit about current AST-based limits. Do not overpromise full type inference if the implementation does not provide it.

Recommended public docs:

- `reference/api-index.md`
- `applications/openapi.md`

## Extensions

Extensions are proposed/future architecture until implemented.

Docs should not present extension behavior as current user-facing behavior until it exists.

When implemented, docs should cover:

- extension contract package
- manifest
- resource requirements
- generated app wiring
- provider sets
- routes, commands, queue handlers, scheduler entries, lifecycle hooks, and event subscribers
- app-owned policy hooks
- no service locator
- no hidden runtime loading

Recommended internal artifact:

- keep extension design guidance separate from current public docs until shipped

## `forj dev`

`forj dev` is developer workflow tooling.

Docs should cover:

- `dev.apps` as the App-aware build, SPA, and runtime lifecycle graph
- `dev.watches` as independent custom commands
- explicit generated commands, matchers, roots, and exclusions
- App participation and CLI-only omission behavior
- successful SPA build to App build to runtime replacement ordering
- native list matchers and legacy scalar watcher compatibility
- transcript-first output
- hotkeys and footer
- rebuild/restart semantics
- env reload behavior
- difference from `forj run`
- common failure modes

Do not document it as a full-screen TUI abstraction if the product intentionally remains transcript-first.

Do not flatten `dev.apps` into generic watcher terminology. It owns process lifecycle and dependency edges in addition to filesystem subscriptions.

## Documentation Requirement

Every product surface doc should answer:

- what capability it provides
- which generated files it owns
- which primitives it composes
- which commands operate it
- which lifecycle or runtime boundary it touches
- how it is configured
- how it is observed
- how it is tested
- what is intentionally not part of the surface
